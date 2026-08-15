// Every off-site destination the page names, in one table.
//
// Nothing here is spelled out a second time in copy.ts or page.html, so a URL
// cannot drift between the hero, a section, and the footer.
//
// New-tab attributes are not attached here. The vite plugin in vite.config.ts
// stamps `target="_blank" rel="noopener noreferrer"` onto every external anchor
// in the built HTML and fails the build if one slips through, which is the only
// way to make the rule hold for markup nobody generated from this file. Use
// `linkAttrs()` when a scene or a script builds an anchor at runtime, where the
// build-time pass cannot see it.

export interface Link {
  label: string;
  href: string;
}

export const links = {
  editor: { label: 'Open the editor', href: 'https://edit.gtfs.zone' },
  visualizer: { label: 'Browse realtime feeds', href: 'https://viz.rt.gtfs.zone' },
  // Logged-out visitors get a 401, so the label says "sign in" rather than
  // promising a page they can look at.
  manager: { label: 'Sign in to the manager', href: 'https://manage.rt.gtfs.zone' },

  gtfs: { label: 'Learn more at gtfs.org', href: 'https://gtfs.org' },
  scheduleReference: {
    label: 'View the spec',
    href: 'https://gtfs.org/documentation/schedule/reference/',
  },
  realtimeReference: {
    label: 'View the spec',
    href: 'https://gtfs.org/documentation/realtime/reference/',
  },

  traccar: { label: 'Traccar', href: 'https://www.traccar.org/' },
  traccarDevices: {
    label: 'see the supported device list',
    href: 'https://www.traccar.org/devices/',
  },

  source: { label: 'View the source', href: 'https://git.kcfam.us/gtfs.zone' },
} as const satisfies Record<string, Link>;

// Short footer labels. The full labels above are calls to action and read wrong
// in a row of five.
export const footerLinks: Link[] = [
  { label: 'Editor', href: links.editor.href },
  { label: 'Visualizer', href: links.visualizer.href },
  { label: 'Manager', href: links.manager.href },
  { label: 'Source', href: links.source.href },
  { label: 'gtfs.org', href: links.gtfs.href },
];

export const CONTACT_EMAIL = 'inquiry@gtfs.zone';

/** Attributes every off-site anchor carries. */
export function linkAttrs(): Record<string, string> {
  return { target: '_blank', rel: 'noopener noreferrer' };
}
