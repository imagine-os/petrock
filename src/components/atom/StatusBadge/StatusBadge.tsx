import type { BookingStatus } from '../../../domain/booking';
import { BOOKING_STATUS_CUSTOMER_LABEL, BOOKING_STATUS_LABEL } from '../../../domain/booking';
import '../Badge/Badge.css';

export interface StatusBadgeProps { status: BookingStatus | string; /** Customer-facing vocabulary (R-I04). */ customer?: boolean; size?: 'sm' | 'md'; /** fill = desk table badge r4 (default); pill = Figma white pill with dot (pet cards); text = coloured text (home booking cards). */ variant?: 'fill' | 'pill' | 'text' }

/** Booking status badge; the one lifecycle vocabulary every surface uses (R-I01 colours, R-I04 customer labels). */
export function StatusBadge({ status, customer = false, size, variant = 'fill' }: StatusBadgeProps) {
  const s = status as BookingStatus;
  const staff = BOOKING_STATUS_LABEL[s] ?? status;
  const label = customer ? (BOOKING_STATUS_CUSTOMER_LABEL[s] ?? staff) : staff;
  return <span className={`badge badge-status badge-${size ?? 'md'} badge-${variant}`} data-status={status} title={customer ? staff : undefined}>{variant !== 'text' && <span className="badge-dot" aria-hidden />}{label}</span>;
}
