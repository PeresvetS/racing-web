/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  type Locale,
  type TranslationKey,
  translations,
  defaultLocale,
  getNestedValue,
  locales,
} from '@/lib/i18n';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  locales: Record<Locale, string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  storageKey?: string;
}

export function I18nProvider({ children, storageKey = 'racing-locale' }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored && (stored === 'ru' || stored === 'en' || stored === 'ee')) {
      return stored;
    }
    return defaultLocale;
  });

  const setLocale = useCallback(
    (newLocale: Locale) => {
      localStorage.setItem(storageKey, newLocale);
      setLocaleState(newLocale);
    },
    [storageKey],
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let result = getNestedValue(translations[locale], key);
      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
        });
      }
      return result;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
