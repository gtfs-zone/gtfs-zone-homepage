// Resize observation, breakpoints, reduced-motion flag.

export interface Viewport {
  width: number;
  height: number;
  isMobile: boolean;
  dpr: number;
}

export const viewport: Viewport = {
  width: 0,
  height: 0,
  isMobile: false,
  dpr: 1,
};

const MD = 768;

const reducedQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export let prefersReducedMotion = reducedQuery ? reducedQuery.matches : false;

type ResizeFn = (v: Viewport) => void;
const listeners: ResizeFn[] = [];

function measure(): void {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
  viewport.isMobile = viewport.width < MD;
  viewport.dpr = Math.min(window.devicePixelRatio || 1, 2);
}

let resizeTimer = 0;

function onResize(): void {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    measure();
    for (const fn of listeners) fn(viewport);
  }, 120);
}

export function onResizeViewport(fn: ResizeFn): () => void {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function initViewport(): void {
  measure();
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });
  reducedQuery?.addEventListener('change', (e) => {
    prefersReducedMotion = e.matches;
    for (const fn of listeners) fn(viewport);
  });
}
