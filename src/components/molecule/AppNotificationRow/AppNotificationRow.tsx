import { Icon, type IconName } from '../../atom/Icon/Icon';
import './AppNotificationRow.css';

export interface AppNotificationRowProps { kind: string; title: string; body?: string | null; when: string; read: boolean; onClick?: () => void; className?: string }

/** notifications.kind -> icon (R-M07). Unknown kinds fall back to the bell. */
export const NOTIFICATION_KIND_ICON: Record<string, IconName> = {
  pet_added: 'paw', pet_approved: 'shield', vaccine_verified: 'shield', vaccine_expiring: 'warning', vaccine_submitted: 'upload', booking_confirmed: 'star', booking_cancelled: 'close', payment: 'dollar', appointment_reminder: 'calendar', message: 'message', daycare: 'sun', system: 'info',
};

/** One row of the customer notification list: icon in a circle (filled when unread), title, optional body, relative time. */
export function AppNotificationRow({ kind, title, body, when, read, onClick, className = '' }: AppNotificationRowProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} className={`ntfrow ${read ? '' : 'is-unread'} ${onClick ? 'is-interactive' : ''} ${className}`} onClick={onClick} aria-label={onClick ? `${read ? '' : 'Unread: '}${title}` : undefined}>
      <span className="ntfrow-icon" aria-hidden><Icon name={NOTIFICATION_KIND_ICON[kind] ?? 'bell'} size={18} /></span>
      <span className="ntfrow-text">
        <span className="ntfrow-title">{title}</span>
        {body && <span className="ntfrow-body">{body}</span>}
        <span className="ntfrow-when">{when}</span>
      </span>
      {!read && <span className="ntfrow-dot" aria-hidden />}
    </Tag>
  );
}
