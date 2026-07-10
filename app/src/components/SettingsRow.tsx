import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconChevronRight } from '@/components/icons';
import { useTheme } from '@/context/theme-context';
import { fonts, radius, spacing, type ColorPalette } from '@/theme/colors';

export default function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <IconChevronRight size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.sm + 4,
      marginBottom: spacing.sm,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text },
    subtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  });
