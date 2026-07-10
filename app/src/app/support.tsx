import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { fonts, radius, spacing, type ColorPalette } from '@/theme/colors';

export default function SupportScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const faqs = [
    { q: t('support.faq_1_q'), a: t('support.faq_1_a') },
    { q: t('support.faq_2_q'), a: t('support.faq_2_a') },
    { q: t('support.faq_3_q'), a: t('support.faq_3_a') },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('support.title')}</Text>

      <Text style={styles.sectionTitle}>{t('support.faq_title')}</Text>
      {faqs.map((faq) => (
        <View key={faq.q} style={styles.card}>
          <Text style={styles.question}>{faq.q}</Text>
          <Text style={styles.answer}>{faq.a}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>{t('support.contact_title')}</Text>
      <View style={styles.card}>
        <Text style={styles.answer}>{t('support.contact_text')}</Text>
        <Text style={styles.contactEmail}>hello@sperrshare.app</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
    title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginBottom: spacing.lg },
    sectionTitle: {
      fontFamily: fonts.headingSemibold,
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    question: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginBottom: 4 },
    answer: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 19 },
    contactEmail: { fontFamily: fonts.label, fontSize: 14, color: colors.primary, marginTop: spacing.xs },
  });
