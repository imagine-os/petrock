import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './AccountMenuRow.css';

/** Outline names -> the Figma filled settings-row exports (Setting.svg, Lock.svg, Logout.svg, Trash Bin.svg, User-1.svg, Users.svg, Info-Circle.svg, Qustion-Circle.svg, Moon.svg...). */
export const FILLED_ICON: Partial<Record<string, IconName>> = {
  settings: 'settings-filled', lock: 'lock-filled', logout: 'logout-filled', trash: 'trash-filled', user: 'user-filled', users: 'users-filled', info: 'info-filled', question: 'question-filled',
  moon: 'moon-filled', shield: 'shield-filled', calendar: 'calendar-filled', message: 'message-filled', paw: 'paw-filled', star: 'medal', clock: 'clock-filled', 'chevron-right': 'row-chevron', edit: 'user-filled', location: 'tag', globe: 'category',
};

export interface AccountMenuRowProps {
  icon: IconName;
  label: ReactNode;
  description?: ReactNode;
  /** Value shown at the right (e.g. current language). */
  value?: ReactNode;
  /** Replaces the chevron slot (Toggle, Badge...). */
  trailing?: ReactNode;
  to?: string;
  onClick?: () => void;
  /** Icon colour: default / primary = #9D67EF purple, accent / danger = #FD866E coral (Figma rows alternate). */
  tone?: 'default' | 'primary' | 'accent' | 'danger';
  /** Show the grey row chevron (Figma settings rows have none; default false). */
  chevron?: boolean;
  disabled?: boolean;
  className?: string;
}

/** One row of the profile / settings menus (Figma profile.jpg / setting.jpg): 68 tall, 24 px gutter, 20 px filled icon (purple / coral), Be Vietnam Pro 500 16 navy label, 1 px #DFDFDF rule, no chevron. */
export function AccountMenuRow({ icon, label, description, value, trailing, to, onClick, tone = 'default', chevron = false, disabled = false, className = '' }: AccountMenuRowProps) {
  const body = (
    <>
      <span className={`acctrow-icon acctrow-icon-${tone}`} aria-hidden><Icon name={FILLED_ICON[icon] ?? icon} size={20} /></span>
      <span className="acctrow-text"><span className="acctrow-label">{label}</span>{description && <span className="acctrow-desc">{description}</span>}</span>
      {value != null && <span className="acctrow-value">{value}</span>}
      {trailing !== undefined ? <span className="acctrow-trailing">{trailing}</span> : chevron && (to || onClick) ? <Icon name="row-chevron" size={18} className="acctrow-chevron" /> : null}
    </>
  );
  const cls = `acctrow acctrow-${tone} ${disabled ? 'is-disabled' : ''} ${className}`;
  if (to && !disabled) return <Link to={to} className={cls}>{body}</Link>;
  if (onClick) return <button type="button" className={cls} onClick={onClick} disabled={disabled}>{body}</button>;
  return <div className={cls}>{body}</div>;
}
