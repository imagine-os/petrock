import { fmt12 } from '../TimePicker/TimePicker';
import { EmptyState } from '../EmptyState/EmptyState';
import './GroomingSlotPicker.css';

export interface GroomingSlot { time: string; available: boolean; reason?: string }
export interface GroomingSlotPickerProps { slots: GroomingSlot[]; value: string | null; onChange: (hhmm: string) => void; label?: string; emptyText?: string }

/** Grid of start-time chips grouped Morning / Afternoon; unavailable slots stay visible but disabled with a reason. */
export function GroomingSlotPicker({ slots, value, onChange, label, emptyText = 'No times available on this day. Try another date or location.' }: GroomingSlotPickerProps) {
  const groups: [string, GroomingSlot[]][] = [['Morning', slots.filter((s) => Number(s.time.slice(0, 2)) < 12)], ['Afternoon', slots.filter((s) => Number(s.time.slice(0, 2)) >= 12)]].filter(([, xs]) => xs.length) as [string, GroomingSlot[]][];
  if (!slots.length) return <EmptyState compact icon="clock" title="Closed" body={emptyText} />;
  return (
    <div className="slotpicker" role="radiogroup" aria-label={label ?? 'Start time'}>
      {label && <div className="field-label">{label}</div>}
      {groups.map(([g, xs]) => (
        <div key={g} className="slotpicker-group">
          <div className="eyebrow">{g}</div>
          <div className="slotpicker-grid">
            {xs.map((s) => (
              <button key={s.time} type="button" role="radio" aria-checked={value === s.time} className={`slot ${value === s.time ? 'is-selected' : ''} ${!s.available ? 'is-off' : ''}`} disabled={!s.available} title={!s.available ? s.reason : undefined} onClick={() => onChange(s.time)}>
                {fmt12(s.time)}
              </button>
            ))}
          </div>
        </div>
      ))}
      {slots.every((s) => !s.available) && <p className="xs muted">{emptyText}</p>}
    </div>
  );
}
