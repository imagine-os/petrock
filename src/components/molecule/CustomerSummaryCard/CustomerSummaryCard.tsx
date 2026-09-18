import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../Card/Card';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge, toneFor } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import './CustomerSummaryCard.css';

export interface CustomerSummaryCardProps {
  name: string; email?: string | null; mobile?: string | null; status?: string; balance?: number; petsCount?: number; location?: string | null; since?: string | null;
  to?: string; actions?: ReactNode; children?: ReactNode; compact?: boolean;
}
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

/** Customer header card from the Figma booking detail (avatar, name, email) with phone, balance, pets and status. */
export function CustomerSummaryCard({ name, email, mobile, status, balance, petsCount, location, since, to, actions, children, compact = false }: CustomerSummaryCardProps) {
  const title = to ? <Link to={to} className="cuscard-name">{name}</Link> : <span className="cuscard-name">{name}</span>;
  return (
    <Card padding={compact ? 'sm' : 'md'} className={`cuscard ${compact ? 'is-compact' : ''}`}>
      <div className="cuscard-row">
        <Avatar name={name} size={compact ? 40 : 56} />
        <div className="cuscard-text">
          <div className="row wrap" style={{ gap: 8 }}>{title}{status && <Badge size="sm" tone={toneFor(status)}>{status}</Badge>}</div>
          <div className="cuscard-meta">
            {email && <span><Icon name="message" size={12} /> <a href={`mailto:${email}`}>{email}</a></span>}
            {mobile && <span><Icon name="phone" size={12} /> <a href={`tel:${mobile}`}>{mobile}</a></span>}
            {location && <span><Icon name="location" size={12} /> {location}</span>}
            {since && <span><Icon name="calendar" size={12} /> since {since}</span>}
          </div>
        </div>
        <div className="cuscard-stats">
          {petsCount != null && <div className="cuscard-stat"><span className="eyebrow">Pets</span><strong>{petsCount}</strong></div>}
          {balance != null && <div className="cuscard-stat"><span className="eyebrow">Balance</span><strong className={balance > 0 ? 'tone-danger' : balance < 0 ? 'tone-success' : ''}>{money(balance)}</strong></div>}
        </div>
        {actions && <div className="cuscard-actions">{actions}</div>}
      </div>
      {children}
    </Card>
  );
}
