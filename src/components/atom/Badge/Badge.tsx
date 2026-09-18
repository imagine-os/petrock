import type { ReactNode } from 'react';
import type { BookingStatus } from '../../../domain/booking';
import { BOOKING_STATUS_LABEL } from '../../../domain/booking';
import './Badge.css';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'accent';
export interface BadgeProps { tone?: BadgeTone; dot?: boolean; size?: 'sm' | 'md'; children?: ReactNode; className?: string; title?: string }

/** Small status label (R-I01 colours for bookings via StatusBadge). */
export function Badge({ tone = 'neutral', dot = false, size = 'md', children, className = '', title }: BadgeProps) {
  return <span className={`badge badge-${tone} badge-${size} ${className}`} title={title}>{dot && <span className="badge-dot" aria-hidden />}{children}</span>;
}

/** Booking status badge; the one vocabulary every surface uses. */
export function StatusBadge({ status, customer = false, size }: { status: BookingStatus | string; customer?: boolean; size?: 'sm' | 'md' }) {
  const s = status as BookingStatus;
  const label = BOOKING_STATUS_LABEL[s] ?? status;
  return <span className={`badge badge-status badge-${size ?? 'md'}`} data-status={status} title={customer ? label : undefined}><span className="badge-dot" aria-hidden />{label}</span>;
}

/** Generic tone for other enums (payment, vaccine, employee, rule status). */
export function toneFor(value: string): BadgeTone {
  if (['paid', 'verified', 'active', 'published', 'implemented', 'done', 'approved', 'succeeded'].includes(value)) return 'success';
  if (['pending', 'submitted', 'authorized', 'in_dev', 'on_leave', 'needs_details', 'in_progress', 'seen'].includes(value)) return 'warn';
  if (['expired', 'failed', 'rejected', 'inactive', 'archived', 'deprecated', 'void', 'refunded', 'missing'].includes(value)) return 'danger';
  if (['requested', 'draft', 'new', 'issued'].includes(value)) return 'info';
  return 'neutral';
}
