import type { Post } from './types';

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();

// Real Sperrmüll photos (CC-licensed, Wikimedia Commons) — see docs/design.md.
// Picked for tidiness where possible (single items, not scattered clutter) — still
// genuinely photographed on the street, per the "OK if it's outside, not OK if messy" brief.
const PHOTO_ROCKING_CHAIR =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Schaukelstuhl%2C_Ehrenfeld_-_8394.jpg';
const PHOTO_CABINET =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sperrm%C3%BCll_in_Erfurt.jpg';
const PHOTO_CABINETS_CHAIRS =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sperrm%C3%BCll_mit_Schr%C3%A4nken_und_St%C3%BChlen.jpg';
const PHOTO_ASSORTED =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sperrm%C3%BCll_zur_Abholung_bereitgestellt.JPG';
const PHOTO_MIXED_ITEMS = 'https://commons.wikimedia.org/wiki/Special:FilePath/Kospoda_21.jpg';

// Demo data — coordinates are a real city center internally, but no city name appears in any UI copy.
export const seedPosts: Post[] = [
  {
    id: 'seed-1',
    userId: 'seed-user-1',
    userName: 'Carla',
    categoryIds: ['furniture'],
    title: 'Schaukelstuhl in gutem Zustand',
    description:
      'Heute Morgen an der Ecke Heger-Tor-Wall gefunden. Gestell ist stabil, Polster ohne größere Gebrauchsspuren. Perfekt für ein gemütliches Wohnzimmer.',
    addressText: 'Heger-Tor-Wall 12',
    lat: 52.2755,
    lng: 8.0489,
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
    categoryIds: ['electronics', 'household'],
    title: 'Alter TV-Schrank mit Ablage',
    description: 'Kleiner Medienschrank, noch stabil. Perfekt für die erste eigene Wohnung.',
    addressText: 'Neuer Graben 30',
    lat: 52.2802,
    lng: 8.0466,
    photoUri: PHOTO_CABINETS_CHAIRS,
    pickupDate: null,
    status: 'active',
    createdAt: daysAgo(1),
    expiresAt: daysFromNow(13),
  },
  {
    id: 'seed-3',
    userId: 'seed-user-3',
    userName: 'Mira',
    categoryIds: ['books_toys'],
    title: 'Kiste mit Kinderbüchern',
    description: 'Etwa 20 Bilderbücher, guter Zustand, für Kinder von 3 bis 8 Jahren.',
    addressText: 'Johannisstraße 5',
    lat: 52.2725,
    lng: 8.0537,
    photoUri: PHOTO_ASSORTED,
    pickupDate: daysFromNow(1),
    status: 'active',
    createdAt: daysAgo(0),
    expiresAt: daysFromNow(2),
  },
  {
    id: 'seed-4',
    userId: 'seed-user-1',
    userName: 'Carla',
    categoryIds: ['household', 'other'],
    title: 'Kleiner Schrank mit Regal',
    description: 'Helles Regal mit Tür, ein paar Kratzer, sonst voll funktionsfähig.',
    addressText: 'Wittekindstraße 20',
    lat: 52.2841,
    lng: 8.0421,
    photoUri: PHOTO_CABINET,
    pickupDate: null,
    status: 'active',
    createdAt: daysAgo(3),
    expiresAt: daysFromNow(11),
  },
  {
    id: 'seed-5',
    userId: 'seed-user-2',
    userName: 'Jonas',
    categoryIds: ['clothing', 'sports', 'other'],
    title: 'Gemischte Kiste: Stühle, Teppiche, Diverses',
    description:
      'Keller entrümpelt — ein paar Stühle, zwei kleine Teppiche und ein paar Kleinigkeiten, ordentlich am Straßenrand abgestellt.',
    addressText: 'Iburger Straße 90',
    lat: 52.2648,
    lng: 8.0521,
    photoUri: PHOTO_MIXED_ITEMS,
    pickupDate: daysFromNow(4),
    status: 'active',
    createdAt: daysAgo(0),
    expiresAt: daysFromNow(5),
  },
];
