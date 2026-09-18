import type { ReactNode } from 'react';
import { Card } from '../Card/Card';
import { StatusBadge } from '../../atom/Badge/Badge';
import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import { fmtMoney } from '../../../pricing/engine';
import { BOOKING_STATUS_CUSTOMER_LABEL, type BookingStatus } from '../../../domain/booking';
import './GroomingOrderCard.css';

export interface GroomingOrderPetLine { petName: string; packageName: string; size?: string | null; addons: string[]; amount: number }
export interface GroomingOrderCardProps { code: string; startsAt: string; locationName?: string; groomerName?: string | null; status: string; paymentStatus?: string; pets: GroomingOrderPetLine[]; total: number; actions?: ReactNode; onOpen?: () => void; highlight?: boolean }

const fmtWhen = (iso: string) => new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** History / detail card for a Grooming & Spa order (Figma "Your Past Spa/Grooming"): when, where, status, one line per pet with package + add-ons, total and action slot. */
export function GroomingOrderCard({ code, startsAt, locationName, groomerName, status, paymentStatus, pets, total, actions, onOpen, highlight = false }: GroomingOrderCardProps) {
  return (
    <Card className={`ordercard ${highlight ? 'is-highlight' : ''}`} padding="md" tint={highlight} onClick={onOpen} interactive={!!onOpen}>
      <div className="ordercard-head">
        <div className="ordercard-when"><Icon name="scissors" size={16} /><strong>{fmtWhen(startsAt)}</strong></div>
        <StatusBadge status={status} size="sm" />
      </div>
      <div className="ordercard-meta xs muted">
        <span><code>{code}</code></span>{locationName && <span><Icon name="location" size={12} /> {locationName}</span>}{groomerName && <span><Icon name="user" size={12} /> {groomerName}</span>}
        <span>{BOOKING_STATUS_CUSTOMER_LABEL[status as BookingStatus] ?? status}</span>{paymentStatus && <Badge size="sm" tone={paymentStatus === 'paid' ? 'success' : 'warn'}>{paymentStatus === 'paid' ? 'Paid' : 'Pay at location'}</Badge>}
      </div>
      <ul className="ordercard-pets">
        {pets.map((p, i) => (
          <li key={`${p.petName}-${i}`}>
            <span className="ordercard-pet"><strong>{p.petName}</strong> · {p.packageName}{p.size ? ` (${p.size})` : ''}{p.addons.length > 0 && <span className="muted"> + {p.addons.join(', ')}</span>}</span>
            <span className="ordercard-amt">{fmtMoney(p.amount)}</span>
          </li>
        ))}
      </ul>
      <div className="ordercard-total"><span className="muted">Total incl. tax{paymentStatus === 'paid' ? ' & fees' : ''}</span><strong>{fmtMoney(total)}</strong></div>
      {actions && <div className="ordercard-actions" onClick={(e) => e.stopPropagation()}>{actions}</div>}
    </Card>
  );
}
