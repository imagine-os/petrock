import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Button } from '../../atom/Button/Button';
import { DatePicker } from '../DatePicker/DatePicker';
import './GroomingDateNav.css';

export interface GroomingDateNavProps { value: string; onChange: (isoDay: string) => void; /** Extra controls rendered after the navigator (filters, view toggle). */ children?: ReactNode; size?: 'sm' | 'md' }

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const shift = (day: string, n: number) => { const d = new Date(`${day}T12:00:00`); d.setDate(d.getDate() + n); return iso(d); };

/** Figma agenda / day-view navigator: calendar icon (opens the month picker), previous day, "Today" or "Mar 21, 2024", next day. */
export function GroomingDateNav({ value, onChange, children, size = 'md' }: GroomingDateNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = iso(new Date());
  const isToday = value === today;
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const label = isToday ? 'Today' : new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className={`gdatenav gdatenav-${size}`} ref={ref}>
      <div className="gdatenav-group" role="group" aria-label="Day navigator">
        <IconButton icon="calendar" label="Pick a date" size="sm" active={open} onClick={() => setOpen((o) => !o)} />
        <IconButton icon="arrow-left" label="Previous day" size="sm" onClick={() => onChange(shift(value, -1))} />
        <button type="button" className={`gdatenav-label ${isToday ? 'is-today' : ''}`} onClick={() => (isToday ? setOpen((o) => !o) : onChange(today))} title={isToday ? 'Pick a date' : 'Back to today'}>{label}</button>
        <IconButton icon="arrow-right" label="Next day" size="sm" onClick={() => onChange(shift(value, 1))} />
      </div>
      {open && (
        <div className="gdatenav-pop" role="dialog" aria-label="Choose a date">
          <DatePicker value={value} onChange={(d) => { onChange(d); setOpen(false); }} />
          <div className="row" style={{ justifyContent: 'space-between' }}><Button size="sm" variant="ghost" onClick={() => { onChange(today); setOpen(false); }}>Today</Button><Button size="sm" variant="secondary" onClick={() => setOpen(false)}>Close</Button></div>
        </div>
      )}
      {children && <div className="gdatenav-extra">{children}</div>}
    </div>
  );
}
