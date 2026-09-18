import { Link } from 'react-router-dom';
import { Badge } from '../../atom/Badge/Badge';
import './SearchHitList.css';

export interface SearchHit { key: string; title: string; to: string; path?: string; snippet: string; tag?: string; matches?: number }
export interface SearchHitListProps { hits: SearchHit[]; query: string; emptyText?: string }

/** Splits text on the query and wraps matches in <mark>. */
export function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'));
  return parts.map((p, i) => (p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : p));
}

/** D-18: result rows with title, path, folder tag, match count and a highlighted snippet. */
export function SearchHitList({ hits, query, emptyText = 'No matches.' }: SearchHitListProps) {
  if (!hits.length) return <p className="shl-empty small muted">{emptyText}</p>;
  return (
    <ol className="shl" aria-label={`${hits.length} results`}>
      {hits.map((h) => (
        <li key={h.key} className="shl-hit">
          <div className="shl-head"><Link to={h.to} className="shl-title">{highlight(h.title, query)}</Link>{h.tag && <Badge size="sm">{h.tag}</Badge>}{h.matches ? <span className="xs faint">{h.matches} {h.matches === 1 ? 'match' : 'matches'}</span> : null}</div>
          {h.path && <code className="shl-path">{h.path}</code>}
          <p className="shl-snippet">{highlight(h.snippet, query)}</p>
        </li>
      ))}
    </ol>
  );
}
