// Internal-clipping audit for every illustrated product card (.app) on every page, in normal, reduced-motion and no-JavaScript modes, at five widths.
// It checks content inside each card, not just page-level overflow: descendants outside the card, scroll-clipped boxes, ellipsised text.
// Usage: serve the build, then  PREVIEW_URL=http://127.0.0.1:4173 node scripts/qa-card-clipping.mjs   (needs Playwright; optional CHROME_PATH)
import { chromium } from 'playwright';
const B = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const b = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : {}) });
const pages=['/','/suite.html','/pm-os.html','/writer-os.html','/public-os.html']; const widths=[1440,1024,768,390,320];
const detect = () => { const res=[]; const apps=[...document.querySelectorAll('.app')].filter(a=>a.offsetParent!==null&&a.getBoundingClientRect().width>0);
  for (const app of apps) { const ar=app.getBoundingClientRect(); const bad=[];
    for (const el of app.querySelectorAll('*')) { if (el.closest('.sr-only')) continue; const r=el.getBoundingClientRect(); if(!r.width||!r.height) continue; const cs=getComputedStyle(el);
      if (r.right>ar.right+0.5||r.left<ar.left-0.5) bad.push('outside '+String(el.className?.baseVal ?? el.className ?? el.tagName)+' '+Math.round(r.right-ar.right));
      if (el.clientWidth>0 && el.scrollWidth>el.clientWidth+1 && cs.overflowX!=='visible') bad.push('scroll '+el.className);
      if (cs.textOverflow==='ellipsis' && el.scrollWidth>el.clientWidth) bad.push('ellipsis '+el.textContent.slice(0,30)); }
    // text clipped by app's own overflow:hidden (vertical)
    if (app.scrollHeight>app.clientHeight+1) bad.push('app-vscroll');
    res.push({t:(app.querySelector('.app-title')?.textContent||'').slice(0,40), w:Math.round(ar.width), bad:[...new Set(bad)]}); }
  return res; };
let total=0, fails=0; const lines=[];
for (const mode of ['normal','reduced','nojs']) for (const w of widths) for (const u of pages) {
  const ctx = await b.newContext({viewport:{width:w,height:900},reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='nojs'});
  const p = await ctx.newPage(); await p.goto(B+u,{waitUntil:'load'}); await p.waitForTimeout(500);
  let results=[];
  if (mode==='nojs') results=await p.evaluate(detect);
  else { const n=(await p.$$('[role=tab]')).length; if(!n) results=await p.evaluate(detect); else for(let i=0;i<n;i++){ await p.evaluate((i)=>{const t=document.querySelectorAll('[role=tab]')[i]; t.click();},i); await p.waitForTimeout(250); results.push(...await p.evaluate(detect)); } }
  for (const r of results){ total++; if(r.bad.length){fails++; lines.push(`${mode} ${w} ${u} "${r.t}" w=${r.w}: ${r.bad.slice(0,4).join(' | ')}`);} }
  await ctx.close();
}
console.log(`cards checked: ${total}, with internal clipping: ${fails}`); console.log([...new Set(lines)].slice(0,40).join('\n')); await b.close();

process.exit(fails ? 1 : 0);
