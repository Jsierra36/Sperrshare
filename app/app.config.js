// GitHub Pages serves this project repo at github.io/Sperrshare/, not the domain root, so the
// exported bundle's asset URLs need that prefix baked in (experiments.baseUrl). This only
// applies when explicitly building for that target (see scripts/deploy-gh-pages.js) — local
// dev (`expo start`) and any other export always serve from root, so app.json stays untouched.
const GH_PAGES_BASE_URL = '/Sperrshare';

module.exports = ({ config }) => {
  if (process.env.EXPO_GH_PAGES === '1') {
    return {
      ...config,
      experiments: { ...config.experiments, baseUrl: GH_PAGES_BASE_URL },
    };
  }
  return config;
};
