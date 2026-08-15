// A four-step flow, scrubbed left to right. Not a fake product UI.

import { select, type Selection } from 'd3-selection';
import { subRange } from '../engine/section-progress';
import { copy } from '../content/copy';
import type { Scene, SceneContext, SceneProgress } from '../engine/scene';

const VB_W = 640;
const VB_H = 190;
const TRACK_Y = 92;
const FILE_W = 62;
const FILE_H = 78;

const ISSUES = [
  { x: 18, y: 26 },
  { x: 18, y: 48 },
];

// The file stops once under each step label, so the flow reads left to right.
const STATIONS = [0, 1, 2, 3].map((i) => 60 + i * ((VB_W - 120) / 3));

export class EditorCtaScene implements Scene {
  private ctx!: SceneContext;
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;

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

    this.svg
      .append('line')
      .attr('x1', 20)
      .attr('x2', VB_W - 20)
      .attr('y1', TRACK_Y)
      .attr('y2', TRACK_Y)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 2);

    // A tick under each step, so the stations are visible before the file arrives.
    this.svg
      .append('g')
      .selectAll('line')
      .data(STATIONS)
      .join('line')
      .attr('class', 'ed-tick')
      .attr('x1', (d) => d)
      .attr('x2', (d) => d)
      .attr('y1', TRACK_Y - 5)
      .attr('y2', TRACK_Y + 5)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 2);

    this.svg
      .append('g')
      .selectAll('text')
      .data(copy.editor.steps)
      .join('text')
      .attr('class', 'ed-step')
      .attr('x', (_, i) => STATIONS[i])
      .attr('y', VB_H - 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('letter-spacing', '0.12em')
      .attr('fill', palette.inkMuted)
      .text((d) => d.toUpperCase());

    // The file being worked on.
    const file = this.svg.append('g').attr('class', 'ed-file');
    file
      .append('rect')
      .attr('width', FILE_W)
      .attr('height', FILE_H)
      .attr('rx', variant.name === 'night' ? 6 : 1)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.ink)
      .attr('stroke-width', palette.strokeHairline * 2);
    for (let i = 0; i < 5; i++) {
      file
        .append('line')
        .attr('x1', 12)
        .attr('x2', FILE_W - 12)
        .attr('y1', 18 + i * 12)
        .attr('y2', 18 + i * 12)
        .attr('stroke', palette.grid)
        .attr('stroke-width', palette.strokeHairline * 2);
    }
    file
      .append('g')
      .attr('class', 'ed-issues')
      .selectAll('circle')
      .data(ISSUES)
      .join('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 4);

    // The inspection sweep.
    this.svg
      .append('rect')
      .attr('class', 'ed-sweep')
      .attr('y', TRACK_Y - FILE_H / 2 - 10)
      .attr('width', 3)
      .attr('height', FILE_H + 20)
      .attr('fill', palette.accent);

    // The export mark: the file leaves as a download at the last station.
    const out = this.svg.append('g').attr('class', 'ed-export');
    out
      .append('path')
      .attr('d', 'M0,-10 L0,10 M-7,3 L0,10 L7,3')
      .attr('fill', 'none')
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');
    out
      .append('line')
      .attr('x1', -12)
      .attr('x2', 12)
      .attr('y1', 16)
      .attr('y2', 16)
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 3)
      .attr('stroke-linecap', 'round');
  }

  render(p: SceneProgress): void {
    // p.progress is 0 with the graphic below the fold and ~0.75 with it at the
    // top edge. Run the flow while it crosses the middle of the screen: upload
    // lands once it is fully visible, export finishes before it scrolls off.
    const t = subRange(p.progress, 0.3, 0.72);
    const { palette } = this.ctx;

    // One dwell per step, with a short hop between them.
    const upload = subRange(t, 0.02, 0.18);
    const hop1 = subRange(t, 0.2, 0.3);
    const inspect = subRange(t, 0.32, 0.52);
    const hop2 = subRange(t, 0.54, 0.62);
    const fix = subRange(t, 0.64, 0.8);
    const hop3 = subRange(t, 0.82, 0.9);
    const exported = subRange(t, 0.9, 1);

    const center =
      STATIONS[0] +
      hop1 * (STATIONS[1] - STATIONS[0]) +
      hop2 * (STATIONS[2] - STATIONS[1]) +
      hop3 * (STATIONS[3] - STATIONS[2]);
    const x = center - FILE_W / 2;
    // The upload drops the file onto the first station.
    const y = TRACK_Y - FILE_H / 2 - (1 - upload) * 26;

    this.svg
      .select('.ed-file')
      .attr('transform', `translate(${x} ${y})`)
      .attr('opacity', String(Math.min(upload * 2, 1)));

    // The sweep passes over the file, flagging issues behind it.
    this.svg
      .select('.ed-sweep')
      .attr('x', x - 8 + inspect * (FILE_W + 16))
      .attr('opacity', String(inspect > 0 && inspect < 1 ? 1 : 0));

    this.svg
      .select('.ed-export')
      .attr('transform', `translate(${STATIONS[3]} ${138 + (1 - exported) * -8})`)
      .attr('opacity', String(exported));

    this.svg.selectAll<SVGCircleElement, (typeof ISSUES)[number]>('.ed-issues circle').each((d, i, nodes) => {
      const flagged = subRange(inspect, (d.y - 20) / 60, (d.y - 20) / 60 + 0.25);
      const resolved = subRange(fix, i * 0.3, i * 0.3 + 0.4);
      nodes[i].setAttribute('opacity', String(flagged));
      nodes[i].setAttribute('fill', resolved > 0.5 ? palette.accent : palette.routes[3]);
      nodes[i].setAttribute('r', String(4 - resolved * 1.2));
    });

    // The step the file is standing on is the one that lights up.
    const arrivals = [upload, hop1, hop2, hop3];
    const departures = [hop1, hop2, hop3, 0];
    this.svg.selectAll<SVGTextElement, string>('.ed-step').each((_, i, nodes) => {
      const active = arrivals[i] > 0.2 && departures[i] < 0.8;
      nodes[i].setAttribute('fill', active ? palette.accentText : palette.inkMuted);
      nodes[i].setAttribute('opacity', String(arrivals[i] > 0.2 ? 1 : 0.55));
    });
  }

  destroy(): void {
    this.svg.remove();
  }
}
