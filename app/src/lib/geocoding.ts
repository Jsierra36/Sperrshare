export type GeoResult = { lat: number; lng: number; displayName: string };

// Free, no API key (see docs/normas.md — zero-budget rule). Biased toward
// Osnabrück (left,top,right,bottom) since that's where the demo's listings live,
// without hard-restricting results (bounded=0).
const OSNABRUECK_VIEWBOX = '7.90,52.35,8.20,52.20';

export async function geocodeAddress(query: string, language: string): Promise<GeoResult | null> {
  const trimmed = query.trim();
  if (trimmed.length < 4) return null;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  // Append the city explicitly — `viewbox` below is only a soft ranking bias (bounded=0),
  // so a generic street name like "Neuer Graben" or "Wittekindstraße" (both real streets
  // in other German cities too) can still outrank the actual Osnabrück match and silently
  // resolve to a pin in the wrong city. Confirmed against the live API while fixing the
  // seed listings (docs/roadmap.md) — this app is Osnabrück-only for now (docs/vision.md).
  const qualified = /osnabrück|osnabrueck/i.test(trimmed) ? trimmed : `${trimmed}, Osnabrück`;
  url.searchParams.set('q', qualified);
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'de');
  url.searchParams.set('viewbox', OSNABRUECK_VIEWBOX);
  url.searchParams.set('bounded', '0');

  const res = await fetch(url.toString(), {
    headers: { 'Accept-Language': language },
  });
  if (!res.ok) return null;

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const first = data[0];
  const lat = parseFloat(first.lat);
  const lng = parseFloat(first.lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return { lat, lng, displayName: first.display_name };
}

// Reverse geocoding for manually-placed pins (see create.tsx) — same free Nominatim
// service as geocodeAddress above, no API key. zoom=17 asks Nominatim for street-level
// results, so a tap that doesn't land exactly on a building still resolves to the
// nearest known street rather than a broader (city/district) area.
export async function reverseGeocode(lat: number, lng: number, language: string): Promise<string | null> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'json');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('zoom', '17');

  const res = await fetch(url.toString(), {
    headers: { 'Accept-Language': language },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const address = data?.address;
  if (!address) return null;

  const street = address.road || address.pedestrian || address.footway;
  const houseNumber = address.house_number;
  if (street) return houseNumber ? `${street} ${houseNumber}` : street;

  return data.display_name ?? null;
}
