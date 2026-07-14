import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getCategories } from '@/data/categories';
import { useAuth } from '@/context/auth-context';
import { usePosts } from '@/context/posts-context';
import { useTheme } from '@/context/theme-context';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

export default function PostDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, markCollected, deletePost } = usePosts();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

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

  const handleMarkCollected = async () => {
    if (!user || isMutating) return;
    setMutationError(null);
    setIsMutating(true);
    try {
      await markCollected(post.id, user.id);
      router.back();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : t('errors.submit_failed'));
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!user || isMutating) return;
    setMutationError(null);
    setIsMutating(true);
    try {
      await deletePost(post.id, user.id);
      setConfirmDeleteOpen(false);
      router.replace('/');
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : t('errors.submit_failed'));
      setIsMutating(false);
    }
  };

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
        <View style={styles.ownerActions}>
          {mutationError && <Text style={styles.errorText}>{mutationError}</Text>}
          <Pressable
            disabled={isMutating}
            style={[styles.collectedButton, isMutating && styles.buttonDisabled]}
            onPress={handleMarkCollected}>
            {isMutating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.collectedButtonText}>{t('detail.mark_collected')}</Text>
            )}
          </Pressable>

          <View style={styles.secondaryRow}>
            <Pressable
              disabled={isMutating}
              style={styles.editButton}
              onPress={() => router.push({ pathname: '/create', params: { editId: post.id } })}>
              <Text style={styles.editButtonText}>{t('detail.edit')}</Text>
            </Pressable>
            <Pressable
              disabled={isMutating}
              style={styles.deleteButton}
              onPress={() => setConfirmDeleteOpen(true)}>
              <Text style={styles.deleteButtonText}>{t('detail.delete')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Modal
        visible={confirmDeleteOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeleteOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setConfirmDeleteOpen(false)}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <Text style={styles.confirmTitle}>{t('detail.delete_confirm_title')}</Text>
            <Text style={styles.confirmText}>{t('detail.delete_confirm_text')}</Text>
            <View style={styles.secondaryRow}>
              <Pressable style={styles.confirmCancel} onPress={() => setConfirmDeleteOpen(false)}>
                <Text style={styles.confirmCancelText}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                disabled={isMutating}
                style={[styles.confirmDeleteButton, isMutating && styles.buttonDisabled]}
                onPress={handleDelete}>
                {isMutating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteText}>{t('detail.delete')}</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
    },
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
    ownerActions: { marginTop: spacing.xl, gap: spacing.sm },
    errorText: { fontFamily: fonts.body, fontSize: 12, color: colors.error, textAlign: 'center' },
    buttonDisabled: { opacity: 0.6 },
    collectedButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      alignItems: 'center',
      ...shadow.button,
    },
    collectedButtonText: { fontFamily: fonts.headingSemibold, color: '#fff', fontSize: 16 },
    secondaryRow: { flexDirection: 'row', gap: spacing.sm },
    editButton: {
      flex: 1,
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.full,
      paddingVertical: spacing.sm + 4,
      alignItems: 'center',
    },
    editButtonText: { fontFamily: fonts.headingSemibold, color: colors.text, fontSize: 14 },
    deleteButton: {
      flex: 1,
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.full,
      paddingVertical: spacing.sm + 4,
      alignItems: 'center',
    },
    deleteButtonText: { fontFamily: fonts.headingSemibold, color: colors.error, fontSize: 14 },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    confirmCard: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      ...shadow.card,
    },
    confirmTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.text, marginBottom: spacing.xs },
    confirmText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: spacing.lg },
    confirmCancel: {
      flex: 1,
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.full,
      paddingVertical: spacing.sm + 4,
      alignItems: 'center',
    },
    confirmCancelText: { fontFamily: fonts.headingSemibold, color: colors.text, fontSize: 14 },
    confirmDeleteButton: {
      flex: 1,
      backgroundColor: colors.error,
      borderRadius: radius.full,
      paddingVertical: spacing.sm + 4,
      alignItems: 'center',
    },
    confirmDeleteText: { fontFamily: fonts.headingSemibold, color: '#fff', fontSize: 14 },
  });
