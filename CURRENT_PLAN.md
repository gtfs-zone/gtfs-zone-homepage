# Current plan

The one live plan for this repo. `docs/HOMEPAGE_BUILD_PLAN.md`,
`docs/HOMEPAGE_REVISION_PLAN.md`, and `docs/LANDING_ZONE_PLAN.md` were deleted;
`docs/VERIFICATION.md` stays, since it records what was checked against the
deployed products rather than what to build next.

Branch: `fix/landing-polish`.

Seven items. They are independent, so each can land as its own conventional
commit.

---

## 1. The background washes out "What is GTFS"

**Now.** `HeroMapScene.render` scrubs the zoom off `heroP` over one viewport,
then fades on a separate `recede` ramp that bottoms out at `1 - 0.72 = 0.28`
opacity. 0.28 of a full-bleed network under body copy is too much, and the
blueprint variant is worse than night because its grid lines and paper ground
are bright to begin with.

**Change.**

- Keep the zoom climbing past the hero instead of stopping at one viewport, and
  drive the fade off the same curve, so the network reads as receding into the
  distance rather than as a layer being switched off.
- Add `groundOpacity: number` to `VariantConfig` in `src/engine/scene.ts` and set
  it per theme in `src/main.ts` (night lower, blueprint lower still). That is the
  floor `recede` fades to, replacing the hardcoded `0.72`.
- Drop `routeOpacity` on the same curve so the route strokes desaturate with the
  ground rather than staying near full.

**Files.** `src/scenes/hero-map.ts`, `src/engine/scene.ts`, `src/main.ts`.

**Check.** Scroll to `#what-is-gtfs` in both themes and read the `dl` items.
Hero must be unchanged at scroll 0.

---

## 2. SVG icons on the "term -- description" lists

Every list that currently reads `<b>Term</b> -- description` gets a leading
glyph, in the same stroke language as the existing `.os-glyph` marks (24 or 32
box, `fill: none`, `stroke: currentColor`, hairline weight, round caps).

**Where.**

| Section | Items |
|---|---|
| `#scheduled` | Routes and stops, Schedules and frequencies, Fares, Flexible services, Pathways |
| `#realtime` | Vehicle positions, Trip updates, Service alerts |
| `#manager` | Feeds, Service alerts, Vehicle tracking, Trip updates |
| `#manager` hardware | Traccar, supported devices, driver phone |
| `#visualizer` | the four bullets, replacing `list-disc` |

**How.** Do not paste raw SVG into `page.html` five times. Add a fourth pass to
the vite plugin, alongside `@include` and `@feeds`: a `<!-- @icon name -->`
directive expanded from a new `src/content/icons.ts` map of name to path markup.
Same shape as the existing directives, one definition per glyph, and the pass
order stays `@include` then `@feeds` then `@icon` then the external-anchor stamp.

Add a `.list-glyph` rule in `src/styles/main.css` (accent colored, sized, flex
row alignment with the text block). Icons are decorative, so `aria-hidden="true"`
and no `role`.

**Files.** `src/content/icons.ts` (new), `vite.config.ts`, `src/page.html`,
`src/styles/main.css`.

**Check.** `pnpm build` still passes the anchor assertion; lists stay readable
with JS off; wrapping is sane at 360px wide.

---

## 3. Publish scene: the maps are too zoomed in

`PublishScene.resize` fits the whole network bbox into the frame with 12px of
padding, so the routes run edge to edge and read as noise at that size.

**Change.** Scale the fitted `k` down by a fill factor of roughly 0.6 and
recenter, so each frame shows the network as a small map with air around it.
Keep stop radius and vehicle size as they are; they get relatively larger, which
is what makes the vehicles legible at frame size.

**Files.** `src/scenes/publish.ts`.

---

## 4. Publish: link out to the apps instead of drawing their logos

Decision: no third-party logos anywhere. No trademark exposure, and the page art
stays one visual system.

Instead, the publish section gets real links to the destinations.

- Add to `src/content/links.ts`: `googleMaps` (`https://www.google.com/maps`),
  `appleMaps` (`https://maps.apple.com`), `transitApp`
  (`https://transitapp.com`), `motis` (`https://motis-project.de`). `links.ts`
  stays the only place a product URL is written.
- Add a `destinationLinks` list to `copy.publish` in `src/content/copy.ts`,
  sourcing its hrefs from `links.ts`.
- In `src/page.html`, under the publish scene, add a linked row of the four
  destinations. Text labels only. The vite plugin stamps
  `target="_blank" rel="noopener noreferrer"` on them automatically.
- Leave the three in-scene frame titles as they are.

**Files.** `src/content/links.ts`, `src/content/copy.ts`, `src/page.html`.

---

## 5. UPLOAD / INSPECT / FIX / EXPORT gets literal

Rewrite `src/scenes/editor-cta.ts`. Keep the one continuous left-to-right track
and the four station labels; replace the generic file-with-dots with four real
acts. `VB_H` grows from 190 to roughly 300.

**Act 1, UPLOAD.** A `GTFS.zip` block drops onto the first station: rounded rect,
zip teeth down one edge, mono label. Its lid hinges open and three file cards fan
out of it, labelled `stops.txt`, `routes.txt`, `trips.txt`.

**Act 2, INSPECT.** The cards collapse into one GTFS table: a header row
`stop_id  stop_name  stop_lat  stop_lon` and four data rows with plausible
values. The existing sweep bar passes over it and leaves two cells flagged
behind it (a blank `stop_lon`, an out-of-range `stop_lat`), with a `2 issues`
badge. This is the act that has to read as GTFS specifically, not as a generic
document.

**Act 3, FIX.** The table gives way to a mini map: one route polyline, stops
along it, and one stop sitting off the line. It drags onto the line, the flagged
cells clear to the accent color, and the badge counts down to `0 issues`.

**Act 4, EXPORT.** The three file cards restack, the zip closes over them, and
the existing download arrow and baseline land under it with a check.

**Constraints, unchanged from the scene contract.**

- Everything is built in `mount()`; `render(p)` only sets attributes.
- `render(p)` stays idempotent and a pure function of `p` -- scrubbing backwards
  must play the flow backwards, so no act may latch state.
- No color literals. Everything from `Palette`.
- Reduced motion holds each act at its end state rather than animating between
  them.
- `destroy()` removes the svg, as now.

**Files.** `src/scenes/editor-cta.ts`, and `copy.editor.steps` stays as is.

**Check.** Scrub slowly in both directions in both themes. Legible at 360px
wide, where the 640-unit viewBox means an 11px label renders around 6px --
bump the type in this scene if that fails.

---

## 6. Mobile jumpiness under a dark-mode extension

Firefox for Android with a dark-mode extension is jumpy on the deployed site;
the desktop responsive emulator is not, which points at the extension rather
than at the layout. These extensions install a `MutationObserver` and re-tint on
every DOM change. The scenes rewrite SVG attributes every animation frame, so
the observer fires continuously and the extension's work lands on top of ours.

**Fix: opt the page out.** The site already ships a real dark theme, so the
extension has nothing to add.

- `index.html`: add `<meta name="darkreader-lock" content="">` and
  `<meta name="color-scheme" content="dark light">`.
- Add `color-scheme: dark` to `[data-theme='night']` in `tokens-night.css` and
  `color-scheme: light` to `tokens-blueprint.css`, so form controls and
  scrollbars follow the toggle rather than the OS.

**Caveat to verify, not assume.** The lock meta is honored by Dark Reader and
its forks. If the extension on the device ignores it, this does nothing, and the
fallback is item 7. Test on the actual phone before calling it fixed, and tell
me which extension it is if it does not take.

**Files.** `index.html`, `src/styles/tokens-night.css`,
`src/styles/tokens-blueprint.css`.

---

## 7. Fallback if the lockout does not take

Not doing this yet. Listed so the next step is known if item 6 fails on the
device: cut the per-frame mutation load the extension reacts to -- drop the SVG
glow filter on mobile, cap the hero fleet size, drop `backdrop-filter` off
`.plate` and `.theme-toggle` under 768px, and batch scene attribute writes so a
frame touches the DOM once.

---

## Verification for the whole branch

```bash
pnpm typecheck
pnpm build
pnpm dev     # both themes, desktop and 360px, scrub every section in both directions
```

Then on the phone, with the dark-mode extension on and off.

Commits are conventional commits (`.pre-commit-config.yaml` enforces it), no
`Co-Authored-By` trailers, and release is `cz bump` off `main` as usual -- so
this branch merges to `main` before any version bump.
