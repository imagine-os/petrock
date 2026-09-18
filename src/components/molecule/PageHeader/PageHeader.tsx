import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../atom/Icon/Icon';
import './PageHeader.css';

export interface PageHeaderProps { title: string; subtitle?: ReactNode; eyebrow?: ReactNode; actions?: ReactNode; backTo?: string; code?: string; children?: ReactNode }

/** Page title row: optional back link, eyebrow, title, subtitle, actions on the right; children = tabs / filters row. */
export function PageHeader({ title, subtitle, eyebrow, actions, backTo, code, children }: PageHeaderProps) {
  return (
    <header className="pagehead">
      <div className="pagehead-row">
        <div className="pagehead-text">
          {backTo && <Link to={backTo} className="pagehead-back"><Icon name="arrow-left" size={16} /> Back</Link>}
          {(eyebrow || code) && <div className="eyebrow row" style={{ gap: 8 }}>{code && <code className="pagehead-code">{code}</code>}{eyebrow}</div>}
          <h1 className="pagehead-title">{title}</h1>
          {subtitle && <p className="pagehead-sub muted">{subtitle}</p>}
        </div>
        {actions && <div className="pagehead-actions">{actions}</div>}
      </div>
      {children && <div className="pagehead-bar">{children}</div>}
    </header>
  );
}
