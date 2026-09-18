export const fmtDateLong = (iso: string) => new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
export const fmtDateShort = (iso: string) => new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
export const fmtTimeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
export const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDaysIso = (iso: string, n: number) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
/** Local ISO timestamp for a date + HH:MM. */
export const atLocal = (isoDate: string, hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); const d = new Date(isoDate + 'T00:00:00'); d.setHours(h, m, 0, 0); return d.toISOString(); };
export const hoursBetween = (a: string, b: string) => { const [h1, m1] = a.split(':').map(Number), [h2, m2] = b.split(':').map(Number); return Math.round((((h2 * 60 + m2) - (h1 * 60 + m1)) / 60) * 100) / 100; };
export const newCode = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
