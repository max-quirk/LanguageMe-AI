import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { languageImports } from './languageImports';
import languages from '../utils/languages';
import { LanguageCode } from 'iso-639-1';

const DEFAULT_LANGUAGE = 'en';

// Define the type for resources
interface Resources {
  [key: string]: {
    translation: { [key: string]: string }
  }
}

// Function to load translations synchronously
const loadTranslations = (): Resources => {
  const resources: Resources = {};

  languages.forEach(({ code }) => {
    const _code = code as LanguageCode
    const translation = languageImports[_code] ?? {}
    if (languageImports[_code]) {
      resources[code] = { translation };
    } else {
      console.warn(`Translation file for language code ${code} not found.`);
    }
  });

  return resources;
};

const resources = loadTranslations();

i18n.use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: 'v3', // Android
    resources,
    lng: DEFAULT_LANGUAGE, // default language to use.
    // if you're using a language detector, do not define the lng option
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
