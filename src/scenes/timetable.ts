// The digital timetable: rows are stops, columns are trips, cells are times.

import { select, type Selection } from 'd3-selection';
import { clamp01, subRange } from '../engine/section-progress';
import type { Scene, SceneContext, SceneProgress } from '../engine/scene';

const VB_W = 520;
const VB_H = 360;
const COLS = 6;
const ROWS = 8;
const LABEL_W = 132;
const HEAD_H = 34;
const HIGHLIGHT_COL = 3;

const STOP_LABELS = [
  'Hudson Amtrak',
  'Warren St',
  'Greenport Plaza',
  'Fairview Ave',
  'Columbia Green',
  'Philmont',
  'Chatham Village',
  'Kinderhook',
];

interface Cell {
  row: number;
  col: number;
  minutes: number;
}

function formatClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.floor(totalMinutes % 60);
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')}`;
}

export class TimetableScene implements Scene {
  private ctx!: SceneContext;
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
  private cells: Cell[] = [];

  mount(root: HTMLElement, ctx: SceneContext): void {
    this.ctx = ctx;
    const { palette } = ctx;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // Synthetic but plausible: each trip leaves 45 min apart, each stop 7 min later.
        this.cells.push({ row, col, minutes: 6 * 60 + 10 + col * 45 + row * 7 });
      }
    }

    this.svg = select(root)
      .append('svg')
      .attr('aria-hidden', 'true')
      .attr('viewBox', `0 0 ${VB_W} ${VB_H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    const colW = (VB_W - LABEL_W) / COLS;
    const rowH = (VB_H - HEAD_H) / ROWS;

    // Trip column headers.
    this.svg
      .append('g')
      .attr('class', 'tt-head')
      .selectAll('text')
      .data(Array.from({ length: COLS }, (_, i) => i))
      .join('text')
      .attr('class', 'tt-col-head')
      .attr('x', (d) => LABEL_W + d * colW + colW / 2)
      .attr('y', HEAD_H - 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.inkMuted)
      .text((d) => `TRIP ${101 + d}`);

    this.svg
      .append('line')
      .attr('class', 'tt-rule')
      .attr('x1', 0)
      .attr('x2', VB_W)
      .attr('y1', HEAD_H)
      .attr('y2', HEAD_H)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 2);

    // Highlighted trip column plate, revealed in the second half of the scrub.
    this.svg
      .append('rect')
      .attr('class', 'tt-highlight')
      .attr('x', LABEL_W + HIGHLIGHT_COL * colW)
      .attr('y', HEAD_H)
      .attr('width', colW)
      .attr('height', VB_H - HEAD_H)
      .attr('fill', palette.accent)
      .attr('fill-opacity', 0.12)
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 2);

    this.svg
      .append('g')
      .attr('class', 'tt-rows')
      .selectAll('text')
      .data(STOP_LABELS)
      .join('text')
      .attr('class', 'tt-row-label')
      .attr('x', 0)
      .attr('y', (_, i) => HEAD_H + i * rowH + rowH / 2 + 4)
      .attr('font-size', 11)
      .attr('fill', palette.ink)
      .text((d) => d);

    this.svg
      .append('g')
      .attr('class', 'tt-cells')
      .selectAll('text')
      .data(this.cells)
      .join('text')
      .attr('class', 'tt-cell')
      .attr('x', (d) => LABEL_W + d.col * colW + colW / 2)
      .attr('y', (d) => HEAD_H + d.row * rowH + rowH / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.inkMuted);
  }

  render(p: SceneProgress): void {
    const t = p.pinProgress;
    const assemble = subRange(t, 0, 0.5);
    const link = subRange(t, 0.5, 1);

    // Stop rows slide in from the left, staggered.
    this.svg.selectAll<SVGTextElement, string>('.tt-row-label').each((_, i, nodes) => {
      const local = clamp01((assemble - i * 0.05) / 0.5);
      nodes[i].setAttribute('transform', `translate(${(1 - local) * -60} 0)`);
      nodes[i].setAttribute('opacity', String(local));
    });

    // Trip columns fade in left to right, times counting up to their final values.
    this.svg.selectAll<SVGTextElement, number>('.tt-col-head').each((d, i, nodes) => {
      nodes[i].setAttribute('opacity', String(clamp01((assemble - d * 0.08) / 0.4)));
    });

    this.svg.selectAll<SVGTextElement, Cell>('.tt-cell').each((d, i, nodes) => {
      const local = clamp01((assemble - d.col * 0.08 - d.row * 0.01) / 0.4);
      nodes[i].setAttribute('opacity', String(local));
      const shown = d.minutes - (1 - local) * 240;
      nodes[i].textContent = local > 0 ? formatClock(shown) : '';
      const highlighted = d.col === HIGHLIGHT_COL && link > 0;
      nodes[i].setAttribute('fill', highlighted ? this.ctx.palette.accentText : this.ctx.palette.inkMuted);
    });

    this.svg.select('.tt-highlight').attr('opacity', String(link));
  }

  destroy(): void {
    this.svg.remove();
  }
}
