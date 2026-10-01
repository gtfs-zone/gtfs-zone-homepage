// Deterministic vehicle motion along route shapes. No runtime randomness.

import { tangentAlong, type NetworkSource } from './network-source';

export interface Vehicle {
  id: string;
  routeId: string;
  color: string;
  phase: number;
  speed: number; // laps per second
  direction: 1 | -1;
}

export interface VehicleState {
  id: string;
  routeId: string;
  color: string;
  x: number;
  y: number;
  bearing: number;
  dwelling: boolean;
}

// Small deterministic hash so a seed produces the same fleet every load.
function hash(seed: number): number {
  let x = Math.sin(seed * 12.9898) * 43758.5453;
  x -= Math.floor(x);
  return x;
}

export function buildFleet(
  source: NetworkSource,
  perRoute = 3,
  seed = 1
): Vehicle[] {
  const fleet: Vehicle[] = [];
  const routes = source.routes();
  routes.forEach((route, ri) => {
    for (let i = 0; i < perRoute; i++) {
      const h = hash(seed + ri * 17 + i * 7);
      fleet.push({
        id: `${route.id}-${i}`,
        routeId: route.id,
        color: route.color,
        phase: (i / perRoute + h * 0.15) % 1,
        speed: 0.018 + h * 0.012,
        direction: i % 2 === 0 ? 1 : -1,
      });
    }
  });
  return fleet;
}

const STOP_COUNT = 8;
const DWELL_FRACTION = 0.22;

/**
 * Piecewise ease so vehicles visibly pause at stops. Input is raw normalized
 * travel, output is position along the shape.
 */
function dwellEase(t: number, stops: number): { t: number; dwelling: boolean } {
  const span = 1 / stops;
  const index = Math.floor(t / span);
  const local = (t - index * span) / span;
  const moveWindow = 1 - DWELL_FRACTION;
  if (local >= moveWindow) {
    return { t: (index + 1) * span, dwelling: true };
  }
  const eased = local / moveWindow;
  const smooth = eased * eased * (3 - 2 * eased);
  return { t: (index + smooth) * span, dwelling: false };
}

export interface SimOptions {
  elapsed: number;
  frozen: boolean; // reduced motion: place at t=0 and hold
}

export function simulate(
  source: NetworkSource,
  fleet: Vehicle[],
  opts: SimOptions
): VehicleState[] {
  const out: VehicleState[] = [];
  for (const v of fleet) {
    const raw = opts.frozen ? v.phase : (v.phase + opts.elapsed * v.speed) % 1;
    const { t, dwelling } = dwellEase(raw, STOP_COUNT);

    const travel = v.direction === 1 ? t : 1 - t;
    const [x, y] = source.pointAt(v.routeId, travel);
    const route = source.routes().find((r) => r.id === v.routeId);
    const bearing = route
      ? tangentAlong(route.points, travel) + (v.direction === 1 ? 0 : 180)
      : 0;
    out.push({
      id: v.id,
      routeId: v.routeId,
      color: v.color,
      x,
      y,
      bearing,
      dwelling,
    });
  }
  return out;
}
