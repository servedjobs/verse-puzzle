const { chromium } = require('playwright');
const fs = require('fs');
const f = p => fs.readFileSync(p).toString('base64');
const ff = (fam, w, file) => `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/woff2;base64,${f(file)})}`;
const FONTS = [
  ff('Noto Serif',400,'node_modules/@fontsource/noto-serif/files/noto-serif-latin-400-normal.woff2'),
  ff('Noto Serif',600,'node_modules/@fontsource/noto-serif/files/noto-serif-latin-600-normal.woff2'),
  ff('Noto Serif',700,'node_modules/@fontsource/noto-serif/files/noto-serif-latin-700-normal.woff2'),
  ff('Roboto',400,'node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2'),
  ff('Roboto',500,'node_modules/@fontsource/roboto/files/roboto-latin-500-normal.woff2'),
  ff('Roboto',700,'node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff2'),
].join('');
const GAR = ff('G',600,'node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-600-normal.woff2');
const today = new Date(); const d = x => x.toISOString().slice(0,10);
const yest = new Date(Date.now()-864e5);
const state = { coached:true, streak:12, best:12, freezes:1, hints:4, solved:46, last:d(yest), dailyDone:'',
  lv:{order:7,crypto:4,search:5}, sound:false, haptics:true, remind:true };
const url = 'file:///home/claude/verse-puzzle/www/index.html';
async function page(b, dark){
  const ctx = await b.newContext({ viewport:{width:360,height:640}, deviceScaleFactor:3, colorScheme: dark?'dark':'light', isMobile:true, hasTouch:true });
  await ctx.addInitScript(s => { localStorage.setItem('versepuzzle.v1', s); }, JSON.stringify(state));
  const p = await ctx.newPage(); await p.goto(url);
  await p.addStyleTag({ content: FONTS + `:root{--serif:'Noto Serif',serif !important;--sans:'Roboto',sans-serif !important} .toast{display:none!important}` });
  await p.waitForTimeout(400); return p;
}
async function fillOrder(p, upto){
  for (let guard=0; guard<400; guard++){
    const placed = await p.locator('.slots .word').count(), total = await p.locator('.slots > *').count();
    if (placed/total >= upto) return;
    const tiles = p.locator('.tiles .tile:not(.used)'); const n = await tiles.count(); if(!n) return;
    for (let i=0;i<n;i++){ const before = await p.locator('.slots .word').count(); await tiles.nth(i).click({force:true}); await p.waitForTimeout(60);
      if ((await p.locator('.slots .word').count())>before) break; }
  }
}
(async () => {
  const b = await chromium.launch(); const out = n => `raw-${n}.png`;
  let p = await page(b,false); await p.screenshot({path:out('home')});
  await p.click('[data-mode="order"]'); await p.waitForTimeout(300); await fillOrder(p,0.55); await p.waitForTimeout(1800); await p.screenshot({path:out('order')});
  await p.click('#back'); await p.waitForTimeout(200); await p.click('[data-mode="crypto"]'); await p.waitForTimeout(400); await p.screenshot({path:out('crypto')});
  await p.click('#back'); await p.waitForTimeout(200); await p.click('[data-mode="search"]'); await p.waitForTimeout(400); await p.screenshot({path:out('search')});
  await p.click('#back'); await p.waitForTimeout(200);
  // daily verse solved -> done screen
  await p.click('#daily'); await p.waitForTimeout(300);
  if (await p.locator('.tiles').count()) { await fillOrder(p,1.01); await p.waitForTimeout(2600); await p.screenshot({path:out('done')}); }
  else console.log('daily is not builder; skipping done');
  await p.context().close();
  p = await page(b,true); await p.screenshot({path:out('home-dark')}); await p.context().close();
  await b.close();
})();
