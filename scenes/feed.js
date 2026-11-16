/* ---------- SCENES (swipe through the Bible in pictures) ---------- */
const SCENES = __SCENES__;
let scn = null;
function scG(s){ return IDX[s.r[0] + ":" + s.r[1] + ":" + s.r[2]]; }
function scText(s){ const out = []; let tr = null, ref = null;
  for(let v = s.r[2]; v <= s.r[3]; v++){ const g = IDX[s.r[0] + ":" + s.r[1] + ":" + v]; if(g == null) continue; const t = trV(g); out.push(t.t); if(!ref) ref = t.ref; tr = t.tr; }
  const last = s.r[3] > s.r[2] && ref ? "–" + (parseInt(trV(IDX[s.r[0] + ":" + s.r[1] + ":" + s.r[3]]).ref.split(":").pop()) || s.r[3]) : "";
  return {t: out.join(" "), ref: (ref || "") + last, tr}; }
function scOrder(){ // a fresh shuffle each time you finish the whole set, so it never feels like the same feed
  const S0 = S.scn || (S.scn = {order:[], pos:0});
  if(!S0.order.length || S0.order.length !== SCENES.length || S0.pos >= SCENES.length){ const a = SCENES.map((_,i) => i); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } S0.order = a; S0.pos = 0; save(); }
  return S0; }
function scenesCardHTML(){
  const S0 = scOrder(), s = SCENES[S0.order[S0.pos] ?? 0];
  return `<button class="scn-card" id="openScenes" aria-label="Open Bible Scenes">
    <img src="scenes/${s.id}.jpg" alt="" loading="lazy">
    <span class="scn-card-txt"><span class="label">New · Bible Scenes</span><b>Swipe through the Bible in pictures</b><span class="sub">${SCENES.length} scenes from Genesis to Revelation</span></span>
    <span class="scn-play">${ic("arrow")}</span></button>`; }
function slideHTML(k, i){ const s = SCENES[k], x = scText(s), g = scG(s);
  return `<section class="scn-slide" data-i="${i}" data-k="${k}">
    <div class="scn-art"><img class="bg" data-src="scenes/${s.id}.jpg" alt=""><img class="fg" data-src="scenes/${s.id}.jpg" alt="${esc(s.title)}"></div>
    <div class="scn-shade"></div><div class="scn-heart">${ic("heart")}</div>
    <div class="scn-info">
      <span class="scn-ref">${esc(x.ref)}${x.tr ? ` · ${esc(TR[x.tr].short)}` : ""}</span>
      <h2>${esc(s.title)}</h2>
      <div class="scn-tabs"><button class="on" data-mode="story">What happened</button><button data-mode="verse">Bible verse</button></div>
      <p class="scn-verse">${esc(s.story || x.t)}</p><span class="scn-more" hidden>Tap to read more</span>
    </div>
    <div class="scn-rail">
      <button class="scn-act scn-watch-b" data-act="sound" aria-label="Narration on or off" hidden><svg class="ico" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg><span>Sound</span></button>
      <button class="scn-act ${saved.has(g) ? "on" : ""}" data-act="save" aria-label="Save">${ic("heart")}<span>${saved.has(g) ? "Saved" : "Save"}</span></button>
      <button class="scn-act" data-act="read" aria-label="Read the chapter">${ic("book")}<span>Read</span></button>
      <button class="scn-act" data-act="share" aria-label="Share">${ic("share")}<span>Share</span></button>
    </div></section>`; }
function openScenes(){
  const S0 = scOrder();
  const ov = document.createElement("div"); ov.className = "overlay scn"; ov.id = "scenes";
  const order = S0.order.slice(S0.pos).concat(S0.order.slice(0, S0.pos));
  ov.innerHTML = `<div class="scn-top"><button class="icon-btn scn-x" id="scnClose" aria-label="Close">${ic("x")}</button><span class="scn-title">Bible Scenes</span><span class="scn-count num" id="scnCount"></span></div>
    <div class="scn-feed" id="scnFeed">${order.map((k, i) => slideHTML(k, i)).join("")}
      <section class="scn-slide scn-end" data-i="${order.length}"><div class="scn-endbox">${ic("check","xl")}<h2>You’ve seen all ${SCENES.length}</h2><p>Every scene, Genesis to Revelation. Start again in a new order?</p><button class="btn primary" id="scnAgain">Shuffle and start over</button><button class="btn quiet" id="scnDone">Back to the Bible</button></div></section>
    </div>
    ${S.scnCoach ? "" : `<div class="scn-coach" id="scnCoach">${ic("back")}<span>Swipe up for the next scene</span></div>`}`;
  app.appendChild(ov);
  const feed = $("#scnFeed"), cnt = $("#scnCount");
  scA = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="); scA.play().catch(() => {});
  const soundUI = () => feed.querySelectorAll('[data-act="sound"]').forEach(b => { b.classList.toggle("off", !!S.scnMute); b.querySelector("span").textContent = S.scnMute ? "Muted" : "Sound"; });
  const narrPlay = () => { const el = feed.querySelector(".scn-slide.on"); if(!el || isNaN(+el.dataset.k) || !WN) return; const id = SCENES[+el.dataset.k].id; if(!WN[id]) return;
    if(S.scnMute){ scA.pause(); return; } scA.src = "scenes/v/" + id + ".mp3"; scA.currentTime = 0; scA.play().catch(() => {}); cancelAnimationFrame(scR); const T = WN[id].times, pvv = el.querySelector(".scn-verse"); let last = -1;
    const tick = () => { if(!scn || !el.classList.contains("on")) return; if(el._sp && el.dataset.mode !== "verse"){ const t = scA.currentTime; let k = 0; for(let i = 0; i < T.length; i++) if(t >= T[i][0] - .05) k = i; if(k !== last && !scA.paused){ last = k; el._sp.forEach((q, i) => q.classList.toggle("cur", i === k)); const q = el._sp[k]; if(q) pvv.scrollTo({top: Math.max(0, q.offsetTop - pvv.offsetTop - 8), behavior: "smooth"}); } } scR = requestAnimationFrame(tick); }; scR = requestAnimationFrame(tick); };
  scn_narr = narrPlay;
  wLoad().then(n => { if(n && scn){ feed.querySelectorAll(".scn-slide").forEach(el => { const k = +el.dataset.k; if(!isNaN(k) && n[SCENES[k].id]) el.querySelector('[data-act="sound"]').hidden = false; }); soundUI(); narrPlay(); } });
  scn = {ov, order};
  const load = el => { if(el) el.querySelectorAll("img[data-src]").forEach(im => { im.src = im.dataset.src; im.removeAttribute("data-src"); }); };
  const refresh = scn.refresh = el => { const k = +el.dataset.k; if(isNaN(k)) return; const s = SCENES[k], x = scText(s);
    const pv = el.querySelector(".scn-verse"), nr = WN && WN[s.id] && el.dataset.mode !== "verse" && s.story; pv.classList.toggle("nar", !!nr);
    if(nr){ const sn = new Set(); pv.innerHTML = WN[s.id].lines.map(l => "<span>" + (typeof linkNames === "function" ? linkNames(esc(l), sn) : esc(l)) + "</span>").join(" "); el._sp = [...pv.children]; } else if(el.dataset.mode === "verse" || !s.story) pv.textContent = x.t; else pv.innerHTML = typeof linkNames === "function" ? linkNames(esc(s.story), new Set()) : esc(s.story);
    requestAnimationFrame(() => { el.querySelector(".scn-more").hidden = nr ? true : !(pv.scrollHeight > pv.clientHeight + 2 || pv.classList.contains("open")); }); el.querySelector(".scn-ref").textContent = x.ref + (x.tr ? " · " + TR[x.tr].short : "");
    if(ONL[trCur()] && x.tr !== trCur()) ensureChapter(trCur(), s.r[0], s.r[1]).then(ok => { if(ok && scn) refresh(el); }); };
  let cur = -1;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if(!e.isIntersecting || e.intersectionRatio < .6) return;
    const el = e.target, i = +el.dataset.i; if(i === cur) return; cur = i;
    feed.querySelectorAll(".scn-slide.on").forEach(x => x.classList.remove("on")); el.classList.add("on");
    load(el); load(el.nextElementSibling); load(el.nextElementSibling && el.nextElementSibling.nextElementSibling); load(el.previousElementSibling);
    scA.pause(); if(i < order.length) narrPlay();
    if(i < order.length){ refresh(el); cnt.textContent = (i + 1) + " / " + order.length; S.scn.pos = (S0.order.indexOf(order[i]) + 1); save(); }
    else { cnt.textContent = ""; S.scn.pos = SCENES.length; save(); }
    if(i > 0 && $("#scnCoach")){ $("#scnCoach").remove(); S.scnCoach = true; save(); }
  }), {root: feed, threshold: [.6]});
  feed.querySelectorAll(".scn-slide").forEach(el => io.observe(el));
  scn.io = io;
  const like = (el, force) => { const k = +el.dataset.k, g = scG(SCENES[k]); if(g == null) return;
    if(force && saved.has(g)){ pop(el); return; }
    const on = toggleSave(g); const b = el.querySelector('[data-act="save"]'); b.classList.toggle("on", on); b.querySelector("span").textContent = on ? "Saved" : "Save"; if(on) pop(el); };
  const pop = el => { const h = el.querySelector(".scn-heart"); h.classList.remove("go"); void h.offsetWidth; h.classList.add("go"); try{ navigator.vibrate && navigator.vibrate(12); }catch(e){} };
  feed.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"), el = e.target.closest(".scn-slide"); if(!el || el.classList.contains("scn-end")) return;
    const s = SCENES[+el.dataset.k];
    if(scA.paused && !S.scnMute && scA.currentSrc && /\/v\//.test(scA.currentSrc) && !scA.ended && !(b && b.dataset.act === "sound")) scA.play().catch(() => {});
    if(b){ e.stopPropagation(); const a = b.dataset.act;
      if(a === "save") like(el);
      else if(a === "share") shareVerse(scG(s));
      else if(a === "sound"){ S.scnMute = !S.scnMute; save(); soundUI(); if(S.scnMute) scA.pause(); else narrPlay(); }
      else if(a === "read"){ closeScenes(true); openChapter(s.r[0], s.r[1], scG(s)); }
      return; }
    const tb = e.target.closest(".scn-tabs button"); if(tb){ el.dataset.mode = tb.dataset.mode; el.querySelectorAll(".scn-tabs button").forEach(x => x.classList.toggle("on", x === tb)); el.querySelector(".scn-verse").classList.remove("open"); el.querySelector(".scn-more").textContent = "Tap to read more"; refresh(el); return; }
    const pl = e.target.closest(".pl"); if(pl){ e.stopPropagation(); scA.pause(); openPerson(pl.dataset.p); return; }
    const vv = e.target.closest(".scn-verse, .scn-more"); if(vv && !vv.classList.contains("nar")){ const p = el.querySelector(".scn-verse"); p.classList.toggle("open"); el.querySelector(".scn-more").textContent = p.classList.contains("open") ? "Show less" : "Tap to read more"; return; }
    const now = Date.now(); if(el._t && now - el._t < 320){ el._t = 0; like(el, true); } else el._t = now; // double-tap to save, like Reels
  });
  $("#scnClose").onclick = () => closeScenes();
  $("#scnDone").onclick = () => closeScenes();
  $("#scnAgain").onclick = () => { S.scn.order = []; S.scn.pos = 0; scOrder(); closeScenes(true); openScenes(); };
}
function closeScenes(quiet){ closeWatch(); try{ scA.pause(); }catch(e){} if(!scn) return; scn.io.disconnect(); scn.ov.remove(); scn = null; if(!quiet) render(); }

/* ---- Watch: narrated story with a slow camera over the picture ---- */
let WN = null, wn = null, scA = null, scn_narr = null, scR = 0;
function wLoad(){ return WN ? Promise.resolve(WN) : fetch("scenes/narr.json").then(r => r.ok ? r.json() : null).then(j => (WN = j)).catch(() => null); }
const W_SHOTS = [[.5,.5,1.06],[.28,.38,1.4],[.72,.5,1.45],[.42,.64,1.55],[.64,.34,1.35],[.34,.56,1.5],[.6,.6,1.4],[.5,.4,1.6]];
function openWatch(s){
  wLoad().then(N => { const n = N && N[s.id]; if(!n) return; closeWatch();
    const sh = (i) => W_SHOTS[(i + (s.id.length * 3)) % W_SHOTS.length];
    const ov = document.createElement("div"); ov.className = "overlay scn-w";
    ov.innerHTML = `<div class="sw-art"><img src="scenes/${s.id}.jpg" alt=""></div><div class="sw-grain"></div><div class="sw-vig"></div>
      <div class="sw-top"><button class="icon-btn" id="swX" aria-label="Close">${ic("x")}</button><span>${esc(s.title)}</span></div>
      <div class="sw-bar"><i id="swBar"></i></div><div class="sw-cap" id="swCap"></div>
      <button class="sw-play" id="swPlay" aria-label="Play"><b><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></b><p>Tap to play · sound on</p></button>`;
    app.appendChild(ov);
    const art = ov.querySelector(".sw-art img"), cap = ov.querySelector("#swCap"), bar = ov.querySelector("#swBar");
    const tf = (x, y, z) => `scale(${z}) translate(${(.5 - x) * 100 * (z - 1) / z * 1.6}%,${(.5 - y) * 100 * (z - 1) / z * 1.6}%)`;
    const a = new Audio("scenes/v/" + s.id + ".mp3"); const T = n.times; let shown = -1, spans = [], raf = 0;
    const frame = () => { const t = a.currentTime, dur = a.duration || n.dur || 1; bar.style.width = (t / dur * 100) + "%";
      let k = T.findIndex((_, i) => t < (T[i + 1] ? T[i + 1][0] : 1e9)); if(k < 0) k = T.length - 1;
      const c = sh(k), pv = sh(Math.max(0, k - 1)), q = Math.min(1, Math.max(0, (t - T[k][0]) / 1.3)), e = q * q * (3 - 2 * q);
      const b = T[k + 1] ? T[k + 1][0] : dur, p = Math.min(1, Math.max(0, (t - T[k][0]) / (b - T[k][0])));
      art.style.transform = tf(pv[0] + (c[0] - pv[0]) * e, pv[1] + (c[1] - pv[1]) * e, (pv[2] + (c[2] - pv[2]) * e) * (1 + .04 * p));
      if(k !== shown && t >= T[k][0] - .15){ shown = k; cap.innerHTML = n.lines[k].split(" ").map(w => "<span>" + esc(w) + "</span>").join(" "); spans = [...cap.children]; }
      if(shown === k){ const r = Math.min(1, (t - T[k][0]) / Math.max(.5, T[k][1] - T[k][0])); spans.forEach((x, j) => x.classList.toggle("on", j < Math.ceil(r * spans.length + .01))); }
      if(a.ended){ cap.innerHTML = `<button class="btn primary" id="swNext">Next story ▶</button><button class="btn quiet" id="swAgain">Watch again</button><button class="btn quiet" id="swRead">Read the chapter</button>`; bar.style.width = "100%";
        cap.querySelector("#swNext").onclick = () => watchStep(s, 1);
        cap.querySelector("#swAgain").onclick = () => { shown = -1; cap.innerHTML = ""; a.currentTime = 0; a.play(); raf = requestAnimationFrame(frame); };
        cap.querySelector("#swRead").onclick = () => { closeWatch(); closeScenes(true); openChapter(s.r[0], s.r[1], scG(s)); }; return; }
      raf = requestAnimationFrame(frame); };
    wn = {ov, a, stop: () => { cancelAnimationFrame(raf); a.pause(); }};
    art.style.transform = tf(.5, .5, 1.06);
    const go = () => a.play().then(() => { const b = ov.querySelector("#swPlay"); if(b) b.remove(); raf = requestAnimationFrame(frame); }).catch(() => {});
    ov.querySelector("#swPlay").onclick = go; go();
    let y0 = 0; ov.addEventListener("touchstart", ev => { y0 = ev.touches[0].clientY; }, {passive: true});
    ov.addEventListener("touchend", ev => { const dy = ev.changedTouches[0].clientY - y0; if(Math.abs(dy) > 70) watchStep(s, dy < 0 ? 1 : -1); }, {passive: true});
    ov.addEventListener("click", ev => { if(ev.target.closest("#swPlay,#swX,.btn")) return; if(a.paused && !a.ended && a.currentTime > 0){ a.play(); raf = requestAnimationFrame(frame); } else if(!a.paused){ a.pause(); cancelAnimationFrame(raf); } });
    ov.querySelector("#swX").onclick = () => closeWatch();
  }); }
function watchStep(s, d){ const sl = [...document.querySelectorAll(".scn-slide")]; const i = sl.findIndex(e => SCENES[+e.dataset.k] === s); const nx = sl[i + d]; if(!nx || !WN[SCENES[+nx.dataset.k].id]) return; closeWatch(); nx.scrollIntoView(); openWatch(SCENES[+nx.dataset.k]); }
function closeWatch(){ if(!wn) return; wn.stop(); wn.ov.remove(); wn = null; }
