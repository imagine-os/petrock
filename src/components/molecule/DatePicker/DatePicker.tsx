import { useId, useState } from 'react';
import { IconButton } from '../../atom/IconButton/IconButton';
import './DatePicker.css';

export interface DatePickerProps { label?: string; value: string | null; onChange: (iso: string) => void; min?: string; max?: string; /** Highlight a range end (check-out) while picking. */ rangeEnd?: string | null; disabledDates?: (iso: string) => boolean; inline?: boolean }

const pad = (n: number) => String(n).padStart(2, '0');
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Simple month grid date picker (check-in / check-out, daycare date). Inline by default; no external library. */
export function DatePicker({ label, value, onChange, min, max, rangeEnd, disabledDates }: DatePickerProps) {
  const id = useId();
  const today = toIso(new Date());
  const start = value ? new Date(value + 'T00:00:00') : new Date();
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const first = new Date(view.y, view.m, 1);
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => toIso(new Date(view.y, view.m, i + 1)))];
  const move = (d: number) => setView((v) => { const n = new Date(v.y, v.m + d, 1); return { y: n.getFullYear(), m: n.getMonth() }; });
  const inRange = (iso: string) => !!value && !!rangeEnd && iso > value && iso < rangeEnd;
  return (
    <div className="datepicker" role="group" aria-labelledby={label ? `${id}-l` : undefined}>
      {label && <div className="field-label" id={`${id}-l`}>{label}</div>}
      <div className="datepicker-head">
        <IconButton icon="chevron-left" label="Previous month" size="sm" onClick={() => move(-1)} />
        <strong>{MONTHS[view.m]} {view.y}</strong>
        <IconButton icon="chevron-right" label="Next month" size="sm" onClick={() => move(1)} />
      </div>
      <div className="datepicker-grid" role="grid">
        {DOW.map((d) => <div key={d} className="datepicker-dow" role="columnheader">{d}</div>)}
        {cells.map((iso, i) => iso ? (
          <button key={iso} type="button" role="gridcell" className={`datepicker-day ${iso === value ? 'is-selected' : ''} ${iso === rangeEnd ? 'is-range-end' : ''} ${inRange(iso) ? 'is-in-range' : ''} ${iso === today ? 'is-today' : ''}`}
            disabled={(min ? iso < min : false) || (max ? iso > max : false) || !!disabledDates?.(iso)} onClick={() => onChange(iso)} aria-selected={iso === value} aria-label={iso}>
            {Number(iso.slice(8))}
          </button>
        ) : <span key={`e${i}`} aria-hidden />)}
      </div>
    </div>
  );
}
