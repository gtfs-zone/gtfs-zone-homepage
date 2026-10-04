import { defineConfig, type Plugin } from 'vite';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Copy } from './src/content/copy';
import { editorLink, feeds, visualizerLink } from './src/content/feeds';
import { icons } from './src/content/icons';
import { links } from './src/content/links';
import { structuredData } from './src/content/structured-data';
import {
  catalogs,
  DEFAULT_LOCALE,
  LOCALE_ALIASES,
  localeInfo,
  LOCALES,
  type Locale,
} from './src/i18n/catalogs';
import { localeRedirect } from './src/i18n/preference';

// The body markup lives in src/page.html and is inlined here, and the feed chips
// are generated from feeds.ts so the editor list and the visualizer list cannot
// drift from each other.
//
// index.html is rendered once per locale: `/` (English), `/fr/`, `/fr-ca/`,
// `/de/` and `/de-ch/` (see src/i18n/catalogs.ts). The other locales' pages have
// no file of their own; each is index.html served under <path>/index.html, and
// the passes below pick the locale from the page's path.
//
// Ten passes, in order:
//   1. @include:         inline the body markup
//   2. @feeds:           expand the generated feed chip lists
//   3. @icon:            expand a list glyph from icons.ts, so a mark is defined once
//   4. @version:         stamp the build version from git tags
//   5. @jsonld:          emit the schema.org JSON-LD from structured-data.ts
//   6. @alternates:      emit the hreflang links and og:locale:alternate tags
//   7. @locale-redirect: on the default locale's page, send another preference to its page
//   8. @locales:         emit the language switcher's links
//   9. {{...}}:          fill copy from the locale's catalog, URLs from links.ts and
//                          per-page values, then assert no marker is left
//  10. new-tab:          stamp target/rel on every external anchor, then assert none
//                          were missed. This is what makes the rule unforgettable: no
//                          author has to remember it per-anchor.

const SITE = 'https://gtfs.zone';

const EXTERNAL_ANCHOR =
  /<a\s([^>]*?)href="((?:https?:|mailto:)[^"]*)"([^>]*?)>/g;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function chips(kind: 'editor' | 'visualizer', copy: Copy): string {
  const href = kind === 'editor' ? editorLink : visualizerLink;
  // The same feed appears in both lists, so each link states its destination
  // off-screen: identical link text pointing at two targets reads as one link.
  const destination =
    kind === 'editor'
      ? copy.feeds.editorDestination
      : copy.feeds.visualizerDestination;
  const items = feeds
    .map(
      (feed) => `    <li>
      <a class="chip block h-full p-4" href="${escapeHtml(href(feed))}">
        <span class="font-semibold">${escapeHtml(feed.name)}</span>
        <span class="lede mt-1 block text-sm">${escapeHtml(copy.feeds[feed.id])}</span>
        <span class="sr-only-desc">, ${escapeHtml(destination)}</span>
      </a>
    </li>`
    )
    .join('\n');
  return `<ul class="mt-4 grid gap-3 md:grid-cols-3" data-feed-chips="${kind}">\n${items}\n  </ul>`;
}

// Decorative, so aria-hidden and no role.
function icon(name: string): string {
  const paths = icons[name];
  if (!paths)
    throw new Error(`@icon ${name}: no such glyph in src/content/icons.ts`);
  return (
    '<svg class="list-glyph" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" ' +
    'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ' +
    `stroke-linejoin="round">${paths}</svg>`
  );
}

// Build version, read from git tags the same way the editor reads it. Exactly on
// a tag gives the clean version; anywhere else appends the commit distance and
// hash, so a page served off an untagged build says so.
function buildVersion(): string {
  const git = (cmd: string): string =>
    execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  try {
    const described = git('git describe --tags --long --abbrev=7');
    const parts = /^(.*)-(\d+)-g([0-9a-f]+)$/.exec(described);
    if (!parts) return described.replace(/^v/, '');
    const [, tag, distance, hash] = parts;
    const clean = tag.replace(/^v/, '');
    return distance === '0' ? clean : `${clean}-${distance}-g${hash}`;
  } catch {
    try {
      return `0.0.0-dev.${git('git rev-parse --short HEAD')}`;
    } catch {
      return '0.0.0-development';
    }
  }
}

const version = buildVersion();

/** The locale whose page lives at `path`; anything not under a locale's directory is the default. */
function localeOf(path: string): Locale {
  return (
    LOCALES.find(
      (l) => l !== DEFAULT_LOCALE && path.startsWith(localeInfo[l].path)
    ) ?? DEFAULT_LOCALE
  );
}

/** The catalog string at a dotted path such as `scheduled.features.0.term`. */
function catalogString(copy: Copy, key: string): string | undefined {
  let node: unknown = copy;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null || !(part in node)) {
      return undefined;
    }
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/**
 * The value behind a `{{...}}` marker: `href:<name>` is a URL from links.ts,
 * `page:<name>` a per-locale page value, anything else a catalog key.
 */
function markerValue(locale: Locale, marker: string): string | undefined {
  const [ns, name] = marker.includes(':') ? marker.split(':', 2) : ['', marker];
  if (ns === 'href') {
    return (links as Record<string, string>)[name];
  }
  if (ns === 'page') {
    const page: Record<string, string> = {
      lang: locale,
      url: SITE + localeInfo[locale].path,
      ogLocale: localeInfo[locale].ogLocale,
      localeCode: localeInfo[locale].code,
    };
    return page[name];
  }
  return ns === '' ? catalogString(catalogs[locale], name) : undefined;
}

function alternates(locale: Locale): string {
  return [
    ...LOCALES.map(
      (l) =>
        `<link rel="alternate" hreflang="${l}" href="${SITE}${localeInfo[l].path}" />`
    ),
    `<link rel="alternate" hreflang="x-default" href="${SITE}${localeInfo[DEFAULT_LOCALE].path}" />`,
    ...LOCALES.filter((l) => l !== locale).map(
      (l) =>
        `<meta property="og:locale:alternate" content="${localeInfo[l].ogLocale}" />`
    ),
  ].join('\n    ');
}

// One plain link per locale, so switching works with JS off. Names are
// endonyms, the same on every page, so they come from the locale table.
function localeLinks(locale: Locale): string {
  return LOCALES.map((l) => {
    const { path, name } = localeInfo[l];
    const current = l === locale ? ' aria-current="page"' : '';
    return `<li><a href="${path}" hreflang="${l}" lang="${l}" data-locale-toggle="${l}"${current}>${escapeHtml(name)}</a></li>`;
  }).join('\n    ');
}

/** sitemap.xml: every locale's page with its alternates, then the apps. */
function sitemap(): string {
  const links = LOCALES.map(
    (l) =>
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${localeInfo[l].path}" />`
  ).join('\n');
  const pages = LOCALES.map(
    (l) =>
      `  <url>\n    <loc>${SITE}${localeInfo[l].path}</loc>\n${links}\n  </url>`
  );
  const apps = [
    'https://edit.gtfs.zone/',
    'https://viz.rt.gtfs.zone/',
    'https://list.gtfs.zone/',
  ].map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- The apps live on their own hosts and ship their own sitemaps; these
     cross-domain entries are the extra signal, and are only honored because
     every host here is verified in Search Console. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...pages, ...apps].join('\n')}
</urlset>
`;
}

function buildPage(): Plugin {
  const root = __dirname;
  // Entry ids of the non-default locales' pages, e.g. <root>/fr/index.html.
  const localePages = new Map(
    LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((l) => [
      resolve(root, `.${localeInfo[l].path}index.html`),
      l,
    ])
  );
  const template = (): string =>
    readFileSync(resolve(root, 'index.html'), 'utf-8');

  return {
    name: 'build-page',
    config() {
      return {
        build: {
          rollupOptions: {
            input: [resolve(root, 'index.html'), ...localePages.keys()],
          },
        },
      };
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemap(),
      });
    },
    resolveId(id) {
      return localePages.has(id) ? id : null;
    },
    load(id) {
      return localePages.has(id) ? template() : null;
    },
    configureServer(server) {
      // Dev: serve index.html under each locale's path.
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? '').split(/[?#]/)[0];
        const locale = LOCALES.find(
          (l) =>
            l !== DEFAULT_LOCALE &&
            [
              localeInfo[l].path,
              localeInfo[l].path.replace(/\/$/, ''),
              `${localeInfo[l].path}index.html`,
            ].includes(path)
        );
        if (!locale) {
          next();
          return;
        }
        if (!path.endsWith('/') && !path.endsWith('.html')) {
          res.writeHead(301, { Location: localeInfo[locale].path }).end();
          return;
        }
        const html = await server.transformIndexHtml(
          `${localeInfo[locale].path}index.html`,
          template(),
          req.originalUrl
        );
        res.setHeader('Content-Type', 'text/html').end(html);
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const locale = localeOf(ctx.path);
        const copy = catalogs[locale];

        let out = html.replace(
          /<!--\s*@include\s+(\S+)\s*-->/g,
          (_, file: string) =>
            readFileSync(resolve(__dirname, 'src', file), 'utf-8')
        );

        out = out.replace(
          /<!--\s*@feeds\s+(editor|visualizer)\s*-->/g,
          (_, kind) => chips(kind as 'editor' | 'visualizer', copy)
        );

        out = out.replace(/<!--\s*@icon\s+([\w-]+)\s*-->/g, (_, name: string) =>
          icon(name)
        );

        out = out.replace(/<!--\s*@version\s*-->/g, escapeHtml(version));

        // `<` is escaped so no string in the data can close the script element.
        out = out.replace(
          /<!--\s*@jsonld\s*-->/g,
          () =>
            `<script type="application/ld+json">${JSON.stringify(structuredData(copy, locale)).replace(/</g, '\\u003c')}</script>`
        );

        out = out.replace(/<!--\s*@alternates\s*-->/g, () =>
          alternates(locale)
        );

        out = out.replace(/<!--\s*@locale-redirect\s*-->/g, () => {
          if (locale !== DEFAULT_LOCALE) return '';
          const paths = Object.fromEntries(
            LOCALES.map((l) => [l, localeInfo[l].path])
          );
          return `<script>(${localeRedirect.toString()})(${JSON.stringify(paths)}, ${JSON.stringify(LOCALE_ALIASES)});</script>`;
        });

        out = out.replace(/<!--\s*@locales\s*-->/g, () => localeLinks(locale));

        out = out.replace(/\{\{\s*([\w.:-]+)\s*\}\}/g, (_, marker: string) => {
          const value = markerValue(locale, marker);
          if (value === undefined) {
            throw new Error(`${ctx.path}: unknown marker {{${marker}}}`);
          }
          return escapeHtml(value);
        });
        const unfilled = out.match(/\{\{[^}]*\}\}/g);
        if (unfilled) {
          throw new Error(
            `${ctx.path}: unfilled markers: ${unfilled.join(', ')}`
          );
        }

        out = out.replace(
          EXTERNAL_ANCHOR,
          (match, before: string, href: string, after: string) => {
            if (/\btarget=/.test(before + after)) return match;
            return `<a ${before}href="${href}" target="_blank" rel="noopener noreferrer"${after}>`;
          }
        );

        const missed = [...out.matchAll(EXTERNAL_ANCHOR)].filter(
          (m) =>
            !/\btarget="_blank"/.test(m[1] + m[3]) ||
            !/\brel="noopener noreferrer"/.test(m[1] + m[3])
        );
        if (missed.length > 0) {
          throw new Error(
            `${ctx.path}: external anchors without target="_blank" rel="noopener noreferrer":\n` +
              missed.map((m) => `  ${m[0]}`).join('\n')
          );
        }

        return out;
      },
    },
  };
}

export default defineConfig({
  plugins: [buildPage()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 8080,
    host: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
});
