import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './EmptyState.css';

export interface EmptyStateProps { icon?: IconName; title: string; body?: ReactNode; action?: ReactNode; compact?: boolean }

/** Friendly empty / zero-results block (no pets yet, no bookings, no results). */
export function EmptyState({ icon = 'paw', title, body, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`empty ${compact ? 'is-compact' : ''}`} role="status">
      <span className="empty-icon" aria-hidden><Icon name={icon} size={compact ? 22 : 30} /></span>
      <h3 className="empty-title">{title}</h3>
      {body && <p className="empty-body">{body}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
