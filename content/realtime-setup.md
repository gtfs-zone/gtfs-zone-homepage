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

### Create a Driver

1. Create a new **Driver**.
2. Save the **username** and **password** — you will need them later.

## 3. Install OwnTracks

Install OwnTracks on your phone:

- Website: <https://owntracks.org/>
- iOS: <https://itunes.apple.com/us/app/mqttitude/id692424691?mt=8>
- Android: <https://play.google.com/store/apps/details?id=org.owntracks.android>

After installing:

1. Open the app.
2. Go to **Preferences → Connection**.

## 4. Configure MQTT Connection

Set the following values exactly:

| Setting | Value |
|--------|-------|
| Mode | MQTT |
| Host | mqtt.gtfs.zone |
| Port | 443 |
| Client ID | anything |
| Use WebSockets | No |
| Device ID | **GTFS Trip ID** |
| Tracker ID | anything |
| Username | *(driver username from UI)* |
| Password | *(driver password from UI)* |
| TLS | Yes |
| Client certificate | Not set |
| Keepalive | 180 |
| Clean Session | Leave default |


## 5. Finish

1. Save the configuration.
2. Ensure OwnTracks has location permission.
3. Start tracking.

## 6. Download the Feed

Vehicle positions will be available at:

```
https://rt.gtfs.zone/feed_name/vehicle_positions.pb
```

## 7. Helpful Resources

You can:

- Read the beginner guide: <https://open-innovations.org/blog/2024-12-23-gtfs-and-gtfs-rt-for-beginners>
- Clone the API: <https://git.kcfam.us/gtfs.zone/redis-gtfs-rt-api>
- Fetch vehicles with:

```
uv run scripts/fetch_vehicles.py feed_name --backend https://rt.gtfs.zone
```
