import type { ReactNode } from 'react';
import './BookingInfoGrid.css';

export interface InfoItem { label: string; value: ReactNode; tone?: 'default' | 'success' | 'warn' | 'danger' | 'muted'; span?: 1 | 2 }
export interface BookingInfoGridProps { items: InfoItem[]; columns?: 2 | 3 | 4; dense?: boolean }

/** Key / value grid of the booking detail info card (Date · Time · Groomer / Payment status · Contact · Reason). Wraps to two columns on tablets and one on phones. */
export function BookingInfoGrid({ items, columns = 3, dense = false }: BookingInfoGridProps) {
  return (
    <dl className={`infogrid infogrid-${columns} ${dense ? 'is-dense' : ''}`}>
      {items.map((it) => (
        <div key={it.label} className={`infogrid-item ${it.span === 2 ? 'span-2' : ''}`}>
          <dt>{it.label}</dt>
          <dd className={it.tone && it.tone !== 'default' ? `tone-${it.tone}` : ''}>{it.value ?? <span className="faint">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
