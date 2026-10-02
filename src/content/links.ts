// Every off-site destination the page names, in one table.
//
// Nothing here is spelled out a second time in copy.ts or page.html, so a URL
// cannot drift between the hero, a section, and the footer. Labels live in the
// catalogs (copy.ts, copy.fr.ts); page.html reads a URL with `{{href:name}}`.
//
// New-tab attributes are not attached here. The vite plugin in vite.config.ts
// stamps `target="_blank" rel="noopener noreferrer"` onto every external anchor
// in the built HTML and fails the build if one slips through, which is the only
// way to make the rule hold for markup nobody generated from this file.

export const CONTACT_EMAIL = 'inquiry@gtfs.zone';

export const links = {
  editor: 'https://edit.gtfs.zone',
  visualizer: 'https://viz.rt.gtfs.zone',
  feedMap: 'https://list.gtfs.zone',
  // Logged-out visitors get a 401, so the label says "sign in" rather than
  // promising a page they can look at.
  manager: 'https://manage.rt.gtfs.zone',

  gtfs: 'https://gtfs.org',
  scheduleReference: 'https://gtfs.org/documentation/schedule/reference/',
  realtimeReference: 'https://gtfs.org/documentation/realtime/reference/',

  traccar: 'https://www.traccar.org/',
  traccarDevices: 'https://www.traccar.org/devices/',

  // Where a published feed ends up. Named, never drawn: no third-party logos
  // anywhere on the page.
  googleMaps: 'https://www.google.com/maps',
  appleMaps: 'https://maps.apple.com',
  transitApp: 'https://transitapp.com',
  motis: 'https://motis-project.de',

  source: 'https://github.com/gtfs-zone',

  // Filing an issue needs a GitHub account; the contact address does not.
  newIssue: 'https://github.com/gtfs-zone/gtfs-zone-homepage/issues/new',

  contact: `mailto:${CONTACT_EMAIL}`,
} as const satisfies Record<string, string>;
