// A Swiss army knife whose blades fan open on scroll, one blade per capability
// the editor actually has. Line art in both variants, so there is no new asset.

import { select, type Selection } from 'd3-selection';
import { subRange } from '../engine/section-progress';
import { copy } from '../content/copy';
import type { Scene, SceneContext, SceneProgress } from '../engine/scene';

const VB_W = 720;
const VB_H = 400;
const PIVOT = { x: 330, y: 320 };
const HANDLE = { x: 140, y: 294, w: 210, h: 52 };

// Folded, every blade lies flat along the handle, which points left from the
// pivot. Open, they spread over the arc above it.
const FOLDED = -180;
const OPEN_FROM = -22;
const OPEN_STEP = -27;

const BLADES = copy.editor.blades.map((label, i) => ({
  label,
  angle: OPEN_FROM + i * OPEN_STEP,
  // Alternating lengths keep neighbouring labels off each other. The shapes
  // blade gets extra reach so its longer label sits clear of its neighbours.
  length: (i % 2 === 0 ? 186 : 152) + (label === 'Generate shapes' ? 18 : 0),
}));

const DEG = Math.PI / 180;

export class EditorToolsScene implements Scene {
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;

  mount(root: HTMLElement, ctx: SceneContext): void {
    const { palette, variant } = ctx;
    const night = variant.name === 'night';

    this.svg = select(root)
      .append('svg')
      .attr('aria-hidden', 'true')
      .attr('viewBox', `0 0 ${VB_W} ${VB_H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // Blades sit under the handle, so a folded blade reads as tucked inside it.
    this.svg
      .append('g')
      .attr('class', 'kn-blades')
      .selectAll('path')
      .data(BLADES)
      .join('path')
      .attr('class', 'kn-blade')
      .attr('d', (d) => bladePath(d.length))
      .attr('fill', 'none')
      .attr('stroke', night ? palette.accent : palette.ink)
      .attr('stroke-width', palette.strokeHairline * (night ? 3 : 2))
      .attr('stroke-linejoin', 'round');

    const handle = this.svg.append('g').attr('class', 'kn-handle');
    handle
      .append('rect')
      .attr('x', HANDLE.x)
      .attr('y', HANDLE.y)
      .attr('width', HANDLE.w)
      .attr('height', HANDLE.h)
      .attr('rx', night ? HANDLE.h / 2 : 3)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.ink)
      .attr('stroke-width', palette.strokeHairline * 3);
    // The pin the blades turn on.
    handle
      .append('circle')
      .attr('cx', PIVOT.x)
      .attr('cy', PIVOT.y)
      .attr('r', 5)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 2);

    this.svg
      .append('g')
      .attr('class', 'kn-labels')
      .selectAll('text')
      .data(BLADES)
      .join('text')
      .attr('class', 'kn-label')
      .attr('font-size', 12)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('letter-spacing', '0.04em')
      .attr('fill', palette.inkMuted)
      .text((d) => d.label);
  }

  render(p: SceneProgress): void {
    const t = p.progress;
    // Symmetric envelope: the knife opens on the way in and folds on the way
    // out, so the scene is a pure function of scroll and rests open mid-section.
    const opening = subRange(t, 0.08, 0.5);
    const closing = subRange(t, 0.72, 0.98);

    this.svg
      .selectAll<SVGPathElement, (typeof BLADES)[number]>('.kn-blade')
      .each((d, i, nodes) => {
        nodes[i].setAttribute(
          'transform',
          `translate(${PIVOT.x} ${PIVOT.y}) rotate(${amount(opening, closing, i) * (d.angle - FOLDED) + FOLDED})`
        );
      });

    this.svg
      .selectAll<SVGTextElement, (typeof BLADES)[number]>('.kn-label')
      .each((d, i, nodes) => {
        const a = amount(opening, closing, i);
        const angle = (a * (d.angle - FOLDED) + FOLDED) * DEG;
        const r = d.length + 14;
        const x = PIVOT.x + Math.cos(angle) * r;
        const y = PIVOT.y + Math.sin(angle) * r;
        const left = Math.cos(angle) < 0;
        nodes[i].setAttribute('x', String(x));
        nodes[i].setAttribute('y', String(y + 4));
        nodes[i].setAttribute('text-anchor', left ? 'end' : 'start');
        // The label only appears once its blade has cleared the handle.
        nodes[i].setAttribute('opacity', String(subRange(a, 0.55, 0.95)));
      });
  }

  destroy(): void {
    this.svg.remove();
  }
}

// How far blade `i` has swung, 0 folded to 1 open. Blades open in order and
// fold in reverse, which is how a real knife closes.
function amount(opening: number, closing: number, i: number): number {
  const open = subRange(opening, i * 0.09, i * 0.09 + 0.55);
  const close = subRange(
    closing,
    (BLADES.length - 1 - i) * 0.09,
    (BLADES.length - 1 - i) * 0.09 + 0.55
  );
  return open * (1 - close);
}

// A tapered blade pointing along +x from the pivot.
function bladePath(length: number): string {
  return `M0,-7 L${length - 26},-9 L${length},-2 L${length - 20},7 L0,7 Z`;
}
