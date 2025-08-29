import { useState, useCallback, useEffect } from 'react';
import { translations } from '../translations';

type Language = 'en' | 'id';

export const useTranslation = () => {
  const [lang, setLangState] = useState<Language>(() => {
    // Check for saved language in localStorage or default to 'id'
    const savedLang = localStorage.getItem('appLanguage');
    return (savedLang === 'en' || savedLang === 'id') ? savedLang : 'id';
  });

  useEffect(() => {
    // Save language to localStorage whenever it changes
    localStorage.setItem('appLanguage', lang);
  }, [lang]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
  }, []);

  const t = useCallback((key: string): string => {
    // Fallback to English if a key is missing in the current language
    return translations[lang][key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en] || key;
  }, [lang]);

  return { lang, setLang, t };
};
