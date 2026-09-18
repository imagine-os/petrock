import { Link } from 'react-router-dom';
import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import './ManualChapterCard.css';

export interface ManualChapterCardProps { to: string; code: string; number: string; title: string; summary?: string; roles?: string[]; minutes?: number; figures?: number; placeholders?: number; decisions?: number; completed?: boolean; recommended?: boolean }

/** Chapter tile on the manual cover: number, code, title, summary, roles, reading time, capture and decision counts, completion tick. */
export function ManualChapterCard({ to, code, number, title, summary, roles = [], minutes, figures = 0, placeholders = 0, decisions = 0, completed, recommended }: ManualChapterCardProps) {
  return (
    <Link to={to} className={`chcard ${recommended ? 'is-recommended' : ''} ${completed ? 'is-done' : ''}`}>
      <div className="chcard-top"><span className="chcard-num">{number}</span><code className="chcard-code">{code}</code>{recommended && <Badge size="sm" tone="primary">For you</Badge>}{completed && <span className="chcard-done" title="Completed"><Icon name="check" size={14} /></span>}</div>
      <h3 className="chcard-title">{title}</h3>
      {summary && <p className="chcard-sum">{summary}</p>}
      <div className="chcard-meta">
        {roles.map((r) => <span key={r} className="chcard-role">{r}</span>)}
        {minutes != null && <span><Icon name="clock" size={12} /> {minutes} min</span>}
        {figures > 0 && <span><Icon name="image" size={12} /> {figures}</span>}
        {placeholders > 0 && <span className="tone-warn" title="Screens without a capture yet"><Icon name="image" size={12} /> {placeholders} to capture</span>}
        {decisions > 0 && <span className="tone-danger"><Icon name="flag" size={12} /> {decisions}</span>}
      </div>
    </Link>
  );
}
