const EARTH_RADIUS_M = 6371000;

/**
 * Converts a radius in meters into latitude/longitude degree deltas centered on the
 * given latitude. Longitude degrees shrink toward the poles (flat-earth/equirectangular
 * approximation) — accurate enough at city scale, used to size the "near me" map view.
 */
export function radiusToDeltas(latitude: number, radiusMeters: number) {
  const latDelta = (radiusMeters / EARTH_RADIUS_M) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos((latitude * Math.PI) / 180);
  return { latDelta, lngDelta };
}
