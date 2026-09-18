import type { MouseEvent, KeyboardEvent } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import './GroomAppointmentCard.css';

export interface GroomAppointmentFlags { /** Red cross: vaccine expired / missing / to verify. */ vaccine?: boolean; /** Warning triangle: unconfirmed, note or conflict. */ warning?: boolean; /** Coin: payment pending. */ payment?: boolean }
export interface GroomAppointmentCardProps {
  /** R-G20 label "Owner Last, PET; Breed; Package Size". */
  label: string;
  subtitle?: string;
  timeLabel?: string;
  status: string;
  flags?: GroomAppointmentFlags;
  /** Left border tint (groomer colour). */
  color?: string | null;
  compact?: boolean;
  selected?: boolean;
  draggable?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  title?: string;
}

/** Appointment card for the grooming day view, board and agenda (Grooming.png card format and flag colours). */
export function GroomAppointmentCard({ label, subtitle, timeLabel, status, flags = {}, color, compact = false, selected = false, draggable = false, onClick, onDragStart, title }: GroomAppointmentCardProps) {
  const alert = flags.vaccine || (flags.warning && status === 'requested');
  const onKey = (e: KeyboardEvent) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } };
  const click = (e: MouseEvent) => { e.stopPropagation(); onClick?.(); };
  return (
    <div className={`gapcard ${compact ? 'is-compact' : ''} ${alert ? 'is-alert' : ''} ${selected ? 'is-selected' : ''} ${onClick ? 'is-clickable' : ''}`} data-status={status} style={color ? ({ ['--gapcard-tint' as string]: color } as React.CSSProperties) : undefined}
      role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onClick={onClick ? click : undefined} onKeyDown={onClick ? onKey : undefined} draggable={draggable} onDragStart={onDragStart} title={title ?? label}>
      <div className="gapcard-flags" aria-hidden>
        {flags.warning && <Icon name="warning" size={12} className="gapcard-flag tone-warn" />}
        {flags.payment && <Icon name="dollar" size={12} className="gapcard-flag tone-warn" />}
        {flags.vaccine && <Icon name="plus" size={12} className="gapcard-flag gapcard-cross" />}
      </div>
      <div className="gapcard-body">
        {timeLabel && <span className="gapcard-time">{timeLabel}</span>}
        <span className="gapcard-label">{label}</span>
        {subtitle && !compact && <span className="gapcard-sub">{subtitle}</span>}
      </div>
      <span className="sr-only">{status.replace('_', ' ')}{flags.vaccine ? ', vaccine issue' : ''}{flags.payment ? ', payment pending' : ''}</span>
    </div>
  );
}
