# AGENTS.md

The gtfs.zone homepage: a scroll-driven single page (Vite, TypeScript, d3, no
framework), deployed to `https://gtfs.zone` from `v*` tags.

## Commands

```bash
pnpm bake        # re-bake public/data/network-night.json from a GTFS feed
```

## Architecture

`index.html` is head only; `vite.config.ts` inlines `src/page.html` as the body,
expands `@feeds` and `@icon` markers, and **fails the build** if an external
anchor lacks `target="_blank" rel="noopener noreferrer"`. Sections, scenes and
themes are described in [README.md](README.md).

- All copy lives in the catalogs, `src/content/copy.ts` (English, source of the
  keys) and its translations in `src/content/copy.*.ts`; `src/page.html` reads
  it through `{{key}}` markers that the build fills with real text, so each
  locale's page must read with JS disabled. A new string goes in `copy.ts`, `copy.fr.ts` and
  `copy.de.ts`; the regional catalogs (`copy.fr-ca.ts`, `copy.de-ch.ts`) only
  hold overrides where the region's wording differs.
- Product URLs come from `src/content/links.ts` (`{{href:name}}` in
  `page.html`). Never hardcode one elsewhere.
- One HTML template (`index.html` + `src/page.html`), rendered once per locale
  (`/`, `/fr/`, `/fr-ca/`, `/de/`, `/de-ch/`). Do not add a second template
  without a reason.
- A scene's `render(p)` is idempotent and depends only on `p`.
- Scenes never hardcode copy: read it from `pageCopy()` (`src/i18n/catalogs.ts`).
  GTFS field names and enum values stay literal.
- Scenes never hardcode colors: read them from `Palette` (`src/theme/palette.ts`)
  in `mount()`. A theme change remounts every scene, so each needs a working
  `destroy()`.
- Both themes use the same `GeoSource` geometry; a theme changes how the page
  looks, never what it shows. Per-theme behavior is the `VariantConfig` map in
  `src/main.ts`.

## Conventions

- **Commits**: Conventional Commits, enforced by the `commit-msg` hook. Never
  add Co-Authored-By trailers. Setup and release are in
  [CONTRIBUTING.md](CONTRIBUTING.md).
- **Copy**: no m-dashes in page copy, comments or docs. Use a colon or a semicolon.
- **Plans**: write plans to `CURRENT_PLAN.md` at the repo root as a
  checklist (`- [ ]`), ticked off as work lands. It is neither tracked nor
  gitignored: never stage or commit it.
