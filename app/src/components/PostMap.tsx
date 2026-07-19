import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import type RNMapView from 'react-native-maps';
import {
  Callout,
  Marker,
  PROVIDER_DEFAULT,
  UrlTile,
  type MapPressEvent,
  type Region,
} from 'react-native-maps';
import { Path, Svg } from 'react-native-svg';

import type { Post } from '@/data/types';
import { IconLocate } from '@/components/icons';
import { useTheme } from '@/context/theme-context';
import { radiusToDeltas } from '@/lib/geo';
import { fabSize, fonts, radius, shadow, spacing } from '@/theme/colors';

type Props = {
  posts: Post[];
  onSelectPost?: (post: Post) => void;
  onMapClick?: (lat: number, lng: number) => void;
  pickedLocation?: { lat: number; lng: number } | null;
  // User's real position (see useUserLocation) — when available, the map recenters to a
  // ~2km-radius view around it once, on first arrival, instead of the Osnabrück default.
  initialCenter?: { lat: number; lng: number } | null;
  height?: number | string;
  rounded?: boolean;
};

const DEFAULT_CENTER = { latitude: 52.2799, longitude: 8.0472 };
const DEFAULT_REGION: Region = {
  ...DEFAULT_CENTER,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};
const USER_RADIUS_METERS = 2000;
const PIN_SIZE = 34; // matches the web pin (PostMap.web.tsx)

function regionAround(center: { lat: number; lng: number }, radiusMeters: number): Region {
  const { latDelta, lngDelta } = radiusToDeltas(center.lat, radiusMeters);
  return {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: latDelta * 2,
    longitudeDelta: lngDelta * 2,
  };
}

// CARTO's free basemaps (same styles as the web build) also serve from a single
// non-sharded host without the `{s}`/`{r}` placeholders react-native-maps' UrlTile
// doesn't support — only {x}/{y}/{z} are substituted, per the library's docs.
const TILE_URL_LIGHT = 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
const TILE_URL_DARK = 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

// Same sofa glyph as the web pin / app Logo (Lucide, ISC-licensed, unpkg.com/lucide-static).
function SofaGlyph({ size = 19, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <Path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
      <Path d="M4 18v2" />
      <Path d="M20 18v2" />
    </Svg>
  );
}

// Every post pin is identical — flat solid green circle, same sofa glyph — matching
// the web marker in PostMap.web.tsx (see docs/mvp.md: no per-category pin colors).
function PostPin({ color }: { color: string }) {
  return (
    <View style={[pinStyles.pin, { backgroundColor: color }]}>
      <SofaGlyph size={19} color="#fff" />
    </View>
  );
}

// Cluster badge shown instead of individual pins when posts are close together at the
// current zoom level (Airbnb-style hotspot grouping) — same pin shape as PostPin, slightly
// bigger, with the count instead of the sofa glyph. Mirrors clusterIcon() in PostMap.web.tsx.
function ClusterPin({ count, color }: { count: number; color: string }) {
  return (
    <View style={[pinStyles.pin, pinStyles.clusterPin, { backgroundColor: color }]}>
      <Text style={pinStyles.clusterText}>{count}</Text>
    </View>
  );
}

// Orange location-pin marker used while picking a spot in create/edit — mirrors
// pickedLocationIcon() in PostMap.web.tsx.
function PickedPin({ color }: { color: string }) {
  return (
    <View style={[pinStyles.pin, { backgroundColor: color }]}>
      <Text style={{ fontSize: 16 }}>📍</Text>
    </View>
  );
}

const CLUSTER_PIN_SIZE = 40; // matches the web cluster icon (PostMap.web.tsx)

const pinStyles = StyleSheet.create({
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: { elevation: 3 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  clusterPin: {
    width: CLUSTER_PIN_SIZE,
    height: CLUSTER_PIN_SIZE,
    borderRadius: CLUSTER_PIN_SIZE / 2,
  },
  clusterText: { fontFamily: fonts.headingSemibold, color: '#fff', fontSize: 14 },
});

// Small floating "recenter" button, same visual language as the web RecenterControl
// and the map screen's FABs (index.tsx) — white circle, floating top-right, same
// diameter as those FABs (fabSize) so all three floating controls read as one family.
function RecenterControl({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.recenterButton}
      onPress={onPress}>
      <IconLocate size={20} color="#191C1C" />
    </Pressable>
  );
}

export default function PostMap({
  posts,
  onSelectPost,
  onMapClick,
  pickedLocation,
  initialCenter,
  height = 320,
  rounded = true,
}: Props) {
  const { t } = useTranslation();
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';
  const mapRef = useRef<RNMapView>(null);

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onMapClick?.(latitude, longitude);
  };

  const recenter = () => {
    mapRef.current?.animateToRegion(
      initialCenter ? regionAround(initialCenter, USER_RADIUS_METERS) : DEFAULT_REGION,
      400,
    );
  };

  // Recenters once, the moment the user's real location first resolves (it arrives
  // asynchronously after permission + a GPS fix — see useUserLocation) — not on every
  // render, so it doesn't fight the user's own panning/zooming afterwards.
  const hasCenteredOnUserRef = useRef(false);
  useEffect(() => {
    if (!initialCenter || hasCenteredOnUserRef.current) return;
    hasCenteredOnUserRef.current = true;
    mapRef.current?.animateToRegion(regionAround(initialCenter, USER_RADIUS_METERS), 500);
  }, [initialCenter]);

  return (
    <View
      style={[
        styles.container,
        { height: height as number, borderRadius: rounded ? radius.lg : 0 },
      ]}>
      <ClusteredMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        onPress={handleMapPress}
        // Hide each platform's own base map — free OSM tiles below are the only
        // basemap the user sees, keeping native visually consistent with web
        // without ever touching a paid Google Maps key (docs/normas.md).
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        toolbarEnabled={false}
        showsCompass={false}
        // Hotspot grouping (Airbnb-style +N badges) for nearby pins — only the post
        // markers below are clustered; the single pickedLocation pin used while
        // creating/editing a listing is rendered outside this and never clusters.
        clusterColor={colors.primary}
        clusterTextColor="#fff"
        clusterFontFamily={fonts.headingSemibold}
        renderCluster={(cluster) => {
          const { id, geometry, onPress, properties } = cluster;
          return (
            <Marker
              key={`cluster-${id}`}
              coordinate={{ latitude: geometry.coordinates[1], longitude: geometry.coordinates[0] }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={onPress}
              tracksViewChanges={false}>
              <ClusterPin count={properties.point_count} color={colors.primary} />
            </Marker>
          );
        }}>
        <UrlTile
          urlTemplate={isDark ? TILE_URL_DARK : TILE_URL_LIGHT}
          maximumZ={19}
          flipY={false}
          shouldReplaceMapContent
        />
        {posts.map((post) => (
          <Marker
            key={post.id}
            coordinate={{ latitude: post.lat, longitude: post.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            title={post.title}
            stopPropagation
            tracksViewChanges={false}>
            <PostPin color={colors.primary} />
            <Callout tooltip={false} onPress={() => onSelectPost?.(post)} style={styles.callout}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={post.title}
                style={styles.calloutCard}
                onPress={() => onSelectPost?.(post)}>
                <Image source={{ uri: post.photoUris[0] }} style={styles.calloutImage} />
                <Text style={styles.calloutTitle} numberOfLines={2}>
                  {post.title}
                </Text>
              </Pressable>
            </Callout>
          </Marker>
        ))}
        {pickedLocation && (
          <Marker
            coordinate={{ latitude: pickedLocation.lat, longitude: pickedLocation.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}>
            <PickedPin color={colors.accentOrange} />
          </Marker>
        )}
      </ClusteredMapView>

      <Text style={styles.attribution}>© OpenStreetMap contributors © CARTO</Text>

      <RecenterControl onPress={recenter} label={t('map.recenter')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', overflow: 'hidden', position: 'relative' },
  recenterButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: fabSize,
    height: fabSize,
    borderRadius: fabSize / 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.button,
  },
  attribution: {
    position: 'absolute',
    right: spacing.xs,
    bottom: spacing.xs,
    fontSize: 9,
    color: '#00000099',
    backgroundColor: '#ffffffaa',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  callout: { width: 160 },
  calloutCard: { width: 160 },
  calloutImage: { width: '100%', height: 100, borderRadius: 10, marginBottom: 6, backgroundColor: '#eee' },
  calloutTitle: { fontFamily: fonts.headingSemibold, fontSize: 13, color: '#191C1C', lineHeight: 17 },
});
