import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './AccountMenuRow.css';

export interface AccountMenuRowProps {
  icon: IconName;
  label: ReactNode;
  description?: ReactNode;
  /** Value shown before the chevron (e.g. current language). */
  value?: ReactNode;
  /** Replaces the chevron (Toggle, Badge...). */
  trailing?: ReactNode;
  to?: string;
  onClick?: () => void;
  tone?: 'default' | 'primary' | 'accent' | 'danger';
  disabled?: boolean;
  className?: string;
}

/** One row of the profile / settings menus: coloured line icon, label, optional description, value and chevron (Figma Settings list). */
export function AccountMenuRow({ icon, label, description, value, trailing, to, onClick, tone = 'default', disabled = false, className = '' }: AccountMenuRowProps) {
  const body = (
    <>
      <span className={`acctrow-icon acctrow-icon-${tone}`} aria-hidden><Icon name={icon} size={20} /></span>
      <span className="acctrow-text"><span className="acctrow-label">{label}</span>{description && <span className="acctrow-desc">{description}</span>}</span>
      {value != null && <span className="acctrow-value">{value}</span>}
      {trailing !== undefined ? <span className="acctrow-trailing">{trailing}</span> : (to || onClick) ? <Icon name="chevron-right" size={18} className="acctrow-chevron" /> : null}
    </>
  );
  const cls = `acctrow acctrow-${tone} ${disabled ? 'is-disabled' : ''} ${className}`;
  if (to && !disabled) return <Link to={to} className={cls}>{body}</Link>;
  if (onClick) return <button type="button" className={cls} onClick={onClick} disabled={disabled}>{body}</button>;
  return <div className={cls}>{body}</div>;
}
