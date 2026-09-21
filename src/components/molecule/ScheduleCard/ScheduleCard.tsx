import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { Badge, type BadgeTone } from '../../atom/Badge/Badge';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import { IconButton } from '../../atom/IconButton/IconButton';
import './ScheduleCard.css';

/** Alert flags every schedule surface understands (R-G20 flag vocabulary). */
export interface ScheduleCardFlags {
  /** Vaccine expired / missing / to verify. */ vaccine?: boolean;
  /** Unconfirmed, note or conflict. */ warning?: boolean;
  /** Payment pending. */ payment?: boolean;
}
/** Back-compat alias for the old GroomAppointmentCard flag bag. */
export type GroomAppointmentFlags = ScheduleCardFlags;

export interface ScheduleCardChip { label: string; tone?: BadgeTone; title?: string }
export interface ScheduleCardAlert { key: string; label: string; tone: 'warn' | 'danger'; icon?: IconName }
export interface ScheduleCardAction { id: string; label: string; icon?: IconName; locked?: boolean; disabled?: boolean; onSelect: () => void }

export interface ScheduleCardProps {
  /** Lifecycle status: drives the 3 px left stripe (--status-*-fg) and the screen-reader suffix. */
  status: string;
  /** Row 1 left: time range, rendered in tabular numerals. */
  time?: string | null;
  /** Row 1 right: groomer / room chip. */
  assignee?: string | null;
  /** Groomer colour for the assignee chip dot. */
  assigneeColor?: string | null;
  /** Row 2: pet name (bold). */
  title: string;
  /** Row 2: breed, muted. */
  titleMeta?: string | null;
  /** Row 3: customer, muted small. */
  subtitle?: string | null;
  /** Row 4 left: package · size, room type, add-on count. */
  chips?: ScheduleCardChip[];
  /** Row 4 right: vaccine / unpaid badges - always a Badge with text, never a bare icon. */
  alerts?: ScheduleCardAlert[];
  /** Behind one 44 px "more" menu; never the only way to do something. */
  actions?: ScheduleCardAction[];
  menuLabel?: string;
  /** Compact cards show one chip only; with several alerts this template ({n}) is used instead. */
  manyAlertsLabel?: string;
  /** Full accessible name / tooltip (R-G20 label on the grooming surfaces). */
  tooltip?: string;
  /** One-line dense variant for the day grid. */
  compact?: boolean;
  selected?: boolean;
  draggable?: boolean;
  onOpen?: () => void;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: () => void;
  /** Extra node under the chips (rare). */
  children?: ReactNode;
  className?: string;
}

const FLAG_TEXT: Record<string, string> = { vaccine: 'Vaccine issue', warning: 'Needs attention', payment: 'Balance due' };
/** Turns the legacy flag bag into alert badges. */
export function flagAlerts(flags: ScheduleCardFlags = {}): ScheduleCardAlert[] {
  const out: ScheduleCardAlert[] = [];
  if (flags.vaccine) out.push({ key: 'vaccine', label: FLAG_TEXT.vaccine, tone: 'danger', icon: 'shield' });
  if (flags.warning) out.push({ key: 'warning', label: FLAG_TEXT.warning, tone: 'warn', icon: 'warning' });
  if (flags.payment) out.push({ key: 'payment', label: FLAG_TEXT.payment, tone: 'warn', icon: 'dollar' });
  return out;
}

/**
 * The one appointment / booking card used by every schedule surface (F-14 board, F-30 day grid, F-31 board).
 * Anatomy: 3 px lifecycle stripe · time + assignee · pet + breed · customer · chips + alert badges.
 * The card itself is a single button that opens the detail; per-card actions live behind one 44 px "more" menu,
 * so nothing is drag-only and nothing is hover-only (D-195).
 */
export function ScheduleCard({
  status, time, assignee, assigneeColor, title, titleMeta, subtitle, chips = [], alerts = [], actions = [],
  menuLabel = 'More actions', manyAlertsLabel = '{n} alerts', tooltip, compact = false, selected = false, draggable = false, onOpen, onDragStart, onDragEnd, children, className = '',
}: ScheduleCardProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  // the compact variant (day grid) must stay short: one chip, with every alert still in the accessible name
  const shown = compact && alerts.length > 1
    ? [{ key: 'many', label: manyAlertsLabel.replace('{n}', String(alerts.length)), tone: alerts.some((a) => a.tone === 'danger') ? 'danger' as const : 'warn' as const, icon: 'warning' as const }]
    : alerts;
  const name = [tooltip ?? [title, titleMeta, subtitle].filter(Boolean).join(' · '), ...alerts.map((a) => a.label)].join(' · ');
  const menu = actions.filter((a) => !a.disabled);

  return (
    <div ref={ref} className={`schedcard ${compact ? 'is-compact' : ''} ${selected ? 'is-selected' : ''} ${className}`} data-status={status}
      draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <button type="button" className="schedcard-main" onClick={onOpen} disabled={!onOpen} title={name} aria-label={name}>
        {(time || assignee) && (
          <span className="schedcard-row1">
            {time && <span className="schedcard-time tnum">{time}</span>}
            {assignee && <span className="schedcard-who">{assigneeColor && <span className="schedcard-whodot" style={{ background: assigneeColor }} aria-hidden />}{assignee}</span>}
          </span>
        )}
        <span className="schedcard-row2"><span className="schedcard-title">{title}</span>{titleMeta && <span className="schedcard-meta">{titleMeta}</span>}</span>
        {subtitle && <span className="schedcard-sub">{subtitle}</span>}
        {(chips.length > 0 || shown.length > 0) && (
          <span className="schedcard-row4">
            {chips.map((c) => <Badge key={c.label} size="sm" tone={c.tone ?? 'neutral'} title={c.title}>{c.label}</Badge>)}
            {shown.map((a) => <Badge key={a.key} size="sm" tone={a.tone} title={compact ? name : a.label} className="schedcard-alert"><span aria-hidden>{a.icon && <Icon name={a.icon} size={12} />}</span>{a.label}</Badge>)}
          </span>
        )}
        {children}
      </button>
      {menu.length > 0 && (
        <div className="schedcard-menuwrap">
          <IconButton icon="more" label={menuLabel} size="sm" className="schedcard-more" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} />
          {open && (
            <ul className="schedcard-menu" role="menu">
              {menu.map((a) => (
                <li key={a.id} role="none">
                  <button type="button" role="menuitem" className="schedcard-menuitem" onClick={() => { setOpen(false); a.onSelect(); }}>
                    {a.icon && <Icon name={a.icon} size={14} />}<span className="grow">{a.label}</span>{a.locked && <Icon name="lock" size={13} className="schedcard-lock" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
