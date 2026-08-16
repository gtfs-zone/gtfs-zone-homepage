// Line glyphs for the term/description lists.
//
// One definition per glyph, expanded into page.html by the `@icon` pass in
// vite.config.ts. Same stroke language as the `.os-glyph` marks: a 24 box, no
// fill, currentColor stroke, hairline weight, round joins. Only the inner
// markup lives here; the plugin writes the <svg> wrapper.

export const icons: Record<string, string> = {
  // Schedule
  'routes-stops':
    '<path d="M4 17.5c4.5 0 4-11 8.5-11S20 11 20 11"/><circle cx="4" cy="17.5" r="1.8"/><circle cx="20" cy="11" r="1.8"/>',
  schedule: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3.2 2"/>',
  fares:
    '<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5a2 2 0 0 0 0 7 1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5a2 2 0 0 0 0-7Z"/><path d="M12 9v1M12 11.5v1M12 14v1"/>',
  flexible: '<path d="M4 17h3.5a4.5 4.5 0 0 0 4.5-4.5A4.5 4.5 0 0 1 16.5 8H20"/><path d="m17 5 3 3-3 3"/>',
  pathways: '<path d="M4 20h4v-4h4v-4h4V8h4"/><path d="M4 20v-1"/>',

  // Realtime
  'vehicle-position':
    '<path d="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  'trip-update': '<path d="M20 12a8 8 0 1 1-2.7-6"/><path d="M20 4v4h-4"/><path d="M12 8v4.2l3 1.8"/>',
  'service-alert': '<path d="M12 4 2.9 20h18.2L12 4Z"/><path d="M12 10.5v4M12 17.2h.01"/>',

  // Manager
  feeds: '<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.8 9 4.8 9-4.8"/>',
  'vehicle-tracking':
    '<rect x="5" y="4" width="14" height="13" rx="2.5"/><path d="M5 11.5h14"/><circle cx="8.6" cy="14.3" r="1"/><circle cx="15.4" cy="14.3" r="1"/><path d="M8 17v2M16 17v2"/>',

  // Tracking hardware
  satellite:
    '<circle cx="12" cy="12" r="2.2"/><path d="M8.8 8.8a4.5 4.5 0 0 0 0 6.4M15.2 15.2a4.5 4.5 0 0 0 0-6.4"/><path d="M5.8 5.8a8.7 8.7 0 0 0 0 12.4M18.2 18.2a8.7 8.7 0 0 0 0-12.4"/>',
  tracker:
    '<rect x="5" y="9" width="14" height="10" rx="2"/><path d="M12 9V5.5"/><circle cx="12" cy="4.2" r="1.2"/><path d="M9 14h6"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M10.5 6h3"/><circle cx="12" cy="17.4" r="1"/>',

  // Visualizer
  'map-vehicles':
    '<path d="M9 5 3 7v12l6-2 6 2 6-2V5l-6 2-6-2Z"/><path d="M9 5v12M15 7v12"/><circle cx="12" cy="12" r="1.6"/>',
  catalog: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5v14"/><path d="M12 9.5h6M12 13h4"/>',
};
