import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// Removed supabase import since we're using API calls now

// Fallback resources for when database is unavailable
import enFallback from './locales/en.json';
import arFallback from './locales/ar.json';

let databaseResources: any = null;

// Load translations from database
const loadDatabaseTranslations = async () => {
  try {
    console.log('Loading translations from database...');
    const response = await fetch('/api/translations');
    if (!response.ok) {
      console.error('Failed to fetch translations:', response.status, response.statusText);
      throw new Error(`Failed to fetch translations: ${response.status}`);
    }
    const translations = await response.json();
    console.log('Loaded', translations.length, 'translations from database');

    const resources = { en: { translation: {} }, ar: { translation: {} } };
    
    translations?.forEach((translation: any) => {
      const keyParts = translation.key.split('.');
      
      // Log custom event translations for debugging
      if (translation.key.includes('custom')) {
        console.log('Loading custom translation:', translation.key, '->', translation.arabic_text, '/', translation.english_text);
      }
      
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
// Add a small delay to ensure the app is fully initialized
setTimeout(() => {
  loadDatabaseTranslations().then((resources) => {
    if (resources) {
      console.log('Merging database translations into i18n...');
      Object.keys(resources).forEach((lng) => {
        // Merge with existing fallback translations to ensure all keys are available
        const existingTranslations = i18n.getResourceBundle(lng, 'translation') || {};
        const mergedTranslations = { ...existingTranslations, ...resources[lng].translation };
        i18n.addResourceBundle(lng, 'translation', mergedTranslations, true, true);
        console.log(`Added ${Object.keys(resources[lng].translation).length} translation keys for ${lng}`);
        
        // Debug: Check if custom translations are present
        if (lng === 'ar' && mergedTranslations.addEvent?.eventTypes?.custom) {
          console.log('✓ Custom event type translation found:', mergedTranslations.addEvent.eventTypes.custom);
        }
      });
      
      // Force reload the current language to pick up new translations
      const currentLng = i18n.language;
      i18n.reloadResources(currentLng).then(() => {
        console.log('Translations reloaded successfully for language:', currentLng);
        // Force a language change event to trigger React component re-renders
        i18n.emit('languageChanged', currentLng);
      });
    }
  }).catch((error) => {
    console.error('Error loading database translations:', error);
  });
}, 1000); // 1 second delay

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