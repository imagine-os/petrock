/** Date helpers for the front desk: everything is shown in the browser's local day (the desk runs on-site). */
import { toIso } from '../../../components/molecule/DatePicker/DatePicker';

export const todayIso = () => toIso(new Date());
/** Local calendar day (YYYY-MM-DD) of an ISO timestamp. */
export const dayOf = (iso: string) => toIso(new Date(iso));
export const addDaysIso = (day: string, n: number) => { const d = new Date(day + 'T00:00:00'); d.setDate(d.getDate() + n); return toIso(d); };
export const diffDays = (a: string, b: string) => Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000);
export const fmtDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) => (iso ? new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('en-US', opts) : '—');
export const fmtDay = (day: string) => fmtDate(day, { weekday: 'short', month: 'short', day: 'numeric' });
export const fmtTime = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—');
export const fmtDateTime = (iso: string | null | undefined) => (iso ? `${fmtDate(iso)} · ${fmtTime(iso)}` : '—');
/** 'HH:MM' local time of an ISO timestamp (TimePicker value). */
export const hhmmOf = (iso: string) => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
/** Local day + 'HH:MM' -> ISO timestamp. */
export const combine = (day: string, hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); const d = new Date(day + 'T00:00:00'); d.setHours(h, m, 0, 0); return d.toISOString(); };
export const fmtHhmm = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
/** Sunday-based week start. */
export const weekStart = (day: string) => { const d = new Date(day + 'T00:00:00'); d.setDate(d.getDate() - d.getDay()); return toIso(d); };
