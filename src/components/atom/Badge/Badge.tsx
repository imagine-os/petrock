import type { ReactNode } from 'react';
import './Badge.css';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'accent' | 'completed';
export type BadgeVariant = 'fill' | 'pill' | 'text';
export interface BadgeProps { tone?: BadgeTone; dot?: boolean; size?: 'sm' | 'md'; /** fill = desk r4 tinted badge (default); pill = white mobile pill with dot; text = plain coloured text. */ variant?: BadgeVariant; children?: ReactNode; className?: string; title?: string }

/** Small status label (R-I01 colours for bookings via StatusBadge). Figma: desk badge 26 tall r4; mobile pill white with dot; text variant for the home cards. */
export function Badge({ tone = 'neutral', dot = false, size = 'md', variant = 'fill', children, className = '', title }: BadgeProps) {
  return <span className={`badge badge-${tone} badge-${size} badge-${variant} ${className}`} title={title}>{dot && <span className="badge-dot" aria-hidden />}{children}</span>;
}

/** Re-exported for compatibility; the component lives in atom/StatusBadge. */
export { StatusBadge } from '../StatusBadge/StatusBadge';

/** Generic tone for other enums (payment, vaccine, employee, rule status). */
export function toneFor(value: string): BadgeTone {
  if (['paid', 'verified', 'active', 'published', 'implemented', 'done', 'approved', 'succeeded'].includes(value)) return 'success';
  if (['completed', 'checked_out', 'finished'].includes(value)) return 'completed';
  if (['pending', 'submitted', 'authorized', 'in_dev', 'on_leave', 'needs_details', 'in_progress', 'seen'].includes(value)) return 'warn';
  if (['expired', 'failed', 'rejected', 'inactive', 'archived', 'deprecated', 'void', 'refunded', 'missing'].includes(value)) return 'danger';
  if (['requested', 'draft', 'new', 'issued'].includes(value)) return 'info';
  return 'neutral';
}
