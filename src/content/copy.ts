// The English catalog: every string the page shows, in one typed object. It is
// the source of truth for the page's keys; copy.fr.ts is typed against it.
//
// page.html reads a string with `{{section.key}}` (array items by index, e.g.
// `{{scheduled.features.0.term}}`); scenes read it through pageCopy() in
// src/i18n/catalogs.ts. Values are plain text and are HTML-escaped on the way
// into the page. Where a sentence wraps a link, it is split around the link.
//
// Two rules the text is held to. Every sentence states a fact, a feature, or an
// action; no metaphors standing in for claims. Anything describing GTFS itself
// follows gtfs.org's own language rather than inventing a second framing.
//
// URLs live in links.ts, not here. GTFS field names and enum values are never
// translated, so they live in the scenes.

export const copy = {
  meta: {
    title: 'gtfs.zone: open source GTFS and GTFS Realtime tools',
    description:
      'Open source software for building, checking, and publishing GTFS Schedule and GTFS Realtime feeds.',
    editorName: 'GTFS editor',
    editorDescription:
      'Browser-based GTFS Schedule editor. Load, inspect, edit, validate, and export a GTFS feed on a map, with no server and no account.',
    visualizerName: 'GTFS Realtime visualizer',
    visualizerDescription:
      'Browser-based GTFS Realtime visualizer. Vehicle positions, trip updates, and service alerts from any feed on a live map.',
    requiresJs: 'Requires JavaScript and WebGL',
  },
  controls: {
    theme: 'Toggle light and dark',
    // Names the other locale's page, in that locale.
    otherLocale: 'Version française',
    otherLocaleCode: 'FR',
  },
  // Link labels. Distinct labels: two links with the same text and different
  // targets read as one destination to a screen reader running a link list.
  links: {
    editor: 'Open the editor',
    visualizer: 'Browse realtime feeds',
    feedMap: 'Explore the feed map',
    manager: 'Sign in to the manager',
    gtfs: 'Learn more at gtfs.org',
    scheduleReference: 'View the Schedule spec',
    realtimeReference: 'View the Realtime spec',
    traccarDevices: 'see the supported device list',
    source: 'View the source',
    newIssue: 'Report a bug',
  },
  hero: {
    heading: 'Simple, open source tools for transit data.',
    body: 'Built by riders and operators, for riders and operators.',
    scrollCue: 'Scroll',
  },
  whatIsGtfs: {
    eyebrow: 'What is GTFS?',
    heading:
      'A community-driven open standard for rider-facing transit information.',
    body: 'Over 10,000 agencies in 100+ countries publish GTFS. It is a simple data structure that any app developer can consume, which is why adopting it puts an agency’s service in front of a wide audience without a custom integration per app.',
    feedMapLink: 'See them on the feed map',
    // gtfs.org lists six reasons; these are the four that do not overlap.
    reasons: [
      {
        title: 'Improved rider experience',
        body: 'Accurate schedules and real-time updates, so riders wait less and decide better.',
      },
      {
        title: 'Global reach',
        body: 'Consistent data across agencies and regions makes multi-agency trips work.',
      },
      {
        title: 'Simple to use',
        body: 'A plain data structure, easy to produce and to consume.',
      },
      {
        title: 'Open source community',
        body: 'The standard keeps evolving through community collaboration.',
      },
    ],
  },
  // `term` carries its own colon, so a locale can space it as it needs.
  scheduled: {
    eyebrow: 'GTFS Schedule',
    heading: 'The foundation: the schedule riders plan their trips against.',
    body: 'GTFS Schedule describes the service an agency runs, in a form every major mapping app already reads.',
    features: [
      {
        term: 'Routes and stops:',
        body: 'exactly where to catch the bus or the train.',
      },
      {
        term: 'Schedules and frequencies:',
        body: 'clear timetables riders can plan against.',
      },
      { term: 'Fares:', body: 'journey costs shown upfront in apps.' },
      { term: 'Flexible services:', body: 'demand-responsive transportation.' },
      {
        term: 'Pathways:',
        body: 'station interiors, down to which elevator reaches which platform.',
      },
    ],
    scene: {
      trip: 'TRIP {n}',
    },
  },
  realtime: {
    eyebrow: 'GTFS Realtime',
    heading: 'Live updates that keep riders informed.',
    body: 'GTFS Realtime covers the parts of transit that change during the day.',
    beats: [
      {
        term: 'Vehicle positions:',
        body: 'where the vehicle actually is right now, so nobody stands at a stop wondering.',
      },
      {
        term: 'Trip updates:',
        body: 'a more accurate arrival time, so connections are not missed.',
      },
      {
        term: 'Service alerts:',
        body: 'notice of disruptions on the network, in time to change plans.',
      },
    ],
    scene: {
      nextDepartures: 'Next departures',
      minutes: '{n} min',
      delay: '+2 MIN',
      detour: 'Detour in effect',
      detourRoute: 'Route A via Fairview Ave',
    },
  },
  // The editor runs over two page-height sections: the flow, then the toolset.
  editor: {
    eyebrow: 'The editor',
    heading: 'Upload, inspect, fix, export.',
    body: 'Runs in the browser. Nothing is uploaded anywhere, and there is no account. Fast enough for even the largest big-city feeds.',
    steps: ['Upload', 'Inspect', 'Fix', 'Export'],
    operationsHeading: 'Allowing your GTFS to power your operations.',
    operationsBody:
      'The Swiss army knife of GTFS: everything needed to keep a feed accurate as the service it describes keeps changing.',
    // Each blade names a capability confirmed in gtfs-zone-editor: timetable-*.ts and
    // editable-table.ts, route-*.ts, map-controller.ts and stop-view-controller.ts,
    // shapes-manager.ts, gtfs-validator.ts.
    blades: [
      'Update service patterns',
      'Modify routes',
      'Map out stations',
      'Generate shapes',
      'Validate feed',
    ],
    chipsLabel: 'Or open a real feed straight away',
    scene: {
      issuesOpen: '2 issues',
      issuesClear: '0 issues',
    },
  },
  visualizer: {
    eyebrow: 'The visualizer',
    heading: 'Inspect any GTFS Realtime feed on a map.',
    body: 'Point it at a scheduled feed and its realtime endpoints and watch vehicle positions, trip updates, and service alerts against the schedule they claim to follow. Any agency’s feed, not just ours. Nothing to install.',
    // Confirmed in gtfs-zone-rt-viewer: pages/vehicle-page.ts, rt-index.ts, alerts.ts and
    // pages/alert-page.ts, examples.ts plus feed-catalog.ts and feed-url.ts.
    features: [
      'Vehicles on a live map, matched to their route and trip.',
      'Trip updates read against the scheduled feed.',
      'Service alerts, with the entities they affect.',
      'A catalog of ready-to-load example feeds, and a shareable link that reproduces a whole session.',
    ],
    chipsLabel: 'Or open a real feed straight away',
    pickBefore: 'Or pick any feed from the',
    pickLink: 'feed map',
  },
  // The feed chips under the editor and the visualizer, keyed by FeedChip.id.
  // The same feed appears in both lists, so each link states its destination
  // off-screen: identical link text pointing at two targets reads as one link.
  feeds: {
    mbta: 'Large and complete. Exercises nearly every GTFS feature.',
    amtrak: 'A national network, and a genuinely messy feed.',
    columbiaCounty: 'What a small rural agency’s feed actually looks like.',
    editorDestination: 'open in the editor',
    visualizerDestination: 'open in the visualizer',
  },
  manager: {
    eyebrow: 'The manager',
    heading: 'Management software for running a realtime feed.',
    // Follows the host name, which page.html prints as code.
    body: 'is where an agency runs its feed: define feeds, register trackers, watch vehicles, and publish service alerts. The public GTFS-RT endpoints update from it directly.',
    features: [
      {
        term: 'Feeds:',
        body: 'one agency, one or many feeds, each with its scheduled source and its public endpoints.',
      },
      {
        term: 'Service alerts:',
        body: 'header, description, cause, effect, severity, active period, and the routes or stops affected. Published to the alerts feed.',
      },
      {
        term: 'Vehicle tracking:',
        body: 'one tracker per vehicle, provisioned by scanning a QR code. Positions arrive from a phone or a GPS unit and are served as vehicle positions.',
      },
      {
        term: 'Trip updates:',
        body: 'delay against the scheduled trip, derived from those positions. A tracker can be tied to its trip by a day and time rule, so the match happens on the server.',
      },
      {
        term: 'Shared feeds:',
        body: 'hand a colleague a feed by email address. They sign in as themselves and see the same feeds, trackers, and alerts.',
      },
    ],
    hardwareLabel: 'Tracking hardware',
    // Wraps the "Traccar" link.
    builtOn: 'Built on',
    builtOnAfter: ', the open source GPS tracking platform.',
    // Followed by the device list link.
    devices:
      'Compatible with a vast array of GPS trackers, from low-cost units to premium brands;',
    phone:
      'A phone running the Traccar Client app works too, so an agency can start with no hardware at all.',
    // Weakened from the sub-second claim: alerts travel a different path than positions.
    caption: 'Seconds, not days.',
    scene: {
      newAlert: 'NEW SERVICE ALERT',
      publish: 'PUBLISH',
      alert: 'ALERT',
    },
  },
  publish: {
    eyebrow: 'Publish',
    heading: 'Deliver to millions of pockets.',
    body: 'One feed reaches every major mapping app, and drops straight into your own site.',
    destinations: [
      'Google Maps / Apple Maps',
      'Transit / Motis',
      'Your website',
    ],
    destinationsLabel: 'Where the feed ends up',
    scene: {
      oneFeed: 'One feed',
      siteDomain: 'your-agency.gov',
    },
  },
  openSource: {
    eyebrow: 'Open source',
    heading: 'Open source from the start.',
    points: [
      { title: 'Secure', body: 'Audited in the open.' },
      {
        title: 'Own your feed',
        body: 'Run it yourself. There is no vendor to lock you in.',
      },
      {
        title: 'Community-oriented',
        body: 'Communal software for communal transit.',
      },
    ],
  },
  contact: {
    eyebrow: 'Get in touch',
    heading: 'Get in touch.',
    body: 'If you run transit and want your riders to see it, write to us.',
    // Wraps the issue tracker link.
    bug: 'Found a bug?',
    bugLink: 'Report it on the tracker',
    bugAfter: ', or write to the address above.',
  },
  footer: {
    editor: 'Editor',
    visualizer: 'Visualizer',
    feedMap: 'Feed map',
    manager: 'Manager',
    source: 'Source',
  },
} as const;

type Widen<T> = T extends string
  ? string
  : { readonly [K in keyof T]: Widen<T[K]> };

/** The catalog shape: every locale has exactly the English keys. */
export type Copy = Widen<typeof copy>;
