import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './NotificationRow.css';

/** Kind -> Figma filled icon (notification.png: Shield-Done for pet added, Calendar, User, Lable tag...). */
export const NOTIFICATION_KIND_ICON: Record<string, { icon: IconName; tone: 'primary' | 'success' | 'warn' | 'info' | 'accent' }> = {
  booking_confirmed: { icon: 'medal', tone: 'primary' }, checkin_reminder: { icon: 'calendar-filled', tone: 'primary' }, booking_status: { icon: 'svc-hotel', tone: 'primary' },
  payment: { icon: 'tag', tone: 'primary' }, receipt: { icon: 'tag', tone: 'primary' }, refund: { icon: 'tag', tone: 'accent' },
  vaccine_expiring: { icon: 'shield-filled', tone: 'accent' }, vaccine_verified: { icon: 'shield-filled', tone: 'primary' }, vaccine_submitted: { icon: 'shield-filled', tone: 'primary' }, vaccine_rejected: { icon: 'shield-filled', tone: 'accent' },
  pet_added: { icon: 'shield-filled', tone: 'primary' }, pet_approved: { icon: 'paw-filled', tone: 'primary' },
  chat: { icon: 'message-filled', tone: 'primary' }, photo: { icon: 'user-filled', tone: 'primary' }, promo: { icon: 'medal', tone: 'accent' }, system: { icon: 'info-filled', tone: 'primary' },
};

export interface NotificationRowProps {
  kind: string;
  title: ReactNode;
  body?: ReactNode;
  time: ReactNode;
  read?: boolean;
  onClick?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/** Notification row (Figma 549:7669 / notification.png): 44 px disc (white 1 px #DFDFDF with a purple icon; filled #9D67EF with a white icon while unread), Be Vietnam Pro 500 16 navy title, 12 px muted time, 1 px rule, no row tint (R-M07, R-M08). */
export function NotificationRow({ kind, title, body, time, read = true, onClick, onDismiss, className = '' }: NotificationRowProps) {
  const k = NOTIFICATION_KIND_ICON[kind] ?? NOTIFICATION_KIND_ICON.system;
  return (
    <div className={`ntfrow ${read ? '' : 'is-unread'} ${className}`}>
      <button type="button" className="ntfrow-main" onClick={onClick} disabled={!onClick}>
        <span className={`ntfrow-icon ntfrow-icon-${k.tone}`} aria-hidden><Icon name={k.icon} size={22} /></span>
        <span className="ntfrow-text">
          <span className="ntfrow-title">{title}</span>
          {body && <span className="ntfrow-body">{body}</span>}
          <span className="ntfrow-time">{time}</span>
        </span>
        {!read && <span className="sr-only">Unread</span>}
      </button>
      {onDismiss && <button type="button" className="ntfrow-dismiss" onClick={onDismiss} aria-label="Dismiss"><Icon name="close" size={14} /></button>}
    </div>
  );
}
