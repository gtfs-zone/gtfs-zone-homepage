# Verification status

What was checked against the deployed products while the page was written. Kept
so a future claim change can be re-checked against the same evidence.

| Item | Status |
|---|---|
| Visualizer deep link | Scheme confirmed in the **deployed** `viz.rt.gtfs.zone` bundle. Every generated link round-trips through `URLSearchParams` back to the exact static URL, realtime triple, and cors flags |
| Editor deep link | `#load=<url>` confirmed in the **deployed** `edit.gtfs.zone` bundle, not just the source |
| CORS flags | Copied from `test-track/src/modules/examples.ts`: MBTA `s,r`, Amtrak `s,r`, Columbia County `r` (raw.githubusercontent.com needs no proxy) |
| Public feed paths | Verified live: `https://rt.gtfs.zone/columbia-county/{vehicle_positions,trip_updates,service_alerts}.pb` |
| Service alerts | Not a stub. `cafe-car/src/app/routers/gtfs_rt.py` serves real alerts with cause, effect, severity, active period, and informed entities, so "published to the alerts feed" is accurate. The Columbia County feed is currently header-only because no alert is active |
| Manager CTA | `manage.rt.gtfs.zone` returns 401 to a logged-out visitor, so the CTA reads "Sign in to the manager" rather than promising a page |
| Editor blade labels | All six exist in `coloring-book`: `gtfs-validator.ts`, `timetable-*.ts`/`editable-table.ts`, `shapes-manager.ts`, `map-controller.ts`/`stop-view-controller.ts`, `route-*.ts`, zip export in `ui.ts` |
| Visualizer feature list | All four exist in `test-track`: `pages/vehicle-page.ts`, `rt-index.ts`, `alerts.ts`/`pages/alert-page.ts`, `examples.ts`/`feed-catalog.ts`/`feed-url.ts` |
| New-tab rule | Enforced at build time, asserted after the rewrite. 25 anchors on the built page, none without `target="_blank" rel="noopener noreferrer"` |
| Sub-second alert claim | Weakened to "Seconds, not days" rather than asserting sub-second for alerts, which take the Postgres path |
| Tracker count | Reworded to match what Traccar actually claims: "compatible with a vast array of GPS trackers, from low-cost units to premium brands". No hard count asserted |
| Docs URL | Omitted, as docs are unpublished |
| Accent contrast | Dark uses `--accent-text: #a6dc68` for text; light darkens the accent to `#5f9022`. Both need a contrast check by eye |
| Responsive / reduced motion | Both themes checked headless at 1440x900 and 390x844, and with `prefers-reduced-motion: reduce`. No console errors on either |

## Superseded

The page was built to `HOMEPAGE_REVISION_PLAN.md`, which supersedes
`HOMEPAGE_BUILD_PLAN.md` and `LANDING_ZONE_PLAN.md` wherever they disagree.

The two-variant split those plans describe (`/` night and `/blueprint.html`
paper) shipped as a single page with a light/dark toggle instead. Both themes
draw the real GTFS geometry; the hand-authored schematic geometry that backed the
blueprint route was dropped.
