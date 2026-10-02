// schema.org JSON-LD for the page head, expanded by the @jsonld pass in
// vite.config.ts once per locale. URLs come from links.ts so they cannot drift
// from the copy; names and descriptions come from the locale's catalog.

import type { Copy } from './copy';
import { CONTACT_EMAIL, links } from './links';

const SITE = 'https://gtfs.zone/';

// The apps' canonical URLs end in a slash; links.ts hrefs do not.
const canonical = (href: string): string =>
  href.endsWith('/') ? href : `${href}/`;

const free = { '@type': 'Offer', price: '0', priceCurrency: 'USD' };

export function structuredData(copy: Copy, lang: string): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}#website`,
        name: 'gtfs.zone',
        url: SITE,
        inLanguage: lang,
        publisher: { '@id': `${SITE}#org` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE}#org`,
        name: 'gtfs.zone',
        url: SITE,
        logo: `${SITE}logo.svg`,
        email: CONTACT_EMAIL,
        sameAs: [links.source],
      },
      {
        '@type': 'WebApplication',
        name: copy.meta.editorName,
        alternateName: 'edit.gtfs.zone',
        url: canonical(links.editor),
        description: copy.meta.editorDescription,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        browserRequirements: copy.meta.requiresJs,
        isAccessibleForFree: true,
        offers: free,
        publisher: { '@id': `${SITE}#org` },
      },
      {
        '@type': 'WebApplication',
        name: copy.meta.visualizerName,
        alternateName: 'viz.rt.gtfs.zone',
        url: canonical(links.visualizer),
        description: copy.meta.visualizerDescription,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        browserRequirements: copy.meta.requiresJs,
        isAccessibleForFree: true,
        offers: free,
        publisher: { '@id': `${SITE}#org` },
      },
    ],
  };
}
