/** Joined reservation rows for the table, dashboard and timeline: hotel bookings plus daycare days, per location. */
import { useMemo } from 'react';
import { useTable, indexById } from '../../../data/DataContext';
import type { BookingPetRow, BookingRow, CustomerRow, DaycareBookingRow, PetRow, RoomRow, RoomTypeRow, VaccineRecordRow, VaccineTypeRow } from '../../../data/schema/core';
import { useLocation } from '../../../tenant/LocationProvider';
import { dayBucket, type BookingStatus } from '../../../domain/booking';
import { dayOf, fmtHhmm, hhmmOf } from './dates';
import { petVaccineSummary, type PetVaccineSummary } from './vaccines';

export type ReservationKind = 'hotel' | 'daycare';
export type Bucket = 'arriving' | 'departing' | 'staying' | 'checked_out' | 'daycare' | 'other';

export interface ReservationRow {
  id: string; kind: ReservationKind; code: string; status: BookingStatus; customerId: string; customer: string; email: string; mobile: string; altPhone: string;
  roomId: string | null; room: string; roomTypeId: string | null; roomType: string; checkIn: string; checkOut: string; dayIn: string; dayOut: string; timeIn: string; timeOut: string; nights: number;
  pets: PetRow[]; petNames: string; breeds: string; petCount: number; vaccines: Record<string, PetVaccineSummary>; vaccineOk: boolean;
  total: number; deposit: number; balance: number; paymentStatus: string; notes: string; source: string | null; heaviestLbs: number;
  booking?: BookingRow; daycare?: DaycareBookingRow;
}

export function useReservationRows(): { rows: ReservationRow[]; bookings: BookingRow[]; rooms: RoomRow[]; roomTypes: RoomTypeRow[]; customers: CustomerRow[]; pets: PetRow[]; loading: boolean } {
  const { scope } = useLocation();
  const { rows: bookings, loading } = useTable<BookingRow>('bookings', { where: scope });
  const { rows: daycare } = useTable<DaycareBookingRow>('daycare_bookings', { where: scope });
  const { rows: bookingPets } = useTable<BookingPetRow>('booking_pets');
  const { rows: customers } = useTable<CustomerRow>('customers');
  const { rows: pets } = useTable<PetRow>('pets');
  const { rows: rooms } = useTable<RoomRow>('rooms', { where: scope });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types');
  const { rows: records } = useTable<VaccineRecordRow>('vaccine_records');
  const { rows: types } = useTable<VaccineTypeRow>('vaccine_types');

  const rows = useMemo(() => {
    const cust = indexById(customers), petIx = indexById(pets), roomIx = indexById(rooms), rtIx = indexById(roomTypes);
    const petsOf = new Map<string, PetRow[]>();
    for (const bp of bookingPets) { const p = petIx[bp.pet_id]; if (!p) continue; const arr = petsOf.get(bp.booking_id) ?? []; arr.push(p); petsOf.set(bp.booking_id, arr); }
    const vacc = (ps: PetRow[]) => Object.fromEntries(ps.map((p) => [p.id, petVaccineSummary(p.id, records, types)]));
    const common = (ps: PetRow[], c: CustomerRow | undefined) => {
      const v = vacc(ps);
      return { pets: ps, petNames: ps.map((p) => p.name).join(', ') || '—', breeds: [...new Set(ps.map((p) => p.breed).filter(Boolean))].join(', ') || '—', petCount: ps.length, vaccines: v, vaccineOk: Object.values(v).every((x) => x.ok), heaviestLbs: Math.max(0, ...ps.map((p) => p.weight_lbs ?? 0)),
        customer: c ? `${c.first_name} ${c.last_name}` : 'Unknown', email: c?.email ?? '', mobile: c?.mobile ?? '', altPhone: (c as unknown as { alt_phone?: string | null })?.alt_phone ?? '' };
    };
    const hotel: ReservationRow[] = bookings.map((b) => {
      const c = cust[b.customer_id], room = b.room_id ? roomIx[b.room_id] : undefined, rt = rtIx[b.room_type_id];
      return { id: b.id, kind: 'hotel', code: b.code, status: b.status as BookingStatus, customerId: b.customer_id, roomId: b.room_id, room: room?.code ?? 'Unassigned', roomTypeId: b.room_type_id, roomType: rt?.name ?? '—', checkIn: b.check_in, checkOut: b.check_out, dayIn: dayOf(b.check_in), dayOut: dayOf(b.check_out), timeIn: fmtHhmm(hhmmOf(b.check_in)), timeOut: fmtHhmm(hhmmOf(b.check_out)), nights: b.nights,
        total: b.total, deposit: b.deposit, balance: Math.round((b.total - b.deposit) * 100) / 100, paymentStatus: b.payment_status, notes: b.notes ?? '', source: b.source, booking: b, ...common(petsOf.get(b.id) ?? [], c) };
    });
    const dc: ReservationRow[] = daycare.map((d) => {
      const c = cust[d.customer_id]; const ps = d.pet_ids.map((id) => petIx[id]).filter(Boolean);
      return { id: d.id, kind: 'daycare', code: d.code, status: d.status as BookingStatus, customerId: d.customer_id, roomId: null, room: `Daycare · ${d.item === 'full_day' ? 'Full day' : d.item === 'half_day' ? 'Half day' : 'Hour'}`, roomTypeId: null, roomType: 'Daycare', checkIn: `${d.date}T${d.check_in_time}:00`, checkOut: `${d.date}T${d.check_out_time}:00`, dayIn: d.date, dayOut: d.date, timeIn: fmtHhmm(d.check_in_time), timeOut: fmtHhmm(d.check_out_time), nights: 0,
        total: d.total, deposit: d.payment_status === 'paid' ? d.total : 0, balance: d.payment_status === 'paid' ? 0 : d.total, paymentStatus: d.payment_status, notes: (d as unknown as { notes?: string | null }).notes ?? '', source: null, daycare: d, ...common(ps, c) };
    });
    return [...hotel, ...dc].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  }, [bookings, daycare, bookingPets, customers, pets, rooms, roomTypes, records, types]);

  return { rows, bookings, rooms, roomTypes, customers, pets, loading };
}

/** Day bucket for a row relative to a day (R-I05); daycare rows on that day form their own group. */
export function bucketOf(r: ReservationRow, day: string): Bucket {
  if (r.kind === 'daycare') return r.dayIn === day && r.status !== 'cancelled' && r.status !== 'no_show' ? 'daycare' : 'other';
  if (r.status === 'cancelled' || r.status === 'no_show') return 'other';
  return dayBucket({ check_in: r.dayIn, check_out: r.dayOut, status: r.status }, day);
}
export const BUCKET_LABEL: Record<Bucket, string> = { arriving: 'Arriving', departing: 'Departing', staying: 'Staying', checked_out: 'Checked out', daycare: 'Daycare', other: 'Other' };
