import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { setAppLanguage, type AppLanguage } from '@/i18n';
import { fonts, radius, spacing, type ColorPalette } from '@/theme/colors';

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const options: { key: AppLanguage; label: string; emoji: string }[] = [
    { key: 'de', label: t('language.german'), emoji: '🇩🇪' },
    { key: 'en', label: t('language.english'), emoji: '🇬🇧' },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('language.title')}</Text>
      <Text style={styles.subtitle}>{t('language.subtitle')}</Text>

      {options.map((opt) => {
        const selected = i18n.language === opt.key;
        return (
          <Pressable
            key={opt.key}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => setAppLanguage(opt.key)}>
            <Text style={styles.optionEmoji}>{opt.emoji}</Text>
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{opt.label}</Text>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected && <View style={styles.radioDot} />}
            </View>
          </Pressable>
        );
      })}
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
    title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginBottom: spacing.xs },
    subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    optionSelected: { borderColor: colors.primary },
    optionEmoji: { fontSize: 20 },
    optionLabel: { flex: 1, fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
    optionLabelSelected: { color: colors.primary },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: { borderColor: colors.primary },
    radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  });
