const CHN = __CHN__;
/* ---- Scroll the Bible: one verse at a time, Genesis to Revelation ---- */
const VS_SC = (() => {
  const pts = SCENES.map(s => ({g: scG(s), id: s.id})).filter(x => x.g != null).sort((a, b) => a.g - b.g);
  return g => { let lo = 0, hi = pts.length - 1, ans = 0; while(lo <= hi){ const m = (lo + hi) >> 1; if(pts[m].g <= g){ ans = m; lo = m + 1; } else hi = m - 1; } return pts[ans].id; };
})();
function vsNote(g){ const r = ALL[g]; const a = CHN[r.book]; return (a && a[r.ch - 1]) || ""; }
function vsVoice(){ // the most natural English voice installed on the phone (Premium/Enhanced/Siri beat the default robot voice)
  try{ const V = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang)); if(!V.length) return null;
    const bad = /compact|fred|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|kathy|ralph/i;
    const score = v => { let n = 0; const nm = v.name + " " + (v.voiceURI || "");
      if(bad.test(nm)) return -9; if(/premium/i.test(nm)) n += 50; if(/enhanced/i.test(nm)) n += 40; if(/siri/i.test(nm)) n += 35; if(/neural|natural|online/i.test(nm)) n += 30;
      if(/en[-_]US/i.test(v.lang)) n += 6; else if(/en[-_](GB|AU|IE|CA)/i.test(v.lang)) n += 3;
      if(/\b(ava|zoe|samantha|allison|nicky|evan|nathan|serena|daniel|karen|moira|tessa|oliver)\b/i.test(nm)) n += 8; if(!v.localService) n += 0; return n; };
    return V.map(v => [score(v), v]).sort((a, b) => b[0] - a[0])[0][1]; }catch(e){ return null; } }
try{ speechSynthesis.getVoices(); speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", () => {}); }catch(e){}
function sevenCardHTML(){
  const g = (S.vs && S.vs.g) || 0;
  return `<button class="scn-card" id="openSeven" aria-label="Scroll the Bible">
    <img src="scenes/${VS_SC(g)}.jpg" alt="" loading="lazy">
    <span class="scn-card-txt"><span class="label">Bible Verses</span><b>Scroll the Bible, one verse at a time</b><span class="sub">${g > 0 ? "Continue at " + esc(trV(g).ref) : "Genesis to Revelation"}</span></span>
    <span class="scn-play">${ic("arrow")}</span></button>`;
}
function bindSeven(){ const b = $("#openSeven"); if(b) b.onclick = () => openVS(); }
const vsCh = (b, c) => b === "Psalms" && trCur() !== "drb" ? hebPs(c) : c;
let VS = null;
function openVS(start){
  if(VS) return;
  S.vs = S.vs || {g: 0};
  const N = ALL.length; let pos = Math.min(N - 1, Math.max(0, start != null ? start : (S.vs.g || 0)));
  const ov = document.createElement("div"); ov.className = "overlay vs"; ov.id = "vscroll";
  const canSpeak = typeof window.speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined";
  ov.innerHTML = `<div class="vs-top"><button class="icon-btn" id="vsX" aria-label="Close">${ic("x")}</button><span style="flex:1" id="vsT"></span></div>
    <div class="vs-bar2"><i id="vsB"></i></div><div class="vs-feed" id="vsF"></div>
    <div class="vs-rail">
      ${canSpeak ? `<button data-a="l" aria-label="Listen"><span>${ic("bell")}</span>Listen</button>` : ""}
      <button data-a="s" aria-label="Save"><span>${ic("bookmark")}</span>Save</button>
      <button data-a="h" aria-label="Share"><span>${ic("share")}</span>Share</button>
      <button data-a="j" aria-label="Jump to a verse"><span>${ic("search")}</span>Jump</button>
    </div><div class="vs-hint">SWIPE UP</div>`;
  app.appendChild(ov);
  const f = $("#vsF", ov); let tmr = null, speaking = false;
  VS = {ov, close: closeVS, goTo};
  const mk = g => { const d = document.createElement("div"); d.className = "vs-slide"; d.dataset.g = g; const tv = trV(g);
    d.innerHTML = `<img src="scenes/${VS_SC(g)}.jpg" alt=""><div class="vs-vig"></div><div class="vs-txt"><span class="ref">${esc(tv.ref)}</span><p class="${tv.t.length > 230 ? "long" : ""}">${esc(tv.t)}</p></div><div class="vs-mean2"><span class="label">What this means</span><p>${esc(vsNote(g) || "Read the whole chapter to see how this verse fits.")}</p></div>`; return d; };
  const build = () => { f.innerHTML = ""; const a = Math.max(0, pos - 1), b = Math.min(N - 1, pos + 1); for(let g = a; g <= b; g++) f.appendChild(mk(g));
    f.style.scrollSnapType = "none"; requestAnimationFrame(() => { f.scrollTop = (pos - a) * f.clientHeight; f.style.scrollSnapType = ""; }); hud(); };
  const sync = () => { const a = Math.max(0, pos - 1), b = Math.min(N - 1, pos + 1), h = f.clientHeight;
    let first = +f.firstChild.dataset.g, last = +f.lastChild.dataset.g;
    f.style.scrollSnapType = "none";
    while(last < b){ last++; f.appendChild(mk(last)); }
    while(first > a){ first--; f.insertBefore(mk(first), f.firstChild); f.scrollTop += h; }
    while(first < a){ f.removeChild(f.firstChild); f.scrollTop -= h; first++; }
    while(last > b){ f.removeChild(f.lastChild); last--; }
    requestAnimationFrame(() => { f.style.scrollSnapType = ""; }); };
  function hud(){ const r = ALL[pos]; $("#vsT", ov).textContent = bookLabel(r.book) + " " + vsCh(r.book, r.ch);
    $("#vsB", ov).style.width = Math.max(1, (pos + 1) / N * 100) + "%";
    const sb = ov.querySelector('[data-a="s"]'); if(sb) sb.classList.toggle("on", saved.has(pos)); }
  function count(){ const k = todayKey(), v = S.vs; if(v.day !== k){ v.day = k; v.seen = []; }
    if(!v.seen.includes(pos) && v.seen.length < 7){ v.seen.push(pos);
      if(v.seen.length === 7 && completeDay()){ const s = liveStreak(); toast(s > 1 ? `Day ${s}. Streak kept.` : "Day one is on the board.", "flame"); } } }
  function settle(){ const h = f.clientHeight; if(!h) return; const idx = Math.round(f.scrollTop / h), el = f.children[idx]; if(!el) return;
    const g = +el.dataset.g; if(g === pos) return; pos = g; stopSpeak(); sync(); S.vs.g = pos; count(); save(); hud(); }
  f.addEventListener("scroll", () => { clearTimeout(tmr); tmr = setTimeout(settle, 120); }, {passive: true});
  function stopSpeak(){ if(speaking){ try{ speechSynthesis.cancel(); }catch(e){} speaking = false; const b = ov.querySelector('[data-a="l"]'); if(b) b.classList.remove("on"); } }
  function goTo(g){ stopSpeak(); pos = g; S.vs.g = pos; save(); build(); }
  function closeVS(){ stopSpeak(); clearTimeout(tmr); S.vs.g = pos; save(); ov.remove(); VS = null; if(tab === "bible" && !sub) render(); }
  $("#vsX", ov).onclick = closeVS;
  ov.querySelector(".vs-rail").onclick = e => { const b = e.target.closest("button"); if(!b) return; const a = b.dataset.a;
    if(a === "m") vsMeaning(pos, closeVS);
    if(a === "s"){ toggleSave(pos); hud(); }
    if(a === "h") shareVerse(pos);
    if(a === "j") vsJump(goTo);
    if(a === "l"){ if(speaking){ stopSpeak(); return; } try{ const u = new SpeechSynthesisUtterance(trV(pos).t); const vv = vsVoice(); if(vv){ u.voice = vv; u.lang = vv.lang; } u.rate = 0.92; u.pitch = 1; u.onend = () => stopSpeak(); speechSynthesis.cancel(); speechSynthesis.speak(u); speaking = true; b.classList.add("on"); }catch(e){} } };
  build(); count(); save();
}
function vsMeaning(g, closeVS){
  const r = ALL[g], note = vsNote(g);
  sheet(`${bookLabel(r.book)} ${vsCh(r.book, r.ch)}`, `<div class="vs-mean"><span class="label">What this means</span>
    <p class="prose">${esc(note || "Read the whole chapter to see how this verse fits.")}</p>
    <button class="btn primary block" id="vmC">Keep scrolling</button>
    <button class="btn quiet block" id="vmR" style="margin-top:8px">${ic("book","sm")}Read the whole chapter</button></div>`, (sh, close) => {
    sh.querySelector("#vmC").onclick = close;
    sh.querySelector("#vmR").onclick = () => { close(); closeVS(); openChapter(r.book, r.ch, g); }; });
}
function vsJump(goTo){
  sheet("Jump to", `<div class="vs-grid">${BOOK_ORDER.map(b => `<button class="btn quiet sm" data-b="${esc(b)}">${esc(bookLabel(b))}</button>`).join("")}</div>`, (sh, close) => {
    sh.querySelectorAll("[data-b]").forEach(b => b.onclick = () => { close(); vsChapters(b.dataset.b, goTo); }); });
}
function vsChapters(book, goTo){
  const nc = BIBLE[book].length;
  sheet(bookLabel(book), `<p class="muted small" style="margin:0 0 8px">Pick a chapter</p><div class="grid-ch">${Array.from({length: nc}, (_, i) => `<button class="num" data-c="${i + 1}">${vsCh(book, i + 1)}</button>`).join("")}</div>`, (sh, close) => {
    sh.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { close(); vsVerses(book, +b.dataset.c, goTo); }); });
}
function vsVerses(book, ch, goTo){
  const nv = BIBLE[book][ch - 1].length;
  sheet(`${bookLabel(book)} ${vsCh(book, ch)}`, `<button class="btn primary block" id="vjA">Start at verse 1</button><p class="muted small" style="margin:8px 0 6px">Or pick a verse</p><div class="grid-ch grid-v">${Array.from({length: nv}, (_, i) => `<button class="num" data-v="${i + 1}">${i + 1}</button>`).join("")}</div>`, (sh, close) => {
    sh.querySelector("#vjA").onclick = () => { close(); goTo(IDX[book + ":" + ch + ":1"]); };
    sh.querySelectorAll("[data-v]").forEach(b => b.onclick = () => { close(); goTo(IDX[book + ":" + ch + ":" + b.dataset.v]); }); });
}

/* ---- Pray tab ---- */
const PRAYERS = {
  cross: ["Sign of the Cross", "In the name of the Father, and of the Son, and of the Holy Spirit. Amen."],
  creed: ["Apostles’ Creed", "I believe in God, the Father almighty, Creator of heaven and earth; and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen."],
  our: ["Our Father", "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen."],
  hail: ["Hail Mary", "Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen."],
  glory: ["Glory Be", "Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen."],
  queen: ["Hail, Holy Queen", "Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Amen."]
};
const MYST = {
  joyful: ["Joyful Mysteries", [["The Annunciation", "The angel Gabriel tells Mary she will be the mother of Jesus."], ["The Visitation", "Mary visits her cousin Elizabeth, who is expecting John the Baptist."], ["The Nativity", "Jesus is born in Bethlehem."], ["The Presentation", "Mary and Joseph bring the baby Jesus to the Temple."], ["Finding in the Temple", "Jesus, age twelve, is found teaching in the Temple."]]],
  sorrowful: ["Sorrowful Mysteries", [["The Agony in the Garden", "Jesus prays in Gethsemane the night before he dies."], ["The Scourging at the Pillar", "Jesus is whipped by Roman soldiers."], ["The Crowning with Thorns", "Soldiers mock Jesus and press a crown of thorns on his head."], ["The Carrying of the Cross", "Jesus carries his cross to Calvary."], ["The Crucifixion", "Jesus dies on the cross."]]],
  glorious: ["Glorious Mysteries", [["The Resurrection", "Jesus rises from the dead on the third day."], ["The Ascension", "Jesus goes up into heaven."], ["The Descent of the Holy Spirit", "The Holy Spirit comes on the apostles at Pentecost."], ["The Assumption of Mary", "Mary is taken up into heaven."], ["The Coronation of Mary", "Mary is crowned Queen of Heaven."]]],
  luminous: ["Luminous Mysteries", [["The Baptism of Jesus", "Jesus is baptized in the Jordan and the Father speaks from heaven."], ["The Wedding at Cana", "Jesus turns water into wine at his mother’s request."], ["The Proclamation of the Kingdom", "Jesus preaches that the kingdom of God is near and calls people to repent."], ["The Transfiguration", "Jesus shines with light on the mountain before Peter, James and John."], ["The Institution of the Eucharist", "At the Last Supper Jesus gives his body and blood under bread and wine."]]]
};
function prMyst(){ const d = new Date().getDay(); return d === 1 || d === 6 ? "joyful" : d === 2 || d === 5 ? "sorrowful" : d === 4 ? "luminous" : "glorious"; }
const PR_LIST = {
  rosary: ["The Rosary", "5 decades, at your own pace", "hands"],
  exam: ["Daily Examen", "5 steps, 5 minutes", "sun"],
  lectio: ["Lectio Divina", "Read one verse slowly, 5 minutes", "book"],
  quiet: ["Five quiet minutes", "Just sit. A bell rings at the end.", "bell"]
};
function prSteps(k){
  if(k === "exam") return [["Be still", "Sit down. Breathe slowly. Ask God to be with you.", 60], ["Give thanks", "Name three good things from today and thank God for them.", 60], ["Look back", "Go through your day. Where was God with you? Where did you drift from him?", 90], ["Say sorry", "Tell God what you did wrong. Ask to be forgiven.", 45], ["Look ahead", "Ask God for help with tomorrow. End with the Our Father.", 45]];
  if(k === "lectio"){ const vd = verseOfDay(new Date(), votdPick); return [["Settle", "Sit quietly and breathe. Ask the Holy Spirit to speak to you.", 45], ["Read", `Read this slowly: “${vd.text}” (${vd.ref}). Notice one word or phrase that stands out.`, 60], ["Think", "Repeat that word or phrase. What is God saying to you through it?", 90], ["Pray", "Answer God in your own words. Tell him what is on your heart.", 60], ["Rest", "Be quiet. Just be with him.", 45]]; }
  if(k === "quiet") return [["Sit", "Sit still and say nothing. A bell rings when the time is up.", 300]];
  const m = MYST[prMyst()][1];
  return [{t: "Begin", d: "Make the sign of the cross and say the Apostles’ Creed.", p: ["cross", "creed"]}, {t: "Opening prayers", d: "Say one Our Father, three Hail Marys and a Glory Be.", p: ["our", "hail", "glory"]}]
    .concat(m.map((x, i) => ({t: `Decade ${i + 1}: ${x[0]}`, d: x[1], p: ["our", "hail", "glory"], dec: true})))
    .concat([{t: "Closing", d: "Say the Hail, Holy Queen. Then make the sign of the cross.", p: ["queen", "cross"]}]);
}
let PR = null;
function prStop(){ if(PR){ clearInterval(PR.tm); try{ PR.wl && PR.wl.release(); }catch(e){} } PR = null; }
function prBell(){ try{ const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.type = "sine"; o.frequency.value = 660; g.gain.setValueAtTime(.25, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + 2); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 2); }catch(e){} }
const prFmt = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
let prSel = "rosary";
function renderPray(){
  bar(); view.scrollTop = 0;
  if(PR && PR.done){ view.innerHTML = `<div class="stack"><div class="hello"><h1>Amen.</h1><p>${PR.rosary ? "You prayed the Rosary." : "Prayer time is done."}${PR.streakLine ? " " + esc(PR.streakLine) : ""}</p></div><button class="btn primary block" id="prDone">Done</button></div>`; $("#prDone").onclick = () => { prStop(); renderPray(); }; return; }
  if(PR){
    const st = PR.steps[PR.i], n = PR.steps.length, timed = !PR.rosary;
    const head = `<div class="hello"><h1>${esc(PR_LIST[PR.key][0])}</h1><p>${PR.rosary ? esc(MYST[prMyst()][0]) + " · " : ""}Step ${PR.i + 1} of ${n}</p></div>`;
    const segs = `<div class="seg" aria-hidden="true">${PR.steps.map((_, k) => `<i class="${k < PR.i ? "on" : k === PR.i ? "cur" : ""}"></i>`).join("")}</div>`;
    let mid;
    if(timed) mid = `<div class="pr-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="44"/><circle class="fg" id="prArc" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="${276.5 * (1 - PR.left / st[2])}"/></svg><div><span><span id="prClk">${prFmt(PR.left)}</span><small>${n > 1 ? "this step" : "total"}</small></span></div></div>
      <div class="pr-step"><h3>${esc(st[0])}</h3><p class="prose">${esc(st[1])}</p></div>`;
    else mid = `<section class="card stack pr-step"><span class="label">${esc(st.t)}</span><p class="prose">${esc(st.d)}</p>
      ${st.dec ? `<div class="pr-beads" aria-label="${PR.beads} of 10 Hail Marys">${Array.from({length: 10}, (_, k) => `<i class="${k < PR.beads ? "on" : ""}"></i>`).join("")}</div>
        ${PR.beads < 10 ? `<button class="btn primary block" id="prBead">Hail Mary ${PR.beads + 1} of 10</button>` : `<p class="muted small" style="margin:0">Now say the Glory Be.</p>`}` : ""}
      <details class="pr-prayers"><summary>Show the prayers</summary>${st.p.map(k => `<p><b>${esc(PRAYERS[k][0])}</b><br>${esc(PRAYERS[k][1])}</p>`).join("")}</details></section>`;
    view.innerHTML = `<div class="stack">${head}${segs}${mid}
      <div class="row-btns">${timed ? `<button class="btn quiet" id="prPause">${PR.paused ? "Resume" : "Pause"}</button>` : ""}<button class="btn ${!timed && (!st.dec || PR.beads >= 10) ? "primary" : "quiet"}" id="prNext">${PR.i === n - 1 ? "Finish" : "Next step"}</button><button class="btn quiet" id="prEnd">End</button></div></div>`;
    const pb = $("#prPause"); if(pb) pb.onclick = () => { PR.paused = !PR.paused; pb.textContent = PR.paused ? "Resume" : "Pause"; };
    const bd = $("#prBead"); if(bd) bd.onclick = () => { PR.beads++; renderPray(); };
    $("#prNext").onclick = prAdvance; $("#prEnd").onclick = () => { prStop(); renderPray(); };
    return;
  }
  view.innerHTML = `<div class="stack"><div class="hello"><h1>Pray</h1><p>Sit in your chair. Pick one.</p></div>
    ${Object.keys(PR_LIST).map(k => `<button class="card pr-opt ${k === prSel ? "sel" : ""}" data-p="${k}"><div class="logo-tile" style="width:44px;height:44px;border-radius:12px">${ic(PR_LIST[k][2])}</div><div style="flex:1;min-width:0"><h3>${esc(PR_LIST[k][0])}</h3><p class="muted small" style="margin:2px 0 0">${k === "rosary" ? esc(MYST[prMyst()][0]) + " today. " : ""}${esc(PR_LIST[k][1])}</p></div></button>`).join("")}
    <button class="btn primary block" id="prBegin">Begin</button>
    <p class="muted small" style="text-align:center;margin:0">Finishing a prayer counts as your day.</p></div>`;
  view.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { prSel = b.dataset.p; renderPray(); });
  $("#prBegin").onclick = () => { const steps = prSteps(prSel), rosary = prSel === "rosary";
    PR = {key: prSel, steps, i: 0, rosary, paused: false, beads: 0, left: rosary ? 0 : steps[0][2], tm: null, wl: null};
    try{ if(navigator.wakeLock) navigator.wakeLock.request("screen").then(w => { if(PR) PR.wl = w; else w.release(); }).catch(() => {}); }catch(e){}
    if(!rosary){ prBell(); PR.tm = setInterval(prTick, 1000); }
    renderPray(); };
}
function prTick(){ if(!PR || PR.paused || tab !== "pray") return; PR.left--; if(PR.left < 0){ prAdvance(); return; }
  const c = $("#prClk"); if(c) c.textContent = prFmt(PR.left); const a = $("#prArc"); if(a) a.style.strokeDashoffset = 276.5 * (1 - PR.left / PR.steps[PR.i][2]); }
function prAdvance(){ if(!PR) return; if(!PR.rosary) prBell(); PR.i++; PR.beads = 0;
  if(PR.i >= PR.steps.length){ clearInterval(PR.tm); try{ PR.wl && PR.wl.release(); }catch(e){} PR.done = true;
    if(completeDay()){ const s = liveStreak(); PR.streakLine = s > 1 ? `Day ${s} in a row.` : "Day one is on the board."; }
    renderPray(); return; }
  if(!PR.rosary) PR.left = PR.steps[PR.i][2]; renderPray(); }
