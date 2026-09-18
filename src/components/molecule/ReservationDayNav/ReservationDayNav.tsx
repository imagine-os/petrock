import { useEffect, useRef, useState } from 'react';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Icon } from '../../atom/Icon/Icon';
import { DatePicker, toIso } from '../DatePicker/DatePicker';
import './ReservationDayNav.css';

export interface ReservationDayNavProps {
  /** Selected day, YYYY-MM-DD. */
  value: string;
  onChange: (day: string) => void;
  /** Days moved per arrow (1 for a day view, 7 for a week view). */
  step?: number;
  /** When set, the label shows a range of this many days starting at value. */
  rangeDays?: number;
  size?: 'sm' | 'md';
}

const fmt = (day: string, o: Intl.DateTimeFormatOptions) => new Date(day + 'T00:00:00').toLocaleDateString('en-US', o);
const shift = (day: string, n: number) => { const d = new Date(day + 'T00:00:00'); d.setDate(d.getDate() + n); return toIso(d); };

/** Figma date navigator (calendar icon, <-, "Today" / "Feb 22, 2024", ->) with the month picker in a popover. */
export function ReservationDayNav({ value, onChange, step = 1, rangeDays, size = 'md' }: ReservationDayNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = toIso(new Date());
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const isToday = rangeDays ? value <= today && today < shift(value, rangeDays) : value === today;
  const label = rangeDays
    ? `${fmt(value, { month: 'short', day: 'numeric' })} – ${fmt(shift(value, rangeDays - 1), { month: 'short', day: 'numeric', year: 'numeric' })}`
    : isToday ? 'Today' : fmt(value, { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className={`daynav daynav-${size} ${isToday ? 'is-today' : ''}`} ref={ref}>
      <IconButton icon="calendar" label="Pick a date" size="sm" onClick={() => setOpen((o) => !o)} active={open} />
      <IconButton icon="arrow-left" label={`Previous ${step === 1 ? 'day' : `${step} days`}`} size="sm" onClick={() => onChange(shift(value, -step))} />
      <button type="button" className="daynav-label" onClick={() => (isToday && !rangeDays ? setOpen((o) => !o) : onChange(rangeDays ? shift(today, -new Date(today + 'T00:00:00').getDay()) : today))} title={isToday ? 'Pick a date' : 'Back to today'}>
        {label}{rangeDays && isToday && <span className="daynav-today-dot" aria-label="includes today" />}
      </button>
      <IconButton icon="arrow-right" label={`Next ${step === 1 ? 'day' : `${step} days`}`} size="sm" onClick={() => onChange(shift(value, step))} />
      {open && (
        <div className="daynav-pop" role="dialog" aria-label="Choose a date">
          <DatePicker value={value} onChange={(d) => { onChange(d); setOpen(false); }} />
          <button type="button" className="daynav-todaybtn" onClick={() => { onChange(today); setOpen(false); }}><Icon name="clock" size={14} /> Today</button>
        </div>
      )}
    </div>
  );
}
