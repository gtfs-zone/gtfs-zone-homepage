// Regional catalogs: a base catalog with a string transform applied to every
// value, then explicit overrides on top. A region only spells out what differs
// from its base, so it cannot fall behind when the base gains a key.

import type { Copy } from '../content/copy';

/** Overrides for a catalog; arrays are overridden by index, e.g. `{ 2: '...' }`. */
export type DeepPartial<T> = T extends string
  ? string
  : T extends readonly (infer E)[]
    ? { readonly [i: number]: DeepPartial<E> }
    : { readonly [K in keyof T]?: DeepPartial<T[K]> };

function mapStrings(node: unknown, transform: (s: string) => string): unknown {
  if (typeof node === 'string') {
    return transform(node);
  }
  if (Array.isArray(node)) {
    return node.map((n) => mapStrings(n, transform));
  }
  return Object.fromEntries(
    Object.entries(node as object).map(([k, v]) => [
      k,
      mapStrings(v, transform),
    ])
  );
}

function merge(base: unknown, overrides: unknown, path: string): unknown {
  if (typeof overrides === 'string') {
    return overrides;
  }
  const out = (
    Array.isArray(base) ? [...(base as unknown[])] : { ...(base as object) }
  ) as Record<string, unknown>;
  for (const [k, v] of Object.entries(overrides as object)) {
    if (!(k in out)) {
      throw new Error(`regional override: no key ${path}${k}`);
    }
    out[k] = merge(out[k], v, `${path}${k}.`);
  }
  return out;
}

/** `base` with `transform` applied to every string, then `overrides` merged in. */
export function regional(
  base: Copy,
  transform: (s: string) => string,
  overrides: DeepPartial<Copy> = {}
): Copy {
  return merge(mapStrings(base, transform), overrides, '') as Copy;
}

/**
 * Quebec typography (OQLF): a non-breaking space before `:` and inside
 * guillemets, none before `;`, `?` and `!`.
 */
export function canadianFrench(s: string): string {
  return s.replace(/\u00a0([;?!])/g, '$1');
}

/** Swiss Standard German: no `ß`, and guillemets instead of German quotes. */
export function swissGerman(s: string): string {
  return s.replace(/ß/g, 'ss').replace(/„/g, '«').replace(/[“”]/g, '»');
}
