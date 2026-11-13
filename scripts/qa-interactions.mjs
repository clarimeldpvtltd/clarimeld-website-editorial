// Browser checks for the built site (links, history, keyboard, contact link, motion, no-JS).
// Needs Playwright, which is NOT a project dependency: see scripts/run-qa.mjs for how to make it resolvable. Exit status: 0 only if every assertion passed.
// Usage: serve the build (npm run preview), then  PREVIEW_URL=http://127.0.0.1:4173 node scripts/qa-interactions.mjs
// Optional: CHROME_PATH to use an installed Chrome.
import { chromium } from 'playwright';
const B = ''+(process.env.PREVIEW_URL||'http://127.0.0.1:4173')+'';
const b = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const results = []; let failed = 0; const ok = (n, c, d = '') => { if (!c) failed++; results.push(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

// Links on all pages
const pages = ['/', '/pm-os.html', '/writer-os.html', '/public-os.html', '/suite.html'];
let broken = [];
for (const p of pages) {
  await page.goto(B + p, { waitUntil: 'networkidle' });
  const links = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
  for (const h of new Set(links)) {
    if (h.startsWith('mailto:')) continue;
    if (h.startsWith('#')) { const id = h.slice(1); if (id && !(await page.$(`#${id}`))) broken.push(`${p} -> ${h}`); continue; }
    const r = await page.request.get(B + h.split('#')[0]); if (r.status() >= 400) broken.push(`${p} -> ${h} (${r.status()})`);
  }
  // DEFERRED: a lazy image that has not been triggered to load yet reads as broken here (complete/naturalWidth); a logo-loading check needs to trigger loading and wait first.
  const imgs = await page.$$eval('img', (is) => is.map((i) => i.complete && i.naturalWidth > 0));
  if (imgs.includes(false)) broken.push(`${p} broken image`);
}
ok('Internal links, anchors and images resolve on all 5 pages', broken.length === 0, broken.join('; '));

// Direct loads + Back/Forward
await page.goto(B + '/writer-os.html'); ok('Direct load of /writer-os.html', (await page.title()).includes('Writer OS'));
await page.click('.primary-nav >> text=Suite'); await page.waitForURL('**/suite.html');
await page.goBack(); ok('Back returns to Writer OS', page.url().endsWith('/writer-os.html'));
await page.goForward(); ok('Forward returns to Suite', page.url().endsWith('/suite.html'));
ok('Nav marks current page', (await page.getAttribute('.primary-nav a[aria-current="page"]', 'href')) === '/suite.html');

// Journey tabs keyboard
await page.goto(B + '/suite.html', { waitUntil: 'networkidle' });
await page.focus('#journey-tab-0'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
const sel = await page.$$eval('#journey [role=tab]', (t) => t.findIndex((x) => x.getAttribute('aria-selected') === 'true'));
const vis = await page.$$eval('#journey [role=tabpanel]', (p) => p.map((x) => !x.hidden));
ok('Journey: arrow keys move through steps; one panel visible', sel === 2 && vis.filter(Boolean).length === 1 && vis[2], `selected=${sel}`);
await page.keyboard.press('End'); ok('Journey: End key selects last step (9)', (await page.getAttribute('#journey-tab-8', 'aria-selected')) === 'true');
await page.keyboard.press('Home'); ok('Journey: Home key selects first step', (await page.getAttribute('#journey-tab-0', 'aria-selected')) === 'true');
// Overview chips jump to the matching step, move focus to its panel, and the optional branch opens by keyboard
await page.click('#journey .stage-chip[data-goto="6"]');
ok('Journey overview: stage chip opens step 7', (await page.getAttribute('#journey-tab-6', 'aria-selected')) === 'true' && (await page.$eval('#journey-panel-6', (e) => !e.hidden)));
ok('Journey overview: focus moves to the opened panel', (await page.evaluate(() => document.activeElement?.id)) === 'journey-panel-6');
await page.click('#journey-panel-6 .j-branch summary');
ok('Journey: optional branch opens and shows its text', await page.$eval('#journey-panel-6 .j-branch', (d) => d.open && d.querySelector('p').offsetHeight > 0));
await page.click('#journey .suite-link[href="#journey-panel-8"]');
ok('Journey overview: Suite link opens step 9', (await page.getAttribute('#journey-tab-8', 'aria-selected')) === 'true');
ok('Journey overview: 15 documented stages in 3 lanes, 4 optional Suite links', (await page.$$eval('#journey .lane .stage-chip', (c) => c.length)) === 15 && (await page.$$eval('#journey .lane', (c) => c.length)) === 3 && (await page.$$eval('#journey .suite-link', (c) => c.length)) === 4);
// Topology toggle
await page.click('[data-topology-mode=connected]'); ok('Suite toggle switches to connected', (await page.getAttribute('[data-topology]', 'data-state')) === 'connected');

// Home toggle
await page.goto(B + '/', { waitUntil: 'networkidle' });
await page.click('[data-gap-mode=connected]'); ok('Home Separate/Connected toggle', (await page.getAttribute('.gap-diagram', 'data-state')) === 'connected' && (await page.getAttribute('[data-gap-mode=connected]', 'aria-pressed')) === 'true');

// Contact section (the demo form was removed: the site has no contact form; visitors write from their own mail app)
let requests = []; page.on('request', (r) => { if (r.method() !== 'GET') requests.push(r.url()); });
for (const [url, subject] of [['/', null], ['/pm-os.html', 'Interest in PM OS'], ['/writer-os.html', 'Interest in Writer OS'], ['/public-os.html', 'Interest in Public OS'], ['/suite.html', 'Interest in Clarimeld Suite']]) {
  await page.goto(B + url, { waitUntil: 'networkidle' });
  const mail = await page.$$eval('#contact a.contact-mail', (a) => a.map((x) => ({ href: x.getAttribute('href'), text: x.textContent.trim() })));
  const expectHref = 'mailto:info@clarimeld.com' + (subject ? '?subject=' + encodeURIComponent(subject) : '');
  ok(`Contact on ${url}: one mailto link to info@clarimeld.com${subject ? ' with the product subject' : ''}`, mail.length === 1 && mail[0].href === expectHref && mail[0].text === 'info@clarimeld.com', JSON.stringify(mail));
  ok(`Contact on ${url}: no form, input or submit control on the page`, (await page.$$('form, input, textarea, select, button[type=submit]')).length === 0);
  ok(`Contact on ${url}: header and hero Contact links point at #contact`, (await page.$$eval('a[href="#contact"]', (a) => a.length)) >= 3);
  ok(`Contact on ${url}: no "early access" wording remains`, !/early[- ]access/i.test(await page.evaluate(() => document.body.innerText + document.title)));
}
await page.goto(B + '/', { waitUntil: 'networkidle' });
await page.click('.header-actions a[href="#contact"]'); await page.waitForTimeout(2200);
ok('Header Contact button scrolls to the contact section', (await page.evaluate(() => location.hash)) === '#contact' && (await page.$eval('#contact', (e) => e.getBoundingClientRect().top)) < 400);
ok('No non-GET network requests were made', requests.length === 0);

// Motion toggle on every page
for (const p of pages) {
  await page.goto(B + p, { waitUntil: 'networkidle' });
  await page.click('[data-motion-toggle]');
  const s = await page.evaluate(() => ({ m: document.documentElement.dataset.motion, l: document.querySelector('[data-motion-label]').textContent, a: document.querySelector('[data-motion-toggle]').getAttribute('aria-pressed') }));
  if (!(s.m === 'paused' && s.l === 'Resume motion' && s.a === 'true')) ok(`Motion toggle on ${p}`, false, JSON.stringify(s));
  await page.click('[data-motion-toggle]');
}
ok('Motion toggle works and relabels on all 5 pages', !results.some((r) => r.includes('Motion toggle on')));

// Mobile drawer
const m = await b.newContext({ viewport: { width: 390, height: 844 } }); const mp = await m.newPage();
await mp.goto(B + '/', { waitUntil: 'networkidle' });
await mp.click('#menu-btn'); ok('Mobile drawer opens', (await mp.getAttribute('#menu-btn', 'aria-expanded')) === 'true');
await mp.keyboard.press('Escape'); ok('Escape closes drawer and returns focus', (await mp.getAttribute('#menu-btn', 'aria-expanded')) === 'false' && (await mp.evaluate(() => document.activeElement?.id)) === 'menu-btn');
ok('Mobile header: Contact button on one line', await mp.$eval('.header-actions .btn', (e) => e.getBoundingClientRect().height < 48));

// Mobile journey: collapsible lanes, Prev/Next, live step counter
{
  const jm = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const jp = await jm.newPage();
  await jp.goto(B + '/', { waitUntil: 'networkidle' });
  ok('Mobile journey: lanes and Suite links start collapsed', (await jp.$$eval('#suite details[data-collapsible]', (d) => d.length)) === 4 && (await jp.$$eval('#suite details[data-collapsible]', (d) => d.every((e) => !e.open))));
  await jp.focus('#suite .lane--pm summary'); await jp.keyboard.press('Enter');
  ok('Mobile journey: lane opens from the keyboard and shows its stages', await jp.$eval('#suite .lane--pm', (e) => e.open) && (await jp.$$eval('#suite .lane--pm .stage-chip', (c) => c.length)) === 5);
  await jp.$eval('[data-j-next]', (e) => e.scrollIntoView({ block: 'center' }));
  await jp.click('[data-j-next]');
  ok('Mobile journey: Next moves to step 2 and announces it', /Step 2 of 9/.test(await jp.$eval('[data-j-count]', (e) => e.textContent)) && (await jp.getAttribute('[data-j-count]', 'aria-live')) === 'polite');
  await jp.click('[data-j-prev]');
  ok('Mobile journey: Previous returns to step 1', /Step 1 of 9/.test(await jp.$eval('[data-j-count]', (e) => e.textContent)));
  ok('Mobile journey: Prev/Next targets are at least 44 px', await jp.$$eval('.j-nav .btn', (bs) => bs.every((x) => x.getBoundingClientRect().height >= 44)));
  const dm = await b.newContext({ viewport: { width: 1440, height: 900 } }); const dp = await dm.newPage();
  await dp.goto(B + '/', { waitUntil: 'networkidle' });
  ok('Desktop journey: lanes and Suite links open, Prev/Next hidden', (await dp.$$eval('#suite details[data-collapsible]', (d) => d.every((e) => e.open))) && (await dp.$eval('.j-nav', (e) => getComputedStyle(e).display)) === 'none');
  await jm.close(); await dm.close();
}

// Reduced motion
const rm = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const rp = await rm.newPage();
await rp.goto(B + '/', { waitUntil: 'networkidle' });
const anim = await rp.evaluate(() => [...document.querySelectorAll('.hs *, .ss *')].map((e) => getComputedStyle(e).animationName));
const revealed = await rp.$$eval('.reveal', (r) => r.every((e) => getComputedStyle(e).opacity === '1'));
ok('Reduced motion: animations off, content visible without scrolling', anim.every((a) => a === 'none') && revealed, anim.join());

// No-JS fallback
const nj = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); const np = await nj.newPage();
await np.goto(B + '/suite.html', { waitUntil: 'load' });
ok('No-JS: all 9 journey steps visible, content not hidden', (await np.$$eval('#journey [role=tabpanel]', (p) => p.filter((x) => x.offsetParent !== null).length)) === 9 && (await np.$$eval('.reveal', (r) => r.every((e) => getComputedStyle(e).opacity === '1'))));

// Focus visibility
await page.goto(B + '/', { waitUntil: 'networkidle' });
await page.keyboard.press('Tab'); const skip = await page.evaluate(() => document.activeElement?.className);
ok('Keyboard: first Tab stop is the skip link', skip === 'skip-link');
await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
ok('Keyboard: focused element shows an outline', outline !== 'none', outline);
ok('No console errors or page exceptions during the run', errs.length === 0, errs.join('; '));
console.log(results.join('\n')); await b.close();
// Exit status reflects the assertions (an exception earlier in the script also exits non-zero).
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exitCode = failed || !results.length ? 1 : 0;
