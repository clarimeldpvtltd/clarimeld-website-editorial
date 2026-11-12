// Runs the browser regression suite against an already-served build.
// Usage:  npm run build && npm run preview   (in one terminal)
//         PREVIEW_URL=http://127.0.0.1:4173 npm run test:browser   (in another)
// Needs Playwright available to Node (it is deliberately not a dependency of this site) and a Chromium;
// set CHROME_PATH to use an installed Chrome/Chromium.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
try {
  await import('playwright');
} catch {
  console.error('Playwright is not installed. Install it where you run the tests (for example: npx playwright install chromium), then re-run.');
  process.exit(2);
}
const suites = ['qa-interactions.mjs', 'qa-redesign.mjs', 'qa-header-overlap.mjs', 'qa-card-clipping.mjs'];
let failed = 0;
for (const s of suites) {
  console.log(`\n=== ${s} ===`);
  const r = spawnSync(process.execPath, [join(dir, s)], { stdio: 'inherit', env: process.env });
  if (r.status !== 0) failed++;
}
console.log(failed ? `\n${failed} suite(s) failed` : '\nAll suites passed');
process.exit(failed ? 1 : 0);
