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

const KIND_ICON: Record<CustomerBookingKind, IconName> = { hotel: 'bed', grooming: 'scissors', daycare: 'sun' };

/** Upcoming booking card on the customer Home: type icon, title, pets, customer-worded status, then check-in / check-out (stay) or one appointment slot. */
export function CustomerBookingCard({ kind, title, pets, status, start, end, location, onClick, footer, className = '' }: CustomerBookingCardProps) {
  const Tag = onClick ? 'button' : 'div';
  const label = BOOKING_STATUS_CUSTOMER_LABEL[status as BookingStatus] ?? status;
  return (
    <Tag type={onClick ? 'button' : undefined} className={`cbcard ${onClick ? 'is-interactive' : ''} ${className}`} onClick={onClick}>
      <span className="cbcard-icon"><Icon name={KIND_ICON[kind]} size={30} strokeWidth={1.5} /></span>
      <span className="cbcard-title">{title}</span>
      <span className="cbcard-pets">Pets: {pets}</span>
      <span className="cbcard-status"><StatusBadge status={status} size="sm" customer /><span className="sr-only">{label}</span></span>
      {location && <span className="cbcard-loc"><Icon name="location" size={12} /> {location}</span>}
      <span className={`cbcard-times ${end ? 'has-end' : ''}`}>
        <span className="cbcard-time"><span className="cbcard-time-label">{end ? 'Check-in' : 'Appointment'}</span><span><Icon name="calendar" size={12} /> {start.date}</span><span><Icon name="clock" size={12} /> {start.time}</span></span>
        {end && <span className="cbcard-time"><span className="cbcard-time-label">Check-out</span><span><Icon name="calendar" size={12} /> {end.date}</span><span><Icon name="clock" size={12} /> {end.time}</span></span>}
      </span>
      {footer}
    </Tag>
  );
}
