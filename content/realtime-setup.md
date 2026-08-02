+++
title = "GTFS Realtime Test Setup Guide"
+++

> **Note:** This is a **test setup** for sending vehicle positions to the GTFS realtime pipeline.

## 1. Access the Admin Panel

1. Open: <https://manage.rt.gtfs.zone/>
2. Click through the interface as needed.  
3. Choose **Login with GitHub**.

## 2. Create Required Resources

### Create a Feed

1. In the admin UI, create a new **Feed**.

### Create a Tracker

1. Create a new **Tracker**.
2. Give it a **nickname** — this is the public label that appears in the feed
   (e.g. `Bus 12`). It is *not* a secret.
3. On save, the tracker is assigned a random **Tracker ID** (a pet-name such as
   `gently-tender-oyster`). This ID is the device's **secret credential** — treat
   it like a password and do not share it. There is no separate password.

## 3. Install the Traccar Client

Install the Traccar Client app on your phone:

- Website: <https://www.traccar.org/client/>
- iOS: <https://apps.apple.com/us/app/traccar-client/id843156974>
- Android: <https://play.google.com/store/apps/details?id=org.traccar.client>

## 4. Provision the Device

1. In the admin UI, open the tracker's detail page and find the **Traccar
   Provisioning** section.
2. **Scan the QR code** with your phone to configure the Traccar Client in one
   step, or copy the **Config URL** and open it on the device.
3. This sets the server URL and the device identifier (the secret Tracker ID)
   automatically — you do not type a username or password.

## 5. Finish

1. Ensure the Traccar Client has location permission.
2. Toggle **tracking on** in the app.

## 6. Download the Feed

Vehicle positions will be available at:

```
https://rt.gtfs.zone/feed_name/vehicle_positions.pb
```

The feed labels each vehicle by its tracker **nickname** — the secret Tracker ID
is never published.

## 7. Helpful Resources

You can:

- Read the beginner guide: <https://open-innovations.org/blog/2024-12-23-gtfs-and-gtfs-rt-for-beginners>
- Clone the API: <https://git.kcfam.us/gtfs.zone/redis-gtfs-rt-api>
- Fetch vehicles with:

```
uv run scripts/fetch_vehicles.py feed_name --backend https://rt.gtfs.zone
```
