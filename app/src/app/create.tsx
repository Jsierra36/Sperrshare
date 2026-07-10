import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import PostMap from '@/components/PostMap';
import { categories } from '@/data/categories';
import { useAuth } from '@/context/auth-context';
import { usePosts } from '@/context/posts-context';
import { useTheme } from '@/context/theme-context';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

const DEFAULT_PICKUP_LOCATION = { lat: 52.2799, lng: 8.0472 };
// Official Osnabrück city page for scheduling a municipal Sperrmüll pickup.
const MUNICIPAL_PICKUP_URL =
  'https://nachhaltig.osnabrueck.de/de/abfall/muellabfuhr/sperrmuell/sperrmuell-anmelden/';

export default function CreateScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addPost } = usePosts();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [addressText, setAddressText] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const canSubmit =
    !!photoUri &&
    title.trim().length > 0 &&
    addressText.trim().length > 0 &&
    categoryIds.length > 0 &&
    !!location;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!canSubmit || !user || !location) return;
    const post = await addPost({
      userId: user.id,
      userName: user.name,
      categoryIds,
      title: title.trim(),
      description: description.trim(),
      addressText: addressText.trim(),
      lat: location.lat,
      lng: location.lng,
      photoUri: photoUri!,
      pickupDate: pickupDate.trim() ? new Date(pickupDate.trim()).toISOString() : null,
    });
    setPhotoUri(null);
    setTitle('');
    setDescription('');
    setCategoryIds([]);
    setAddressText('');
    setPickupDate('');
    setLocation(null);
    router.push(`/post/${post.id}`);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('create.title')}</Text>
      <Text style={styles.subtitle}>{t('create.subtitle')}</Text>

      <Text style={styles.label}>{t('create.add_photo')}</Text>
      <Pressable style={styles.photoBox} onPress={pickPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <>
            <Text style={{ fontSize: 28 }}>📷</Text>
            <Text style={styles.photoHint}>{t('create.photo_hint')}</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.label}>{t('create.item_title')}</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={t('create.item_title_placeholder')}
        placeholderTextColor={colors.textMuted}
        maxLength={80}
      />

      <Text style={styles.label}>{t('create.description')}</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={description}
        onChangeText={setDescription}
        placeholder={t('create.description_placeholder')}
        placeholderTextColor={colors.textMuted}
        maxLength={1000}
        multiline
      />

      <Text style={styles.label}>
        {t('create.category')} <Text style={styles.labelHint}>{t('create.category_hint')}</Text>
      </Text>
      <View style={styles.chipsWrap}>
        {categories.map((c) => {
          const selected = categoryIds.includes(c.id);
          return (
            <Pressable
              key={c.id}
              style={[styles.chip, selected && styles.chipActive]}
              onPress={() => toggleCategory(c.id)}>
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {selected ? '✓ ' : ''}
                {c.icon} {c.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>{t('create.address')}</Text>
      <TextInput
        style={styles.input}
        value={addressText}
        onChangeText={setAddressText}
        placeholder={t('create.address_placeholder')}
        placeholderTextColor={colors.textMuted}
        maxLength={200}
      />
      <Text style={styles.hint}>{t('create.map_hint')}</Text>
      <View style={{ marginBottom: spacing.md }}>
        <PostMap
          posts={[]}
          onMapClick={(lat, lng) => setLocation({ lat, lng })}
          pickedLocation={location}
          height={220}
        />
      </View>
      {!location && (
        <View style={styles.center}>
          <Pressable
            style={styles.linkButton}
            onPress={() => setLocation(DEFAULT_PICKUP_LOCATION)}>
            <Text style={styles.linkButtonText}>{t('create.use_default_location')}</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.label}>{t('create.pickup_date')}</Text>
      <TextInput
        style={styles.input}
        value={pickupDate}
        onChangeText={setPickupDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textMuted}
      />

      <View style={styles.municipalBox}>
        <Text style={styles.municipalTitle}>{t('create.municipal_pickup_title')}</Text>
        <Text style={styles.municipalText}>{t('create.municipal_pickup_text')}</Text>
        <Pressable onPress={() => Linking.openURL(MUNICIPAL_PICKUP_URL)}>
          <Text style={styles.municipalLink}>{t('create.municipal_pickup_link')} →</Text>
        </Pressable>
      </View>

      <View style={styles.trustBox}>
        <Text style={{ fontSize: 18 }}>🛡️</Text>
        <Text style={styles.trustText}>{t('create.trust_note')}</Text>
      </View>

      <Pressable
        disabled={!canSubmit}
        style={[styles.submit, !canSubmit && styles.submitDisabled]}
        onPress={submit}>
        <Text style={styles.submitText}>{t('create.submit')} →</Text>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
    title: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginTop: spacing.sm },
    subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
    label: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
    labelHint: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
    hint: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
    photoBox: {
      height: 140,
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    photoPreview: { width: '100%', height: '100%' },
    photoHint: { fontFamily: fonts.body, color: colors.textMuted, marginTop: spacing.xs, fontSize: 12 },
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
    textarea: { borderRadius: radius.md, minHeight: 90, textAlignVertical: 'top' },
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    chip: {
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 4,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadow.button },
    chipText: { fontFamily: fonts.label, color: colors.text, fontSize: 13 },
    chipTextActive: { color: '#fff' },
    center: { alignItems: 'center', marginBottom: spacing.md },
    linkButton: { paddingVertical: spacing.xs },
    linkButtonText: { fontFamily: fonts.label, color: colors.primary, fontSize: 13 },
    municipalBox: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    municipalTitle: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.text, marginBottom: 4 },
    municipalText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: spacing.xs },
    municipalLink: { fontFamily: fonts.label, fontSize: 12, color: colors.primary },
    trustBox: {
      flexDirection: 'row',
      gap: spacing.sm,
      backgroundColor: colors.secondaryContainer,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    trustText: { fontFamily: fonts.body, flex: 1, fontSize: 12, color: colors.primaryDark },
    submit: {
      backgroundColor: colors.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      alignItems: 'center',
      ...shadow.button,
    },
    submitDisabled: { opacity: 0.4 },
    submitText: { fontFamily: fonts.headingSemibold, color: '#fff', fontSize: 16 },
  });
