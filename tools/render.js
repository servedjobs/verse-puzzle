const { chromium } = require('playwright');
const fs = require('fs');
const f = p => fs.readFileSync(p).toString('base64');
const font = `@font-face{font-family:G;font-weight:700;src:url(data:font/woff2;base64,${f('node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff2')})}`;
let svg = fs.readFileSync('icon.svg','utf8').replace(/font-family="[^"]*"/, 'font-family="G"');
const bgPart = svg.match(/<g id="BG">[\s\S]*?<\/g>/)[0];
const fgPart = svg.match(/<g id="FG">[\s\S]*<\/g>\s*<\/svg>/)[0].replace(/<\/svg>$/,'');
const defs = svg.match(/<defs>[\s\S]*?<\/defs>/)[0];
const wrap = (inner, size, bg='transparent') => `<html><head><style>${font}html,body{margin:0;background:${bg}}svg{display:block}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="${size}" height="${size}">${defs}${inner}</svg></body></html>`;
const jobs = [
  ['../assets/icon-only.png', 1024, bgPart + `<g transform="translate(512 512) scale(1.22) translate(-512 -512)">${fgPart}</g>`],
  ['../assets/icon-background.png', 1024, bgPart],
  // adaptive foreground: shrink art into the safe zone
  ['../assets/icon-foreground.png', 1024, `<g transform="translate(512 512) scale(1.08) translate(-512 -512)">${fgPart}</g>`],
  ['play-icon-512.png', 512, bgPart + `<g transform="translate(512 512) scale(1.22) translate(-512 -512)">${fgPart}</g>`],
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const [out, size, inner] of jobs) {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(wrap(inner, size)); await p.waitForTimeout(150);
    await p.screenshot({ path: out, omitBackground: true });
  }
  // splash: midnight with the tiles small in the middle
  for (const [out, bg] of [['../assets/splash.png','#1d2b4a'],['../assets/splash-dark.png','#0d1322']]) {
    await p.setViewportSize({ width: 2732, height: 2732 });
    await p.setContent(`<html><head><style>${font}html,body{margin:0;background:${bg}}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732" width="2732" height="2732">${defs}<g transform="translate(1366 1366) scale(.62) translate(-512 -512)">${fgPart}</g></svg></body></html>`);
    await p.waitForTimeout(150); await p.screenshot({ path: out });
  }
  await b.close();
})();
