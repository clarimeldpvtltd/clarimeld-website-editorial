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
            <p>Send us an email at the address below. The button opens your own email app, and you send the email from there. This website has no contact form.</p>
            <a class="btn btn-gradient contact-mail" href="mailto:info@clarimeld.com${topic ? `?subject=${encodeURIComponent(topic)}` : ''}">info@clarimeld.com</a>
          </div>
        </div>
      </section>
`;

/* ----------------------------------------------------- product illustrations */
const FICTION = 'Illustrative example with fictional data. Northline Workflows is a fictional company, not a customer story or a product screen.';

const pmApp = (extra = '') => `
        <figure class="app app--pm ${extra}" role="img" aria-label="Illustration of PM OS for the fictional company Northline Workflows. Evidence on the left: regional teams need different approval paths; a single global rule does not fit every customer; and a separate request to script custom approval rules. In the middle, two options: regional approval paths are chosen because they address a shared need while keeping the first release manageable; custom rule scripting is deferred because it needs further discovery. On the right, what the team sees: the decision to start with regional approval paths, what is in the first release, what is not, and an open question about terminology. The product lead decides.">
          <div class="app-bar"><span class="app-dots"><i></i><i></i><i></i></span><span class="app-title">Northline Workflows · Approval controls</span><span class="app-tag">Illustration</span></div>
          <div class="app-body pm-body" aria-hidden="true">
            <div class="pane">
              <h4>Evidence</h4>
              <div class="item"><span class="item-title">Regional teams need different approval paths.</span><span class="tag tag--public">Customer</span></div>
              <div class="item"><span class="item-title">A single global rule doesn't fit every customer.</span><span class="tag">Support note</span></div>
              <div class="item item--muted"><span class="item-title">Let us script our own approval rules.</span><span class="tag">Separate request</span></div>
            </div>
            <div class="pane">
              <h4>Options</h4>
              <div class="item item--active"><div class="item-row"><span class="item-title">Regional approval paths</span><span class="tag tag--pm">Chosen</span></div><span class="item-sub">Addresses a shared need while keeping the first release manageable.</span></div>
              <div class="item item--muted"><div class="item-row"><span class="item-title">Custom rule scripting</span><span class="tag">Deferred</span></div><span class="item-sub">Needs further discovery.</span></div>
            </div>
            <div class="pane">
              <h4>Decision record</h4>
              <p class="item-title">Start with regional approval paths.</p>
              <span class="item-sub">First release</span>
              <ul class="scope-list"><li>Approval paths by region</li></ul>
              <span class="item-sub">Not now</span>
              <ul class="scope-list scope-list--out"><li>Custom rule scripting</li></ul>
              <div class="lock-row">${icon('flag', 14)} Open: what do we call a region's approval path?</div>
              <span class="tag tag--amber">Product lead decides</span>
            </div>
          </div>
        </figure>`;

const writerApp = (extra = '') => `
        <figure class="app app--writer ${extra}" role="img" aria-label="Illustration of Writer OS for the fictional company Northline Workflows. A brief asks the writer to explain how administrators select a region and assign an approval path. The source beside it is the decision summary: start with regional approval paths; custom rule scripting needs further discovery. The draft sentence says administrators select a region and assign an approval path, with the term approval path marked. The review note says to confirm the terminology with the product owner before publication. The review is still open and an editor decides.">
          <div class="app-bar"><span class="app-dots"><i></i><i></i><i></i></span><span class="app-title">Northline Workflows · Guidance</span><span class="app-tag">Illustration</span></div>
          <div class="app-body writer-body" aria-hidden="true">
            <div class="pane">
              <h4>Brief and source</h4>
              <div class="item"><span class="item-title">Explain how administrators select a region and assign an approval path.</span><span class="tag tag--writer">Brief</span></div>
              <div class="doc-pin"><strong>${icon('book', 14)} Decision summary · Regional approval paths</strong><span class="item-sub">Start with regional approval paths. Custom rule scripting needs further discovery.</span></div>
            </div>
            <div class="pane">
              <h4>Draft</h4>
              <p class="item-title">Administrators select a region and assign an <span class="hl">approval path</span>.</p>
              <div class="flag">Review note · Confirm the terminology with the product owner before publication.</div>
            </div>
            <div class="pane">
              <h4>Review</h4>
              <div class="item"><div class="item-row"><span class="item-title">Terminology</span><span class="tag">To confirm</span></div><span class="item-sub">With the product owner</span></div>
              <span class="tag tag--amber">Editor decides</span>
            </div>
          </div>
        </figure>`;

const publicApp = (extra = '') => `
        <figure class="app app--public ${extra}" role="img" aria-label="Illustration of Public OS for the fictional company Northline Workflows, with what customers see kept separate from the team's work. Customers see a request, regional teams need different approval paths, and a roadmap item, regional approval paths, marked under consideration. The team side holds an update draft titled regional approval paths, not published yet, and one item not shared yet: custom rule scripting, which needs further discovery. The team chooses what to share.">
          <div class="app-bar"><span class="app-dots"><i></i><i></i><i></i></span><span class="app-title">Northline Workflows · Customer hub</span><span class="app-tag">Illustration</span></div>
          <div class="app-body public-body" aria-hidden="true">
            <div class="pane">
              <h4>Customers see</h4>
              <div class="tabs-mini"><span class="on">Requests</span><span>Roadmap</span><span>Updates</span></div>
              <div class="item item--public"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Regional teams need different approval paths.</span></div></div>
              <div class="item"><div class="item-row"><span class="item-title">Regional approval paths</span><span class="tag tag--public">Under consideration</span></div><span class="item-sub">Roadmap · a direction, not a date</span></div>
            </div>
            <div class="pane">
              <h4>Your team</h4>
              <div class="item"><div class="item-row"><span class="item-title">Update draft · Regional approval paths</span><span class="tag">Draft</span></div><span class="item-sub">Not published yet.</span></div>
              <h4>Not shared yet</h4>
              <div class="item item--muted"><span class="item-title">Custom rule scripting</span><span class="item-sub">Needs further discovery.</span></div>
              <span class="tag tag--amber">Team chooses what to share</span>
            </div>
          </div>
        </figure>`;

/* ----------------------------------------------------------------- journey */
const appFrame = (title, aria, body) => `<figure class="app" role="img" aria-label="${aria}">
            <div class="app-bar"><span class="app-dots"><i></i><i></i><i></i></span><span class="app-title">${title}</span><span class="app-tag">Illustration</span></div>
            <div class="single-pane" aria-hidden="true">${body}
            </div></figure>`;

// Nine narrative beats of one fictional example (Northline Workflows). They run in time order; they are a story, not a claim about how many formal stages a product has.
// `when` = explicit chronology label. `alone` = how the product works without the others. `branch` = an optional side path.
const JOURNEY = [
  {
    key: 'ask', product: 'public', tag: 'Public OS', when: 'Before the decision', title: 'Customers ask',
    text: 'Customers describe what they need in their own words. A vote is a signal, not a promise.',
    link: 'Starts in Public OS, or from your own notes',
    branch: ['Discussion and moderation', 'Your team merges duplicates and keeps threads on topic.'],
    app: appFrame('Northline Workflows · Requests', 'Illustration of Public OS: two customer requests. Regional teams need different approval paths. Let us script our own approval rules. Requests also arrive in calls and support tickets, which can be added in the next step.', `
              <div class="item item--public"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Regional teams need different approval paths.</span></div><span class="item-sub">Customer request</span></div>
              <div class="item"><div class="who"><span class="vote">${voteIcon}</span><span class="item-title">Let us script our own approval rules.</span></div><span class="item-sub">Customer request</span></div>
              <span class="item-sub">Requests also arrive in calls and support tickets. Those come in next.</span>`),
  },
  {
    key: 'frame', product: 'pm', tag: 'PM OS', when: 'Before the decision', title: 'Frame the problem',
    text: 'A product manager reads the evidence side by side. Some needs pull in different directions, so the first job is to understand the problem, not to create an idea.',
    alone: 'PM OS works from your own notes and tickets too. It does not need Public OS.',
    link: 'Optional link: Public OS → PM OS',
    app: appFrame('Northline Workflows · Evidence', 'Illustration of PM OS: four pieces of evidence and the product question. Regional teams need different approval paths, from a customer conversation. A single global rule does not fit every customer, from a support note. Central administrators still want to see every approval path in one place, from a customer conversation. Let us script our own approval rules, a separate customer request. The question: how might administrators configure approval paths by region without creating separate workflows? The product manager decides what matters.', `
              <div class="item"><div class="item-row"><span class="item-title">Regional teams need different approval paths.</span><span class="tag tag--public">Need</span></div><span class="item-sub">Customer conversation</span></div>
              <div class="item"><div class="item-row"><span class="item-title">A single global rule doesn't fit every customer.</span><span class="tag">Need</span></div><span class="item-sub">Support note</span></div>
              <div class="item"><div class="item-row"><span class="item-title">Central administrators still want to see every approval path in one place.</span><span class="tag">Pulls the other way</span></div><span class="item-sub">Customer conversation</span></div>
              <div class="item item--muted"><div class="item-row"><span class="item-title">Let us script our own approval rules.</span><span class="tag">Separate request</span></div><span class="item-sub">Customer request</span></div>
              <div class="item item--active"><span class="item-sub">Product question</span><p class="item-title">How might administrators configure approval paths by region without creating separate workflows?</p></div>
              <div class="item-row"><span class="item-sub">Conflicting needs are framed, not averaged.</span><span class="tag tag--amber">Product manager decides</span></div>`),
  },
  {
    key: 'choose', product: 'pm', tag: 'PM OS', when: 'The decision', title: 'Choose, and record why',
    text: 'The team compares two approaches and records the choice, the reason and the option it set aside. Deferring is a recorded reason, not a promise to build it later.',
    link: 'Inside PM OS',
    app: appFrame('Northline Workflows · Options', 'Illustration of PM OS: two options. Regional approval paths are chosen. The decision is to start with regional approval paths. The rationale is that it addresses a shared need while keeping the first release manageable. Custom rule scripting is deferred because it needs further discovery. The product lead decides.', `
              <div class="item item--active"><div class="item-row"><span class="item-title">Regional approval paths</span><span class="tag tag--pm">Chosen</span></div><span class="item-sub">Decision: Start with regional approval paths.</span><span class="item-sub">Why: Addresses a shared need while keeping the first release manageable.</span></div>
              <div class="item item--muted"><div class="item-row"><span class="item-title">Custom rule scripting</span><span class="tag">Deferred</span></div><span class="item-sub">Needs further discovery.</span></div>
              <div class="item-row"><span class="item-sub">The reason stays with the decision.</span><span class="tag tag--amber">Product lead decides</span></div>`),
  },
  {
    key: 'context', product: 'pm', tag: 'PM OS', when: 'The decision', title: 'Context a colleague can pick up',
    text: 'The record keeps the decision, the scope, the open questions and the deferred option together. An engineer or designer can read it without finding the right chat thread.',
    link: 'Inside PM OS',
    branch: ['Delivery coordination', 'Teams can track dependencies and release milestones so people coordinate. Clarimeld does not build or deploy anything.'],
    app: appFrame('Northline Workflows · Decision record', 'Illustration of PM OS: a decision record for engineering and design. Decision: start with regional approval paths. In the first release: approval paths by region. Not now: custom rule scripting, which needs further discovery. Open questions: what do we call a region\'s approval path, and how will central administrators see every path.', `
              <div class="item item--active"><span class="item-title">Start with regional approval paths.</span><span class="item-sub">Addresses a shared need while keeping the first release manageable.</span></div>
              <h4>In the first release</h4>
              <ul class="scope-list"><li>Approval paths by region</li></ul>
              <h4>Not now</h4>
              <ul class="scope-list scope-list--out"><li>Custom rule scripting · needs further discovery</li></ul>
              <h4>Open questions</h4>
              <div class="item"><span class="item-title">What do we call a region's approval path?</span></div>
              <div class="item"><span class="item-title">How will central administrators see every path?</span></div>`),
  },
  {
    key: 'brief', product: 'writer', tag: 'Writer OS', when: 'Before sharing', title: 'Start from the agreed context',
    text: 'A technical writer starts from a brief and keeps the decision summary beside the draft, instead of asking what was decided.',
    alone: 'Writer OS projects start from a brief. They do not need a PM OS record.',
    link: 'Optional link: PM OS → Writer OS',
    app: appFrame('Northline Workflows · Brief', 'Illustration of Writer OS: a brief to explain how administrators select a region and assign an approval path. The source beside it is the decision summary. It says to start with regional approval paths, and that custom rule scripting needs further discovery.', `
              <div class="item"><div class="item-row"><span class="item-title">Explain how administrators select a region and assign an approval path.</span><span class="tag tag--writer">Brief</span></div></div>
              <div class="doc-pin"><strong>${icon('book', 14)} Decision summary · Regional approval paths</strong><span class="item-sub">Start with regional approval paths. Custom rule scripting needs further discovery.</span></div>
              <span class="item-sub">The source sits beside the draft. Nothing is written yet.</span>`),
  },
  {
    key: 'review', product: 'writer', tag: 'Writer OS', when: 'Before sharing', title: 'Draft, then a person reviews',
    text: 'The writer drafts guidance with the source in view. A reviewer raises a question about wording. People decide what goes out.',
    link: 'Inside Writer OS',
    branch: ['Advisory flags', 'Writer OS describes advisory voice and scope flags for editors. They are advice. People verify claims and citations.'],
    app: appFrame('Northline Workflows · Draft and review', 'Illustration of Writer OS: a draft sentence, administrators select a region and assign an approval path, with the term approval path marked. The review note says to confirm the terminology with the product owner before publication. The review is open and an editor decides.', `
              <div class="doc-pin"><strong>${icon('book', 14)} Decision summary · Regional approval paths</strong><span class="item-sub">Start with regional approval paths.</span></div>
              <h4>Draft</h4>
              <p class="item-title">Administrators select a region and assign an <span class="hl">approval path</span>.</p>
              <div class="flag">Review note · Confirm the terminology with the product owner before publication.</div>
              <div class="item-row"><span class="item-sub">The question is open. Nothing is approved yet.</span><span class="tag tag--amber">Editor decides</span></div>`),
  },
  {
    key: 'share', product: 'public', tag: 'Public OS', when: 'Customer update', title: 'Choose what to share',
    text: 'The customer-facing team decides what customers should see. Here: a clear status, a drafted update, and one item held back for now.',
    link: 'Optional link: Writer OS → Public OS',
    branch: ['Curated roadmap', 'Leaders choose which items customers can see. A roadmap card shows intention, not a delivery date.'],
    app: appFrame('Northline Workflows · What to share', 'Illustration of Public OS: the team decides what to share. The roadmap item, regional approval paths, is under consideration, a direction and not a date. An update draft is not published yet. Custom rule scripting is not shared yet because it needs further discovery. The team chooses what to share.', `
              <div class="item item--public"><div class="item-row"><span class="item-title">Regional approval paths</span><span class="tag tag--public">Under consideration</span></div><span class="item-sub">Shared as a direction, not a delivery date.</span></div>
              <div class="item"><div class="item-row"><span class="item-title">Update draft · Regional approval paths</span><span class="tag">Draft</span></div><span class="item-sub">Reviewed wording, not published yet.</span></div>
              <div class="item item--muted"><div class="item-row"><span class="item-title">Custom rule scripting</span><span class="tag">Not shared yet</span></div><span class="item-sub">Needs further discovery.</span></div>
              <div class="item-row"><span class="item-sub">Request, consideration and release stay distinct.</span><span class="tag tag--amber">Team chooses what to share</span></div>`),
  },
  {
    key: 'publish', product: 'public', tag: 'Public OS', when: 'Later, when the release is ready', title: 'A reviewed update is published',
    text: 'When the release is ready, a person reviews the update and publishes it. Publishing does not email anyone by itself.',
    alone: 'You can also write an update directly in Public OS.',
    link: 'Inside Public OS',
    branch: ['Who hears', 'Optionally, a person reviews the eligible recipients and then sends. Requesters, followers and other eligible recipients are separate groups.'],
    app: appFrame('Northline Workflows · Updates', 'Illustration of Public OS, later, when the release is ready. An update titled regional approval paths is marked released. It says administrators can select a region and assign an approval path. A person reviews and publishes it.', `
              <div class="item item--public"><div class="item-row"><span class="item-title">Regional approval paths</span><span class="tag tag--public">Released</span></div><p class="item-sub">Administrators can select a region and assign an approval path.</p></div>
              <div class="item-row"><span class="mini-btn">Review, then publish</span><span class="tag tag--amber">A person publishes</span></div>
              <span class="item-sub">Publishing does not email anyone. Sending is a separate, deliberate step.</span>`),
  },
  {
    key: 'feedback', product: 'public', tag: 'Public OS', when: 'After the update', title: 'Feedback comes back',
    text: 'A customer replies. A person decides whether it belongs in discovery. It is feedback for the next round, not proof the release worked, and not a commitment.',
    link: 'Optional link: Public OS → PM OS',
    branch: ['Not every reply starts new work', 'A person decides which replies become evidence for a future cycle.'],
    app: appFrame('Northline Workflows · Feedback', 'Illustration of Public OS: a customer reply says we would also like to write our own rules. A person tags it for PM OS discovery. Custom rule scripting still needs further discovery. It is feedback, not a commitment.', `
              <div class="item"><div class="who"><span class="avatar avatar--b"></span><span class="item-title">We would also like to write our own rules.</span></div><span class="item-sub">Customer reply · after the update</span></div>
              <div class="item-row"><span class="arrow-chip"><span class="tag tag--public">Public OS</span>${icon('arrow', 14)}<span class="tag tag--pm">PM OS · Discovery</span></span><span class="tag tag--amber">A person tags it</span></div>
              <span class="item-sub">Custom rule scripting still needs further discovery. A reply is not a commitment.</span>`),
  },
];

// The documented groups of each product (capability source map, section 3). `step` = the example beat that shows it.
const LANES = [
  { key: 'pm', name: 'PM OS', line: 'Decide what to build, and why', stages: [['Discovery and signals', 2], ['Strategy and trade-offs', 3], ['PRDs and agreed boundaries', 4], ['Execution coordination', 4], ['Outcomes and insights', 9]] },
  { key: 'writer', name: 'Writer OS', line: 'Write from what was agreed', stages: [['Intake and briefs', 5], ['Primary sources', 5], ['Voice and scope checks', 6], ['Editorial checkpoints and packaging', 6]] },
  { key: 'public', name: 'Public OS', line: 'Hear customers, share what is next', stages: [['Ideas and voting', 1], ['Discussion and moderation', 1], ['Curated public roadmap', 7], ['Published changelogs', 8], ['Deliberate cohort sends', 8], ['Closed-loop feedback', 9]] },
];

// Optional links between products through Suite (source map section 4: T1, T4, T6, T8)
const SUITE_LINKS = [
  ['Public OS', 'PM OS', 'Feedback ingestion', 'pm', 2],
  ['PM OS', 'Writer OS', 'Boundary feed', 'writer', 5],
  ['Writer OS', 'Public OS', 'Release communication', 'public', 7],
  ['Public OS', 'PM OS', 'Closed-loop feedback', 'pm', 9],
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
            <h2 class="h2" id="connector-heading">Connector: our vision</h2>
            <p class="lead">Our vision: Connector would link Clarimeld with other tools your teams use. Each product works on its own.</p>
          </div>
          <ul class="connector-rail reveal" role="list" aria-label="Example tool names, not confirmed integrations" data-delay="1">
${CONNECTORS.map(connectorTile).join('\n')}
          </ul>
          <p class="connector-note reveal" data-delay="2">These are examples of tools teams use, listed to illustrate the idea. Listing a name is not a claim that it is a confirmed, available or committed connection or a customer connector, and we have not confirmed how any of them would connect. Names belong to their owners; Clarimeld is not affiliated with or endorsed by them.</p>
        </div>
      </section>
`;

const journeySection = ({ heading, lead, id = 'journey' }) => `
      <section id="${id}" class="section on-ink" aria-labelledby="${id}-heading">
        <div class="container">
          <div class="section-head reveal">
            <span class="kicker">Example workflow</span>
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
            <p>Northline Workflows is a fictional, established B2B software provider with enterprise customers in several regions. Those customers want more flexible approval controls, and different regions have different needs. Northline's team has to decide what to build first, explain it accurately and tell customers what to expect. Regional approval paths are Northline's feature, not a Clarimeld feature. This is an illustrative example, not a customer story: every name, quote and status is made up. The steps run in time order and do not show how any step is built.</p>
          </div>
          <div class="journey reveal" data-journey data-delay="1">
            <div class="j-steps" role="tablist" aria-label="Steps in the example">
${JOURNEY.map((s, i) => `              <button type="button" class="j-step" role="tab" id="${id}-tab-${i}" aria-controls="${id}-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-product="${s.product}"><span class="j-num">${i + 1}</span><span class="j-label"><strong>${s.title}</strong><small>${s.tag}</small></span></button>`).join('\n')}
            </div>
            <div class="j-stage" data-product="${JOURNEY[0].product}" data-journey-stage>
${JOURNEY.map((s, i) => `              <div class="j-panel" role="tabpanel" id="${id}-panel-${i}" aria-labelledby="${id}-tab-${i}" data-product="${s.product}"${i === 0 ? '' : ' data-initially-hidden'} tabindex="0">
                <div class="j-progress" aria-hidden="true"><i class="p${i + 1}"></i></div>
                <div class="j-panel-head"><span class="j-when">${s.when}</span><h3>${i + 1}. ${s.title}</h3><p>${s.text}</p></div>
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
            <span>Illustrative example with fictional data, not product screens</span>
          </div>
        </div>
      </section>
`;

/* Home hero: a chain of four moments of one fictional example: evidence, decision, reviewed content, customer communication. Home only. */
const heroStory = () => `
            <div class="hs" role="group" aria-label="Illustration: one fictional example from Northline Workflows, in four linked moments. Evidence in PM OS: regional teams need different approval paths. A decision in PM OS: start with regional approval paths. Reviewed content in Writer OS: explain how administrators select a region and assign an approval path. Customer communication in Public OS: regional approval paths, under consideration. A person is responsible at each step, and each link between products is optional.">
              <article class="app hs-card hs-card--pm hs-n1">
                <div class="hs-head"><a class="hs-prod" href="/pm-os.html">PM OS</a><span class="hs-stage">Evidence</span></div>
                <p class="sr-only">PM OS, the evidence: regional teams need different approval paths, and a single global rule does not fit every customer.</p>
                <div class="hs-body" aria-hidden="true">
                  <div class="item"><span class="item-title">Regional teams need different approval paths.</span></div>
                  <div class="item"><span class="item-title">A single global rule doesn't fit every customer.</span></div>
                </div>
              </article>
              <div class="hs-thread" aria-hidden="true"><span class="hs-thread-line"></span></div>
              <article class="app hs-card hs-card--pm hs-n2">
                <div class="hs-head"><a class="hs-prod" href="/pm-os.html">PM OS</a><span class="hs-stage">Decision</span></div>
                <p class="sr-only">PM OS, the decision: start with regional approval paths. Custom rule scripting needs further discovery. A product lead decides.</p>
                <div class="hs-body" aria-hidden="true">
                  <div class="item item--active"><div class="item-row"><span class="item-title">Start with regional approval paths.</span><span class="tag tag--pm">Chosen</span></div><span class="item-sub">Custom rule scripting needs further discovery.</span></div>
                  <span class="tag tag--amber hs-decide">Product lead decides</span>
                </div>
              </article>
              <div class="hs-thread" aria-hidden="true"><span class="hs-thread-line"></span><span class="hs-thread-label">Optional link</span></div>
              <article class="app hs-card hs-card--writer hs-n3">
                <div class="hs-head"><a class="hs-prod" href="/writer-os.html">Writer OS</a><span class="hs-stage">Reviewed content</span></div>
                <p class="sr-only">Writer OS, the reviewed content: explain how administrators select a region and assign an approval path. An editor reviews.</p>
                <div class="hs-body" aria-hidden="true">
                  <span class="hs-draft">Explain how administrators select a region and assign an approval path.</span>
                  <span class="tag tag--amber hs-decide">Editor reviews</span>
                </div>
              </article>
              <div class="hs-thread" aria-hidden="true"><span class="hs-thread-line"></span><span class="hs-thread-label">Optional link</span></div>
              <article class="app hs-card hs-card--public hs-n4">
                <div class="hs-head"><a class="hs-prod" href="/public-os.html">Public OS</a><span class="hs-stage">Customer communication</span></div>
                <p class="sr-only">Public OS, the customer communication: regional approval paths, shown as under consideration. The team chooses what to share.</p>
                <div class="hs-body" aria-hidden="true">
                  <div class="item item--public"><div class="item-row"><span class="item-title">Regional approval paths</span><span class="tag tag--public">Under consideration</span></div></div>
                  <span class="tag tag--amber hs-decide">Team chooses what to share</span>
                </div>
              </article>
              <p class="hs-note">Illustrative example with fictional data: Northline Workflows. Each product also works on its own.</p>
            </div>`;

/* Suite hero: three products that start apart, then show their optional links. Suite page only. */
const suiteStory = () => `
            <div class="ss" role="group" aria-label="Illustration: Public OS, PM OS and Writer OS each work on their own. Clarimeld Suite adds optional links between them.">
              <div class="ss-row">
                <article class="app ss-card ss-card--public"><a class="hs-prod" href="/public-os.html">Public OS</a><p class="ss-line">Hear customers, share what is next</p></article>
                <span class="ss-link" aria-hidden="true"><i></i><b>Optional</b></span>
                <article class="app ss-card ss-card--pm"><a class="hs-prod" href="/pm-os.html">PM OS</a><p class="ss-line">Decide what to build, and why</p></article>
                <span class="ss-link" aria-hidden="true"><i></i><b>Optional</b></span>
                <article class="app ss-card ss-card--writer"><a class="hs-prod" href="/writer-os.html">Writer OS</a><p class="ss-line">Write from what was agreed</p></article>
              </div>
              <div class="ss-suite" aria-hidden="true"><span class="ss-suite-name">Clarimeld Suite</span><span class="ss-suite-line">Links are optional. A person acts at every handoff.</span></div>
              <p class="hs-note">Each product works on its own. Suite only adds the links you choose.</p>
            </div>`;

/* Value sections: why the work is hard, and what gets easier for the person, their team and leadership. */
const valueSection = ({ key, kicker, heading, hard, cols, note }) => `
      <section class="section section--tight value" aria-labelledby="value-heading-${key}">
        <div class="container">
          <div class="section-head reveal">
            <span class="kicker${['pm', 'writer', 'public'].includes(key) ? ` kicker--${key}` : ''}">${kicker}</span>
            <h2 class="h2" id="value-heading-${key}">${heading}</h2>
            <p class="lead">${hard}</p>
          </div>
          <ul class="value-grid reveal" data-delay="1">
${cols.map(([who, text]) => `            <li><span class="value-who">${who}</span><span class="value-text">${text}</span></li>`).join('\n')}
          </ul>
          <p class="ai-note reveal" data-delay="2">${note}</p>
        </div>
      </section>
`;

const homeValue = () => `
      <section id="value" class="section section--tight value" aria-labelledby="value-heading-home">
        <div class="container">
          <div class="section-head reveal">
            <span class="kicker">What gets easier</span>
            <h2 class="h2" id="value-heading-home">Different people carry different parts of one decision.</h2>
            <p class="lead">In an established software company, the people who hear customers, decide and explain are rarely the same people. Each one needs the context the others have.</p>
          </div>
          <ul class="value-grid reveal" data-delay="1">
${[
  ['Product managers', 'PM OS', [['You', 'Weigh competing needs and record why.'], ['Your team', 'Starts from one shared record.'], ['Leaders', 'See what was chosen and what was deferred.']]],
  ['Writers and editors', 'Writer OS', [['You', 'Write from the agreed source, not a guess.'], ['Your team', 'Fewer disconnected handoffs.'], ['Leaders', 'A review step stays visible.']]],
  ['Customer-facing teams', 'Public OS', [['You', 'Share what is appropriate, in clear words.'], ['Customers', 'See what is requested, considered or released, and reply.'], ['Leaders', 'Choose what is shared. A roadmap is not a date.']]],
].map(([who, prod, lines]) => `            <li><span class="value-who">${prod}</span><strong>${who}</strong>${lines.map(([l, t]) => `<span class="value-text"><b>${l}.</b> ${t}</span>`).join('')}</li>`).join('\n')}
          </ul>
          <p class="ai-note reveal" data-delay="2">Already use ChatGPT or Claude? Keep using them to think and draft. Clarimeld is for the record around that thinking: the evidence, the decision, the review and the update, kept where the team can find and share them. People decide at every step.</p>
        </div>
      </section>
`;

const pages = {};

/* ---------- Home ---------- */
pages['index.html'] = () =>
  head({
    title: 'Clarimeld: From customer needs to clear product decisions and communication',
    description: 'Clarimeld helps product, content and customer-facing teams weigh customer needs, record decisions, explain them clearly and share updates. Three products that work alone or link through Suite.',
    path: '/',
  }) +
  header('home') +
  `
    <main id="main-content" tabindex="-1">
      <section class="hero" aria-labelledby="hero-heading">
        <div class="container hero-grid">
          <div class="hero-copy">
            <h1 class="display" id="hero-heading">From customer needs to clear product decisions <span class="gradient-text">and communication.</span></h1>
            <p class="lead">Three products for the hard, human work in between: weighing competing needs, recording why, and explaining it clearly. Use one, or link them through Suite.</p>
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
            <p class="lead">In a large software company, the reason behind a decision rarely travels with it. Customers ask, product decides, content explains, and each team rebuilds the story from chats and documents.</p>
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
              <rect class="node-card" x="0" y="45" width="260" height="150" rx="22"/><text class="node-title" x="28" y="112">Customers ask</text><text class="node-sub" x="28" y="142">Requests in many places</text>
              <rect class="node-card" x="350" y="45" width="260" height="150" rx="22"/><text class="node-title" x="378" y="112">Product decides</text><text class="node-sub" x="378" y="142">The decision, and why</text>
              <rect class="node-card" x="700" y="45" width="260" height="150" rx="22"/><text class="node-title" x="728" y="112">Content explains</text><text class="node-sub" x="728" y="142">Guidance and updates</text>
              <path class="wire wire--broken" d="M272 120H338"/><path class="wire wire--broken" d="M622 120H688"/>
              <text class="lost" x="305" y="104" text-anchor="middle">?</text><text class="lost" x="655" y="104" text-anchor="middle">?</text>
              <path class="wire wire--linked" d="M262 120H348" stroke="url(#gw1)"/><path class="wire wire--linked" d="M612 120H698" stroke="url(#gw2)"/>
              <circle class="pulse" cx="266" cy="120" r="6" fill="#fff"/><circle class="pulse pulse-2" cx="616" cy="120" r="6" fill="#fff"/>
            </svg>
            <ol class="gap-mobile" data-state="separate">
              <li><strong>Customers ask</strong><span>Requests in many places</span></li>
              <li><strong>Product decides</strong><span>The decision, and why</span></li>
              <li><strong>Content explains</strong><span>Guidance and updates</span></li>
            </ol>
          </div>
          <p class="gap-note" data-gap-note aria-live="polite">Separate tools. Each team rebuilds the story.</p>
        </div>
      </section>
${homeValue()}
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
                <p class="lead">Weigh competing needs, choose, and keep the reason where your team can find it.</p>
                <div class="chip-row"><span class="chip chip--pm"><i></i>Evidence</span><span class="chip chip--pm"><i></i>Options</span><span class="chip chip--pm"><i></i>Scope</span><span class="chip chip--pm"><i></i>Outcomes</span></div>
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
                <p class="lead">Write from the agreed source, with a person reviewing before it goes out.</p>
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
                <p class="lead">Help customers see what is requested, considered or released, and hear back.</p>
                <div class="chip-row"><span class="chip chip--public"><i></i>Requests</span><span class="chip chip--public"><i></i>Roadmap</span><span class="chip chip--public"><i></i>Updates</span><span class="chip chip--public"><i></i>Sends</span></div>
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
    heading: 'One example, three points of view.',
    lead: 'Follow one fictional decision from customer need to customer update. Each product is useful on its own. Suite only adds the links you choose.',
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

${cfg.value || ''}
      <section class="section" aria-labelledby="flow-heading">
        <div class="container">
          <div class="section-head section-head--center reveal">
            <span class="kicker kicker--${cfg.key}">${cfg.flowKicker}</span>
            <h2 class="h2" id="flow-heading">${cfg.flowHeading}</h2>
          </div>
          <ol class="pipeline pipeline--${cfg.key} pipeline--n${cfg.steps.length} reveal" data-delay="1">
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
    description: 'PM OS brings customer evidence, options, the reason for a decision and what was deferred into one place, so product, engineering and design share the same context.',
    audience: 'For product managers, designers and product leaders',
    headline: 'From competing needs to a <span class="gradient-text">decision your team can find.</span>',
    lead: 'Bring customer evidence, options, the reason you chose and what you deferred into one place, so product, engineering and design start from the same context.',
    app: pmApp,
    value: valueSection({
      key: 'pm', kicker: 'Why it matters', heading: 'Hard to decide well when the evidence is everywhere.',
      hard: 'In an established software company, feedback sits in sales calls, support tickets and chat threads. Different customers want different things, and by the time something is decided, the reasoning is scattered.',
      cols: [['For you', 'See competing needs side by side, make the call, and write down why.'], ['For your team', 'Engineering and design read the decision, the scope and the open questions in one place, not a chat transcript.'], ['For leadership', 'See what was chosen, what was deferred and why, and revisit it when new evidence arrives.']],
      note: 'Already use ChatGPT or Claude? Keep using them to think and draft. PM OS is for the record around that thinking: the evidence, the decision and the deferred option, kept where the team can revisit and share them. Assistive AI helps organise. Product managers choose.',
    }),
    flowKicker: 'How it flows', flowHeading: 'From evidence to a shared decision.',
    steps: [
      ['signal', 'Signals', 'Customer needs side by side'],
      ['options', 'Options', 'Compare approaches, record why'],
      ['doc', 'Scope', 'What is in, out and deferred'],
      ['flag', 'Delivery', 'Dependencies and milestones people track'],
      ['loop', 'Outcomes', 'Review how customers responded'],
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
    description: 'Writer OS helps technical writers and editors turn agreed product context into clear guidance, with the source beside the draft and a person reviewing it.',
    audience: 'For technical writers, editors and documentation leaders',
    headline: 'Write from what the team <span class="gradient-text">agreed.</span>',
    lead: 'Turn agreed product context into clear, reviewable guidance, with the source beside the draft and a person reviewing before it goes out.',
    app: writerApp,
    value: valueSection({
      key: 'writer', kicker: 'Why it matters', heading: 'Hard to explain what was never written down.',
      hard: 'In an established product organisation, writers often learn what changed second-hand, from a ticket, a chat or a quick call. Guessing what was decided, or what was left out, is where mistakes get in.',
      cols: [['For you', 'Less guesswork about what was decided. Draft with the source in view.'], ['For your team', 'Fewer disconnected handoffs. Reviewers see the brief, the source and the draft together.'], ['For leadership', 'A human review step stays visible before guidance reaches customers.']],
      note: 'A general AI assistant such as ChatGPT or Claude can help you draft a paragraph. Writer OS is for the brief, the source and the review around it. Flags are advice. People verify claims and citations.',
    }),
    flowKicker: 'Typical activities', flowHeading: 'From brief to reviewed guidance.',
    steps: [
      ['calendar', 'Briefs', 'Start from a brief'],
      ['book', 'Sources', 'The agreed context beside the draft'],
      ['pen', 'Draft', 'Write with the source in view'],
      ['shield', 'Checks', 'Advisory flags, then a person decides'],
      ['package', 'Formats', 'Articles, notes, email kits'],
    ],
    principles: [
      ['Editors decide', 'Flags are advice. People verify claims and citations.', true],
      ['Runs standalone', 'Start from a brief. No product spec needed.', false],
      ['Links when useful', 'Bring an agreed PM OS decision beside the draft through Suite, if you use it.', false],
    ],
  });

const groupsBlock = `
      <section class="section on-ink" aria-labelledby="groups-heading">
        <div class="container groups">
          <div class="reveal">
            <svg viewBox="0 0 460 360" role="img" aria-label="Three separate groups that can overlap: requesters, followers and eligible recipients.">
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
    description: 'Public OS helps customer-facing teams show what is a request, what is being considered and what has been released, and gives customers a way to respond.',
    audience: 'For customer-facing teams and the customers they serve',
    headline: 'Requests, plans and releases, <span class="gradient-text">kept distinct.</span>',
    lead: 'Help customers see what is a request, what is being considered and what has been released, and give them a way to respond.',
    app: publicApp,
    value: valueSection({
      key: 'public', kicker: 'Why it matters', heading: 'Hard to be clear without sounding like a promise.',
      hard: 'Customers ask in many places and want a straight answer. Teams worry that a vote, or a roadmap card, will be read as a commitment.',
      cols: [['For customers', 'See relevant information in plain words, and share feedback.'], ['For your team', 'Decide what is appropriate to share, and say it clearly after a person has reviewed it.'], ['For leadership', 'Choose what customers see. A roadmap shows intention, not a delivery date.']],
      note: 'A chat assistant can help you phrase an update. Public OS is where the request, its status, the update and the feedback it brings stay together, and where a person decides who hears.',
    }),
    flowKicker: 'How it flows', flowHeading: 'From request to reply.',
    steps: [
      ['chat', 'Requests', 'Ideas, votes, comments'],
      ['shield', 'Moderate', 'Review, merge, keep it civil'],
      ['road', 'Roadmap', 'Curated by your leaders'],
      ['doc', 'Updates', 'Authored and published by you'],
      ['bell', 'Send', 'Review recipients, then send'],
      ['loop', 'Replies', 'Logged for the next round of discovery'],
    ],
    middle: groupsBlock,
    principles: [
      ['A vote is not a promise', 'Roadmaps share intent, not launch dates.', false],
      ['A person sends', 'Publishing does not automatically email requesters. You review recipients, then send.', true],
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
            <h2 class="h2" id="links-heading">Four optional links in this example.</h2>
          </div>
          <ul class="links-flow">
            <li class="reveal"><div class="link-pair"><span class="tag tag--public">Public OS</span><span class="arrow">${icon('arrow', 16)}</span><span class="tag tag--pm">PM OS</span></div><strong>Customer signals</strong><p>A product manager brings feedback themes into discovery.</p><span class="opt"><i class="dot-amber"></i>Person decides</span></li>
            <li class="reveal" data-delay="1"><div class="link-pair"><span class="tag tag--pm">PM OS</span><span class="arrow">${icon('arrow', 16)}</span><span class="tag tag--writer">Writer OS</span></div><strong>Agreed context</strong><p>A writer can keep the decision summary beside the draft.</p><span class="opt"><i class="dot-amber"></i>Person decides</span></li>
            <li class="reveal" data-delay="2"><div class="link-pair"><span class="tag tag--writer">Writer OS</span><span class="arrow">${icon('arrow', 16)}</span><span class="tag tag--public">Public OS</span></div><strong>Reviewed wording</strong><p>A person brings the reviewed wording into Public OS, then reviews and publishes it.</p><span class="opt"><i class="dot-amber"></i>Person decides</span></li>
            <li class="reveal" data-delay="3"><div class="link-pair"><span class="tag tag--public">Public OS</span><span class="arrow">${icon('arrow', 16)}</span><span class="tag tag--pm">PM OS</span></div><strong>Customer replies</strong><p>A triage lead tags replies for the next round of discovery.</p><span class="opt"><i class="dot-amber"></i>Person decides</span></li>
          </ul>
        </div>
      </section>
`;

pages['suite.html'] = () =>
  head({
    title: 'Clarimeld Suite | Clarimeld',
    description: 'Clarimeld Suite is an optional link between PM OS, Writer OS and Public OS, so the decision, its reason and the open questions can travel with the work.',
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
            <h1 class="display" id="page-heading">Continuity when <span class="gradient-text">you choose it.</span></h1>
            <p class="lead">Each product works alone. Link them, and the decision, its reason and the open questions can follow the work from customer need to customer update.</p>
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
  valueSection({
    key: 'suite', kicker: 'Why it matters', heading: 'Each handoff is a chance to lose the reason.',
    hard: 'In an established software company, the decision, the explanation and the customer update are made by different teams, often in different tools.',
    cols: [['Product manager · PM OS', 'Makes and records the decision, and why.'], ['Technical writer · Writer OS', 'Prepares and reviews the explanation from the agreed context.'], ['Customer-facing team · Public OS', 'Chooses what to communicate, and when.']],
    note: 'Nobody has to use all three. Suite does not run every step for you: each link is optional, and a person acts at every handoff. Already use ChatGPT or Claude? Keep using them. Suite is about carrying a decision and its reason between teams, and it does not replace anyone\'s judgment.',
  }) +
  journeySection({
    heading: 'The same example, and where links are optional.',
    lead: 'An illustration, not a complete description of each product. Each product stays useful alone. Suite adds four optional links, and a person acts at every handoff.',
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
