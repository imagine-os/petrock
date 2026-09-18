import { docs, docsRoute, type DocEntry } from '../docs/docsIndex';
import type { SearchHit } from '../../components/molecule/SearchHitList/SearchHitList';

export interface DocsSearchOptions { folder?: string; limit?: number }
const strip = (md: string) => md.replace(/```[\s\S]*?```/g, ' ').replace(/[#*_>`|]/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ');

export const docFolders = (): string[] => [...new Set(docs.map((d) => d.dir.split('/')[0] || '(root)'))].sort();

/** Plain full-text search over every bundled markdown file: ranks title hits above body hits, returns a snippet around the first match. */
export function searchDocs(query: string, opts: DocsSearchOptions = {}): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { d: DocEntry; score: number; matches: number; text: string; idx: number }[] = [];
  for (const d of docs) {
    const folder = d.dir.split('/')[0] || '(root)';
    if (opts.folder && folder !== opts.folder) continue;
    const text = strip(d.source); const lower = text.toLowerCase(); const title = d.title.toLowerCase();
    let score = 0, matches = 0, idx = -1;
    for (const t of terms) {
      if (title.includes(t)) score += 20;
      if (d.path.toLowerCase().includes(t)) score += 5;
      let i = lower.indexOf(t); if (i < 0 && !title.includes(t)) { score = -1; break; }
      if (idx < 0 && i >= 0) idx = i;
      while (i >= 0 && matches < 200) { matches++; i = lower.indexOf(t, i + t.length); }
    }
    if (score < 0) continue;
    score += Math.min(matches, 30);
    scored.push({ d, score, matches, text, idx });
  }
  scored.sort((a, b) => b.score - a.score || a.d.path.localeCompare(b.d.path));
  return scored.slice(0, opts.limit ?? 50).map(({ d, matches, text, idx }) => {
    const start = Math.max(0, (idx < 0 ? 0 : idx) - 90);
    const snippet = (start > 0 ? '… ' : '') + text.slice(start, start + 240).trim() + (start + 240 < text.length ? ' …' : '');
    return { key: d.path, title: d.title, to: docsRoute(d.path)!.replace(/\/README$/, ''), path: d.path, tag: d.dir.split('/')[0] || 'root', matches, snippet };
  });
}
