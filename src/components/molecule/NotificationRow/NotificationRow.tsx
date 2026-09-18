import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './NotificationRow.css';

export const NOTIFICATION_KIND_ICON: Record<string, { icon: IconName; tone: 'primary' | 'success' | 'warn' | 'info' | 'accent' }> = {
  booking_confirmed: { icon: 'star', tone: 'primary' }, checkin_reminder: { icon: 'calendar', tone: 'info' }, booking_status: { icon: 'bed', tone: 'primary' },
  payment: { icon: 'dollar', tone: 'success' }, receipt: { icon: 'card', tone: 'success' }, refund: { icon: 'dollar', tone: 'warn' },
  vaccine_expiring: { icon: 'shield', tone: 'warn' }, vaccine_verified: { icon: 'shield', tone: 'success' }, vaccine_submitted: { icon: 'shield', tone: 'info' }, vaccine_rejected: { icon: 'warning', tone: 'warn' },
  pet_added: { icon: 'paw', tone: 'primary' }, pet_approved: { icon: 'paw', tone: 'success' },
  chat: { icon: 'message', tone: 'primary' }, photo: { icon: 'image', tone: 'accent' }, promo: { icon: 'sparkle', tone: 'accent' }, system: { icon: 'info', tone: 'info' },
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

/** Notification centre row: kind icon in a tinted circle (filled while unread), title, body, relative time, unread dot (R-M07, R-M08). */
export function NotificationRow({ kind, title, body, time, read = true, onClick, onDismiss, className = '' }: NotificationRowProps) {
  const k = NOTIFICATION_KIND_ICON[kind] ?? NOTIFICATION_KIND_ICON.system;
  return (
    <div className={`ntfrow ${read ? '' : 'is-unread'} ${className}`}>
      <button type="button" className="ntfrow-main" onClick={onClick} disabled={!onClick}>
        <span className={`ntfrow-icon ntfrow-icon-${k.tone}`} aria-hidden><Icon name={k.icon} size={20} /></span>
        <span className="ntfrow-text">
          <span className="ntfrow-title">{title}</span>
          {body && <span className="ntfrow-body">{body}</span>}
          <span className="ntfrow-time">{time}</span>
        </span>
        {!read && <span className="ntfrow-dot" aria-label="Unread" />}
      </button>
      {onDismiss && <button type="button" className="ntfrow-dismiss" onClick={onDismiss} aria-label="Dismiss"><Icon name="close" size={14} /></button>}
    </div>
  );
}
