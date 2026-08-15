// Single shared rAF loop. Scenes register callbacks, called in registration order.

export type TickFn = (elapsed: number) => void;

const callbacks: TickFn[] = [];
let rafId = 0;
let start = 0;

function frame(now: number): void {
  if (start === 0) start = now;
  const elapsed = (now - start) / 1000;
  for (let i = 0; i < callbacks.length; i++) callbacks[i](elapsed);
  rafId = callbacks.length > 0 ? requestAnimationFrame(frame) : 0;
}

export function onTick(fn: TickFn): () => void {
  callbacks.push(fn);
  if (rafId === 0) rafId = requestAnimationFrame(frame);
  return () => {
    const i = callbacks.indexOf(fn);
    if (i >= 0) callbacks.splice(i, 1);
    if (callbacks.length === 0 && rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
}
