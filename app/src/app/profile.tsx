import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconBell, IconLifeBuoy, IconLogOut, IconSunMoon, IconUser } from '@/components/icons';
import SettingsRow from '@/components/SettingsRow';
import { getCategories } from '@/data/categories';
import { useAuth } from '@/context/auth-context';
import { usePosts } from '@/context/posts-context';
import { useTheme } from '@/context/theme-context';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';
import type { PostStatus } from '@/data/types';

const STATUS_LABEL_KEY: Record<PostStatus, string> = {
  active: 'profile.status_active',
  collected: 'profile.status_collected',
  expired: 'profile.status_expired',
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { allPosts, markCollected } = usePosts();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  const myPosts = useMemo(
    () => (user ? allPosts.filter((p) => p.userId === user.id) : []),
    [allPosts, user]
  );
  const activeCount = myPosts.filter((p) => p.status === 'active').length;
  const collectedCount = myPosts.filter((p) => p.status === 'collected').length;

  if (!user) return null;

  const initial = user.name.trim().charAt(0).toUpperCase() || '?';
  const statusStyles: Record<PostStatus, { bg: string; fg: string }> = {
    active: { bg: colors.secondaryContainer, fg: colors.primary },
    collected: { bg: colors.surfaceMuted, fg: colors.textMuted },
    expired: { bg: '#F3E4E4', fg: '#8A3B3B' },
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.header} onPress={() => router.push('/account-settings')}>
        {user.avatarUri ? (
          <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
        ) : (
          <LinearGradient
            colors={[colors.accent, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
        )}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>{t('profile.status_active')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{collectedCount}</Text>
            <Text style={styles.statLabel}>{t('profile.status_collected')}</Text>
          </View>
        </View>
      </Pressable>

      <Text style={styles.sectionTitle}>{t('profile.settings_section')}</Text>
      <SettingsRow
        icon={<IconUser size={18} color={colors.text} />}
        title={t('settings.account')}
        subtitle={t('settings.account_subtitle')}
        onPress={() => router.push('/account-settings')}
      />
      <SettingsRow
        icon={<IconBell size={18} color={colors.text} />}
        title={t('settings.notifications')}
        subtitle={t('settings.notifications_subtitle')}
        onPress={() => router.push('/notification-settings')}
      />
      <SettingsRow
        icon={<IconSunMoon size={18} color={colors.text} />}
        title={t('settings.design')}
        subtitle={t('settings.design_subtitle')}
        onPress={() => router.push('/design-settings')}
      />
      <SettingsRow
        icon={<IconLifeBuoy size={18} color={colors.text} />}
        title={t('settings.support')}
        subtitle={t('settings.support_subtitle')}
        onPress={() => router.push('/support')}
      />

      <Text style={styles.sectionTitle}>{t('profile.my_listings')}</Text>

      {myPosts.length === 0 ? (
        <Text style={styles.emptyText}>{t('profile.no_listings')}</Text>
      ) : (
        myPosts.map((post) => {
          const statusStyle = statusStyles[post.status];
          const postCategories = getCategories(post.categoryIds);
          return (
            <Pressable
              key={post.id}
              style={styles.card}
              onPress={() => router.push(`/post/${post.id}`)}>
              <Image source={{ uri: post.photoUri }} style={styles.cardImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {post.title}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {postCategories.map((c) => c.icon).join(' ')} {postCategories[0]?.name}
                  {postCategories.length > 1 ? ` +${postCategories.length - 1}` : ''}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusStyle.fg }]}>
                    {t(STATUS_LABEL_KEY[post.status])}
                  </Text>
                </View>
              </View>
              {post.status === 'active' && (
                <Pressable
                  style={styles.collectButton}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    markCollected(post.id, user.id);
                  }}>
                  <Text style={styles.collectButtonText}>✓</Text>
                </Pressable>
              )}
            </Pressable>
          );
        })
      )}

      <Pressable style={styles.logoutButton} onPress={logout}>
        <IconLogOut size={16} color={colors.error} />
        <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
    header: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
      ...shadow.button,
    },
    avatarImage: {
      width: 72,
      height: 72,
      borderRadius: 36,
      marginBottom: spacing.sm,
      backgroundColor: colors.surfaceMuted,
    },
    avatarText: { fontFamily: fonts.heading, fontSize: 28, color: '#fff' },
    name: { fontFamily: fonts.heading, fontSize: 20, color: colors.text },
    email: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
    statBox: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      ...shadow.card,
    },
    statNumber: { fontFamily: fonts.heading, fontSize: 22, color: colors.primary },
    statLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
    sectionTitle: {
      fontFamily: fonts.headingSemibold,
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    emptyText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: spacing.lg },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      ...shadow.card,
    },
    cardImage: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
    cardTitle: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text },
    cardMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
    statusBadge: {
      alignSelf: 'flex-start',
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginTop: 4,
    },
    statusBadgeText: { fontFamily: fonts.label, fontSize: 10 },
    collectButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    collectButtonText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
    logoutButton: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.xl,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: colors.error,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutButtonText: { fontFamily: fonts.headingSemibold, color: colors.error, fontSize: 15 },
  });
