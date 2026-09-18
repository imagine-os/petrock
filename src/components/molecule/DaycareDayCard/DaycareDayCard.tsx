import type { ReactNode } from 'react';
import { Card } from '../Card/Card';
import { Badge, StatusBadge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import { fmt12 } from '../TimePicker/TimePicker';
import { fmtMoney } from '../../../pricing/engine';
import { BOOKING_STATUS_CUSTOMER_LABEL, type BookingStatus } from '../../../domain/booking';
import './DaycareDayCard.css';

export interface DaycareDayCardProps { code: string; date: string; checkIn: string; checkOut: string; itemLabel: string; petNames: string[]; locationName?: string; status: string; paymentStatus?: string; total: number; actions?: ReactNode; onOpen?: () => void; highlight?: boolean }

const fmtDay = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const hoursBetween = (a: string, b: string) => { const [h1, m1] = a.split(':').map(Number), [h2, m2] = b.split(':').map(Number); return Math.round(((h2 * 60 + m2) - (h1 * 60 + m1)) / 60 * 10) / 10; };

/** Daycare day card for history and detail: date, drop-off / pick-up, item (Full day / Half day / Play hour), pets, status, total, actions slot. */
export function DaycareDayCard({ code, date, checkIn, checkOut, itemLabel, petNames, locationName, status, paymentStatus, total, actions, onOpen, highlight = false }: DaycareDayCardProps) {
  return (
    <Card className={`daycard ${highlight ? 'is-highlight' : ''}`} padding="md" tint={highlight} onClick={onOpen} interactive={!!onOpen}>
      <div className="daycard-head">
        <div className="daycard-when"><Icon name="sun" size={16} /><strong>{fmtDay(date)}</strong></div>
        <StatusBadge status={status} size="sm" />
      </div>
      <div className="daycard-times"><span><Icon name="clock" size={14} /> {fmt12(checkIn)} – {fmt12(checkOut)}</span><Badge tone="primary" size="sm">{itemLabel} · {hoursBetween(checkIn, checkOut)} h</Badge></div>
      <div className="daycard-meta xs muted">
        <span><code>{code}</code></span>{locationName && <span><Icon name="location" size={12} /> {locationName}</span>}<span><Icon name="paw" size={12} /> {petNames.join(', ')}</span>
        <span>{BOOKING_STATUS_CUSTOMER_LABEL[status as BookingStatus] ?? status}</span>{paymentStatus && <Badge size="sm" tone={paymentStatus === 'paid' ? 'success' : 'warn'}>{paymentStatus === 'paid' ? 'Paid' : 'Pay at location'}</Badge>}
      </div>
      <div className="daycard-total"><span className="muted">Total incl. tax</span><strong>{fmtMoney(total)}</strong></div>
      {actions && <div className="daycard-actions" onClick={(e) => e.stopPropagation()}>{actions}</div>}
    </Card>
  );
}
