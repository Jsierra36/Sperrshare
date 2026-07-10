import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    EMAIL_RE.test(email.trim()) &&
    password.length >= MIN_PASSWORD_LENGTH;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(name, email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

        <Text style={styles.label}>{t('login.name')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Anna Schmidt"
          placeholderTextColor={colors.textMuted}
          maxLength={60}
        />

        <Text style={styles.label}>{t('login.email')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="anna@example.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          maxLength={120}
        />

        <Text style={styles.label}>{t('login.password')}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          maxLength={128}
        />
        <Text style={styles.hint}>{t('login.password_hint')}</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          disabled={!canSubmit || submitting}
          style={[styles.button, (!canSubmit || submitting) && styles.buttonDisabled]}
          onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {submitting ? t('common.loading') : t('login.cta')}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadow.card,
    },
    title: {
      fontFamily: fonts.heading,
      fontSize: 24,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    label: { fontFamily: fonts.label, fontSize: 13, color: colors.textMuted, marginBottom: spacing.xs },
    input: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
      marginBottom: spacing.md,
      fontFamily: fonts.body,
      fontSize: 16,
      color: colors.text,
    },
    hint: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: -spacing.sm, marginBottom: spacing.md },
    error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, marginBottom: spacing.sm, textAlign: 'center' },
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.sm,
      ...shadow.button,
    },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { fontFamily: fonts.headingSemibold, color: '#fff', fontSize: 16 },
  });
