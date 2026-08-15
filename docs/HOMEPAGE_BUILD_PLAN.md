# gtfs.zone homepage: build plan

A scroll-reactive marketing homepage for gtfs.zone. Every visual is drawn from
SVG/D3 primitives placed and styled by hand. No screenshots, no stock imagery,
no video. Motion is a pure function of scroll offset.

Two complete visual variants ship side by side off one shared codebase so they
can be judged against each other.

---

## 1. Decisions locked

| Question | Decision |
|---|---|
| Build tool | Vite + TypeScript (strict), matching coloring-book |
| Styling | Tailwind CSS v4 + DaisyUI v5, themes reused from coloring-book |
| Graphics | D3 v7 (selection, scale, shape, geo, interpolate, ease) |
| Scroll engine | Hand-rolled IntersectionObserver + rAF scroll-progress store. No GSAP |
| Scroll behavior | Scrubbed, never hijacked. Sticky sections allowed, scroll-jacking is not |
| Variants | Two routes, one codebase: `/` (night map) and `/blueprint.html` (schematic) |
| Map geometry | Both. Night map uses real GTFS shapes baked to GeoJSON. Blueprint uses hand-authored schematic geometry. Behind one `NetworkSource` interface so either can drive either |
| Audience | Small-agency ops manager first. Technical proof lives lower on the page |
| Accent color | `#87c540`, taken from coloring-book `public/logo.svg` |
| Logo | Reuse `coloring-book/public/logo.svg` |
| Editor section | Primarily a link out to edit.gtfs.zone, with feed deep-link chips |
| Closing section | "Get in touch" with inquiry@gtfs.zone. No biography section |
| Deploy | Static `dist/`, published the way coloring-book publishes |
| Testing | Author does all visual testing. No Playwright, no screenshots taken by me |

---

## 2. Why this stack

**Vite over Astro.** The page is one continuous scroll where nearly every
section is an interactive D3 scene sharing a single scroll-progress driver and a
single persistent background map. Astro's island model isolates exactly the
state this design needs to share, so its main benefit would not apply, and it
would add a second framework to an org that is uniformly Vite + TS. If a docs
site follows later, Astro remains the right answer for that site specifically,
and the scene modules below are written framework-agnostic so they port.

**D3 over a chart library.** Nothing here is a chart. D3 is used as four
independent utilities: `d3-geo` for projecting real GTFS coordinates, `d3-shape`
for line/area generators, `d3-scale` + `d3-interpolate` for mapping scroll
progress to visual state, and `d3-selection` for keyed data joins. Import
submodules individually, never the `d3` metapackage, to keep the bundle small.

**No animation library.** Because motion is scrubbed rather than timed, there is
no timeline to manage. Each scene is a pure `render(progress: number)` function.
This is both less code and more robust: seeking backwards, fast scrolling, and
resize are all free, and there is no animation state that can desynchronize from
scroll position.

---

## 3. Repository layout

```
landing-zone/
  index.html                  night-map variant (default route)
  blueprint.html              schematic variant
  vite.config.ts              multi-page input: index + blueprint
  tailwind.config.js          mirrors coloring-book
  package.json
  tsconfig.json               strict, noUnusedLocals, noUnusedParameters
  public/
    logo.svg                  copied from coloring-book
    favicon/                  generated from logo
    data/
      network-night.json      baked real GTFS geometry (see 6.1)
      network-blueprint.json  hand-authored schematic geometry (see 6.2)
  scripts/
    bake-network.ts           GTFS zip -> simplified GeoJSON, run manually
  src/
    main.ts                   entry for index.html
    main-blueprint.ts         entry for blueprint.html
    styles/
      main.css                Tailwind entry + @plugin daisyui
      tokens-night.css        CSS custom properties, night variant
      tokens-blueprint.css    CSS custom properties, blueprint variant
    engine/
      scroll-store.ts         global scroll position, rAF-batched
      section-progress.ts     per-section 0..1 progress + visibility
      scene.ts                Scene interface + registry + lifecycle
      viewport.ts             resize observer, breakpoints, reduced-motion
      ticker.ts               single shared rAF loop
    scenes/
      hero-map.ts
      timetable.ts
      pathways.ts
      realtime-phone.ts
      editor-cta.ts
      alert-broadcast.ts
      distribution.ts
      open-source.ts
      contact.ts
    net/
      network-source.ts       NetworkSource interface
      geo-source.ts           real GeoJSON implementation
      schematic-source.ts     hand-authored implementation
      vehicle-sim.ts          deterministic vehicle motion along shapes
    content/
      copy.ts                 all page copy in one typed object
      feeds.ts                editor deep-link chip definitions
    theme/
      palette.ts              typed color tokens read from CSS vars
```

Rationale for `content/copy.ts`: copy is the thing most likely to be rewritten,
and it must be identical across both variants. Keeping it in one typed object
means a copy change is one edit, and the variants cannot drift.

---

## 4. The scroll engine

Four small modules, roughly 200 lines total.

### 4.1 `ticker.ts`

One `requestAnimationFrame` loop for the whole page. Scenes register a callback;
the ticker calls them in registration order. A single loop, not one per scene,
so that frame cost is bounded and ordering is deterministic.

The loop does nothing and unsubscribes itself when no scene is active.

### 4.2 `scroll-store.ts`

```ts
interface ScrollState {
  y: number;          // window.scrollY
  vy: number;         // px per frame, smoothed, used for motion-blur-ish effects
  height: number;     // document height
  viewport: number;   // innerHeight
}
```

Listens to `scroll` with `{ passive: true }`, writes to a mutable state object,
never reads layout during the scroll handler. All layout reads happen once per
frame inside the ticker, and all writes happen after, so there is no
read/write/read thrash.

### 4.3 `section-progress.ts`

For a section element, produces:

- `progress`: 0 when the section's top hits the bottom of the viewport, 1 when
  its bottom hits the top. Clamped.
- `pinProgress`: for sticky sections, 0..1 across the sticky travel distance
  only. This is the value scenes actually scrub against.
- `visible`: boolean from IntersectionObserver with a generous rootMargin, used
  to skip work for offscreen scenes.

Bounding rects are cached and invalidated on resize, not read per frame.

### 4.4 `scene.ts`

```ts
interface Scene {
  mount(root: HTMLElement, ctx: SceneContext): void;
  render(p: SceneProgress): void;   // called per frame while visible
  resize(v: Viewport): void;
  destroy(): void;
}
```

`SceneContext` carries the `NetworkSource`, the palette, and the variant name.
This is the contract that keeps scenes portable to Astro islands later: `mount`
and `destroy` are all a host needs.

**Rule for every scene:** `render` must be idempotent and depend only on `p`.
Calling `render(0.4)` twice, or jumping from `0.9` to `0.1`, must produce
identical output. No accumulating state, no `setTimeout`, no CSS transitions on
scrubbed properties.

Ambient motion that is genuinely time-based (vehicles moving, a pulse) is the
one exception and is driven by an explicit `elapsed` field on `SceneProgress`,
seeded deterministically so it is reproducible.

### 4.5 Reduced motion

`prefers-reduced-motion: reduce` sets a global flag. Scenes then:

- Skip all time-based ambient motion. Vehicles are placed at their t=0 position
  and stay there.
- Keep scroll-scrubbed state, because it is not animation, it is the reader
  directly manipulating a diagram. It cannot induce motion the reader did not
  cause.
- Replace any opacity flashing or pulsing with a static styled state.

---

## 5. Rendering strategy

**SVG for everything except the hero map's vehicle layer.**

SVG gives crisp lines at any DPI, CSS-styleable strokes, and trivially
inspectable output. Element counts per scene are small (tens to low hundreds).

The one exception: if the hero map runs more than ~150 simultaneously moving
vehicles, that layer moves to a `<canvas>` overlaid on the SVG, sharing the same
`d3-geo` projection. Decide this after seeing the real feed's shape count; start
with SVG and only switch if frames drop.

**Everything is sized in a fixed viewBox coordinate space** with
`preserveAspectRatio`, so scenes scale responsively without recomputing layout.
Breakpoint changes swap the viewBox aspect and a `layout` variant flag, they do
not require rewriting geometry.

---

## 6. Network geometry: both approaches

One interface, two implementations, so any scene can be driven by either. This
is how "try both and see which looks better" gets answered cheaply.

```ts
interface NetworkSource {
  routes(): RouteLine[];        // id, name, color, points in local space
  stops(): StopPoint[];         // id, name, x, y, isMajor
  bounds(): [[number, number], [number, number]];
  pointAt(routeId: string, t: number): [number, number];  // for vehicles
}
```

### 6.1 Real geometry (`geo-source.ts`), used by the night-map variant

`scripts/bake-network.ts` runs manually, not at build time:

1. Downloads a GTFS zip.
2. Reads `shapes.txt` and `stops.txt`.
3. Deduplicates shapes to one representative per route+direction.
4. Simplifies with Douglas-Peucker to a tolerance chosen for the display size,
   targeting under 400 points per route.
5. Projects nothing. Writes raw lon/lat as GeoJSON, letting the runtime pick the
   projection so the scene can reframe on resize.
6. Writes `public/data/network-night.json` with route colors from `routes.txt`
   where present.

Source feed: Columbia County
(`https://raw.githubusercontent.com/columbia-county-ny-transit/gtfs-generator/refs/heads/main/columbia_county_gtfs.zip`),
because it is small, it is a feed gtfs.zone actually serves, and a rural network
reads as honest for the target audience. MBTA rapid transit lines are a
fallback if Columbia County looks too sparse at hero scale.

Runtime projection: `d3.geoMercator().fitExtent(...)` against the viewBox.

Committed size target: under 150 KB uncompressed. If it exceeds that, raise the
simplification tolerance rather than adding runtime fetching complexity.

### 6.2 Schematic geometry (`schematic-source.ts`), used by the blueprint variant

Hand-authored in TypeScript as a small list of polylines on a 45/90-degree grid,
Vignelli-style: uniform stroke weights, evenly spaced station ticks, no
geographic pretense. Roughly 6 routes, 40 stations.

This is expected to read better than the real geometry at small sizes and in
motion, because line spacing and label placement are controlled rather than
inherited from a real city. The comparison is the point.

Both files are loaded lazily per variant; neither variant pays for the other.

### 6.3 Vehicles (`vehicle-sim.ts`)

Deterministic, seeded, no randomness at runtime:

- Each vehicle has a route, a direction, a phase offset, and a speed.
- Position is `pointAt(routeId, (phase + elapsed * speed) % 1)`, with dwell
  time at stops modeled as a piecewise ease so vehicles visibly pause.
- Bearing derives from the local tangent, used to rotate the vehicle marker.

Same simulation drives both variants. Only the marker glyph differs.

---

## 7. Page structure, scene by scene

Section order follows `LANDING_ZONE_PLAN.md`, with the closing section replaced
by "Get in touch".

Below, "night" and "blueprint" describe the two variants of the same scene.

---

### Section 0: Hero, "GTFS.ZONE"

**Scene:** `hero-map.ts`. Full viewport height. Alive on load, before any
scroll.

- The network draws itself in on load: routes stroke-dash reveal over ~1.2s,
  staggered by route, easing out.
- Vehicles begin moving immediately along their shapes with realistic dwell at
  stops.
- Wordmark (logo.svg + "gtfs.zone") and one-line value proposition sit over the
  map in a legible plate.
- A scroll cue at the bottom fades out over the first 15% of scroll.

**Scroll behavior (0 to 1 across one viewport of scroll):**

- Map scale eases from 1.0 to 1.15 and drifts upward, so the reader appears to
  descend into the network. This continues seamlessly into section 1.
- The overlay text translates up faster than the map and fades, a parallax
  separation.
- Route strokes desaturate slightly as text sections take over.

**Night variant:** near-black background, routes as glowing colored strokes with
a soft outer stroke underneath for the glow, stops as small dim dots that
brighten as a vehicle approaches, vehicles as small bright rounded rectangles
with a short fading trail.

**Blueprint variant:** warm off-white background, a faint grid, routes as flat
2.5px strokes on the 45-degree grid, stations as open circles with hairline
ticks, vehicles as solid filled squares that snap between stations rather than
gliding.

**Copy:**
> **Real-time transit information, without the vendor.**
> Publish your schedules and live vehicle positions to Google Maps, Apple Maps,
> and your own website. Open source, from the ground up.

Primary CTA: "Open the editor" -> `https://edit.gtfs.zone`.
Secondary: "See a live feed" -> anchors to the distribution section.

---

### Section 1: "What is GTFS?"

Framing section. The hero map persists behind at reduced opacity, still moving,
established as the page's continuous ground.

**Copy:**
> **GTFS is how the world's transit agencies talk to the world's maps.**
> One open format. Your timetable, your stops, your live vehicles, understood by
> every major mapping app without a single custom integration.

Supporting line from the source plan: "Communicate with customers seamlessly."

No dedicated scene. A CSS-only reveal, so the section reads as a breath between
the hero and the two diagram sections.

---

### Section 2: "Scheduled information"

Two diagrams side by side on desktop, stacked on mobile. Sticky section,
scrubbed across roughly 1.5 viewports.

#### 2a. `timetable.ts`, the digital timetable

A timetable grid drawn as SVG: rows are stops, columns are trips, cells are
times. Built with a D3 data join from a small synthetic schedule.

**Scrub 0 to 0.5:** the grid assembles. Stop rows slide in from the left,
staggered. Trip columns fade in left to right. Times count up to their final
values with a number interpolator.

**Scrub 0.5 to 1:** one trip column highlights, and a connector line animates
from that column out to the corresponding vehicle on the background map,
physically linking the table to the network. This is the section's core idea:
the timetable is not a document, it is the map.

#### 2b. `pathways.ts`, precise station locations

A station interior in plan view: platforms, a concourse, stairs, an elevator,
and pathway edges connecting them, drawn as a graph.

**Scrub 0 to 0.4:** the station shell draws in, pathway edges appear as dashed
connectors, nodes pop in.

**Scrub 0.4 to 1:** a magnifying glass (a circle with a clip-path showing a
higher-detail version of the same geometry underneath) travels along a path from
the street entrance to the platform, following a wheelchair-accessible route.
The lens magnification and position both scrub. Label under it reads "precise
station locations, down to the elevator".

**Night:** platforms as dark plates with green accent edges, lens ring in accent
green with a glow.
**Blueprint:** true blueprint treatment, hairline construction lines, dimension
ticks, lens ring as a thin double stroke.

**Copy:**
> **Scheduled information**
> Every trip, every stop, every transfer, published in the format riders' apps
> already speak. Down to which elevator gets someone to the right platform.

---

### Section 3: "Realtime information"

**Scene:** `realtime-phone.ts`. Sticky, scrubbed across ~2 viewports. The
highest-value section for the target reader, so it gets the most motion budget.

A phone frame drawn entirely in SVG (rounded rect, status bar, no chrome
imitating any real product) sits center. Inside it, a small map view rendered
from the same `NetworkSource`, so the phone genuinely shows the same network the
page background shows, at a different zoom.

**Scrub sequence, three beats, each with a magnifier callout in the style of
2b:**

1. **Vehicle positions** (0 to 0.33): vehicle markers appear on the phone map
   and move. The lens pulls out one vehicle, and a small label shows
   `VehiclePosition`, lat/lon, bearing, timestamp, as a compact data readout.
2. **Trip updates** (0.33 to 0.66): the phone view switches to an arrivals list.
   A "4 min" changes to "6 min" and a delay chip appears. The lens shows
   `TripUpdate`, stop sequence, delay in seconds.
3. **Alerts** (0.66 to 1): an alert banner slides down in the phone. The lens
   shows `Alert`, cause, effect, informed entity.

Each beat's data readout is real GTFS-RT field naming, which is where the page
earns credibility with the technical half of the audience without slowing the
manager down.

**Copy:**
> **Realtime information**
> Where the bus actually is, when it will actually arrive, and what to do when
> something changes. Three feeds, one standard.

---

### Section 4: "Great realtime information relies on great scheduled information" (the editor)

**Scene:** `editor-cta.ts`. Not a fake product UI. The section is a link out,
with just enough motion to show what the editor is for.

Layout: a short statement, a compact four-step flow diagram, then the CTA block.

**Flow diagram** (scrubbed left to right): a file glyph enters, an inspection
pass sweeps over it and flags two issues with small accent markers, the issues
resolve, the file exits. Roughly 12 SVG elements, scrubbed, no product chrome.

**CTA block:** a large primary button to `https://edit.gtfs.zone`, plus three
feed chips that deep-link a feed straight into the editor using its documented
hash command (`processURLCommands` in coloring-book reads `#load=<url>` and
opens the load modal):

| Chip | Why it is here | Link |
|---|---|---|
| MBTA | Large, complete, exercises nearly every GTFS feature | `https://edit.gtfs.zone/#load=https://cdn.mbta.com/MBTA_GTFS.zip` |
| Amtrak | Interesting national network, and a genuinely messy feed, which is the point of a validator | `https://edit.gtfs.zone/#load=https://content.amtrak.com/content/gtfs/GTFS.zip` |
| Columbia County | Small, lightweight, what a rural agency's feed actually looks like | `https://edit.gtfs.zone/#load=https://raw.githubusercontent.com/columbia-county-ny-transit/gtfs-generator/refs/heads/main/columbia_county_gtfs.zip` |

Each chip carries a one-line descriptor so the reader knows why they would pick
it. Chips are plain anchors, they work with JS disabled.

**Verification needed during build:** confirm `#load=` still behaves as expected
on the deployed edit.gtfs.zone before shipping, since it is a cross-repo
dependency. If it has changed, fall back to linking the editor root.

**Copy:**
> **Great realtime information starts with a great schedule.**
> Upload a GTFS file, find what is broken, fix it, export it back. In your
> browser, nothing uploaded anywhere, no account.

---

### Section 5: "Build trust with realtime" (the manager)

**Scene:** `alert-broadcast.ts`. Sticky, scrubbed across ~1.5 viewports. This is
the cartoon the source plan asked for, done as abstract D3 actors.

Left: an operator figure, built from simple geometry (a circle head, a rounded
body, a suggested desk and screen). A small arm shape moves to a button. Right:
three phone shapes. Between them, a wire that follows a curve across the page.

**Scrub sequence:**

- 0 to 0.2: operator's arm moves to the "Publish" button. The button depresses.
- 0.2 to 0.6: an alert packet, a small rounded rect carrying the alert's
  header text, travels the wire. The wire behind it lights up in accent green
  as the packet passes. Packet position is `d3-shape` `pathNode.getPointAtLength`
  driven by scrub.
- 0.6 to 0.85: the packet arrives, splits into three, one per phone. Each phone
  screen lights and shows a compact alert banner.
- 0.85 to 1: three small rider figures below the phones react, a simple two-pose
  change, and a caption appears: "under a second, end to end".

That last claim is drawn from deploy-gtfs-rt's own documentation ("A position
update travels from a driver's phone to a GTFS-RT consumer in under a second").
Confirm before shipping that this is a fair claim to make about alerts too,
which take a different path (Postgres, not Redis). If uncertain, weaken to
"seconds, not days".

**Bullets, from the source plan:**
- Made for transit agencies that want simplicity
- Built on industry-standard tracking software
- Compatible with thousands of trackers

**Open question flagged, not assumed:** the source plan marks the tracker-count
claim TODO VERIFY. The plan will render it as a bullet with a `TODO` comment in
the source; it should be verified against Traccar's supported-device list before
this page goes live. Traccar advertises support for a large number of device
protocols, but the exact number and the correct phrasing need a source.

---

### Section 6: "Publish to Google Maps, Apple Maps, and your website"

**Scene:** `distribution.ts`. Scrubbed, not sticky.

A hub-and-spoke diagram. The gtfs.zone mark at center. Three spokes radiate to
labeled destination cards. A continuous stream of small packets flows outward
along the spokes, ambient and time-based rather than scrub-based, so the section
feels live even when the reader stops.

The third spoke, "your website", expands on scrub into a small embedded-widget
sketch: a browser frame outline containing a miniature live map, tying back to
the page's own network.

Beneath, a technical proof block listing the three real public endpoints as
monospace text, each copyable:

```
https://rt.gtfs.zone/rt/vehicle-positions.pb
https://rt.gtfs.zone/rt/trip-updates.pb
https://rt.gtfs.zone/rt/service-alerts.pb
```

**Verification needed:** confirm the exact public paths against the deployed
cafe-car routes before shipping. The README documents `rt.<domain>` as the
public feed API and names these three feed types, but the precise path prefix
should be checked, not assumed.

Destination names are set in plain text without third-party logos, avoiding
trademark and asset-licensing questions entirely.

**Copy:**
> **Deliver to millions of pockets.**
> One feed reaches every major mapping app, and drops straight into your own
> site.

---

### Section 7: "Open source from the start"

**Scene:** `open-source.ts`. Scrubbed.

A force-free, hand-positioned constellation of the seven repos from
deploy-gtfs-rt's architecture, drawn as a node-link diagram with `d3-shape`
curved links. Nodes are labeled with the real repo names, which are memorable
and give the section personality: cafe-car, vehicle-poser, hell-gate-bridge,
schedule-foamer, railroad-club, music-student, landing-zone.

Positions are hand-authored, not force-simulated, so the layout is stable,
deterministic, and never overlaps labels. Links draw in on scrub, each node
fades up, and hovering a node reveals its one-line role.

Nodes link to `https://git.kcfam.us/gtfs.zone/<repo>`.

**Copy, from the source plan:**
> **Open source from the start.**
> More secure, because it is audited in the open. More reliable, because you can
> run it yourself and there is no vendor to lock you in. Community-oriented
> software for community-oriented transit.

Docs link is included but marked as pending, since the source plan notes docs
are "to be published". Ship without the link rather than with a dead one.

---

### Section 8: "Get in touch"

**Scene:** `contact.ts`. Short, calm, deliberately low-motion after eight
sections of movement.

The background network, which has been present the whole page, slows to a stop
and dims. One line of copy, one email.

**Copy:**
> **Get in touch.**
> If you run transit and want your riders to see it, write to us.
> inquiry@gtfs.zone

Rendered as a `mailto:` anchor. Plus a small footer: source repos, and the
editor.

---

## 8. The two variants in detail

Both are the same DOM and the same scene modules. What differs:

**1. A CSS token file.** `tokens-night.css` vs `tokens-blueprint.css`, each
defining the same custom property names with different values:

```
--bg, --bg-elevated, --ink, --ink-muted, --accent, --grid,
--route-1..--route-6, --stroke-hairline, --stroke-route, --stroke-emphasis,
--glow-radius, --corner-radius
```

Scenes read these via `theme/palette.ts`, which resolves computed styles once at
mount and again on resize. Scenes never hardcode a color.

**2. A per-variant scene config object** carried on `SceneContext`:

```ts
interface VariantConfig {
  name: 'night' | 'blueprint';
  network: NetworkSource;
  vehicleGlyph: 'capsule' | 'square';
  vehicleMotion: 'continuous' | 'snap';
  showGrid: boolean;
  glow: boolean;
  strokeWeightScale: number;
}
```

**3. The DaisyUI theme** on `<html data-theme>`: `night` vs `light`.

Nothing else. If a scene needs a third divergence, that is a signal to add a
field to `VariantConfig`, not to fork the scene.

**Design intent, night:** cinematic, low-light, the network glowing against
black. Sells the realtime story. Hides that nothing is a real screenshot,
because everything reads as instrumentation.

**Design intent, blueprint:** warm paper, hairlines, dimension ticks, the feel of
a transit engineering drawing. Sells the precision and open-source story, and is
far more legible for long marketing copy.

Expectation going in, to be judged by eye: blueprint likely wins on copy-heavy
sections and on the schematic geometry, night likely wins on the hero and the
realtime section. A third possibility worth considering after seeing both is a
hybrid, night hero fading into blueprint below.

---

## 9. Responsive and performance

**Breakpoints:** a single `md` split at 768px. Below it, side-by-side scenes
stack, sticky sections shorten their scrub distance, and the hero map crops to a
tighter bounding box rather than shrinking, because a shrunk network becomes
illegible.

**Budgets:**
- Total JS under 120 KB gzipped. D3 submodule imports only.
- First contentful paint under 1.5s on a mid-range phone.
- 60fps scroll on a mid-range phone, verified by the author.
- Committed geometry JSON under 150 KB per variant.

**Techniques:**
- Scenes offscreen do not render at all.
- No layout reads inside scroll handlers.
- Transform and opacity are the only animated CSS properties.
- `will-change` applied only to sticky scene containers, and removed when
  inactive.
- Geometry JSON is fetched per variant, lazily, at scene mount.

**Graceful degradation:** with JS disabled, every section renders as static
styled HTML with its copy and CTAs intact. All links are real anchors. The page
is usable, just not animated.

---

## 10. Accessibility

- Every scene's `<svg>` is `aria-hidden="true"`. The scenes are decorative
  illustrations of copy that is already present as text.
- All information conveyed by a scene appears in the section's prose or in a
  visually-hidden description. Nothing is diagram-only.
- Scroll is never hijacked, so keyboard scrolling, page-down, find-in-page, and
  scrollbar dragging all behave normally.
- `prefers-reduced-motion` handled as described in 4.5.
- Contrast: both variants' body text must clear 4.5:1 against their background.
  Verify accent green `#87c540` against the night background, it may need
  lightening for text use, and should be reserved for large text and strokes.
- Focus states are visible on all chips, buttons, and repo nodes.

---

## 11. Build order

Each step is independently reviewable by eye, which matters since the author is
doing all visual testing.

1. **Scaffold.** Vite + TS + Tailwind + DaisyUI, two HTML entries, logo copied
   over, empty sections with final copy and correct vertical rhythm. Nothing
   animated. This alone is a reviewable page.
2. **Engine.** ticker, scroll-store, section-progress, scene registry. Prove it
   with one throwaway debug scene that prints its progress on screen.
3. **Geometry.** `bake-network.ts`, generate `network-night.json` from Columbia
   County, hand-author `network-blueprint.json`, implement both `NetworkSource`s.
4. **Hero, night variant.** The most important scene and the one that sets the
   visual language. Review point.
5. **Hero, blueprint variant.** Same scene, second token set and config. This
   step proves the variant abstraction actually holds. Review point.
6. **Realtime phone scene.** Highest-value section, three-beat sequence.
7. **Timetable and pathways scenes.**
8. **Alert broadcast cartoon.**
9. **Editor CTA and feed chips.** Verify `#load=` against live edit.gtfs.zone.
10. **Distribution and open-source scenes.** Verify the real endpoint paths.
11. **Contact and footer.**
12. **Responsive pass**, then **reduced-motion pass**, then **no-JS pass**.
13. **Performance pass.** Measure, then decide whether the hero vehicle layer
    needs to move to canvas.

Steps 4 and 5 are the natural first checkpoint: if the two variants do not feel
meaningfully different there, the variant experiment can be cut early and the
remaining work halves.

---

## 12. Open items needing verification before launch

1. **Tracker compatibility claim.** The source plan marks "compatible with
   thousands of trackers" as TODO VERIFY. Needs a citable source from Traccar's
   supported protocols before it goes on a marketing page.
2. **Sub-second claim for alerts.** deploy-gtfs-rt documents sub-second for
   position updates. Alerts follow a different path through Postgres. Either
   confirm or weaken the copy.
3. **Public feed paths.** Confirm `rt.gtfs.zone/rt/*.pb` exactly, against
   deployed cafe-car routes.
4. **Editor deep-link.** Confirm `edit.gtfs.zone/#load=<url>` still opens the
   load modal on the deployed build.
5. **Docs URL.** Omit until docs actually publish.
6. **Accent green contrast** on the night background for any text usage.

---

## 13. Explicitly out of scope

- The docs site. If it happens, Astro is the right tool for it, and the scene
  modules' `mount`/`destroy` contract lets them be reused as islands there.
- Any CMS or content pipeline. Copy lives in `content/copy.ts`.
- Analytics.
- Any automated visual testing. The author tests visually.
- Deployment CI. The plan assumes a static build published the way
  coloring-book is published, and stops there.
