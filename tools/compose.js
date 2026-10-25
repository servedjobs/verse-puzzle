const { chromium } = require('playwright'); const fs=require('fs');
const b64=p=>fs.readFileSync(p).toString('base64');
const GAR=`@font-face{font-family:G;font-weight:600;src:url(data:font/woff2;base64,${b64('node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-600-normal.woff2')})}
@font-face{font-family:R;font-weight:500;src:url(data:font/woff2;base64,${b64('node_modules/@fontsource/roboto/files/roboto-latin-500-normal.woff2')})}`;
const shots=[['home','One verse a day.','Keep your streak going.'],['order','Put Scripture back in order','Tap the words of the verse'],
 ['crypto','Crack the coded verse','Every number is a letter'],['search','Find the hidden words','Drag across in any direction'],
 ['done','King James Version','No ads. No sign-up. Works offline.'],['home-dark','Easy on the eyes','Light and dark, day or night']];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 let i=1;for(const [n,h,s] of shots){
  await p.setContent(`<html><head><style>${GAR}body{margin:0;width:1080px;height:1920px;overflow:hidden;background:radial-gradient(120% 70% at 50% 0%,#2a3d66,#141d33);font-family:G}
  .c{position:absolute;top:120px;left:0;right:0;text-align:center} h1{margin:0;color:#f6f1e4;font-weight:600;font-size:84px;line-height:1.05;letter-spacing:.005em}
  p{margin:22px 0 0;color:#d9a648;font:500 40px R}
  img{position:absolute;left:50%;top:420px;width:860px;transform:translateX(-50%);border-radius:56px;box-shadow:0 40px 90px rgba(0,0,0,.45);outline:10px solid rgba(255,255,255,.08)}
  </style></head><body><div class="c"><h1>${h}</h1><p>${s}</p></div><img src="data:image/png;base64,${b64('raw-'+n+'.png')}"></body></html>`);
  await p.waitForTimeout(200); await p.screenshot({path:`../store/screenshots/phone-${i++}-${n}.png`});}
 // feature graphic 1024x500
 await p.setViewportSize({width:1024,height:500});
 await p.setContent(`<html><head><style>${GAR}body{margin:0;width:1024px;height:500px;overflow:hidden;background:radial-gradient(90% 120% at 20% 30%,#2a3d66,#141d33);font-family:G;position:relative}
 .ic{position:absolute;left:70px;top:150px;width:200px;height:200px;border-radius:44px;box-shadow:0 20px 50px rgba(0,0,0,.4)}
 h1{position:absolute;left:300px;top:160px;margin:0;color:#f6f1e4;font-size:86px;font-weight:600;line-height:1}
 p{position:absolute;left:304px;top:262px;margin:0;color:#d9a648;font:500 28px R}
 .ph{position:absolute;right:-40px;top:40px;width:300px;border-radius:30px;transform:rotate(8deg);box-shadow:0 30px 60px rgba(0,0,0,.5)}
 </style></head><body><img class="ic" src="data:image/png;base64,${b64('play-icon-512.png')}"><h1>Verse Puzzle</h1><p>Daily Bible verse puzzles · KJV</p>
 <img class="ph" src="data:image/png;base64,${b64('raw-done.png')}"></body></html>`);
 await p.waitForTimeout(200); await p.screenshot({path:'../store/feature-graphic-1024x500.png'});
 fs.copyFileSync('play-icon-512.png','../store/app-icon-512.png');
 await b.close();})();
