// All page copy in one typed object, shared by both variants so they cannot drift.
//
// Two rules the text is held to. Every sentence states a fact, a feature, or an
// action; no metaphors standing in for claims. Anything describing GTFS itself
// follows gtfs.org's own language rather than inventing a second framing.
//
// URLs live in links.ts, not here.

import { CONTACT_EMAIL, links } from './links';

export interface SectionCopy {
  eyebrow?: string;
  heading: string;
  body: string;
  bullets?: string[];
}

export const copy = {
  hero: {
    wordmark: 'gtfs.zone',
    heading: 'Tools for publishing transit data.',
    body: 'Open source software for building, checking, and publishing GTFS Schedule and GTFS Realtime feeds.',
    primaryCta: links.editor,
    secondaryCta: links.visualizer,
    scrollCue: 'Scroll',
  },
  whatIsGtfs: {
    eyebrow: 'What is GTFS?',
    heading: 'A community-driven open standard for rider-facing transit information.',
    body: 'Over 10,000 agencies in 100+ countries publish GTFS. It is a simple data structure that any app developer can consume, which is why adopting it puts an agency’s service in front of a wide audience without a custom integration per app.',
    link: links.gtfs,
    // gtfs.org lists six reasons; these are the four that do not overlap.
    reasons: [
      {
        icon: 'rider-experience',
        title: 'Improved rider experience',
        body: 'Accurate schedules and real-time updates, so riders wait less and decide better.',
      },
      {
        icon: 'globe',
        title: 'Global reach',
        body: 'Consistent data across agencies and regions makes multi-agency trips work.',
      },
      {
        icon: 'data-structure',
        title: 'Simple to use',
        body: 'A plain data structure, easy to produce and to consume.',
      },
      {
        icon: 'people',
        title: 'Open source community',
        body: 'The standard keeps evolving through community collaboration.',
      },
    ],
  },
  scheduled: {
    eyebrow: 'GTFS Schedule',
    heading: 'The foundation: static, rider-facing service information.',
    body: 'GTFS Schedule describes the service an agency runs, in a form every major mapping app already reads.',
    features: [
      { title: 'Routes and stops', body: 'Exactly where to catch the bus or the train.' },
      { title: 'Schedules and frequencies', body: 'Clear timetables riders can plan against.' },
      { title: 'Fares', body: 'Journey costs shown upfront in apps.' },
      { title: 'Flexible services', body: 'Demand-responsive transportation.' },
      {
        title: 'Pathways',
        body: 'Station interiors, down to which elevator reaches which platform.',
      },
    ],
    link: links.scheduleReference,
  },
  realtime: {
    eyebrow: 'GTFS Realtime',
    heading: 'Live updates that keep riders informed.',
    body: 'GTFS Realtime covers the parts of transit that change during the day.',
    beats: [
      {
        title: 'Vehicle positions',
        body: 'Where the vehicle actually is right now, so nobody stands at a stop wondering.',
        type: 'VehiclePosition',
        fields: ['latitude 42.24671', 'longitude -73.79052', 'bearing 118', 'timestamp 1755188400'],
      },
      {
        title: 'Trip updates',
        body: 'A more accurate arrival time, so connections are not missed.',
        type: 'TripUpdate',
        fields: ['stop_sequence 12', 'arrival.delay +120s', 'schedule_relationship SCHEDULED'],
      },
      {
        title: 'Service alerts',
        body: 'Notice of disruptions on the network, in time to change plans.',
        type: 'Alert',
        fields: ['cause CONSTRUCTION', 'effect DETOUR', 'informed_entity route_id A'],
      },
    ],
    link: links.realtimeReference,
  },
  // The editor runs over two page-height sections: the flow, then the toolset.
  editor: {
    eyebrow: 'The editor',
    heading: 'Upload, inspect, fix, export.',
    body: 'Runs in the browser. Nothing is uploaded anywhere, and there is no account.',
    steps: ['Upload', 'Inspect', 'Fix', 'Export'],
    operationsHeading: 'Allowing your GTFS to power your operations.',
    operationsBody:
      'The Swiss army knife of GTFS: everything needed to keep a feed accurate as the service it describes keeps changing.',
    // Each blade names a capability confirmed in coloring-book: timetable-*.ts and
    // editable-table.ts, route-*.ts, map-controller.ts and stop-view-controller.ts,
    // shapes-manager.ts, gtfs-validator.ts.
    blades: [
      'Update service patterns',
      'Modify routes',
      'Map out stations',
      'Generate shapes',
      'Validate feed',
    ],
    cta: links.editor,
    chipsLabel: 'Or open a real feed straight away',
  },
  visualizer: {
    eyebrow: 'The visualizer',
    heading: 'Inspect any GTFS Realtime feed on a map.',
    body: 'Point it at a static feed and its realtime endpoints and watch vehicle positions, trip updates, and service alerts against the schedule they claim to follow. Any agency’s feed, not just ours. Nothing to install.',
    // Confirmed in test-track: pages/vehicle-page.ts, rt-index.ts, alerts.ts and
    // pages/alert-page.ts, examples.ts plus feed-catalog.ts and feed-url.ts.
    features: [
      'Vehicles on a live map, matched to their route and trip.',
      'Trip updates read against the static schedule.',
      'Service alerts, with the entities they affect.',
      'A catalog of ready-to-load example feeds, and a shareable link that reproduces a whole session.',
    ],
    cta: links.visualizer,
    chipsLabel: 'Or open a real feed straight away',
  },
  manager: {
    eyebrow: 'The manager',
    heading: 'Management software for running a realtime feed.',
    body: 'manage.rt.gtfs.zone is where an agency runs its feed: define feeds, register trackers, watch vehicles, and publish service alerts. The public GTFS-RT endpoints update from it directly.',
    features: [
      {
        title: 'Feeds',
        body: 'One agency, one or many feeds, each with its static source and its public endpoints.',
      },
      {
        title: 'Service alerts',
        body: 'Header, description, cause, effect, severity, active period, and the routes or stops affected. Published to the alerts feed.',
      },
      {
        title: 'Vehicle tracking',
        body: 'One tracker per vehicle, provisioned by scanning a QR code. Positions arrive from a phone or a GPS unit and are served as vehicle positions.',
      },
      {
        title: 'Trip updates',
        body: 'Delay against the scheduled trip, derived from those positions. A tracker can be tied to its trip by a day and time rule, so the match happens on the server.',
      },
      {
        title: 'Shared feeds',
        body: 'Hand a colleague a feed by email address. They sign in as themselves and see the same feeds, trackers, and alerts.',
      },
    ],
    hardwareLabel: 'Tracking hardware',
    traccar: links.traccar,
    traccarDevices: links.traccarDevices,
    // Weakened from the sub-second claim: alerts travel a different path than positions.
    caption: 'Seconds, not days.',
    cta: links.manager,
  },
  publish: {
    eyebrow: 'Publish',
    heading: 'Deliver to millions of pockets.',
    body: 'One feed reaches every major mapping app, and drops straight into your own site.',
    destinations: ['Google Maps / Apple Maps', 'Transit / Motis', 'Your website'],
    destinationsLabel: 'Where the feed ends up',
    destinationLinks: [links.googleMaps, links.appleMaps, links.transitApp, links.motis],
  },
  openSource: {
    eyebrow: 'Open source',
    heading: 'Open source from the start.',
    points: [
      { icon: 'shield', title: 'Secure', body: 'Audited in the open.' },
      {
        icon: 'server',
        title: 'Reliable',
        body: 'Run it yourself. There is no vendor to lock you in.',
      },
      {
        icon: 'people',
        title: 'Community-oriented',
        body: 'Communal software for communal transit.',
      },
    ],
    link: links.source,
  },
  contact: {
    eyebrow: 'Get in touch',
    heading: 'Get in touch.',
    body: 'If you run transit and want your riders to see it, write to us.',
    email: CONTACT_EMAIL,
  },
} as const;
