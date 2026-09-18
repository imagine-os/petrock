import { useState } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import { DatePicker, toIso } from '../DatePicker/DatePicker';
import { TimePicker, fmt12 } from '../TimePicker/TimePicker';
import './StayDatesCard.css';

export interface StayDatesValue { checkIn: string | null; checkInTime: string; checkOut: string | null; checkOutTime: string }
export interface StayDatesCardProps {
  value: StayDatesValue;
  onChange?: (v: StayDatesValue) => void;
  /** Opening hours for a given ISO day (null = closed); bounds the time pickers and disables closed days. */
  hoursFor?: (iso: string) => { open: string; close: string } | null;
  minDate?: string;
  error?: string | null;
  nights?: number;
  /** Summary only (estimate, detail). */
  readOnly?: boolean;
}

export const fmtDay = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) => (iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('en-US', opts) : '—');

/** Check-in / check-out card (Figma Choose Pets): two columns with date + time, an inline range calendar that fills check-in then check-out. */
export function StayDatesCard({ value, onChange, hoursFor, minDate, error, nights, readOnly = false }: StayDatesCardProps) {
  const [picking, setPicking] = useState<'in' | 'out'>(value.checkIn && !value.checkOut ? 'out' : 'in');
  const today = toIso(new Date());
  const min = minDate ?? today;
  const pick = (iso: string) => {
    if (!onChange) return;
    if (picking === 'in' || !value.checkIn || iso <= value.checkIn) {
      const nextOut = value.checkOut && value.checkOut > iso ? value.checkOut : null;
      onChange({ ...value, checkIn: iso, checkOut: nextOut }); setPicking('out');
    } else { onChange({ ...value, checkOut: iso }); setPicking('in'); }
  };
  const hIn = value.checkIn ? hoursFor?.(value.checkIn) : undefined;
  const hOut = value.checkOut ? hoursFor?.(value.checkOut) : undefined;
  const col = (which: 'in' | 'out') => {
    const date = which === 'in' ? value.checkIn : value.checkOut;
    const time = which === 'in' ? value.checkInTime : value.checkOutTime;
    const h = which === 'in' ? hIn : hOut;
    return (
      <div className={`staydates-col ${!readOnly && picking === which ? 'is-picking' : ''}`}>
        <div className="staydates-label">{which === 'in' ? 'Check in' : 'Check out'}</div>
        <button type="button" className="staydates-field" disabled={readOnly} onClick={() => setPicking(which)} aria-label={`Pick ${which === 'in' ? 'check-in' : 'check-out'} date`}>
          <Icon name="calendar" size={16} /><span>{date ? fmtDay(date, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select date'}</span>
        </button>
        {readOnly ? <div className="staydates-field is-static"><Icon name="clock" size={16} /><span>{fmt12(time)}</span></div>
          : <TimePicker value={time} min={h?.open ?? '06:00'} max={h?.close ?? '21:00'} onChange={(t) => onChange?.(which === 'in' ? { ...value, checkInTime: t } : { ...value, checkOutTime: t })} size="sm" />}
        {h === null && <div className="staydates-closed"><Icon name="warning" size={12} /> Closed that day</div>}
      </div>
    );
  };
  return (
    <div className={`staydates ${error ? 'has-error' : ''}`}>
      <div className="staydates-cols">{col('in')}{col('out')}</div>
      {nights != null && value.checkIn && value.checkOut && <div className="staydates-nights"><Icon name="moon" size={14} /> {nights} night{nights === 1 ? '' : 's'}</div>}
      {error && <div className="staydates-error">{error}</div>}
      {!readOnly && (
        <div className="staydates-cal">
          <div className="staydates-hint">{picking === 'in' ? 'Tap your check-in day' : 'Now tap your check-out day'}</div>
          <DatePicker value={value.checkIn} rangeEnd={value.checkOut} onChange={pick} min={min} disabledDates={(iso) => hoursFor?.(iso) === null} />
        </div>
      )}
    </div>
  );
}
