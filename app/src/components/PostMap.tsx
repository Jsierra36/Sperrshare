import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Post } from '@/data/types';
import { colors, fonts, radius, spacing } from '@/theme/colors';

type Props = {
  posts: Post[];
  onSelectPost?: (post: Post) => void;
  onMapClick?: (lat: number, lng: number) => void;
  pickedLocation?: { lat: number; lng: number } | null;
  height?: number | string;
  rounded?: boolean;
};

// Native map (react-native-maps + OSM tiles) is a Phase 1 item — see docs/roadmap.md.
// Today's demo targets the web build; this keeps the native/Expo Go preview functional
// (same prop contract as PostMap.web.tsx) without a real map widget.
export default function PostMap({ posts, onMapClick, pickedLocation, height = 320 }: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.container, { height: height as number }]}>
      <Text style={styles.text}>{t('map.native_placeholder')}</Text>
      <Text style={styles.subtext}>{t('map.nearby_count', { count: posts.length })}</Text>
      {onMapClick && (
        <Pressable
          style={styles.pickButton}
          onPress={() => onMapClick(52.2799, 8.0472)}>
          <Text style={styles.pickButtonText}>
            {pickedLocation ? `📍 ${t('create.location_set')}` : t('create.use_default_location')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  text: { fontFamily: fonts.headingSemibold, color: colors.text, textAlign: 'center' },
  subtext: { fontFamily: fonts.body, color: colors.textMuted, marginTop: spacing.xs },
  pickButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pickButtonText: { fontFamily: fonts.label, color: '#fff', fontSize: 12 },
});
