import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED_SPDX = new Set([
  'MIT',
  'OFL-1.1',
  'Apache-2.0',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'CC0-1.0',
  'BlueOak-1.0.0',
  '(MIT OR CC0-1.0)',
  'MIT OR Apache-2.0',
  '(MIT AND Zlib)',
  'Python-2.0',
]);

const rootPkg = JSON.parse(readFileSync('package.json', 'utf8'));
const directDeps = new Set([
  ...Object.keys(rootPkg.dependencies || {}),
  ...Object.keys(rootPkg.devDependencies || {}),
]);

const nodeModulesDir = 'node_modules';
if (!existsSync(nodeModulesDir)) {
  console.error('node_modules not found. Run npm install first.');
  process.exit(1);
}

function collectPackages(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    if (entry.name.startsWith('@')) {
      const scopeDir = join(dir, entry.name);
      for (const sub of readdirSync(scopeDir, { withFileTypes: true })) {
        if (!sub.isDirectory()) continue;
        const pkgJsonPath = join(scopeDir, sub.name, 'package.json');
        if (existsSync(pkgJsonPath)) results.push(pkgJsonPath);
      }
    } else {
      const pkgJsonPath = join(dir, entry.name, 'package.json');
      if (existsSync(pkgJsonPath)) results.push(pkgJsonPath);
    }
  }
  return results;
}

const pkgPaths = collectPackages(nodeModulesDir);
const directReport = [];
const licenseCounts = new Map();
const flagged = [];

for (const pkgPath of pkgPaths) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const license = typeof pkg.license === 'string'
    ? pkg.license
    : (pkg.license?.type || 'UNSPECIFIED');
  licenseCounts.set(license, (licenseCounts.get(license) || 0) + 1);

  if (directDeps.has(pkg.name)) {
    directReport.push({
      name: pkg.name,
      version: pkg.version,
      license,
      role: rootPkg.dependencies?.[pkg.name] ? 'runtime' : 'dev-only',
    });
  }

  if (!ALLOWED_SPDX.has(license)) {
    flagged.push({ name: pkg.name, version: pkg.version, license });
  }
}

directReport.sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));

console.log('=== Direct Dependencies License Report ===');
for (const item of directReport) {
  console.log(`- ${item.name}@${item.version} [${item.role}]: ${item.license}`);
}

console.log(`\n=== Transitive Tree Summary (${pkgPaths.length} installed packages) ===`);
for (const [lic, count] of [...licenseCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`- ${lic}: ${count}`);
}

if (flagged.length > 0) {
  console.error('\nFlagged non-allowlisted licenses:', flagged);
  process.exit(1);
}

console.log('\nAll installed packages match permissive open-source licenses.');
