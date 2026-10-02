// The operator publishes an alert and it reaches riders. Abstract actors, no chrome.

import { select, type Selection } from 'd3-selection';
import { clamp01, subRange } from '../engine/section-progress';
import { pageCopy } from '../i18n/catalogs';
import type { Scene, SceneContext, SceneProgress } from '../engine/scene';

const copy = pageCopy();

const VB_W = 800;
const VB_H = 420;

const SCREEN = { x: 44, y: 96, w: 210, h: 138 };
const BUTTON = {
  x: SCREEN.x + SCREEN.w - 90,
  y: SCREEN.y + SCREEN.h - 40,
  w: 74,
  h: 26,
};
const PHONES = [600, 672, 744].map((x) => ({ x, y: 70, w: 56, h: 104 }));
const RIDERS = [628, 700, 772];

const WIRE = `M${BUTTON.x + BUTTON.w},${BUTTON.y + BUTTON.h / 2} C 330,240 380,90 ${PHONES[1].x + 28},${PHONES[1].y + PHONES[1].h + 40}`;

export class AlertBroadcastScene implements Scene {
  private ctx!: SceneContext;
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;
  private wireNode!: SVGPathElement;
  private wireLength = 0;

  mount(root: HTMLElement, ctx: SceneContext): void {
    this.ctx = ctx;
    const { palette, variant } = ctx;
    const round = variant.name === 'night' ? 8 : 1;

    this.svg = select(root)
      .append('svg')
      .attr('aria-hidden', 'true')
      .attr('viewBox', `0 0 ${VB_W} ${VB_H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // The operator's side is the laptop itself: the alert composer, no figure.
    const op = this.svg.append('g').attr('class', 'ab-operator');
    op.append('rect')
      .attr('x', SCREEN.x - 10)
      .attr('y', SCREEN.y - 10)
      .attr('width', SCREEN.w + 20)
      .attr('height', SCREEN.h + 20)
      .attr('rx', round + 2)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.ink)
      .attr('stroke-width', palette.strokeHairline * 3);
    // Lid hinge and base, so the screen reads as a laptop and not a window.
    op.append('path')
      .attr(
        'd',
        `M${SCREEN.x - 34},${SCREEN.y + SCREEN.h + 24} L${SCREEN.x - 10},${SCREEN.y + SCREEN.h + 10} L${SCREEN.x + SCREEN.w + 10},${SCREEN.y + SCREEN.h + 10} L${SCREEN.x + SCREEN.w + 34},${SCREEN.y + SCREEN.h + 24} Z`
      )
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.ink)
      .attr('stroke-width', palette.strokeHairline * 3)
      .attr('stroke-linejoin', 'round');
    op.append('rect')
      .attr('x', SCREEN.x)
      .attr('y', SCREEN.y)
      .attr('width', SCREEN.w)
      .attr('height', SCREEN.h)
      .attr('rx', round / 2)
      .attr('fill', 'none')
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 2);

    // The composer: a header, the fields being filled, then the publish button.
    op.append('text')
      .attr('x', SCREEN.x + 14)
      .attr('y', SCREEN.y + 26)
      .attr('font-size', 9)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('letter-spacing', '0.12em')
      .attr('fill', palette.accentText)
      .text(copy.manager.scene.newAlert);
    op.append('g')
      .attr('class', 'ab-fields')
      .selectAll('rect')
      .data([0, 1, 2])
      .join('rect')
      .attr('x', SCREEN.x + 14)
      .attr('y', (d) => SCREEN.y + 42 + d * 22)
      .attr('width', (d) => [SCREEN.w - 28, SCREEN.w - 60, SCREEN.w - 96][d])
      .attr('height', 10)
      .attr('rx', 5)
      .attr('fill', palette.grid);

    const btn = this.svg.append('g').attr('class', 'ab-button');
    btn
      .append('rect')
      .attr('x', BUTTON.x)
      .attr('y', BUTTON.y)
      .attr('width', BUTTON.w)
      .attr('height', BUTTON.h)
      .attr('rx', round)
      .attr('fill', palette.accent)
      .attr('fill-opacity', 0.18)
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 2);
    btn
      .append('text')
      .attr('x', BUTTON.x + BUTTON.w / 2)
      .attr('y', BUTTON.y + 17)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('letter-spacing', '0.1em')
      .attr('fill', palette.accentText)
      .text(copy.manager.scene.publish);

    // The wire the alert travels.
    this.svg
      .append('path')
      .attr('class', 'ab-wire-base')
      .attr('d', WIRE)
      .attr('fill', 'none')
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 3);
    const lit = this.svg
      .append('path')
      .attr('class', 'ab-wire-lit')
      .attr('d', WIRE)
      .attr('fill', 'none')
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 4)
      .attr('stroke-linecap', 'round');
    this.wireNode = lit.node() as SVGPathElement;
    this.wireLength = this.wireNode.getTotalLength();
    lit.style('stroke-dasharray', `${this.wireLength}`);

    // Phones.
    const phones = this.svg
      .selectAll('g.ab-phone')
      .data(PHONES)
      .join('g')
      .attr('class', 'ab-phone');
    phones
      .append('rect')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('width', (d) => d.w)
      .attr('height', (d) => d.h)
      .attr('rx', round + 2)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.grid)
      .attr('stroke-width', palette.strokeHairline * 3);
    phones
      .append('rect')
      .attr('class', 'ab-phone-screen')
      .attr('x', (d) => d.x + 6)
      .attr('y', (d) => d.y + 12)
      .attr('width', (d) => d.w - 12)
      .attr('height', (d) => d.h - 24)
      .attr('rx', round / 2)
      .attr('fill', palette.accent)
      .attr('fill-opacity', 0.2);
    phones
      .append('rect')
      .attr('class', 'ab-phone-banner')
      .attr('x', (d) => d.x + 10)
      .attr('y', (d) => d.y + 18)
      .attr('width', (d) => d.w - 20)
      .attr('height', 22)
      .attr('rx', round / 2)
      .attr('fill', palette.accent)
      .attr('fill-opacity', 0.5);

    // Packets: one on the wire, then three fanning out to the phones.
    const packet = this.svg.append('g').attr('class', 'ab-packet');
    packet
      .append('rect')
      .attr('x', -26)
      .attr('y', -9)
      .attr('width', 52)
      .attr('height', 18)
      .attr('rx', round)
      .attr('fill', palette.accent);
    packet
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 4)
      .attr('font-size', 8)
      .attr('font-family', 'ui-monospace, monospace')
      .attr('fill', palette.bg)
      .text(copy.manager.scene.alert);

    this.svg
      .append('g')
      .attr('class', 'ab-splits')
      .selectAll('circle')
      .data(PHONES)
      .join('circle')
      .attr('r', 5)
      .attr('fill', palette.accent);

    // Riders, a simple two-pose change.
    const riders = this.svg
      .selectAll('g.ab-rider')
      .data(RIDERS)
      .join('g')
      .attr('class', 'ab-rider');
    riders
      .append('circle')
      .attr('cx', (d) => d)
      .attr('cy', 296)
      .attr('r', 9)
      .attr('fill', 'none')
      .attr('stroke', palette.inkMuted)
      .attr('stroke-width', palette.strokeHairline * 3);
    riders
      .append('path')
      .attr('class', 'ab-rider-body')
      .attr('fill', 'none')
      .attr('stroke', palette.inkMuted)
      .attr('stroke-width', palette.strokeHairline * 3);

    this.svg
      .append('text')
      .attr('class', 'ab-caption')
      .attr('x', VB_W / 2)
      .attr('y', VB_H - 24)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', palette.accentText)
      .text(copy.manager.caption);
  }

  render(p: SceneProgress): void {
    const t = p.pinProgress;
    const { palette } = this.ctx;

    const press = subRange(t, 0, 0.2);
    const travel = subRange(t, 0.2, 0.6);
    const split = subRange(t, 0.6, 0.85);
    const react = subRange(t, 0.85, 1);

    // The alert is typed out, then the button depresses.
    this.svg
      .selectAll<SVGRectElement, number>('.ab-fields rect')
      .each((d, i, nodes) => {
        const typed = subRange(press, d * 0.2, d * 0.2 + 0.5);
        nodes[i].setAttribute('opacity', String(0.35 + typed * 0.65));
        nodes[i].setAttribute(
          'fill',
          typed > 0.9 ? palette.inkMuted : palette.grid
        );
      });
    this.svg
      .select('.ab-button')
      .attr('transform', `translate(0 ${press > 0.9 ? 2 : 0})`)
      .attr('opacity', String(0.65 + press * 0.35));

    // The wire lights up behind the packet.
    this.svg
      .select('.ab-wire-lit')
      .attr('stroke-dashoffset', String(this.wireLength * (1 - travel)));

    const point = this.wireNode.getPointAtLength(this.wireLength * travel);
    this.svg
      .select('.ab-packet')
      .attr('transform', `translate(${point.x} ${point.y})`)
      .attr(
        'opacity',
        String(travel > 0 && split < 0.4 ? 1 : clamp01(1 - split * 3))
      );

    // The packet splits, one per phone.
    const end = this.wireNode.getPointAtLength(this.wireLength);
    this.svg
      .selectAll<SVGCircleElement, (typeof PHONES)[number]>('.ab-splits circle')
      .each((d, i, nodes) => {
        const target = [d.x + d.w / 2, d.y + d.h];
        const f = subRange(split, i * 0.12, 0.8 + i * 0.06);
        nodes[i].setAttribute('cx', String(end.x + (target[0] - end.x) * f));
        nodes[i].setAttribute('cy', String(end.y + (target[1] - end.y) * f));
        nodes[i].setAttribute('opacity', String(split > 0 && f < 1 ? 1 : 0));
      });

    this.svg
      .selectAll<SVGRectElement, unknown>('.ab-phone-screen')
      .each((_, i, nodes) => {
        nodes[i].setAttribute(
          'fill-opacity',
          String(0.06 + subRange(split, 0.4 + i * 0.08, 0.9) * 0.24)
        );
      });
    this.svg
      .selectAll<SVGRectElement, unknown>('.ab-phone-banner')
      .each((_, i, nodes) => {
        nodes[i].setAttribute(
          'opacity',
          String(subRange(split, 0.5 + i * 0.08, 0.95))
        );
      });

    // Riders react: shoulders lift.
    this.svg
      .selectAll<SVGPathElement, number>('.ab-rider-body')
      .each((d, i, nodes) => {
        const lift = subRange(react, i * 0.15, i * 0.15 + 0.5) * 8;
        nodes[i].setAttribute(
          'd',
          `M${d - 14},${330 - lift} C${d - 14},${306 - lift} ${d + 14},${306 - lift} ${d + 14},${330 - lift}`
        );
        nodes[i].setAttribute(
          'stroke',
          react > 0.4 ? palette.accent : palette.inkMuted
        );
      });

    this.svg
      .select('.ab-caption')
      .attr('opacity', String(subRange(react, 0.3, 1)));
  }

  destroy(): void {
    this.svg.remove();
  }
}
