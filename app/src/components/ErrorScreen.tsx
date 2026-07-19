import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

type Props = { onRetry: () => void };

export default function ErrorScreen({ onRetry }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>{t('error_screen.title')}</Text>
        <Text style={styles.subtitle}>{t('error_screen.subtitle')}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('error_screen.retry')}
          style={styles.button}
          onPress={onRetry}>
          <Text style={styles.buttonText}>{t('error_screen.retry')}</Text>
        </Pressable>

        <Text style={styles.hint}>{t('error_screen.retry_later_hint')}</Text>
      </View>
    </View>
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
      alignItems: 'center',
      ...shadow.card,
    },
    icon: { fontSize: 40, marginBottom: spacing.md },
    title: {
      fontFamily: fonts.heading,
      fontSize: 22,
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
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      ...shadow.button,
    },
    buttonText: { fontFamily: fonts.headingSemibold, color: '#fff', fontSize: 16 },
    hint: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.md,
    },
  });
