// GitHub Pages serves this project repo at github.io/Sperrshare/, and the demo now lives
// one level under that at /demo (the landing page in landing/ takes the site root — see
// scripts/deploy-gh-pages.js), so the exported bundle's asset URLs need that full prefix
// baked in (experiments.baseUrl). This only applies when explicitly building for that
// target — local dev (`expo start`) and any other export always serve from root, so
// app.json stays untouched.
// TODO once the custom domain (sperrshare.de) is attached to GitHub Pages: a *project*
// page with a custom domain serves from the domain root, not /Sperrshare/ — change this
// to '/demo' at that point, or these asset paths will 404.
const GH_PAGES_BASE_URL = '/Sperrshare/demo';

module.exports = ({ config }) => {
  if (process.env.EXPO_GH_PAGES === '1') {
    return {
      ...config,
      experiments: { ...config.experiments, baseUrl: GH_PAGES_BASE_URL },
    };
  }
  return config;
};
