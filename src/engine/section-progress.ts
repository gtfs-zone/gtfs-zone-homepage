// Per-section scroll progress. Rects are cached and invalidated on resize.

import { scrollState } from './scroll-store';

export interface SectionMetrics {
  top: number;
  height: number;
}

export interface SectionProgress {
  progress: number; // 0 when top hits viewport bottom, 1 when bottom hits viewport top
  pinProgress: number; // 0..1 across sticky travel only
  visible: boolean;
}

export class SectionTracker {
  readonly el: HTMLElement;
  private metrics: SectionMetrics = { top: 0, height: 0 };
  private pinHeight = 0;
  visible = false;

  constructor(el: HTMLElement, observer: IntersectionObserver) {
    this.el = el;
    this.measure();
    observer.observe(el);
  }

  measure(): void {
    const rect = this.el.getBoundingClientRect();
    this.metrics.top = rect.top + window.scrollY;
    this.metrics.height = rect.height;
    const pin = this.el.querySelector<HTMLElement>('.pin');
    this.pinHeight = pin ? pin.offsetHeight : 0;
  }

  read(): SectionProgress {
    const { top, height } = this.metrics;
    const vp = scrollState.viewport;
    const y = scrollState.y;

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
  if (to === from) return p >= to ? 1 : 0;
  return clamp01((p - from) / (to - from));
}

export function createSectionObserver(
  onChange: (el: Element, visible: boolean) => void
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      for (const e of entries) onChange(e.target, e.isIntersecting);
    },
    { rootMargin: '20% 0px 20% 0px' }
  );
}
