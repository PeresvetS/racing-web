import { ru, type Translations } from './translations/ru';
import { en } from './translations/en';
import { ee } from './translations/ee';

export type Locale = 'ru' | 'en' | 'ee';

export const locales: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
  ee: 'Eesti',
};

export const translations: Record<Locale, Translations> = {
  ru,
  en,
  ee,
};

export const defaultLocale: Locale = 'en';

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
    ? F
    : T extends [infer F, ...infer R]
      ? F extends string
        ? `${F}${D}${Join<Extract<R, string[]>, D>}`
        : never
      : string;

export type TranslationKey = Join<PathsToStringProps<Translations>, '.'>;

export function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof result === 'string' ? result : path;
}

export { type Translations };
