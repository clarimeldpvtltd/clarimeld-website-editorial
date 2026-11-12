// Runs the browser regression suites against an already-served build:  npm run test:browser
//
// Serve a build first (for example `npm run build && npm run preview`), then in another terminal:
//   PREVIEW_URL=http://127.0.0.1:4173 npm run test:browser
//
// Setup. Playwright is deliberately NOT a dependency of this site, so there are two separate steps:
//   1. The Node package. The suites `import 'playwright'`, which Node resolves by looking for node_modules in the
//      scripts/ directory and then in each parent directory. The shell's working directory does not matter.
//      In a disposable checkout (never commit the result), from the repository root:
//        npm install --no-save --package-lock=false playwright@1.63.0
//      (1.63.0 is the version these suites were last verified with.) --no-save and --package-lock=false leave
//      package.json and package-lock.json unchanged. An existing install in any parent directory also works.
//   2. A browser. `npx playwright install chromium` downloads one into Playwright's own cache. To use an
//      already installed, compatible Chrome or Chromium instead, set CHROME_PATH to its executable.
//
// Exit status: 0 only if the environment checks pass and every suite exits 0. Any non-zero exit, spawn failure
// or signal from a suite counts as a failure. Exit 2: Playwright not loadable. 3: browser did not launch. 4: nothing is
// being served at PREVIEW_URL.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const B = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const firstLines = (e, n = 4) => String(e?.message ?? e).split('\n').slice(0, n).join('\n    ');

let chromium, pwVersion = 'unknown';
try {
  ({ chromium } = await import('playwright'));
  try { pwVersion = createRequire(import.meta.url)('playwright/package.json').version; } catch { /* version is informational */ }
} catch (e) {
  console.error(`Could not load the "playwright" package from ${dir}\n    ${e?.code ?? 'error'}: ${firstLines(e)}`);
  if (e?.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('\nNode looks for node_modules/playwright in scripts/ and each parent directory (not in the shell working directory).\nInstall the package where it can be found, for example from the repository root of a disposable checkout:\n    npm install --no-save --package-lock=false playwright@1.63.0\nThis is separate from installing a browser; see the comments at the top of scripts/run-qa.mjs.');
  }
  process.exit(2);
}

let browserVersion;
try {
  const br = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  browserVersion = br.version(); await br.close();
} catch (e) {
  console.error(`Playwright ${pwVersion} loaded, but the browser did not launch${process.env.CHROME_PATH ? ` (CHROME_PATH=${process.env.CHROME_PATH})` : ''}\n    ${firstLines(e, 6)}`);
  console.error('\nInstall a Playwright browser with `npx playwright install chromium`, or set CHROME_PATH to an installed Chrome/Chromium executable.');
  process.exit(3);
}

try { const r = await fetch(B, { signal: AbortSignal.timeout(5000) }); if (!r.ok) throw new Error(`HTTP ${r.status}`); }
catch (e) { console.error(`Nothing usable is being served at PREVIEW_URL=${B}\n    ${firstLines(e)}\nBuild and serve the site first (see the top of scripts/run-qa.mjs).`); process.exit(4); }

console.log(`Environment: node ${process.version}, playwright ${pwVersion}, browser ${browserVersion}, platform ${process.platform}/${process.arch}`);
console.log(`PREVIEW_URL=${B}${process.env.CHROME_PATH ? `  CHROME_PATH=${process.env.CHROME_PATH}` : ''}`);

const suites = ['qa-interactions.mjs', 'qa-redesign.mjs', 'qa-header-overlap.mjs', 'qa-card-clipping.mjs'];
const summary = [];
for (const s of suites) {
  console.log(`\n=== ${s} ===`);
  const r = spawnSync(process.execPath, [join(dir, s)], { stdio: 'inherit', env: process.env });
  const passed = !r.error && r.status === 0;
  summary.push({ s, passed, how: r.error ? `spawn error: ${r.error.message}` : r.signal ? `killed by ${r.signal}` : `exit ${r.status}` });
}
console.log('\n=== Summary ===');
for (const x of summary) console.log(`${x.passed ? 'PASS' : 'FAIL'}  ${x.s}  (${x.how})`);
const failed = summary.filter((x) => !x.passed).length;
console.log(failed ? `\n${failed} of ${summary.length} suite(s) failed` : `\nAll suites passed (${summary.length} of ${summary.length})`);
process.exit(failed ? 1 : 0);
