import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { languages, translations, type Language, type TranslationKey } from './translations';

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'vanta-lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in languages) return saved as Language;
    } catch {
      // no storage access — default to English
    }
    return 'en';
  });

  useEffect(() => {
    const meta = languages[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // persist not available
    }
  }, [lang]);

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[lang]?.[key] ?? translations.en[key] ?? key;
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
