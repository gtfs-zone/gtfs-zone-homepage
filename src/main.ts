// Entry point. One page, two themes.
//
// Both themes draw the same real GTFS geometry, so flipping the toggle changes
// how the site looks, never what it shows. The differences are the CSS token set
// and the VariantConfig below.

import { initPage, mountScenes } from './bootstrap';
import type { VariantConfig } from './engine/scene';
import { GeoSource } from './net/geo-source';
import { ThemeController, type ThemeName } from './theme/theme-controller';

const VARIANTS: Record<ThemeName, VariantConfig> = {
  night: {
    name: 'night',
    vehicleGlyph: 'capsule',
    showGrid: false,
    strokeWeightScale: 1,
    groundOpacity: 0.16,
    fleetPerRoute: 3,
    smoothCurves: true,
    stopLighting: true,
  },
  light: {
    name: 'blueprint',
    vehicleGlyph: 'square',
    showGrid: true,
    strokeWeightScale: 1,
    groundOpacity: 0.09,
    fleetPerRoute: 2,
    smoothCurves: false,
    stopLighting: false,
  },
};

const theme = new ThemeController();

async function start(): Promise<void> {
  initPage();

  const network = await GeoSource.load('/data/network-night.json');

  // Remount on every theme change: scenes bake palette values into DOM
  // attributes at mount time, so they cannot be repainted in place.
  theme.onChange((next) => mountScenes(VARIANTS[next], network));
  mountScenes(VARIANTS[theme.getCurrentTheme()], network);
}

// The toggle must work even if geometry never loads, so it initializes first
// and independently of the scenes.
theme.initialize();

start().catch((err) => {
  // The page is fully readable without the scenes, so a geometry failure is not fatal.
  console.error('scenes disabled:', err);
});
