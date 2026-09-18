// Every markdown file under docs/ at build time, plus images from screenshots and renders (Figma exports are 69 MB and stay out of the bundle).
const mdFiles = import.meta.glob<string>('../../../docs/**/*.md', { query: '?raw', import: 'default', eager: true });
const assets = import.meta.glob<string>(['../../../docs/screenshots/**/*.{png,jpg,jpeg,gif,svg,webp}', '../../../docs/figma/renders/**/*.{png,jpg,jpeg,gif,svg,webp}'], { query: '?url', import: 'default', eager: true });

const strip = (k: string) => k.replace(/^(\.\.\/)+/, ''); // -> 'docs/...'

export interface DocEntry { path: string; title: string; dir: string; source: string; meta: Record<string, string> }

/** `key: value` header lines at the top of a file (changelog entries) or inside `---` front matter. */
export function headerMeta(source: string): Record<string, string> {
  const fm = source.match(/^---\n([\s\S]*?)\n---/);
  const block = fm ? fm[1] : source.replace(/^# .*\n+/, '').split(/\n\s*\n/)[0];
  const meta: Record<string, string> = {};
  for (const line of block.split('\n')) { const m = line.match(/^(\w+):\s*(.+)$/); if (m) meta[m[1]] = m[2].trim(); }
  return meta;
}

function titleOf(path: string, source: string, meta: Record<string, string>): string {
  if (meta.title) return meta.title;
  const h = source.match(/^#\s+(.+)$/m);
  if (h) return h[1].trim();
  const base = path.split('/').pop()!.replace(/\.md$/, '');
  const num = base.match(/^(\d{4})-(.+)$/);
  return num ? `${num[1]} · ${num[2].replace(/-/g, ' ')}` : base;
}

export const docs: DocEntry[] = Object.entries(mdFiles).map(([k, source]) => {
  const path = strip(k);
  const meta = headerMeta(source);
  return { path, title: titleOf(path, source, meta), dir: path.split('/').slice(1, -1).join('/'), source, meta };
}).sort((a, b) => a.path.localeCompare(b.path));

export const assetUrl = (path: string): string | undefined => { const hit = Object.entries(assets).find(([k]) => strip(k) === path); return hit?.[1]; };

/** Every image under docs/screenshots grouped by page-code folder. */
export function screenshotGroups(): { code: string; files: { path: string; name: string; url: string }[] }[] {
  const out = new Map<string, { path: string; name: string; url: string }[]>();
  for (const [k, url] of Object.entries(assets)) {
    const path = strip(k);
    const m = path.match(/^docs\/screenshots\/([^/]+)\/([^/]+)$/);
    if (!m) continue;
    if (!out.has(m[1])) out.set(m[1], []);
    out.get(m[1])!.push({ path, name: m[2], url });
  }
  return [...out.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, files]) => ({ code, files: files.sort((a, b) => a.name.localeCompare(b.name)) }));
}

export const docByPath = (path: string) => docs.find((d) => d.path === path);
/** 'docs/rules/x.md' -> '/docs/rules/x' */
export const docsRoute = (path: string): string | undefined => (path.startsWith('docs/') ? `/docs/${path.slice(5).replace(/\.md$/, '')}` : undefined);

export interface DocTreeNode { name: string; path: string; children: DocTreeNode[]; doc?: DocEntry }
/** Folder tree for the sidebar. */
export function docTree(): DocTreeNode {
  const root: DocTreeNode = { name: 'docs', path: 'docs', children: [] };
  for (const d of docs) {
    const parts = d.path.split('/').slice(1);
    let node = root;
    parts.forEach((p, i) => {
      const isLeaf = i === parts.length - 1;
      let child = node.children.find((c) => c.name === p);
      if (!child) { child = { name: p, path: `${node.path}/${p}`, children: [] }; node.children.push(child); }
      if (isLeaf) child.doc = d;
      node = child;
    });
  }
  const sortNode = (n: DocTreeNode) => { n.children.sort((a, b) => (a.children.length ? 0 : 1) - (b.children.length ? 0 : 1) || a.name.localeCompare(b.name)); n.children.forEach(sortNode); };
  sortNode(root);
  return root;
}
