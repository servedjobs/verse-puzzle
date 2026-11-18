/* ---------- BIBLE PEOPLE + WHO'S WHO ---------- */
const PCATS = __PCATS__, PEXTRA = __PEXTRA__, PREL = __PREL__, PLIN = __PLIN__;
const PP = {}; PCATS.forEach(c => c.people.forEach(p => { p.cat = c.key; PP[p.id] = p; }));
const PALL = Object.keys(PP).concat(Object.keys(PEXTRA));
const pName = id => PP[id] ? PP[id].name : PEXTRA[id] ? PEXTRA[id][0] : id;
const pDesc = id => PP[id] ? PP[id].role : PEXTRA[id] ? PEXTRA[id][1] : "";
const PREL_LABEL = {parent:["Children","Parents"], ancestor:["Descendants","Ancestors"], spouse:["Married to","Married to"], sibling:["Brothers & sisters","Brothers & sisters"], relative:["Family","Family"], family:["Family","Family"], mentor:["Taught / led","Learned from"], friend:["Friends & partners","Friends & partners"], rival:["Opponents","Opponents"]};
const PREL_COLOR = {Parents:"#F59E0B", Children:"#F59E0B", Ancestors:"#D97706", Descendants:"#D97706", "Married to":"#EC4899", "Brothers & sisters":"#8B5CF6", Family:"#8B5CF6", "Taught / led":"#0EA5E9", "Learned from":"#0EA5E9", "Friends & partners":"#10B981", Opponents:"#EF4444"};
function pLinks(id){ const out = {}; PREL.forEach(([a, r, b]) => { let lab, o; if(a === id){ lab = PREL_LABEL[r][0]; o = b; } else if(b === id){ lab = PREL_LABEL[r][1]; o = a; } else return; (out[lab] = out[lab] || []).includes(o) || out[lab].push(o); }); return out; }

const P_ALIAS = {"John the Baptist":"john-baptist","Mary Magdalene":"mary-magdalene","Judas Iscariot":"judas","Judas":"judas","Pontius Pilate":"pilate","Pilate":"pilate","Joseph of Nazareth":"joseph-nazareth","Simon the Zealot":"simon-zealot","Herod the Great":"herod","Peter":"peter","Andrew":"andrew","John":"john","Philip":"philip","Bartholomew":"bartholomew","Nathanael":"bartholomew","Thomas":"thomas","Matthew":"matthew","Matthias":"matthias","Jesus":"jesus","Martha":"martha-mary","Lazarus":"lazarus","Nicodemus":"nicodemus","Zacchaeus":"zacchaeus","Paul":"paul","Stephen":"stephen","Barnabas":"barnabas","Timothy":"timothy","Lydia":"lydia","Priscilla":"priscilla-aquila","Aquila":"priscilla-aquila","Adam":"adam-eve","Eve":"adam-eve","Cain":"cain-abel","Abel":"cain-abel","Noah":"noah","Abraham":"abraham","Sarah":"sarah","Jacob":"jacob","Moses":"moses","Aaron":"aaron","Miriam":"miriam","Joshua":"joshua","Caleb":"caleb","Rahab":"rahab","Deborah":"deborah","Gideon":"gideon","Samson":"samson","Ruth":"ruth","Hannah":"hannah","Samuel":"samuel","David":"david","Solomon":"solomon","Esther":"esther","Hezekiah":"hezekiah","Josiah":"josiah","Elijah":"elijah","Elisha":"elisha","Isaiah":"isaiah","Jeremiah":"jeremiah","Daniel":"daniel","Shadrach":"shadrach","Meshach":"shadrach","Abednego":"shadrach","Jonah":"jonah","Job":"job","Goliath":"goliath","Jezebel":"jezebel","Haman":"haman"};
const P_RE = new RegExp("\\b(" + Object.keys(P_ALIAS).sort((a, b) => b.length - a.length).join("|") + ")\\b", "g");
function linkNames(h, seen, skip){ return h.replace(P_RE, (m, n) => { let id = P_ALIAS[n]; if(n === "John" && (seen.has("john-baptist") || seen.has("_jb"))) id = "john-baptist"; if(n === "John the Baptist") seen.add("_jb"); if(!PP[id] || id === skip || seen.has(id)) return m; seen.add(id); return `<a class="pl" data-p="${id}">${m}</a>`; }); }
const pArt = p => p && p.art ? `scenes/${p.art}.jpg` : null;
function pMono(id, cls=""){ const p = PP[id], a = pArt(p); const n = pName(id).replace(/^(King|The) /, ""); return a ? `<span class="pp-av ${cls}"><img src="${a}" alt="" loading="lazy"></span>` : `<span class="pp-av mono ${cls}">${esc(n[0])}</span>`; }
function peopleCardHTML(){
  return `<button class="scn-card pp-card" id="openPeople" aria-label="Open Bible People">
    <img src="scenes/last-supper.jpg" alt="" loading="lazy">
    <span class="scn-card-txt"><span class="label">New · Bible People</span><b>Who’s who in the Bible</b><span class="sub">${Object.keys(PP).length} people in plain English · see how they’re connected</span></span>
    <span class="scn-play">${ic("user")}</span></button>
  <button class="pp-mapbtn" id="openPeopleMap">${MAPIC}<span><b>Who’s Who map</b><small>Tap anyone to see who they’re connected to</small></span></button>`; }
const MAPIC = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3"/></svg>`;
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
  body.innerHTML = `<div class="stack"><button class="pp-mapbtn" id="ppGoMap">${MAPIC}<span><b>See the Who’s Who map</b><small>How everyone in the Bible is connected</small></span></button>${PCATS.map(c => `<section class="pp-cat">
      <div class="pp-cat-h"><div><h3>${esc(c.title)}</h3><p class="muted small">${esc(c.blurb)}</p></div><span class="count num">${c.people.length}</span></div>
      <div class="pp-row">${c.people.map(p => `<button class="pp-tile" data-p="${p.id}">${pMono(p.id, "lg")}<b>${esc(p.name)}</b><span>${esc(p.role)}</span></button>`).join("")}</div>
    </section>`).join("")}</div>`;
  body.querySelectorAll("[data-p]").forEach(b => b.onclick = () => openPerson(b.dataset.p));
  $("#ppGoMap").onclick = () => { ppl.mode = "who"; drawPeople(); };
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
      ${famCardHTML(id)}
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
  body.querySelectorAll("[data-trace]").forEach(b => b.onclick = () => drawTrace(b.dataset.trace));
}
/* ---- family line: everyone back to Adam & Eve, and to Jesus ---- */
const lName = x => PP[x] || PEXTRA[x] ? pName(x) : (PLIN.NAMES[x] || x);
const lKnown = x => !!(PP[x] || PEXTRA[x]);
function lUp(id){ const out = [id]; let x = id, n = 0; while(PLIN.UP[x] && n++ < 200){ x = PLIN.UP[x][0]; out.push(x); } return out.reverse(); } // Adam first
const LJ = () => lUp("jesus");
function lToJesus(id){ // [path from someone to Jesus, shared ancestor or null]
  const J = LJ(); if(id === "jesus") return [["jesus"], null];
  let i = J.indexOf(id); if(i >= 0) return [J.slice(i), null];
  const d = PLIN.DOWN[id]; if(d){ i = J.indexOf(d); if(i >= 0) return [[id].concat(J.slice(i)), null]; }
  const up = lUp(id).reverse(); for(const a of up.slice(1)){ i = J.indexOf(a); if(i >= 0) return [J.slice(i), a]; }
  return [[], null];
}
function lMilestones(arr){ return arr.filter((x, i) => i === 0 || i === arr.length - 1 || lKnown(x)); }
function famCardHTML(id){
  const up = lUp(id), ms = lMilestones(up), [, ca] = lToJesus(id), note = PLIN.JNOTE[id];
  const trail = ms.map((x, i) => `<span class="${x === id ? "me" : ""}">${esc(lName(x).replace(/ \(.*\)/, ""))}</span>`).join('<i>›</i>');
  const link = id === "jesus" ? "" : ca ? `<p class="small"><b>Link to Jesus:</b> ${esc(pName(id))} and Jesus share the same ancestor, <b>${esc(lName(ca))}</b>.${note ? " " + esc(note) : ""}</p>` : `<p class="small"><b>Link to Jesus:</b> ${esc(note || "In Jesus’ own family line.")}</p>`;
  return `<button class="pp-fam" data-trace="${id}"><div class="pp-fam-h"><span class="label">Family line</span><span class="muted small">back to Adam &amp; Eve</span></div>
    <div class="pp-trail">${trail}</div>${link}<span class="pp-fam-go">See the whole family line ${ic("chev","sm")}</span></button>`;
}
function lRows(arr, me, quiet){ // arr top-down; collapse runs of 3+ unnamed links
  let h = "", run = [];
  const flush = () => { if(!run.length) return; if(run.length < 3) run.forEach(x => h += lRow(x, me)); else h += `<li class="pp-gen"><span class="pp-dot sm"></span><span><b>${run.length} generations</b><span class="sub">${run.map(x => esc(lName(x))).join(" → ")}</span></span></li>`; run = []; };
  arr.forEach((x, i) => { const u = PLIN.UP[x]; if(!lKnown(x) && i && i < arr.length - 1 && !(u && u[2])) run.push(x); else { flush(); h += lRow(x, me, quiet && i === 0); } });
  flush(); return h;
}
function lRow(x, me, quiet){
  const u = quiet ? null : PLIN.UP[x], sub = u ? `${u[1]} of ${lName(u[0])}` : quiet ? "" : "The first man and woman";
  const gap = u && u[2] ? `<span class="pp-gap">${esc(u[2])}</span>` : "";
  const inner = `${lKnown(x) ? pMono(x) : `<span class="pp-dot"></span>`}<span><b>${esc(lName(x))}</b><span class="sub">${esc(sub)}</span>${gap}</span>`;
  return `<li class="${x === me ? "me" : ""}${u && u[1] === "descendant" ? " far" : ""}">${lKnown(x) ? `<button data-go="${x}">${inner}</button>` : `<div>${inner}</div>`}</li>`;
}
function drawTrace(id){
  const body = $("#ppBody"), up = lUp(id), [toJ, ca] = lToJesus(id), note = PLIN.JNOTE[id], nm = esc(pName(id));
  let jh = "";
  if(id === "jesus") jh = `<p>${esc(note)}</p>`;
  else if(ca) jh = `<p>${nm} and Jesus share the same ancestor: <b>${esc(lName(ca))}</b>. From there, the line runs down to Jesus:</p>${note ? `<p class="muted">${esc(note)}</p>` : ""}<ol class="pp-tree">${lRows(toJ, "jesus", true)}</ol>`;
  else jh = `<p>Jesus comes from ${nm}’s own family. ${note ? esc(note) : ""}</p><ol class="pp-tree">${lRows(toJ, "jesus", true)}</ol>`;
  body.innerHTML = `<div class="stack"><button class="btn quiet sm" id="ppBack" style="justify-self:start">${ic("back","sm")}Back to ${nm}</button>
    <div class="hello"><h1>${nm}’s family line</h1><p>From Adam and Eve, generation by generation. Tap a name to see that person.</p></div>
    <ol class="pp-tree">${lRows(up, id)}</ol>
    <div class="card pp-tojesus"><span class="label">How ${nm} connects to Jesus</span>${jh}</div></div>`;
  $("#ppBack").onclick = () => { ppl.focus = id; drawWho(); };
  body.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { ppl.focus = b.dataset.go; drawWho(); });
  P_scrollTop();
}
function P_scrollTop(){ const b = ppl && ppl.ov && ppl.ov.querySelector(".pp-body"); if(b) b.scrollTop = 0; }
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
      <div class="ppd-facts">${p.facts.map(f => `<span>${esc(f)}</span>`).join("")}</div><p class="ppd-hint">${ic("back","sm")} Swipe up · ${p.cards.length} moments from ${esc(p.name.split(" (")[0])}’s life · about ${artMin(p)} min</p>
      <button class="ppd-morebtn" data-listen-p="${p.id}" id="lp-${p.id}" hidden>${SPK}<span>Listen to ${esc(p.name.split(" (")[0])}’s story</span></button>
      <button class="ppd-morebtn" data-more="-1">${ic("book","sm")}<span>Read ${esc(p.name.split(" (")[0])}’s full story · ${artMin(p)} min</span></button>
      <button class="ppd-morebtn ppd-whobtn" data-who="${id}">${MAPIC}<span>See ${esc(p.name.split(" (")[0])} on the Who’s Who map</span></button></div></section>`,
    ...p.cards.map((c, i) => `<section class="scn-slide ppd-card"><div class="scn-art"><img class="bg" src="${art}" alt=""></div>
      <div class="ppd-box"><span class="ppd-step num">${i + 1} / ${p.cards.length}</span><h3>${esc(c.h)}</h3><p>${esc(c.t)}</p>
        ${c.more ? `<button class="ppd-morebtn" data-more="${i}">${ic("book","sm")}<span>Read the full story</span></button>` : ""}
        ${c.ref ? `<button class="ppd-ref" data-b="${esc(c.ref[0])}" data-c="${c.ref[1]}">Read it in the Bible · ${esc(c.ref[0] === "Psalms" ? "Psalm " + hebPs(c.ref[1]) : bookLabel(c.ref[0]) + " " + c.ref[1])}</button>` : ""}</div></section>`),
    `<section class="scn-slide ppd-card"><div class="scn-art"><img class="bg" src="${art}" alt=""></div>
      <div class="ppd-box ppd-end">
        ${conn.length ? `<h3>Connected to</h3><div class="ppd-conn">${conn.map(([g, o]) => `<button data-who="${o}" style="border-color:${PREL_COLOR[g]}">${esc(pName(o))}<small>${esc(g)}</small></button>`).join("")}</div>` : ""}
        <h3>Read it in the Bible</h3><div class="ppd-reads">${p.cards.filter((c, i, a) => c.ref && a.findIndex(x => x.ref && x.ref.join() === c.ref.join()) === i).map(c => `<button data-b="${esc(c.ref[0])}" data-c="${c.ref[1]}">${ic("book","sm")}<span><b>${esc(c.h)}</b><small>${esc(c.ref[0] === "Psalms" ? "Psalm " + hebPs(c.ref[1]) : bookLabel(c.ref[0]) + " " + c.ref[1])}</small></span></button>`).join("")}</div>
        <div class="ppd-btns"><button class="btn primary" data-who="${id}">See ${esc(p.name.split(" (")[0])} on the map</button><button class="btn quiet" data-next="${nx}">Next: ${esc(pName(nx))} ${ic("arrow","sm")}</button></div>
      </div></section>`];
  ov.innerHTML = `<div class="scn-top"><button class="icon-btn scn-x" data-close aria-label="Close">${ic("x")}</button><span class="scn-title">${esc(p.name)}</span><button class="icon-btn scn-map" data-who="${id}" aria-label="Who’s Who map">${MAPIC}</button></div><div class="scn-feed">${slides.join("")}</div>`;
  app.appendChild(ov);
  const feed = ov.querySelector(".scn-feed");
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting && e.intersectionRatio >= .6){ feed.querySelectorAll(".on").forEach(x => x.classList.remove("on")); e.target.classList.add("on"); } }), {root: feed, threshold: [.6]});
  feed.querySelectorAll(".scn-slide").forEach(el => io.observe(el));
  const done = () => { io.disconnect(); ov.remove(); };
  ov.querySelector("[data-close]").onclick = done;
  ov.querySelectorAll("[data-who]").forEach(b => b.onclick = () => { done(); if(!ppl) openPeople("who", b.dataset.who); else { ppl.mode = "who"; ppl.focus = b.dataset.who; ppl.q = ""; drawPeople(); } });
  ov.querySelectorAll("[data-more]").forEach(b => b.onclick = () => openArticle(id, +b.dataset.more));
  ov.querySelectorAll("[data-listen-p]").forEach(b => { pLoad().then(n => { if(n && n[id]) b.hidden = false; }); b.onclick = () => openArticle(id, -1, true); });
  ov.querySelectorAll("[data-next]").forEach(b => b.onclick = () => { done(); openPerson(b.dataset.next); });
  ov.querySelectorAll("[data-b]").forEach(b => b.onclick = () => { done(); if(ppl){ ppl.ov.remove(); ppl = null; } openChapter(b.dataset.b, +b.dataset.c); });
}

function artWords(p){ return [...(p.intro || []), ...(p.outro || [])].reduce((n, s) => n + s[1].split(" ").length, 0) + p.cards.reduce((n, c) => n + (c.more || c.t).split(" ").length, 0); }
function artMin(p){ return Math.max(1, Math.round(artWords(p) / 220)); }
let _seenA = new Set(); const paras = t => t.split(/\n\n+/).map(x => `<p>${linkNames(esc(x.trim()), _seenA, _skipA)}</p>`).join(""); let _skipA = "";
const SPK = `<svg class="ico" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`.replace("<svg","<svg class=\"ico sm\""); let _PN = null; const pLoad = () => _PN ? Promise.resolve(_PN) : fetch("people/narr.json").then(r => r.json()).then(d => (_PN = d)).catch(() => null);
function openArticle(id, at, listen){
  const p = PP[id]; if(!p) return; _seenA = new Set(); _skipA = id;
  const art = pArt(p) || "scenes/" + (PCATS.find(c => c.key === p.cat) || {}).art + ".jpg";
  const ov = document.createElement("div"); ov.className = "overlay art"; ov.id = "article";
  const refLink = r => r ? `<button class="art-ref" data-b="${esc(r[0])}" data-c="${r[1]}">${ic("book","sm")}Read it in the Bible · ${esc(r[0] === "Psalms" ? "Psalm " + hebPs(r[1]) : bookLabel(r[0]) + " " + r[1])}</button>` : "";
  const toc = [...(p.intro || []).map(s => s[0]), ...p.cards.map(c => c.h), ...(p.outro || []).map(s => s[0])];
  ov.innerHTML = `<div class="art-top"><button class="icon-btn" data-close aria-label="Close">${ic("back")}</button><span class="art-t">${esc(p.name)}</span><span class="art-min num">${artMin(p)} min read</span><button class="art-map" data-map aria-label="Show on the Who’s Who map">${MAPIC}</button><button class="art-listen" data-listen hidden>${SPK}<span>Listen</span></button><i class="art-prog"></i></div>
    <div class="art-body" id="artBody">
      <header class="art-hero"><img src="${art}" alt=""><div><span class="label">${esc((PCATS.find(c => c.key === p.cat) || {}).title || "")}</span><h1>${esc(p.name)}</h1><p>${esc(p.role)}</p></div></header>
      <details class="art-toc"><summary>In this story · ${toc.length} parts</summary><ol>${toc.map((t, i) => `<li><button data-go="${i}">${esc(t)}</button></li>`).join("")}</ol></details>
      ${(p.intro || []).map((s, i) => `<section class="art-sec" data-s="${i}"><h2>${esc(s[0])}</h2>${paras(s[1])}${refLink(s[2])}</section>`).join("")}
      ${p.cards.map((c, i) => `<section class="art-sec" data-s="${(p.intro || []).length + i}" data-card="${i}"><span class="art-n num">${i + 1} of ${p.cards.length}</span><h2>${esc(c.h)}</h2>${paras(c.more || c.t)}${refLink(c.ref)}</section>`).join("")}
      ${(p.outro || []).map((s, i) => `<section class="art-sec" data-s="${(p.intro || []).length + p.cards.length + i}"><h2>${esc(s[0])}</h2>${paras(s[1])}${refLink(s[2])}</section>`).join("")}
      <div class="art-end"><button class="btn primary block" data-close>Back to the cards</button></div>
    </div>`;
  app.appendChild(ov);
  const body = ov.querySelector("#artBody"), bar = ov.querySelector(".art-prog");
  body.onscroll = () => { bar.style.width = (body.scrollTop / Math.max(1, body.scrollHeight - body.clientHeight) * 100) + "%"; };
  const go = s => { const el = body.querySelector(`[data-s="${s}"]`); if(el) body.scrollTop = el.offsetTop - body.offsetTop - 6; };
  if(at >= 0) requestAnimationFrame(() => go((p.intro || []).length + at));
  const lb = ov.querySelector("[data-listen]"); let pa = null, cur = -1, raf = 0, N = null;
  const stop = () => { cancelAnimationFrame(raf); if(pa){ pa.pause(); pa = null; } lb.classList.remove("on"); lb.querySelector("span").textContent = "Listen"; };
  const tick = () => { if(!pa) return; const t = pa.currentTime; let k = 0; for(let i = 0; i < N.times.length; i++) if(t >= N.times[i][0] - .05) k = i; const sc = N.sec[k];
    if(sc !== cur){ cur = sc; body.querySelectorAll(".art-sec").forEach(s => s.classList.toggle("cur", +s.dataset.s === sc)); if(!body._u) go(sc); }
    raf = requestAnimationFrame(tick); };
  const play = () => { if(!N) return; if(!pa){ pa = new Audio("people/v/" + id + ".mp3"); pa.onended = stop; cur = -1; }
    pa.play().catch(() => {}); lb.classList.add("on"); lb.querySelector("span").textContent = "Pause"; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
  lb.onclick = () => { if(pa && !pa.paused){ pa.pause(); cancelAnimationFrame(raf); lb.querySelector("span").textContent = "Listen"; lb.classList.remove("on"); } else play(); };
  body.addEventListener("touchstart", () => { body._u = 1; clearTimeout(body._ut); body._ut = setTimeout(() => body._u = 0, 4000); }, {passive: true});
  pLoad().then(n => { if(n && n[id]){ N = n[id]; lb.hidden = false; if(listen) play(); } });
  new MutationObserver(() => { if(!ov.isConnected) stop(); }).observe(app, {childList: true});
  ov.querySelectorAll("[data-close]").forEach(b => b.onclick = () => ov.remove());
  const mb = ov.querySelector("[data-map]"); if(mb) mb.onclick = () => { ov.remove(); if(ppl){ ppl.mode = "who"; ppl.focus = id; ppl.q = ""; drawPeople(); } else openPeople("who", id); };
  ov.querySelectorAll(".pl").forEach(b => b.onclick = () => openPerson(b.dataset.p));
  ov.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { b.closest("details").open = false; go(+b.dataset.go); });
  ov.querySelectorAll("[data-b]").forEach(b => b.onclick = () => { ov.remove(); const per = document.getElementById("person"); if(per) per.remove(); if(ppl){ ppl.ov.remove(); ppl = null; } openChapter(b.dataset.b, +b.dataset.c); });
}
