import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import { StatusBadge } from '../../atom/Badge/Badge';
import { BOOKING_STATUS_CUSTOMER_LABEL, type BookingStatus } from '../../../domain/booking';
import './CustomerBookingCard.css';

export type CustomerBookingKind = 'hotel' | 'grooming' | 'daycare';
export interface CustomerBookingCardProps {
  kind: CustomerBookingKind;
  title: string;
  pets: string;
  status: BookingStatus | string;
  /** Stay variant: check-in and check-out; appointment variant: a single date/time. */
  start: { date: string; time: string };
  end?: { date: string; time: string };
  location?: string;
  onClick?: () => void;
  footer?: ReactNode;
  className?: string;
}

const KIND_ICON: Record<CustomerBookingKind, IconName> = { hotel: 'svc-hotel', grooming: 'svc-spa', daycare: 'svc-daycare' };

/** Upcoming booking card on the customer Home (1824:40234, px Home Page.png): 160x230 white r10 with a 2 px #9D67EF border, 60 px line icon, Open Sans 600 14 title, "Pets:" line, coloured status text, 1 px divider, Check-in / Check-out columns with filled calendar + alarm icons. */
export function CustomerBookingCard({ kind, title, pets, status, start, end, location, onClick, footer, className = '' }: CustomerBookingCardProps) {
  const Tag = onClick ? 'button' : 'div';
  const label = BOOKING_STATUS_CUSTOMER_LABEL[status as BookingStatus] ?? status;
  return (
    <Tag type={onClick ? 'button' : undefined} className={`cbcard ${onClick ? 'is-interactive' : ''} ${className}`} onClick={onClick}>
      {kind !== 'hotel' && <span className="cbcard-kind" aria-hidden><Icon name="paw-filled" size={16} /></span>}
      <span className="cbcard-icon"><Icon name={KIND_ICON[kind]} size={60} strokeWidth={1.1} /></span>
      <span className="cbcard-title">{title}</span>
      <span className="cbcard-pets">Pets: {pets}</span>
      <span className="cbcard-meta">
        {location && <span className="cbcard-loc"><Icon name="location" size={12} /> {location}</span>}
        <span className="cbcard-status"><StatusBadge status={status} variant="text" customer /><span className="sr-only">{label}</span></span>
      </span>
      <span className={`cbcard-times ${end ? 'has-end' : ''}`}>
        <span className="cbcard-time"><span className="cbcard-time-label">{end ? 'Check-in' : 'Appointment'}</span><span><Icon name="calendar-filled" size={13} /> {start.date}</span><span><Icon name="clock-filled" size={13} /> {start.time}</span></span>
        {end && <span className="cbcard-time"><span className="cbcard-time-label">Check-out</span><span><Icon name="calendar-filled" size={13} /> {end.date}</span><span><Icon name="clock-filled" size={13} /> {end.time}</span></span>}
      </span>
      {footer}
    </Tag>
  );
}
