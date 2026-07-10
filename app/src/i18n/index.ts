import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './de';
import en from './en';

// German is the target-market language (docs/normas.md); English stays as fallback/dev reference.
i18n.use(initReactI18next).init({
  resources: { en, de },
  lng: 'de',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
