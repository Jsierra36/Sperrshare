import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

import type { Post } from '@/data/types';
import { useTheme } from '@/context/theme-context';
import { radiusToDeltas } from '@/lib/geo';

const DEFAULT_CENTER: [number, number] = [52.2799, 8.0472];
const DEFAULT_ZOOM = 13;
const USER_RADIUS_METERS = 2000;

function boundsAround(center: { lat: number; lng: number }, radiusMeters: number): L.LatLngBoundsExpression {
  const { latDelta, lngDelta } = radiusToDeltas(center.lat, radiusMeters);
  return [
    [center.lat - latDelta, center.lng - lngDelta],
    [center.lat + latDelta, center.lng + lngDelta],
  ];
}

// Fixes Leaflet mis-measuring its container when it mounts inside a
// tab/screen that was just switched to (container size is 0 at init time).
function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(id);
  }, [map]);
  return null;
}

// Small floating "recenter" button, Dott-style — top-right, white circle, target icon.
// (Bottom-right is reserved for the add-listing / profile action buttons.)
function RecenterControl({ initialCenter }: { initialCenter?: { lat: number; lng: number } | null }) {
  const { t } = useTranslation();
  const map = useMap();
  return (
    <button
      type="button"
      aria-label={t('map.recenter')}
      onClick={() =>
        initialCenter
          ? map.fitBounds(boundsAround(initialCenter, USER_RADIUS_METERS))
          : map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
      }
      style={{
        position: 'absolute',
        right: 12,
        top: 12,
        zIndex: 1000,
        width: 40,
        height: 40,
        borderRadius: 20,
        border: 'none',
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        cursor: 'pointer',
      }}>
      🎯
    </button>
  );
}

// Real "sofa" icon from Lucide (ISC-licensed, unpkg.com/lucide-static) — not hand-drawn,
// so it actually looks like a sofa instead of an approximation.
const SOFA_SVG = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
  <path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
  <path d="M4 18v2" />
  <path d="M20 18v2" />
</svg>`;

// Every pin is identical — flat solid green circle, same sofa glyph, no per-post
// badge — matching the reference app's flat, uncluttered marker style.
function pinIcon(color: string) {
  return L.divIcon({
    html: `<div style="background:${color};width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.25)">${SOFA_SVG}</div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

// Cluster badge shown instead of individual pins when posts are close together at the
// current zoom level (Airbnb-style hotspot grouping) — same shape as pinIcon(), slightly
// bigger, with the count instead of the sofa glyph. Mirrors ClusterPin in PostMap.tsx.
function clusterIcon(count: number, color: string) {
  return L.divIcon({
    html: `<div style="background:${color};width:40px;height:40px;border-radius:999px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.25);color:#fff;font-weight:700;font-size:14px">${count}</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function pickedLocationIcon() {
  return L.divIcon({
    html: `<div style="background:#FF8C00;width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.25)"><span style="font-size:16px">📍</span></div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Recenters once, the moment the user's real location first resolves (it arrives
// asynchronously after permission + a GPS fix — see useUserLocation) — not on every
// render, so it doesn't fight the user's own panning/zooming afterwards.
function CenterOnUserLocation({ initialCenter }: { initialCenter?: { lat: number; lng: number } | null }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (!initialCenter || hasCenteredRef.current) return;
    hasCenteredRef.current = true;
    map.fitBounds(boundsAround(initialCenter, USER_RADIUS_METERS));
  }, [initialCenter, map]);
  return null;
}

export default function PostMap({
  posts,
  onSelectPost,
  onMapClick,
  pickedLocation,
  initialCenter,
  height = 320,
  rounded = true,
}: {
  posts: Post[];
  onSelectPost?: (post: Post) => void;
  onMapClick?: (lat: number, lng: number) => void;
  pickedLocation?: { lat: number; lng: number } | null;
  // User's real position (see useUserLocation) — when available, the map recenters to a
  // ~2km-radius view around it once, on first arrival, instead of the Osnabrück default.
  initialCenter?: { lat: number; lng: number } | null;
  height?: number | string;
  rounded?: boolean;
}) {
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';
  return (
    <div
      className="sperrshare-map"
      style={{ height, width: '100%', borderRadius: rounded ? 16 : 0, overflow: 'hidden', position: 'relative' }}>
      {/* CARTO Voyager (light) shows parks/water/roads in color; CARTO Dark Matter
          mirrors that for dark mode. Both free, no API key. */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url={
            isDark
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          }
          subdomains="abcd"
          maxZoom={19}
        />
        <ClickHandler onMapClick={onMapClick} />
        <InvalidateSizeOnMount />
        <CenterOnUserLocation initialCenter={initialCenter} />
        <RecenterControl initialCenter={initialCenter} />
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={60}
          // @types/leaflet.markercluster augments the 'leaflet' module with MarkerCluster,
          // but that augmentation isn't resolving here (unrelated to the two libraries
          // actually functioning at runtime — verified in-browser) — narrow `any` instead
          // of fighting third-party type plumbing for one callback parameter.
          iconCreateFunction={(cluster: any) => clusterIcon(cluster.getChildCount(), colors.primary)}>
          {posts.map((post) => (
            <Marker key={post.id} position={[post.lat, post.lng]} icon={pinIcon(colors.primary)}>
              <Popup minWidth={180} closeButton={false}>
                <div
                  role="button"
                  onClick={() => onSelectPost?.(post)}
                  style={{ cursor: 'pointer', width: 160 }}>
                  <img
                    src={post.photoUri}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 10,
                      marginBottom: 6,
                      display: 'block',
                    }}
                  />
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#191C1C', lineHeight: 1.3 }}>
                    {post.title}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
        {pickedLocation && (
          <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={pickedLocationIcon()} />
        )}
      </MapContainer>
    </div>
  );
}
