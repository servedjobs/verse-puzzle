-- PrayerChair 2-player games. Lives in the shared DriveSwipe project, fully separate:
-- every object is prefixed pc_, tables have RLS on with NO policies (no direct access),
-- and the app talks only through the pc_ functions below using a per-device secret.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.pc_players(
  id uuid primary key default gen_random_uuid(),
  secret_hash text not null,
  name text not null check (char_length(name) between 1 and 30),
  code text unique not null,
  created_at timestamptz not null default now(),
  seen_at timestamptz not null default now()
);
create table if not exists public.pc_friends(
  a uuid not null references public.pc_players(id) on delete cascade,
  b uuid not null references public.pc_players(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (a,b)
);
create table if not exists public.pc_games(
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  p1 uuid not null references public.pc_players(id) on delete cascade,
  p2 uuid not null references public.pc_players(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  turn uuid,
  status text not null default 'active',
  winner uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pc_games_p1 on public.pc_games(p1, updated_at desc);
create index if not exists pc_games_p2 on public.pc_games(p2, updated_at desc);
alter table public.pc_players enable row level security;
alter table public.pc_friends enable row level security;
alter table public.pc_games enable row level security;
revoke all on public.pc_players, public.pc_friends, public.pc_games from anon, authenticated;

create or replace function public.pc_ok(p uuid, s text) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists(select 1 from public.pc_players where id = p and secret_hash = encode(extensions.digest(s,'sha256'),'hex'));
$$;

create or replace function public.pc_register(p_name text, p_secret text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare c text; r public.pc_players;
begin
  if char_length(coalesce(p_secret,'')) < 24 then raise exception 'bad secret'; end if;
  loop
    c := upper(substr(translate(encode(extensions.gen_random_bytes(8),'base64'),'+/=0O1IL',''),1,6));
    exit when char_length(c)=6 and not exists(select 1 from public.pc_players where code=c);
  end loop;
  insert into public.pc_players(secret_hash,name,code) values (encode(extensions.digest(p_secret,'sha256'),'hex'), left(trim(p_name),30), c) returning * into r;
  return json_build_object('id',r.id,'code',r.code,'name',r.name);
end $$;

create or replace function public.pc_rename(p uuid, s text, p_name text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  update public.pc_players set name = left(trim(p_name),30), seen_at = now() where id = p;
end $$;

create or replace function public.pc_add_friend(p uuid, s text, p_code text) returns json
language plpgsql security definer set search_path = public as $$
declare f public.pc_players;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  select * into f from public.pc_players where code = upper(trim(p_code));
  if f.id is null or f.id = p then raise exception 'not found'; end if;
  insert into public.pc_friends(a,b) values (p,f.id),(f.id,p) on conflict do nothing;
  return json_build_object('id',f.id,'name',f.name);
end $$;

create or replace function public.pc_friends(p uuid, s text) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  update public.pc_players set seen_at = now() where id = p;
  return coalesce((select json_agg(json_build_object('id',x.id,'name',x.name,'seen',x.seen_at) order by x.name)
    from public.pc_friends fr join public.pc_players x on x.id = fr.b where fr.a = p), '[]'::json);
end $$;

create or replace function public.pc_new_game(p uuid, s text, p_friend uuid, p_kind text, p_state jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare g public.pc_games;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  if not exists(select 1 from public.pc_friends where a=p and b=p_friend) then raise exception 'not friends'; end if;
  insert into public.pc_games(kind,p1,p2,state,turn) values (left(p_kind,20),p,p_friend,coalesce(p_state,'{}'::jsonb),p) returning * into g;
  return row_to_json(g);
end $$;

create or replace function public.pc_games(p uuid, s text) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  return coalesce((select json_agg(row_to_json(t) order by t.updated_at desc) from (
    select g.*, a.name as p1_name, b.name as p2_name from public.pc_games g
    join public.pc_players a on a.id=g.p1 join public.pc_players b on b.id=g.p2
    where g.p1=p or g.p2=p order by g.updated_at desc limit 40) t), '[]'::json);
end $$;

create or replace function public.pc_move(p uuid, s text, p_game uuid, p_state jsonb, p_turn uuid, p_status text, p_winner uuid) returns json
language plpgsql security definer set search_path = public as $$
declare g public.pc_games;
begin
  if not public.pc_ok(p,s) then raise exception 'denied'; end if;
  update public.pc_games set state = coalesce(p_state,state), turn = p_turn, status = coalesce(p_status,status),
    winner = p_winner, updated_at = now()
    where id = p_game and (p1 = p or p2 = p) returning * into g;
  if g.id is null then raise exception 'not found'; end if;
  return row_to_json(g);
end $$;

revoke all on function public.pc_ok(uuid,text) from public, anon, authenticated;
grant execute on function public.pc_register(text,text), public.pc_rename(uuid,text,text), public.pc_add_friend(uuid,text,text),
  public.pc_friends(uuid,text), public.pc_new_game(uuid,text,uuid,text,jsonb), public.pc_games(uuid,text),
  public.pc_move(uuid,text,uuid,jsonb,uuid,text,uuid) to anon, authenticated;
