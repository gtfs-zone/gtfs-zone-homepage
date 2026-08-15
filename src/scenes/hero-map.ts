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
// The hero zooms to 1.15. The layer is rendered that much larger and scaled
// down toward 1, so the compositor never has to re-raster at a bigger scale.
const OVERSCAN = 1.15;

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
  // Per-frame write guards: the DOM is only touched when a value actually moves.
  private lastTransform = '';
  private lastOpacity = -1;
  private lastRouteOpacity = -1;
  private revealDone = false;
  private stopLit: Uint8Array = new Uint8Array(0);

  mount(root: HTMLElement, ctx: SceneContext): void {
    this.ctx = ctx;
    this.svg = select(root)
      .append('svg')
      .attr('aria-hidden', 'true')
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .style('position', 'absolute')
      .style('left', `${((1 - OVERSCAN) / 2) * 100}%`)
      .style('top', `${((1 - OVERSCAN) / 2) * 100}%`)
      .style('width', `${OVERSCAN * 100}%`)
      .style('height', `${OVERSCAN * 100}%`)
      // The hero zoom rides a CSS transform on a promoted layer, so scaling
      // never re-runs the glow filter over the route geometry.
      .style('transform-origin', '50% 50%')
      .style('will-change', 'transform, opacity')
      .style('backface-visibility', 'hidden');

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
    // Local space is the oversized layer, so one user unit stays one CSS pixel.
    this.width = v.width * OVERSCAN;
    this.height = v.height * OVERSCAN;
    this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
    // The hero crops to a tighter box on mobile rather than shrinking the network.
    this.ctx.network.fit(this.width, this.height, v.isMobile ? -this.width * 0.25 : 40 * OVERSCAN);
    this.drawGrid();
    this.drawRoutes();
    this.drawStops();
    // Geometry moved under them, so let the next frame rewrite everything.
    this.revealDone = false;
    this.lastRouteOpacity = -1;
    this.lastTransform = '';
    this.lastOpacity = -1;
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

    this.stopLit = new Uint8Array(stops.length).fill(255);
  }

  render(p: SceneProgress): void {
    const { variant, palette, reducedMotion } = this.ctx;

    // Hero scrub: one viewport of scroll, descending into the network. Driven
    // off the damped scroll position so wheel notches do not land as jumps.
    const y = scrollState.ySmooth;
    const heroP = clamp01(y / Math.max(1, scrollState.viewport));
    const scale = (1 + heroP * 0.15) / OVERSCAN;
    const drift = -heroP * 60 * OVERSCAN;
    const transform = `scale(${scale.toFixed(4)}) translateY(${drift.toFixed(2)}px)`;
    if (transform !== this.lastTransform) {
      this.lastTransform = transform;
      this.svg.style('transform', transform);
    }

    // Past the hero the network recedes and becomes the page's ground.
    const recede = clamp01((y - scrollState.viewport * 0.6) / (scrollState.viewport * 0.8));
    const bodyOpacity = 1 - recede * 0.72;

    // The last section slows and dims the network to a stop.
    const tail = clamp01(
      (y - (scrollState.height - scrollState.viewport * 1.8)) / (scrollState.viewport * 1.2)
    );
    const opacity = bodyOpacity * (1 - tail * 0.6);
    if (Math.abs(opacity - this.lastOpacity) > 0.002) {
      this.lastOpacity = opacity;
      this.svg.style('opacity', opacity.toFixed(3));
    }

    // Draw-in reveal, staggered by route. Instant under reduced motion.
    // Dash writes stop once every route is fully drawn; rewriting them each
    // frame invalidates the whole path, glow underlay included.
    const routeOpacity = 1 - recede * 0.25;
    const opacityChanged = Math.abs(routeOpacity - this.lastRouteOpacity) > 0.004;
    if (opacityChanged) this.lastRouteOpacity = routeOpacity;

    if (!this.revealDone || opacityChanged) {
      let allDrawn = true;
      this.routeGroup.selectAll<SVGPathElement, { id: string }>('path').each((d, i, nodes) => {
        const len = this.lengths.get(d.id) ?? 0;
        if (len === 0) return;
        const el = nodes[i];
        if (opacityChanged) {
          // Routes desaturate slightly as text sections take over.
          el.style.strokeOpacity = routeOpacity.toFixed(3);
        }
        if (this.revealDone) return;
        const routeIndex = i % Math.max(1, this.lengths.size);
        const t = reducedMotion
          ? 1
          : clamp01((p.elapsed - routeIndex * ROUTE_STAGGER) / REVEAL_SECONDS);
        if (t < 1) {
          allDrawn = false;
          const eased = 1 - Math.pow(1 - t, 3);
          el.style.strokeDasharray = `${len}`;
          el.style.strokeDashoffset = `${len * (1 - eased)}`;
        } else {
          el.style.strokeDasharray = '';
          el.style.strokeDashoffset = '';
        }
      });
      if (allDrawn) this.revealDone = true;
    }

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

    // Stops brighten as a vehicle approaches. Squared distances, and the fill is
    // only rewritten when a stop crosses a step, so most frames touch no stop.
    if (variant.name === 'night') {
      const radiusSq = 60 * 60;
      this.stopGroup.selectAll<SVGCircleElement, { x: number; y: number }>('circle').each((d, i, nodes) => {
        let nearestSq = Infinity;
        for (const s of states) {
          const dx = s.x - d.x;
          const dy = s.y - d.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < nearestSq) nearestSq = distSq;
        }
        const near = nearestSq >= radiusSq ? 0 : clamp01(1 - Math.sqrt(nearestSq) / 60);
        const step = Math.round(near * 10);
        if (this.stopLit[i] === step) return;
        this.stopLit[i] = step;
        nodes[i].setAttribute('fill', near > 0.4 ? palette.accent : palette.inkMuted);
        nodes[i].setAttribute('fill-opacity', (0.45 + (step / 10) * 0.55).toFixed(2));
      });
    }
  }

  destroy(): void {
    this.svg.remove();
  }
}
