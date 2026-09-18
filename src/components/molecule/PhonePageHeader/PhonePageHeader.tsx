import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../../atom/IconButton/IconButton';
import './PhonePageHeader.css';

export interface PhonePageHeaderProps { title: string; backTo?: string | -1; actions?: ReactNode; subtitle?: ReactNode; sticky?: boolean; className?: string }

/** Customer-app page header (Figma: back chevron left, centred title): back link or history back, title, optional right actions. */
export function PhonePageHeader({ title, backTo, actions, subtitle, sticky = true, className = '' }: PhonePageHeaderProps) {
  const nav = useNavigate();
  return (
    <header className={`phead ${sticky ? 'is-sticky' : ''} ${className}`}>
      <div className="phead-row">
        <span className="phead-side">{backTo !== undefined && <IconButton icon="chevron-left" label="Back" onClick={() => (backTo === -1 ? nav(-1) : nav(backTo))} />}</span>
        <h1 className="phead-title">{title}</h1>
        <span className="phead-side phead-actions">{actions}</span>
      </div>
      {subtitle && <p className="phead-sub muted small">{subtitle}</p>}
    </header>
  );
}
