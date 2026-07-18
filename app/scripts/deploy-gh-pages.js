// Builds both the static landing page (landing/, published at the site root) and the Expo
// web demo (published under /demo — see app.config.js for its matching baseUrl) into
// dist/, then publishes dist/ to the gh-pages branch via the `gh-pages` package.
// Run with: npm run deploy:gh-pages
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..', '..');
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const demoDir = path.join(distDir, 'demo');
const landingDir = path.join(repoRoot, 'landing');

console.log('> Cleaning dist/...');
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

console.log('> Exporting web build (with GitHub Pages base path)...');
execSync('npx expo export -p web', {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env, EXPO_GH_PAGES: '1' },
});

console.log('> Moving demo build into dist/demo/...');
// `expo export` always writes straight into dist/ — move everything it just produced into
// dist/demo/ so the landing page (copied in below) can take the site root instead.
fs.mkdirSync(demoDir, { recursive: true });
for (const entry of fs.readdirSync(distDir)) {
  if (entry === 'demo') continue;
  fs.renameSync(path.join(distDir, entry), path.join(demoDir, entry));
}

// GitHub Pages has no server-side rewrites, so a hard load of a client-side demo route
// (e.g. a shared /demo/post/123 link) would 404. Serving the demo's index.html as the
// site-wide 404.html is the standard SPA workaround: GH Pages falls back to it, and Expo
// Router's client-side router takes over from there.
console.log('> Adding 404.html fallback for client-side demo routes...');
fs.copyFileSync(path.join(demoDir, 'index.html'), path.join(distDir, '404.html'));

console.log('> Copying landing page into dist/ (site root)...');
fs.cpSync(landingDir, distDir, { recursive: true });

console.log('> Publishing dist/ to the gh-pages branch...');
execSync('npx gh-pages --nojekyll -d dist', { cwd: projectRoot, stdio: 'inherit' });

console.log('> Done. Enable it once under GitHub repo Settings -> Pages -> Deploy from a branch -> gh-pages -> /(root).');
