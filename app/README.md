# Sperrshare

**Bevor es im Abfall landet, verdient es eine zweite Chance.**

Sperrshare connects people who want to get rid of bulky waste (Sperrmüll) with
neighbors who can give it a free second life. Items are posted with a photo and
a location, appear as pins on a live map, and disappear automatically once
collected or expired — no chat, no coordination, just go and pick it up.

**Live demo:** https://jsierra36.github.io/Sperrshare/

## Features

- 🗺️ Map-first UI — every listing is a pin; nearby pins cluster into hotspots
- 📷 1–3 photos per listing, with a swipeable carousel
- 📍 Address geocoding (Nominatim/OSM) plus manual pin placement with
  reverse-geocoded street names
- 🗓️ Optional pickup date with automatic listing expiry
- 🌗 Light/dark theme, German/English (i18n, German by default)
- 🔒 Exact addresses are only visible to logged-in users

## Tech stack

- [Expo](https://expo.dev) / React Native (single codebase for web, iOS and Android)
- Expo Router, react-native-maps (native) / Leaflet (web)
- OpenStreetMap + CARTO basemaps, Nominatim geocoding — no paid map APIs
- i18next for localization

> The current build is a demo: authentication and listings are mocked locally
> (AsyncStorage). A real backend (Supabase Auth + Postgres + RLS) is the next
> step on the roadmap.

## Development

```bash
npm install
npm run web       # dev server in the browser
npm run android   # or iOS with: npm run ios
```

Deploy the web demo + landing page to GitHub Pages:

```bash
npm run deploy:gh-pages
```

## License

See [LICENSE](./LICENSE).
