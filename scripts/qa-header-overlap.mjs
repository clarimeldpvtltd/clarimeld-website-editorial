// Sticky-header obstruction checks. Every target listed in TARGETS is REQUIRED: a missing link, section or heading is a failure,
// not a skip. Exit status is 0 only if every assertion passes.
// Usage: serve the build, then  PREVIEW_URL=http://127.0.0.1:4173 node scripts/qa-header-overlap.mjs   (needs Playwright; optional CHROME_PATH)
// Targets were taken from the built pages: #contact exists on all five pages; #products only on Home; #journey and the
// Connector section (#connector with an h2 and a .connector-copy .lead) only on Home and Suite.
import { chromium } from 'playwright';

const B = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const TARGETS = {
  '/': { anchors: ['#contact', '#products'], connector: true },
  '/suite.html': { anchors: ['#contact', '#journey'], connector: true },
  '/pm-os.html': { anchors: ['#contact'], connector: false },
  '/writer-os.html': { anchors: ['#contact'], connector: false },
  '/public-os.html': { anchors: ['#contact'], connector: false },
};
const VIEWPORTS = [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]];

const out = []; let failed = 0;
const ok = (name, cond, detail = '') => { if (!cond) failed++; out.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };

const b = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });

// Installed into every page before it loads (init scripts are not subject to the page's CSP): waits until the scroll position
// has stopped changing, so the checks do not depend on how long smooth scrolling takes.
const installSettle = () => {
  window.__settle = async () => {
    let last = -1, still = 0; const t0 = performance.now();
    while (still < 4 && performance.now() - t0 < 5000) { await new Promise((r) => setTimeout(r, 100)); const y = window.scrollY; still = y === last ? still + 1 : 0; last = y; }
  };
};

for (const [label, vp] of VIEWPORTS) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: label === 'mobile' ? 2 : 1 });
  const p = await ctx.newPage(); await p.addInitScript(installSettle);
  for (const [url, spec] of Object.entries(TARGETS)) {
    const tag = `${label} ${url}`;
    await p.goto(B + url, { waitUntil: 'networkidle' });

    const hdr = await p.evaluate(() => {
      const h = document.querySelector('header'); if (!h) return null;
      return { pos: getComputedStyle(h).position, h: h.getBoundingClientRect().height, spt: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0 };
    });
    ok(`${tag}: header element exists`, !!hdr);
    if (!hdr) continue;
    ok(`${tag}: header is sticky or fixed, and scroll-padding-top clears it`, ['sticky', 'fixed'].includes(hdr.pos) && hdr.spt >= hdr.h, JSON.stringify(hdr));

    // In-page anchor links: after the jump the target's first heading must sit below the header and inside the viewport.
    for (const a of spec.anchors) {
      const r = await p.evaluate(async (sel) => {
        const settle = window.__settle;
        history.replaceState(null, '', location.pathname); window.scrollTo(0, 0); await settle();
        const link = document.querySelector(`a[href="${sel}"]`); const target = document.querySelector(sel);
        const heading = target?.querySelector('h1, h2, h3');
        if (!link || !target || !heading) return { link: !!link, target: !!target, heading: !!heading };
        link.click(); await settle();
        const hb = document.querySelector('header').getBoundingClientRect().bottom; const hr = heading.getBoundingClientRect();
        return { link: true, target: true, heading: true, sectionTop: Math.round(target.getBoundingClientRect().top), headingTop: Math.round(hr.top), headingBottom: Math.round(hr.bottom), headerBottom: Math.round(hb), viewportH: innerHeight, hash: location.hash };
      }, a);
      if (!r.link || !r.target || !r.heading) { ok(`${tag}: anchor ${a} has a link, a target and a heading`, false, JSON.stringify(r)); continue; }
      ok(`${tag}: anchor ${a} lands with its heading below the header`, r.hash === a && r.headingTop >= r.headerBottom - 0.5 && r.headingBottom <= r.viewportH, JSON.stringify(r));
    }

    if (!spec.connector) continue;

    // Connector section reached the way the browser reaches any #hash: the site's own scroll-padding decides the position.
    const hj = await p.evaluate(async () => {
      const settle = window.__settle;
      history.replaceState(null, '', location.pathname); window.scrollTo(0, 0); await settle();
      const h2 = document.querySelector('#connector h2'); if (!h2) return null;
      location.hash = '#connector'; await settle();
      const hb = document.querySelector('header').getBoundingClientRect().bottom; const r = h2.getBoundingClientRect();
      return { headingTop: Math.round(r.top), headingBottom: Math.round(r.bottom), headerBottom: Math.round(hb), viewportH: innerHeight };
    });
    ok(`${tag}: #connector hash jump leaves its h2 below the header`, !!hj && hj.headingTop >= hj.headerBottom - 0.5 && hj.headingBottom <= hj.viewportH, JSON.stringify(hj));

    // Each Connector heading/lead is scrolled to the middle of the viewport; every corner and the centre of its box must
    // hit the element itself (not the header), and the box must not intersect the header. Content that the
    // section's own scroll position leaves outside the viewport is not tested here, so it is never counted as obstructed.
    for (const sel of ['#connector h2', '#connector .connector-copy .lead']) {
      const r = await p.evaluate(async (sel) => {
        const settle = window.__settle;
        const el = document.querySelector(sel); if (!el) return null;
        el.scrollIntoView({ block: 'center', behavior: 'instant' }); await settle();
        const hb = document.querySelector('header').getBoundingClientRect().bottom; const b = el.getBoundingClientRect();
        const xs = [b.left + 1, b.left + b.width / 2, b.right - 1], ys = [b.top + 1, b.top + b.height / 2, b.bottom - 1];
        const pts = []; for (const x of xs) for (const y of ys) { const hit = document.elementFromPoint(x, y); pts.push({ x: Math.round(x), y: Math.round(y), clear: !!hit && (hit === el || el.contains(hit)), header: !!hit?.closest('header') }); }
        return { top: Math.round(b.top), bottom: Math.round(b.bottom), headerBottom: Math.round(hb), viewportH: innerHeight, fits: b.top >= hb && b.bottom <= innerHeight, blocked: pts.filter((q) => !q.clear).map((q) => `${q.x},${q.y}${q.header ? '(header)' : ''}`) };
      }, sel);
      ok(`${tag}: ${sel} exists, fits below the header when centred, and all 9 probe points are unobstructed`, !!r && r.fits && r.blocked.length === 0, JSON.stringify(r));
    }
  }
  await ctx.close();
}
await b.close();

console.log(out.join('\n'));
console.log(`\n${out.length - failed} passed, ${failed} failed`);
process.exitCode = failed || !out.length ? 1 : 0;
