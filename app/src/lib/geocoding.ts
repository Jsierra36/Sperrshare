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
  url.searchParams.set('q', trimmed);
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
