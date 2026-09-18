/** Room availability and fit (R-X03, R-E09, R-X01). Nights are [check_in day, check_out day). */
import type { BookingRow, RoomRow, RoomTypeRow } from '../../../data/schema/core';
import { addDaysIso, dayOf } from './dates';

export const ACTIVE_STATUSES = ['requested', 'pending_vaccines', 'confirmed', 'checked_in'];

export interface AvailabilityInput { rooms: RoomRow[]; roomTypes: RoomTypeRow[]; bookings: BookingRow[]; checkInDay: string; checkOutDay: string; excludeBookingId?: string | null }
export interface TypeAvailability { roomType: RoomTypeRow; total: number; occupied: number; unassigned: number; free: number; freeRooms: RoomRow[]; bottomFree: number }

/** Night span a stay occupies: [in, out) and at least one night when in == out. */
export const nightSpan = (dayIn: string, dayOut: string): [string, string] => [dayIn, dayOut > dayIn ? dayOut : addDaysIso(dayIn, 1)];
export const staysOverlap = (b: { check_in: string; check_out: string }, dayIn: string, dayOut: string) => {
  const [aS, aE] = nightSpan(dayOf(b.check_in), dayOf(b.check_out));
  const [bS, bE] = nightSpan(dayIn, dayOut);
  return aS < bE && bS < aE;
};

/** Rooms of every type free for the whole range, counting unassigned overlapping bookings against the type total. */
export function availabilityByType(i: AvailabilityInput): TypeAvailability[] {
  const live = i.bookings.filter((b) => ACTIVE_STATUSES.includes(b.status) && b.id !== i.excludeBookingId && staysOverlap(b, i.checkInDay, i.checkOutDay));
  return i.roomTypes.slice().sort((a, b) => a.sort_order - b.sort_order).map((rt) => {
    const rooms = i.rooms.filter((r) => r.room_type_id === rt.id && r.active !== false).sort((a, b) => a.sort_order - b.sort_order);
    const occupiedIds = new Set(live.filter((b) => b.room_id && rooms.some((r) => r.id === b.room_id)).map((b) => b.room_id as string));
    const unassigned = live.filter((b) => !b.room_id && b.room_type_id === rt.id).length;
    const freeRooms = rooms.filter((r) => !occupiedIds.has(r.id));
    const free = Math.max(0, freeRooms.length - unassigned);
    return { roomType: rt, total: rooms.length, occupied: occupiedIds.size, unassigned, free, freeRooms, bottomFree: freeRooms.filter((r) => r.position === 'bottom').length };
  });
}

/** R-E09: over 30 lb only fits bottom penthouse rooms. R-X01 (55 lb -> suite) is 'requested' so it only warns. */
export const PENTHOUSE_TOP_MAX_LBS = 30;
export const SUITE_RULE_LBS = 55;
export function roomFits(room: RoomRow, roomType: RoomTypeRow | undefined, heaviestLbs: number): { ok: boolean; reason?: string } {
  if (roomType?.key === 'penthouse' && room.position === 'top' && heaviestLbs > PENTHOUSE_TOP_MAX_LBS) return { ok: false, reason: `Over ${PENTHOUSE_TOP_MAX_LBS} lb: bottom rooms only (R-E09)` };
  if (roomType?.max_weight_lbs != null && heaviestLbs > roomType.max_weight_lbs) return { ok: false, reason: `Over ${roomType.max_weight_lbs} lb for ${roomType.name}` };
  return { ok: true };
}
export const suiteRuleWarning = (roomType: RoomTypeRow | undefined, heaviestLbs: number) => (roomType?.key === 'penthouse' && heaviestLbs >= SUITE_RULE_LBS ? `A ${heaviestLbs} lb dog should be in a Suite (R-X01, pending Justin)` : null);

/** Bookings occupying a given room on a given day (for the timeline and the picker). */
export const roomBusyOn = (bookings: BookingRow[], roomId: string, day: string) => bookings.filter((b) => b.room_id === roomId && ACTIVE_STATUSES.includes(b.status) && staysOverlap(b, day, day));
