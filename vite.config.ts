import { defineConfig, type Plugin } from 'vite';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { editorLink, feeds, visualizerLink } from './src/content/feeds';
import { icons } from './src/content/icons';

// The body markup lives in src/page.html and is inlined here, and the feed chips
// are generated from feeds.ts so the editor list and the visualizer list cannot
// drift from each other.
//
// Five passes, in order:
//   1. @include: inline the body markup
//   2. @feeds:   expand the generated feed chip lists
//   3. @icon:    expand a list glyph from icons.ts, so a mark is defined once
//   4. @version: stamp the build version from git tags
//   5. new-tab:  stamp target/rel on every external anchor, then assert none
//                  were missed. This is what makes the rule unforgettable: no
//                  author has to remember it per-anchor.

const EXTERNAL_ANCHOR = /<a\s([^>]*?)href="((?:https?:|mailto:)[^"]*)"([^>]*?)>/g;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function chips(kind: 'editor' | 'visualizer'): string {
  const href = kind === 'editor' ? editorLink : visualizerLink;
  // The same feed appears in both lists, so each link states its destination
  // off-screen: identical link text pointing at two targets reads as one link.
  const destination = kind === 'editor' ? 'open in the editor' : 'open in the visualizer';
  const items = feeds
    .map(
      (feed) => `    <li>
      <a class="chip block h-full p-4" href="${escapeHtml(href(feed))}">
        <span class="font-semibold">${feed.name}</span>
        <span class="lede mt-1 block text-sm">${feed.descriptor}</span>
        <span class="sr-only-desc">, ${destination}</span>
      </a>
    </li>`
    )
    .join('\n');
  return `<ul class="mt-4 grid gap-3 md:grid-cols-3" data-feed-chips="${kind}">\n${items}\n  </ul>`;
}

// Decorative, so aria-hidden and no role.
function icon(name: string): string {
  const paths = icons[name];
  if (!paths) throw new Error(`@icon ${name}: no such glyph in src/content/icons.ts`);
  return (
    '<svg class="list-glyph" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" ' +
    'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ' +
    `stroke-linejoin="round">${paths}</svg>`
  );
}

// Build version, read from git tags the same way the editor reads it. Exactly on
// a tag gives the clean version; anywhere else appends the commit distance and
// hash, so a page served off an untagged build says so.
function buildVersion(): string {
  const git = (cmd: string): string =>
    execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try {
    const described = git('git describe --tags --long --abbrev=7');
    const parts = /^(.*)-(\d+)-g([0-9a-f]+)$/.exec(described);
    if (!parts) return described.replace(/^v/, '');
    const [, tag, distance, hash] = parts;
    const clean = tag.replace(/^v/, '');
    return distance === '0' ? clean : `${clean}-${distance}-g${hash}`;
  } catch {
    try {
      return `0.0.0-dev.${git('git rev-parse --short HEAD')}`;
    } catch {
      return '0.0.0-development';
    }
  }
}

const version = buildVersion();

function buildPage(): Plugin {
  return {
    name: 'build-page',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        let out = html.replace(/<!--\s*@include\s+(\S+)\s*-->/g, (_, file: string) =>
          readFileSync(resolve(__dirname, 'src', file), 'utf-8')
        );

        out = out.replace(/<!--\s*@feeds\s+(editor|visualizer)\s*-->/g, (_, kind) =>
          chips(kind as 'editor' | 'visualizer')
        );

        out = out.replace(/<!--\s*@icon\s+([\w-]+)\s*-->/g, (_, name: string) => icon(name));

        out = out.replace(/<!--\s*@version\s*-->/g, escapeHtml(version));

        out = out.replace(EXTERNAL_ANCHOR, (match, before: string, href: string, after: string) => {
          if (/\btarget=/.test(before + after)) return match;
          return `<a ${before}href="${href}" target="_blank" rel="noopener noreferrer"${after}>`;
        });

        const missed = [...out.matchAll(EXTERNAL_ANCHOR)].filter(
          (m) => !/\btarget="_blank"/.test(m[1] + m[3]) || !/\brel="noopener noreferrer"/.test(m[1] + m[3])
        );
        if (missed.length > 0) {
          throw new Error(
            `${ctx.path}: external anchors without target="_blank" rel="noopener noreferrer":\n` +
              missed.map((m) => `  ${m[0]}`).join('\n')
          );
        }

        return out;
      },
    },
  };
}

export default defineConfig({
  plugins: [buildPage()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 8080,
    host: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
});
