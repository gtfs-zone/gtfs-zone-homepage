// schema.org JSON-LD for the page head, expanded by the @jsonld pass in
// vite.config.ts. URLs come from links.ts so they cannot drift from the copy.

import { CONTACT_EMAIL, links } from './links';

const SITE = 'https://gtfs.zone/';

// The apps' canonical URLs end in a slash; links.ts hrefs do not.
const canonical = (href: string): string => (href.endsWith('/') ? href : `${href}/`);

const free = { '@type': 'Offer', price: '0', priceCurrency: 'USD' };

export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE}#website`,
      name: 'gtfs.zone',
      url: SITE,
      publisher: { '@id': `${SITE}#org` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}#org`,
      name: 'gtfs.zone',
      url: SITE,
      logo: `${SITE}logo.svg`,
      email: CONTACT_EMAIL,
      sameAs: [links.source.href, links.mirror.href],
    },
    {
      '@type': 'WebApplication',
      name: 'GTFS editor',
      alternateName: 'edit.gtfs.zone',
      url: canonical(links.editor.href),
      description:
        'Browser-based GTFS Schedule editor. Load, inspect, edit, validate, and export a GTFS feed on a map, with no server and no account.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript and WebGL',
      isAccessibleForFree: true,
      offers: free,
      publisher: { '@id': `${SITE}#org` },
    },
    {
      '@type': 'WebApplication',
      name: 'GTFS Realtime visualizer',
      alternateName: 'viz.rt.gtfs.zone',
      url: canonical(links.visualizer.href),
      description:
        'Browser-based GTFS Realtime visualizer. Vehicle positions, trip updates, and service alerts from any feed on a live map.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript and WebGL',
      isAccessibleForFree: true,
      offers: free,
      publisher: { '@id': `${SITE}#org` },
    },
  ],
};
