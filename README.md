# gtfs.zone

Landing page for [gtfs.zone](https://gtfs.zone) — a public open-source toolbox
for GTFS and GTFS Realtime. Built with [Zola](https://www.getzola.org/) and the
[daisy theme](https://codeberg.org/awinterstein/zola-theme-daisy).

## Running locally

Install [Zola](https://www.getzola.org/documentation/getting-started/installation/), then:

```bash
git submodule update --init --recursive
zola serve
```

The site will be available at `http://127.0.0.1:1111` with live reload.

## Repository

Source hosted at [git.kcfam.us](https://git.kcfam.us/gtfs.zone/-/projects/3).

## Deployment

Automatically deployed via Forgejo CI on push to `main`. The workflow builds
the site with `zola build` and copies the output to `/sites/gtfs.zone` on the
server.
