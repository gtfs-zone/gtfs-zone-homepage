// Per-section scroll progress. Rects are cached and invalidated on resize.

import { scrollState } from './scroll-store';

export interface SectionMetrics {
  top: number;
  height: number;
}

export interface SectionProgress {
  progress: number; // 0 when the driver box's top hits the viewport bottom, 1 when its bottom hits the top
  pinProgress: number; // 0..1 across sticky travel only
  visible: boolean;
}

// Box tracking window, in viewport fractions: where the scrub starts relative to
// the viewport bottom, and where it ends relative to the viewport top.
const LEAD = 0.9;
const TAIL = 0.25;

export class SectionTracker {
  readonly el: HTMLElement;
  private readonly root: HTMLElement;
  private metrics: SectionMetrics = { top: 0, height: 0 };
  private pinHeight = 0;
  // True only while the section really scrubs a sticky pin past the viewport.
  private pinned = false;
  visible = false;

  constructor(
    el: HTMLElement,
    root: HTMLElement,
    observer: IntersectionObserver
  ) {
    this.el = el;
    this.root = root;
    this.measure();
    observer.observe(el);
  }

  measure(): void {
    const pin = this.el.querySelector<HTMLElement>('.pin');
    const vp = window.innerHeight;
    // A pin taller than the viewport has no usable travel: the browser sticks
    // its top and the rest of it never scrolls into view. A pin whose section
    // leaves it less than half a viewport of travel scrubs so fast that the
    // scene is over before it is on screen. Both fall back to box tracking.
    this.pinned =
      pin !== null &&
      getComputedStyle(pin).position === 'sticky' &&
      pin.offsetHeight <= vp + 1 &&
      this.el.offsetHeight - pin.offsetHeight >= vp * 0.5;

    // Pinned sections scrub against the section; everything else animates as
    // the scene's own box crosses the viewport, so it is never already done by
    // the time the reader reaches it.
    const driver = this.pinned ? this.el : this.root;
    const rect = driver.getBoundingClientRect();
    this.metrics.top = rect.top + window.scrollY;
    this.metrics.height = rect.height;
    this.pinHeight = this.pinned && pin ? pin.offsetHeight : 0;
  }

  read(): SectionProgress {
    const { top, height } = this.metrics;
    const vp = scrollState.viewport;
    const y = scrollState.y;

    if (!this.pinned) {
      // Box tracking runs the scrub while the scene is on screen: it starts once
      // the box is a tenth of the way up the viewport and finishes with the box
      // still a quarter of the way down it, so no beat plays off screen.
      const span = Math.max(1, height + vp * (LEAD - TAIL));
      const p = clamp01((y + vp * LEAD - top) / span);
      return { progress: p, pinProgress: p, visible: this.visible };
    }

    const span = height + vp;
    const progress = span > 0 ? clamp01((y + vp - top) / span) : 0;

    // Sticky travel is the section height minus the pinned element's height.
    const travel = Math.max(1, height - this.pinHeight);
    const pinProgress = clamp01((y - top) / travel);

    return { progress, pinProgress, visible: this.visible };
  }
}

export function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

// Maps a 0..1 value onto a sub-window of the same range, clamped.
export function subRange(p: number, from: number, to: number): number {
  if (to === from) {
    return p >= to ? 1 : 0;
  }
  return clamp01((p - from) / (to - from));
}

export function createSectionObserver(
  onChange: (el: Element, visible: boolean) => void
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        onChange(e.target, e.isIntersecting);
      }
    },
    { rootMargin: '20% 0px 20% 0px' }
  );
}
