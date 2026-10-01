// Deep-link chips. One feed entry produces two links, so the editor list and
// the visualizer list cannot drift.
//
// Both schemes are confirmed against the deployed builds, not just the source:
//   editor      #load=<staticUrl>                      (gtfs-zone-editor page-state-manager)
//   visualizer  #scheduled=…&rt_vp=…&rt_tu=…&rt_al=…&cors= (gtfs-zone-rt-viewer feed-url)
//
// `cors` is a compact flag list: `s` proxies the scheduled source, `r` proxies
// the realtime sources. The per-feed values are copied from gtfs-zone-rt-viewer's
// examples.ts, which records which hosts actually send CORS headers.
// raw.githubusercontent.com does, so Columbia County's scheduled half is
// `s`-less; cdn.mbta.com, content.amtrak.com and rt.gtfs.zone do not.

export interface RealtimeTriple {
  vehiclePositions: string;
  tripUpdates: string;
  serviceAlerts: string;
}

export interface FeedChip {
  name: string;
  descriptor: string;
  feedUrl: string;
  realtime: RealtimeTriple;
  /** Proxy the scheduled source. */
  scheduledCors: boolean;
  /** Proxy the realtime sources. */
  realtimeCors: boolean;
}

const EDITOR = 'https://edit.gtfs.zone';
const VISUALIZER = 'https://viz.rt.gtfs.zone';
const RT = 'https://rt.gtfs.zone';

function ours(feed: string): RealtimeTriple {
  return {
    vehiclePositions: `${RT}/${feed}/vehicle_positions.pb`,
    tripUpdates: `${RT}/${feed}/trip_updates.pb`,
    serviceAlerts: `${RT}/${feed}/service_alerts.pb`,
  };
}

export const feeds: FeedChip[] = [
  {
    name: 'MBTA',
    descriptor: 'Large and complete. Exercises nearly every GTFS feature.',
    feedUrl: 'https://cdn.mbta.com/MBTA_GTFS.zip',
    realtime: {
      vehiclePositions: 'https://cdn.mbta.com/realtime/VehiclePositions.pb',
      tripUpdates: 'https://cdn.mbta.com/realtime/TripUpdates.pb',
      serviceAlerts: 'https://cdn.mbta.com/realtime/Alerts.pb',
    },
    scheduledCors: true,
    realtimeCors: true,
  },
  {
    name: 'Amtrak',
    descriptor: 'A national network, and a genuinely messy feed.',
    feedUrl: 'https://content.amtrak.com/content/gtfs/GTFS.zip',
    realtime: ours('amtrak'),
    scheduledCors: true,
    realtimeCors: true,
  },
  {
    name: 'Columbia County',
    descriptor: "What a small rural agency's feed actually looks like.",
    feedUrl:
      'https://raw.githubusercontent.com/columbia-county-ny-transit/gtfs-generator/refs/heads/main/columbia_county_gtfs.zip',
    realtime: ours('columbia-county'),
    scheduledCors: false,
    realtimeCors: true,
  },
];

export function editorLink(feed: FeedChip): string {
  return `${EDITOR}/#load=${feed.feedUrl}`;
}

export function visualizerLink(feed: FeedChip): string {
  const cors = [
    feed.scheduledCors ? 's' : '',
    feed.realtimeCors ? 'r' : '',
  ].filter(Boolean);
  const params = new URLSearchParams({
    scheduled: feed.feedUrl,
    rt_vp: feed.realtime.vehiclePositions,
    rt_tu: feed.realtime.tripUpdates,
    rt_al: feed.realtime.serviceAlerts,
  });
  if (cors.length > 0) {
    params.set('cors', cors.join(','));
  }
  return `${VISUALIZER}/#${params.toString()}`;
}
