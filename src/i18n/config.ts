import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { supabase } from '@/integrations/supabase/client';

// Fallback resources for when database is unavailable
import enFallback from './locales/en.json';
import arFallback from './locales/ar.json';

let databaseResources: any = null;

// Load translations from database
const loadDatabaseTranslations = async () => {
  try {
    const { data: translations, error } = await supabase
      .from('translations')
      .select('*');

    if (error) throw error;

    const resources = { en: { translation: {} }, ar: { translation: {} } };
    
    translations?.forEach((translation: any) => {
      const keyParts = translation.key.split('.');
      
      // Set Arabic translation
      let currentAr = resources.ar.translation;
      for (let i = 0; i < keyParts.length - 1; i++) {
        if (!currentAr[keyParts[i]]) {
          currentAr[keyParts[i]] = {};
        }
        currentAr = currentAr[keyParts[i]];
      }
      currentAr[keyParts[keyParts.length - 1]] = translation.arabic_text;

      // Set English translation
      let currentEn = resources.en.translation;
      for (let i = 0; i < keyParts.length - 1; i++) {
        if (!currentEn[keyParts[i]]) {
          currentEn[keyParts[i]] = {};
        }
        currentEn = currentEn[keyParts[i]];
      }
      currentEn[keyParts[keyParts.length - 1]] = translation.english_text;
    });

    databaseResources = resources;
    return resources;
  } catch (error) {
    console.warn('Failed to load translations from database, using fallback:', error);
    return {
      en: { translation: enFallback },
      ar: { translation: arFallback }
    };
  }
};

// Initialize with fallback resources first
const fallbackResources = {
  en: { translation: enFallback },
  ar: { translation: arFallback }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: fallbackResources,
    lng: 'ar', // default language
    fallbackLng: 'ar',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

// Set initial document direction based on detected/default language
const setDocumentDirection = (language: string) => {
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

// Set initial direction
setDocumentDirection(i18n.language || 'ar');

// Listen for language changes and update document direction
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});

// Load database translations asynchronously and update i18n
loadDatabaseTranslations().then((resources) => {
  if (resources) {
    Object.keys(resources).forEach((lng) => {
      // Merge with existing fallback translations to ensure all keys are available
      const existingTranslations = i18n.getResourceBundle(lng, 'translation') || {};
      const mergedTranslations = { ...existingTranslations, ...resources[lng].translation };
      i18n.addResourceBundle(lng, 'translation', mergedTranslations, true, true);
    });
  }
});

// Function to refresh translations from database
export const refreshTranslations = async () => {
  const resources = await loadDatabaseTranslations();
  if (resources) {
    Object.keys(resources).forEach((lng) => {
      // Merge with existing fallback translations to ensure all keys are available
      const existingTranslations = i18n.getResourceBundle(lng, 'translation') || {};
      const mergedTranslations = { ...existingTranslations, ...resources[lng].translation };
      i18n.addResourceBundle(lng, 'translation', mergedTranslations, true, true);
    });
  }
};

export default i18n;