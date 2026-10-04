// The page's locales and their catalogs. The build renders page.html once per
// locale (vite.config.ts); at runtime, scenes read the catalog matching the
// `<html lang>` the build wrote.
//
// Ids are BCP 47 tags. A regional page (`fr-CA`, `de-CH`) exists only where
// the written text differs; other regions are served by the base language's
// page through its generic hreflang (`fr`, `de`).

import { copy as en, type Copy } from '../content/copy';
import { copy as de } from '../content/copy.de';
import { copy as deCH } from '../content/copy.de-ch';
import { copy as fr } from '../content/copy.fr';
import { copy as frCA } from '../content/copy.fr-ca';

export const LOCALES = ['en', 'fr', 'fr-CA', 'de', 'de-CH'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const catalogs: Record<Locale, Copy> = {
  en,
  fr,
  'fr-CA': frCA,
  de,
  'de-CH': deCH,
};

interface LocaleInfo {
  /** Site-relative path of the locale's page. */
  path: string;
  /** Open Graph locale. */
  ogLocale: string;
  /** The language's name in itself, for the switcher. */
  name: string;
  /** Short code shown on the switcher button. */
  code: string;
}

export const localeInfo: Record<Locale, LocaleInfo> = {
  en: { path: '/', ogLocale: 'en_US', name: 'English', code: 'EN' },
  fr: {
    path: '/fr/',
    ogLocale: 'fr_FR',
    name: 'Français (France)',
    code: 'FR',
  },
  'fr-CA': {
    path: '/fr-ca/',
    ogLocale: 'fr_CA',
    name: 'Français (Canada)',
    code: 'FR-CA',
  },
  de: {
    path: '/de/',
    ogLocale: 'de_DE',
    name: 'Deutsch (Deutschland)',
    code: 'DE',
  },
  'de-CH': {
    path: '/de-ch/',
    ogLocale: 'de_CH',
    name: 'Deutsch (Schweiz)',
    code: 'DE-CH',
  },
};

/**
 * Browser language tags sent to a locale other than their own primary
 * subtag's: Liechtenstein writes Swiss Standard German.
 */
export const LOCALE_ALIASES: Record<string, Locale> = { 'de-li': 'de-CH' };

export function isLocale(value: string | null | undefined): value is Locale {
  return (LOCALES as readonly string[]).includes(value ?? '');
}

/** The catalog for the page being shown. */
export function pageCopy(): Copy {
  const lang = document.documentElement.lang;
  return catalogs[isLocale(lang) ? lang : DEFAULT_LOCALE];
}

/** Replace `{name}` placeholders. */
export function fill(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}
