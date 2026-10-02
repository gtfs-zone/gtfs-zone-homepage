// One feed, three places the same vehicle shows up. Every destination frame is
// a live view of the same network, so "publish" reads as one source many apps.

import { select, type Selection } from 'd3-selection';
import { line, curveCatmullRom } from 'd3-shape';
import { subRange } from '../engine/section-progress';
import { pageCopy } from '../i18n/catalogs';
import type { Scene, SceneContext, SceneProgress } from '../engine/scene';
import { buildFleet, simulate, type Vehicle } from '../net/vehicle-sim';

const copy = pageCopy();

const VB_W = 760;
const VB_H = 470;

const SRC = { x: 30, y: 190, w: 130, h: 92 };
const FRAME = { x: 360, w: 370, h: 128 };
const FRAME_Y = [22, 170, 318];
const BAR_H = 28;
const MAP_H = FRAME.h - BAR_H;
const PACKETS_PER_SPOKE = 3;
// Fraction of the network's full extent the frames show. The frames are small,
// so they show the dense core rather than the whole metro area.
const CROP = 0.34;
// Grid resolution used to locate that core.
const DENSITY_CELLS = 24;

export class PublishScene implements Scene {
  private ctx!: SceneContext;
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
  private map!: Selection<SVGGElement, unknown, null, undefined>;
  private spokeNodes: SVGPathElement[] = [];
  private spokeLengths: number[] = [];
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

    // One map, drawn once and instanced into each frame, so the three
    // destinations are provably showing the same feed.
    const defs = this.svg.append('defs');
    this.map = defs.append('g').attr('id', 'pb-map');
    FRAME_Y.forEach((y, i) => {
      defs
        .append('clipPath')
        .attr('id', `pb-clip-${i}`)
        .append('rect')
        .attr('x', FRAME.x)
        .attr('y', y + BAR_H)
        .attr('width', FRAME.w)
        .attr('height', MAP_H);
    });

    const spokes = this.svg.append('g').attr('class', 'pb-spokes');
    FRAME_Y.forEach((y) => {
      const ty = y + FRAME.h / 2;
      const d = `M${SRC.x + SRC.w},${SRC.y + SRC.h / 2} C${SRC.x + SRC.w + 130},${SRC.y + SRC.h / 2} ${FRAME.x - 150},${ty} ${FRAME.x},${ty}`;
      const path = spokes
        .append('path')
        .attr('class', 'pb-spoke')
        .attr('d', d)
        .attr('fill', 'none')
        .attr('stroke', palette.grid)
        .attr('stroke-width', palette.strokeHairline * 3);
      const node = path.node() as SVGPathElement;
      this.spokeNodes.push(node);
      this.spokeLengths.push(node.getTotalLength());
    });

    // The source: the feed itself.
    const src = this.svg.append('g').attr('class', 'pb-source');
    src
      .append('rect')
      .attr('x', SRC.x)
      .attr('y', SRC.y)
      .attr('width', SRC.w)
      .attr('height', SRC.h)
      .attr('rx', round)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 3);
    src
      .append('text')
      .attr('x', SRC.x + SRC.w / 2)
      .attr('y', SRC.y + 34)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.accentText)
      .text('gtfs.zone');
    [0, 1, 2].forEach((i) => {
      src
        .append('rect')
        .attr('x', SRC.x + 18)
        .attr('y', SRC.y + 48 + i * 14)
        .attr('width', SRC.w - 36 - i * 16)
        .attr('height', 6)
        .attr('rx', 3)
        .attr('fill', palette.grid);
    });
    src
      .append('text')
      .attr('x', SRC.x + SRC.w / 2)
      .attr('y', SRC.y + SRC.h + 22)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', palette.inkMuted)
      .text(copy.publish.scene.oneFeed);

    const frames = this.svg
      .selectAll('g.pb-frame')
      .data(
        copy.publish.destinations.map((name, i) => ({ name, y: FRAME_Y[i], i }))
      )
      .join('g')
      .attr('class', 'pb-frame');
    frames
      .append('rect')
      .attr('x', FRAME.x)
      .attr('y', (d) => d.y)
      .attr('width', FRAME.w)
      .attr('height', FRAME.h)
      .attr('rx', round)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 3);
    // The title bar names the destination; the last one is a browser.
    frames
      .append('line')
      .attr('x1', FRAME.x)
      .attr('x2', FRAME.x + FRAME.w)
      .attr('y1', (d) => d.y + BAR_H)
      .attr('y2', (d) => d.y + BAR_H)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 2);
    frames
      .filter((d) => d.i === 2)
      .each(function (d) {
        const g = select(this);
        [0, 1, 2].forEach((k) => {
          g.append('circle')
            .attr('cx', FRAME.x + 14 + k * 10)
            .attr('cy', d.y + BAR_H / 2)
            .attr('r', 2.5)
            .attr('fill', palette.grid);
        });
        g.append('rect')
          .attr('x', FRAME.x + 52)
          .attr('y', d.y + 6)
          .attr('width', FRAME.w - 66)
          .attr('height', BAR_H - 12)
          .attr('rx', (BAR_H - 12) / 2)
          .attr('fill', 'none')
          .attr('stroke', palette.grid)
          .attr('stroke-width', palette.strokeHairline * 2);
      });
    frames
      .append('text')
      .attr('x', (d) => (d.i === 2 ? FRAME.x + 66 : FRAME.x + 16))
      .attr('y', (d) => d.y + 19)
      .attr('font-size', 12)
      .attr('font-family', (d) =>
        d.i === 2 ? 'ui-monospace, monospace' : 'inherit'
      )
      .attr('fill', (d) => (d.i === 2 ? palette.inkMuted : palette.ink))
      .text((d) => (d.i === 2 ? copy.publish.scene.siteDomain : d.name));
    frames
      .filter((d) => d.i === 2)
      .append('text')
      .attr('x', FRAME.x + FRAME.w - 14)
      .attr('y', (d) => d.y + FRAME.h - 12)
      .attr('text-anchor', 'end')
      .attr('font-size', 10)
      .attr('fill', palette.inkMuted)
      .text(copy.publish.destinations[2]);
    // Each frame instances the one live map. The clip lives on a wrapper group:
    // x/y on <use> shifts only the referenced content, not the element's own
    // clip, so clipping the <use> directly would crop every frame to the first.
    frames
      .append('g')
      .attr('clip-path', (d) => `url(#pb-clip-${d.i})`)
      .append('use')
      .attr('href', '#pb-map')
      .attr('x', 0)
      .attr('y', (d) => d.y - FRAME_Y[0]);

    this.svg
      .append('g')
      .attr('class', 'pb-packets')
      .selectAll('rect')
      .data(
        FRAME_Y.flatMap((_, spoke) =>
          Array.from({ length: PACKETS_PER_SPOKE }, (_, i) => ({
            spoke,
            phase: i / PACKETS_PER_SPOKE,
          }))
        )
      )
      .join('rect')
      .attr('class', 'pb-packet')
      .attr('width', 7)
      .attr('height', 7)
      .attr('rx', variant.vehicleGlyph === 'capsule' ? 3.5 : 0)
      .attr('fill', palette.accent);

    // Two per route, since the crop only shows part of each line.
    this.fleet = buildFleet(ctx.network, 2, 11);
  }

  resize(): void {
    // Fit a crop of the shared network into one frame's map area. The instances
    // handle the other two, so the geometry is computed once.
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

    // Center the crop on the densest part of the network, which is downtown.
    const [cx, cy] = this.denseCenter(minX, minY, spanX, spanY);
    // The crop takes the frame's aspect, so the scale is a plain width fit and
    // nothing spills past the clip.
    const cropX = spanX * CROP;
    const cropY = cropX * (MAP_H / FRAME.w);
    const left = Math.min(
      Math.max(cx - cropX / 2, minX),
      Math.max(minX, maxX - cropX)
    );
    const top = Math.min(
      Math.max(cy - cropY / 2, minY),
      Math.max(minY, maxY - cropY)
    );

    const k = FRAME.w / cropX;
    const ox = FRAME.x;
    const oy = FRAME_Y[0] + BAR_H;
    this.transform = ([x, y]) => [ox + (x - left) * k, oy + (y - top) * k];

    this.drawMap();
  }

  // Bin the stops onto a coarse grid and return the center of the heaviest
  // 3x3 neighborhood, so a single busy cell cannot pull the crop off center.
  private denseCenter(
    minX: number,
    minY: number,
    spanX: number,
    spanY: number
  ): [number, number] {
    const n = DENSITY_CELLS;
    const counts = new Float64Array(n * n);
    for (const s of this.ctx.network.stops()) {
      const gx = Math.min(
        n - 1,
        Math.max(0, Math.floor(((s.x - minX) / spanX) * n))
      );
      const gy = Math.min(
        n - 1,
        Math.max(0, Math.floor(((s.y - minY) / spanY) * n))
      );
      counts[gy * n + gx] += 1;
    }

    let best = -1;
    let bx = n / 2;
    let by = n / 2;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= n || ny >= n) {
              continue;
            }
            sum += counts[ny * n + nx];
          }
        }
        if (sum > best) {
          best = sum;
          bx = x;
          by = y;
        }
      }
    }
    return [minX + ((bx + 0.5) / n) * spanX, minY + ((by + 0.5) / n) * spanY];
  }

  private drawMap(): void {
    const { palette, variant } = this.ctx;
    const path = line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curveCatmullRom.alpha(0.5));

    const routes = this.ctx.network.routes();
    this.map
      .selectAll<SVGPathElement, (typeof routes)[number]>('path.pb-route')
      .data(routes, (d) => d.id)
      .join('path')
      .attr('class', 'pb-route')
      .attr('d', (d) => path(d.points.map(this.transform)))
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2 * variant.strokeWeightScale)
      .attr('stroke-linecap', 'round')
      .attr('stroke-opacity', 0.9);

    const stops = this.ctx.network.stops();
    this.map
      .selectAll<SVGCircleElement, (typeof stops)[number]>('circle.pb-stop')
      .data(stops, (d) => d.id)
      .join('circle')
      .attr('class', 'pb-stop')
      .attr('cx', (d) => this.transform([d.x, d.y])[0])
      .attr('cy', (d) => this.transform([d.x, d.y])[1])
      .attr('r', 2.4)
      .attr('fill', palette.inkMuted);
  }

  render(p: SceneProgress): void {
    const t = p.progress;
    const reveal = subRange(t, 0.1, 0.6);
    const elapsed = this.ctx.reducedMotion ? 0 : p.elapsed;

    this.svg
      .selectAll<SVGPathElement, unknown>('.pb-spoke')
      .each((_, i, nodes) => {
        const len = this.spokeLengths[i];
        const local = subRange(reveal, i * 0.15, i * 0.15 + 0.6);
        nodes[i].style.strokeDasharray = `${len}`;
        nodes[i].style.strokeDashoffset = `${len * (1 - local)}`;
      });

    this.svg
      .selectAll<SVGGElement, { i: number }>('.pb-frame')
      .each((d, i, nodes) => {
        const local = subRange(reveal, 0.25 + d.i * 0.12, 0.8 + d.i * 0.06);
        nodes[i].setAttribute('opacity', String(local));
        nodes[i].setAttribute('transform', `translate(${(1 - local) * 20} 0)`);
      });

    // The same vehicles, drawn once and shown in all three frames at once.
    const states = simulate(this.ctx.network, this.fleet, {
      elapsed,
      frozen: this.ctx.reducedMotion,
    });
    this.map
      .selectAll<SVGRectElement, (typeof states)[number]>('rect.pb-vehicle')
      .data(states, (d) => d.id)
      .join('rect')
      .attr('class', 'pb-vehicle')
      .attr('width', 9)
      .attr('height', 6)
      .attr('rx', this.ctx.variant.vehicleGlyph === 'capsule' ? 3 : 0)
      .attr('fill', (d) => d.color)
      .attr('stroke', this.ctx.palette.bgElevated)
      .attr('stroke-width', 1)
      .attr('transform', (d) => {
        const [x, y] = this.transform([d.x, d.y]);
        return `translate(${x} ${y}) rotate(${d.bearing}) translate(-4.5 -3)`;
      });

    // Packets flow continuously, so the section stays alive when the reader stops.
    this.svg
      .selectAll<SVGRectElement, { spoke: number; phase: number }>('.pb-packet')
      .each((d, i, nodes) => {
        const node = this.spokeNodes[d.spoke];
        const len = this.spokeLengths[d.spoke];
        const flow = (d.phase + elapsed * 0.22) % 1;
        const visible = subRange(reveal, d.spoke * 0.15, d.spoke * 0.15 + 0.6);
        const pt = node.getPointAtLength(len * flow);
        nodes[i].setAttribute(
          'transform',
          `translate(${pt.x - 3.5} ${pt.y - 3.5})`
        );
        nodes[i].setAttribute(
          'opacity',
          String(visible * (this.ctx.reducedMotion ? 0.6 : 1))
        );
      });
  }

  destroy(): void {
    this.svg.remove();
  }
}
