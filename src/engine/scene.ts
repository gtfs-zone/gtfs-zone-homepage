// Scene interface, registry, and lifecycle.

import type { NetworkSource } from '../net/network-source';
import type { Palette } from '../theme/palette';
import { onTick } from './ticker';
import { initScrollStore, sampleScroll } from './scroll-store';
import { createSectionObserver, SectionTracker } from './section-progress';
import { initViewport, onResizeViewport, prefersReducedMotion, viewport, type Viewport } from './viewport';

export type VariantName = 'night' | 'blueprint';

export interface VariantConfig {
  name: VariantName;
  vehicleGlyph: 'capsule' | 'square';
  showGrid: boolean;
  glow: boolean;
  strokeWeightScale: number;
  /** Opacity the background network recedes to once text sections take over. */
  groundOpacity: number;
  /** Vehicles simulated per route. */
  fleetPerRoute: number;
  /** Round the route geometry instead of drawing straight segments. */
  smoothCurves: boolean;
  /** Brighten stops as vehicles approach. */
  stopLighting: boolean;
}

export interface SceneContext {
  network: NetworkSource;
  palette: Palette;
  variant: VariantConfig;
  reducedMotion: boolean;
}

export interface SceneProgress {
  progress: number;
  pinProgress: number;
  elapsed: number;
  viewport: Viewport;
}

export interface Scene {
  mount(root: HTMLElement, ctx: SceneContext): void;
  render(p: SceneProgress): void;
  resize?(v: Viewport): void;
  destroy?(): void;
}

interface Registration {
  scene: Scene;
  root: HTMLElement;
  tracker: SectionTracker;
  alwaysActive: boolean;
}

const registrations: Registration[] = [];
let observer: IntersectionObserver | null = null;
let ctx: SceneContext | null = null;
let stopTick: (() => void) | null = null;
let stopResize: (() => void) | null = null;
// Window-level listeners are installed once and outlive a theme swap.
let listenersInstalled = false;

export interface RegisterOptions {
  /** Section whose scroll progress drives the scene. Defaults to the root's own section. */
  section?: HTMLElement;
  /** Keep rendering even when the tracked section is offscreen (persistent background). */
  alwaysActive?: boolean;
}

export function registerScene(root: HTMLElement, scene: Scene, opts: RegisterOptions = {}): void {
  if (!observer || !ctx) throw new Error('startEngine() must run before registerScene()');
  const section = opts.section ?? root.closest<HTMLElement>('.section') ?? root;
  const tracker = new SectionTracker(section, observer);
  scene.mount(root, ctx);
  scene.resize?.(viewport);
  registrations.push({ scene, root, tracker, alwaysActive: opts.alwaysActive === true });
}

export function startEngine(context: SceneContext): void {
  if (!listenersInstalled) {
    initViewport();
    initScrollStore();
    listenersInstalled = true;
  }
  ctx = { ...context, reducedMotion: prefersReducedMotion };

  observer = createSectionObserver((el, visible) => {
    for (const r of registrations) {
      if (r.tracker.el === el) {
        r.tracker.visible = visible;
        r.root.classList.toggle('scene-active', visible);
      }
    }
  });

  stopResize = onResizeViewport((v) => {
    for (const r of registrations) {
      r.tracker.measure();
      r.scene.resize?.(v);
    }
  });

  stopTick = onTick((elapsed) => {
    sampleScroll();
    for (const r of registrations) {
      const p = r.tracker.read();
      if (!p.visible && !r.alwaysActive) continue;
      r.scene.render({
        progress: p.progress,
        pinProgress: p.pinProgress,
        elapsed,
        viewport,
      });
    }
  });
}

/**
 * Tear every scene down and release the loop. Scenes bake palette values into
 * DOM attributes at mount, so a theme change means a full remount, not a repaint.
 */
export function stopEngine(): void {
  stopTick?.();
  stopResize?.();
  stopTick = null;
  stopResize = null;

  observer?.disconnect();
  observer = null;

  for (const r of registrations) {
    r.scene.destroy?.();
    // Backstop in case a scene's destroy leaves nodes behind.
    r.root.replaceChildren();
    r.root.classList.remove('scene-active');
  }
  registrations.length = 0;
  ctx = null;
}

export function getContext(): SceneContext {
  if (!ctx) throw new Error('engine not started');
  return ctx;
}
