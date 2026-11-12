import { chromium } from 'playwright';
const b = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const out = [];
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: label === 'mobile' ? 2 : 1 });
  const p = await ctx.newPage();
  for (const url of ['/', '/suite.html']) {
    await p.goto(''+(process.env.PREVIEW_URL||'http://127.0.0.1:4173')+'' + url, { waitUntil: 'networkidle' });
    const info = await p.evaluate(() => {
      const h = document.querySelector('header'); const hs = getComputedStyle(h);
      return { pos: hs.position, z: hs.zIndex, h: Math.round(h.getBoundingClientRect().height), spt: getComputedStyle(document.documentElement).scrollPaddingTop, smt: getComputedStyle(document.querySelector('#contact')).scrollMarginTop };
    });
    out.push(`${label} ${url} header ${JSON.stringify(info)}`);
    // Scroll the Connector section into view naturally, then check what is at the points of its content
    const hit = await p.evaluate(async () => {
      const s = document.querySelector('#connector'); document.documentElement.style.scrollBehavior='auto'; s.scrollIntoView({ block: 'center', behavior: 'instant' }); await new Promise(r => setTimeout(r, 500));
      const r = s.getBoundingClientRect(); const hh = document.querySelector('header').getBoundingClientRect().height;
      const pts = [...s.querySelectorAll('h2, .connector-copy .lead')].map(e => { const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const top = document.elementFromPoint(x, y); return { el: e.className || e.tagName, y: Math.round(b.top), coveredByHeader: !!top?.closest('header'), hit: top === e || e.contains(top) }; });
      return { stripTop: Math.round(r.top), headerH: Math.round(hh), pts };
    });
    out.push(`  strip centred: top=${hit.stripTop} header=${hit.headerH} ` + hit.pts.map(x => `${x.el.split(' ')[0]}@${x.y}:${x.hit ? 'clear' : 'COVERED'}${x.coveredByHeader ? '(header)' : ''}`).join(' '));
    // Anchor jumps: where does the target heading land relative to the header bottom?
    for (const a of ['#contact', '#suite', '#journey', '#products']) {
      if (!(await p.$(a))) continue;
      const r = await p.evaluate(async (sel) => { history.replaceState(null,'',location.pathname); window.scrollTo(0,0); await new Promise(r=>setTimeout(r,100)); const link = document.querySelector(`a[href="${sel}"]`); if(!link) return null; link.click(); await new Promise(r=>setTimeout(r,1200)); const t = document.querySelector(sel); const hb = document.querySelector('header').getBoundingClientRect().bottom; const top = t.getBoundingClientRect().top; const hd = t.querySelector('h1,h2,h3'); const hdTop = hd ? hd.getBoundingClientRect().top : top; return { sectionTop: Math.round(top), headingTop: Math.round(hdTop), headerBottom: Math.round(hb), headingHiddenByHeader: hdTop < hb }; }, a);
      if (r) out.push(`  anchor ${a}: ${JSON.stringify(r)}`);
    }
  }
  await ctx.close();
}
await b.close();
console.log(out.join('\n'));
