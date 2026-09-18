/**
 * The business operations manual: docs/ops-manual/en/NN-slug.md, read at build time. Adding a chapter needs no code:
 * the front matter carries title, code (M-xx), roles, part, version, updated, summary, rules; the body may embed
 * `{{directive}}` lines (LiveBlock), `[screenshot: CODE — caption]` placeholders (Figure) and `> NOTE:` callouts.
 */
import { getRouteByCode } from '../../../app/registry';

const files = import.meta.glob<string>('../../../../docs/ops-manual/en/*.md', { query: '?raw', import: 'default', eager: true });
const drafts = import.meta.glob<string>('../../../../docs/ops-manual/en/_pending/*.md', { query: '?raw', import: 'default', eager: true });
const shots = import.meta.glob<string>('../../../../docs/screenshots/*/*.{jpg,png}', { query: '?url', import: 'default', eager: true });

const strip = (k: string) => k.replace(/^(\.\.\/)+/, '');

export type PartKey = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export const PARTS: { key: PartKey; label: string; lead: string }[] = [
  { key: 'I', label: 'Start here', lead: 'What Petrock is, how the manual works, how lessons are taught.' },
  { key: 'II', label: 'Front desk', lead: 'The day at the desk: arrivals, departures, vaccines, reservations, messages.' },
  { key: 'III', label: 'Grooming, daycare & walks', lead: 'The agenda, the daycare day, walks, tasks and training.' },
  { key: 'IV', label: 'Money & approvals', lead: 'Payments, invoices, refunds and the manager PIN.' },
  { key: 'V', label: 'Managers & owners', lead: 'Duties, settings, pricing, roles, locations and reports.' },
  { key: 'VI', label: 'System & reference', lead: 'Feedback, rules, tables, the website and the vocabulary.' },
];
export const partOf = (key: string) => PARTS.find((p) => p.key === key);

export type CalloutTone = 'note' | 'warning' | 'decision' | 'tip' | 'in_person' | 'online';
export type Segment =
  | { kind: 'md'; source: string; anchor?: string }
  | { kind: 'live'; name: string; arg?: string }
  | { kind: 'shot'; code: string; caption?: string }
  | { kind: 'callout'; tone: CalloutTone; text: string };

export interface ManualHeading { id: string; text: string; level: 2 | 3 }
export interface ManualChapter {
  slug: string; number: string; code: string; title: string; roles: string[]; part: string; version: string; updated: string; summary: string; rules: string[]; figma: string[];
  path: string; body: string; segments: Segment[]; headings: ManualHeading[]; words: number; figures: number; placeholders: { code: string; caption?: string }[]; decisions: string[]; directives: { name: string; arg?: string }[];
}

const FRONT = /^---\n([\s\S]*?)\n---\n?/;
const DIRECTIVE = /^\{\{([a-z][\w-]*)(?::([^}]*))?\}\}\s*$/;
const SCREENSHOT = /^\[screenshot:\s*([A-Z]+-\d+[a-z]?)\s*(?:[—–-]+\s*(.*?))?\]\s*$/;
const CALLOUT = /^>\s*(NOTE|WARNING|DECISION NEEDED|DECISION PENDING|TIP|IN PERSON|ONLINE)\s*:\s*(.*)$/;
const HEADING = /^(##|###)\s+(.+?)\s*#*\s*$/;
const TONE: Record<string, CalloutTone> = { NOTE: 'note', WARNING: 'warning', 'DECISION NEEDED': 'decision', 'DECISION PENDING': 'decision', TIP: 'tip', 'IN PERSON': 'in_person', ONLINE: 'online' };

export const headingSlug = (text: string) => text.toLowerCase().replace(/[`*_]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
const list = (s?: string) => (s ?? '').split(/[,;]/).map((x) => x.trim()).filter(Boolean);

function parseBody(body: string): { segments: Segment[]; headings: ManualHeading[] } {
  const segments: Segment[] = [];
  const headings: ManualHeading[] = [];
  const used = new Map<string, number>();
  let buf: string[] = []; let anchor: string | undefined;
  const flush = () => { const src = buf.join('\n').trim(); if (src) segments.push({ kind: 'md', source: src, anchor }); buf = []; anchor = undefined; };
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const d = line.match(DIRECTIVE); if (d) { flush(); segments.push({ kind: 'live', name: d[1], arg: d[2]?.trim() || undefined }); continue; }
    const s = line.match(SCREENSHOT); if (s) { flush(); segments.push({ kind: 'shot', code: s[1], caption: s[2]?.trim() || undefined }); continue; }
    const c = line.match(CALLOUT);
    if (c) { flush(); let text = c[2]; while (i + 1 < lines.length && /^>\s?/.test(lines[i + 1]) && !CALLOUT.test(lines[i + 1])) { i++; text += ' ' + lines[i].replace(/^>\s?/, ''); } segments.push({ kind: 'callout', tone: TONE[c[1]], text: text.trim() }); continue; }
    const h = line.match(HEADING);
    if (h) { flush(); const base = headingSlug(h[2]); const n = used.get(base) ?? 0; used.set(base, n + 1); const id = n ? `${base}-${n}` : base; headings.push({ id, text: h[2].replace(/[`*_]/g, ''), level: h[1].length as 2 | 3 }); anchor = id; }
    buf.push(line);
  }
  flush();
  return { segments, headings };
}

function parse(path: string, raw: string): ManualChapter {
  const file = path.match(/([^/]+)\.md$/)![1];
  const fm = raw.match(FRONT);
  const meta: Record<string, string> = {};
  if (fm) for (const line of fm[1].split('\n')) { const m = line.match(/^(\w+):\s*(.*)$/); if (m) meta[m[1]] = m[2].trim(); }
  const body = fm ? raw.slice(fm[0].length) : raw;
  const { segments, headings } = parseBody(body);
  const number = file.match(/^(\d+)/)?.[1] ?? '';
  return {
    slug: file, number, code: meta.code ?? `M-${number}`, title: meta.title ?? body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? file,
    roles: list(meta.roles ?? meta.role), part: meta.part ?? '', version: meta.version ?? '', updated: meta.updated ?? '', summary: meta.summary ?? '', rules: list(meta.rules), figma: list(meta.figma),
    path, body, segments, headings,
    words: (body.match(/[\p{L}\p{N}'’-]+/gu) ?? []).length,
    figures: segments.filter((s) => s.kind === 'shot' && !!shotUrl(s.code)).length + (body.match(/!\[[^\]]*\]\((?:\.\.\/)+screenshots\//g) ?? []).length,
    placeholders: segments.flatMap((s) => (s.kind === 'shot' && !shotUrl(s.code) ? [{ code: s.code, caption: s.caption }] : [])),
    decisions: segments.flatMap((s) => (s.kind === 'callout' && s.tone === 'decision' ? [s.text] : [])),
    directives: segments.flatMap((s) => (s.kind === 'live' ? [{ name: s.name, arg: s.arg }] : [])),
  };
}

export const chapters: ManualChapter[] = Object.entries(files).map(([k, raw]) => parse(strip(k), raw)).sort((a, b) => a.slug.localeCompare(b.slug, undefined, { numeric: true }));
export const chapterBySlug = (slug: string) => chapters.find((c) => c.slug === slug);
export const chapterByCode = (code: string) => chapters.find((c) => c.code === code);
export const chapterPath = (slug: string) => `/manual/${slug}`;
export const chaptersByPart = () => [...PARTS.map((p) => ({ ...p, chapters: chapters.filter((c) => c.part === p.key) })), { key: '' as const, label: 'Other', lead: '', chapters: chapters.filter((c) => !partOf(c.part)) }].filter((g) => g.chapters.length);
export const readingMinutes = (c: ManualChapter) => Math.max(1, Math.round(c.words / 180 + c.figures * 0.3 + c.directives.length * 0.5));

/** Role -> audience labels a chapter may list in `roles:` (all staff, front desk, groomer, manager, owner). Super admin reads everything. */
const AUDIENCE: Record<string, string[]> = { super_admin: ['*'], owner: ['owner', 'manager', 'all staff'], manager: ['manager', 'front desk', 'all staff'], front_desk: ['front desk', 'all staff'], groomer: ['groomer', 'all staff'], customer: [], public: [] };
export function chaptersForRole(role: string): ManualChapter[] {
  const want = AUDIENCE[role] ?? [];
  if (want.includes('*')) return chapters;
  return chapters.filter((c) => c.roles.some((r) => want.includes(r.toLowerCase())));
}

/** Every decision flagged in a chapter (`> DECISION NEEDED:`), for the pending page. */
export const allDecisions = () => chapters.flatMap((c) => c.decisions.map((text, i) => ({ chapter: c, text, index: i + 1 })));
export const allPlaceholders = () => chapters.flatMap((c) => c.placeholders.map((p) => ({ chapter: c, ...p })));

/** Draft chapters other modules dropped in docs/ops-manual/en/_pending (merged by the integrator). */
export const pendingDrafts = Object.entries(drafts).map(([k, raw]) => { const path = strip(k); const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path.split('/').pop()!; return { path, title, source: raw, words: (raw.match(/\S+/g) ?? []).length }; }).filter((d) => !/README\.md$/.test(d.path));

/** URL of docs/screenshots/<code>/<width>.jpg when the capture exists (phone width for C- codes). */
export function shotUrl(code: string, width?: number): string | undefined {
  const w = width ?? (code.startsWith('C-') ? 390 : 1280);
  const want = `docs/screenshots/${code}/${w}.jpg`;
  const alt = `docs/screenshots/${code}/${w === 1280 ? 390 : 1280}.jpg`;
  let hitAlt: string | undefined;
  for (const [k, url] of Object.entries(shots)) { const p = strip(k); if (p === want) return url; if (p === alt) hitAlt = url; }
  return hitAlt;
}
export const shotRoute = (code: string) => getRouteByCode(code)?.path;
export const assetByPath = (path: string): string | undefined => { const hit = Object.entries(shots).find(([k]) => strip(k) === path); return hit?.[1]; };

/** Plain-text search across title, summary and body. */
export function searchChapters(q: string): ManualChapter[] {
  const n = q.trim().toLowerCase(); if (n.length < 2) return [];
  return chapters.filter((c) => `${c.title} ${c.summary} ${c.code} ${c.roles.join(' ')} ${c.body}`.toLowerCase().includes(n));
}
