// Side-effect CSS imports (e.g. `import 'leaflet/dist/leaflet.css'` in PostMap.web.tsx)
// have no type declarations by default — this satisfies `tsc --noEmit` for the web-only
// bundle without pulling in a bundler-specific CSS-modules typing package.
declare module '*.css';
