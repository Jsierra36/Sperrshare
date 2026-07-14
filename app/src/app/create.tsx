import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import DatePickerField from '@/components/DatePickerField';
import PostMap from '@/components/PostMap';
import { categories } from '@/data/categories';
import { useAuth } from '@/context/auth-context';
import { usePosts } from '@/context/posts-context';
import { useTheme } from '@/context/theme-context';
import { geocodeAddress } from '@/lib/geocoding';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

const DEFAULT_PICKUP_LOCATION = { lat: 52.2799, lng: 8.0472 };
const GEOCODE_DEBOUNCE_MS = 900;
// Official Osnabrück city page for scheduling a municipal Sperrmüll pickup.
const MUNICIPAL_PICKUP_URL =
  'https://nachhaltig.osnabrueck.de/de/abfall/muellabfuhr/sperrmuell/sperrmuell-anmelden/';

export default function CreateScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { allPosts, addPost, updatePost } = usePosts();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();

  const editingPost = editId ? allPosts.find((p) => p.id === editId && p.userId === user?.id) : undefined;
  const isEditing = !!editingPost;

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [addressText, setAddressText] = useState('');
  const [pickupDate, setPickupDate] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // "Adjust state during render" (React docs pattern) instead of an effect, since this
  // only needs to run once, the moment `editingPost` first becomes available — an effect
  // would call setState synchronously in its body, which react-compiler flags.
  const [loadedEditId, setLoadedEditId] = useState<string | null>(null);
  const prefilled = !editId || loadedEditId === editId;
  if (editingPost && loadedEditId !== editingPost.id) {
    setLoadedEditId(editingPost.id);
    setPhotoUri(editingPost.photoUri);
    setTitle(editingPost.title);
    setDescription(editingPost.description);
    setCategoryIds(editingPost.categoryIds);
    setAddressText(editingPost.addressText);
    setPickupDate(editingPost.pickupDate ? editingPost.pickupDate.slice(0, 10) : null);
    setLocation({ lat: editingPost.lat, lng: editingPost.lng });
  }

  // Auto-geocode the typed address (Nominatim, free/no key — docs/normas.md) so a pin
  // drops without the user having to tap the map. Manually tapping the map still wins,
  // since that just calls setLocation directly and doesn't touch addressText. All setState
  // calls happen inside the timeout callback, not synchronously in the effect body, so
  // there's nothing to clean up but the pending timer itself.
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeFailed, setGeocodeFailed] = useState(false);
  const addressTooShort = addressText.trim().length > 0 && addressText.trim().length < 5;
  useEffect(() => {
    if (editId && !prefilled) return; // don't re-geocode over the pre-filled pin on edit load
    const query = addressText.trim();
    if (query.length < 5) return;
    const handle = setTimeout(async () => {
      setIsGeocoding(true);
      setGeocodeFailed(false);
      try {
        const result = await geocodeAddress(query, i18n.language);
        if (result) {
          setLocation({ lat: result.lat, lng: result.lng });
          setGeocodeFailed(false);
        } else {
          setGeocodeFailed(true);
        }
      } catch {
        setGeocodeFailed(true);
      } finally {
        setIsGeocoding(false);
      }
    }, GEOCODE_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [addressText, i18n.language, editId, prefilled]);

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

  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const pickPhoto = async () => {
    setPhotoError(null);
    setIsPickingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : t('errors.photo_pick_failed'));
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submit = async () => {
    if (!canSubmit || !user || !location || isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (editingPost) {
        await updatePost({
          id: editingPost.id,
          userId: user.id,
          userName: user.name,
          categoryIds,
          title: title.trim(),
          description: description.trim(),
          addressText: addressText.trim(),
          lat: location.lat,
          lng: location.lng,
          photoUri: photoUri!,
          pickupDate,
        });
        router.replace(`/post/${editingPost.id}`);
        return;
      }

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
        pickupDate,
      });
      router.replace(`/post/${post.id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : t('errors.submit_failed'));
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEditing ? t('create.edit_title') : t('create.title')}</Text>
      <Text style={styles.subtitle}>{t('create.subtitle')}</Text>

      <Text style={styles.label}>{t('create.add_photo')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('create.add_photo')}
        style={styles.photoBox}
        onPress={pickPhoto}
        disabled={isPickingPhoto}>
        {isPickingPhoto ? (
          <ActivityIndicator color={colors.primary} />
        ) : photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <>
            <Text style={{ fontSize: 28 }}>📷</Text>
            <Text style={styles.photoHint}>{t('create.photo_hint')}</Text>
          </>
        )}
      </Pressable>
      {photoError && <Text style={styles.errorText}>{photoError}</Text>}

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
      <Text style={styles.hint}>
        {isGeocoding
          ? t('create.geocoding')
          : geocodeFailed && !addressTooShort
            ? t('create.geocoding_failed')
            : t('create.map_hint')}
      </Text>
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
      <DatePickerField
        value={pickupDate}
        onChange={setPickupDate}
        placeholder={t('create.pickup_date_placeholder')}
      />

      <View style={styles.municipalBox}>
        <Text style={styles.municipalTitle}>{t('create.municipal_pickup_title')}</Text>
        <Text style={styles.municipalText}>{t('create.municipal_pickup_text')}</Text>
        <Pressable
          onPress={() => {
            Linking.openURL(MUNICIPAL_PICKUP_URL).catch(() => setLinkError(t('errors.link_open_failed')));
          }}>
          <Text style={styles.municipalLink}>{t('create.municipal_pickup_link')} →</Text>
        </Pressable>
        {linkError && <Text style={styles.errorText}>{linkError}</Text>}
      </View>

      <View style={styles.trustBox}>
        <Text style={{ fontSize: 18 }}>🛡️</Text>
        <Text style={styles.trustText}>{t('create.trust_note')}</Text>
      </View>

      {submitError && <Text style={styles.errorText}>{submitError}</Text>}

      <Pressable
        disabled={!canSubmit || isSubmitting}
        style={[styles.submit, (!canSubmit || isSubmitting) && styles.submitDisabled]}
        onPress={submit}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            {isEditing ? t('create.update_submit') : t('create.submit')} →
          </Text>
        )}
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
    errorText: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.error,
      marginTop: -spacing.xs,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
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
