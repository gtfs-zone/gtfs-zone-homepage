# gtfs.zone homepage: revision plan

## 0. Status of the earlier documents

This plan supersedes `LANDING_ZONE_PLAN.md` and `HOMEPAGE_BUILD_PLAN.md` wherever
they disagree with it. Where the built site disagrees with this plan, the site is
wrong and gets changed. Do not preserve existing copy, scenes, or section names
for continuity's sake.

What survives from the build, unchanged:

- The stack (Vite, TypeScript, Tailwind/DaisyUI, canvas scenes, one rAF ticker).
- The scroll engine (`src/engine/*`) and the scene contract.
- The two variants (`/` night map, `/blueprint.html` blueprint) off one
  `src/page.html`.
- The baked MBTA network geometry and the hero map scene.
- `src/content/copy.ts` as the single source of copy, and `src/content/feeds.ts`
  as the single source of feed links.

What changes: nearly all copy, the section list, the link set, and four of the
eight content scenes.

---

## 1. The three products, and their level

The site has been treating the editor as the product and everything else as
supporting material. That is wrong. There are three tools, and the first two sit
at the same level:

| Tool | URL | Repo | What it is |
|---|---|---|---|
| Editor | `https://edit.gtfs.zone` | `coloring-book` | Browser GTFS Schedule editor and validator. Upload a feed, find what is broken, fix it, export it. |
| Visualizer | `https://viz.rt.gtfs.zone` | `test-track` | GTFS Realtime feed inspector. Point it at a static feed plus vehicle-position / trip-update / alert endpoints and watch them on a map. |
| Manager | `https://manage.rt.gtfs.zone` | `cafe-car` | Feed management software for agencies: feeds, drivers, vehicle tracking, service alerts. Publishes the public GTFS-RT endpoints at `rt.gtfs.zone`. |

Everywhere the editor gets a link, the visualizer gets the equivalent link. The
hero, the per-tool sections, and the footer all carry both.

---

## 2. Global rules

1. **Every link opens in a new tab.** `target="_blank" rel="noopener noreferrer"`
   on every external anchor without exception, including the hero CTAs, the feed
   chips, the endpoint list, the footer, and the `mailto:`. Add a single helper
   used by every scene and by `page.html` so this cannot be forgotten
   per-instance: a `link()` helper in a new `src/content/links.ts` that emits the
   attributes, plus a build-time check (or a one-line test) that no `<a href="http`
   in `src/page.html` lacks `target`.
2. **No metaphor-as-claim copy.** Lines like "GTFS is how the world's transit
   agencies talk to the world's maps" and "A timetable is not a document. It is
   the map." say nothing checkable. Delete them. Every sentence on the page must
   state a fact, a feature, or an action.
3. **Follow gtfs.org's own language** for anything describing GTFS itself, since
   that is the authority and it is already plain. Do not invent alternative
   framing.
4. **No animation without a referent.** Two animations currently exist because
   the plan asked for motion, not because they show anything: the second half of
   the scheduled section, and the scene after the contact email. Both get cut.
   Two sections that need a visual and lack one get it.

---

## 3. Link inventory

Canonical, all `target="_blank"`.

**Products**
- Editor: `https://edit.gtfs.zone`
- Visualizer: `https://viz.rt.gtfs.zone`
- Manager: `https://manage.rt.gtfs.zone`

**Reference**
- GTFS standard: `https://gtfs.org`
- GTFS Schedule reference: `https://gtfs.org/documentation/schedule/reference/`
- GTFS Realtime reference: `https://gtfs.org/documentation/realtime/reference/`
- Traccar: `https://www.traccar.org/`
- Traccar supported devices: `https://www.traccar.org/devices/`

**Live feeds** (verified against the deployed cafe-car; keep as-is)
- `https://rt.gtfs.zone/columbia-county/vehicle_positions.pb`
- `https://rt.gtfs.zone/columbia-county/trip_updates.pb`
- `https://rt.gtfs.zone/columbia-county/service_alerts.pb`

**Source**: `https://git.kcfam.us/gtfs.zone`

### 3.1 Deep links into the editor and the visualizer

`src/content/feeds.ts` grows a second link builder so one feed entry produces
both chips.

Editor (confirmed in `coloring-book/src/.../page-state-manager.ts`):

```
https://edit.gtfs.zone/#load=<staticUrl>
```

Visualizer (scheme confirmed in `test-track/src/modules/feed-url.ts`):

```
https://viz.rt.gtfs.zone/#static=<staticUrl>&rt_vp=<url>&rt_tu=<url>&rt_al=<url>&cors=s,r
```

`cors` is a compact flag list: `s` proxies the static source, `r` proxies the
realtime sources. Copy the per-feed flags from `test-track/src/modules/examples.ts`
rather than guessing — that file documents which hosts send CORS headers and
which do not. Notably `raw.githubusercontent.com` needs no proxy (Columbia County
static is `s`-less); `cdn.mbta.com`, `content.amtrak.com` and `rt.gtfs.zone` all
need one.

Feed entries, each with a static URL and a realtime triple, taken from
`examples.ts` so the two sites agree:

| Feed | Static | Realtime | Note for the chip |
|---|---|---|---|
| MBTA | `https://cdn.mbta.com/MBTA_GTFS.zip` | `https://cdn.mbta.com/realtime/{VehiclePositions,TripUpdates,Alerts}.pb` | Large and complete. Exercises nearly every GTFS feature. |
| Amtrak | `https://content.amtrak.com/content/gtfs/GTFS.zip` | `https://rt.gtfs.zone/amtrak/{vehicle_positions,trip_updates,service_alerts}.pb` | A national network, and a genuinely messy feed. |
| Columbia County | `https://raw.githubusercontent.com/columbia-county-ny-transit/gtfs-generator/refs/heads/main/columbia_county_gtfs.zip` | `https://rt.gtfs.zone/columbia-county/{...}.pb` | What a small rural agency's feed actually looks like. |

Every feed chip renders twice: once under the editor ("Open in the editor") and
once under the visualizer ("Open in the visualizer"). Same feed list, two
builders, no drift.

---

## 4. Section-by-section specification

Final section order:

0. Hero
1. What is GTFS?
2. Scheduled information
3. Realtime information
4. The editor
5. The visualizer *(new)*
6. Build trust with realtime (the manager)
7. Publish *(renamed from Distribution)*
8. Open source
9. Get in touch

### Section 0: Hero

Keep the night-map / blueprint background scene as built.

- Wordmark: `gtfs.zone`
- Heading: **Tools for publishing transit data.**
- Body: Open source software for building, checking, and publishing GTFS
  Schedule and GTFS Realtime feeds.
- Primary CTA: **Open the editor** → `https://edit.gtfs.zone`
- Secondary CTA: **Browse realtime feeds** → `https://viz.rt.gtfs.zone`

Both CTAs get equal visual weight (the secondary may stay outline-styled, but not
demoted to a text link). Both open in new tabs. The old secondary CTA
(`#distribution`, an in-page jump labelled "See a live feed") is removed.

### Section 1: What is GTFS?

Straight from gtfs.org, no embroidery.

- Eyebrow: `What is GTFS?`
- Heading: **A community-driven open standard for rider-facing transit
  information.**
- Body: Over 10,000 agencies in 100+ countries publish GTFS. It is a simple data
  structure that any app developer can consume, which is why adopting it puts an
  agency's service in front of a wide audience without a custom integration per
  app.
- Link: **Learn more at gtfs.org** → `https://gtfs.org`

Then a short "why use GTFS" list, condensed from gtfs.org's six points to four
that do not overlap:

- **Improved rider experience** — accurate schedules and real-time updates, so
  riders wait less and decide better.
- **Global reach** — consistent data across agencies and regions makes
  multi-agency trips work.
- **Simple to use** — a plain data structure, easy to produce and to consume.
- **Open source community** — the standard keeps evolving through community
  collaboration.

No new scene here. This section is text.

### Section 2: Scheduled information

**Cut the second half of the current animation.** The pathways/"precise station
locations" canvas draws disconnected line segments that read as an unfinished
diagram, and the caption ("A timetable is not a document. It is the map.") is
exactly the kind of line rule 2 bans. Delete `src/scenes/pathways.ts` and the
second pinned panel with it.

Keep `timetable.ts` — the digital-timetable animation is legible and earns its
place. It becomes the section's single visual, unpinned or with a shortened pin
track (the section drops from `pin-track-long` behaviour to one panel).

- Eyebrow: `GTFS Schedule`
- Heading: **The foundation: static, rider-facing service information.**
- Body: GTFS Schedule describes the service an agency runs, in a form every major
  mapping app already reads.
- Feature list — actual spec features, gtfs.org's framing:
  - **Routes and stops** — exactly where to catch the bus or the train.
  - **Schedules and frequencies** — clear timetables riders can plan against.
  - **Fares** — journey costs shown upfront in apps.
  - **Flexible services** — demand-responsive transportation.
  - **Pathways** — station interiors, down to which elevator reaches which
    platform.
- Link: **GTFS Schedule reference** → `https://gtfs.org/documentation/schedule/reference/`

(Pathways survives as a bullet, which is all it ever needed to be.)

### Section 3: Realtime information

Keep `realtime-phone.ts` and the three beats. Only the copy changes: drop "Three
feeds, one standard" flourish, use gtfs.org's descriptions.

- Eyebrow: `GTFS Realtime`
- Heading: **Live updates that keep riders informed.**
- Body: GTFS Realtime covers the parts of transit that change during the day.
- Beats (keep the existing field dumps, replace the prose):
  - **Vehicle positions** — where the vehicle actually is right now, so nobody
    stands at a stop wondering.
  - **Trip updates** — a more accurate arrival time, so connections are not
    missed.
  - **Service alerts** — notice of disruptions on the network, in time to change
    plans.
- Link: **GTFS Realtime reference** → `https://gtfs.org/documentation/realtime/reference/`

### Section 4: The editor

The section currently has a bare `Upload / Inspect / Fix / Export` step row with
nothing above it. Give it a visual.

- Eyebrow: `The editor`
- Heading: **The Swiss army knife of GTFS.**
- Body: Upload a GTFS file, find what is broken, fix it, export it back. Runs in
  the browser. Nothing is uploaded anywhere, and there is no account.
- Steps row: Upload → Inspect → Fix → Export (keep).
- **New scene above the steps**, `src/scenes/editor-tools.ts`: a Swiss-army-knife
  figure whose blades fan out on scroll, each blade labelled with one capability
  the editor actually has — validate, edit stop times, redraw shapes, map stops,
  edit routes, export. Blades open in sequence with section progress, close on
  scroll-out; idempotent on `p` like every other scene. Keep it line-art in both
  variants (night: glowing stroke; blueprint: hairline) so it needs no new asset
  pipeline. Verify the labelled capabilities against `coloring-book` before
  shipping; drop any that do not exist rather than inventing one to fill a blade.
- CTA: **Open the editor** → `https://edit.gtfs.zone`
- Chips: `Or open a real feed straight away` → the three feeds, editor links.

### Section 5: The visualizer *(new section)*

Peer of section 4, same layout treatment, same weight.

- Eyebrow: `The visualizer`
- Heading: **Inspect any GTFS Realtime feed on a map.**
- Body: Point it at a static feed and its realtime endpoints and watch vehicle
  positions, trip updates, and service alerts against the schedule they claim to
  follow. Any agency's feed, not just ours. Nothing to install.
- Feature list (verify against `test-track` before shipping):
  - Vehicles on a live map, matched to their route and trip.
  - Trip updates read against the static schedule.
  - Service alerts, with the entities they affect.
  - A catalog of ready-to-load example feeds, and a shareable link that
    reproduces a whole session.
- Scene: reuse the realtime map treatment rather than building a third map. A
  small inspector frame — map fragment plus a detail panel — is enough.
- CTA: **Browse realtime feeds** → `https://viz.rt.gtfs.zone`
- Chips: `Or open a real feed straight away` → the same three feeds, visualizer
  links.

### Section 6: Build trust with realtime (the manager)

The current section reads as an abstract claim about alerts and never says that a
piece of software exists. Fix that first.

- Eyebrow: `The manager`
- Heading: **Management software for running a realtime feed.**
- Body: `manage.rt.gtfs.zone` is where an agency runs its feed: define feeds, add
  drivers, track vehicles, and publish service alerts. The public GTFS-RT
  endpoints update from it directly.
- Feature list, matching what `cafe-car` actually ships:
  - **Feeds** — one agency, one or many feeds, each with its static source and
    its public endpoints.
  - **Service alerts** — header, description, cause, effect, severity, active
    period, and the routes or stops affected. Published to the alerts feed.
  - **Vehicle tracking** — drivers with their own credentials, positions arriving
    over MQTT and served as vehicle positions.
  - **Trip updates** — delay against the scheduled trip, derived from those
    positions.
- Tracking hardware, explicit and linked:
  - Built on **Traccar** (`https://www.traccar.org/`), the open source GPS
    tracking platform.
  - Compatible with a vast array of GPS trackers, from low-cost units to premium
    brands — **see the supported device list**
    (`https://www.traccar.org/devices/`).
  - A driver's phone works too, so an agency can start with no hardware at all.
- Keep `alert-broadcast.ts` (manager publishes → riders receive). Keep the
  "Seconds, not days" caption; do not restore any sub-second claim.
- CTA: **Open the manager** → `https://manage.rt.gtfs.zone`

Note: `service_alerts.pb` is a stub in the public API README. Confirm alerts are
actually served before the "published to the alerts feed" line ships; if they are
not yet, say "managed in the admin, published as the feed goes live" or cut the
clause.

### Section 7: Publish

Rename from "Distribution" everywhere: section id `#publish`, eyebrow `Publish`,
copy.ts key `publish`.

- Eyebrow: `Publish`
- Heading: **Deliver to millions of pockets.**
- Body: One feed reaches every major mapping app, and drops straight into your
  own site.
- Destinations: Google Maps, Apple Maps, Your website (keep).
- Live public feeds: the three `rt.gtfs.zone/columbia-county/*.pb` URLs, each
  opening in a new tab, plus one link opening the same feed in the visualizer.
- Keep the `distribution.ts` scene; rename the file to `publish.ts` along with
  the section.

### Section 8: Open source

Drop the repo graph entirely. Nobody arriving at a marketing page wants a node
diagram of seven internal repositories, and it commits the page to keeping repo
names and roles accurate forever.

- Eyebrow: `Open source`
- Heading: **Open source from the start.**
- Three icon-and-line items, nothing more:
  - **Secure** — audited in the open.
  - **Reliable** — run it yourself. There is no vendor to lock you in.
  - **Community-oriented** — community software for community transit.
- Icons: simple line glyphs (shield, server, people), drawn in the same stroke
  language as the rest of the page. Static SVG is fine — this does not need a
  canvas scene.
- One link: **Source** → `https://git.kcfam.us/gtfs.zone`.
- Delete `src/scenes/open-source.ts`, and the `repos` / `repoLinks` / `REPO_BASE`
  exports from `copy.ts`.

### Section 9: Get in touch

- Heading: **Get in touch.**
- Body: If you run transit and want your riders to see it, write to us.
- Email: `inquiry@gtfs.zone`, a `mailto:` opening in a new tab.
- **Delete the scene that currently follows the email.** It illustrates nothing.
  The page ends on the address and the footer.
- Delete `src/scenes/contact.ts`.

### Footer

Three product links plus source and the standard, all new-tab:

`Editor` · `Visualizer` · `Manager` · `Source` · `gtfs.org`

---

## 5. Work order

1. `src/content/links.ts` — the canonical link table and the new-tab `link()`
   helper. Convert every existing anchor in `page.html` and in every scene to it.
2. `src/content/feeds.ts` — add realtime triples and `visualizerLink()`; keep
   `editorLink()`.
3. `src/content/copy.ts` — rewrite wholesale against section 4 above. Rename
   `distribution` → `publish`. Remove `repos`, `repoLinks`, `REPO_BASE`.
4. `src/page.html` — new section list and order, `#distribution` → `#publish`,
   new `#visualizer` section, scheduled section down to one panel, contact scene
   removed.
5. Scenes: delete `pathways.ts`, `open-source.ts`, `contact.ts`; rename
   `distribution.ts` → `publish.ts`; add `editor-tools.ts`; add the visualizer
   inspector scene.
6. Verify both variants at mobile and desktop widths, and with
   `prefers-reduced-motion`.
7. Update `README.md`: point at this plan, refresh the verification table.

## 6. Verification before launch

- [ ] Visualizer hash scheme loads a session end-to-end from a built link, per
      feed, with the `cors` flags taken from `examples.ts`.
- [ ] Editor `#load=` deep link works against the deployed build, not just the
      source.
- [ ] `service_alerts.pb` serves real alerts, or the section 6 copy is softened.
- [ ] Every `<a>` on the built page carries `target="_blank" rel="noopener
      noreferrer"`.
- [ ] Editor capability labels on the knife blades all exist in `coloring-book`.
- [ ] Visualizer feature list all exists in `test-track`.
- [ ] `manage.rt.gtfs.zone` is reachable to a logged-out visitor, or the CTA is
      relabelled to set expectations.
