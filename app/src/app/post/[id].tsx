import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getCategories } from '@/data/categories';
import { useAuth } from '@/context/auth-context';
import { usePosts } from '@/context/posts-context';
import { useTheme } from '@/context/theme-context';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

export default function PostDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, markCollected } = usePosts();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textMuted }}>{t('detail.no_longer_available')}</Text>
      </View>
    );
  }

  const postCategories = getCategories(post.categoryIds);
  const isOwner = user?.id === post.userId;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Image source={{ uri: post.photoUri }} style={styles.image} />

      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✅ {t('detail.available')}</Text>
        </View>
        {postCategories.map((category) => (
          <View key={category.id} style={[styles.badge, { backgroundColor: category.color + '22' }]}>
            <Text style={[styles.badgeText, { color: category.color }]}>
              {category.icon} {category.name}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.meta}>
        {t('detail.seen_by')} {post.userName}
      </Text>

      {post.description ? (
        <>
          <Text style={styles.sectionLabel}>{t('detail.description')}</Text>
          <Text style={styles.description}>{post.description}</Text>
        </>
      ) : null}

      <Text style={styles.sectionLabel}>{t('detail.location_exact')}</Text>
      <Text style={styles.description}>
        {user ? post.addressText : t('detail.location_locked')}
      </Text>

      <Text style={styles.sectionLabel}>{t('detail.pickup_by')}</Text>
      <Text style={styles.description}>
        {post.pickupDate ? new Date(post.pickupDate).toLocaleDateString() : t('detail.no_date')}
      </Text>

      {isOwner && (
        <Pressable
          style={styles.collectedButton}
          onPress={async () => {
            if (!user) return;
            await markCollected(post.id, user.id);
            router.back();
          }}>
          <Text style={styles.collectedButtonText}>{t('detail.mark_collected')}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    image: { width: '100%', height: 240, borderRadius: radius.xl, backgroundColor: colors.surfaceMuted },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
    badge: {
      backgroundColor: colors.secondaryContainer,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
    },
    badgeText: { fontFamily: fonts.label, fontSize: 12, color: colors.primaryDark },
    title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginTop: spacing.md },
    meta: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: spacing.xs },
    sectionLabel: {
      fontFamily: fonts.headingSemibold,
      fontSize: 14,
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },
    description: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
    collectedButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.xl,
      ...shadow.button,
    },
    collectedButtonText: { fontFamily: fonts.headingSemibold, color: '#fff', fontSize: 16 },
  });
