import { useEffect, useRef, useState } from 'react';
import { Button, type ButtonSize } from '../../atom/Button/Button';
import { Icon } from '../../atom/Icon/Icon';
import { BOOKING_STATUS_LABEL, BOOKING_TRANSITIONS, transitionNeedsPin, type BookingStatus } from '../../../domain/booking';
import './BookingStatusMenu.css';

export interface BookingStatusMenuProps {
  status: BookingStatus;
  onSelect: (to: BookingStatus) => void;
  /** Show the natural next step (Check in / Check out / Confirm) as a primary button beside the menu. */
  quick?: boolean;
  size?: ButtonSize;
  disabled?: boolean;
  align?: 'left' | 'right';
}

const QUICK: Partial<Record<BookingStatus, { to: BookingStatus; label: string }>> = { confirmed: { to: 'checked_in', label: 'Check in' }, checked_in: { to: 'checked_out', label: 'Check out' }, requested: { to: 'confirmed', label: 'Confirm' }, pending_vaccines: { to: 'confirmed', label: 'Confirm anyway' } };

/** "Set status to" menu from the timeline context menu: only allowed transitions, colour dot per status, lock when a manager PIN is needed (R-I06, R-I07). */
export function BookingStatusMenu({ status, onSelect, quick = false, size = 'sm', disabled = false, align = 'right' }: BookingStatusMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const options = BOOKING_TRANSITIONS[status] ?? [];
  const q = quick ? QUICK[status] : undefined;
  return (
    <div className={`statusmenu ${align === 'left' ? 'is-left' : ''}`} ref={ref}>
      {q && <Button size={size} disabled={disabled} icon={transitionNeedsPin(status, q.to) ? 'lock' : undefined} onClick={() => onSelect(q.to)}>{q.label}</Button>}
      <Button size={size} variant="secondary" iconRight={open ? 'chevron-up' : 'chevron-down'} disabled={disabled || options.length === 0} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>Set status</Button>
      {open && (
        <ul className="statusmenu-list" role="menu">
          <li className="statusmenu-current xs muted">Now: {BOOKING_STATUS_LABEL[status]}</li>
          {options.map((to) => (
            <li key={to} role="none">
              <button type="button" role="menuitem" className="statusmenu-item" onClick={() => { setOpen(false); onSelect(to); }}>
                <span className="statusmenu-dot" data-status={to} aria-hidden />
                <span className="grow">{BOOKING_STATUS_LABEL[to]}</span>
                {transitionNeedsPin(status, to) && <Icon name="lock" size={14} className="statusmenu-lock" title="Manager PIN needed" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
