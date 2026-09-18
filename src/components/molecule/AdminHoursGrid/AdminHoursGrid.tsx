import { Checkbox } from '../../atom/Checkbox/Checkbox';
import { TimePicker, fmt12 } from '../TimePicker/TimePicker';
import './AdminHoursGrid.css';

export type WeekHours = Record<string, { open: string; close: string } | null>;
export interface AdminHoursGridProps { value: WeekHours; onChange?: (v: WeekHours) => void; readOnly?: boolean; /** Copy Monday to every open weekday. */ tools?: boolean }
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Summarises hours as "Mon-Fri 7:00 AM-7:00 PM · Sat-Sun 9:00 AM-5:30 PM" style text. */
export function summarizeHours(h: WeekHours): string {
  const parts: string[] = [];
  let start = 0;
  const key = (i: number) => (h[i] ? `${h[i]!.open}-${h[i]!.close}` : 'closed');
  for (let i = 1; i <= 7; i++) {
    const d = i % 7;
    const next = (i + 1) % 7;
    if (i === 7 || key(d) !== key(next)) {
      const s = WEEKDAYS[start % 7].slice(0, 3), e = WEEKDAYS[d].slice(0, 3);
      const label = start % 7 === d ? s : `${s}-${e}`;
      parts.push(`${label} ${h[d] ? `${fmt12(h[d]!.open)}-${fmt12(h[d]!.close)}` : 'closed'}`);
      start = i + 1;
    }
  }
  return parts.join(' · ');
}

/** Weekly opening hours editor (R-K04): open flag + open / close time per weekday, copy-Monday and set-all shortcuts. */
export function AdminHoursGrid({ value, onChange, readOnly = false, tools = true }: AdminHoursGridProps) {
  const set = (day: number, v: { open: string; close: string } | null) => onChange?.({ ...value, [day]: v });
  if (readOnly) return <dl className="ahours-ro">{WEEKDAYS.map((d, i) => <div key={d} style={{ display: 'contents' }}><dt>{d.slice(0, 3)}</dt><dd>{value[i] ? `${fmt12(value[i]!.open)} - ${fmt12(value[i]!.close)}` : 'Closed'}</dd></div>)}</dl>;
  return (
    <div className="ahours">
      {tools && <div className="ahours-tools"><button type="button" onClick={() => { const m = value[1]; if (!m) return; const n = { ...value }; for (let i = 1; i <= 5; i++) n[i] = { ...m }; onChange?.(n); }}>Copy Monday to weekdays</button><button type="button" onClick={() => { const m = value[1] ?? { open: '07:00', close: '19:00' }; const n: WeekHours = {}; for (let i = 0; i < 7; i++) n[i] = { ...m }; onChange?.(n); }}>Open every day</button></div>}
      {WEEKDAYS.map((d, i) => {
        const h = value[i];
        return (
          <div key={d} className={`ahours-row ${h ? '' : 'is-closed'}`}>
            <Checkbox label={d} checked={!!h} onChange={(e) => set(i, e.target.checked ? { open: '07:00', close: '19:00' } : null)} />
            {h ? <><TimePicker size="sm" value={h.open} min="05:00" max="22:00" onChange={(t) => set(i, { ...h, open: t })} /><span className="ahours-sep">to</span><TimePicker size="sm" value={h.close} min="05:00" max="23:00" onChange={(t) => set(i, { ...h, close: t })} /></> : <span className="ahours-times">Closed</span>}
          </div>
        );
      })}
    </div>
  );
}
