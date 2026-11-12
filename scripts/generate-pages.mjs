// Generates the five static pages from shared partials so header, footer, form
// and illustrations stay identical everywhere.  Run:  node scripts/generate-pages.mjs
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------------ icons */
const ICON_PATHS = {
  signal: 'M3 12h4l3-7 4 14 3-7h4',
  options: 'M12 3v6M12 9c0 4-6 4-6 9M12 9c0 4 6 4 6 9',
  doc: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  pen: 'M4 20l4-1L19 8l-3-3L5 16zM14 6l3 3',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  loop: 'M4 12a8 8 0 0 1 14-5l2 2M20 4v5h-5M20 12a8 8 0 0 1-14 5l-2-2M4 20v-5h5',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  check: 'M5 12l5 5 9-10',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  book: 'M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  package: 'M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8',
  chat: 'M4 5h16v11H9l-5 4z',
  road: 'M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14M15 6v14',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0',
  flag: 'M5 21V4M5 5h12l-2 4 2 4H5',
  menu: 'M3 6h18M3 12h18M3 18h18',
};
const icon = (name, size = 24) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON_PATHS[name]}"/></svg>`;
const voteIcon = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2l5 7H1z" fill="currentColor"/></svg>`;

/* ----------------------------------------------------------------- shared */
const NAV = [
  ['PM OS', '/pm-os.html', 'pm-os'],
  ['Writer OS', '/writer-os.html', 'writer-os'],
  ['Public OS', '/public-os.html', 'public-os'],
  ['Suite', '/suite.html', 'suite'],
];

const SITE = 'https://clarimeld.com';
const head = ({ title, description, path }) => `<!doctype html>
<html lang="en" data-motion="auto">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="__CSP_CONTENT__" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${SITE}${path}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Clarimeld" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${SITE}${path}" />
    <meta property="og:image" content="${SITE}/brand/clarimeld-logo-1024.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="theme-color" content="#f8f7fc" />
    <link rel="icon" type="image/png" href="/brand/clarimeld-logo-512.png" />
    <script src="/js-flag.js"></script>
    <link rel="stylesheet" href="/src/styles/main.css" />
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
`;

const header = (page) => `    <header class="site-header">
      <div class="container header-inner">
        <a class="brand-lockup" href="/" aria-label="Clarimeld home">
          <img src="/brand/clarimeld-logo-512.png" srcset="/brand/clarimeld-logo-512.png 1x, /brand/clarimeld-logo-1024.png 2x" alt="" width="32" height="32" decoding="async" />
          <span>Clarimeld</span>
        </a>
        <nav class="primary-nav" aria-label="Primary">
${NAV.map(([label, href, id]) => `          <a href="${href}"${page === id ? ' aria-current="page"' : ''}>${label}</a>`).join('\n')}
        </nav>
        <div class="header-actions">
          <a class="btn btn-primary btn-sm" href="#contact">Contact</a>
          <button type="button" id="menu-btn" class="menu-toggle" aria-expanded="false" aria-controls="mobile-drawer" aria-label="Menu">${icon('menu', 20)}</button>
        </div>
      </div>
      <nav id="mobile-drawer" class="mobile-drawer" data-open="false" aria-label="Mobile">
        <a href="/">Home</a>
${NAV.map(([label, href, id]) => `        <a href="${href}"${page === id ? ' aria-current="page"' : ''}>${label}</a>`).join('\n')}
      </nav>
    </header>
`;

const footer = () => `    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="brand-lockup" href="/"><img src="/brand/clarimeld-logo-512.png" alt="" width="32" height="32" decoding="async" /><span>Clarimeld</span></a>
            <p>The product lifecycle, connected.</p>
          </div>
          <nav class="footer-nav" aria-label="Footer">
            <a href="/pm-os.html">PM OS</a>
            <a href="/writer-os.html">Writer OS</a>
            <a href="/public-os.html">Public OS</a>
            <a href="/suite.html">Suite</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
        <div class="footer-base">
          <p>© 2026 Clarimeld Private Limited · <a href="mailto:info@clarimeld.com">info@clarimeld.com</a></p>
          <button type="button" class="motion-toggle" data-motion-toggle aria-pressed="false"><span data-motion-label>Pause motion</span></button>
        </div>
      </div>
    </footer>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;

const accessSection = (heading = 'Get in touch', topic = '') => `
      <section id="contact" class="section access" aria-labelledby="access-heading">
        <div class="container access-grid">
          <div class="access-copy reveal">
            <span class="kicker">Contact</span>
            <h2 class="h2" id="access-heading">${heading}</h2>
            <p class="lead">Tell us who you are and which products fit your team.</p>
            <ul class="access-points">
              <li>${icon('check', 18)} Pick one product, or several</li>
              <li>${icon('check', 18)} Each product works on its own</li>
              <li>${icon('check', 18)} Link them through Suite when you want</li>
            </ul>
          </div>
          <div class="form-card contact-card reveal" data-delay="1">
            <h3 class="h3">Write to us</h3>
            <p>Send us an email at the address below. The button opens your own email app; this website does not collect or send your details.</p>
            <a class="btn btn-gradient contact-mail" href="mailto:info@clarimeld.com${topic ? `?subject=${encodeURIComponent(topic)}` : ''}">info@clarimeld.com</a>
          </div>
        </div>
      </section>
`;

/* ----------------------------------------------------- product illustrations */
const FICTION = 'Illustration. Northstar Ledger is a fictional company.';

const pmApp = (extra = '') => `
        <figure class="app app--pm ${extra}" role="img" aria-label="Illustration of PM OS. Customer signals on the left. Two options in the middle: one chosen, one deferred with a recorded reason. A locked PRD snapshot on the right listing what is in and out of scope.">
          <div class="app-bar"><span class="app-dots"><i></i><i></i><i></i></span><span class="app-title">Northstar Ledger · Tax export</span><span class="app-tag">Illustration</span></div>
          <div class="app-body pm-body" aria-hidden="true">
            <div class="pane">
              <h4>Signals</h4>
              <div class="item"><span class="item-title">Export for accountants</span><div class="stack"><span class="sk w80"></span><span class="sk w50"></span></div></div>
              <div class="item item--muted"><span class="item-title">Payroll privacy</span><div class="stack"><span class="sk w60"></span></div></div>
              <div class="item item--muted"><span class="item-title">Audit trail</span><div class="stack"><span class="sk w70"></span></div></div>
            </div>
            <div class="pane">
              <h4>Options</h4>
              <div class="item item--active"><div class="item-row"><span class="item-title">A · Tax export</span><span class="tag tag--pm">Chosen</span></div><div class="stack"><span class="sk w100"></span><span class="sk w60"></span></div></div>
              <div class="item item--muted"><div class="item-row"><span class="item-title">B · Multi-entity</span><span class="tag">Deferred</span></div><div class="stack"><span class="sk w80"></span><span class="sk w40"></span></div><span class="tag">Reason recorded</span></div>
            </div>
            <div class="pane">
              <h4>PRD-104</h4>
              <div class="lock-row">${icon('lock', 14)} Snapshot locked</div>
              <ul class="scope-list"><li>Tax export</li><li>Accountant access</li></ul>
              <ul class="scope-list scope-list--out"><li>Employee payroll</li><li>Multi-entity</li></ul>
              <span class="tag tag--amber">Product lead decides</span>
            </div>
          </div>
        </figure>`;

const writerApp = (extra = '') => `
        <figure class="app app--writer ${extra}" role="img" aria-label="Illustration of Writer OS. A pinned source on the left. A draft in the middle with one sentence flagged for an editor to check against the source. Output formats on the right.">
          <div class="app-bar"><span class="app-dots"><i></i><i></i><i></i></span><span class="app-title">Release note · Tax export</span><span class="app-tag">Illustration</span></div>
          <div class="app-body writer-body" aria-hidden="true">
            <div class="pane">
              <h4>Sources</h4>
              <div class="doc-pin"><strong>${icon('book', 14)} PRD-104</strong><span class="sk w80"></span><span class="sk w50"></span></div>
              <div class="item item--muted"><span class="item-title">Help centre page</span><span class="sk w60"></span></div>
            </div>
            <div class="pane">
              <h4>Draft</h4>
              <div class="stack"><span class="sk sk--dark w60"></span><span class="sk w100"></span><span class="sk w80"></span></div>
              <p class="item-title"><span class="hl">Export your books for your accountant.</span></p>
              <div class="stack"><span class="sk w100"></span><span class="sk w70"></span></div>
              <div class="flag">Advisory flag · payroll is out of scope in PRD-104</div>
            </div>
            <div class="pane">
              <h4>Formats</h4>
              <span class="tag tag--writer">Article</span>
              <span class="tag tag--writer">Release note</span>
              <span class="tag tag--writer">Email kit</span>
              <span class="tag tag--amber">Editor reviews</span>
            </div>
          </div>
        </figure>`;

const publicApp = (extra = '') => `
        <figure class="app app--public ${extra}" role="img" aria-label="Illustration of Public OS. A list of customer ideas with an idea under review. A changelog entry and a recipient review with a send button.">
          <div class="app-bar"><span class="app-dots"><i></i><i></i><i></i></span><span class="app-title">Northstar Ledger · Customer hub</span><span class="app-tag">Illustration</span></div>
          <div class="app-body public-body" aria-hidden="true">
            <div class="pane">
              <div class="tabs-mini"><span class="on">Ideas</span><span>Roadmap</span><span>Changelog</span></div>
              <div class="item item--public"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Export for outside accountants</span></div><div class="item-row"><span class="tag tag--public">Under review</span><span class="who"><span class="avatar"></span><span class="avatar avatar--b"></span><span class="avatar avatar--c"></span></span></div></div>
              <div class="item"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Bulk invoice upload</span></div><span class="sk w60"></span></div>
              <div class="item"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Dark mode</span></div><span class="sk w40"></span></div>
            </div>
            <div class="pane">
              <h4>Tax export · Release note</h4>
              <div class="stack"><span class="sk w100"></span><span class="sk w80"></span></div>
              <h4>Recipients</h4>
              <div class="who"><span class="check check--on">${icon('check', 10)}</span><span class="sk w60"></span></div>
              <div class="who"><span class="check check--on">${icon('check', 10)}</span><span class="sk w50"></span></div>
              <div class="who"><span class="check"></span><span class="sk w40"></span></div>
              <span class="mini-btn mini-btn--amber">Send to reviewed group</span>
            </div>
          </div>
        </figure>`;

/* ----------------------------------------------------------------- journey */
const appFrame = (title, aria, body) => `<figure class="app" role="img" aria-label="${aria}">
            <div class="app-bar"><span class="app-dots"><i></i><i></i><i></i></span><span class="app-title">${title}</span><span class="app-tag">Illustration</span></div>
            <div class="single-pane" aria-hidden="true">${body}
            </div></figure>`;

// The eleven beats of one fictional example. Every beat maps to documented stages in the capability source map
// (see the private coverage map). `alone` = how the product works without the others; `branch` = an optional side path.
const JOURNEY = [
  {
    key: 'ask', product: 'public', tag: 'Public OS', title: 'Customers ask',
    text: 'Customers post ideas and vote. Your team moderates. A vote is a signal, not a promise.',
    link: 'Starts in Public OS',
    branch: ['Discussion and moderation', 'Your team merges duplicates and keeps threads on topic.'],
    app: appFrame('Northstar Ledger · Ideas', 'Illustration of Public OS: a list of customer ideas, with one under review.', `
              <div class="item item--public"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Export for outside accountants</span></div><span class="tag tag--public">Under review</span></div>
              <div class="item"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Bulk invoice upload</span></div><span class="sk w60"></span></div>
              <div class="item"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Dark mode</span></div><span class="sk w40"></span></div>`),
  },
  {
    key: 'signals', product: 'pm', tag: 'PM OS', title: 'Signals come together',
    text: 'A product manager groups feedback, support tickets and customer notes, then judges what matters. Tools can help organise. A person decides.',
    alone: 'PM OS works from your own notes and tickets too. It does not need Public OS.',
    link: 'Optional link: Public OS → PM OS',
    app: appFrame('Northstar Ledger · Signals', 'Illustration of PM OS: feedback, support tickets and customer notes grouped under one theme for a product manager to review.', `
              <div class="item item--active"><div class="item-row"><span class="item-title">Theme: export for accountants</span><span class="tag tag--pm">Grouped for review</span></div><div class="who"><span class="tag tag--public">Customer ideas</span><span class="tag">Support tickets</span><span class="tag">Customer notes</span></div></div>
              <div class="item item--muted"><div class="item-row"><span class="item-title">Theme: invoice bulk upload</span><span class="tag">Not reviewed yet</span></div></div>
              <div class="item-row"><span class="sk w50"></span><span class="tag tag--amber">Product manager decides</span></div>`),
  },
  {
    key: 'options', product: 'pm', tag: 'PM OS', title: 'Options weighed',
    text: 'The team compares approaches and records why. Deferring an option is a recorded reason, not a promise.',
    link: 'Inside PM OS',
    app: appFrame('Northstar Ledger · Tax export', 'Illustration of PM OS: one option chosen and one deferred with a recorded reason.', `
              <div class="item item--active"><div class="item-row"><span class="item-title">A · Tax export</span><span class="tag tag--pm">Chosen</span></div><span class="sk w80"></span></div>
              <div class="item item--muted"><div class="item-row"><span class="item-title">B · Multi-entity</span><span class="tag">Deferred · reason recorded</span></div></div>
              <div class="item-row"><span class="sk w40"></span><span class="tag tag--amber">Product lead decides</span></div>`),
  },
  {
    key: 'scope', product: 'pm', tag: 'PM OS', title: 'Scope agreed',
    text: 'The product lead locks a versioned PRD snapshot: what is in scope, and what is out.',
    link: 'Inside PM OS',
    branch: ['Curated roadmap · Public OS', 'Leaders choose which items customers can see. A roadmap card shows intention, not a launch date.'],
    app: appFrame('PRD-104 · Tax export', 'Illustration of PM OS: a PRD snapshot with in-scope and out-of-scope items, locked by the product lead.', `
              <div class="item"><div class="who"><span class="check check--on">${icon('check', 10)}</span><span class="item-title">Single-entity export</span></div><span class="tag">In scope</span></div>
              <div class="item item--muted"><div class="who"><span class="check"></span><span class="item-title">Employee payroll</span></div><span class="tag">Out of scope</span></div>
              <div class="item-row"><span class="lock-row">${icon('lock', 14)} PRD-104 locked</span><span class="tag tag--amber">Product lead decides</span></div>`),
  },
  {
    key: 'delivery', product: 'pm', tag: 'PM OS', title: 'Delivery coordinated',
    text: 'Teams track dependencies and release milestones so people can coordinate. Clarimeld does not build or deploy anything.',
    link: 'Inside PM OS',
    app: appFrame('Northstar Ledger · Delivery', 'Illustration of PM OS: a list of dependencies and a release milestone tracked by people.', `
              <div class="item"><div class="item-row"><span class="item-title">Accountant access</span><span class="tag">Ready</span></div></div>
              <div class="item"><div class="item-row"><span class="item-title">Export format</span><span class="tag tag--pm">In progress</span></div></div>
              <div class="item-row"><span class="lock-row">${icon('flag', 14)} Milestone · v2.4</span><span class="tag tag--amber">Team coordinates</span></div>`),
  },
  {
    key: 'brief', product: 'writer', tag: 'Writer OS', title: 'Brief and sources',
    text: 'A writer starts from a brief and pins the sources beside the draft, such as the agreed scope.',
    alone: 'Writer OS projects start from a brief. They do not need a PRD.',
    link: 'Optional link: PM OS → Writer OS',
    app: appFrame('Brief · Tax export release note', 'Illustration of Writer OS: a brief with a pinned PRD as a source.', `
              <div class="item"><div class="item-row"><span class="item-title">Brief · Release note for accountants</span><span class="tag tag--writer">Open</span></div><div class="stack"><span class="sk w80"></span></div></div>
              <div class="doc-pin"><strong>${icon('book', 14)} PRD-104 pinned</strong><span class="sk w60"></span></div>
              <div class="doc-pin"><strong>${icon('book', 14)} Support notes pinned</strong><span class="sk w40"></span></div>`),
  },
  {
    key: 'write', product: 'writer', tag: 'Writer OS', title: 'Draft checked and packed',
    text: 'Advisory flags help editors spot claims outside the sources or scope. The draft can then be packed as an article, notes or an email kit.',
    link: 'Inside Writer OS',
    branch: ['Packs without a sign-off', 'Making a pack does not need a software approval step. Editors still check the claims.'],
    app: appFrame('Release note · Tax export', 'Illustration of Writer OS: a draft with one advisory flag and three pack formats.', `
              <div class="doc-pin"><strong>${icon('book', 14)} PRD-104 pinned</strong><span class="sk w60"></span></div>
              <p class="item-title"><span class="hl">Export your books for your accountant.</span></p>
              <div class="flag">Advisory flag · payroll is out of scope</div>
              <div class="item-row"><span class="who"><span class="tag tag--writer">Article</span><span class="tag tag--writer">Notes</span><span class="tag tag--writer">Email kit</span></span><span class="tag tag--amber">Editor reviews</span></div>`),
  },
  {
    key: 'publish', product: 'public', tag: 'Public OS', title: 'Release note published',
    text: 'The release note moves to Public OS. A person reviews it and publishes it. Nothing publishes by itself.',
    alone: 'You can also write a changelog directly in Public OS.',
    link: 'Optional link: Writer OS → Public OS',
    app: appFrame('Changelog', 'Illustration of Public OS: a changelog entry with a publish button.', `
              <div class="item"><div class="item-row"><span class="item-title">Tax export is here</span><span class="tag">Draft</span></div><div class="stack"><span class="sk w100"></span><span class="sk w80"></span><span class="sk w50"></span></div></div>
              <div class="item-row"><span class="mini-btn">Publish</span><span class="tag tag--amber">Comms lead decides</span></div>`),
  },
  {
    key: 'send', product: 'public', tag: 'Public OS', title: 'You choose who hears',
    text: 'Publishing does not email anyone. Review the eligible recipients, then send.',
    link: 'Optional step in Public OS',
    branch: ['Who is eligible', 'Requesters, followers and eligible recipients are separate groups.'],
    app: appFrame('Send update', 'Illustration of Public OS: a list of eligible recipients with checkboxes and a send button.', `
              <h4 class="tag">Eligible recipients</h4>
              <div class="who"><span class="check check--on">${icon('check', 10)}</span><span class="sk w60"></span></div>
              <div class="who"><span class="check check--on">${icon('check', 10)}</span><span class="sk w50"></span></div>
              <div class="who"><span class="check"></span><span class="sk w40"></span></div>
              <div class="item-row"><span class="mini-btn mini-btn--amber">Send to reviewed group</span><span class="tag tag--amber">Comms lead decides</span></div>`),
  },
  {
    key: 'learn', product: 'public', tag: 'Public OS', title: 'Replies come back',
    text: 'Customer replies are logged for the next round of discovery. They do not commit your roadmap.',
    link: 'Optional link: Public OS → PM OS',
    branch: ['Not every reply starts new work', 'A person decides which replies become evidence for a future cycle.'],
    app: appFrame('Replies', 'Illustration: a customer reply in Public OS is tagged and passed to PM OS for discovery.', `
              <div class="item"><div class="who"><span class="avatar avatar--b"></span><span class="item-title">Can this cover several companies?</span></div><div class="stack"><span class="sk w80"></span></div></div>
              <div class="item-row"><span class="arrow-chip"><span class="tag tag--public">Public OS</span>${icon('arrow', 14)}<span class="tag tag--pm">PM OS · Discovery</span></span><span class="tag tag--amber">Triage lead tags</span></div>`),
  },
  {
    key: 'review', product: 'pm', tag: 'PM OS', title: 'Outcomes reviewed',
    text: 'The product team reviews replies and observations against what it expected. It is a review practice, not an automatic report.',
    link: 'Inside PM OS · closes the loop',
    app: appFrame('Northstar Ledger · Outcomes', 'Illustration of PM OS: customer replies and adoption observations reviewed against the original hypothesis.', `
              <div class="item"><div class="item-row"><span class="item-title">Hypothesis: accountants want read-only access</span><span class="tag tag--pm">Reviewing</span></div></div>
              <div class="item"><div class="item-row"><span class="item-title">Customer replies</span><span class="tag tag--public">From Public OS</span></div><span class="sk w60"></span></div>
              <div class="item-row"><span class="sk w40"></span><span class="tag tag--amber">Product team decides</span></div>`),
  },
];

// The documented stages of each product (capability source map §3). `step` = the example beat that shows it.
const LANES = [
  { key: 'pm', name: 'PM OS', line: 'Decide what to build and why', stages: [['Discovery and signals', 2], ['Strategy and trade-offs', 3], ['PRDs and agreed boundaries', 4], ['Execution coordination', 5], ['Outcomes and insights', 11]] },
  { key: 'writer', name: 'Writer OS', line: 'Write with the sources beside you', stages: [['Intake and briefs', 6], ['Primary sources', 6], ['Voice and scope checks', 7], ['Editorial checkpoints and packaging', 7]] },
  { key: 'public', name: 'Public OS', line: 'Hear customers, share what is next', stages: [['Ideas and voting', 1], ['Discussion and moderation', 1], ['Curated public roadmap', 4], ['Published changelogs', 8], ['Deliberate cohort sends', 9], ['Closed-loop feedback', 10]] },
];

// Optional links between products through Suite (source map §4: T1, T4, T6, T8)
const SUITE_LINKS = [
  ['Public OS', 'PM OS', 'Feedback ingestion', 'pm', 2],
  ['PM OS', 'Writer OS', 'Boundary feed', 'writer', 6],
  ['Writer OS', 'Public OS', 'Release communication', 'public', 8],
  ['Public OS', 'PM OS', 'Closed-loop feedback', 'pm', 10],
];


// ---------- Connector section ----------
// Names below come from the owner's message of 2026-11-12 (dated source-review leads: Writer publishing adapters and
// Jira/Linear sync / Slack publication behind default-off feature flags). The platform repository was not accessible, so
// none of them is verified as working or ready for customers. The public wording is forward-looking and shows no status badges.
// `logo`: official logo file only with permission and within the brand's guidelines; null shows the name as text.
// Deliberately ungrouped and alphabetical: the roles of Slack and HubSpot are unverified, and a category label would
// imply a role. Do not add groups until each role is confirmed from product records or source.
const CONNECTORS = [
  { name: 'Confluence', logo: null },
  { name: 'Contentful', logo: null },
  { name: 'Ghost', logo: null },
  { name: 'GitHub', logo: null },
  { name: 'Google Drive', logo: null },
  { name: 'HubSpot', logo: null },
  { name: 'Intercom', logo: null },
  { name: 'Jira', logo: null },
  { name: 'Linear', logo: null },
  { name: 'Microsoft Teams', logo: null },
  { name: 'Notion', logo: null },
  { name: 'Postmark', logo: null },
  { name: 'SendGrid', logo: null },
  { name: 'Slack', logo: null },
  { name: 'Webflow', logo: null },
  { name: 'WordPress', logo: null },
  { name: 'Zendesk', logo: null },
];
// Official logos are optional per tool. An entry in scripts/connector-assets.json is accepted only if it records where the
// file came from, which terms permit this use, and the basis (terms or written permission). Otherwise the name is shown.
// The file must be the brand owner's own, unmodified, in public/brand/connectors/. Nothing is drawn or recoloured here.
const ASSETS = JSON.parse(readFileSync(new URL('./connector-assets.json', import.meta.url), 'utf8'));
const BASES = ['terms-permit', 'written-permission'];
for (const [name, a] of Object.entries(ASSETS)) {
  if (!CONNECTORS.some((t) => t.name === name)) throw new Error(`connector-assets.json: "${name}" is not in CONNECTORS`);
  for (const k of ['file', 'width', 'height', 'source', 'terms', 'basis']) if (!a[k]) throw new Error(`connector-assets.json: "${name}" is missing "${k}"`);
  if (!BASES.includes(a.basis)) throw new Error(`connector-assets.json: "${name}" basis must be one of ${BASES.join(', ')}`);
  if (!existsSync(new URL(`../public/brand/connectors/${a.file}`, import.meta.url))) throw new Error(`connector-assets.json: file public/brand/connectors/${a.file} not found`);
}
for (const t of CONNECTORS) if (ASSETS[t.name]) t.logo = ASSETS[t.name];
const missingLogos = CONNECTORS.filter((t) => !t.logo).map((t) => t.name);
if (missingLogos.length) console.warn(`Connector: no permitted official logo on file, names shown for ${missingLogos.length} of ${CONNECTORS.length}: ${missingLogos.join(', ')}`);

// The visible name always stays next to the logo, so the logo is decorative (alt="") and the tile's accessible name is the tool name.
// Display size: 24px tall, never wider than 140px, proportions taken from the file's own width and height (no cropping, no stretching).
const logoSize = ({ width, height }) => { const k = Math.min(24 / height, 140 / width); return { w: Math.round(width * k), h: Math.round(height * k) }; };
const connectorTile = (t) =>
  t.logo
    ? `<li class="connector-tile connector-tile--logo"><img src="/brand/connectors/${t.logo.file}" alt="" width="${logoSize(t.logo).w}" height="${logoSize(t.logo).h}" loading="lazy" decoding="async" /><span class="connector-name">${t.name}</span></li>`
    : `<li class="connector-tile connector-tile--name"><span class="connector-name">${t.name}</span></li>`;

const connectorSection = () => `
      <section id="connector" class="section section--tight connector" aria-labelledby="connector-heading">
        <div class="container connector-grid">
          <div class="connector-copy reveal">
            <span class="kicker">Connector</span>
            <h2 class="h2" id="connector-heading">Where Connector could reach</h2>
            <p class="lead">Our vision: Connector would link Clarimeld with the tools your teams already use. Each product works on its own.</p>
          </div>
          <ul class="connector-rail reveal" role="list" aria-label="Example tools in the Connector vision" data-delay="1">
${CONNECTORS.map(connectorTile).join('\n')}
          </ul>
          <p class="connector-note reveal" data-delay="2">Examples of tools teams use, not a list of available or committed connections. Names belong to their owners; Clarimeld is not affiliated with or endorsed by them.</p>
        </div>
      </section>
`;

const journeySection = ({ heading, lead, id = 'journey' }) => `
      <section id="${id}" class="section on-ink" aria-labelledby="${id}-heading">
        <div class="container">
          <div class="section-head reveal">
            <span class="kicker">The full journey</span>
            <h2 class="h2" id="${id}-heading">${heading}</h2>
            <p class="lead">${lead}</p>
          </div>
          <div class="lifecycle reveal" data-delay="1">
            <div class="lanes">
${LANES.map((l) => `              <details class="lane lane--${l.key}" open data-collapsible>
                <summary class="lane-head"><h3 id="${id}-lane-${l.key}">${l.name}</h3><span class="lane-line">${l.line}</span><span class="lane-count">${l.stages.length} stages</span></summary>
                <ol class="lane-stages" aria-labelledby="${id}-lane-${l.key}">
${l.stages.map(([name, step], i) => `                  <li><a class="stage-chip" href="#${id}-panel-${step - 1}" data-goto="${step - 1}"><span class="stage-n">${i + 1}</span>${name}</a></li>`).join('\n')}
                </ol>
                <p class="lane-alone">Works on its own</p>
              </details>`).join('\n')}
            </div>
            <details class="suite-links" open data-collapsible>
              <summary><h3 class="suite-links-title">Optional links through Suite</h3><span class="lane-count">${SUITE_LINKS.length} links</span></summary>
              <ul>
${SUITE_LINKS.map(([from, to, name, key, step]) => `                <li><a class="suite-link suite-link--${key}" href="#${id}-panel-${step - 1}" data-goto="${step - 1}"><span>${from} <b aria-hidden="true">→</b><span class="sr-only"> to</span> ${to}</span><small>${name}</small></a></li>`).join('\n')}
              </ul>
            </details>
          </div>
          <div class="j-intro reveal">
            <h3 class="h3" id="${id}-example-heading">Follow one example</h3>
            <p>A fictional feature request, from a customer idea to a customer update. Pick a step, or open the optional branches.</p>
          </div>
          <div class="journey reveal" data-journey data-delay="1">
            <div class="j-steps" role="tablist" aria-label="Steps in the example">
${JOURNEY.map((s, i) => `              <button type="button" class="j-step" role="tab" id="${id}-tab-${i}" aria-controls="${id}-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-product="${s.product}"><span class="j-num">${i + 1}</span><span class="j-label"><strong>${s.title}</strong><small>${s.tag}</small></span></button>`).join('\n')}
            </div>
            <div class="j-stage" data-product="${JOURNEY[0].product}" data-journey-stage>
${JOURNEY.map((s, i) => `              <div class="j-panel" role="tabpanel" id="${id}-panel-${i}" aria-labelledby="${id}-tab-${i}" data-product="${s.product}"${i === 0 ? '' : ' data-initially-hidden'} tabindex="0">
                <div class="j-progress" aria-hidden="true"><i class="p${i + 1}"></i></div>
                <div class="j-panel-head"><h3>${i + 1}. ${s.title}</h3><p>${s.text}</p></div>
                ${s.app}
                <div class="j-meta">
                  <p class="j-handoff">${s.link}</p>
                  ${s.alone ? `<p class="j-alone">${s.alone}</p>` : ''}
                  ${s.branch ? `<details class="j-branch"><summary>Optional branch: ${s.branch[0]}</summary><p>${s.branch[1]}</p></details>` : ''}
                </div>
              </div>`).join('\n')}
            </div>
            <div class="j-nav">
              <button type="button" class="btn btn-ghost j-prev" data-j-prev>${icon('arrow', 16)}<span>Previous</span></button>
              <p class="j-count" data-j-count aria-live="polite">Step 1 of ${JOURNEY.length}</p>
              <button type="button" class="btn btn-ghost j-next" data-j-next><span>Next</span>${icon('arrow', 16)}</button>
            </div>
          </div>
          <div class="j-legend">
            <span><i class="dot-amber"></i> Amber marks where a person decides</span>
            <span>Every link between products is optional</span>
            <span>Northstar Ledger is a fictional company</span>
          </div>
        </div>
      </section>
`;

/* Home hero: one request moves from request to decision to reviewed content. Home only. */
const heroStory = () => `
            <div class="hs" role="group" aria-label="Illustration: one fictional request moves from Public OS to a decision in PM OS to reviewed content in Writer OS. Each link between products is optional.">
              <article class="app hs-card hs-card--public">
                <div class="hs-head"><a class="hs-prod" href="/public-os.html">Public OS</a><span class="hs-stage">Request</span></div>
                <p class="sr-only">Public OS, the request: customers ask for an export for outside accountants.</p>
                <div class="hs-body" aria-hidden="true">
                  <div class="item item--public"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Export for outside accountants</span></div></div>
                </div>
              </article>
              <div class="hs-thread" aria-hidden="true"><span class="hs-thread-line"></span><span class="hs-thread-label">Optional link</span></div>
              <article class="app hs-card hs-card--pm">
                <div class="hs-head"><a class="hs-prod" href="/pm-os.html">PM OS</a><span class="hs-stage">Decision</span></div>
                <p class="sr-only">PM OS, the decision: the tax export option is chosen and the product lead decides.</p>
                <div class="hs-body" aria-hidden="true">
                  <div class="item item--active"><div class="item-row"><span class="item-title">Tax export</span><span class="tag tag--pm">Chosen</span></div></div>
                  <span class="tag tag--amber hs-decide">Product lead decides</span>
                </div>
              </article>
              <div class="hs-thread" aria-hidden="true"><span class="hs-thread-line"></span><span class="hs-thread-label">Optional link</span></div>
              <article class="app hs-card hs-card--writer">
                <div class="hs-head"><a class="hs-prod" href="/writer-os.html">Writer OS</a><span class="hs-stage">Reviewed content</span></div>
                <p class="sr-only">Writer OS, the reviewed content: a draft release note that an editor reviews.</p>
                <div class="hs-body" aria-hidden="true">
                  <span class="hs-draft">Export your books for your accountant.</span>
                  <span class="tag tag--amber hs-decide">Editor reviews</span>
                </div>
              </article>
              <p class="hs-note">Illustration. Northstar Ledger is a fictional company. Each product also works on its own.</p>
            </div>`;

/* Suite hero: three products that start apart, then show their optional links. Suite page only. */
const suiteStory = () => `
            <div class="ss" role="group" aria-label="Illustration: Public OS, PM OS and Writer OS each work on their own. Clarimeld Suite adds optional links between them.">
              <div class="ss-row">
                <article class="app ss-card ss-card--public"><a class="hs-prod" href="/public-os.html">Public OS</a><p class="ss-line">Hear customers, share what is next</p></article>
                <span class="ss-link" aria-hidden="true"><i></i><b>Optional</b></span>
                <article class="app ss-card ss-card--pm"><a class="hs-prod" href="/pm-os.html">PM OS</a><p class="ss-line">Decide what to build and why</p></article>
                <span class="ss-link" aria-hidden="true"><i></i><b>Optional</b></span>
                <article class="app ss-card ss-card--writer"><a class="hs-prod" href="/writer-os.html">Writer OS</a><p class="ss-line">Write with the sources beside you</p></article>
              </div>
              <div class="ss-suite" aria-hidden="true"><span class="ss-suite-name">Clarimeld Suite</span><span class="ss-suite-line">Links are optional. A person acts at every handoff.</span></div>
              <p class="hs-note">Each product works on its own. Suite only adds the links you choose.</p>
            </div>`;

const pages = {};

/* ---------- Home ---------- */
pages['index.html'] = () =>
  head({
    title: 'Clarimeld: The product lifecycle, connected.',
    description: 'PM OS, Writer OS and Public OS: three products that each work alone, and link through Clarimeld Suite when you want.',
    path: '/',
  }) +
  header('home') +
  `
    <main id="main-content" tabindex="-1">
      <section class="hero" aria-labelledby="hero-heading">
        <div class="container hero-grid">
          <div class="hero-copy">
            <h1 class="display" id="hero-heading">The product lifecycle, <span class="gradient-text">connected.</span></h1>
            <p class="lead">PM OS, Writer OS and Public OS. Three products that each work alone, and link through Suite when you want.</p>
            <div class="hero-actions">
              <a class="btn btn-gradient" href="#contact">Contact us</a>
              <a class="btn btn-ghost" href="#products">See the products</a>
            </div>
          </div>
          <div class="hero-visual">${heroStory()}
          </div>
        </div>
      </section>

      <section id="why" class="section why on-ink" aria-labelledby="why-heading">
        <div class="container">
          <div class="section-head reveal">
            <span class="kicker">Why Clarimeld</span>
            <h2 class="h2" id="why-heading">Context gets lost between teams.</h2>
            <p class="lead">Customers ask. Product decides. Content explains. Each team ends up with a different version of the story.</p>
          </div>
          <div class="reveal" data-delay="1">
            <div class="mode-switch" role="group" aria-label="Show the story">
              <button type="button" aria-pressed="true" data-gap-mode="separate">Separate</button>
              <button type="button" aria-pressed="false" data-gap-mode="connected">Connected</button>
            </div>
          </div>
          <div class="reveal" data-delay="2" data-gap>
            <svg class="gap-diagram" data-state="separate" viewBox="0 0 960 240" role="img" aria-label="Three teams: customers, product and content. When separate, the links between them are broken. When connected, context flows from one to the next.">
              <defs><linearGradient id="gw1" x1="260" y1="0" x2="350" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e07bff"/><stop offset="1" stop-color="#9d7bff"/></linearGradient><linearGradient id="gw2" x1="610" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9d7bff"/><stop offset="1" stop-color="#6aa6ff"/></linearGradient></defs>
              <rect class="node-card" x="0" y="45" width="260" height="150" rx="22"/><text class="node-title" x="28" y="112">Customers ask</text><text class="node-sub" x="28" y="142">Ideas, votes, replies</text>
              <rect class="node-card" x="350" y="45" width="260" height="150" rx="22"/><text class="node-title" x="378" y="112">Product decides</text><text class="node-sub" x="378" y="142">Options, scope</text>
              <rect class="node-card" x="700" y="45" width="260" height="150" rx="22"/><text class="node-title" x="728" y="112">Content explains</text><text class="node-sub" x="728" y="142">Posts, release notes</text>
              <path class="wire wire--broken" d="M272 120H338"/><path class="wire wire--broken" d="M622 120H688"/>
              <text class="lost" x="305" y="104" text-anchor="middle">?</text><text class="lost" x="655" y="104" text-anchor="middle">?</text>
              <path class="wire wire--linked" d="M262 120H348" stroke="url(#gw1)"/><path class="wire wire--linked" d="M612 120H698" stroke="url(#gw2)"/>
              <circle class="pulse" cx="266" cy="120" r="6" fill="#fff"/><circle class="pulse pulse-2" cx="616" cy="120" r="6" fill="#fff"/>
            </svg>
            <ol class="gap-mobile" data-state="separate">
              <li><strong>Customers ask</strong><span>Ideas, votes, replies</span></li>
              <li><strong>Product decides</strong><span>Options, scope</span></li>
              <li><strong>Content explains</strong><span>Posts, release notes</span></li>
            </ol>
          </div>
          <p class="gap-note" data-gap-note aria-live="polite">Separate tools. Each team re-explains the story.</p>
        </div>
      </section>

      <section id="products" class="section" aria-labelledby="products-heading">
        <div class="container">
          <div class="section-head section-head--center reveal">
            <span class="kicker">Three products</span>
            <h2 class="h2" id="products-heading">Use one. Or all three.</h2>
          </div>
          <div class="features">
            <article class="feature">
              <div class="feature-copy reveal">
                <span class="kicker kicker--pm">For product teams</span>
                <h3 class="h2">PM OS</h3>
                <p class="lead">Turn signals into decisions, and decisions into clear scope.</p>
                <div class="chip-row"><span class="chip chip--pm"><i></i>Signals</span><span class="chip chip--pm"><i></i>Options</span><span class="chip chip--pm"><i></i>PRDs</span><span class="chip chip--pm"><i></i>Outcomes</span></div>
                <a class="link-arrow link-arrow--pm" href="/pm-os.html">Explore PM OS ${icon('arrow', 18)}</a>
              </div>
              <div class="feature-stage feature-stage--pm reveal" data-delay="1">${pmApp()}
                <span class="caption-illustrative">${FICTION}</span>
              </div>
            </article>
            <article class="feature feature--flip">
              <div class="feature-copy reveal">
                <span class="kicker kicker--writer">For content and comms</span>
                <h3 class="h2">Writer OS</h3>
                <p class="lead">Draft with your sources beside you. No PRD required.</p>
                <div class="chip-row"><span class="chip chip--writer"><i></i>Briefs</span><span class="chip chip--writer"><i></i>Sources</span><span class="chip chip--writer"><i></i>Checks</span><span class="chip chip--writer"><i></i>Formats</span></div>
                <a class="link-arrow link-arrow--writer" href="/writer-os.html">Explore Writer OS ${icon('arrow', 18)}</a>
              </div>
              <div class="feature-stage feature-stage--writer reveal" data-delay="1">${writerApp()}
                <span class="caption-illustrative">${FICTION}</span>
              </div>
            </article>
            <article class="feature">
              <div class="feature-copy reveal">
                <span class="kicker kicker--public">For customer-facing teams</span>
                <h3 class="h2">Public OS</h3>
                <p class="lead">Hear customers. Share what is next. Choose who gets each update.</p>
                <div class="chip-row"><span class="chip chip--public"><i></i>Ideas</span><span class="chip chip--public"><i></i>Roadmap</span><span class="chip chip--public"><i></i>Changelog</span><span class="chip chip--public"><i></i>Sends</span></div>
                <a class="link-arrow link-arrow--public" href="/public-os.html">Explore Public OS ${icon('arrow', 18)}</a>
              </div>
              <div class="feature-stage feature-stage--public reveal" data-delay="1">${publicApp()}
                <span class="caption-illustrative">${FICTION}</span>
              </div>
            </article>
          </div>
        </div>
      </section>
` +
  journeySection({
    heading: 'Every stage. Use one product, or link them.',
    lead: 'Each product has its own stages and works alone. Link them through Suite when you want context to travel.',
    id: 'suite',
  }) +
  `      <section class="section" aria-labelledby="suite-cta-heading">
        <div class="container">
          <div class="band reveal">
            <div><h2 class="h2" id="suite-cta-heading">Suite is optional.</h2><p>Adopt one product first. Link them later.</p></div>
            <a class="btn" href="/suite.html">How Suite works ${icon('arrow', 18)}</a>
          </div>
        </div>
      </section>
` +
  connectorSection() +
  accessSection() +
  `    </main>
` +
  footer();

/* ---------- Product page template ---------- */
const productPage = (cfg) =>
  head({ title: `${cfg.name} | Clarimeld`, description: cfg.description, path: `/${cfg.id}.html` }) +
  header(cfg.id) +
  `
    <main id="main-content" tabindex="-1">
      <section class="page-hero page-hero--${cfg.key}" aria-labelledby="page-heading">
        <div class="container page-hero-grid">
          <div class="page-hero-copy">
            <a class="crumb" href="/">← Clarimeld</a>
            <span class="kicker kicker--${cfg.key}">${cfg.audience}</span>
            <h1 class="display" id="page-heading">${cfg.headline}</h1>
            <p class="lead">${cfg.lead}</p>
            <div class="hero-actions">
              <a class="btn btn-gradient" href="#contact">Contact us</a>
              <a class="btn btn-ghost" href="/suite.html">How it connects</a>
            </div>
          </div>
          <div class="page-hero-visual">${cfg.app()}
            <span class="caption-illustrative">${FICTION}</span>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="flow-heading">
        <div class="container">
          <div class="section-head section-head--center reveal">
            <span class="kicker kicker--${cfg.key}">${cfg.flowKicker}</span>
            <h2 class="h2" id="flow-heading">${cfg.flowHeading}</h2>
          </div>
          <ol class="pipeline pipeline--${cfg.key} reveal" data-delay="1">
${cfg.steps.map(([ic, t, d]) => `            <li><span class="pip-dot">${icon(ic, 24)}</span><strong>${t}</strong><span>${d}</span></li>`).join('\n')}
          </ol>
        </div>
      </section>
${cfg.middle || ''}
      <section class="section" aria-labelledby="alone-heading">
        <div class="container">
          <h2 class="sr-only" id="alone-heading">How ${cfg.name} works with the other products</h2>
          <ul class="principles reveal">
${cfg.principles.map(([t, d, amber]) => `            <li><strong>${amber ? '<i class="dot-amber"></i>' : ''}${t}</strong><span>${d}</span></li>`).join('\n')}
          </ul>
        </div>
      </section>
` +
  accessSection(`Interested in ${cfg.name}?`, `Interest in ${cfg.name}`) +
  `    </main>
` +
  footer();

pages['pm-os.html'] = () =>
  productPage({
    id: 'pm-os', key: 'pm', name: 'PM OS',
    description: 'PM OS is a workspace for product teams to gather signals, compare options, record decisions and keep scope clear.',
    audience: 'For product teams',
    headline: 'From scattered signals to <span class="gradient-text">agreed scope.</span>',
    lead: 'Gather evidence, compare options, record why, and keep scope clear.',
    app: pmApp,
    flowKicker: 'How it flows', flowHeading: 'Five steps, one thread.',
    steps: [
      ['signal', 'Signals', 'Feedback and notes in one place'],
      ['options', 'Options', 'Compare approaches, record why'],
      ['doc', 'Scope', 'PRDs with what is in and out'],
      ['flag', 'Delivery', 'Dependencies and milestones'],
      ['loop', 'Outcomes', 'Review response after release'],
    ],
    principles: [
      ['Your team decides', 'Assistive AI helps organise. Product managers choose.', true],
      ['Deferred is not promised', 'A deferred option is a recorded reason, not a future release.', false],
      ['Works alone', 'Link it to Public OS and Writer OS through Suite, or never.', false],
    ],
  });

pages['writer-os.html'] = () =>
  productPage({
    id: 'writer-os', key: 'writer', name: 'Writer OS',
    description: 'Writer OS is an editorial studio for briefs, sources, drafts and review. It works without a PRD.',
    audience: 'For content and comms teams',
    headline: 'Write with the <span class="gradient-text">sources beside you.</span>',
    lead: 'An editorial studio for briefs, drafts and review. It never needs a PRD.',
    app: writerApp,
    flowKicker: 'How it flows', flowHeading: 'From brief to finished piece.',
    steps: [
      ['calendar', 'Briefs', 'Briefs, calendars, campaigns'],
      ['book', 'Sources', 'Primary documents beside the draft'],
      ['pen', 'Draft', 'Write with context in view'],
      ['shield', 'Checks', 'Advisory flags for tone and scope'],
      ['package', 'Formats', 'Articles, notes, email kits'],
    ],
    principles: [
      ['Editors decide', 'Flags are advice. People verify claims and citations.', true],
      ['Runs standalone', 'Start from a brief. No product spec needed.', false],
      ['Links when useful', 'Pin a PM OS scope snapshot through Suite, if you use it.', false],
    ],
  });

const groupsBlock = `
      <section class="section on-ink" aria-labelledby="groups-heading">
        <div class="container groups">
          <div class="reveal">
            <svg viewBox="0 0 460 360" role="img" aria-label="Three overlapping but different groups: requesters, followers and eligible recipients.">
              <circle cx="160" cy="140" r="110" fill="#e07bff" fill-opacity=".28" stroke="#e07bff" stroke-width="2"/>
              <circle cx="300" cy="140" r="110" fill="#9d7bff" fill-opacity=".28" stroke="#9d7bff" stroke-width="2"/>
              <circle cx="230" cy="236" r="100" fill="#6aa6ff" fill-opacity=".28" stroke="#6aa6ff" stroke-width="2"/>
              <text x="110" y="120" fill="#fff" font-size="15" font-weight="650" font-family="Inter Variable, sans-serif">Requesters</text>
              <text x="318" y="120" fill="#fff" font-size="15" font-weight="650" font-family="Inter Variable, sans-serif">Followers</text>
              <text x="230" y="270" fill="#fff" font-size="15" font-weight="650" font-family="Inter Variable, sans-serif" text-anchor="middle">Eligible</text>
              <text x="230" y="290" fill="#fff" font-size="15" font-weight="650" font-family="Inter Variable, sans-serif" text-anchor="middle">recipients</text>
            </svg>
          </div>
          <div class="reveal" data-delay="1">
            <span class="kicker">Deliberate sends</span>
            <h2 class="h2" id="groups-heading">Different people. Different updates.</h2>
            <ul class="group-list">
              <li><i class="bg-orchid"></i><div><strong>Requesters</strong><span>Asked for something.</span></div></li>
              <li><i class="bg-violet"></i><div><strong>Followers</strong><span>Chose to keep up.</span></div></li>
              <li><i class="bg-sky"></i><div><strong>Eligible recipients</strong><span>Reviewed by you before any send.</span></div></li>
            </ul>
          </div>
        </div>
      </section>
`;

pages['public-os.html'] = () =>
  productPage({
    id: 'public-os', key: 'public', name: 'Public OS',
    description: 'Public OS is a customer hub for ideas, a curated roadmap and changelogs, with deliberate sends to reviewed recipients.',
    audience: 'For customer-facing teams',
    headline: 'Hear customers. <span class="gradient-text">Share what is next.</span>',
    lead: 'Collect ideas, curate a roadmap, publish changelogs, and decide who hears about each release.',
    app: publicApp,
    flowKicker: 'How it flows', flowHeading: 'From idea to update.',
    steps: [
      ['chat', 'Ideas', 'Requests, votes, comments'],
      ['shield', 'Moderate', 'Review, merge, keep it civil'],
      ['road', 'Roadmap', 'Curated by your leaders'],
      ['doc', 'Changelog', 'Authored and published by you'],
      ['bell', 'Send', 'Review recipients, then send'],
    ],
    middle: groupsBlock,
    principles: [
      ['A vote is not a promise', 'Roadmaps share intent, not launch dates.', false],
      ['A person sends', 'Publishing never emails anyone. You review, then send.', true],
      ['Works alone', 'Link it to PM OS and Writer OS through Suite, or never.', false],
    ],
  });

/* ---------- Suite ---------- */
const topology = () => `
      <section class="section" aria-labelledby="topology-heading">
        <div class="container topology reveal" data-topology data-state="standalone">
          <svg viewBox="0 0 480 400" role="img" aria-label="Three products. When standalone they sit apart. When connected through Suite, links join them.">
            <defs>
              <linearGradient id="tl1" x1="100" y1="300" x2="240" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a62ccb"/><stop offset="1" stop-color="#6d45f2"/></linearGradient>
              <linearGradient id="tl2" x1="240" y1="90" x2="380" y2="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6d45f2"/><stop offset="1" stop-color="#1f63e6"/></linearGradient>
              <linearGradient id="tl3" x1="380" y1="300" x2="100" y2="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1f63e6"/><stop offset="1" stop-color="#a62ccb"/></linearGradient>
            </defs>
            <path class="t-link" d="M128 262L212 128" stroke="url(#tl1)"/>
            <path class="t-link" d="M268 128L352 262" stroke="url(#tl2)"/>
            <path class="t-link" d="M168 310H312" stroke="url(#tl3)"/>
            <circle class="t-node" cx="240" cy="90" r="46" stroke="#6d45f2"/><g transform="translate(228 78)" color="#6d45f2">${icon('options', 24)}</g><text x="240" y="162" text-anchor="middle">PM OS</text>
            <circle class="t-node" cx="380" cy="310" r="46" stroke="#1f63e6"/><g transform="translate(368 298)" color="#1f63e6">${icon('pen', 24)}</g><text x="380" y="382" text-anchor="middle">Writer OS</text>
            <circle class="t-node" cx="100" cy="310" r="46" stroke="#a62ccb"/><g transform="translate(88 298)" color="#a62ccb">${icon('globe', 24)}</g><text x="100" y="382" text-anchor="middle">Public OS</text>
          </svg>
          <div class="topology-copy">
            <h2 class="h2" id="topology-heading">Standalone first.</h2>
            <div class="mode-switch mode-switch--light" role="group" aria-label="Show products">
              <button type="button" aria-pressed="true" data-topology-mode="standalone">Standalone</button>
              <button type="button" aria-pressed="false" data-topology-mode="connected">Connected</button>
            </div>
            <p class="topology-note" data-topology-note aria-live="polite">Use one, two or all three. Nothing else is required.</p>
          </div>
        </div>
      </section>
`;

const linksBlock = `
      <section class="section" aria-labelledby="links-heading">
        <div class="container">
          <div class="section-head reveal">
            <span class="kicker">What travels</span>
            <h2 class="h2" id="links-heading">Four optional links.</h2>
          </div>
          <ul class="links-flow">
            <li class="reveal"><div class="link-pair"><span class="tag tag--public">Public OS</span><span class="arrow">${icon('arrow', 16)}</span><span class="tag tag--pm">PM OS</span></div><strong>Customer signals</strong><p>A product manager brings feedback themes into discovery.</p><span class="opt"><i class="dot-amber"></i>Person decides</span></li>
            <li class="reveal" data-delay="1"><div class="link-pair"><span class="tag tag--pm">PM OS</span><span class="arrow">${icon('arrow', 16)}</span><span class="tag tag--writer">Writer OS</span></div><strong>Agreed scope</strong><p>A writer pins the locked scope snapshot beside the draft.</p><span class="opt"><i class="dot-amber"></i>Person decides</span></li>
            <li class="reveal" data-delay="2"><div class="link-pair"><span class="tag tag--writer">Writer OS</span><span class="arrow">${icon('arrow', 16)}</span><span class="tag tag--public">Public OS</span></div><strong>Release note</strong><p>A comms lead loads the draft, then reviews and publishes it.</p><span class="opt"><i class="dot-amber"></i>Person decides</span></li>
            <li class="reveal" data-delay="3"><div class="link-pair"><span class="tag tag--public">Public OS</span><span class="arrow">${icon('arrow', 16)}</span><span class="tag tag--pm">PM OS</span></div><strong>Customer replies</strong><p>A triage lead tags replies for the next round of discovery.</p><span class="opt"><i class="dot-amber"></i>Person decides</span></li>
          </ul>
        </div>
      </section>
`;

pages['suite.html'] = () =>
  head({
    title: 'Clarimeld Suite | Clarimeld',
    description: 'Clarimeld Suite is an optional link between PM OS, Writer OS and Public OS, so context can travel with the work.',
    path: '/suite.html',
  }) +
  header('suite') +
  `
    <main id="main-content" tabindex="-1">
      <section class="page-hero page-hero--suite" aria-labelledby="page-heading">
        <div class="container page-hero-grid">
          <div class="page-hero-copy">
            <a class="crumb" href="/">← Clarimeld</a>
            <span class="kicker">Clarimeld Suite</span>
            <h1 class="display" id="page-heading">Connect when <span class="gradient-text">you are ready.</span></h1>
            <p class="lead">Each product works alone. Link them, and context can travel with the work.</p>
            <div class="hero-actions">
              <a class="btn btn-gradient" href="#contact">Contact us</a>
              <a class="btn btn-ghost" href="#journey">See the example</a>
            </div>
          </div>
          <div class="page-hero-visual">${suiteStory()}
          </div>
        </div>
      </section>
` +
  topology() +
  journeySection({
    heading: 'The full journey, and where links are optional.',
    lead: 'Each product has its own stages. Suite adds four optional links between them, and a person acts at every handoff.',
    id: 'journey',
  }) +
  linksBlock +
  connectorSection() +
  accessSection('Interested in Suite?', 'Interest in Clarimeld Suite') +
  `    </main>
` +
  footer();

for (const [file, build] of Object.entries(pages)) {
  writeFileSync(resolve(ROOT, file), build());
  console.log('wrote', file);
}
