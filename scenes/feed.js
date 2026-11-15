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
      <p class="scn-verse">${esc(x.t)}</p><span class="scn-more" hidden>Tap to read more</span>
      <p class="scn-hook">${esc(s.hook)}</p>
    </div>
    <div class="scn-rail">
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
  scn = {ov, order};
  const load = el => { if(el) el.querySelectorAll("img[data-src]").forEach(im => { im.src = im.dataset.src; im.removeAttribute("data-src"); }); };
  const refresh = el => { const k = +el.dataset.k; if(isNaN(k)) return; const s = SCENES[k], x = scText(s);
    const pv = el.querySelector(".scn-verse"); pv.textContent = x.t; requestAnimationFrame(() => { el.querySelector(".scn-more").hidden = !(pv.scrollHeight > pv.clientHeight + 2 || pv.classList.contains("open")); }); el.querySelector(".scn-ref").textContent = x.ref + (x.tr ? " · " + TR[x.tr].short : "");
    if(ONL[trCur()] && x.tr !== trCur()) ensureChapter(trCur(), s.r[0], s.r[1]).then(ok => { if(ok && scn) refresh(el); }); };
  let cur = -1;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if(!e.isIntersecting || e.intersectionRatio < .6) return;
    const el = e.target, i = +el.dataset.i; if(i === cur) return; cur = i;
    feed.querySelectorAll(".scn-slide.on").forEach(x => x.classList.remove("on")); el.classList.add("on");
    load(el); load(el.nextElementSibling); load(el.nextElementSibling && el.nextElementSibling.nextElementSibling); load(el.previousElementSibling);
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
    if(b){ e.stopPropagation(); const a = b.dataset.act;
      if(a === "save") like(el);
      else if(a === "share") shareVerse(scG(s));
      else if(a === "read"){ closeScenes(true); openChapter(s.r[0], s.r[1], scG(s)); }
      return; }
    const vv = e.target.closest(".scn-verse, .scn-more"); if(vv){ const p = el.querySelector(".scn-verse"); p.classList.toggle("open"); el.querySelector(".scn-more").textContent = p.classList.contains("open") ? "Show less" : "Tap to read more"; return; }
    const now = Date.now(); if(el._t && now - el._t < 320){ el._t = 0; like(el, true); } else el._t = now; // double-tap to save, like Reels
  });
  $("#scnClose").onclick = () => closeScenes();
  $("#scnDone").onclick = () => closeScenes();
  $("#scnAgain").onclick = () => { S.scn.order = []; S.scn.pos = 0; scOrder(); closeScenes(true); openScenes(); };
}
function closeScenes(quiet){ if(!scn) return; scn.io.disconnect(); scn.ov.remove(); scn = null; if(!quiet) render(); }
