// The visualizer, reduced to what it is: a map fragment with one vehicle
// selected, and the detail panel that names it. Reuses the shared network
// geometry and fleet rather than introducing a third map.

import { select, type Selection } from 'd3-selection';
import { line, curveCatmullRom } from 'd3-shape';
import { subRange } from '../engine/section-progress';
import type { Scene, SceneContext, SceneProgress } from '../engine/scene';
import { buildFleet, simulate, type Vehicle } from '../net/vehicle-sim';

const VB_W = 720;
const VB_H = 400;
const MAP = { x: 16, y: 24, w: 400, h: 352 };
const PANEL = { x: 448, y: 96, w: 256, h: 208 };

// The readout for the selected vehicle. Field names are the GTFS-RT ones.
const FIELDS: [string, string][] = [
  ['vehicle.id', '7'],
  ['trip.route_id', 'A'],
  ['trip.trip_id', '1042-WKDY'],
  ['arrival.delay', '+120s'],
  ['timestamp', '12s ago'],
];

export class VisualizerInspectorScene implements Scene {
  private ctx!: SceneContext;
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
  private mapLayer!: Selection<SVGGElement, unknown, null, undefined>;
  private fleet: Vehicle[] = [];
  private transform: (p: [number, number]) => [number, number] = (p) => p;

  mount(root: HTMLElement, ctx: SceneContext): void {
    this.ctx = ctx;
    const { palette, variant } = ctx;
    const round = variant.name === 'night' ? 10 : 2;

    this.svg = select(root)
      .append('svg')
      .attr('aria-hidden', 'true')
      .attr('viewBox', `0 0 ${VB_W} ${VB_H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'vz-map-clip')
      .append('rect')
      .attr('x', MAP.x)
      .attr('y', MAP.y)
      .attr('width', MAP.w)
      .attr('height', MAP.h)
      .attr('rx', round);

    const frame = this.svg.append('g').attr('class', 'vz-frame');
    frame
      .append('rect')
      .attr('x', MAP.x)
      .attr('y', MAP.y)
      .attr('width', MAP.w)
      .attr('height', MAP.h)
      .attr('rx', round)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 3);

    this.mapLayer = this.svg.append('g').attr('clip-path', 'url(#vz-map-clip)');

    // Selection ring and the leader out to the panel.
    this.svg
      .append('line')
      .attr('class', 'vz-leader')
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 2)
      .attr('stroke-dasharray', '4 4');
    this.svg
      .append('circle')
      .attr('class', 'vz-ring')
      .attr('r', 18)
      .attr('fill', 'none')
      .attr('stroke', palette.accent)
      .attr('stroke-width', variant.name === 'night' ? 2.2 : 1.3);

    const panel = this.svg.append('g').attr('class', 'vz-panel');
    panel
      .append('rect')
      .attr('x', PANEL.x)
      .attr('y', PANEL.y)
      .attr('width', PANEL.w)
      .attr('height', PANEL.h)
      .attr('rx', round)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 2);
    panel
      .append('text')
      .attr('x', PANEL.x + 18)
      .attr('y', PANEL.y + 32)
      .attr('font-size', 14)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.accentText)
      .text('VehiclePosition');

    const rows = panel
      .selectAll('g.vz-row')
      .data(FIELDS)
      .join('g')
      .attr('class', 'vz-row')
      .attr('transform', (_, i) => `translate(0 ${PANEL.y + 62 + i * 28})`);
    rows
      .append('text')
      .attr('x', PANEL.x + 18)
      .attr('font-size', 11)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.inkMuted)
      .text((d) => d[0]);
    rows
      .append('text')
      .attr('x', PANEL.x + PANEL.w - 18)
      .attr('text-anchor', 'end')
      .attr('font-size', 11)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.ink)
      .text((d) => d[1]);

    this.fleet = buildFleet(ctx.network, 2, 11);
  }

  resize(): void {
    // Fit the shared network into the map frame, without touching the
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
    const pad = 20;
    const k = Math.min((MAP.w - pad * 2) / spanX, (MAP.h - pad * 2) / spanY);
    const ox = MAP.x + (MAP.w - spanX * k) / 2;
    const oy = MAP.y + (MAP.h - spanY * k) / 2;
    this.transform = ([x, y]) => [ox + (x - minX) * k, oy + (y - minY) * k];

    this.drawMap();
  }

  private drawMap(): void {
    const { palette, variant } = this.ctx;
    const path = line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curveCatmullRom.alpha(0.5));

    const routes = this.ctx.network.routes();
    this.mapLayer
      .selectAll<SVGPathElement, (typeof routes)[number]>('path.vz-route')
      .data(routes, (d) => d.id)
      .join('path')
      .attr('class', 'vz-route')
      .attr('d', (d) => path(d.points.map(this.transform)))
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2.4 * variant.strokeWeightScale)
      .attr('stroke-linecap', 'round')
      .attr('stroke-opacity', 0.9);

    const stops = this.ctx.network.stops();
    this.mapLayer
      .selectAll<SVGCircleElement, (typeof stops)[number]>('circle.vz-stop')
      .data(stops, (d) => d.id)
      .join('circle')
      .attr('class', 'vz-stop')
      .attr('cx', (d) => this.transform([d.x, d.y])[0])
      .attr('cy', (d) => this.transform([d.x, d.y])[1])
      .attr('r', 1.8)
      .attr('fill', palette.inkMuted);
  }

  render(p: SceneProgress): void {
    const t = p.progress;
    const { reducedMotion, variant } = this.ctx;

    const arrive = subRange(t, 0.1, 0.45);
    const inspect = subRange(t, 0.35, 0.7);

    const states = simulate(this.ctx.network, this.fleet, {
      elapsed: reducedMotion ? 0 : p.elapsed,
      frozen: reducedMotion,
    });
    const placed = states.map((s) => {
      const [x, y] = this.transform([s.x, s.y]);
      return { ...s, x, y };
    });

    this.mapLayer
      .selectAll<SVGRectElement, (typeof placed)[number]>('rect.vz-vehicle')
      .data(placed, (d) => d.id)
      .join('rect')
      .attr('class', 'vz-vehicle')
      .attr('width', 10)
      .attr('height', 6)
      .attr('rx', variant.vehicleGlyph === 'capsule' ? 3 : 0)
      .attr('fill', (d) => d.color)
      .attr('opacity', String(arrive))
      .attr(
        'transform',
        (d) => `translate(${d.x} ${d.y}) rotate(${d.bearing}) translate(-5 -3)`
      );

    // One vehicle is the subject; the panel describes it.
    const subject = placed[0] ?? { x: MAP.x + MAP.w / 2, y: MAP.y + MAP.h / 2 };
    this.svg
      .select('.vz-ring')
      .attr('cx', subject.x)
      .attr('cy', subject.y)
      .attr('opacity', String(inspect));
    this.svg
      .select('.vz-leader')
      .attr('x1', subject.x + 18)
      .attr('y1', subject.y)
      .attr('x2', PANEL.x)
      .attr('y2', PANEL.y + PANEL.h / 2)
      .attr('opacity', String(inspect));
    this.svg
      .select('.vz-panel')
      .attr('opacity', String(inspect))
      .attr('transform', `translate(${(1 - inspect) * 16} 0)`);
  }

  destroy(): void {
    this.svg.remove();
  }
}
