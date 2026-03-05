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

- **`config.toml`** — site configuration: base URL, languages (en/de/hu), taxonomies (`tags`, `movies-directors`), navbar/footer links, social links
- **`content/`** — Markdown content files; multilingual pages use `.de.md` / `.hu.md` suffixes
- **`i18n/`** — Translation strings (`en.toml`, `de.toml`, `hu.toml`)
- **`static/`** — Static assets (favicon, etc.)
- **`themes/daisy/`** — Theme submodule; do not edit directly unless intentional

## Content Structure

Content sections: `blog/`, `movies/` (uses `movies-directors` taxonomy), plus top-level pages (`about`, `_index`). Each section and page can have language variants.

## Deployment

- Netlify: auto-deploys via `zola build` (see `netlify.toml`)
- CI: Forgejo workflow (`.forgejo/workflows/check.yml`) runs `zola check` and verifies CSS is up to date
