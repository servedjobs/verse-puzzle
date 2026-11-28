-- PrayerChair prayer community. Same rules as pc_multiplayer.sql: every object is prefixed pc_,
-- tables have RLS on with NO policies (no direct access), and the app talks only through the
-- pc_c_ functions below using the per-device secret (pc_ok). Author ids never leave the database.
-- Run after pc_multiplayer.sql. Safe to run more than once.

create table if not exists public.pc_groups(
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  code text unique not null,
  owner uuid not null references public.pc_players(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.pc_group_members(
  g uuid not null references public.pc_groups(id) on delete cascade,
  p uuid not null references public.pc_players(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (g,p)
);
create table if not exists public.pc_prayers(
  id uuid primary key default gen_random_uuid(),
  author uuid not null references public.pc_players(id) on delete cascade,
  grp uuid references public.pc_groups(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 400),
  anon boolean not null default false,
  answered boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists pc_prayers_feed on public.pc_prayers(grp, created_at desc);
create index if not exists pc_prayers_author on public.pc_prayers(author, created_at desc);
create table if not exists public.pc_prayed(
  prayer uuid not null references public.pc_prayers(id) on delete cascade,
  p uuid not null references public.pc_players(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (prayer,p)
);
-- A private thread between the person who asked (a) and one other person (b), tied to one request.
create table if not exists public.pc_threads(
  id uuid primary key default gen_random_uuid(),
  prayer uuid not null references public.pc_prayers(id) on delete cascade,
  a uuid not null references public.pc_players(id) on delete cascade,
  b uuid not null references public.pc_players(id) on delete cascade,
  a_read timestamptz not null default 'epoch',
  b_read timestamptz not null default 'epoch',
  updated_at timestamptz not null default now(),
  unique (prayer,b)
);
create index if not exists pc_threads_a on public.pc_threads(a, updated_at desc);
create index if not exists pc_threads_b on public.pc_threads(b, updated_at desc);
create table if not exists public.pc_notes(
  id uuid primary key default gen_random_uuid(),
  thread uuid not null references public.pc_threads(id) on delete cascade,
  sender uuid not null references public.pc_players(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 400),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists pc_notes_thread on public.pc_notes(thread, created_at);
create index if not exists pc_notes_sender on public.pc_notes(sender, created_at desc);
create table if not exists public.pc_blocks(
  a uuid not null references public.pc_players(id) on delete cascade,
  b uuid not null references public.pc_players(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (a,b)
);
create table if not exists public.pc_reports(
  id uuid primary key default gen_random_uuid(),
  reporter uuid not null references public.pc_players(id) on delete cascade,
  prayer uuid references public.pc_prayers(id) on delete cascade,
  note uuid references public.pc_notes(id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now(),
  check (prayer is not null or note is not null)
);
create unique index if not exists pc_reports_one_prayer on public.pc_reports(reporter, prayer) where prayer is not null;
create unique index if not exists pc_reports_one_note on public.pc_reports(reporter, note) where note is not null;

alter table public.pc_groups enable row level security;
alter table public.pc_group_members enable row level security;
alter table public.pc_prayers enable row level security;
alter table public.pc_prayed enable row level security;
alter table public.pc_threads enable row level security;
alter table public.pc_notes enable row level security;
alter table public.pc_blocks enable row level security;
alter table public.pc_reports enable row level security;
revoke all on public.pc_groups, public.pc_group_members, public.pc_prayers, public.pc_prayed,
  public.pc_threads, public.pc_notes, public.pc_blocks, public.pc_reports from anon, authenticated;

-- Text check for anything a person posts: trims it, and refuses links, contact details and crude words.
create or replace function public.pc_c_clean(t text, maxlen int) returns text
language plpgsql immutable set search_path = public as $$
#variable_conflict use_variable
declare txt text := btrim(regexp_replace(coalesce(t,''), '[[:space:]]+', ' ', 'g')); l text;
begin
  if char_length(txt) < 1 then raise exception 'Write something first.'; end if;
  if char_length(txt) > maxlen then raise exception 'That is too long. Keep it under % letters.', maxlen; end if;
  l := lower(txt);
  if l ~ '(https?://|www\.|\.com\M|\.net\M|\.org\M|\.io\M|\.ly\M|@[a-z0-9_]{2,}|[a-z0-9._-]+@[a-z0-9-]+\.)' then
    raise exception 'Links, emails and usernames are not allowed here.'; end if;
  if regexp_replace(l, '[^0-9]', '', 'g') ~ '[0-9]{7,}' then
    raise exception 'Phone numbers are not allowed here.'; end if;
  if l ~ '\m(fuck\w*|shit\w*|bitch\w*|asshole\w*|bastard\w*|cunt\w*|dick|dicks|pussy|slut\w*|whore\w*|nigg\w*|fag|fags|faggot\w*|retard\w*|porn\w*|nude\w*|nudes|sexy|onlyfans|cashapp|venmo|paypal|zelle|bitcoin|crypto)\M' then
    raise exception 'Please keep it kind and clean. Some words are not allowed here.'; end if;
  return txt;
end $$;

create or replace function public.pc_c_blocked(x uuid, y uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.pc_blocks where (a = x and b = y) or (a = y and b = x));
$$;

-- Groups ---------------------------------------------------------------------------------------
create or replace function public.pc_c_group_new(p uuid, s text, p_name text) returns json
language plpgsql security definer set search_path = public, extensions as $$
#variable_conflict use_variable
declare c text; g public.pc_groups; n text;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  n := public.pc_c_clean(p_name, 40);
  if (select count(*) from public.pc_groups where owner = p) >= 5 then raise exception 'You can start up to 5 groups.'; end if;
  loop
    c := upper(substr(translate(encode(extensions.gen_random_bytes(8),'base64'),'+/=0O1IL',''),1,6));
    exit when char_length(c)=6 and not exists(select 1 from public.pc_groups where code=c);
  end loop;
  insert into public.pc_groups(name,code,owner) values (n,c,p) returning * into g;
  insert into public.pc_group_members(g,p) values (g.id,p);
  return json_build_object('id',g.id,'name',g.name,'code',g.code,'members',1,'mine',true);
end $$;

create or replace function public.pc_c_group_join(p uuid, s text, p_code text) returns json
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare g public.pc_groups;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  select * into g from public.pc_groups where code = upper(btrim(coalesce(p_code,'')));
  if g.id is null then raise exception 'No group has that code. Check it and try again.'; end if;
  if (select count(*) from public.pc_group_members where pc_group_members.p = pc_c_group_join.p) >= 20 then raise exception 'You can be in up to 20 groups.'; end if;
  insert into public.pc_group_members(g,p) values (g.id,p) on conflict do nothing;
  return json_build_object('id',g.id,'name',g.name,'code',g.code,
    'members',(select count(*) from public.pc_group_members m where m.g = g.id),'mine',g.owner = p);
end $$;

create or replace function public.pc_c_group_leave(p uuid, s text, p_group uuid) returns void
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  delete from public.pc_group_members m where m.g = p_group and m.p = pc_c_group_leave.p;
  -- a group with nobody left is removed, along with its requests
  delete from public.pc_groups g where g.id = p_group and not exists(select 1 from public.pc_group_members m where m.g = g.id);
end $$;

-- Feed ------------------------------------------------------------------------------------------
-- p_group null = the open wall everyone sees. Returns the requests, my groups, and my unread notes.
create or replace function public.pc_c_feed(p uuid, s text, p_group uuid) returns json
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare items json; groups json; unread int;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  update public.pc_players set seen_at = now() where id = p;
  if p_group is not null and not exists(select 1 from public.pc_group_members m where m.g = p_group and m.p = pc_c_feed.p) then
    raise exception 'You are not in that group.'; end if;
  select coalesce(json_agg(row_to_json(t)), '[]'::json) into items from (
    select r.id, r.body, r.answered, r.created_at as at,
      case when r.anon then 'Someone' else pl.name end as name,
      (r.author = p) as mine,
      (select count(*) from public.pc_prayed y where y.prayer = r.id) as prayed,
      exists(select 1 from public.pc_prayed y where y.prayer = r.id and y.p = pc_c_feed.p) as i_prayed
    from public.pc_prayers r join public.pc_players pl on pl.id = r.author
    where r.grp is not distinct from p_group
      and (not r.hidden or r.author = p)
      and r.created_at > now() - interval '30 days'
      and not public.pc_c_blocked(p, r.author)
      and not exists(select 1 from public.pc_reports x where x.prayer = r.id and x.reporter = p)
    order by r.created_at desc limit 80) t;
  select coalesce(json_agg(json_build_object('id',g.id,'name',g.name,'code',g.code,'mine',g.owner = p,
      'members',(select count(*) from public.pc_group_members m2 where m2.g = g.id)) order by g.name), '[]'::json) into groups
    from public.pc_group_members m join public.pc_groups g on g.id = m.g where m.p = pc_c_feed.p;
  select count(*) into unread from public.pc_notes n join public.pc_threads t on t.id = n.thread
    where n.sender <> p and not n.hidden and not public.pc_c_blocked(p, n.sender)
      and ((t.a = p and n.created_at > t.a_read) or (t.b = p and n.created_at > t.b_read));
  return json_build_object('items',items,'groups',groups,'unread',unread);
end $$;

create or replace function public.pc_c_post(p uuid, s text, p_body text, p_group uuid, p_anon boolean) returns json
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare txt text; r public.pc_prayers;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  txt := public.pc_c_clean(p_body, 400);
  if p_group is not null and not exists(select 1 from public.pc_group_members m where m.g = p_group and m.p = pc_c_post.p) then
    raise exception 'You are not in that group.'; end if;
  if (select count(*) from public.pc_prayers where author = p and created_at > now() - interval '1 day') >= 8 then
    raise exception 'You have asked for a lot of prayer today. Come back tomorrow.'; end if;
  insert into public.pc_prayers(author,grp,body,anon) values (p,p_group,txt,coalesce(p_anon,false)) returning * into r;
  return json_build_object('id',r.id);
end $$;

create or replace function public.pc_c_pray(p uuid, s text, p_prayer uuid) returns json
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  if not exists(select 1 from public.pc_prayers r where r.id = p_prayer
      and (r.grp is null or exists(select 1 from public.pc_group_members m where m.g = r.grp and m.p = pc_c_pray.p))) then
    raise exception 'not found'; end if;
  insert into public.pc_prayed(prayer,p) values (p_prayer,p) on conflict do nothing;
  return json_build_object('prayed',(select count(*) from public.pc_prayed y where y.prayer = p_prayer));
end $$;

create or replace function public.pc_c_answered(p uuid, s text, p_prayer uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  update public.pc_prayers set answered = coalesce(p_on,true) where id = p_prayer and author = p;
end $$;

create or replace function public.pc_c_delete(p uuid, s text, p_prayer uuid) returns void
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  delete from public.pc_prayers where id = p_prayer and author = p;
end $$;

-- Report and block ------------------------------------------------------------------------------
-- A report hides the item for the reporter straight away. Two different reporters hide it for everyone.
create or replace function public.pc_c_report(p uuid, s text, p_prayer uuid, p_note uuid, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  if p_prayer is not null then
    if not exists(select 1 from public.pc_prayers where id = p_prayer) then raise exception 'not found'; end if;
    insert into public.pc_reports(reporter,prayer,reason) values (p,p_prayer,left(coalesce(p_reason,''),200)) on conflict do nothing;
    if (select count(distinct reporter) from public.pc_reports where prayer = p_prayer) >= 2 then
      update public.pc_prayers set hidden = true where id = p_prayer; end if;
  elsif p_note is not null then
    if not exists(select 1 from public.pc_notes n join public.pc_threads t on t.id = n.thread
        where n.id = p_note and (t.a = p or t.b = p) and n.sender <> p) then raise exception 'not found'; end if;
    insert into public.pc_reports(reporter,note,reason) values (p,p_note,left(coalesce(p_reason,''),200)) on conflict do nothing;
    update public.pc_notes set hidden = true where id = p_note;
  else raise exception 'nothing to report'; end if;
end $$;

-- Block the person behind a request or a thread, without ever telling the app who they are.
create or replace function public.pc_c_block(p uuid, s text, p_prayer uuid, p_thread uuid) returns void
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare who uuid;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  if p_prayer is not null then select author into who from public.pc_prayers where id = p_prayer;
  elsif p_thread is not null then
    select case when t.a = p then t.b else t.a end into who from public.pc_threads t where t.id = p_thread and (t.a = p or t.b = p);
  end if;
  if who is null or who = p then raise exception 'not found'; end if;
  insert into public.pc_blocks(a,b) values (p,who) on conflict do nothing;
end $$;

-- Private notes ----------------------------------------------------------------------------------
-- p_thread null: start (or continue) my thread with the person who asked for p_prayer.
create or replace function public.pc_c_note(p uuid, s text, p_prayer uuid, p_thread uuid, p_body text) returns json
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare txt text; t public.pc_threads; r public.pc_prayers; other uuid;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  txt := public.pc_c_clean(p_body, 400);
  if p_thread is not null then
    select * into t from public.pc_threads where id = p_thread and (a = p or b = p);
    if t.id is null then raise exception 'not found'; end if;
  else
    select * into r from public.pc_prayers where id = p_prayer and not hidden;
    if r.id is null then raise exception 'not found'; end if;
    if r.author = p then raise exception 'This is your own request.'; end if;
    if r.grp is not null and not exists(select 1 from public.pc_group_members m where m.g = r.grp and m.p = pc_c_note.p) then
      raise exception 'not found'; end if;
    insert into public.pc_threads(prayer,a,b) values (r.id,r.author,p) on conflict (prayer,b) do nothing;
    select * into t from public.pc_threads where prayer = r.id and b = p;
  end if;
  other := case when t.a = p then t.b else t.a end;
  if public.pc_c_blocked(p, other) then raise exception 'You can’t send notes to this person.'; end if;
  if (select count(*) from public.pc_notes where sender = p and created_at > now() - interval '1 day') >= 60 then
    raise exception 'You have sent a lot of notes today. Come back tomorrow.'; end if;
  insert into public.pc_notes(thread,sender,body) values (t.id,p,txt);
  update public.pc_threads set updated_at = now(),
    a_read = case when a = p then now() else a_read end,
    b_read = case when b = p then now() else b_read end where id = t.id;
  return json_build_object('thread',t.id);
end $$;

create or replace function public.pc_c_threads(p uuid, s text) returns json
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  return coalesce((select json_agg(row_to_json(x)) from (
    select t.id, left(r.body, 90) as about, (t.a = p) as asked,
      case when t.a = p then ob.name when r.anon then 'Someone' else oa.name end as name,
      (select left(n.body, 90) from public.pc_notes n where n.thread = t.id and not n.hidden order by n.created_at desc limit 1) as last,
      t.updated_at as at,
      (select count(*) from public.pc_notes n where n.thread = t.id and n.sender <> p and not n.hidden
        and n.created_at > case when t.a = p then t.a_read else t.b_read end) as unread
    from public.pc_threads t join public.pc_prayers r on r.id = t.prayer
      join public.pc_players oa on oa.id = t.a join public.pc_players ob on ob.id = t.b
    where (t.a = p or t.b = p) and not public.pc_c_blocked(t.a, t.b)
      and exists(select 1 from public.pc_notes n where n.thread = t.id and not n.hidden)
    order by t.updated_at desc limit 60) x), '[]'::json);
end $$;

create or replace function public.pc_c_thread(p uuid, s text, p_thread uuid) returns json
language plpgsql security definer set search_path = public as $$
#variable_conflict use_variable
declare t public.pc_threads; r public.pc_prayers; nm text; notes json;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  select * into t from public.pc_threads where id = p_thread and (a = p or b = p);
  if t.id is null then raise exception 'not found'; end if;
  select * into r from public.pc_prayers where id = t.prayer;
  select case when t.a = p then (select name from public.pc_players where id = t.b)
              when r.anon then 'Someone' else (select name from public.pc_players where id = t.a) end into nm;
  select coalesce(json_agg(json_build_object('id',n.id,'body',n.body,'mine',n.sender = p,'at',n.created_at) order by n.created_at), '[]'::json)
    into notes from public.pc_notes n where n.thread = t.id and not n.hidden;
  update public.pc_threads set a_read = case when a = p then now() else a_read end,
    b_read = case when b = p then now() else b_read end where id = t.id;
  return json_build_object('id',t.id,'name',nm,'about',r.body,'asked',t.a = p,'notes',notes,
    'blocked',public.pc_c_blocked(t.a, t.b));
end $$;

revoke all on function public.pc_c_blocked(uuid,uuid) from public, anon, authenticated;
grant execute on function public.pc_c_group_new(uuid,text,text), public.pc_c_group_join(uuid,text,text),
  public.pc_c_group_leave(uuid,text,uuid), public.pc_c_feed(uuid,text,uuid), public.pc_c_post(uuid,text,text,uuid,boolean),
  public.pc_c_pray(uuid,text,uuid), public.pc_c_answered(uuid,text,uuid,boolean), public.pc_c_delete(uuid,text,uuid),
  public.pc_c_report(uuid,text,uuid,uuid,text), public.pc_c_block(uuid,text,uuid,uuid),
  public.pc_c_note(uuid,text,uuid,uuid,text), public.pc_c_threads(uuid,text), public.pc_c_thread(uuid,text,uuid)
  to anon, authenticated;
