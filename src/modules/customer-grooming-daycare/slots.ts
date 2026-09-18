/**
 * Grooming start times for a day at a location (R-X15, R-G21, R-E10): opening hours from locations.hours, 30-minute
 * steps, the order must end before closing, and for every 15-minute step the appointments already booked plus this
 * order's pets must stay within capacities.grooming. A chosen groomer must also be free.
 */
import type { AppointmentRow, LocationRow } from '../../data/schema/core';
import type { GroomingSlot } from '../../components/molecule/GroomingSlotPicker/GroomingSlotPicker';

export const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
export const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export function hoursFor(location: LocationRow | undefined, isoDate: string): { open: string; close: string } | null {
  if (!location) return null;
  const dow = new Date(isoDate + 'T00:00:00').getDay();
  const h = (location.hours as Record<string, { open: string; close: string } | null> | null)?.[String(dow)];
  return h ?? null;
}

export interface SlotInput { location: LocationRow | undefined; date: string; orderMinutes: number; petCount: number; capacity: number; appointments: AppointmentRow[]; groomerId: string | null; now?: Date; stepMinutes?: number }

export function computeSlots(i: SlotInput): GroomingSlot[] {
  const hours = hoursFor(i.location, i.date);
  if (!hours) return [];
  const open = toMin(hours.open), close = toMin(hours.close);
  const step = i.stepMinutes ?? 30;
  const now = i.now ?? new Date();
  const isToday = i.date === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const dayAps = i.appointments.filter((a) => a.starts_at.slice(0, 10) === i.date && !['cancelled', 'no_show'].includes(a.status)).map((a) => { const d = new Date(a.starts_at); const s = d.getHours() * 60 + d.getMinutes(); return { s, e: s + (a.duration_min || 60), groomerId: a.groomer_id }; });
  const out: GroomingSlot[] = [];
  for (let t = open; t + i.orderMinutes <= close; t += step) {
    if (isToday && t <= nowMin + 30) { out.push({ time: toHHMM(t), available: false, reason: 'Too soon' }); continue; }
    let reason: string | undefined;
    for (let q = t; q < t + i.orderMinutes && !reason; q += 15) {
      const busy = dayAps.filter((a) => a.s <= q && q < a.e);
      if (busy.length + i.petCount > i.capacity) reason = 'Grooming tables are booked at this time';
      else if (i.groomerId && busy.some((a) => a.groomerId === i.groomerId)) reason = 'This groomer is busy at this time';
    }
    out.push({ time: toHHMM(t), available: !reason, reason });
  }
  return out;
}

/** Times a daycare pet can be dropped off / picked up: opening to closing in 15-minute steps. */
export function dayWindow(location: LocationRow | undefined, isoDate: string | null): { min: string; max: string } | null {
  if (!isoDate) return null;
  const h = hoursFor(location, isoDate);
  return h ? { min: h.open, max: h.close } : null;
}
export const isClosed = (location: LocationRow | undefined, isoDate: string) => !hoursFor(location, isoDate);
