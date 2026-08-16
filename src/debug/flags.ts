// Query-string overrides for the expensive parts of a variant, so a slow device
// can be bisected in place instead of one deploy per hypothesis.
//
//   ?fps=1      frame time readout in the corner
//   ?glow=0     drop the blurred route underlays
//   ?fleet=0    number of vehicles per route, 0 for none
//   ?curves=0   straight route segments instead of Catmull-Rom
//   ?stops=0    drop the per-frame stop brightening pass
//   ?grid=0     drop the background grid
//   ?blur=0     drop backdrop-filter on the plates and the theme toggle
//
// Absent a flag, every value is the variant's own, so an unflagged URL is the
// real page.

import type { VariantConfig } from '../engine/scene';

export function applyFlags(variant: VariantConfig): VariantConfig {
  const q = new URLSearchParams(location.search);
  const bool = (key: string, fallback: boolean): boolean =>
    q.has(key) ? q.get(key) !== '0' : fallback;
  const num = (key: string, fallback: number): number => {
    const v = Number(q.get(key));
    return q.has(key) && Number.isFinite(v) ? Math.max(0, Math.round(v)) : fallback;
  };

  return {
    ...variant,
    glow: bool('glow', variant.glow),
    showGrid: bool('grid', variant.showGrid),
    fleetPerRoute: num('fleet', variant.fleetPerRoute),
    smoothCurves: bool('curves', variant.smoothCurves),
    stopLighting: bool('stops', variant.stopLighting),
  };
}

/** Reads the flags that are not part of a variant. Call once, before the scenes mount. */
export function initFlags(): void {
  const q = new URLSearchParams(location.search);
  if (q.get('blur') === '0') document.documentElement.classList.add('no-backdrop');
  if (q.has('fps')) startFpsMeter();
}

// Worst frame in the window matters more than the average: a 250ms hitch and a
// steady 30fps both average out, and only one of them is what a scroll feels like.
function startFpsMeter(): void {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText =
    'position:fixed;left:0.5rem;top:0.5rem;z-index:3;padding:0.25rem 0.5rem;' +
    'font:600 12px ui-monospace,monospace;background:#000;color:#0f0;pointer-events:none';
  document.body.append(el);

  let frames = 0;
  let worst = 0;
  let windowStart = performance.now();
  let prev = windowStart;

  const loop = (now: number): void => {
    const dt = now - prev;
    prev = now;
    if (dt > worst) worst = dt;
    frames++;
    const span = now - windowStart;
    if (span >= 500) {
      el.textContent = `${Math.round((frames * 1000) / span)}fps worst ${worst.toFixed(0)}ms`;
      frames = 0;
      worst = 0;
      windowStart = now;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
