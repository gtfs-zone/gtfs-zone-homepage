// The persistent background network. Alive on load, drives the whole page's ground.

import { select, type Selection } from 'd3-selection';
import { line, curveCatmullRom, curveLinear } from 'd3-shape';
import { clamp01 } from '../engine/section-progress';
import { scrollState } from '../engine/scroll-store';
import type { Scene, SceneContext, SceneProgress } from '../engine/scene';
import type { Viewport } from '../engine/viewport';
import { buildFleet, simulate, type Vehicle } from '../net/vehicle-sim';

const REVEAL_SECONDS = 1.2;
const ROUTE_STAGGER = 0.18;

export class HeroMapScene implements Scene {
  private ctx!: SceneContext;
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
  private mapGroup!: Selection<SVGGElement, unknown, null, undefined>;
  private routeGroup!: Selection<SVGGElement, unknown, null, undefined>;
  private stopGroup!: Selection<SVGGElement, unknown, null, undefined>;
  private vehicleGroup!: Selection<SVGGElement, unknown, null, undefined>;
  private lengths = new Map<string, number>();
  private fleet: Vehicle[] = [];
  private width = 0;
  private height = 0;

  mount(root: HTMLElement, ctx: SceneContext): void {
    this.ctx = ctx;
    this.svg = select(root)
      .append('svg')
      .attr('aria-hidden', 'true')
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .style('width', '100%')
      .style('height', '100%');

    const defs = this.svg.append('defs');
    if (ctx.variant.glow) {
      const f = defs
        .append('filter')
        .attr('id', 'hero-glow')
        .attr('x', '-30%')
        .attr('y', '-30%')
        .attr('width', '160%')
        .attr('height', '160%');
      f.append('feGaussianBlur').attr('stdDeviation', ctx.palette.glowRadius).attr('result', 'b');
      const merge = f.append('feMerge');
      merge.append('feMergeNode').attr('in', 'b');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    this.mapGroup = this.svg.append('g');
    if (ctx.variant.showGrid) this.mapGroup.append('g').attr('class', 'hero-grid');
    this.routeGroup = this.mapGroup.append('g');
    this.stopGroup = this.mapGroup.append('g');
    this.vehicleGroup = this.mapGroup.append('g');

    this.fleet = buildFleet(ctx.network, ctx.variant.name === 'night' ? 3 : 2);
  }

  resize(v: Viewport): void {
    this.width = v.width;
    this.height = v.height;
    this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
    // The hero crops to a tighter box on mobile rather than shrinking the network.
    this.ctx.network.fit(this.width, this.height, v.isMobile ? -this.width * 0.25 : 40);
    this.drawGrid();
    this.drawRoutes();
    this.drawStops();
  }

  private drawGrid(): void {
    if (!this.ctx.variant.showGrid) return;
    const step = 40;
    const g = this.mapGroup.select<SVGGElement>('.hero-grid');
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let x = 0; x <= this.width; x += step) lines.push({ x1: x, y1: 0, x2: x, y2: this.height });
    for (let y = 0; y <= this.height; y += step) lines.push({ x1: 0, y1: y, x2: this.width, y2: y });
    g.selectAll('line')
      .data(lines)
      .join('line')
      .attr('x1', (d) => d.x1)
      .attr('y1', (d) => d.y1)
      .attr('x2', (d) => d.x2)
      .attr('y2', (d) => d.y2)
      .attr('stroke', this.ctx.palette.grid)
      .attr('stroke-width', this.ctx.palette.strokeHairline);
  }

  private drawRoutes(): void {
    const { palette, variant } = this.ctx;
    const path = line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(variant.name === 'night' ? curveCatmullRom.alpha(0.5) : curveLinear);

    const routes = this.ctx.network.routes();
    const weight = palette.strokeRoute * variant.strokeWeightScale;

    // Glow underlay, then the crisp stroke on top.
    this.routeGroup
      .selectAll<SVGPathElement, (typeof routes)[number]>('path.route-glow')
      .data(variant.glow ? routes : [], (d) => d.id)
      .join('path')
      .attr('class', 'route-glow')
      .attr('d', (d) => path(d.points))
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', weight * 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-opacity', 0.18)
      .attr('filter', 'url(#hero-glow)');

    const main = this.routeGroup
      .selectAll<SVGPathElement, (typeof routes)[number]>('path.route')
      .data(routes, (d) => d.id)
      .join('path')
      .attr('class', 'route')
      .attr('d', (d) => path(d.points))
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', weight)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    this.lengths.clear();
    main.each((d, i, nodes) => {
      this.lengths.set(d.id, nodes[i].getTotalLength());
    });
  }

  private drawStops(): void {
    const { palette, variant } = this.ctx;
    const stops = this.ctx.network.stops();
    const r = variant.name === 'night' ? 2.2 : 3;

    this.stopGroup
      .selectAll<SVGCircleElement, (typeof stops)[number]>('circle')
      .data(stops, (d) => d.id)
      .join('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => (d.isMajor ? r * 1.8 : r))
      .attr('fill', variant.name === 'night' ? palette.inkMuted : palette.bgElevated)
      .attr('stroke', variant.name === 'night' ? 'none' : palette.ink)
      .attr('stroke-width', palette.strokeHairline * 2)
      .attr('fill-opacity', variant.name === 'night' ? 0.55 : 1);
  }

  render(p: SceneProgress): void {
    const { variant, palette, reducedMotion } = this.ctx;

    // Hero scrub: one viewport of scroll, descending into the network.
    const heroP = clamp01(scrollState.y / Math.max(1, scrollState.viewport));
    const scale = 1 + heroP * 0.15;
    const drift = -heroP * 60;
    this.mapGroup.attr(
      'transform',
      `translate(${this.width / 2} ${this.height / 2}) scale(${scale}) translate(${-this.width / 2} ${
        -this.height / 2 + drift
      })`
    );

    // Past the hero the network recedes and becomes the page's ground.
    const recede = clamp01((scrollState.y - scrollState.viewport * 0.6) / (scrollState.viewport * 0.8));
    const bodyOpacity = 1 - recede * 0.72;

    // The last section slows and dims the network to a stop.
    const tail = clamp01(
      (scrollState.y - (scrollState.height - scrollState.viewport * 1.8)) / (scrollState.viewport * 1.2)
    );
    this.svg.style('opacity', String(bodyOpacity * (1 - tail * 0.6)));

    // Draw-in reveal, staggered by route. Instant under reduced motion.
    this.routeGroup.selectAll<SVGPathElement, { id: string }>('path').each((d, i, nodes) => {
      const len = this.lengths.get(d.id) ?? 0;
      if (len === 0) return;
      const routeIndex = i % Math.max(1, this.lengths.size);
      const t = reducedMotion
        ? 1
        : clamp01((p.elapsed - routeIndex * ROUTE_STAGGER) / REVEAL_SECONDS);
      const eased = 1 - Math.pow(1 - t, 3);
      const el = nodes[i];
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len * (1 - eased)}`;
      // Routes desaturate slightly as text sections take over.
      el.style.strokeOpacity = `${1 - recede * 0.25}`;
    });

    const elapsed = reducedMotion ? 0 : Math.max(0, p.elapsed - REVEAL_SECONDS * 0.4);
    const states = simulate(this.ctx.network, this.fleet, {
      elapsed: elapsed * (1 - tail),
      motion: variant.vehicleMotion,
      frozen: reducedMotion,
    });

    const size = variant.name === 'night' ? 7 : 6;
    this.vehicleGroup
      .selectAll<SVGRectElement, (typeof states)[number]>('rect')
      .data(states, (d) => d.id)
      .join('rect')
      .attr('width', size)
      .attr('height', size * 0.62)
      .attr('rx', variant.vehicleGlyph === 'capsule' ? size * 0.31 : 0)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', (d) => (d.dwelling ? 0.75 : 1))
      .attr('filter', variant.glow ? 'url(#hero-glow)' : null)
      .attr(
        'transform',
        (d) => `translate(${d.x} ${d.y}) rotate(${d.bearing}) translate(${-size / 2} ${-size * 0.31})`
      );

    // Stops brighten as a vehicle approaches.
    if (variant.name === 'night') {
      this.stopGroup.selectAll<SVGCircleElement, { x: number; y: number }>('circle').each((d, i, nodes) => {
        let nearest = Infinity;
        for (const s of states) {
          const dist = Math.hypot(s.x - d.x, s.y - d.y);
          if (dist < nearest) nearest = dist;
        }
        const near = clamp01(1 - nearest / 60);
        nodes[i].setAttribute('fill', near > 0.4 ? palette.accent : palette.inkMuted);
        nodes[i].setAttribute('fill-opacity', String(0.45 + near * 0.55));
      });
    }
  }

  destroy(): void {
    this.svg.remove();
  }
}
