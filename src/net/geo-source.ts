// Real GTFS geometry projected at runtime, used by the night-map variant.

import { geoMercator } from 'd3-geo';
import { pointAlong, type Bounds, type NetworkSource, type RouteLine, type StopPoint } from './network-source';

interface BakedRoute {
  id: string;
  name: string;
  color: string;
  coordinates: [number, number][];
}

interface BakedStop {
  id: string;
  name: string;
  lon: number;
  lat: number;
  isMajor: boolean;
}

export interface BakedNetwork {
  source: string;
  routes: BakedRoute[];
  stops: BakedStop[];
}

export class GeoSource implements NetworkSource {
  private readonly baked: BakedNetwork;
  private projected: RouteLine[] = [];
  private projectedStops: StopPoint[] = [];
  private extent: Bounds = [
    [0, 0],
    [1, 1],
  ];

  constructor(baked: BakedNetwork) {
    this.baked = baked;
    this.fit(1000, 1000);
  }

  static async load(url: string): Promise<GeoSource> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`network geometry unavailable: ${res.status}`);
    return new GeoSource((await res.json()) as BakedNetwork);
  }

  fit(width: number, height: number, padding = 24): void {
    const collection = {
      type: 'FeatureCollection' as const,
      features: this.baked.routes.map((r) => ({
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'LineString' as const, coordinates: r.coordinates },
      })),
    };

    const projection = geoMercator().fitExtent(
      [
        [padding, padding],
        [Math.max(padding + 1, width - padding), Math.max(padding + 1, height - padding)],
      ],
      collection
    );

    this.projected = this.baked.routes.map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      points: r.coordinates.map((c) => projection(c) ?? [0, 0]) as [number, number][],
    }));

    this.projectedStops = this.baked.stops.map((s) => {
      const p = projection([s.lon, s.lat]) ?? [0, 0];
      return { id: s.id, name: s.name, x: p[0], y: p[1], isMajor: s.isMajor };
    });

    this.extent = [
      [0, 0],
      [width, height],
    ];
  }

  routes(): RouteLine[] {
    return this.projected;
  }

  stops(): StopPoint[] {
    return this.projectedStops;
  }

  bounds(): Bounds {
    return this.extent;
  }

  pointAt(routeId: string, t: number): [number, number] {
    const route = this.projected.find((r) => r.id === routeId);
    return route ? pointAlong(route.points, t) : [0, 0];
  }
}
