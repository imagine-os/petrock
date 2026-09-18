import './ManualToc.css';

export interface ManualTocHeading { id: string; text: string; level?: 2 | 3 }
export interface ManualTocProps { headings: ManualTocHeading[]; active?: string; title?: string }

/** In-page table of contents for a chapter: anchors to `##` headings; sticky on desktop, a compact list on phones. */
export function ManualToc({ headings, active, title = 'On this page' }: ManualTocProps) {
  if (!headings.length) return null;
  return (
    <nav className="toc" aria-label={title}>
      <div className="eyebrow">{title}</div>
      <ol>{headings.map((h) => <li key={h.id} className={`toc-l${h.level ?? 2} ${active === h.id ? 'is-active' : ''}`}><a href={`#${h.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', `#${h.id}`); }}>{h.text}</a></li>)}</ol>
    </nav>
  );
}
