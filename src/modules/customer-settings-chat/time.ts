/** Relative and short time formatting for notifications and chat (R-M08): consistent grammar, locale-aware. */
export function relativeTime(iso: string | null | undefined, now: Date = new Date(), lang: 'en' | 'es' = 'en'): string {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Math.max(0, now.getTime() - d.getTime());
  const min = Math.floor(diff / 60000);
  const es = lang === 'es';
  if (min < 1) return es ? 'Ahora' : 'Just now';
  if (min < 60) return es ? `hace ${min} min` : `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24 && sameDay(d, now)) return es ? `hace ${h} h` : `${h} h ago`;
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (sameDay(d, y)) return es ? 'Ayer' : 'Yesterday';
  const days = Math.floor(diff / 86400000);
  if (days < 7) return d.toLocaleDateString(es ? 'es' : 'en-US', { weekday: 'short' });
  return d.toLocaleDateString(es ? 'es' : 'en-US', { month: 'short', day: 'numeric', ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) });
}
export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const clockTime = (iso: string, lang: 'en' | 'es' = 'en') => new Date(iso).toLocaleTimeString(lang === 'es' ? 'es' : 'en-US', { hour: 'numeric', minute: '2-digit' });
/** Group label for lists: Today / Yesterday / weekday / date. */
export function dayLabel(iso: string, now: Date = new Date(), lang: 'en' | 'es' = 'en'): string {
  const d = new Date(iso);
  if (sameDay(d, now)) return lang === 'es' ? 'Hoy' : 'Today';
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (sameDay(d, y)) return lang === 'es' ? 'Ayer' : 'Yesterday';
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days < 7) return d.toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { weekday: 'long' });
  return d.toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { month: 'long', day: 'numeric', ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) });
}
export const longDate = (iso: string, lang: 'en' | 'es' = 'en') => new Date(iso).toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
