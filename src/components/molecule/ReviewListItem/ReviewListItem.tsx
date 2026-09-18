import type { ReactNode } from 'react';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge, toneFor } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { ReviewStars } from '../../atom/ReviewStars/ReviewStars';
import './ReviewListItem.css';

export interface ReviewListItemProps {
  rating: number; title?: string | null; body?: string | null; tags?: string[] | null; status?: string;
  customerName: string; customerCode?: string; when?: string; locationName?: string;
  /** Moderation mode shows Approve / Archive (reviews.jpg). */
  onApprove?: () => void; onArchive?: () => void; busy?: boolean; extra?: ReactNode; compact?: boolean;
}

const TAG_TONE: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'neutral'> = { Excellent: 'success', Amazing: 'info', Normal: 'warn', 'Not good': 'danger' };

/** One review row: date, customer, title + stars + tag chips + body, optional Approve / Archive actions (moderation queue) or a plain public card. */
export function ReviewListItem({ rating, title, body, tags, status, customerName, customerCode, when, locationName, onApprove, onArchive, busy, extra, compact }: ReviewListItemProps) {
  const moderation = !!(onApprove || onArchive);
  return (
    <article className={`review ${compact ? 'is-compact' : ''} ${moderation ? 'is-moderation' : ''}`}>
      {when && <div className="review-when"><span>{when}</span></div>}
      <div className="review-who"><Avatar name={customerName} size={40} /><div className="review-who-text">{customerCode && <span className="xs faint mono">{customerCode}</span>}<strong>{customerName}</strong>{locationName && <span className="xs muted">{locationName}</span>}</div></div>
      <div className="review-text">
        <div className="row wrap" style={{ gap: 8 }}>{title && <h3 className="review-title">{title}</h3>}{status && moderation && <Badge size="sm" tone={toneFor(status)}>{status}</Badge>}</div>
        <div className="row wrap" style={{ gap: 8 }}><ReviewStars rating={rating} />{(tags ?? []).map((t) => <Badge key={t} size="sm" tone={TAG_TONE[t] ?? 'neutral'}>{t}</Badge>)}</div>
        {body && <p className="review-body muted">{body}</p>}
        {extra}
      </div>
      {moderation && (
        <div className="review-actions">
          {onArchive && <Button variant="secondary" size="sm" onClick={onArchive} disabled={busy || status === 'archived'}>Archive</Button>}
          {onApprove && <Button size="sm" onClick={onApprove} disabled={busy || status === 'published'}>{status === 'published' ? 'Published' : 'Approve'}</Button>}
        </div>
      )}
    </article>
  );
}
