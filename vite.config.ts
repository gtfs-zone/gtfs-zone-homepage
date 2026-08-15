import { defineConfig, type Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { editorLink, feeds, visualizerLink } from './src/content/feeds';

// The body markup lives in src/page.html and is inlined here, and the feed chips
// are generated from feeds.ts so the editor list and the visualizer list cannot
// drift from each other.
//
// Three passes, in order:
//   1. @include  — inline the body markup
//   2. @feeds    — expand the generated feed chip lists
//   3. new-tab   — stamp target/rel on every external anchor, then assert none
//                  were missed. This is what makes the rule unforgettable: no
//                  author has to remember it per-anchor.

const EXTERNAL_ANCHOR = /<a\s([^>]*?)href="((?:https?:|mailto:)[^"]*)"([^>]*?)>/g;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function chips(kind: 'editor' | 'visualizer'): string {
  const href = kind === 'editor' ? editorLink : visualizerLink;
  const items = feeds
    .map(
      (feed) => `    <li>
      <a class="chip block h-full p-4" href="${escapeHtml(href(feed))}">
        <span class="font-semibold">${feed.name}</span>
        <span class="lede mt-1 block text-sm">${feed.descriptor}</span>
      </a>
    </li>`
    )
    .join('\n');
  return `<ul class="mt-4 grid gap-3 md:grid-cols-3" data-feed-chips="${kind}">\n${items}\n  </ul>`;
}

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
