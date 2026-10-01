// One geometry interface, two implementations, so any scene runs on either.

export interface RouteLine {
  id: string;
  name: string;
  color: string; // may be a CSS var reference resolved by the caller
  points: [number, number][]; // local space, set by the implementation
}

export interface StopPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  isMajor: boolean;
}

export type Bounds = [[number, number], [number, number]];

export interface NetworkSource {
  routes(): RouteLine[];
  stops(): StopPoint[];
  bounds(): Bounds;
  pointAt(routeId: string, t: number): [number, number];
  /** Recompute local-space coordinates for a new viewBox extent. */
  fit(width: number, height: number, padding?: number): void;
}

// Segment lengths are recomputed only when a route's point array is replaced,
// which happens on resize, not per frame.
const arcCache = new WeakMap<
  [number, number][],
  { segs: number[]; total: number }
>();

function arcLengths(points: [number, number][]): {
  segs: number[];
  total: number;
} {
  const cached = arcCache.get(points);
  if (cached) {
    return cached;
  }
  let total = 0;
  const segs: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const d = Math.hypot(
      points[i][0] - points[i - 1][0],
      points[i][1] - points[i - 1][1]
    );
    segs.push(d);
    total += d;
  }
  const entry = { segs, total };
  arcCache.set(points, entry);
  return entry;
}

/** Shared helper: position along a polyline by normalized arc length. */
export function pointAlong(
  points: [number, number][],
  t: number
): [number, number] {
  if (points.length === 0) {
    return [0, 0];
  }
  if (points.length === 1) {
    return points[0];
  }
  const tt = ((t % 1) + 1) % 1;

  const { segs, total } = arcLengths(points);
  if (total === 0) {
    return points[0];
  }

  let target = tt * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) {
      const f = segs[i] === 0 ? 0 : target / segs[i];
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * f,
        points[i][1] + (points[i + 1][1] - points[i][1]) * f,
      ];
    }
    target -= segs[i];
  }
  return points[points.length - 1];
}

export function tangentAlong(points: [number, number][], t: number): number {
  const eps = 0.002;
  const a = pointAlong(points, Math.max(0, t - eps));
  const b = pointAlong(points, Math.min(1, t + eps));
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
}
