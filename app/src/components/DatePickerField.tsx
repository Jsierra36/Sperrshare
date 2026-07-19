import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

type Props = {
  value: string | null; // ISO date, yyyy-mm-dd
  onChange: (iso: string | null) => void;
  placeholder: string;
  maxDaysAhead?: number; // disables dates beyond today + this many days
};

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export default function DatePickerField({ value, onChange, placeholder, maxDaysAhead }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(false);

  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());
  const today = startOfDay(new Date());
  const maxDate = useMemo(() => {
    if (maxDaysAhead === undefined) return null;
    const d = startOfDay(new Date());
    d.setDate(d.getDate() + maxDaysAhead);
    return d;
  }, [maxDaysAhead]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(viewDate),
    [viewDate, i18n.language]
  );

  // Monday-first week labels, localized.
  const weekdayLabels = useMemo(() => {
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(d);
    });
  }, [i18n.language]);

  const weeks = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const firstWeekday = (first.getDay() + 6) % 7; // 0 = Monday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewDate]);

  const displayText = selected
    ? new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(selected)
    : placeholder;

  return (
    <>
      <Pressable
        style={styles.field}
        onPress={() => {
          setViewDate(selected ?? new Date());
          setOpen(true);
        }}>
        <Text style={[styles.fieldText, !selected && styles.fieldPlaceholder]}>📅 {displayText}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.calHeader}>
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('common.previous_month')}
                style={styles.navButton}
                onPress={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('common.next_month')}
                style={styles.navButton}
                onPress={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {weekdayLabels.map((w, i) => (
                <Text key={i} style={styles.weekdayText}>
                  {w}
                </Text>
              ))}
            </View>

            {weeks.map((row, ri) => (
              <View key={ri} style={styles.weekRow}>
                {row.map((day, di) => {
                  if (!day) return <View key={di} style={styles.dayCell} />;
                  const isPast = startOfDay(day) < today;
                  const isTooFar = !!maxDate && startOfDay(day) > maxDate;
                  const isDisabled = isPast || isTooFar;
                  const isSelected = !!selected && toIsoDate(day) === toIsoDate(selected);
                  return (
                    <Pressable
                      key={di}
                      disabled={isDisabled}
                      style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                      onPress={() => {
                        onChange(toIsoDate(day));
                        setOpen(false);
                      }}>
                      <Text
                        style={[
                          styles.dayText,
                          isDisabled && styles.dayTextDisabled,
                          isSelected && styles.dayTextSelected,
                        ]}>
                        {day.getDate()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {selected && (
              <Pressable
                style={styles.clearButton}
                onPress={() => {
                  onChange(null);
                  setOpen(false);
                }}>
                <Text style={styles.clearButtonText}>{t('create.clear_date')}</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const CELL_SIZE = 36;

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    field: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
      marginBottom: spacing.md,
    },
    fieldText: { fontFamily: fonts.body, fontSize: 15, color: colors.text },
    fieldPlaceholder: { color: colors.textMuted },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      ...shadow.card,
    },
    calHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    navButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButtonText: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.text },
    monthLabel: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, textTransform: 'capitalize' },
    weekdayRow: { flexDirection: 'row', marginBottom: spacing.xs },
    weekdayText: {
      width: CELL_SIZE,
      textAlign: 'center',
      fontFamily: fonts.label,
      fontSize: 11,
      color: colors.textMuted,
      textTransform: 'capitalize',
    },
    weekRow: { flexDirection: 'row' },
    dayCell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: CELL_SIZE / 2,
    },
    dayCellSelected: { backgroundColor: colors.primary },
    dayText: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
    dayTextDisabled: { color: colors.border },
    dayTextSelected: { fontFamily: fonts.headingSemibold, color: '#fff' },
    clearButton: { alignItems: 'center', marginTop: spacing.sm, paddingVertical: spacing.xs },
    clearButtonText: { fontFamily: fonts.label, fontSize: 13, color: colors.primary },
  });
