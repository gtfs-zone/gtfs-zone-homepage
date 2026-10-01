/**
 * GTFS zip -> simplified GeoJSON for the night-map variant. Run manually:
 *   pnpm bake                            (downloads the default feed)
 *   pnpm bake ./local/feed.zip           (uses a local zip)
 *   pnpm bake <source> --types=0,1,2     (keeps only those route_types)
 *
 * Writes public/data/network-night.json. Raw lon/lat is preserved so the
 * runtime picks the projection and can reframe on resize.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import Papa from 'papaparse';

const DEFAULT_FEED = 'https://cdn.mbta.com/MBTA_GTFS.zip';

const MAX_POINTS_PER_ROUTE = 400;
// Branches of one route (Red Line to Ashmont vs Braintree) are separate shapes on
// the same route_id, so a single shape per direction silently drops them.
const MAX_BRANCHES_PER_DIRECTION = 4;
const BRANCH_NEAR = 0.0015; // degrees, roughly 160m
const BRANCH_MIN_NEW = 0.12; // keep a shape if this share of it is off the kept ones
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/network-night.json');

type Row = Record<string, string>;
type Pt = [number, number];

async function loadZip(source: string): Promise<JSZip> {
  if (/^https?:/.test(source)) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`fetch failed: ${res.status} ${source}`);
    return JSZip.loadAsync(Buffer.from(await res.arrayBuffer()));
  }
  return JSZip.loadAsync(await readFile(resolve(source)));
}

async function table(zip: JSZip, name: string): Promise<Row[]> {
  const file = zip.file(name) ?? zip.file(new RegExp(`(^|/)${name}$`))[0];
  if (!file) throw new Error(`missing ${name}`);
  const text = await file.async('string');
  return Papa.parse<Row>(text.replace(/^\uFEFF/, ''), {
    header: true,
    skipEmptyLines: true,
  }).data;
}

function perpendicularDistance(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const cx = a[0] + Math.max(0, Math.min(1, t)) * dx;
  const cy = a[1] + Math.max(0, Math.min(1, t)) * dy;
  return Math.hypot(p[0] - cx, p[1] - cy);
}

function douglasPeucker(points: Pt[], tolerance: number): Pt[] {
  if (points.length < 3) return points;
  let index = 0;
  let maxDist = 0;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [first, last];
  return [
    ...douglasPeucker(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...douglasPeucker(points.slice(index), tolerance),
  ];
}

// Raises tolerance until the line fits the point budget.
function simplifyToBudget(points: Pt[]): Pt[] {
  let tolerance = 0.00008; // degrees, roughly 9m
  let out = douglasPeucker(points, tolerance);
  while (out.length > MAX_POINTS_PER_ROUTE && tolerance < 0.02) {
    tolerance *= 1.8;
    out = douglasPeucker(points, tolerance);
  }
  return out;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const source = args.find((a) => !a.startsWith('--')) ?? DEFAULT_FEED;
  const typesArg = args.find((a) => a.startsWith('--types='));
  const keepTypes = typesArg ? new Set(typesArg.slice(8).split(',')) : null;
  console.log(`reading ${source}`);
  const zip = await loadZip(source);

  const [shapes, stops, trips, routes] = await Promise.all([
    table(zip, 'shapes.txt'),
    table(zip, 'stops.txt'),
    table(zip, 'trips.txt').catch(() => [] as Row[]),
    table(zip, 'routes.txt').catch(() => [] as Row[]),
  ]);

  // Group shape points, ordered by sequence.
  const byShape = new Map<string, { seq: number; pt: Pt }[]>();
  for (const r of shapes) {
    const id = r.shape_id;
    const lat = Number(r.shape_pt_lat);
    const lon = Number(r.shape_pt_lon);
    if (!id || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const list = byShape.get(id) ?? [];
    list.push({ seq: Number(r.shape_pt_sequence) || list.length, pt: [lon, lat] });
    byShape.set(id, list);
  }

  // Candidate shapes per route + direction, longest first.
  const keptRoutes = keepTypes ? routes.filter((r) => keepTypes.has(r.route_type)) : routes;
  const keptRouteIds = new Set(keptRoutes.map((r) => r.route_id));
  const routeMeta = new Map(keptRoutes.map((r) => [r.route_id, r]));
  const candidates = new Map<string, { routeId: string; shapeIds: Set<string> }>();
  for (const t of trips) {
    if (!t.shape_id || !byShape.has(t.shape_id)) continue;
    if (keepTypes && !keptRouteIds.has(t.route_id)) continue;
    const key = `${t.route_id}::${t.direction_id ?? '0'}`;
    const entry = candidates.get(key) ?? { routeId: t.route_id, shapeIds: new Set<string>() };
    entry.shapeIds.add(t.shape_id);
    candidates.set(key, entry);
  }

  // Keep the longest shape, then any shape that covers enough ground the kept ones
  // do not. That picks up real branches without duplicating near-identical variants.
  const representative = new Map<string, { routeId: string; shapeId: string }>();
  for (const [key, entry] of candidates) {
    const ordered = [...entry.shapeIds].sort(
      (a, b) => byShape.get(b)!.length - byShape.get(a)!.length,
    );
    const covered: Pt[] = [];
    let branch = 0;
    for (const shapeId of ordered) {
      if (branch >= MAX_BRANCHES_PER_DIRECTION) break;
      const pts = orderedPoints(shapeId);
      const novel = pts.filter((p) => !nearAny(p, covered)).length / pts.length;
      if (branch > 0 && novel < BRANCH_MIN_NEW) continue;
      representative.set(branch === 0 ? key : `${key}::${branch}`, { routeId: entry.routeId, shapeId });
      covered.push(...pts);
      branch++;
    }
  }

  function orderedPoints(shapeId: string): Pt[] {
    return byShape
      .get(shapeId)!
      .slice()
      .sort((a, b) => a.seq - b.seq)
      .map((s) => s.pt);
  }

  function nearAny(p: Pt, pool: Pt[]): boolean {
    for (const q of pool) {
      if (Math.abs(q[0] - p[0]) < BRANCH_NEAR && Math.abs(q[1] - p[1]) < BRANCH_NEAR) return true;
    }
    return false;
  }

  // Feeds without trips.txt still bake: fall back to every shape.
  if (representative.size === 0) {
    for (const shapeId of byShape.keys()) {
      representative.set(shapeId, { routeId: shapeId, shapeId });
    }
  }

  const palette = ['--route-1', '--route-2', '--route-3', '--route-4', '--route-5', '--route-6'];
  const outRoutes: unknown[] = [];
  const keptPoints: Pt[] = [];
  let paletteIndex = 0;

  for (const [key, rep] of representative) {
    const raw = byShape
      .get(rep.shapeId)!
      .sort((a, b) => a.seq - b.seq)
      .map((s) => s.pt);
    const simplified = simplifyToBudget(raw);
    keptPoints.push(...simplified);
    const meta = routeMeta.get(rep.routeId);
    const gtfsColor = meta?.route_color ? `#${meta.route_color.replace(/^#/, '')}` : '';
    outRoutes.push({
      id: key,
      name: meta?.route_short_name || meta?.route_long_name || rep.routeId,
      color: gtfsColor || `var(${palette[paletteIndex++ % palette.length]})`,
      coordinates: simplified.map(([lon, lat]) => [round(lon), round(lat)]),
    });
  }

  // Without reading the (very large) stop_times, keep the stops that actually sit
  // on a kept shape. Cheap, and exact enough for a decorative map.
  const NEAR = 0.0012; // roughly 130m
  const onNetwork = (lon: number, lat: number): boolean => {
    if (!keepTypes) return true;
    for (const [px, py] of keptPoints) {
      if (Math.abs(px - lon) < NEAR && Math.abs(py - lat) < NEAR) return true;
    }
    return false;
  };

  // Prefer station rows where the feed has them: platform-level stops are far too
  // many to draw at hero scale.
  const hasStations = stops.some((s) => s.location_type === '1');
  const stopRows = hasStations
    ? stops.filter((s) => s.location_type === '1')
    : stops.filter((s) => s.location_type !== '3' && s.location_type !== '4');

  const outStops = stopRows
    .filter((s) => onNetwork(Number(s.stop_lon), Number(s.stop_lat)))
    .map((s) => ({
      id: s.stop_id,
      name: s.stop_name ?? '',
      lon: round(Number(s.stop_lon)),
      lat: round(Number(s.stop_lat)),
      isMajor: s.location_type === '1',
    }))
    .filter((s) => Number.isFinite(s.lon) && Number.isFinite(s.lat));

  // Local paths are reduced to the file name so no machine path is published
  const payload = {
    source: /^https?:/.test(source) ? source : basename(source),
    routes: outRoutes,
    stops: outStops,
  };
  const json = JSON.stringify(payload);
  await writeFile(OUT, json);

  const kb = (Buffer.byteLength(json) / 1024).toFixed(1);
  console.log(`wrote ${OUT}`);
  console.log(`${outRoutes.length} routes, ${outStops.length} stops, ${kb} KB`);
  if (Number(kb) > 150) console.warn('over the 150 KB budget, raise the simplification tolerance');
}

function round(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
