/** Shared helpers for the Control Panel module: audited CRUD, exports, dates and aggregation. */
import { useCallback, useMemo } from 'react';
import { useData } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import { useLocation } from '../../tenant/LocationProvider';
import type { BaseRow } from '../../data/schema/types';

export const fmtMoney = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
export const fmtMoney2 = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
export const fmtPct = (n: number) => `${Math.round(n * 10) / 10}%`;
export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');
export const fmtDate = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
export const fmtDateTime = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const dayLabel = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
export const monthLabel = (iso: string) => new Date(iso + '-15T12:00:00').toLocaleDateString('en-US', { month: 'short' });

/** Shallow diff for the audit log: key -> [before, after]. */
export function diffRows(before: Record<string, unknown> | null, after: Record<string, unknown>): Record<string, [unknown, unknown]> {
  const out: Record<string, [unknown, unknown]> = {};
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after)]);
  for (const k of keys) {
    if (['updated_at', 'created_at'].includes(k)) continue;
    const a = before?.[k], b = after[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) out[k] = [a ?? null, b ?? null];
  }
  return out;
}

/**
 * Audited CRUD (R-X41): every insert / update / remove through here also writes an audit_log row with the actor,
 * the table, the row id and the diff. Pages never call data.insert on settings tables directly.
 */
export function useAdminCrud() {
  const data = useData();
  const { user } = useSession();
  const { locationId } = useLocation();
  const audit = useCallback(async (action: 'insert' | 'update' | 'delete' | string, table: string, rowId: string | null, diff: Record<string, unknown> | null, locId: string | null = locationId) => {
    await data.insert('audit_log', { location_id: locId, user_id: user.id, user_name: user.name, action, table_name: table, row_id: rowId, diff });
  }, [data, user, locationId]);
  const insert = useCallback(async <T extends BaseRow>(table: string, row: Partial<T>) => {
    const full = await data.insert<T>(table, row);
    await audit('insert', table, full.id, diffRows(null, full as unknown as Record<string, unknown>), (full.location_id as string | null | undefined) ?? null);
    return full;
  }, [data, audit]);
  const update = useCallback(async <T extends BaseRow>(table: string, id: string, patch: Partial<T>) => {
    const before = await data.get<T>(table, id);
    const next = await data.update<T>(table, id, patch);
    await audit('update', table, id, diffRows(before as unknown as Record<string, unknown> | null, { ...(before ?? {}), ...patch } as Record<string, unknown>), (next.location_id as string | null | undefined) ?? null);
    return next;
  }, [data, audit]);
  const remove = useCallback(async (table: string, id: string, approvalId?: string) => {
    const before = await data.get(table, id);
    await data.remove(table, id);
    await audit('delete', table, id, { removed: before ? { ...before } : null, approval_id: approvalId ?? null }, (before?.location_id as string | null | undefined) ?? null);
  }, [data, audit]);
  /** Strip base columns and unknown keys before writing. */
  const clean = useCallback((values: Record<string, unknown>, keys: string[]) => Object.fromEntries(keys.filter((k) => k in values).map((k) => [k, values[k]])), []);
  return useMemo(() => ({ insert, update, remove, audit, clean }), [insert, update, remove, audit, clean]);
}

/** Browser download of a text blob. */
export function downloadText(fileName: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (!rows.length) return '';
  const cols = columns ?? Object.keys(rows[0]);
  const esc = (v: unknown) => { const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}
export const bytes = (n: number) => (n > 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : n > 1000 ? `${Math.round(n / 1000)} KB` : `${n} B`);

/** Sum helper for reports. */
export const sum = <T,>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + (f(r) || 0), 0);
export const groupBy = <T,>(rows: T[], key: (r: T) => string) => { const m = new Map<string, T[]>(); for (const r of rows) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k)!.push(r); } return m; };

/** Nights of a stay that fall on a given day (for occupancy). */
export const staysOn = (b: { check_in: string; check_out: string; status: string }, day: string) => { const d = new Date(day + 'T12:00:00').getTime(); return ['confirmed', 'checked_in', 'checked_out'].includes(b.status) && new Date(b.check_in).getTime() <= d && new Date(b.check_out).getTime() > d; };
