import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { IconCamera } from '@/components/icons';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

export default function AccountSettingsScreen() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);

  if (!user) return null;

  const initial = name.trim().charAt(0).toUpperCase() || '?';

  const pickPhoto = async () => {
    setError(null);
    setIsPickingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.photo_pick_failed'));
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const save = async () => {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updateProfile({ name, email, avatarUri });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.generic'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('account.title')}</Text>

      <View style={styles.avatarRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('account.change_photo')}
          onPress={pickPhoto}
          disabled={isPickingPhoto}>
          {isPickingPhoto ? (
            <View style={styles.avatarPlaceholder}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <IconCamera size={14} color="#fff" />
          </View>
        </Pressable>
        <Pressable onPress={pickPhoto} disabled={isPickingPhoto}>
          <Text style={styles.changePhoto}>{t('account.change_photo')}</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>{t('account.name')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.textMuted}
        maxLength={60}
      />

      <Text style={styles.label}>{t('account.email')}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={colors.textMuted}
        maxLength={120}
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {saved && !error && <Text style={styles.saved}>{t('account.saved')}</Text>}

      <Pressable style={styles.saveButton} onPress={save} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? t('common.loading') : t('account.save')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl * 2,
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
    },
    title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginBottom: spacing.lg },
    avatarRow: { alignItems: 'center', marginBottom: spacing.lg },
    avatarImage: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.surfaceMuted },
    avatarPlaceholder: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: { fontFamily: fonts.heading, fontSize: 32, color: '#fff' },
    cameraBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    changePhoto: { fontFamily: fonts.label, fontSize: 13, color: colors.primary, marginTop: spacing.sm },
    label: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginBottom: spacing.sm },
    input: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
      fontFamily: fonts.body,
      fontSize: 15,
      color: colors.text,
      marginBottom: spacing.md,
    },
    error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, marginBottom: spacing.sm, textAlign: 'center' },
    saved: { fontFamily: fonts.body, fontSize: 12, color: colors.primary, marginBottom: spacing.sm, textAlign: 'center' },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.sm,
      ...shadow.button,
    },
    saveButtonText: { fontFamily: fonts.headingSemibold, color: '#fff', fontSize: 16 },
  });
