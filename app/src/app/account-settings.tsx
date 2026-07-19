import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const save = async () => {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updateProfile({ name, email });
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
