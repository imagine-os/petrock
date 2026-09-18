import { Icon, type IconName } from '../../atom/Icon/Icon';
import './StaffNotificationItem.css';

export interface StaffNotificationItemProps { kind: string; title: string; body?: string | null; when: string; read: boolean; onOpen?: () => void; onToggleRead?: () => void }
const ICON: Record<string, IconName> = { message: 'message', new_booking: 'bed', booking_confirmed: 'check', appointment_requested: 'scissors', appointment_assigned: 'scissors', vaccine_submitted: 'shield', vaccine_expiring: 'warning', vaccine_rejected: 'warning', approval: 'key', payment: 'dollar', feedback: 'feedback', note: 'edit', system: 'info', pet_added: 'paw' };

/** One staff notification row: icon by kind, title, body, relative time, unread dot; click opens the link. */
export function StaffNotificationItem({ kind, title, body, when, read, onOpen, onToggleRead }: StaffNotificationItemProps) {
  return (
    <div className={`ntfitem ${read ? '' : 'is-unread'}`}>
      <button type="button" className="ntfitem-main" onClick={onOpen} aria-label={`${title}${read ? '' : ' (unread)'}`}>
        <span className="ntfitem-icon"><Icon name={ICON[kind] ?? 'bell'} size={16} /></span>
        <span className="ntfitem-text"><span className="ntfitem-title">{title}</span>{body && <span className="ntfitem-body">{body}</span>}</span>
        <span className="ntfitem-when">{when}</span>
      </button>
      {onToggleRead && <button type="button" className="ntfitem-dot" onClick={onToggleRead} aria-label={read ? 'Mark as unread' : 'Mark as read'} title={read ? 'Mark as unread' : 'Mark as read'} />}
    </div>
  );
}
