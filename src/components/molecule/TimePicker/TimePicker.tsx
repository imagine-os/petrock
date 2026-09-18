import { Select } from '../../atom/Select/Select';

export interface TimePickerProps { label?: string; value: string; onChange: (hhmm: string) => void; min?: string; max?: string; stepMinutes?: number; size?: 'sm' | 'md' }

const pad = (n: number) => String(n).padStart(2, '0');
export const fmt12 = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${((h + 11) % 12) + 1}:${pad(m)} ${ap}`; };

/** Time of day as a select of slots (settings: 15-minute intervals, 12-hour labels, restricted window 07:00-20:00). */
export function TimePicker({ label, value, onChange, min = '06:00', max = '21:00', stepMinutes = 15, size }: TimePickerProps) {
  const [minH, minM] = min.split(':').map(Number); const [maxH, maxM] = max.split(':').map(Number);
  const options: { value: string; label: string }[] = [];
  for (let t = minH * 60 + minM; t <= maxH * 60 + maxM; t += stepMinutes) { const v = `${pad(Math.floor(t / 60))}:${pad(t % 60)}`; options.push({ value: v, label: fmt12(v) }); }
  if (value && !options.some((o) => o.value === value)) options.unshift({ value, label: fmt12(value) });
  return <Select label={label} value={value} onChange={(e) => onChange(e.target.value)} options={options} size={size} />;
}
