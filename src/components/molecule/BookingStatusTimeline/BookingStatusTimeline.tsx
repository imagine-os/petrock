import { BOOKING_STATUS_CUSTOMER_LABEL, BOOKING_STATUS_LABEL, type BookingStatus } from '../../../domain/booking';
import { Icon } from '../../atom/Icon/Icon';
import './BookingStatusTimeline.css';

export interface BookingStatusTimelineProps {
  status: BookingStatus | string;
  /** Customer wording (Pending verification / Upcoming / Staying now / Completed). */
  customer?: boolean;
  /** When each status was reached (ISO) for the caption under a step. */
  reachedAt?: Partial<Record<BookingStatus, string>>;
  /** Per-step help text for the current step. */
  hint?: string;
  compact?: boolean;
}

const MAIN: BookingStatus[] = ['requested', 'pending_vaccines', 'confirmed', 'checked_in', 'checked_out'];
const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '');

/** The ONE booking lifecycle drawn as a vertical timeline for a stay: requested -> pending vaccines -> confirmed -> checked in -> checked out, with a red terminal step for cancelled / no show. */
export function BookingStatusTimeline({ status, customer = true, reachedAt = {}, hint, compact = false }: BookingStatusTimelineProps) {
  const labels = customer ? BOOKING_STATUS_CUSTOMER_LABEL : BOOKING_STATUS_LABEL;
  const terminal = status === 'cancelled' || status === 'no_show';
  const idx = MAIN.indexOf(status as BookingStatus);
  // pending_vaccines is skipped visually when the stay went straight to confirmed
  const steps = MAIN.filter((s) => s !== 'pending_vaccines' || status === 'pending_vaccines' || !!reachedAt.pending_vaccines);
  return (
    <ol className={`bst ${compact ? 'is-compact' : ''}`} aria-label="Booking status">
      {steps.map((s) => {
        const state = terminal ? (reachedAt[s] ? 'done' : 'todo') : MAIN.indexOf(s) < idx ? 'done' : s === status ? 'current' : 'todo';
        return (
          <li key={s} className={`bst-step is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="bst-dot" aria-hidden>{state === 'done' ? <Icon name="check" size={11} strokeWidth={3} /> : null}</span>
            <div className="bst-text"><span className="bst-label">{labels[s]}</span>{(reachedAt[s] || (state === 'current' && hint)) && <span className="bst-cap">{state === 'current' && hint ? hint : fmt(reachedAt[s])}</span>}</div>
          </li>
        );
      })}
      {terminal && (
        <li className="bst-step is-terminal" aria-current="step">
          <span className="bst-dot" aria-hidden><Icon name="close" size={11} strokeWidth={3} /></span>
          <div className="bst-text"><span className="bst-label">{labels[status as BookingStatus]}</span>{(reachedAt[status as BookingStatus] || hint) && <span className="bst-cap">{hint ?? fmt(reachedAt[status as BookingStatus])}</span>}</div>
        </li>
      )}
    </ol>
  );
}
