// Three beats of GTFS-RT, shown on a phone drawn entirely in SVG.
// The phone shows the same network the page background shows, at a different zoom.

import { select, type Selection } from 'd3-selection';
import { line, curveCatmullRom } from 'd3-shape';
import { clamp01, subRange } from '../engine/section-progress';
import { fill, pageCopy } from '../i18n/catalogs';
import type { Scene, SceneContext, SceneProgress } from '../engine/scene';
import { buildFleet, simulate, type Vehicle } from '../net/vehicle-sim';

const copy = pageCopy();

const VB_W = 680;
const VB_H = 440;

const PHONE = { x: 150, y: 20, w: 190, h: 400, r: 26 };
const SCREEN = {
  x: PHONE.x + 10,
  y: PHONE.y + 34,
  w: PHONE.w - 20,
  h: PHONE.h - 54,
};
const PANEL = { x: 400, y: 110, w: 250, h: 150 };

// The map-app furniture: a search bar over the map, a sheet that rises over it.
const SEARCH = { x: SCREEN.x + 8, y: SCREEN.y + 8, w: SCREEN.w - 16, h: 26 };
const SHEET_H = 168;
const SHEET_TOP = SCREEN.y + SCREEN.h - SHEET_H;

// One example message per beat. GTFS-RT field names and enum values, so never
// translated.
const BEATS = [
  {
    type: 'VehiclePosition',
    fields: [
      'latitude 42.24671',
      'longitude -73.79052',
      'bearing 118',
      'timestamp 1755188400',
    ],
  },
  {
    type: 'TripUpdate',
    fields: [
      'stop_sequence 12',
      'arrival.delay +120s',
      'schedule_relationship SCHEDULED',
    ],
  },
  {
    type: 'Alert',
    fields: [
      'cause CONSTRUCTION',
      'effect DETOUR',
      'informed_entity route_id A',
    ],
  },
];

const ARRIVALS = [
  { route: 'A', dest: 'Hudson Amtrak', base: 4 },
  { route: 'B', dest: 'Chatham Village', base: 11 },
  { route: 'C', dest: 'Philmont', base: 19 },
];

export class RealtimePhoneScene implements Scene {
  private ctx!: SceneContext;
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
  private mapLayer!: Selection<SVGGElement, unknown, null, undefined>;
  private listLayer!: Selection<SVGGElement, unknown, null, undefined>;
  private alertLayer!: Selection<SVGGElement, unknown, null, undefined>;
  private fleet: Vehicle[] = [];
  private transform: (p: [number, number]) => [number, number] = (p) => p;

  mount(root: HTMLElement, ctx: SceneContext): void {
    this.ctx = ctx;
    const { palette, variant } = ctx;

    this.svg = select(root)
      .append('svg')
      .attr('aria-hidden', 'true')
      .attr('viewBox', `0 0 ${VB_W} ${VB_H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    const defs = this.svg.append('defs');
    defs
      .append('clipPath')
      .attr('id', 'rt-screen-clip')
      .append('rect')
      .attr('x', SCREEN.x)
      .attr('y', SCREEN.y)
      .attr('width', SCREEN.w)
      .attr('height', SCREEN.h)
      .attr('rx', 8);

    // Phone body. Deliberately generic, imitating no real product.
    const body = this.svg.append('g').attr('class', 'rt-phone');
    body
      .append('rect')
      .attr('x', PHONE.x)
      .attr('y', PHONE.y)
      .attr('width', PHONE.w)
      .attr('height', PHONE.h)
      .attr('rx', PHONE.r)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 3);
    body
      .append('rect')
      .attr('x', PHONE.x + PHONE.w / 2 - 22)
      .attr('y', PHONE.y + 12)
      .attr('width', 44)
      .attr('height', 6)
      .attr('rx', 3)
      .attr('fill', palette.grid);
    body
      .append('rect')
      .attr('x', SCREEN.x)
      .attr('y', SCREEN.y)
      .attr('width', SCREEN.w)
      .attr('height', SCREEN.h)
      .attr('rx', 8)
      .attr('fill', variant.name === 'night' ? palette.bg : '#ffffff')
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline);

    const screen = this.svg
      .append('g')
      .attr('clip-path', 'url(#rt-screen-clip)');
    this.buildBasemap(screen);
    this.mapLayer = screen.append('g').attr('class', 'rt-map');
    this.listLayer = screen.append('g').attr('class', 'rt-list');
    this.alertLayer = screen.append('g').attr('class', 'rt-alert');
    this.buildSearch(screen);

    this.buildList();
    this.buildAlert();

    // Lens plus data readout, the same callout language as the visualizer inspector.
    const lens = this.svg.append('g').attr('class', 'rt-lens');
    lens
      .append('circle')
      .attr('r', 34)
      .attr('fill', 'none')
      .attr('stroke', palette.accent)
      .attr('stroke-width', variant.name === 'night' ? 2.2 : 1.3);
    this.svg
      .append('line')
      .attr('class', 'rt-leader')
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 2)
      .attr('stroke-dasharray', '4 4');

    const panel = this.svg.append('g').attr('class', 'rt-panel');
    panel
      .append('rect')
      .attr('x', PANEL.x)
      .attr('y', PANEL.y)
      .attr('width', PANEL.w)
      .attr('height', PANEL.h)
      .attr('rx', variant.name === 'night' ? 10 : 2)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 2);
    panel
      .append('text')
      .attr('class', 'rt-panel-type')
      .attr('x', PANEL.x + 16)
      .attr('y', PANEL.y + 30)
      .attr('font-size', 15)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.accentText);
    panel
      .append('g')
      .attr('class', 'rt-panel-fields')
      .selectAll('text')
      .data([0, 1, 2, 3])
      .join('text')
      .attr('x', PANEL.x + 16)
      .attr('y', (d) => PANEL.y + 58 + d * 22)
      .attr('font-size', 12)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.inkMuted);

    this.fleet = buildFleet(ctx.network, 2, 7);
  }

  // Ground under the routes: a faint street grid and a park, so the screen
  // reads as a map app rather than a diagram.
  private buildBasemap(
    screen: Selection<SVGGElement, unknown, null, undefined>
  ): void {
    const { palette } = this.ctx;
    const g = screen.append('g').attr('class', 'rt-basemap');
    g.append('rect')
      .attr('x', SCREEN.x)
      .attr('y', SCREEN.y)
      .attr('width', SCREEN.w)
      .attr('height', SCREEN.h)
      .attr('fill', palette.inkMuted)
      .attr('fill-opacity', 0.06);
    g.append('rect')
      .attr('x', SCREEN.x + 14)
      .attr('y', SCREEN.y + 96)
      .attr('width', 62)
      .attr('height', 74)
      .attr('rx', 10)
      .attr('fill', palette.routes[1])
      .attr('fill-opacity', 0.12);
    g.append('path')
      .attr(
        'd',
        `M${SCREEN.x},${SCREEN.y + 232} C${SCREEN.x + 60},${SCREEN.y + 214} ${SCREEN.x + 110},${SCREEN.y + 262} ${SCREEN.x + SCREEN.w},${SCREEN.y + 240}`
      )
      .attr('fill', 'none')
      .attr('stroke', palette.routes[4])
      .attr('stroke-opacity', 0.18)
      .attr('stroke-width', 9);

    const streets = g
      .append('g')
      .attr('stroke', palette.inkMuted)
      .attr('stroke-opacity', 0.16);
    [0.14, 0.34, 0.52, 0.71, 0.88].forEach((f) => {
      streets
        .append('line')
        .attr('x1', SCREEN.x)
        .attr('x2', SCREEN.x + SCREEN.w)
        .attr('y1', SCREEN.y + SCREEN.h * f)
        .attr('y2', SCREEN.y + SCREEN.h * f)
        .attr('stroke-width', f === 0.52 ? 3 : 1.5);
    });
    [0.22, 0.46, 0.68, 0.86].forEach((f) => {
      streets
        .append('line')
        .attr('x1', SCREEN.x + SCREEN.w * f)
        .attr('x2', SCREEN.x + SCREEN.w * f)
        .attr('y1', SCREEN.y)
        .attr('y2', SCREEN.y + SCREEN.h)
        .attr('stroke-width', f === 0.46 ? 3 : 1.5);
    });
  }

  private buildSearch(
    screen: Selection<SVGGElement, unknown, null, undefined>
  ): void {
    const { palette } = this.ctx;
    const g = screen.append('g').attr('class', 'rt-search');
    g.append('rect')
      .attr('x', SEARCH.x)
      .attr('y', SEARCH.y)
      .attr('width', SEARCH.w)
      .attr('height', SEARCH.h)
      .attr('rx', SEARCH.h / 2)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 2);
    g.append('circle')
      .attr('cx', SEARCH.x + 17)
      .attr('cy', SEARCH.y + SEARCH.h / 2)
      .attr('r', 4.5)
      .attr('fill', 'none')
      .attr('stroke', palette.inkMuted)
      .attr('stroke-width', palette.strokeHairline * 2);
    g.append('line')
      .attr('x1', SEARCH.x + 20.5)
      .attr('y1', SEARCH.y + SEARCH.h / 2 + 3.5)
      .attr('x2', SEARCH.x + 24)
      .attr('y2', SEARCH.y + SEARCH.h / 2 + 7)
      .attr('stroke', palette.inkMuted)
      .attr('stroke-width', palette.strokeHairline * 2)
      .attr('stroke-linecap', 'round');
    g.append('text')
      .attr('x', SEARCH.x + 32)
      .attr('y', SEARCH.y + SEARCH.h / 2 + 3.5)
      .attr('font-size', 10)
      .attr('fill', palette.inkMuted)
      .text('Hudson, NY');
  }

  // The departures sheet, drawn in local space and slid up over the map.
  private buildList(): void {
    const { palette } = this.ctx;
    const g = this.listLayer;
    g.append('rect')
      .attr('x', SCREEN.x)
      .attr('y', 0)
      .attr('width', SCREEN.w)
      .attr('height', SHEET_H + 20)
      .attr('rx', 14)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 2);
    g.append('rect')
      .attr('x', SCREEN.x + SCREEN.w / 2 - 14)
      .attr('y', 7)
      .attr('width', 28)
      .attr('height', 3)
      .attr('rx', 1.5)
      .attr('fill', palette.grid);
    g.append('text')
      .attr('x', SCREEN.x + 12)
      .attr('y', 30)
      .attr('font-size', 11)
      .attr('font-weight', 600)
      .attr('fill', palette.ink)
      .text(copy.realtime.scene.nextDepartures);

    const rows = g
      .selectAll('g.rt-row')
      .data(ARRIVALS)
      .join('g')
      .attr('class', 'rt-row')
      .attr('transform', (_, i) => `translate(0 ${40 + i * 42})`);

    rows
      .append('line')
      .attr('x1', SCREEN.x + 12)
      .attr('x2', SCREEN.x + SCREEN.w - 12)
      .attr('y1', 38)
      .attr('y2', 38)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline);
    rows
      .append('circle')
      .attr('cx', SCREEN.x + 26)
      .attr('cy', 19)
      .attr('r', 9)
      .attr('fill', (_, i) => palette.routes[i % palette.routes.length]);
    rows
      .append('text')
      .attr('x', SCREEN.x + 26)
      .attr('y', 23)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('fill', palette.bg)
      .text((d) => d.route);
    rows
      .append('text')
      .attr('x', SCREEN.x + 42)
      .attr('y', 16)
      .attr('font-size', 10)
      .attr('fill', palette.ink)
      .text((d) => d.dest);
    rows
      .append('text')
      .attr('class', 'rt-eta')
      .attr('x', SCREEN.x + SCREEN.w - 12)
      .attr('y', 24)
      .attr('text-anchor', 'end')
      .attr('font-size', 12)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.ink);

    // Delay chip on the first row only.
    const chip = g.append('g').attr('class', 'rt-delay-chip');
    chip
      .append('rect')
      .attr('x', SCREEN.x + 42)
      .attr('y', 62)
      .attr('width', 54)
      .attr('height', 14)
      .attr('rx', 7)
      .attr('fill', palette.accent)
      .attr('fill-opacity', 0.18)
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline);
    chip
      .append('text')
      .attr('x', SCREEN.x + 69)
      .attr('y', 72)
      .attr('text-anchor', 'middle')
      .attr('font-size', 8)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.accentText)
      .text(copy.realtime.scene.delay);
  }

  private buildAlert(): void {
    const { palette, variant } = this.ctx;
    // Drops from behind the search bar, the way an app surfaces a disruption.
    const g = this.alertLayer;
    const top = SEARCH.y + SEARCH.h + 8;
    g.append('rect')
      .attr('x', SCREEN.x + 8)
      .attr('y', top)
      .attr('width', SCREEN.w - 16)
      .attr('height', 52)
      .attr('rx', variant.name === 'night' ? 10 : 2)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 2);
    g.append('rect')
      .attr('x', SCREEN.x + 8)
      .attr('y', top)
      .attr('width', 4)
      .attr('height', 52)
      .attr('fill', palette.accent);
    g.append('text')
      .attr('x', SCREEN.x + 22)
      .attr('y', top + 22)
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('fill', palette.accentText)
      .text(copy.realtime.scene.detour);
    g.append('text')
      .attr('x', SCREEN.x + 22)
      .attr('y', top + 38)
      .attr('font-size', 9)
      .attr('fill', palette.ink)
      .text(copy.realtime.scene.detourRoute);
  }

  resize(): void {
    // Map the shared network into the phone screen, without disturbing the
    // background map's own projection.
    const routes = this.ctx.network.routes();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const r of routes) {
      for (const [x, y] of r.points) {
        if (x < minX) {
          minX = x;
        }
        if (y < minY) {
          minY = y;
        }
        if (x > maxX) {
          maxX = x;
        }
        if (y > maxY) {
          maxY = y;
        }
      }
    }
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);
    const pad = 14;
    const k = Math.min(
      (SCREEN.w - pad * 2) / spanX,
      (SCREEN.h - pad * 2) / spanY
    );
    const ox = SCREEN.x + (SCREEN.w - spanX * k) / 2;
    const oy = SCREEN.y + (SCREEN.h - spanY * k) / 2;
    this.transform = ([x, y]) => [ox + (x - minX) * k, oy + (y - minY) * k];

    this.drawMiniMap();
  }

  private drawMiniMap(): void {
    const { palette, variant } = this.ctx;
    const path = line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curveCatmullRom.alpha(0.5));

    const routes = this.ctx.network.routes();
    this.mapLayer
      .selectAll<SVGPathElement, (typeof routes)[number]>('path.rt-route')
      .data(routes, (d) => d.id)
      .join('path')
      .attr('class', 'rt-route')
      .attr('d', (d) => path(d.points.map(this.transform)))
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2 * variant.strokeWeightScale)
      .attr('stroke-linecap', 'round')
      .attr('stroke-opacity', 0.9);

    const stops = this.ctx.network.stops();
    this.mapLayer
      .selectAll<SVGCircleElement, (typeof stops)[number]>('circle.rt-stop')
      .data(stops, (d) => d.id)
      .join('circle')
      .attr('class', 'rt-stop')
      .attr('cx', (d) => this.transform([d.x, d.y])[0])
      .attr('cy', (d) => this.transform([d.x, d.y])[1])
      .attr('r', 1.6)
      .attr('fill', palette.inkMuted);
  }

  render(p: SceneProgress): void {
    const t = p.pinProgress;
    const { palette, reducedMotion } = this.ctx;
    const beats = BEATS;

    const beat1 = subRange(t, 0, 0.33);
    const beat2 = subRange(t, 0.33, 0.66);
    const beat3 = subRange(t, 0.66, 1);
    const index = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;

    // Beat 1: vehicle positions on the phone map.
    const states = simulate(this.ctx.network, this.fleet, {
      elapsed: reducedMotion ? 0 : p.elapsed,
      frozen: reducedMotion,
    });
    const placed = states.map((s) => {
      const [x, y] = this.transform([s.x, s.y]);
      return { ...s, x, y };
    });

    // The map stays up all three beats, the way it would in a mapping app.
    this.mapLayer
      .selectAll<SVGRectElement, (typeof placed)[number]>('rect.rt-vehicle')
      .data(placed, (d) => d.id)
      .join('rect')
      .attr('class', 'rt-vehicle')
      .attr('width', 8)
      .attr('height', 5)
      .attr('rx', this.ctx.variant.vehicleGlyph === 'capsule' ? 2.5 : 0)
      .attr('fill', (d) => d.color)
      .attr('opacity', String(subRange(beat1, 0, 0.3)))
      .attr(
        'transform',
        (d) =>
          `translate(${d.x} ${d.y}) rotate(${d.bearing}) translate(-4 -2.5)`
      );

    // Beat 2: the departures sheet rises over the map, with an ETA that slips.
    const rise = index === 0 ? 0 : subRange(beat2, 0, 0.3);
    this.listLayer
      .attr('opacity', String(index === 0 ? 0 : 1))
      .attr('transform', `translate(0 ${SHEET_TOP + (1 - rise) * SHEET_H})`);
    const slip = subRange(beat2, 0.35, 0.7);
    this.listLayer
      .selectAll<SVGTextElement, (typeof ARRIVALS)[number]>('.rt-eta')
      .each((d, i, nodes) => {
        const minutes = i === 0 ? Math.round(d.base + slip * 2) : d.base;
        nodes[i].textContent = fill(copy.realtime.scene.minutes, {
          n: minutes,
        });
        nodes[i].setAttribute(
          'fill',
          i === 0 && slip > 0.5 ? palette.accentText : palette.ink
        );
      });
    this.listLayer
      .select('.rt-delay-chip')
      .attr('opacity', String(subRange(beat2, 0.55, 0.8)));

    // Beat 3: the alert card drops out from behind the search bar.
    const drop = subRange(beat3, 0, 0.35);
    this.alertLayer
      .attr('opacity', String(drop))
      .attr('transform', `translate(0 ${(1 - drop) * -64})`);

    // Lens targets whatever the current beat is about.
    const target: [number, number] =
      index === 0
        ? placed.length > 0
          ? [placed[0].x, placed[0].y]
          : [SCREEN.x + SCREEN.w / 2, SCREEN.y + SCREEN.h / 2]
        : index === 1
          ? [SCREEN.x + SCREEN.w - 40, SHEET_TOP + 64]
          : [SCREEN.x + SCREEN.w / 2, SEARCH.y + SEARCH.h + 34];

    const appear = clamp01(
      Math.max(subRange(beat1, 0.25, 0.5), index > 0 ? 1 : 0)
    );
    this.svg
      .select('.rt-lens')
      .attr('transform', `translate(${target[0]} ${target[1]})`)
      .attr('opacity', String(appear));
    this.svg
      .select('.rt-leader')
      .attr('x1', target[0] + 30)
      .attr('y1', target[1])
      .attr('x2', PANEL.x)
      .attr('y2', PANEL.y + PANEL.h / 2)
      .attr('opacity', String(appear));

    this.svg.select('.rt-panel').attr('opacity', String(appear));
    this.svg.select('.rt-panel-type').text(beats[index].type);
    this.svg
      .select('.rt-panel-fields')
      .selectAll<SVGTextElement, number>('text')
      .each((d, i, nodes) => {
        nodes[i].textContent = beats[index].fields[d] ?? '';
      });
  }

  destroy(): void {
    this.svg.remove();
  }
}
