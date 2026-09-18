import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import { Badge } from '../../atom/Badge/Badge';
import { BOOKING_STATUS_CUSTOMER_LABEL, type BookingStatus } from '../../../domain/booking';
import './CustomerReservationCard.css';

export type ReservationKind = 'hotel' | 'grooming' | 'daycare';
export interface CustomerReservationCardProps {
  kind: ReservationKind;
  title: string;
  code?: string;
  pets: string[];
  status: BookingStatus | string;
  /** ISO start (check-in / appointment / daycare day). */
  start: string;
  /** ISO end (check-out) - stays only. */
  end?: string | null;
  locationName?: string;
  amount?: string;
  to?: string;
  /** Small right-side note (e.g. "Balance due $120"). */
  note?: string;
}

const KIND: Record<ReservationKind, { icon: IconName; label: string }> = { hotel: { icon: 'bed', label: 'Hotel stay' }, grooming: { icon: 'scissors', label: 'Grooming & Spa' }, daycare: { icon: 'sun', label: 'Daycare' } };
const fmtDT = (iso: string) => new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Reservation card for the customer app (Figma Upcoming Bookings): kind icon, title, pets, status chip, check-in / check-out (or one date+time), location and amount. Whole card links to the detail. */
export function CustomerReservationCard({ kind, title, code, pets, status, start, end, locationName, amount, to, note }: CustomerReservationCardProps) {
  const label = BOOKING_STATUS_CUSTOMER_LABEL[status as BookingStatus] ?? status;
  const body = (
    <>
      <div className="rescard-head">
        <span className="rescard-icon" aria-hidden><Icon name={KIND[kind].icon} size={18} /></span>
        <div className="rescard-titles"><span className="rescard-kind">{KIND[kind].label}{code ? ` · ${code}` : ''}</span><h3 className="rescard-title">{title}</h3></div>
        <span className="badge badge-status badge-sm rescard-status" data-status={status}><span className="badge-dot" aria-hidden />{label}</span>
      </div>
      <div className="rescard-pets"><Icon name="paw" size={14} /> {pets.length ? pets.join(', ') : 'No pets'}</div>
      <div className="rescard-when">
        <div><span className="rescard-when-l">{end ? 'Check-in' : 'When'}</span><span>{fmtDT(start)}</span></div>
        {end && <div><span className="rescard-when-l">Check-out</span><span>{fmtDT(end)}</span></div>}
      </div>
      {(locationName || amount || note) && <div className="rescard-foot">{locationName && <span className="row" style={{ gap: 4 }}><Icon name="location" size={13} /> {locationName}</span>}{note && <Badge size="sm" tone="warn">{note}</Badge>}{amount && <strong className="rescard-amount">{amount}</strong>}</div>}
    </>
  );
  return to ? <Link to={to} className="rescard is-link">{body}<Icon name="chevron-right" size={16} className="rescard-chev" /></Link> : <div className="rescard">{body}</div>;
}
