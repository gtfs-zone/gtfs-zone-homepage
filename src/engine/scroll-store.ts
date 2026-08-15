// Global scroll position. Written by a passive scroll listener, never reads layout.

export interface ScrollState {
  y: number;
  vy: number;
  height: number;
  viewport: number;
}

export const scrollState: ScrollState = {
  y: 0,
  vy: 0,
  height: 0,
  viewport: 0,
};

let lastY = 0;

function readLayout(): void {
  scrollState.height = document.documentElement.scrollHeight;
  scrollState.viewport = window.innerHeight;
}

function onScroll(): void {
  scrollState.y = window.scrollY;
}

// Called once per frame from the ticker, before scenes render.
export function sampleScroll(): void {
  const dy = scrollState.y - lastY;
  scrollState.vy = scrollState.vy * 0.8 + dy * 0.2;
  lastY = scrollState.y;
}

export function initScrollStore(): void {
  readLayout();
  onScroll();
  lastY = scrollState.y;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', readLayout, { passive: true });
}
