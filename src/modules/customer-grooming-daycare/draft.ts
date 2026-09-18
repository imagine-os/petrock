/**
 * Booking drafts live in localStorage under petrock.draft.<name> so a multi-step flow survives navigation and reload.
 * A tiny in-memory event bus keeps two mounted readers in sync. Cleared on checkout.
 */
import { useCallback, useEffect, useState } from 'react';

export interface GroomingDraftItem { petId: string; packageId: string | null; addonIds: string[] }
export interface GroomingDraft { items: GroomingDraftItem[]; current: number; locationId: string | null; date: string | null; time: string | null; groomerId: string | null; notes: string; source: 'app' | 'recreate' }
export interface DaycarePetDetails { fleaMedication: boolean; fleaBrand: string; fleaDate: string; medicalAlert: string }
export interface DaycareDraft { petIds: string[]; locationId: string | null; date: string | null; checkIn: string; checkOut: string; details: Record<string, DaycarePetDetails>; addGrooming: boolean; notes: string }

export const EMPTY_GROOMING: GroomingDraft = { items: [], current: 0, locationId: null, date: null, time: null, groomerId: null, notes: '', source: 'app' };
export const EMPTY_DAYCARE: DaycareDraft = { petIds: [], locationId: null, date: null, checkIn: '08:00', checkOut: '16:00', details: {}, addGrooming: false, notes: '' };
export const EMPTY_PET_DETAILS: DaycarePetDetails = { fleaMedication: false, fleaBrand: '', fleaDate: '', medicalAlert: '' };

const KEY = (name: string) => `petrock.draft.${name}`;
const listeners = new Map<string, Set<() => void>>();
const emit = (name: string) => listeners.get(name)?.forEach((cb) => cb());

export function readDraft<T>(name: string, empty: T): T {
  try { const raw = localStorage.getItem(KEY(name)); if (raw) return { ...empty, ...(JSON.parse(raw) as Partial<T>) }; } catch { /* ignore */ }
  return empty;
}
export function writeDraft<T>(name: string, value: T) {
  try { localStorage.setItem(KEY(name), JSON.stringify(value)); } catch { /* quota / private mode */ }
  emit(name);
}
export function clearDraft(name: string) { try { localStorage.removeItem(KEY(name)); } catch { /* ignore */ } emit(name); }

export function useDraft<T>(name: string, empty: T): [T, (patch: Partial<T> | ((d: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => readDraft(name, empty));
  useEffect(() => {
    const cb = () => setValue(readDraft(name, empty));
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name)!.add(cb);
    return () => { listeners.get(name)!.delete(cb); };
  }, [name, empty]);
  const update = useCallback((patch: Partial<T> | ((d: T) => T)) => {
    const cur = readDraft(name, empty);
    const next = typeof patch === 'function' ? (patch as (d: T) => T)(cur) : { ...cur, ...patch };
    writeDraft(name, next);
  }, [name, empty]);
  const reset = useCallback(() => clearDraft(name), [name]);
  return [value, update, reset];
}

export const useGroomingDraft = () => useDraft<GroomingDraft>('grooming', EMPTY_GROOMING);
export const useDaycareDraft = () => useDraft<DaycareDraft>('daycare', EMPTY_DAYCARE);
