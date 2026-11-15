/* ---------- BIBLE PEOPLE + WHO'S WHO ---------- */
const PCATS = __PCATS__, PEXTRA = __PEXTRA__, PREL = __PREL__;
const PP = {}; PCATS.forEach(c => c.people.forEach(p => { p.cat = c.key; PP[p.id] = p; }));
const PALL = Object.keys(PP).concat(Object.keys(PEXTRA));
const pName = id => PP[id] ? PP[id].name : PEXTRA[id] ? PEXTRA[id][0] : id;
const pDesc = id => PP[id] ? PP[id].role : PEXTRA[id] ? PEXTRA[id][1] : "";
const PREL_LABEL = {parent:["Children","Parents"], ancestor:["Descendants","Ancestors"], spouse:["Married to","Married to"], sibling:["Brothers & sisters","Brothers & sisters"], relative:["Family","Family"], family:["Family","Family"], mentor:["Taught / led","Learned from"], friend:["Friends & partners","Friends & partners"], rival:["Opponents","Opponents"]};
const PREL_COLOR = {Parents:"#F59E0B", Children:"#F59E0B", Ancestors:"#D97706", Descendants:"#D97706", "Married to":"#EC4899", "Brothers & sisters":"#8B5CF6", Family:"#8B5CF6", "Taught / led":"#0EA5E9", "Learned from":"#0EA5E9", "Friends & partners":"#10B981", Opponents:"#EF4444"};
function pLinks(id){ const out = {}; PREL.forEach(([a, r, b]) => { let lab, o; if(a === id){ lab = PREL_LABEL[r][0]; o = b; } else if(b === id){ lab = PREL_LABEL[r][1]; o = a; } else return; (out[lab] = out[lab] || []).includes(o) || out[lab].push(o); }); return out; }
const pArt = p => p && p.art ? `scenes/${p.art}.jpg` : null;
function pMono(id, cls=""){ const p = PP[id], a = pArt(p); const n = pName(id).replace(/^(King|The) /, ""); return a ? `<span class="pp-av ${cls}"><img src="${a}" alt="" loading="lazy"></span>` : `<span class="pp-av mono ${cls}">${esc(n[0])}</span>`; }
function peopleCardHTML(){
  return `<button class="scn-card pp-card" id="openPeople" aria-label="Open Bible People">
    <img src="scenes/last-supper.jpg" alt="" loading="lazy">
    <span class="scn-card-txt"><span class="label">New · Bible People</span><b>Who’s who in the Bible</b><span class="sub">${Object.keys(PP).length} people in plain English · see how they’re connected</span></span>
    <span class="scn-play">${ic("user")}</span></button>`; }
let ppl = null;
function openPeople(mode, focus){
  if(ppl) ppl.ov.remove();
  const ov = document.createElement("div"); ov.className = "overlay pp"; ov.id = "people";
  app.appendChild(ov); ppl = {ov, mode: mode || "browse", focus: focus || "jesus", q: ""};
  drawPeople();
}
function closePeople(){ if(ppl){ ppl.ov.remove(); ppl = null; } render(); }
function drawPeople(){
  const P = ppl, ov = P.ov;
  ov.innerHTML = `<div class="deck-top"><button class="icon-btn" id="ppClose" aria-label="Close">${ic("x")}</button><div class="grow"><span class="t">Bible People</span></div></div>
    <div class="pp-seg"><div class="segctl"><button class="${P.mode === "browse" ? "on" : ""}" data-m="browse">People</button><button class="${P.mode === "who" ? "on" : ""}" data-m="who">Who’s Who map</button></div></div>
    <div class="pp-body" id="ppBody"></div>`;
  $("#ppClose").onclick = closePeople;
  ov.querySelectorAll(".pp-seg [data-m]").forEach(b => b.onclick = () => { P.mode = b.dataset.m; drawPeople(); });
  if(P.mode === "browse") drawBrowse(); else drawWho();
}
function drawBrowse(){
  const body = $("#ppBody");
  body.innerHTML = `<div class="stack">${PCATS.map(c => `<section class="pp-cat">
      <div class="pp-cat-h"><div><h3>${esc(c.title)}</h3><p class="muted small">${esc(c.blurb)}</p></div><span class="count num">${c.people.length}</span></div>
      <div class="pp-row">${c.people.map(p => `<button class="pp-tile" data-p="${p.id}">${pMono(p.id, "lg")}<b>${esc(p.name)}</b><span>${esc(p.role)}</span></button>`).join("")}</div>
    </section>`).join("")}</div>`;
  body.querySelectorAll("[data-p]").forEach(b => b.onclick = () => openPerson(b.dataset.p));
}
function drawWho(){
  const P = ppl, body = $("#ppBody"), id = P.focus, L = pLinks(id), groups = Object.keys(L);
  const all = []; groups.forEach(g => { if(L[g].length > 4) all.push([g, "#" + g]); else L[g].forEach(o => all.push([g, o])); }); // big groups become one bubble
  // radial map: the person in the middle, everyone connected around them, colored by how they’re related
  const W = 360, H = all.length > 12 ? 400 : 340, cx = W/2, cy = H/2, n = all.length;
  const nodes = all.map(([g, o], i) => { const ring = n > 12 && i % 2 ? 0.62 : 1, a = -Math.PI/2 + i * 2 * Math.PI / Math.max(n, 1), R = (Math.min(W, H)/2 - 34) * ring; return {g, o, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a)}; });
  const short = s => { s = s.replace(/ \(.*\)/, "").replace(/^King /, "").replace(/ of (Nazareth|Arimathea)$/, "").replace(/ the Great$/, "").replace(/, son of .*/, ""); return s.length > 16 ? s.slice(0, 15) + "…" : s; };
  const svg = `<svg class="pp-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Connections for ${esc(pName(id))}">
    ${nodes.map(nd => `<line x1="${cx}" y1="${cy}" x2="${nd.x.toFixed(1)}" y2="${nd.y.toFixed(1)}" stroke="${PREL_COLOR[nd.g]}" stroke-width="2" opacity=".55"/>`).join("")}
    ${nodes.map(nd => nd.o[0] === "#" ? `<g class="pp-node pp-grp" data-grp="${esc(nd.g)}" transform="translate(${nd.x.toFixed(1)},${nd.y.toFixed(1)})"><circle r="24" fill="${PREL_COLOR[nd.g]}"/><text class="pp-gn" text-anchor="middle" dy="6">${L[nd.g].length}</text><text class="pp-lab" text-anchor="middle" dy="39">${esc(nd.g)}</text></g>`
      : `<g class="pp-node" data-p="${nd.o}" transform="translate(${nd.x.toFixed(1)},${nd.y.toFixed(1)})"><circle r="19" fill="var(--canvas)" stroke="${PREL_COLOR[nd.g]}" stroke-width="3"/><text class="pp-ini" text-anchor="middle" dy="5">${esc(pName(nd.o).replace(/^(King|The) /, "")[0])}</text><text class="pp-lab" text-anchor="middle" dy="34">${esc(short(pName(nd.o)))}</text></g>`).join("")}
    <g class="pp-center"><circle cx="${cx}" cy="${cy}" r="34" fill="var(--brand)"/><text x="${cx}" y="${cy}" text-anchor="middle" dy="6" class="pp-cini">${esc(pName(id).replace(/^(King|The) /, "")[0])}</text></g>
  </svg>`;
  const matches = P.q.length > 1 ? PALL.filter(x => pName(x).toLowerCase().includes(P.q.toLowerCase())).slice(0, 8) : [];
  body.innerHTML = `<div class="stack">
    <label class="search">${ic("search","sm")}<input id="ppQ" type="search" placeholder="Find anyone — “Ruth”, “Paul”, “Moses”" value="${esc(P.q)}" autocomplete="off"></label>
    ${matches.length ? `<div class="list">${matches.map(x => `<button class="li" data-go="${x}">${pMono(x)}<div class="txt"><b>${esc(pName(x))}</b><span class="sub">${esc(pDesc(x))}</span></div></button>`).join("")}</div>` : ""}
    <div class="card pp-who">
      <div class="pp-who-h">${pMono(id, "lg")}<div><h2>${esc(pName(id))}</h2><p class="muted small">${esc(pDesc(id))}</p></div></div>
      ${n ? svg : `<p class="muted">No connections mapped yet.</p>`}
      <div class="pp-legend">${groups.map(g => `<span><i style="background:${PREL_COLOR[g]}"></i>${esc(g)}</span>`).join("")}</div>
      ${PP[id] ? `<button class="btn primary block" id="ppStory">Read ${esc(pName(id))}’s story ${ic("arrow","sm")}</button>` : ""}
    </div>
    ${groups.map(g => `<section data-sec="${esc(g)}"><div class="section-h"><span class="label" style="color:${PREL_COLOR[g]}">${esc(g)}</span></div><div class="list">${L[g].map(o => `<button class="li" data-go="${o}">${pMono(o)}<div class="txt"><b>${esc(pName(o))}</b><span class="sub">${esc(pDesc(o))}</span></div>${ic("chev","chev")}</button>`).join("")}</div></section>`).join("")}
    <button class="card li" id="ppLine"><span class="pp-av mono">✝</span><div class="txt"><b>The family line from Adam to Jesus</b><span class="sub">How the story connects, generation by generation</span></div>${ic("chev","chev")}</button>
  </div>`;
  const q = $("#ppQ"); q.oninput = () => { P.q = q.value; const pos = q.selectionStart; drawWho(); const q2 = $("#ppQ"); q2.focus(); try{ q2.setSelectionRange(pos, pos); }catch(e){} };
  body.querySelectorAll(".pp-grp").forEach(b => b.onclick = () => { const s = body.querySelector(`[data-sec="${b.dataset.grp}"]`); if(s) s.scrollIntoView({behavior:"smooth", block:"start"}); });
  body.querySelectorAll("[data-go], .pp-node:not(.pp-grp)").forEach(b => b.onclick = () => { P.focus = b.dataset.go || b.dataset.p; P.q = ""; drawWho(); body.scrollTop = 0; P.ov.querySelector(".pp-body").scrollTop = 0; });
  if($("#ppStory")) $("#ppStory").onclick = () => openPerson(id);
  $("#ppLine").onclick = drawLine;
}
const PLINE = [["adam-eve","The first people"],["seth","Their third son"],["noah","Ten generations later — survived the flood"],["abraham","God promised to bless the world through his family"],["isaac","The promised son"],["jacob","Renamed Israel; father of the 12 tribes"],["judah","One of Jacob’s sons — the tribe of kings"],["rahab","Married into Israel after Jericho"],["boaz","Rahab’s son; married Ruth"],["ruth","The loyal foreigner"],["obed","Son of Ruth and Boaz"],["jesse","Farmer in Bethlehem"],["david","The shepherd king"],["solomon","David’s son; built the Temple"],["hezekiah","A good king, generations later"],["josiah","The boy king"],["joseph-nazareth","From David’s line, about 1,000 years after him"],["mary","Mother of Jesus"],["jesus","The promised Son of David"]];
function drawLine(){
  const body = $("#ppBody");
  body.innerHTML = `<div class="stack"><button class="btn quiet sm" id="ppBack" style="justify-self:start">${ic("back","sm")}Back to the map</button>
    <div class="hello"><h1>Adam to Jesus</h1><p>The Bible’s big family story. Tap anyone to see their connections.</p></div>
    <ol class="pp-line">${PLINE.map(([id, t]) => `<li><button data-go="${id}">${pMono(id)}<span><b>${esc(pName(id))}</b><span class="sub">${esc(t)}</span></span></button></li>`).join("")}</ol></div>`;
  $("#ppBack").onclick = drawWho;
  body.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { ppl.focus = b.dataset.go; drawWho(); });
}
function openPerson(id){
  const p = PP[id]; if(!p) return;
  const ov = document.createElement("div"); ov.className = "overlay scn ppd"; ov.id = "person";
  const art = pArt(p) || "scenes/" + (PCATS.find(c => c.key === p.cat) || {}).art + ".jpg";
  const L = pLinks(id), conn = Object.keys(L).flatMap(g => L[g].map(o => [g, o]));
  const list = PCATS.flatMap(c => c.people.map(x => x.id)), nx = list[(list.indexOf(id) + 1) % list.length];
  const slides = [
    `<section class="scn-slide ppd-intro"><div class="scn-art"><img class="bg" src="${art}" alt=""><img class="fg" src="${art}" alt=""></div><div class="scn-shade"></div>
      <div class="scn-info"><span class="scn-ref">${esc((PCATS.find(c => c.key === p.cat) || {}).title || "")}</span><h2 class="ppd-name">${esc(p.name)}</h2><p class="ppd-role">${esc(p.role)}</p>
      <div class="ppd-facts">${p.facts.map(f => `<span>${esc(f)}</span>`).join("")}</div><p class="ppd-hint">${ic("back","sm")} Swipe up · ${p.cards.length} moments from ${esc(p.name.split(" (")[0])}’s life · about ${Math.max(1, Math.round(p.cards.reduce((n, c) => n + c.t.split(" ").length, 0) / 200))} min</p></div></section>`,
    ...p.cards.map((c, i) => `<section class="scn-slide ppd-card"><div class="scn-art"><img class="bg" src="${art}" alt=""></div>
      <div class="ppd-box"><span class="ppd-step num">${i + 1} / ${p.cards.length}</span><h3>${esc(c.h)}</h3><p>${esc(c.t)}</p>
        ${c.more ? `<div class="ppd-more" hidden><p>${esc(c.more)}</p></div><button class="ppd-morebtn" data-more>${ic("book","sm")}<span>Read the full story</span></button>` : ""}
        ${c.ref ? `<button class="ppd-ref" data-b="${esc(c.ref[0])}" data-c="${c.ref[1]}">Read it in the Bible · ${esc(c.ref[0] === "Psalms" ? "Psalm " + hebPs(c.ref[1]) : bookLabel(c.ref[0]) + " " + c.ref[1])}</button>` : ""}</div></section>`),
    `<section class="scn-slide ppd-card"><div class="scn-art"><img class="bg" src="${art}" alt=""></div>
      <div class="ppd-box ppd-end">
        ${conn.length ? `<h3>Connected to</h3><div class="ppd-conn">${conn.map(([g, o]) => `<button data-who="${o}" style="border-color:${PREL_COLOR[g]}">${esc(pName(o))}<small>${esc(g)}</small></button>`).join("")}</div>` : ""}
        <h3>Read it in the Bible</h3><div class="ppd-reads">${p.cards.filter((c, i, a) => c.ref && a.findIndex(x => x.ref && x.ref.join() === c.ref.join()) === i).map(c => `<button data-b="${esc(c.ref[0])}" data-c="${c.ref[1]}">${ic("book","sm")}<span><b>${esc(c.h)}</b><small>${esc(c.ref[0] === "Psalms" ? "Psalm " + hebPs(c.ref[1]) : bookLabel(c.ref[0]) + " " + c.ref[1])}</small></span></button>`).join("")}</div>
        <div class="ppd-btns"><button class="btn primary" data-who="${id}">See ${esc(p.name.split(" (")[0])} on the map</button><button class="btn quiet" data-next="${nx}">Next: ${esc(pName(nx))} ${ic("arrow","sm")}</button></div>
      </div></section>`];
  ov.innerHTML = `<div class="scn-top"><button class="icon-btn scn-x" data-close aria-label="Close">${ic("x")}</button><span class="scn-title">${esc(p.name)}</span></div><div class="scn-feed">${slides.join("")}</div>`;
  app.appendChild(ov);
  const feed = ov.querySelector(".scn-feed");
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting && e.intersectionRatio >= .6){ feed.querySelectorAll(".on").forEach(x => x.classList.remove("on")); e.target.classList.add("on"); } }), {root: feed, threshold: [.6]});
  feed.querySelectorAll(".scn-slide").forEach(el => io.observe(el));
  const done = () => { io.disconnect(); ov.remove(); };
  ov.querySelector("[data-close]").onclick = done;
  ov.querySelectorAll("[data-who]").forEach(b => b.onclick = () => { done(); if(!ppl) openPeople("who", b.dataset.who); else { ppl.mode = "who"; ppl.focus = b.dataset.who; ppl.q = ""; drawPeople(); } });
  ov.querySelectorAll("[data-more]").forEach(b => b.onclick = () => { const m = b.previousElementSibling, open = m.hidden; m.hidden = !open; b.querySelector("span").textContent = open ? "Show less" : "Read the full story"; });
  ov.querySelectorAll("[data-next]").forEach(b => b.onclick = () => { done(); openPerson(b.dataset.next); });
  ov.querySelectorAll("[data-b]").forEach(b => b.onclick = () => { done(); if(ppl){ ppl.ov.remove(); ppl = null; } openChapter(b.dataset.b, +b.dataset.c); });
}
