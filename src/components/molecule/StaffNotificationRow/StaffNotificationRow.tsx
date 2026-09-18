import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './StaffNotificationRow.css';

export interface StaffNotificationRowProps { kind: string; title: string; body?: string | null; link?: string | null; read: boolean; sentAt: string; onOpen?: () => void; onToggleRead?: () => void }

/** Notification kind -> icon (R-M07 vocabulary). */
export const NOTIFICATION_ICON: Record<string, IconName> = { booking_confirmed: 'bed', booking_requested: 'bed', payment: 'dollar', vaccine_expiring: 'shield', vaccine_submitted: 'shield', pet_added: 'paw', message: 'message', review: 'star', feedback: 'feedback', system: 'info' };
export const NOTIFICATION_KIND_LABEL: Record<string, string> = { booking_confirmed: 'Booking confirmed', booking_requested: 'New booking', payment: 'Payment', vaccine_expiring: 'Vaccine expiring', vaccine_submitted: 'Vaccine proof', pet_added: 'Pet added', message: 'Message', review: 'Review', feedback: 'Feedback', system: 'System' };

/** "25 min ago", "3 h ago", "Yesterday", "4 days ago", then the date (R-M08). */
export function relativeTime(iso: string, now = new Date()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, now.getTime() - t);
  const min = Math.round(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24 && new Date(t).getDate() === now.getDate()) return `${h} h ago`;
  const days = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(new Date(t).getFullYear(), new Date(t).getMonth(), new Date(t).getDate()).getTime()) / 86400000);
  if (days <= 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: new Date(t).getFullYear() === now.getFullYear() ? undefined : 'numeric' });
}

/** One notification: kind icon, title, body, relative time, unread dot; click opens the link and marks read. */
export function StaffNotificationRow({ kind, title, body, link, read, sentAt, onOpen, onToggleRead }: StaffNotificationRowProps) {
  const inner = (
    <>
      <span className={`ntf-icon ntf-${kind}`}><Icon name={NOTIFICATION_ICON[kind] ?? 'bell'} size={18} /></span>
      <span className="ntf-text"><span className="ntf-title">{title}</span>{body && <span className="ntf-body">{body}</span>}<span className="ntf-meta"><span>{NOTIFICATION_KIND_LABEL[kind] ?? kind}</span><span aria-hidden>·</span><time dateTime={sentAt}>{relativeTime(sentAt)}</time></span></span>
    </>
  );
  return (
    <div className={`ntf ${read ? '' : 'is-unread'}`}>
      {link ? <Link to={link} className="ntf-main" onClick={onOpen}>{inner}</Link> : <button type="button" className="ntf-main" onClick={onOpen}>{inner}</button>}
      {onToggleRead && <button type="button" className="ntf-dot" onClick={onToggleRead} aria-label={read ? 'Mark unread' : 'Mark read'} title={read ? 'Mark unread' : 'Mark read'} />}
    </div>
  );
}
