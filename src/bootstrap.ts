// Page wiring, split in two:
//
//   initPage()     runs once. Parallax, reveal observers, anything that survives
//                  a theme change.
//   mountScenes()  runs on every theme change. Scenes bake palette values into
//                  DOM attributes at mount time, so switching themes is a full
//                  teardown and remount, not a repaint.

import './styles/main.css';
import { registerScene, startEngine, stopEngine, type VariantConfig } from './engine/scene';
import { onTick } from './engine/ticker';
import { scrollState } from './engine/scroll-store';
import { clamp01 } from './engine/section-progress';
import { readPalette } from './theme/palette';
import type { NetworkSource } from './net/network-source';
import { HeroMapScene } from './scenes/hero-map';
import { TimetableScene } from './scenes/timetable';
import { RealtimePhoneScene } from './scenes/realtime-phone';
import { EditorToolsScene } from './scenes/editor-tools';
import { EditorCtaScene } from './scenes/editor-cta';
import { VisualizerInspectorScene } from './scenes/visualizer-inspector';
import { AlertBroadcastScene } from './scenes/alert-broadcast';
import { PublishScene } from './scenes/publish';

const SCENES = {
  timetable: TimetableScene,
  'realtime-phone': RealtimePhoneScene,
  'editor-tools': EditorToolsScene,
  'editor-cta': EditorCtaScene,
  'visualizer-inspector': VisualizerInspectorScene,
  'alert-broadcast': AlertBroadcastScene,
  publish: PublishScene,
} as const;

type SceneKey = keyof typeof SCENES;

function heroParallax(): void {
  const overlay = document.getElementById('hero-overlay');
  const cue = document.getElementById('scroll-cue');
  if (!overlay) return;

  onTick(() => {
    const p = clamp01(scrollState.y / Math.max(1, scrollState.viewport));
    // Overlay moves faster than the map, separating text from ground.
    overlay.style.transform = `translate3d(0, ${-p * 140}px, 0)`;
    overlay.style.opacity = String(1 - clamp01(p * 1.6));
    if (cue) cue.style.opacity = String(1 - clamp01(p / 0.15));
  });
}

function revealOnEnter(): void {
  const targets = document.querySelectorAll<HTMLElement>('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -15% 0px' }
  );
  targets.forEach((t) => io.observe(t));
}

/** One-time page wiring. Safe to call only once. */
export function initPage(): void {
  document.documentElement.classList.add('js');
  heroParallax();
  revealOnEnter();
}

/** Tear down any live scenes and mount a fresh set for the given variant. */
export function mountScenes(variant: VariantConfig, network: NetworkSource): void {
  stopEngine();

  startEngine({
    network,
    palette: readPalette(),
    variant,
    reducedMotion: false, // set from the media query inside startEngine
  });

  const stage = document.querySelector<HTMLElement>('.stage[data-scene="hero-map"]');
  const hero = document.getElementById('hero');
  if (stage && hero) {
    // The background network persists past its own section, so it keeps rendering.
    registerScene(stage, new HeroMapScene(), { section: hero, alwaysActive: true });
  }

  document.querySelectorAll<HTMLElement>('[data-scene]').forEach((el) => {
    const key = el.dataset.scene as SceneKey | 'hero-map' | undefined;
    if (!key || key === 'hero-map') return;
    const Ctor = SCENES[key];
    if (!Ctor) return;
    // Opt-in: drive the scene from its own box instead of the enclosing section.
    const self = el.dataset.sceneTrack === 'self';
    registerScene(el, new Ctor(), self ? { section: el } : {});
  });
}
