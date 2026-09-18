import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { docs, docByPath, docsRoute, docTree, assetUrl, screenshotGroups, type DocTreeNode } from './docsIndex';
import { getRouteByCode } from '../../app/registry';
import { Card } from '../../components/molecule/Card/Card';
import { Icon } from '../../components/atom/Icon/Icon';
import { Chip } from '../../components/atom/Chip/Chip';
import { MarkdownViewer } from '../../components/organism/MarkdownViewer/MarkdownViewer';
import { Figure } from '../../components/molecule/Figure/Figure';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Input } from '../../components/atom/Input/Input';
import './docs.css';

function Tree({ node, active, depth = 0 }: { node: DocTreeNode; active: string; depth?: number }) {
  const [open, setOpen] = useState(depth < 1 || active.startsWith(node.path + '/'));
  if (node.doc && !node.children.length) return <li><Link to={docsRoute(node.doc.path)!} className={`docs-leaf ${active === node.doc.path ? 'is-active' : ''}`} title={node.doc.title}>{node.doc.title}</Link></li>;
  return (
    <li>
      <button type="button" className="docs-folder" onClick={() => setOpen((o) => !o)} aria-expanded={open}><Icon name={open ? 'chevron-down' : 'chevron-right'} size={12} />{node.name}<span className="faint" style={{ marginLeft: 'auto', textTransform: 'none', letterSpacing: 0 }}>{node.children.length}</span></button>
      {open && <ul>{node.children.map((c) => <Tree key={c.path} node={c} active={active} depth={depth + 1} />)}</ul>}
    </li>
  );
}

/** D-06: /docs and /docs/* - folder tree + rendered markdown (+ screenshots gallery at /docs/screenshots). */
export function DocsBrowser() {
  const { '*': splat = '' } = useParams();
  const path = splat ? `docs/${splat}.md` : 'docs/README.md';
  const doc = docByPath(path) ?? (splat ? docByPath(`docs/${splat}/README.md`) : undefined) ?? null;
  const tree = useMemo(() => docTree(), []);
  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => { const q = filter.trim().toLowerCase(); if (!q) return tree; const prune = (n: DocTreeNode): DocTreeNode | null => { if (n.doc && !n.children.length) return n.doc.title.toLowerCase().includes(q) || n.doc.path.toLowerCase().includes(q) ? n : null; const kids = n.children.map(prune).filter((x): x is DocTreeNode => !!x); return kids.length ? { ...n, children: kids } : null; }; return prune(tree) ?? { ...tree, children: [] }; }, [tree, filter]);
  const isGallery = splat === 'screenshots' || splat.startsWith('screenshots/');
  const dir = path.split('/').slice(0, -1).join('/');
  const resolveImage = (src: string) => { const clean = src.split('?')[0]; const abs = clean.startsWith('docs/') ? clean : clean.startsWith('/') ? clean.slice(1) : `${dir}/${clean}`.split('/').reduce<string[]>((acc, p) => { if (p === '..') acc.pop(); else if (p !== '.') acc.push(p); return acc; }, []).join('/'); return assetUrl(abs); };
  const resolveLink = (href: string) => { if (/^(https?:|mailto:|#)/.test(href)) return undefined; const clean = href.split('#')[0]; const abs = clean.startsWith('docs/') ? clean : `${dir}/${clean}`.split('/').reduce<string[]>((acc, p) => { if (p === '..') acc.pop(); else if (p !== '.') acc.push(p); return acc; }, []).join('/'); return docByPath(abs) ? docsRoute(abs) : docByPath(`${abs}/README.md`) ? docsRoute(`${abs}/README.md`)?.replace(/\/README$/, '') : undefined; };
  const codeMatch = doc?.path.match(/^docs\/pages\/([A-Z]+-\d+[a-z]?)\.md$/);
  const liveRoute = codeMatch ? getRouteByCode(codeMatch[1]) : undefined;

  return (
    <div className="docs">
      <aside className="docs-side"><div className="eyebrow" style={{ marginBottom: 6 }}>{docs.length} documents</div><Input size="sm" icon="search" placeholder="Filter titles" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter documents" /><div className="docs-tree" style={{ marginTop: 6 }}><ul><Tree key={filter} node={filtered} active={doc?.path ?? path} depth={filter ? -9 : 0} /></ul></div><div style={{ marginTop: 8 }}><Link to={`/dev/docs-search${filter ? `?q=${encodeURIComponent(filter)}` : ''}`} className="docs-leaf">Full-text search (D-18)</Link></div><div style={{ marginTop: 8 }}><Link to="/docs/screenshots" className="docs-leaf">Screenshots gallery</Link></div></aside>
      <main className="docs-main">
        {isGallery ? (
          <div className="stack">
            <PageHeader code="D-06" title="Screenshots" subtitle="docs/screenshots/<CODE>/<width>[-dark].jpg, taken by npm run screenshots." />
            {screenshotGroups().length === 0 && <EmptyState icon="image" title="No screenshots yet" body="Run npm run screenshots after npm run build." />}
            {screenshotGroups().map((g) => <Card key={g.code} padding="lg"><div className="row wrap" style={{ marginBottom: 12 }}><h2>{g.code}</h2>{getRouteByCode(g.code) && <Link to={getRouteByCode(g.code)!.path}><Chip size="sm" icon="external">open page</Chip></Link>}</div><div className="gallery">{g.files.map((f) => <Figure key={f.path} src={f.url} alt={`${g.code} ${f.name}`} caption={f.name} />)}</div></Card>)}
          </div>
        ) : doc ? (
          <Card className="docs-doc" padding="none">
            <div className="docs-crumbs">{doc.path.split('/').map((p, i, a) => <span key={i}>{i > 0 && ' / '}{i === a.length - 1 ? <strong>{p}</strong> : p}</span>)}{liveRoute && <Link to={liveRoute.path} style={{ marginLeft: 'auto' }}><Chip size="sm" icon="external">open {codeMatch![1]}</Chip></Link>}</div>
            {/^docs\/prompts\//.test(doc.path) && /^## Response\s*$/m.test(doc.source) ? (
              <div className="prompt-split"><div className="prompt-side is-prompt"><MarkdownViewer source={doc.source.split(/^## Response\s*$/m)[0]} resolveImage={resolveImage} resolveLink={resolveLink} /></div><div className="prompt-side"><div className="eyebrow">Response</div><MarkdownViewer source={doc.source.split(/^## Response\s*$/m)[1] ?? ''} resolveImage={resolveImage} resolveLink={resolveLink} /></div></div>
            ) : <MarkdownViewer source={doc.source} resolveImage={resolveImage} resolveLink={resolveLink} />}
          </Card>
        ) : (
          <div className="stack">
            <PageHeader code="D-06" title="Docs" subtitle={`Nothing at ${path}. Pick a document from the tree.`} />
            <div className="docs-index">{docs.filter((d) => d.dir === '').map((d) => <Link key={d.path} to={docsRoute(d.path)!}><Card interactive><strong>{d.title}</strong><span className="xs muted">{d.path}</span></Card></Link>)}</div>
          </div>
        )}
      </main>
    </div>
  );
}
