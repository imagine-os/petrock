import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './StatTile.css';

export interface StatTileProps { label: string; value: ReactNode; delta?: { value: string; positive?: boolean }; icon?: IconName; hint?: string; tone?: 'default' | 'primary'; onClick?: () => void }

/** KPI tile (front desk-4: Today's Hotel Revenue, Total Rooms, Available Rooms, New Bookings). */
export function StatTile({ label, value, delta, icon, hint, tone = 'default', onClick }: StatTileProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`stat stat-${tone}`} onClick={onClick} type={onClick ? 'button' : undefined}>
      <div className="stat-top"><span className="stat-label">{label}</span>{icon && <span className="stat-icon"><Icon name={icon} size={18} /></span>}</div>
      <div className="stat-value">{value}</div>
      {(delta || hint) && <div className="stat-foot">{delta && <span className={`stat-delta ${delta.positive === false ? 'is-neg' : 'is-pos'}`}>{delta.value}</span>}{hint && <span className="stat-hint">{hint}</span>}</div>}
    </Tag>
  );
}
