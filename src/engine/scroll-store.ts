// Global scroll position. Written by a passive scroll listener, never reads layout.

export interface ScrollState {
  y: number;
  /** y damped toward the real position. Use this to drive continuous motion. */
  ySmooth: number;
  vy: number;
  height: number;
  viewport: number;
}

export const scrollState: ScrollState = {
  y: 0,
  ySmooth: 0,
  vy: 0,
  height: 0,
  viewport: 0,
};

// Seconds to close ~63% of the gap to the real scroll position. Short enough
// that the page never feels like it is trailing the wheel.
const SMOOTH_TAU = 0.075;

let lastY = 0;
let lastSample = 0;

export function refreshLayout(): void {
  readLayout();
}

function readLayout(): void {
  scrollState.height = document.documentElement.scrollHeight;
  scrollState.viewport = window.innerHeight;
}

function onScroll(): void {
  scrollState.y = window.scrollY;
}

// Called once per frame from the ticker, before scenes render.
export function sampleScroll(): void {
  const now = performance.now();
  // Clamped so a long frame gap does not resume with one giant step.
  const dt =
    lastSample === 0 ? 1 / 60 : Math.min((now - lastSample) / 1000, 0.1);
  lastSample = now;

  const dy = scrollState.y - lastY;
  scrollState.vy = scrollState.vy * 0.8 + dy * 0.2;
  lastY = scrollState.y;

  // A wheel notch lands as one 50-120px jump. Damping turns that step into
  // continuous motion instead of a scrub that only moves every few frames.
  const gap = scrollState.y - scrollState.ySmooth;
  if (Math.abs(gap) < 0.05) {
    scrollState.ySmooth = scrollState.y;
  } else {
    scrollState.ySmooth += gap * (1 - Math.exp(-dt / SMOOTH_TAU));
  }
}

export function initScrollStore(): void {
  readLayout();
  onScroll();
  lastY = scrollState.y;
  scrollState.ySmooth = scrollState.y;
  lastSample = 0;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', readLayout, { passive: true });
}
