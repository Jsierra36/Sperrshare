// Builds the web export for GitHub Pages (subpath-aware, see app.config.js) and publishes
// it to the `gh-pages` branch via the `gh-pages` package. Run with: npm run deploy:gh-pages
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

console.log('> Exporting web build (with GitHub Pages base path)...');
execSync('npx expo export -p web', {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env, EXPO_GH_PAGES: '1' },
});

// GitHub Pages has no server-side rewrites, so a hard load of a client-side route (e.g. a
// shared /post/123 link) would 404. Serving index.html as 404.html is the standard SPA
// workaround: GH Pages falls back to it, and Expo Router's client-side router takes over.
console.log('> Adding 404.html fallback for client-side routes...');
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));

console.log('> Publishing dist/ to the gh-pages branch...');
execSync('npx gh-pages --nojekyll -d dist', { cwd: projectRoot, stdio: 'inherit' });

console.log('> Done. Enable it once under GitHub repo Settings -> Pages -> Deploy from a branch -> gh-pages -> /(root).');
