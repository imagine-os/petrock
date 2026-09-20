/**
 * Static page thumbnails for the hub cards. `scripts/hub-thumbs.mjs` captures them to
 * `docs/screenshots/<CODE>/thumb.jpg` (desktop 1280x800, phone codes 390x844) with a `thumb-dark.jpg` twin and an
 * optional `thumb-<label>.jpg` variant (used for the second front desk, `F-01` label `westwood`).
 *
 * They are files on purpose: a live iframe on the hub would share the viewer's session and render "No access".
 * The files may not exist yet - `thumbFor` returns undefined and the card draws its own wireframe instead.
 */
const files = import.meta.glob<string>('../../../docs/screenshots/*/thumb*.jpg', { query: '?url', import: 'default', eager: true });

const NAME = /\/screenshots\/([^/]+)\/thumb(-dark)?(?:-([A-Za-z0-9-]+))?\.jpg$/;
const key = (code: string, dark: boolean, label: string) => `${code}|${dark ? 'dark' : 'light'}|${label}`;

const index = new Map<string, string>();
for (const [path, url] of Object.entries(files)) {
  const m = NAME.exec(path);
  if (m) index.set(key(m[1], !!m[2], m[3] ?? ''), url);
}

export interface ThumbQuery {
  /** Prefer the dark capture; falls back to the light one when it is missing. */
  dark?: boolean;
  /** Variant suffix, e.g. `westwood`; falls back to the unlabelled thumb. */
  label?: string;
}

/** The bundled url of a page thumbnail, or undefined when nothing has been captured for that code yet. */
export function thumbFor(code: string, { dark = false, label = '' }: ThumbQuery = {}): string | undefined {
  const tries = label ? [[dark, label], [false, label], [dark, ''], [false, '']] : [[dark, ''], [false, '']];
  for (const [d, l] of tries as [boolean, string][]) {
    const hit = index.get(key(code, d, l));
    if (hit) return hit;
  }
  return undefined;
}
