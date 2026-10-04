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

/**
 * Store the switcher's target locale before its link navigates there, and close
 * the open switcher on Escape or a click outside it.
 */
export function initLocaleToggle(): void {
  document
    .querySelectorAll<HTMLAnchorElement>('[data-locale-toggle]')
    .forEach((a) => {
      a.addEventListener('click', () => {
        storeLocale(a.dataset.localeToggle as Locale);
      });
    });

  const switcher = document.querySelector<HTMLDetailsElement>(
    'details.locale-switcher'
  );
  if (!switcher) {
    return;
  }
  document.addEventListener('click', (e) => {
    if (switcher.open && !switcher.contains(e.target as Node)) {
      switcher.open = false;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && switcher.open) {
      switcher.open = false;
      switcher.querySelector('summary')?.focus();
    }
  });
}

/**
 * Sends a visit to `/` on to the page of the stored preference, or with none
 * stored, of the browser's first supported language. A browser tag matches a
 * locale exactly (`fr-CA`), through `aliases` (`de-LI`), or by its primary
 * subtag (`fr-BE` to `fr`). `paths` maps each locale to its page, `aliases`
 * maps lowercase tags to locales.
 *
 * Inlined as a classic script at the top of the English page's head
 * (vite.config.ts) with both maps passed as literals, so it must not reference
 * anything outside its own body. No-JS visitors stay on the page they asked
 * for.
 */
export function localeRedirect(
  paths: Record<string, string>,
  aliases: Record<string, string>
): void {
  const byTag: Record<string, string> = {};
  Object.keys(paths).forEach((l) => {
    byTag[l.toLowerCase()] = l;
  });
  const exact = (tag: string | null): string | null =>
    (tag && byTag[tag.toLowerCase()]) || null;

  let preferred = exact(
    /(?:^|;\s*)locale=([^;]*)/.exec(document.cookie)?.[1] ?? null
  );
  if (!preferred) {
    try {
      preferred = exact(localStorage.getItem('locale'));
    } catch {
      preferred = null;
    }
  }
  if (!preferred) {
    for (const raw of navigator.languages ?? [navigator.language]) {
      const tag = raw.toLowerCase();
      preferred =
        exact(tag) ?? aliases[tag] ?? exact(tag.split('-')[0]) ?? null;
      if (preferred) {
        break;
      }
    }
  }
  if (preferred && paths[preferred] !== '/') {
    location.replace(paths[preferred] + location.search + location.hash);
  }
}
