// The visitor's locale preference, shared with the apps: a `locale` cookie on
// `.gtfs.zone` (localStorage on any other host, e.g. localhost), the same
// storage gtfs-zone-web-common reads.

import type { Locale } from './catalogs';

const STORAGE_KEY = 'locale';
const COOKIE_DOMAIN = 'gtfs.zone';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function storeLocale(locale: Locale): void {
  const host = location.hostname;
  if (host === COOKIE_DOMAIN || host.endsWith(`.${COOKIE_DOMAIN}`)) {
    document.cookie = `${STORAGE_KEY}=${locale}; Domain=.${COOKIE_DOMAIN}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Not stored: the toggle still navigates.
  }
}

/** Store the toggle's target locale before it navigates there. */
export function initLocaleToggle(): void {
  document
    .querySelectorAll<HTMLAnchorElement>('[data-locale-toggle]')
    .forEach((a) => {
      a.addEventListener('click', () => {
        storeLocale(a.dataset.localeToggle as Locale);
      });
    });
}

/**
 * Sends a visit to `/` on to `/fr/` when the stored preference, or with none
 * stored the browser's first supported language, is French. Inlined as a
 * classic script at the top of the English page's head (vite.config.ts), so it
 * must not reference anything outside its own body. No-JS visitors stay on
 * the page they asked for.
 */
export function localeRedirect(): void {
  const supported = ['en', 'fr'];
  let preferred: string | null =
    /(?:^|;\s*)locale=([^;]*)/.exec(document.cookie)?.[1] ?? null;
  if (!preferred || !supported.includes(preferred)) {
    try {
      preferred = localStorage.getItem('locale');
    } catch {
      preferred = null;
    }
  }
  if (!preferred || !supported.includes(preferred)) {
    preferred =
      (navigator.languages ?? [navigator.language])
        .map((tag) => tag.toLowerCase().split('-')[0])
        .find((primary) => supported.includes(primary)) ?? null;
  }
  if (preferred === 'fr') {
    location.replace('/fr/' + location.search + location.hash);
  }
}
