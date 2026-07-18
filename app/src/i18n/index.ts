import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './de';
import en from './en';

export type AppLanguage = 'de' | 'en';
const STORAGE_KEY = 'sperrshare.i18n.language';

// German is the target-market language (docs/normas.md) and the default for anyone who
// hasn't picked a language yet; English is available as a real user-facing choice too
// (see language-settings.tsx), not just a dev fallback.
// eslint-disable-next-line import/no-named-as-default-member -- i18next's default export is the singleton; `.use` here isn't the named `use` export.
i18n.use(initReactI18next).init({
  resources: { en, de },
  lng: 'de',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Hydrate a previously-chosen language after init — init itself must stay synchronous
// (AsyncStorage isn't), so the app always renders in German first and swaps a moment
// later if the user had picked English before.
AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
  if (saved === 'de' || saved === 'en') {
    // eslint-disable-next-line import/no-named-as-default-member
    i18n.changeLanguage(saved);
  }
});

export async function setAppLanguage(lang: AppLanguage) {
  // eslint-disable-next-line import/no-named-as-default-member
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(STORAGE_KEY, lang);
}

export default i18n;
