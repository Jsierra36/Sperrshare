import type { Post } from './types';

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();

// Real Sperrmüll photos (CC-licensed, Wikimedia Commons) — see docs/design.md. Each one
// was opened and visually checked (not just picked by filename) so its content actually
// matches its listing below, and that it doesn't show anyone's face, a car license plate,
// or a readable mailbox nameplate — the same privacy bar we ask real users to meet
// (see the photo_privacy_note hint in create.tsx).
const PHOTO_ROCKING_CHAIR =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Schaukelstuhl%2C_Ehrenfeld_-_8394.jpg';
const PHOTO_MOVING_LEFTOVERS =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sperrm%C3%BCll_in_Erfurt.jpg';
const PHOTO_FURNITURE_ROW =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sperrm%C3%BCll_zur_Abholung_bereitgestellt.JPG';
const PHOTO_CHAIRS_CARPETS = 'https://commons.wikimedia.org/wiki/Special:FilePath/Kospoda_21.jpg';

// Coordinates verified against real geocoders (Nominatim; Kollegienwall via Photon after
// Nominatim rate-limited during testing) — not hand-picked. Street name only, no house
// number: that's all a real listing needs (see create.tsx's address_hint), so the demo
// data models the same behaviour we ask of real users.
export const seedPosts: Post[] = [
  {
    id: 'seed-1',
    userId: 'seed-user-1',
    userName: 'Carla',
    categoryIds: ['furniture'],
    title: 'Schaukelstuhl in gutem Zustand',
    description:
      'Heute Morgen am Heger-Tor-Wall gefunden. Gestell ist stabil, Polster ohne größere Gebrauchsspuren. Perfekt für ein gemütliches Wohnzimmer.',
    addressText: 'Heger-Tor-Wall',
    lat: 52.2725,
    lng: 8.0411,
    photoUri: PHOTO_ROCKING_CHAIR,
    pickupDate: daysFromNow(2),
    status: 'active',
    createdAt: daysAgo(0),
    expiresAt: daysFromNow(3),
  },
  {
    id: 'seed-2',
    userId: 'seed-user-2',
    userName: 'Jonas',
    categoryIds: ['furniture', 'other'],
    title: 'Umzugsreste: Kommode, Matratzen, Kinderwagen',
    description:
      'Nach dem Umzug übrig geblieben: eine kleine Kommode, zwei gerollte Matratzen und ein Kinderwagen. Alles einsatzbereit.',
    addressText: 'Neuer Graben',
    lat: 52.2720,
    lng: 8.0445,
    photoUri: PHOTO_MOVING_LEFTOVERS,
    pickupDate: null,
    status: 'active',
    createdAt: daysAgo(1),
    expiresAt: daysFromNow(13),
  },
  {
    id: 'seed-3',
    userId: 'seed-user-3',
    userName: 'Mira',
    categoryIds: ['furniture', 'household'],
    title: 'Gebrauchte Möbelteile: Schränke, Stuhl, Spiegel',
    description:
      'Ausrangierte Küchenschrank-Teile, ein Stuhl und ein großer Spiegel. Gut erhalten, nur wegen Renovierung abgegeben.',
    addressText: 'Johannisstraße',
    lat: 52.2676,
    lng: 8.0533,
    photoUri: PHOTO_FURNITURE_ROW,
    pickupDate: daysFromNow(1),
    status: 'active',
    createdAt: daysAgo(0),
    expiresAt: daysFromNow(2),
  },
  {
    id: 'seed-4',
    userId: 'seed-user-1',
    userName: 'Carla',
    categoryIds: ['furniture', 'household'],
    title: 'Gemischte Kiste: Stühle, Kommode, Teppiche',
    description:
      'Keller entrümpelt — ein paar Stühle, eine kleine Kommode und mehrere gerollte Teppiche, ordentlich am Straßenrand abgestellt.',
    addressText: 'Kollegienwall',
    lat: 52.2725,
    lng: 8.0529,
    photoUri: PHOTO_CHAIRS_CARPETS,
    pickupDate: daysFromNow(4),
    status: 'active',
    createdAt: daysAgo(3),
    expiresAt: daysFromNow(11),
  },
];
