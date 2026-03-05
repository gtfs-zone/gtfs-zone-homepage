+++
title = "GTFS Realtime Test Setup Guide"
+++

This guide walks you through setting up a GTFS Realtime feed using the gtfs.zone toolbox, from a static GTFS schedule through to publishing live trip updates, vehicle positions, and service alerts.

## Overview

GTFS Realtime (GTFS-RT) is a feed specification that allows public transportation agencies to provide realtime updates about their fleet to application developers. The gtfs.zone tools make it easy to get started.

**What you'll set up:**
- A static GTFS schedule (using `editor.gtfs.zone`)
- A realtime feed manager (using `manage.gtfs.zone`)
- Live trip updates, vehicle positions, and service alerts

---

## Prerequisites

- A modern web browser
- Basic familiarity with transit schedules (stops, routes, trips)

---

## Step 1: Create a Static GTFS Feed

1. Open [editor.gtfs.zone](https://editor.gtfs.zone) in your browser.
2. Create a new feed or import an existing GTFS zip file.
3. Define your **agencies**, **routes**, **stops**, **calendar**, and **trips**.
4. Export the completed GTFS feed as a `.zip` file.

> The static GTFS feed defines the scheduled service. Realtime updates reference the trip IDs and stop IDs defined here.

---

## Step 2: Set Up the Realtime Feed Manager

1. Open [manage.gtfs.zone](https://manage.gtfs.zone) in your browser.
2. Import your static GTFS feed (the `.zip` from Step 1) so the manager knows your trips and stops.
3. You will be given a **feed URL** — this is the public endpoint for your GTFS-RT feed.

---

## Step 3: Publish Trip Updates

Trip updates convey fluctuations in the timetable (delays, cancellations, changed routes).

1. In the manager, navigate to **Trip Updates**.
2. Select a trip from your static feed.
3. Add stop time updates:
   - **Stop ID** — the stop where the delay applies
   - **Arrival delay** — seconds of delay (negative = early)
   - **Departure delay** — seconds of delay
4. Save and publish. The update will appear in your GTFS-RT feed immediately.

---

## Step 4: Publish Vehicle Positions

Vehicle positions allow apps to show where vehicles currently are on a map.

1. In the manager, navigate to **Vehicle Positions**.
2. Add a vehicle:
   - **Vehicle ID** and **Label**
   - **Trip ID** — the trip this vehicle is serving
   - **Latitude** and **Longitude**
   - **Bearing** (degrees, 0 = north) and **Speed** (m/s) — optional
   - **Current stop sequence** or **Stop ID** — optional
3. Save and publish.

---

## Step 5: Publish Service Alerts

Service alerts inform riders of disruptions affecting stops, routes, or trips.

1. In the manager, navigate to **Service Alerts**.
2. Create a new alert:
   - **Cause** — e.g., construction, strike, weather
   - **Effect** — e.g., detour, reduced service, no service
   - **Header text** — short summary shown to riders
   - **Description text** — full details of the disruption
   - **Informed entity** — the affected agency, route, trip, or stop
   - **Active period** — start and end times (leave end blank for indefinite)
3. Save and publish.

---

## Step 6: Verify Your Feed

1. Copy your feed URL from the manager dashboard.
2. Use the [gtfs.zone status page](https://status.gtfs.zone) to check that your feed is reachable.
3. Paste your feed URL into a GTFS-RT validator such as the [MobilityData validator](https://gtfs-validator.mobilitydata.org/) to check for errors.
4. Test with a consumer app or library that supports GTFS-RT (e.g., OpenTripPlanner, Transitous).

---

## Feed URL Format

Your realtime feed is served as a Protocol Buffer binary at:

```
https://manage.gtfs.zone/feeds/{your-feed-id}/realtime
```

Individual message types are available at:

```
https://manage.gtfs.zone/feeds/{your-feed-id}/trip-updates
https://manage.gtfs.zone/feeds/{your-feed-id}/vehicle-positions
https://manage.gtfs.zone/feeds/{your-feed-id}/alerts
```

---

## Troubleshooting

**Feed returns no data**
: Make sure you have published at least one entity (trip update, vehicle position, or alert). Unpublished drafts do not appear in the feed.

**Trip ID not found**
: The trip ID in your realtime update must exactly match a `trip_id` in your static GTFS feed. Re-import your static feed if you have made changes.

**Validator reports unknown fields**
: Some GTFS-RT extensions (e.g., GTFS-RT v2 experimental fields) may be flagged by older validators. These can be safely ignored for test purposes.

---

## Next Steps

- Connect your feed to a mapping or journey-planning app
- Automate vehicle position updates from GPS hardware or an AVL system
- Explore [sites.gtfs.zone](https://sites.gtfs.zone) (coming soon) to publish rider-facing timetables from your static GTFS feed
