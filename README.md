# gtfs-zone-homepage

The gtfs.zone homepage. Deployed to `https://gtfs.zone`.

A scroll-driven single page: Vite, TypeScript, Tailwind v4, DaisyUI, and d3 for
the scene geometry. No framework.

## Commands

```
pnpm install
pnpm dev         # http://localhost:8080
pnpm build
pnpm check       # typecheck, eslint, knip
pnpm format
pnpm bake                          # re-bake public/data/network-night.json from MBTA
pnpm bake ./path/to/feed.zip
pnpm bake <source> --types=0,1     # keep only those GTFS route_types
```

The committed geometry is MBTA rapid transit (`--types=0,1`): 16 routes, 86
stations, 25 KB, with the agency's own route colors.

## Themes

One page, two themes, switched by the moon toggle in the top right. The control
is the same `swap swap-rotate` markup and the same `theme-controller` contract
used by the editor and the visualizer, and it shares their `theme` localStorage
key.

- `night` dark, glowing strokes, continuous vehicles
- `light` warm paper, hairlines, grid, snapping vehicles

Both themes draw the same real GTFS geometry, so the toggle changes how the site
looks, never what it shows. The differences are exactly two things: the CSS token
set (`src/styles/tokens-*.css`) and the `VariantConfig` in `src/main.ts`.

Scenes bake palette values into DOM attributes when they mount, so a theme change
tears every scene down and remounts it (`stopEngine()` in `src/engine/scene.ts`).
Window-level listeners are installed once and survive the swap.

## The products

The page treats the first two as peers, and links both everywhere.

| Tool | URL | Repo |
|---|---|---|
| Editor | `https://edit.gtfs.zone` | `gtfs-zone-editor` |
| Visualizer | `https://viz.rt.gtfs.zone` | `rt-viewer` |
| Manager | `https://manage.rt.gtfs.zone` | `rt-manager` |
| Feed map | `https://list.gtfs.zone` | `feed-list` |

## How it fits together

- `src/page.html` is the body markup. A small Vite plugin inlines it into
  `index.html`.
- The same plugin expands `<!-- @feeds editor -->` and `<!-- @feeds visualizer -->`
  from `src/content/feeds.ts`, so the editor chips and the visualizer chips are
  built from one feed list.
- It then stamps `target="_blank" rel="noopener noreferrer"` onto every external
  anchor and **fails the build** if one escapes. Nobody has to remember the rule
  per-anchor.
- `src/content/links.ts` is the canonical URL table. Labels and prose live in the
  catalogs, never in `page.html`.
- Motion is a pure function of scroll offset. Every scene's `render(p)` is
  idempotent and depends only on `p`. Time-based ambient motion uses `p.elapsed`
  and a deterministic seed.
- One rAF loop drives everything (`src/engine/ticker.ts`). Offscreen scenes do not
  render. The background network is the one exception and always renders.

## Languages

The page is built once per locale: English at `/`, French at `/fr/`. Both come
from the same `index.html` and `src/page.html`; the build fills them from
`src/content/copy.ts` (English, the source of truth for the keys) or
`src/content/copy.fr.ts`, which is typed against it, so a missing or extra French
key is a type error.

`page.html` uses three markers, and the build fails on an unknown or unfilled
one:

- `{{section.key}}`: a catalog string, HTML-escaped. Array items by index, e.g.
  `{{scheduled.features.0.term}}`.
- `{{href:name}}`: a URL from `links.ts`.
- `{{page:name}}`: a per-locale value (`lang`, `url`, `otherPath`, ...).

Scenes read their strings from the catalog matching `<html lang>`
(`pageCopy()` in `src/i18n/catalogs.ts`). GTFS field names and enum values are
never translated.

The `EN`/`FR` control next to the theme toggle is a plain link to the other
page. With JS it also stores the choice in a `locale` cookie on `.gtfs.zone`,
the same preference the apps read. A visit to `/` whose stored preference, or
with none stored whose browser language, is French is redirected to `/fr/` by
a small inline script; without JS every page stays where it is.

## Sections and scenes

| Section | Scene |
|---|---|
| Hero | `hero-map` (persistent background) |
| What is GTFS? | none, text only |
| GTFS Schedule | `timetable` |
| GTFS Realtime | `realtime-phone` |
| The editor | `editor-tools`, `editor-cta` |
| The visualizer | `visualizer-inspector` |
| The manager | `alert-broadcast` |
| Publish | `publish` |
| Open source | none, static SVG glyphs |
| Get in touch | none |

## Releasing

Deploys are triggered by tags, not by pushes to `main`. Push to `main` freely;
nothing ships until a tag exists.

```
cz bump          # updates package.json + CHANGELOG.md, commits, tags vX.Y.Z
git push origin main --tags
```

`cz bump` refuses to run off `main`. The `v*` tag fires
`.github/workflows/pages.yml`, which typechecks, builds and publishes `dist/` to
GitHub Pages.

## History

`docs/VERIFICATION.md` records what was checked against the deployed products.
