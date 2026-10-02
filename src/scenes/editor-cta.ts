// A four-act flow, scrubbed left to right: a taped box opens, its rows get
// inspected, a bad stop gets dragged onto its route, the box closes again.
// Not a fake product UI. Driven by the pinned track of its section.

import { select, type Selection } from 'd3-selection';
import { subRange } from '../engine/section-progress';
import { pageCopy } from '../i18n/catalogs';
import type { Scene, SceneContext, SceneProgress } from '../engine/scene';

const copy = pageCopy();

const VB_W = 640;
// Tall enough that the type survives a 360px viewport, where the 640-unit
// viewBox renders at roughly half scale.
const VB_H = 340;
const TRACK_Y = 288;
const LABEL_Y = 326;

// The puck stops once under each step label, so the flow reads left to right.
const STATIONS = [0, 1, 2, 3].map((i) => 60 + i * ((VB_W - 120) / 3));

const CX = VB_W / 2;

// Zip block: a box whose lid hinges on its top edge, body holds the label.
const ZIP_W = 116;
const ZIP_X = CX - ZIP_W / 2;
const LID_Y = 56;
const LID_H = 26;
const BODY_Y = LID_Y + LID_H;
const BODY_H = 132;
// The lid overhangs the body, the way a box top sits over its walls.
const LID_OVER = 7;
const LID_X = ZIP_X - LID_OVER;
const LID_W = ZIP_W + LID_OVER * 2;
// One strip of tape down the middle, crossing the seam. The upper half rides
// the lid, the stub below it stays on the body, so opening the lid breaks it.
const TAPE_W = 26;
const TAPE_X = CX - TAPE_W / 2;
const TAPE_STUB = 18;

const CARD_W = 108;
const CARD_H = 120;
const CARD_Y = 74;
const CARD_SPREAD = 178;
const CARDS = [
  { label: 'stops.txt', off: -1 },
  { label: 'routes.txt', off: 0 },
  { label: 'trips.txt', off: 1 },
];

// Table: a real stop table, so this act reads as GTFS and not as a document.
const TABLE_X = 40;
const TABLE_W = 560;
const COLS = [40, 140, 290, 420];
const HEAD = ['stop_id', 'stop_name', 'stop_lat', 'stop_lon'];
const ROWS = [
  { id: '1042', name: 'Main & 5th', lat: '45.5231', lon: '-122.6765' },
  { id: '1043', name: 'Main & 7th', lat: '45.5256', lon: '' },
  { id: '1044', name: 'Elm & Park', lat: '45.5290', lon: '-122.6698' },
  { id: '1045', name: 'Elm & 12th', lat: '91.2481', lon: '-122.6650' },
];
const ROW_Y = [108, 142, 176, 210];
// Act 3 keeps the two flagged rows and drops them under the map.
const ROW_SHIFT = [0, 54, 0, 20];
const FLAGS = [
  { row: 1, x: 414, w: 116 }, // blank stop_lon
  { row: 3, x: 284, w: 104 }, // stop_lat out of range
];
// What act 3 writes back: the blank cell gets a value, the out of range lat
// gets a plausible one.
const FILL = { row: 1, col: 3, value: '-122.6721' };
const LAT_FIXED = '45.5312';

const ROUTE: Array<[number, number]> = [
  [120, 138],
  [180, 118],
  [250, 112],
  [320, 88],
  [390, 96],
  [455, 60],
  [520, 44],
];
const LOOSE_FROM: [number, number] = [292, 148];
const LOOSE_TO: [number, number] = ROUTE[3];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class EditorCtaScene implements Scene {
  private ctx!: SceneContext;
  private svg!: Selection<SVGSVGElement, unknown, null, undefined>;

  mount(root: HTMLElement, ctx: SceneContext): void {
    this.ctx = ctx;
    const { palette, variant } = ctx;
    const rx = variant.name === 'night' ? 6 : 1;
    const hair = palette.strokeHairline * 2;
    const mono = 'ui-monospace, monospace';

    this.svg = select(root)
      .append('svg')
      .attr('aria-hidden', 'true')
      .attr('viewBox', `0 0 ${VB_W} ${VB_H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    // Act 2: the table. Built first so the zip and cards sit over it.
    const table = this.svg.append('g').attr('class', 'ed-table');
    // The header goes out on its own, so the map does not sit on top of it.
    const head = table.append('g').attr('class', 'ed-head');
    head
      .append('g')
      .selectAll('text')
      .data(HEAD)
      .join('text')
      .attr('x', (_, i) => COLS[i])
      .attr('y', 64)
      .attr('font-size', 12)
      .attr('font-family', mono)
      .attr('fill', palette.accentText)
      .text((d) => d);
    head
      .append('line')
      .attr('x1', TABLE_X)
      .attr('x2', TABLE_X + TABLE_W)
      .attr('y1', 76)
      .attr('y2', 76)
      .attr('stroke', palette.grid)
      .attr('stroke-width', hair);

    ROWS.forEach((r, i) => {
      const row = table.append('g').attr('class', 'ed-row');
      const flag = FLAGS.find((f) => f.row === i);
      if (flag) {
        row
          .append('rect')
          .attr('class', 'ed-flag')
          .attr('x', flag.x)
          .attr('y', ROW_Y[i] - 21)
          .attr('width', flag.w)
          .attr('height', 30)
          .attr('rx', rx / 2)
          .attr('fill-opacity', 0.16)
          .attr('stroke-width', hair);
      }
      [r.id, r.name, r.lat, r.lon].forEach((cell, c) => {
        if (!cell) {
          return;
        }
        const bad = i === 3 && c === 2;
        row
          .append('text')
          .attr('class', bad ? 'ed-bad-cell' : null)
          .attr('x', COLS[c])
          .attr('y', ROW_Y[i])
          .attr('font-size', 13)
          .attr('font-family', mono)
          .attr('fill', palette.ink)
          .text(cell);
      });
      // The value the drag writes into the blank cell.
      if (i === FILL.row) {
        row
          .append('text')
          .attr('class', 'ed-fill')
          .attr('x', COLS[FILL.col])
          .attr('y', ROW_Y[i])
          .attr('font-size', 13)
          .attr('font-family', mono)
          .attr('fill', palette.accent)
          .text(FILL.value);
      }
    });

    // Act 3: the map the bad stop gets dragged onto.
    const map = this.svg.append('g').attr('class', 'ed-map');
    map
      .append('polyline')
      .attr('points', ROUTE.map(([x, y]) => `${x},${y}`).join(' '))
      .attr('fill', 'none')
      .attr('stroke', palette.routes[1])
      .attr('stroke-width', palette.strokeRoute)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');
    map
      .append('g')
      .selectAll('circle')
      .data(ROUTE.filter((_, i) => i !== 3))
      .join('circle')
      .attr('cx', (d) => d[0])
      .attr('cy', (d) => d[1])
      .attr('r', 5)
      .attr('fill', palette.bg)
      .attr('stroke', palette.ink)
      .attr('stroke-width', hair);
    map
      .append('circle')
      .attr('class', 'ed-loose')
      .attr('r', 6)
      .attr('fill', palette.bg)
      .attr('stroke-width', palette.strokeHairline * 3);

    // Act 1 and 4: the file cards.
    const cards = this.svg.append('g').attr('class', 'ed-cards');
    CARDS.forEach((c) => {
      const card = cards.append('g').attr('class', 'ed-card');
      card
        .append('rect')
        .attr('x', -CARD_W / 2)
        .attr('y', 0)
        .attr('width', CARD_W)
        .attr('height', CARD_H)
        .attr('rx', rx)
        .attr('fill', palette.bgElevated)
        .attr('stroke', palette.ink)
        .attr('stroke-width', hair);
      for (let i = 0; i < 4; i++) {
        card
          .append('line')
          .attr('x1', -CARD_W / 2 + 12)
          .attr('x2', CARD_W / 2 - 12)
          .attr('y1', 26 + i * 16)
          .attr('y2', 26 + i * 16)
          .attr('stroke', palette.grid)
          .attr('stroke-width', hair);
      }
      card
        .append('text')
        .attr('x', 0)
        .attr('y', CARD_H - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('font-family', mono)
        .attr('fill', palette.inkMuted)
        .text(c.label);
    });

    // Act 1 and 4: the zip block itself.
    const zip = this.svg.append('g').attr('class', 'ed-zip');
    zip
      .append('rect')
      .attr('x', ZIP_X)
      .attr('y', BODY_Y)
      .attr('width', ZIP_W)
      .attr('height', BODY_H)
      .attr('rx', rx)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.ink)
      .attr('stroke-width', hair);
    zip
      .append('text')
      .attr('x', CX)
      .attr('y', 152)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-family', mono)
      .attr('fill', palette.ink)
      .text('GTFS.zip');
    // The stub of tape left on the body once the lid lifts away.
    zip
      .append('rect')
      .attr('x', TAPE_X)
      .attr('y', BODY_Y)
      .attr('width', TAPE_W)
      .attr('height', TAPE_STUB)
      .attr('fill', palette.grid)
      .attr('stroke', palette.inkMuted)
      .attr('stroke-width', hair);

    const lid = zip.append('g').attr('class', 'ed-lid');
    lid
      .append('rect')
      .attr('x', LID_X)
      .attr('y', LID_Y)
      .attr('width', LID_W)
      .attr('height', LID_H)
      .attr('rx', rx)
      .attr('fill', palette.bgElevated)
      .attr('stroke', palette.ink)
      .attr('stroke-width', hair);
    // The tape that holds the lid down, torn off level with the seam.
    lid
      .append('rect')
      .attr('x', TAPE_X)
      .attr('y', LID_Y + 4)
      .attr('width', TAPE_W)
      .attr('height', LID_H - 4)
      .attr('fill', palette.grid)
      .attr('stroke', palette.inkMuted)
      .attr('stroke-width', hair);

    // The inspection sweep, over the table.
    this.svg
      .append('rect')
      .attr('class', 'ed-sweep')
      .attr('y', 44)
      .attr('width', 3)
      .attr('height', 186)
      .attr('fill', palette.accent);

    // The issue count, which survives from the sweep to the fix.
    const badge = this.svg.append('g').attr('class', 'ed-badge');
    badge
      .append('text')
      .attr('class', 'ed-badge-open')
      .attr('x', TABLE_X + TABLE_W)
      .attr('y', 32)
      .attr('text-anchor', 'end')
      .attr('font-size', 12)
      .attr('font-family', mono)
      .attr('fill', palette.routes[3])
      .text(copy.editor.scene.issuesOpen);
    badge
      .append('text')
      .attr('class', 'ed-badge-clear')
      .attr('x', TABLE_X + TABLE_W)
      .attr('y', 32)
      .attr('text-anchor', 'end')
      .attr('font-size', 12)
      .attr('font-family', mono)
      .attr('fill', palette.accent)
      .text(copy.editor.scene.issuesClear);

    // Act 4: the export mark.
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
    out
      .append('path')
      .attr('d', 'M26,2 L31,8 L42,-6')
      .attr('fill', 'none')
      .attr('stroke', palette.accent)
      .attr('stroke-width', palette.strokeHairline * 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');

    // The track and its stations, under everything.
    this.svg
      .append('line')
      .attr('x1', 20)
      .attr('x2', VB_W - 20)
      .attr('y1', TRACK_Y)
      .attr('y2', TRACK_Y)
      .attr('stroke', palette.grid)
      .attr('stroke-width', hair);
    this.svg
      .append('g')
      .selectAll('line')
      .data(STATIONS)
      .join('line')
      .attr('x1', (d) => d)
      .attr('x2', (d) => d)
      .attr('y1', TRACK_Y - 5)
      .attr('y2', TRACK_Y + 5)
      .attr('stroke', palette.grid)
      .attr('stroke-width', hair);
    this.svg
      .append('circle')
      .attr('class', 'ed-puck')
      .attr('cy', TRACK_Y)
      .attr('r', 5)
      .attr('fill', palette.accent);
    this.svg
      .append('g')
      .selectAll('text')
      .data(copy.editor.steps)
      .join('text')
      .attr('class', 'ed-step')
      .attr('x', (_, i) => STATIONS[i])
      .attr('y', LABEL_Y)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('font-family', mono)
      .attr('letter-spacing', '0.12em')
      .attr('fill', palette.inkMuted)
      .text((d) => d.toUpperCase());
  }

  render(p: SceneProgress): void {
    // Scrubbed on the pinned track, so the whole flow plays out while the
    // graphic is held in the middle of the screen. The padding at each end
    // leaves the box sitting closed as the section arrives and departs.
    const t = subRange(p.pinProgress, 0.06, 0.94);
    const { palette, reducedMotion } = this.ctx;
    // Reduced motion holds each act at its end state instead of tweening it.
    const q = (v: number): number => (reducedMotion ? (v >= 0.5 ? 1 : 0) : v);

    const a1 = q(subRange(t, 0.02, 0.26));
    const hop1 = q(subRange(t, 0.26, 0.3));
    const a2 = q(subRange(t, 0.3, 0.55));
    const hop2 = q(subRange(t, 0.55, 0.59));
    const a3 = q(subRange(t, 0.59, 0.82));
    const hop3 = q(subRange(t, 0.82, 0.86));
    const a4 = q(subRange(t, 0.86, 1));

    // Act 1: the zip drops in, its lid hinges open, the cards fan out.
    const drop = subRange(a1, 0, 0.35);
    const open = subRange(a1, 0.4, 0.62);
    const fan = subRange(a1, 0.62, 1);

    // Act 2: the cards collapse into the table, the sweep flags two cells.
    const collapse = subRange(a2, 0.05, 0.25);
    const tableIn = subRange(a2, 0.1, 0.28);
    const sweep = subRange(a2, 0.35, 0.85);

    // Act 3: the map takes over, the loose stop lands, the cells clear.
    const mapIn = subRange(a3, 0.1, 0.3);
    const rowShift = subRange(a3, 0.05, 0.3);
    const drag = subRange(a3, 0.4, 0.7);
    const fixed = subRange(a3, 0.68, 0.78);

    // Act 4: act 1 run backwards. The cards fan back in, the lid hinges shut,
    // the zip lifts back out the way it dropped in.
    const clear = subRange(a4, 0, 0.12);
    const zipBack = subRange(a4, 0.06, 0.22);
    const restack = subRange(a4, 0.02, 0.16);
    const unfan = 1 - subRange(a4, 0.16, 0.44); // mirrors fan
    const tuckAway = subRange(a4, 0.36, 0.48);
    const close = subRange(a4, 0.48, 0.7); // mirrors open
    const leave = subRange(a4, 0.75, 1); // mirrors drop
    const exported = subRange(a4, 0.78, 1);

    const inExport = a4 > 0;

    // Zip.
    const zipOpacity = inExport ? zipBack * (1 - leave) : drop * (1 - collapse);
    const zipDy = (inExport ? leave : 1 - drop) * -70;
    const lidOpen = inExport ? 1 - close : open;
    this.svg
      .select('.ed-zip')
      .attr('transform', `translate(0 ${zipDy})`)
      .attr('opacity', String(zipOpacity));
    // Faking the hinge with a vertical flip about the lid's top edge.
    const k = 1 - 1.6 * lidOpen;
    this.svg
      .select('.ed-lid')
      .attr(
        'transform',
        `translate(0 ${LID_Y}) scale(1 ${k}) translate(0 ${-LID_Y})`
      );

    // Cards.
    const cardOpacity = inExport
      ? restack * (1 - tuckAway)
      : fan * (1 - collapse);
    const cardSpread = inExport ? unfan : fan * (1 - collapse);
    this.svg.select('.ed-cards').attr('opacity', String(cardOpacity));
    this.svg.selectAll<SVGGElement, unknown>('.ed-card').each((_, i, nodes) => {
      const c = CARDS[i];
      const x = CX + c.off * CARD_SPREAD * cardSpread;
      const rot = c.off * 8 * cardSpread;
      nodes[i].setAttribute(
        'transform',
        `translate(${x} ${CARD_Y}) rotate(${rot} 0 ${CARD_H / 2})`
      );
    });

    // Table. The header leaves with the unflagged rows, so the map never
    // covers it.
    this.svg.select('.ed-table').attr('opacity', String(tableIn * (1 - clear)));
    this.svg.select('.ed-head').attr('opacity', String(1 - rowShift));
    this.svg.selectAll<SVGGElement, unknown>('.ed-row').each((_, i, nodes) => {
      const flagged = FLAGS.some((f) => f.row === i);
      nodes[i].setAttribute('opacity', String(flagged ? 1 : 1 - rowShift));
      nodes[i].setAttribute(
        'transform',
        `translate(0 ${ROW_SHIFT[i] * rowShift})`
      );
    });
    const issueColor = fixed > 0.5 ? palette.accent : palette.routes[3];
    this.svg
      .selectAll<SVGRectElement, unknown>('.ed-flag')
      .each((_, i, nodes) => {
        const f = FLAGS[i];
        const at = (f.x - TABLE_X) / TABLE_W;
        nodes[i].setAttribute(
          'opacity',
          String(subRange(sweep, at, at + 0.15))
        );
        nodes[i].setAttribute('fill', issueColor);
        nodes[i].setAttribute('stroke', issueColor);
      });
    // The fix writes both cells back: the blank one gets a value, the out of
    // range lat gets a real one.
    const done = fixed > 0.5;
    this.svg
      .select('.ed-bad-cell')
      .attr('fill', sweep > 0.6 ? issueColor : palette.ink)
      .text(done ? LAT_FIXED : ROWS[3].lat);
    this.svg.select('.ed-fill').attr('opacity', String(fixed));

    const sweeping = sweep > 0 && sweep < 1;
    this.svg
      .select('.ed-sweep')
      .attr('x', TABLE_X + sweep * TABLE_W)
      .attr('opacity', String(sweeping ? 1 : 0));

    // Map.
    this.svg.select('.ed-map').attr('opacity', String(mapIn * (1 - clear)));
    this.svg
      .select('.ed-loose')
      .attr('cx', lerp(LOOSE_FROM[0], LOOSE_TO[0], drag))
      .attr('cy', lerp(LOOSE_FROM[1], LOOSE_TO[1], drag))
      .attr('stroke', issueColor);

    // Badge.
    const badgeOpacity =
      subRange(sweep, 0.75, 1) * (1 - subRange(a4, 0.15, 0.3));
    this.svg.select('.ed-badge').attr('opacity', String(badgeOpacity));
    this.svg
      .select('.ed-badge-open')
      .attr('opacity', String(fixed > 0.5 ? 0 : 1));
    this.svg
      .select('.ed-badge-clear')
      .attr('opacity', String(fixed > 0.5 ? 1 : 0));

    // Export mark.
    this.svg
      .select('.ed-export')
      .attr('transform', `translate(${CX} ${248 + (1 - exported) * -8})`)
      .attr('opacity', String(exported));

    // The station the puck is standing on is the one that lights up.
    const center =
      STATIONS[0] +
      hop1 * (STATIONS[1] - STATIONS[0]) +
      hop2 * (STATIONS[2] - STATIONS[1]) +
      hop3 * (STATIONS[3] - STATIONS[2]);
    this.svg
      .select('.ed-puck')
      .attr('cx', center)
      .attr('opacity', String(Math.min(a1 * 4, 1)));

    const arrivals = [subRange(a1, 0, 0.2), hop1, hop2, hop3];
    const departures = [hop1, hop2, hop3, 0];
    this.svg
      .selectAll<SVGTextElement, string>('.ed-step')
      .each((_, i, nodes) => {
        const active = arrivals[i] > 0.2 && departures[i] < 0.8;
        nodes[i].setAttribute(
          'fill',
          active ? palette.accentText : palette.inkMuted
        );
        nodes[i].setAttribute('opacity', String(arrivals[i] > 0.2 ? 1 : 0.55));
      });
  }

  destroy(): void {
    this.svg.remove();
  }
}
