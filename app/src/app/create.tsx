import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
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
import { MAX_PHOTOS, usePosts } from '@/context/posts-context';
import { useTheme } from '@/context/theme-context';
import { geocodeAddress, reverseGeocode } from '@/lib/geocoding';
import { fonts, radius, shadow, spacing, type ColorPalette } from '@/theme/colors';

const GEOCODE_DEBOUNCE_MS = 900;
const MAX_PICKUP_DAYS_AHEAD = 40;

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

  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [addressText, setAddressText] = useState('');
  const [pickupDate, setPickupDate] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // "Adjust state during render" (React docs pattern) instead of an effect, since this
  // only needs to run once, the moment `editingPost` first becomes available — an effect
  // would call setState synchronously in its body, which react-compiler flags.
  const [loadedEditId, setLoadedEditId] = useState<string | null>(null);
  if (editingPost && loadedEditId !== editingPost.id) {
    setLoadedEditId(editingPost.id);
    setPhotoUris(editingPost.photoUris);
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
  // Address most recently written by *us* (reverse-geocoded from a manual pin tap below) —
  // lets the forward-geocode effect below tell "the user typed this" apart from "we just
  // set this from the pin", so tapping the map doesn't immediately re-geocode its own result.
  const lastResolvedAddressRef = useRef<string | null>(null);
  // Skip geocoding while the address still matches the listing being edited — its stored
  // lat/lng is already correct for that exact string. Without this, saving an edit that
  // only touched (say) the title would silently re-geocode the unchanged address and
  // could move the pin to a different match entirely (confirmed: Nominatim resolved an
  // unrelated "Neuer Graben" edit to a wrong city, overwriting a correct manual pin).
  const skipGeocode =
    (!!editingPost && addressText === editingPost.addressText) ||
    (addressText.length > 0 && addressText === lastResolvedAddressRef.current);
  useEffect(() => {
    if (skipGeocode) return;
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
  }, [addressText, i18n.language, skipGeocode]);

  // Manual pin placement (always available, not just when geocoding fails) — reverse-geocodes
  // the tapped point so the address field and the pin stay coherent, per the requirement that
  // they must never disagree. Nominatim's reverse endpoint already resolves to the nearest
  // known street when the tap doesn't land exactly on one (see reverseGeocode in lib/geocoding).
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  // Rapid re-taps each fire their own Nominatim request; responses can arrive out of order,
  // so only the latest tap's response may write addressText (else a slow earlier response
  // would overwrite the newer pin's street with the older one's).
  const tapSeqRef = useRef(0);
  const handleMapTap = async (lat: number, lng: number) => {
    const seq = ++tapSeqRef.current;
    setLocation({ lat, lng });
    setIsReverseGeocoding(true);
    try {
      const street = await reverseGeocode(lat, lng, i18n.language);
      if (seq !== tapSeqRef.current) return; // superseded by a newer tap
      if (street) {
        lastResolvedAddressRef.current = street;
        setAddressText(street);
        setGeocodeFailed(false);
      } else {
        // No street resolvable at this point (water, open land) — surface the same
        // "not found" hint the typed-address path shows, instead of failing silently.
        setGeocodeFailed(true);
      }
    } catch {
      if (seq === tapSeqRef.current) setGeocodeFailed(true);
    } finally {
      if (seq === tapSeqRef.current) setIsReverseGeocoding(false);
    }
  };

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const maxPickupDate = new Date();
  maxPickupDate.setHours(0, 0, 0, 0);
  maxPickupDate.setDate(maxPickupDate.getDate() + MAX_PICKUP_DAYS_AHEAD);
  // The stored date of the post being edited is exempt from the 40-day cap — it was valid
  // when set (the cap counts from *today*), and enforcing it retroactively would block
  // unrelated edits (title, photo) until the user first touched the date.
  const isStoredEditDate =
    !!editingPost && pickupDate === (editingPost.pickupDate ? editingPost.pickupDate.slice(0, 10) : null);
  const pickupDateInRange =
    !pickupDate || isStoredEditDate || new Date(`${pickupDate}T00:00:00`) <= maxPickupDate;

  const canSubmit =
    photoUris.length > 0 &&
    title.trim().length > 0 &&
    addressText.trim().length > 0 &&
    categoryIds.length > 0 &&
    !!location &&
    pickupDateInRange;

  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const addPhoto = async () => {
    setPhotoError(null);
    setIsPickingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUris((prev) => [...prev, result.assets[0].uri].slice(0, MAX_PHOTOS));
      }
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : t('errors.photo_pick_failed'));
    } finally {
      setIsPickingPhoto(false);
    }
  };
  const removePhoto = (index: number) => {
    setPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submit = async () => {
    if (!canSubmit || !user || !location || isSubmitting) return;
    if (!pickupDateInRange) {
      setSubmitError(t('errors.pickup_date_out_of_range', { count: MAX_PICKUP_DAYS_AHEAD }));
      return;
    }
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
          photoUris,
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
        photoUris,
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

      <Text style={styles.label}>
        {t('create.add_photo')} <Text style={styles.labelHint}>{t('create.photo_count_hint')}</Text>
      </Text>
      <View style={styles.photoRow}>
        {photoUris.map((uri, index) => (
          <View key={uri + index} style={styles.photoThumbBox}>
            <Image source={{ uri }} style={styles.photoPreview} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('create.remove_photo')}
              style={styles.photoRemoveButton}
              onPress={() => removePhoto(index)}>
              <Text style={styles.photoRemoveButtonText}>✕</Text>
            </Pressable>
          </View>
        ))}
        {photoUris.length < MAX_PHOTOS && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('create.add_photo')}
            style={styles.photoAddBox}
            onPress={addPhoto}
            disabled={isPickingPhoto}>
            {isPickingPhoto ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={{ fontSize: 24 }}>📷</Text>
                <Text style={styles.photoHint}>{t('create.photo_hint')}</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
      {photoError && <Text style={styles.errorText}>{photoError}</Text>}
      <Text style={styles.hint}>⚠️ {t('create.photo_privacy_note')}</Text>

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

      <Text style={styles.label}>
        {t('create.address')} <Text style={styles.labelHint}>{t('create.address_hint')}</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={addressText}
        onChangeText={setAddressText}
        placeholder={t('create.address_placeholder')}
        placeholderTextColor={colors.textMuted}
        maxLength={200}
      />
      {(isGeocoding || isReverseGeocoding || (geocodeFailed && !addressTooShort)) && (
        <Text style={styles.hint}>
          {isGeocoding || isReverseGeocoding ? t('create.geocoding') : t('create.geocoding_failed')}
        </Text>
      )}
      <View style={{ marginBottom: spacing.md }}>
        <PostMap
          posts={[]}
          // Manual pin placement is always available, not just as a fallback when geocoding
          // fails — handleMapTap reverse-geocodes the tap so the address field and the pin
          // stay coherent (the geocodeAddress effect above skips re-resolving that address).
          onMapClick={handleMapTap}
          pickedLocation={location}
          height={220}
        />
      </View>

      <Text style={styles.label}>{t('create.pickup_date')}</Text>
      <DatePickerField
        value={pickupDate}
        onChange={setPickupDate}
        placeholder={t('create.pickup_date_placeholder')}
        maxDaysAhead={MAX_PICKUP_DAYS_AHEAD}
      />
      <Text style={styles.hint}>{t('create.pickup_date_hint', { count: 14 })}</Text>
      {!pickupDateInRange && (
        <Text style={styles.errorText}>
          {t('errors.pickup_date_out_of_range', { count: MAX_PICKUP_DAYS_AHEAD })}
        </Text>
      )}

      <View style={styles.municipalBox}>
        <Text style={styles.municipalTitle}>{t('create.municipal_pickup_title')}</Text>
        <Text style={styles.municipalText}>{t('create.municipal_pickup_text')}</Text>
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
    photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    photoThumbBox: {
      width: 100,
      height: 100,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
    photoAddBox: {
      width: 100,
      height: 100,
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    photoRemoveButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoRemoveButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
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
    municipalBox: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    municipalTitle: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.text, marginBottom: 4 },
    municipalText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: spacing.xs },
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
