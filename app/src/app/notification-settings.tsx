import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { fonts, radius, spacing, type ColorPalette } from '@/theme/colors';

const STORAGE_KEY = 'sperrshare.notification-prefs';

type Prefs = { nearby: boolean; reminders: boolean; updates: boolean };
const DEFAULT_PREFS: Prefs = { nearby: true, reminders: true, updates: false };

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setPrefs(JSON.parse(raw));
    });
  }, []);

  const toggle = (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const rows: { key: keyof Prefs; title: string; hint: string }[] = [
    { key: 'nearby', title: t('notifications.nearby'), hint: t('notifications.nearby_hint') },
    { key: 'reminders', title: t('notifications.reminders'), hint: t('notifications.reminders_hint') },
    { key: 'updates', title: t('notifications.updates'), hint: t('notifications.updates_hint') },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('notifications.title')}</Text>
      {rows.map((row) => (
        <View key={row.key} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{row.title}</Text>
            <Text style={styles.rowHint}>{row.hint}</Text>
          </View>
          <Switch
            value={prefs[row.key]}
            onValueChange={() => toggle(row.key)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
    title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginBottom: spacing.lg },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    rowTitle: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text },
    rowHint: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  });
