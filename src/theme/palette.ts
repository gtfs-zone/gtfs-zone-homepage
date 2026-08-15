// Typed color tokens resolved from CSS custom properties. Scenes never hardcode colors.

export interface Palette {
  bg: string;
  bgElevated: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentText: string;
  grid: string;
  routes: string[];
  strokeHairline: number;
  strokeRoute: number;
  strokeEmphasis: number;
  glowRadius: number;
}

function readVar(styles: CSSStyleDeclaration, name: string): string {
  return styles.getPropertyValue(name).trim();
}

function readNum(styles: CSSStyleDeclaration, name: string, fallback: number): number {
  const n = parseFloat(readVar(styles, name));
  return Number.isFinite(n) ? n : fallback;
}

export function readPalette(el: HTMLElement = document.documentElement): Palette {
  const s = getComputedStyle(el);
  return {
    bg: readVar(s, '--bg'),
    bgElevated: readVar(s, '--bg-elevated'),
    ink: readVar(s, '--ink'),
    inkMuted: readVar(s, '--ink-muted'),
    accent: readVar(s, '--accent'),
    accentText: readVar(s, '--accent-text'),
    grid: readVar(s, '--grid'),
    routes: [1, 2, 3, 4, 5, 6].map((i) => readVar(s, `--route-${i}`)),
    strokeHairline: readNum(s, '--stroke-hairline', 0.75),
    strokeRoute: readNum(s, '--stroke-route', 2.5),
    strokeEmphasis: readNum(s, '--stroke-emphasis', 4),
    glowRadius: readNum(s, '--glow-radius', 0),
  };
}
