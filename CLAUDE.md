# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a [Zola](https://www.getzola.org/) static site using the [daisy theme](https://codeberg.org/awinterstein/zola-theme-daisy) (a Git submodule at `themes/daisy`), built on TailwindCSS and DaisyUI.

## Commands

```bash
# Serve locally with live reload
zola serve

# Build the site
zola build

# Check links and configuration
zola check

# Rebuild TailwindCSS (when theme CSS changes)
tailwindcss -i themes/daisy/src/css/main.css -o themes/daisy/static/css/main.css --minify
```

After cloning, initialize the theme submodule:
```bash
git submodule update --init --recursive
```

## Architecture

- **`config.toml`** — site configuration: base URL, taxonomies, navbar/footer links, social links
- **`content/`** — Markdown content files
- **`i18n/`** — Translation strings (`en.toml`)
- **`static/`** — Static assets (favicon, etc.)
- **`themes/daisy/`** — Theme submodule; do not edit directly unless intentional

## Content Structure

Top-level pages only: `_index.md` (home), `realtime-setup.md`.

## Deployment

- Netlify: auto-deploys via `zola build` (see `netlify.toml`)
- CI: Forgejo workflow (`.forgejo/workflows/check.yml`) runs `zola check` and verifies CSS is up to date

## Theme Usage

**Always use theme-native elements when writing content HTML.** The content renders inside a `max-w-2xl xl:max-w-4xl mx-auto` container provided by `base.html`. Do not write full-width hero sections or custom layouts that assume more width.

Key theme patterns to reuse:
- **Cards**: `card card-border bg-base-200 grow basis-0 max-w-100 shadow-xl transform transition duration-500 hover:scale-103` with `card-body`, `card-title`, `card-actions justify-end`
- **Card grid**: `grid grid-cols-1 md:grid-cols-2 gap-4`
- **Buttons**: `btn btn-primary`, `btn btn-secondary`
- **Badges**: `badge badge-warning`, `badge badge-neutral`, `badge badge-sm`
- **Shortcodes**: `badge_primary`, `badge_warning`, `badge_neutral`, `badge_success`, `badge_error`, `badge_info`, `badge_secondary`, `badge_accent`, `icon`

See `themes/daisy/templates/macros/content.html` for the full `cards` macro and other reusable patterns.
