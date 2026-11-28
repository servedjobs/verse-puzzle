/* ---- Prayer community (requests, "I prayed", private notes, groups) ---- */
const COM = {on: false, view: "wall", grp: null, items: [], groups: [], unread: 0, loaded: false, err: "", threads: null, th: null, anon: false, draft: "", ndraft: "", tm: 0, last: 0};
const COM_RULES = ["Be kind. This is a place to pray for each other.", "No selling, no links, and no phone numbers or addresses.", "Do not share private details about other people.", "Report anything that is not right. Reported posts are hidden and reviewed.", "You must be 13 or older to post.", "This is not for emergencies. If someone is in danger, call 911. To talk to someone right now in the U.S., call or text 988."];
function comAgo(iso){ const m = Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000);
  if(m < 2) return "just now"; if(m < 60) return Math.floor(m) + " min ago"; if(m < 1440){ const h = Math.floor(m / 60); return h + (h === 1 ? " hour ago" : " hours ago"); }
  const d = Math.floor(m / 1440); return d + (d === 1 ? " day ago" : " days ago"); }
const comErr = e => toast(((e && e.message) || "Something went wrong.").replace(/^denied$/, "Please try again.").replace(/^not found$/, "That is no longer here."), "x");
async function comLoad(quiet){
  if(!MP_ON){ COM.err = "off"; COM.loaded = true; return; }
  try{ await mpMe();
    if(S.name && S.mp.name !== S.name){ await rpc("pc_rename", {...mpArgs(), p_name: S.name.slice(0, 30)}).catch(() => {}); S.mp.name = S.name; save(); }
    const r = await rpc("pc_c_feed", {...mpArgs(), p_group: COM.grp});
    COM.items = r.items || []; COM.groups = r.groups || []; COM.unread = r.unread || 0; COM.err = ""; COM.loaded = true; COM.last = Date.now();
  }catch(e){ if(/not in that group/i.test((e && e.message) || "")){ COM.grp = null; return comLoad(quiet); }
    if(!quiet || !COM.loaded) COM.err = "Can’t reach the community right now. Check your internet."; COM.loaded = true; }
}
function comTyping(){ const a = document.activeElement; return !!(a && /TEXTAREA|INPUT/.test(a.tagName) && view.contains(a)); }
function comStart(){ clearInterval(COM.tm); COM.tm = setInterval(async () => {
    if(tab !== "pray" || !COM.on){ clearInterval(COM.tm); COM.tm = 0; return; }
    if(document.hidden || comTyping() || document.querySelector(".sheet")) return;
    if(COM.view === "thread" && COM.th){ try{ COM.th = await rpc("pc_c_thread", {...mpArgs(), p_thread: COM.th.id}); }catch(e){ return; } if(!comTyping()) renderCom(true); return; }
    if(COM.view === "wall"){ await comLoad(true); if(!comTyping() && COM.on && COM.view === "wall") renderCom(true); }
  }, 40000); }
function comOpen(){ COM.on = true; COM.view = "wall"; COM.loaded = false; renderCom(); if(S.comOk) comLoad().then(() => { if(COM.on) renderCom(true); }); comStart(); }
function comBadge(){ if(!MP_ON || !S.comOk || !S.mp || Date.now() - COM.last < 120000) return; COM.last = Date.now();
  rpc("pc_c_feed", {...mpArgs(), p_group: null}).then(r => { const u = r.unread || 0; if(u !== COM.unread){ COM.unread = u; if(tab === "pray" && !COM.on && !PR && !prAdvOn) renderPray(); } }).catch(() => {}); }
function comCardHTML(){ return `<button class="card pr-opt adv-card" id="prCom"><div class="logo-tile" style="width:44px;height:44px;border-radius:12px">${ic("heart")}</div><div style="flex:1;min-width:0"><span class="label">Community</span><h3>Prayer community</h3><p class="muted small" style="margin:2px 0 0">Ask for prayer. Pray for someone else.</p></div>${COM.unread ? `<span class="com-dot" aria-label="${COM.unread} new notes">${COM.unread}</span>` : ""}</button>`; }
function comItemHTML(r){
  return `<article class="card com-item ${r.answered ? "ans" : ""}" data-id="${r.id}">
    <div class="com-head"><b>${esc(r.mine ? "You" : r.name)}</b><span class="muted small">${comAgo(r.at)}</span>${r.answered ? `<span class="pill">Answered</span>` : ""}${r.mine ? "" : `<button class="com-more" data-more="${r.id}" aria-label="Report or block">•••</button>`}</div>
    <p class="com-body">${esc(r.body)}</p>
    <div class="com-acts">${r.mine
      ? `<span class="com-count">${ic("hands", "sm")}${r.prayed} prayed</span><button class="btn quiet sm" data-ans="${r.id}">${r.answered ? "Not answered yet" : "Mark answered"}</button><button class="btn quiet sm" data-del="${r.id}">Delete</button>`
      : `<button class="btn ${r.i_prayed ? "quiet" : "primary"} sm" data-pray="${r.id}" ${r.i_prayed ? "disabled" : ""}>${ic("hands", "sm")}${r.i_prayed ? "You prayed · " + r.prayed : "I prayed" + (r.prayed ? " · " + r.prayed : "")}</button><button class="btn quiet sm" data-note="${r.id}">Send a note</button>`}</div></article>`;
}
function renderCom(keep){
  bar(); const y = view.scrollTop;
  const back = `<button class="btn quiet" id="comBack" style="justify-self:start;align-self:flex-start;width:auto;padding-left:14px;padding-right:14px">‹ ${COM.view === "wall" ? "Pray" : COM.view === "thread" ? "Notes" : "Community"}</button>`;
  if(COM.err === "off"){ view.innerHTML = `<div class="stack">${back}<div class="hello"><h1>Prayer community</h1><p>The community works in the PrayerChair app from the App Store or Google Play.</p></div></div>`; $("#comBack").onclick = comClose; return; }
  if(!S.comOk){
    view.innerHTML = `<div class="stack">${back}<div class="hello"><h1>Prayer community</h1><p>Ask for prayer. Pray for someone else. A few rules first.</p></div>
      <section class="card stack"><ul class="com-rules">${COM_RULES.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <button class="btn primary block" id="comAgree">I agree</button></section></div>`;
    $("#comBack").onclick = comClose;
    $("#comAgree").onclick = () => { S.comOk = Date.now(); save(); comOpen(); }; return; }
  if(COM.view === "notes") return renderComNotes(back, keep, y);
  if(COM.view === "thread") return renderComThread(back, keep, y);
  const g = COM.groups.find(x => x.id === COM.grp);
  view.innerHTML = `<div class="stack">${back}
    <div class="hello com-top"><div><h1>Prayer community</h1><p>Ask for prayer. Pray for someone else.</p></div><button class="btn quiet sm" id="comNotes">Notes${COM.unread ? `<span class="com-dot">${COM.unread}</span>` : ""}</button></div>
    <div class="chips"><button class="chip ${COM.grp ? "" : "on"}" data-grp="">Everyone</button>${COM.groups.map(x => `<button class="chip ${x.id === COM.grp ? "on" : ""}" data-grp="${x.id}">${esc(x.name)}</button>`).join("")}<button class="chip" id="comGrpAdd">+ Group</button></div>
    ${g ? `<p class="muted small com-ginfo">Only people in this group see these. Code <b>${esc(g.code)}</b> · ${g.members} ${g.members === 1 ? "person" : "people"} · <button class="lnk" id="comShare">Invite</button> · <button class="lnk" id="comLeave">Leave</button></p>` : ""}
    <section class="card stack com-new">
      ${S.name ? "" : `<input class="input" id="comName" maxlength="30" placeholder="Your first name" autocomplete="given-name">`}
      <textarea class="input com-ta" id="comText" maxlength="400" rows="3" placeholder="${g ? "What can the group pray for?" : "What can we pray for?"}">${esc(COM.draft)}</textarea>
      <div class="com-row"><label class="com-chk"><input type="checkbox" id="comAnon" ${COM.anon ? "checked" : ""}> Don’t show my name</label><button class="btn primary sm" id="comPost">Ask for prayer</button></div></section>
    ${!COM.loaded ? `<p class="muted" style="text-align:center">Loading…</p>` : COM.err ? `<section class="card"><p class="prose" style="margin:0">${esc(COM.err)}</p><button class="btn quiet sm" id="comRetry" style="margin-top:10px">Try again</button></section>`
      : COM.items.length ? COM.items.map(comItemHTML).join("") : `<div class="empty">${ic("hands")}<b>No requests yet</b><span>${g ? "Be the first in this group to ask for prayer." : "Be the first to ask for prayer."}</span></div>`}
    <p class="muted small" style="text-align:center;margin:0"><button class="lnk" id="comRules">Community rules</button></p></div>`;
  if(keep) view.scrollTop = y; else view.scrollTop = 0;
  $("#comBack").onclick = comClose;
  $("#comNotes").onclick = () => { COM.view = "notes"; COM.threads = null; renderCom(); rpc("pc_c_threads", mpArgs()).then(t => { COM.threads = t || []; if(COM.on && COM.view === "notes") renderCom(true); }).catch(e => { COM.threads = []; comErr(e); renderCom(true); }); };
  view.querySelectorAll("[data-grp]").forEach(b => b.onclick = () => { COM.grp = b.dataset.grp || null; COM.loaded = false; COM.items = []; renderCom(); comLoad().then(() => COM.on && renderCom()); });
  $("#comGrpAdd").onclick = comGroupSheet;
  const tx = $("#comText"); tx.oninput = () => { COM.draft = tx.value; };
  $("#comAnon").onchange = e => { COM.anon = e.target.checked; };
  const nm = $("#comName"); if(nm) nm.oninput = () => { S.name = nm.value.trim().slice(0, 30); save(); };
  $("#comPost").onclick = async e => { const body = tx.value.trim();
    if(!body){ tx.focus(); return; }
    if(!S.name && !COM.anon){ toast("Add your first name, or tick “Don’t show my name”.", "x"); if(nm) nm.focus(); return; }
    e.target.disabled = true;
    try{ await mpMe(); await rpc("pc_c_post", {...mpArgs(), p_body: body, p_group: COM.grp, p_anon: COM.anon}); COM.draft = ""; toast("Your request is posted"); await comLoad(); renderCom(); }
    catch(err){ comErr(err); e.target.disabled = false; } };
  const rt = $("#comRetry"); if(rt) rt.onclick = () => { COM.loaded = false; COM.err = ""; renderCom(); comLoad().then(() => renderCom()); };
  $("#comRules").onclick = () => sheet("Community rules", `<ul class="com-rules">${COM_RULES.map(x => `<li>${esc(x)}</li>`).join("")}</ul><p class="muted small">To report a problem, tap ••• on a request, or write to prayerchairapp@gmail.com.</p>`);
  if(g){ $("#comShare").onclick = () => shareText(`Join my prayer group “${g.name}” on PrayerChair. Open the app, go to Pray, then Prayer community, tap + Group and enter this code: ${g.code}\n\nprayerchair.app`);
    $("#comLeave").onclick = () => sheet("Leave this group?", `<p class="prose">You will stop seeing requests from “${esc(g.name)}”. You can join again with the code.</p><div class="row-btns"><button class="btn primary" id="lvYes" style="flex:1">Leave</button><button class="btn quiet" data-no style="flex:1">Stay</button></div>`, (sh, close) => {
      sh.querySelector("[data-no]").onclick = close;
      $("#lvYes", sh).onclick = async () => { try{ await rpc("pc_c_group_leave", {...mpArgs(), p_group: g.id}); close(); COM.grp = null; await comLoad(); renderCom(); toast("You left the group"); }catch(err){ comErr(err); } }; }); }
  const find = id => COM.items.find(x => x.id === id);
  view.querySelectorAll("[data-pray]").forEach(b => b.onclick = async () => { const r = find(b.dataset.pray); if(!r || r.i_prayed) return;
    r.i_prayed = true; r.prayed++; renderCom(true);
    try{ const o = await rpc("pc_c_pray", {...mpArgs(), p_prayer: r.id}); r.prayed = o.prayed; renderCom(true); }catch(err){ r.i_prayed = false; r.prayed--; renderCom(true); comErr(err); } });
  view.querySelectorAll("[data-note]").forEach(b => b.onclick = () => comNoteSheet(find(b.dataset.note)));
  view.querySelectorAll("[data-ans]").forEach(b => b.onclick = async () => { const r = find(b.dataset.ans); if(!r) return;
    try{ await rpc("pc_c_answered", {...mpArgs(), p_prayer: r.id, p_on: !r.answered}); r.answered = !r.answered; renderCom(true); if(r.answered) toast("Thanks be to God"); }catch(err){ comErr(err); } });
  view.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { const r = find(b.dataset.del); if(!r) return;
    sheet("Delete this request?", `<p class="prose">${esc(r.body)}</p><div class="row-btns"><button class="btn primary" id="dlYes" style="flex:1">Delete</button><button class="btn quiet" data-no style="flex:1">Keep</button></div>`, (sh, close) => {
      sh.querySelector("[data-no]").onclick = close;
      $("#dlYes", sh).onclick = async () => { try{ await rpc("pc_c_delete", {...mpArgs(), p_prayer: r.id}); close(); COM.items = COM.items.filter(x => x.id !== r.id); renderCom(true); toast("Deleted"); }catch(err){ comErr(err); } }; }); });
  view.querySelectorAll("[data-more]").forEach(b => b.onclick = () => { const r = find(b.dataset.more); if(r) comMoreSheet({prayer: r.id, who: r.name}); });
}
function comClose(){ if(COM.view === "thread"){ COM.view = "notes"; COM.th = null; COM.threads = null; renderCom(); rpc("pc_c_threads", mpArgs()).then(t => { COM.threads = t || []; if(COM.on && COM.view === "notes") renderCom(true); }).catch(() => { COM.threads = []; renderCom(true); }); return; }
  if(COM.view === "notes"){ COM.view = "wall"; renderCom(); comLoad(true).then(() => { if(COM.on && COM.view === "wall") renderCom(true); }); return; }
  COM.on = false; clearInterval(COM.tm); COM.tm = 0; renderPray(); }
function comMoreSheet(o){
  sheet("Report or block", `<p class="prose" style="margin-top:0">Reporting hides this from you right away and sends it for review. Blocking hides everything from this person, and hides you from them.</p>
    <div class="stack"><button class="btn quiet block" id="cmRep">Report this ${o.note ? "note" : "request"}</button><button class="btn quiet block" id="cmBlk">Block this person</button></div>`, (sh, close) => {
    $("#cmRep", sh).onclick = async () => { try{ await rpc("pc_c_report", {...mpArgs(), p_prayer: o.note ? null : (o.prayer || null), p_note: o.note || null, p_reason: ""}); close(); toast("Reported. Thank you.");
        if(o.note && COM.th){ COM.th.notes = COM.th.notes.filter(n => n.id !== o.note); } else COM.items = COM.items.filter(x => x.id !== o.prayer); renderCom(true); }catch(err){ comErr(err); } };
    $("#cmBlk", sh).onclick = async () => { try{ await rpc("pc_c_block", {...mpArgs(), p_prayer: o.thread ? null : o.prayer, p_thread: o.thread || null}); close(); toast("Blocked");
        if(o.thread){ COM.view = "notes"; COM.th = null; COM.threads = (COM.threads || []).filter(t => t.id !== o.thread); renderCom(); } else { await comLoad(true); renderCom(true); } }catch(err){ comErr(err); } }; });
}
function comNoteSheet(r){ if(!r) return;
  sheet("Send a note", `<p class="muted small" style="margin-top:0">Only ${esc(r.name === "Someone" ? "the person who asked" : r.name)} will see this.</p><p class="com-quote">${esc(r.body)}</p>
    <textarea class="input com-ta" id="cnText" maxlength="400" rows="3" placeholder="I’m praying for you."></textarea><button class="btn primary block" id="cnSend" style="margin-top:10px">Send</button>`, (sh, close) => {
    const tx = $("#cnText", sh); setTimeout(() => tx.focus(), 60);
    $("#cnSend", sh).onclick = async e => { const b = tx.value.trim(); if(!b){ tx.focus(); return; } e.target.disabled = true;
      try{ await rpc("pc_c_note", {...mpArgs(), p_prayer: r.id, p_thread: null, p_body: b}); close(); toast("Note sent"); }catch(err){ comErr(err); e.target.disabled = false; } }; });
}
function comGroupSheet(){
  sheet("Prayer groups", `<p class="prose" style="margin-top:0">A group is private. Only people with the code can see and pray for its requests. Good for a family, a parish, or a Bible study.</p>
    <div class="field"><label for="cgCode">Join a group</label><div class="com-row"><input class="input" id="cgCode" maxlength="6" placeholder="6-letter code" autocapitalize="characters" style="flex:1;min-width:0"><button class="btn primary sm" id="cgJoin">Join</button></div></div>
    <div class="field" style="margin-top:14px"><label for="cgName">Start a new group</label><div class="com-row"><input class="input" id="cgName" maxlength="40" placeholder="Group name" style="flex:1;min-width:0"><button class="btn primary sm" id="cgNew">Start</button></div></div>`, (sh, close) => {
    const go = async (fn, args, msg) => { try{ await mpMe(); const g = await rpc(fn, {...mpArgs(), ...args}); close(); COM.grp = g.id; COM.loaded = false; renderCom(); await comLoad(); renderCom(); toast(msg(g)); }catch(err){ comErr(err); } };
    $("#cgJoin", sh).onclick = () => { const c = $("#cgCode", sh).value.trim(); if(c.length < 6){ $("#cgCode", sh).focus(); return; } go("pc_c_group_join", {p_code: c}, g => "You joined " + g.name); };
    $("#cgNew", sh).onclick = () => { const n = $("#cgName", sh).value.trim(); if(!n){ $("#cgName", sh).focus(); return; } go("pc_c_group_new", {p_name: n}, g => "Group started. The code is " + g.code); }; });
}
function renderComNotes(back, keep, y){
  const t = COM.threads;
  view.innerHTML = `<div class="stack">${back}<div class="hello"><h1>Notes</h1><p>Private notes between you and one other person.</p></div>
    ${t == null ? `<p class="muted" style="text-align:center">Loading…</p>` : t.length ? t.map(x => `<button class="card com-thr" data-th="${x.id}"><div class="com-head"><b>${esc(x.name)}</b><span class="muted small">${comAgo(x.at)}</span>${x.unread ? `<span class="com-dot">${x.unread}</span>` : ""}</div>
      <p class="muted small" style="margin:0">${x.asked ? "About your request: " : "About their request: "}${esc(x.about)}</p><p class="com-body" style="margin:6px 0 0">${esc(x.last || "")}</p></button>`).join("")
      : `<div class="empty">${ic("heart")}<b>No notes yet</b><span>Tap “Send a note” on a request to tell someone you are praying for them.</span></div>`}</div>`;
  view.scrollTop = keep ? y : 0;
  $("#comBack").onclick = comClose;
  view.querySelectorAll("[data-th]").forEach(b => b.onclick = async () => { try{ COM.th = await rpc("pc_c_thread", {...mpArgs(), p_thread: b.dataset.th}); COM.view = "thread"; COM.ndraft = ""; renderCom(); }catch(err){ comErr(err); } });
}
function renderComThread(back, keep, y){
  const h = COM.th;
  view.innerHTML = `<div class="stack">${back}
    <div class="hello com-top"><div><h1>${esc(h.name)}</h1><p>${h.asked ? "About your request" : "About their request"}</p></div><button class="btn quiet sm" id="ctBlock">Block</button></div>
    <p class="com-quote">${esc(h.about)}</p>
    <div class="com-msgs">${h.notes.map(n => `<div class="com-msg ${n.mine ? "me" : ""}"><p>${esc(n.body)}</p><span class="muted">${comAgo(n.at)}${n.mine ? "" : ` · <button class="lnk" data-rep="${n.id}">Report</button>`}</span></div>`).join("")}</div>
    ${h.blocked ? `<p class="muted small" style="text-align:center">You can’t send notes here.</p>` : `<section class="card stack com-new"><textarea class="input com-ta" id="ctText" maxlength="400" rows="2" placeholder="Write a note">${esc(COM.ndraft)}</textarea><button class="btn primary sm" id="ctSend" style="justify-self:end">Send</button></section>`}</div>`;
  view.scrollTop = keep ? y : view.scrollHeight;
  $("#comBack").onclick = comClose;
  $("#ctBlock").onclick = () => comMoreSheet({thread: h.id, prayer: null, who: h.name});
  view.querySelectorAll("[data-rep]").forEach(b => b.onclick = () => comMoreSheet({note: b.dataset.rep, thread: h.id}));
  const tx = $("#ctText"); if(!tx) return; tx.oninput = () => { COM.ndraft = tx.value; };
  $("#ctSend").onclick = async e => { const b = tx.value.trim(); if(!b){ tx.focus(); return; } e.target.disabled = true;
    try{ await rpc("pc_c_note", {...mpArgs(), p_prayer: null, p_thread: h.id, p_body: b}); COM.ndraft = ""; COM.th = await rpc("pc_c_thread", {...mpArgs(), p_thread: h.id}); renderCom(); }catch(err){ comErr(err); e.target.disabled = false; } };
}
