import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconPlus, IconUser } from '@/components/icons';
import PostMap from '@/components/PostMap';
import { usePosts } from '@/context/posts-context';
import { useTheme } from '@/context/theme-context';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

// Map-first home screen, modeled on Dott's minimal map UI: the map fills the whole
// screen, app name floats over it, and the only other chrome is two floating
// action buttons (add listing, profile) — sized to match the map pins. No tabs,
// no filters, no list — categories only appear once you open a listing, per docs/mvp.md.
export default function MapScreen() {
  const { posts } = usePosts();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <PostMap
        posts={posts}
        onSelectPost={(p) => router.push(`/post/${p.id}`)}
        height="100%"
        rounded={false}
      />

      <View pointerEvents="none" style={styles.header}>
        <Text style={styles.headerTitle}>Sperrshare</Text>
      </View>

      <Pressable style={styles.profileFab} onPress={() => router.push('/profile')}>
        {/* Icon is always dark — the FAB itself stays white in both themes, like the header pill. */}
        <IconUser size={17} color="#191C1C" />
      </Pressable>

      <Pressable style={styles.addFab} onPress={() => router.push('/create')}>
        <IconPlus size={18} color="white" />
      </Pressable>
    </View>
  );
}

const FAB_SIZE = 34; // matches the map pin diameter

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      position: 'absolute',
      top: spacing.lg,
      left: spacing.md,
      zIndex: 2000,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...shadow.card,
    },
    headerTitle: { fontFamily: fonts.heading, fontSize: 15, color: '#191C1C' },
    profileFab: {
      position: 'absolute',
      right: spacing.md,
      bottom: spacing.xl + FAB_SIZE + spacing.sm,
      zIndex: 2000,
      width: FAB_SIZE,
      height: FAB_SIZE,
      borderRadius: FAB_SIZE / 2,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.button,
    },
    addFab: {
      position: 'absolute',
      right: spacing.md,
      bottom: spacing.xl,
      zIndex: 2000,
      width: FAB_SIZE,
      height: FAB_SIZE,
      borderRadius: FAB_SIZE / 2,
      backgroundColor: colors.accentOrange,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.button,
    },
  });
