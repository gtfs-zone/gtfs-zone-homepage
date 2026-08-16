# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

The gtfs.zone homepage: a scroll-driven single page built with Vite, TypeScript,
Tailwind v4, DaisyUI, and d3. No framework. Deployed to `https://gtfs.zone`.

This repo was a Zola site through v0.0.x. Nothing of that setup remains.

## Commands

```bash
pnpm dev         # http://localhost:8080
pnpm build
pnpm typecheck
pnpm bake        # re-bake public/data/network-night.json from a GTFS feed
```

## Architecture

- **`index.html`**: the only page. Head only; the body is inlined at build time.
- **`src/page.html`**: the body markup. All copy is real text, so the page reads
  with JS disabled.
- **`vite.config.ts`**: a build plugin with four passes: inline `@include`,
  expand `@feeds` chips from `src/content/feeds.ts`, expand `@icon` glyphs from
  `src/content/icons.ts`, then stamp
  `target="_blank" rel="noopener noreferrer"` on every external anchor and **fail
  the build** if one escapes.
- **`src/content/links.ts`**: the canonical URL table. `copy.ts` imports its
  hrefs from there. Never hardcode a product URL elsewhere.
- **`src/engine/`**: one rAF ticker, a scroll store, section progress, and the
  scene registry.
- **`src/scenes/`**: one file per scene. `render(p)` must be idempotent and
  depend only on `p`.
- **`src/net/`**: geometry sources and the vehicle sim.
- **`src/theme/`**: palette token reader and the theme controller.

## Themes

One page, two themes on `<html data-theme>`: `night` and `light`. The toggle is
the moon `swap swap-rotate` control shared with the editor and the visualizer,
and it shares their `theme` localStorage key.

- Tokens live in `src/styles/tokens-night.css` and `tokens-blueprint.css`, keyed
  off `[data-theme=...]`.
- Behavioral differences live in the `VariantConfig` map in `src/main.ts`.
- Both themes use the same `GeoSource` geometry. A theme change must never change
  what the page shows, only how it looks.

Scenes read palette values in `mount()` and bake them into DOM attributes, so a
theme change calls `stopEngine()` and remounts everything. If you add a scene,
give it a working `destroy()`.

## Rules

- Scenes never hardcode colors. Read them from `Palette` (`src/theme/palette.ts`),
  which resolves CSS custom properties.
- Do not add a second HTML entry point without a reason; the single-page shape is
  deliberate.
- Never add Co-Authored-By trailers to commit messages.
- No m-dashes, in page copy, comments, or docs. Use a colon or a semicolon.

## Releasing

Deploys fire on `v*` tags, not on pushes to `main`.

```bash
cz bump                  # bumps package.json + CHANGELOG.md, commits, tags
git push --follow-tags
```

`cz bump` refuses to run off `main`. Commit messages must be conventional
commits; `.pre-commit-config.yaml` enforces this via a commitizen commit-msg hook.
`.forgejo/workflows/build.yml` typechecks, builds, and copies `dist/` to
`/sites/gtfs.zone`.
