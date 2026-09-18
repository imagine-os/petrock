import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../atom/Icon/Icon';
import { Avatar } from '../../atom/Avatar/Avatar';
import './ChatConversationRow.css';

export interface ChatConversationRowProps {
  title: ReactNode;
  preview?: ReactNode;
  time?: ReactNode;
  unread?: number;
  avatarUrl?: string | null;
  /** Person avatar (customer name on the staff side) instead of the building mark. */
  personName?: string;
  to?: string;
  onClick?: () => void;
  /** Muted "You: " prefix when the preview is the customer's own last message. */
  previewPrefix?: string;
  className?: string;
}

/** Inbox row: location / person avatar, title, last message preview, relative time and unread count (Figma Inbox). */
export function ChatConversationRow({ title, preview, time, unread = 0, avatarUrl, personName, to, onClick, previewPrefix, className = '' }: ChatConversationRowProps) {
  const body = (
    <>
      {personName ? <Avatar name={personName} src={avatarUrl} size={44} /> : <span className="convrow-mark" aria-hidden>{avatarUrl ? <img src={avatarUrl} alt="" /> : <Icon name="building" size={22} />}</span>}
      <span className="convrow-text">
        <span className="convrow-top"><span className={`convrow-title ${unread ? 'is-unread' : ''}`}>{title}</span>{time && <span className="convrow-time">{time}</span>}</span>
        <span className="convrow-bottom"><span className={`convrow-preview ${unread ? 'is-unread' : ''}`}>{previewPrefix && <span className="convrow-prefix">{previewPrefix}</span>}{preview ?? <span className="faint">No messages yet</span>}</span>{unread > 0 && <span className="convrow-unread" aria-label={`${unread} unread`}>{unread > 99 ? '99+' : unread}</span>}</span>
      </span>
    </>
  );
  const cls = `convrow ${className}`;
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  return <button type="button" className={cls} onClick={onClick}>{body}</button>;
}
