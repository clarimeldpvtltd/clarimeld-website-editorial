// Checks for the hero story, journey overview and Connector section.
// Usage: serve the build, then  PREVIEW_URL=http://127.0.0.1:4173 node scripts/qa-redesign.mjs   (needs Playwright; optional CHROME_PATH)
import { chromium } from 'playwright';
const B = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const b = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] } : {}) });
const out = []; let failed = 0; const ok = (n, c, d = '') => { if (!c) failed++; out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const errs = [];
const open = async (ctxOpts, url) => { const ctx = await b.newContext(ctxOpts); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); await p.goto(B + url, { waitUntil: 'load' }); return p; };

// Sharing: Home uses the new story; Suite uses its own aligned story
let p = await open({ viewport: { width: 1440, height: 900 } }, '/');
ok('Home hero uses the story component and not the orbit', (await p.$$('.hero .hs')).length === 1 && (await p.$$('.hero .orbit')).length === 0);
const s = await open({ viewport: { width: 1440, height: 900 } }, '/suite.html');
ok('Suite hero uses the aligned visual, no orbit, three product cards, two optional links', (await s.$$('.orbit')).length === 0 && (await s.$$('.ss .ss-card')).length === 3 && (await s.$$('.ss .ss-link')).length === 2);

// Hero motion: intro plays, then settles; no endless animation
await p.waitForTimeout(300);
const early = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.target?.closest?.('.hs')).length);
ok('Hero intro is playing shortly after load', early > 0, `running=${early}`);
await p.waitForTimeout(5200);
const late = await p.evaluate(() => ({ running: document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.target?.closest?.('.hs')).length, infinite: document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations === Infinity).map((a) => a.effect.target?.className)}));
ok('Hero settles: no running hero animations after 5.5 s', late.running === 0, JSON.stringify(late));
ok('No infinite animation inside the hero', !late.infinite.some((c) => String(c).includes('hs')));
ok('Hero cards fully visible when settled', await p.$$eval('.hs-card', (c) => c.every((e) => getComputedStyle(e).opacity === '1')));

// Pause control mid-intro shows the finished composition
p = await open({ viewport: { width: 1440, height: 900 } }, '/');
await p.waitForTimeout(250); await p.click('[data-motion-toggle]');
const paused = await p.evaluate(() => ({ running: document.getAnimations().filter((a) => a.effect?.target?.closest?.('.hs') && a.playState === 'running').length, vis: [...document.querySelectorAll('.hs-card')].every((e) => getComputedStyle(e).opacity === '1'), label: document.querySelector('[data-motion-label]').textContent }));
ok('Pause control mid-intro: composition is complete, nothing animating', paused.running === 0 && paused.vis && paused.label === 'Resume motion', JSON.stringify(paused));
await p.close();

// Reduced motion
p = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, '/');
const rm = await p.evaluate(() => ({ anims: document.getAnimations().filter((a) => a.effect?.target?.closest?.('.hs')).length, vis: [...document.querySelectorAll('.hs-card, .hs-thread-line, .hs-note')].every((e) => getComputedStyle(e).opacity === '1') }));
ok('Reduced motion: hero shows the final state with no animation', rm.anims === 0 && rm.vis, JSON.stringify(rm));
await p.close();

// Keyboard: product links inside the hero reach focus with a visible outline
p = await open({ viewport: { width: 1440, height: 900 } }, '/');
await p.waitForTimeout(4600);
const links = await p.$$eval('.hs-prod', (a) => a.map((x) => x.getAttribute('href')));
ok('Hero card titles link to the product pages, in story order (PM OS twice, then Writer OS, then Public OS)', JSON.stringify(links) === JSON.stringify(['/pm-os.html', '/pm-os.html', '/writer-os.html', '/public-os.html']), links.join());
await p.focus('.hs-card--pm .hs-prod');
ok('Hero product link shows a focus outline', (await p.$eval('.hs-card--pm .hs-prod', (e) => getComputedStyle(e).outlineStyle)) !== 'none');
ok('Hero illustration text is announced once (screen-reader sentences present, decorative body hidden)', (await p.$$eval('.hs .sr-only', (e) => e.length)) === 4 && (await p.$$eval('.hs-body[aria-hidden="true"]', (e) => e.length)) === 4);

// Connector section
ok('Connector section present on Home and Suite, before the contact section', (await p.$$('#connector')).length === 1 && (await s.$$('#connector')).length === 1 && (await p.$eval('#connector', (e) => e.nextElementSibling?.id)) === 'contact');
const tiles = await p.$$eval('#connector .connector-tile', (els) => els.map((e) => ({ name: e.querySelector('.connector-name')?.textContent.trim() ?? '', text: e.textContent.trim(), imgs: [...e.querySelectorAll('img')].map((i) => ({ alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height'), ok: !i.complete || i.naturalWidth > 0 })) })));
ok('Connector section lists 17 tools in one flat list, each with a visible name', tiles.length === 17 && (await p.$$('#connector .connector-rail')).length === 1 && tiles.every((x) => x.name && x.text === x.name) && (await p.$$('#connector h3, #connector .connector-group')).length === 0);
// DEFERRED: connector logos are not shipped (0 of 17 tiles carry one), so the logo part of this assertion is vacuous and proves nothing about logo loading.
// It also accepts an image that has not loaded yet. A future logo check must trigger loading (scroll into view for lazy images), wait for load or error, then inspect.
ok('Connector logo-and-name tiles: every logo is decorative (alt="") beside its visible name, has width and height, and loads; no logo without a name', tiles.every((x) => x.imgs.every((i) => i.alt === '' && i.w && i.h && i.ok)) && tiles.every((x) => x.name), `${tiles.filter((x) => x.imgs.length).length} of 17 tiles currently carry a logo`);
ok('Connector tiles carry no per-tool status, badge or link', (await p.$$('#connector .connector-tile .tag, #connector .connector-tile a, #connector .connector-tile button')).length === 0);
const cText = await p.$eval('#connector', (e) => e.textContent);
ok('Connector copy frames the section as a vision with examples, not available or committed connections', /Our vision/.test(cText) && /would link/.test(cText) && /confirmed, available or committed connection/.test(cText));
ok('Connector wording does not claim live connections', !/\blive\b|available now|supported|integrates with|partner(?!ship)/i.test(await p.$eval('#connector', (e) => e.textContent)));

// Review pass: hero wording, non-link Writer line, Suite hero labels, no text under 12px
const heroText = await p.$eval('.hero .hs', (e) => e.textContent);
ok('Home hero shows the four linked moments of the Northline example', /Regional teams need different approval paths/.test(heroText) && /Start with regional approval paths/.test(heroText) && /assign an approval path/.test(heroText) && /Regional approval paths/.test(heroText) && (await p.$$('.hs .hs-card')).length === 4);
ok('Writer hero line is plain text (no link, not underlined)', (await p.$$eval('.hs-draft', (e) => e.length === 1 && !e[0].closest('a') && getComputedStyle(e[0]).textDecorationLine === 'none')));
ok('Suite hero cards carry their lane taglines, no placeholder bars', (await s.$$eval('.ss .ss-line', (e) => e.map((x) => x.textContent))).join('|') === 'Hear customers, share what is next|Decide what to build, and why|Write from what was agreed' && (await s.$$('.ss .sk')).length === 0);
for (const [label, pg] of [['Home', p], ['Suite', s]]) {
  const tiny = await pg.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && e.getClientRects().length && !e.closest('.sr-only') && parseFloat(getComputedStyle(e).fontSize) < 12).length);
  ok(`${label}: no visible text smaller than 12 px`, tiny === 0, String(tiny));
}

// Reveal: a normal scroll shows everything; an anchor jump or reload mid-page leaves nothing hidden behind the reader
{
  const rv = await open({ viewport: { width: 1440, height: 900 } }, '/');
  const total = await rv.$$eval('.reveal', (e) => e.length);
  for (let i = 0; i < 12; i++) { await rv.mouse.wheel(0, 700); await rv.waitForTimeout(150); }
  await rv.waitForTimeout(900);
  ok('Reveal: after a normal scroll-through every section is visible', total > 0 && (await rv.$$eval('.reveal', (e) => e.every((x) => +getComputedStyle(x).opacity > 0.99))));
  await rv.evaluate(() => scrollTo(0, 0)); await rv.waitForTimeout(300);
  const rj = await open({ viewport: { width: 1440, height: 900 } }, '/#contact');
  await rj.waitForTimeout(1500);
  ok('Reveal: after an anchor jump nothing above the reader stays hidden', await rj.$$eval('.reveal', (e) => e.filter((x) => x.getBoundingClientRect().bottom <= 0).every((x) => x.classList.contains('is-in'))));
  const pr = await open({ viewport: { width: 1440, height: 900 } }, '/');
  await pr.emulateMedia({ media: 'print' });
  ok('Reveal: print view shows every section', await pr.$$eval('.reveal', (e) => e.every((x) => +getComputedStyle(x).opacity === 1)));
}

// No JavaScript: the journey steps use the full width, not one narrow column
{
  const nj = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); const np = await nj.newPage();
  await np.goto(B + '/suite.html', { waitUntil: 'load' });
  const w = await np.$$eval('#journey .j-panel', (e) => e.map((x) => Math.round(x.getBoundingClientRect().width)));
  ok('No-JS: journey steps are visible and laid out across the page', w.length === 9 && w.every((x) => x > 250) && new Set(await np.$$eval('#journey .j-panel', (e) => e.map((x) => Math.round(x.getBoundingClientRect().left)))).size >= 2, w.join(','));
  ok('No-JS: reveal content is not hidden', await np.$$eval('.reveal', (e) => e.every((x) => +getComputedStyle(x).opacity === 1)));
  await nj.close();
}

// Overflow at several widths on Home and Suite
for (const w of [320, 360, 390, 768, 1024, 1440]) {
  for (const u of ['/', '/suite.html']) {
    const q = await open({ viewport: { width: w, height: 800 } }, u);
    const r = await q.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    if (r[0] > r[1]) ok(`No horizontal overflow at ${w}px on ${u}`, false, r.join('>'));
    await q.close();
  }
}
ok('No horizontal overflow at 320, 360, 390, 768, 1024, 1440 px (Home and Suite)', !out.some((l) => l.startsWith('FAIL  No horizontal')));

// Mobile: step tabs scroll inside their own strip and a step can be opened by touch-sized target
const m = await open({ viewport: { width: 390, height: 844 }, hasTouch: true }, '/');
const tabH = await m.$$eval('#suite .j-step', (t) => Math.min(...t.map((x) => x.getBoundingClientRect().height)));
ok('Mobile: step buttons are at least 44 px tall', tabH >= 44, `min=${Math.round(tabH)}`);
await m.click('#suite .j-step >> nth=7');
ok('Mobile: opening step 8 works', (await m.getAttribute('#suite-tab-7', 'aria-selected')) === 'true');
const chipH = await m.$$eval('#suite .stage-chip', (t) => Math.min(...t.map((x) => x.getBoundingClientRect().height)));
ok('Mobile: overview chips are at least 36 px tall', chipH >= 36, `min=${Math.round(chipH)}`);
ok('No console errors or page exceptions', errs.length === 0, errs.join('; '));
await b.close();
console.log(out.join('\n'));
// Exit status reflects the assertions (an exception earlier in the script also exits non-zero).
console.log(`\n${out.length - failed} passed, ${failed} failed`);
process.exitCode = failed || !out.length ? 1 : 0;
