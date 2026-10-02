// The page's locales and their catalogs. The build renders page.html once per
// locale (vite.config.ts); at runtime, scenes read the catalog matching the
// `<html lang>` the build wrote.

import { copy as en, type Copy } from '../content/copy';
import { copy as fr } from '../content/copy.fr';

export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const catalogs: Record<Locale, Copy> = { en, fr };

/** Site-relative path of each locale's page. */
export const localePath: Record<Locale, string> = { en: '/', fr: '/fr/' };

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
