/**
 * Domain helpers and hooks for the customer home & pets module (C-10..C-29). Pure functions are exported for tests;
 * hooks resolve the signed-in pet parent, their pets and vaccine state from the DataProvider.
 */
import { useMemo } from 'react';
import { useSession } from '../../auth/SessionProvider';
import { useTable } from '../../data/DataContext';
import type { CustomerRow, PetRow, VaccineRecordRow, VaccineTypeRow, BookingRow, BookingPetRow, AppointmentRow, DaycareBookingRow, PackageRow, RoomTypeRow, LocationRow } from '../../data/schema/core';
import type { BaseRow } from '../../data/schema/types';
import type { VaccineChipStatus } from '../../components/atom/VaccineStatusChip/VaccineStatusChip';
import type { CustomerBookingKind } from '../../components/molecule/CustomerBookingCard/CustomerBookingCard';
import type { BookingStatus } from '../../domain/booking';

// ---------- dates (decision: one display format, "16 Nov 2026" and "10:00 AM") ----------
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
export const isoToday = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = iso.length <= 10 ? new Date(iso + 'T00:00:00') : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const h = d.getHours(), m = d.getMinutes();
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
}
export const fmtTimeHHMM = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`; };

/** R-M08: "Just now", "25 min ago", "3 hours ago", "Yesterday", "5 days ago", then the date. */
export function relativeTime(iso: string, now = new Date()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, now.getTime() - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return fmtDate(iso);
}
/** "2 y 3 m", "8 m", "3 w" from a date of birth. */
export function ageLabel(dob: string | null | undefined, now = new Date()): string {
  if (!dob) return '';
  const b = new Date(dob + 'T00:00:00');
  let months = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth();
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 0) return '';
  if (months < 1) return `${Math.max(1, Math.floor((now.getTime() - b.getTime()) / (7 * 864e5)))} w`;
  if (months < 12) return `${months} m`;
  const y = Math.floor(months / 12), m = months % 12;
  return m ? `${y} y ${m} m` : `${y} y`;
}
export const daysUntil = (iso: string, now = new Date()) => Math.ceil((new Date(iso + 'T00:00:00').getTime() - new Date(isoToday(now) + 'T00:00:00').getTime()) / 864e5);

// ---------- vaccines (R-X20) ----------
export function vaccineStatusOf(rec: VaccineRecordRow | undefined | null, today = isoToday()): VaccineChipStatus {
  if (!rec || rec.status === 'missing') return 'missing';
  if (rec.status === 'rejected') return 'rejected';
  if (rec.expires_on && rec.expires_on < today) return 'expired';
  if (rec.status === 'submitted') return 'pending';
  if (rec.status === 'expired') return 'expired';
  return 'verified';
}
const WORST: VaccineChipStatus[] = ['rejected', 'expired', 'missing', 'pending', 'verified'];
export const worstStatus = (xs: VaccineChipStatus[]): VaccineChipStatus => WORST.find((s) => xs.includes(s)) ?? 'verified';

export interface PetVaccineLine { type: VaccineTypeRow; record: VaccineRecordRow | null; status: VaccineChipStatus }
export interface PetVaccineSummary { lines: PetVaccineLine[]; required: PetVaccineLine[]; recommended: PetVaccineLine[]; worstRequired: VaccineChipStatus; allRequiredVerified: boolean; requiredVerified: number; nextExpiry: string | null; hasExpired: boolean; hasPending: boolean }

export function petVaccineSummary(petId: string, records: VaccineRecordRow[], types: VaccineTypeRow[], today = isoToday()): PetVaccineSummary {
  const lines = [...types].sort((a, b) => a.sort_order - b.sort_order).map((type) => {
    const record = records.filter((r) => r.pet_id === petId && r.vaccine_type_id === type.id).sort((a, b) => (b.vaccinated_on ?? '').localeCompare(a.vaccinated_on ?? ''))[0] ?? null;
    return { type, record, status: vaccineStatusOf(record, today) };
  });
  const required = lines.filter((l) => l.type.required), recommended = lines.filter((l) => !l.type.required);
  const worstRequired = worstStatus(required.map((l) => l.status));
  const expiries = lines.map((l) => l.record?.expires_on).filter((x): x is string => !!x && x >= today).sort();
  return {
    lines, required, recommended, worstRequired,
    allRequiredVerified: required.length > 0 && required.every((l) => l.status === 'verified'),
    requiredVerified: required.filter((l) => l.status === 'verified').length,
    nextExpiry: expiries[0] ?? null,
    hasExpired: lines.some((l) => l.status === 'expired'), hasPending: lines.some((l) => l.status === 'pending'),
  };
}

/** R-A04: what the customer sees on a pet card. */
export type PetApproval = { label: string; tone: 'success' | 'warn' | 'danger' | 'neutral'; chip: VaccineChipStatus; warning: boolean };
export function petApproval(pet: PetRow, v: PetVaccineSummary): PetApproval {
  if (v.hasExpired && v.required.some((l) => l.status === 'expired')) return { label: 'Vaccine expired', tone: 'danger', chip: 'expired', warning: true };
  if (pet.approval_status === 'approved' && v.worstRequired !== 'missing') return { label: 'Approved', tone: 'success', chip: 'verified', warning: false };
  if (pet.approval_status === 'needs_details' || v.worstRequired === 'missing') return { label: 'Needs more details', tone: 'warn', chip: 'missing', warning: true };
  return { label: 'Pending verification', tone: 'warn', chip: 'pending', warning: false };
}

// ---------- hooks ----------
/** The signed-in pet parent. Staff / super admin viewing the customer surface fall back to the demo customer so the app stays usable. */
export function useCurrentCustomer(): { customer: CustomerRow | null; loading: boolean } {
  const { user } = useSession();
  const { rows, loading } = useTable<CustomerRow>('customers');
  const customer = useMemo(() => rows.find((c) => c.user_id === user.id) ?? rows.find((c) => c.user_id === 'usr_customer') ?? rows[0] ?? null, [rows, user.id]);
  return { customer, loading };
}

export function useCustomerPets(customerId: string | null | undefined): PetRow[] {
  const { rows } = useTable<PetRow>('pets', customerId ? { where: { customer_id: customerId } } : undefined);
  return useMemo(() => (customerId ? rows.filter((p) => p.status !== 'inactive').sort((a, b) => a.created_at.localeCompare(b.created_at)) : []), [rows, customerId]);
}

export function useVaccineData() {
  const { rows: types } = useTable<VaccineTypeRow>('vaccine_types', { orderBy: { column: 'sort_order' } });
  const { rows: records } = useTable<VaccineRecordRow>('vaccine_records');
  return { types, records };
}

// ---------- bookings across the three services ----------
export interface CustomerBookingItem { id: string; kind: CustomerBookingKind; title: string; petIds: string[]; status: BookingStatus | string; startsAt: string; endsAt?: string; locationId: string | null; link: string; past: boolean }
const FINAL = new Set(['checked_out', 'cancelled', 'no_show', 'done']);

export function useCustomerBookings(customerId: string | null | undefined): CustomerBookingItem[] {
  const q = customerId ? { where: { customer_id: customerId } } : undefined;
  const { rows: bookings } = useTable<BookingRow>('bookings', q);
  const { rows: bookingPets } = useTable<BookingPetRow>('booking_pets');
  const { rows: appointments } = useTable<AppointmentRow>('appointments', q);
  const { rows: daycare } = useTable<DaycareBookingRow>('daycare_bookings', q);
  const { rows: packages } = useTable<PackageRow>('packages');
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types');
  const { rows: orders } = useTable<{ id: string; appointment_ids: string[] } & BaseRow>('grooming_orders', q);
  return useMemo(() => {
    if (!customerId) return [];
    const now = Date.now();
    const items: CustomerBookingItem[] = [];
    for (const b of bookings) {
      const rt = roomTypes.find((r) => r.id === b.room_type_id);
      items.push({ id: b.id, kind: 'hotel', title: `Hotel ${rt?.name ?? 'stay'}`, petIds: bookingPets.filter((bp) => bp.booking_id === b.id).map((bp) => bp.pet_id), status: b.status, startsAt: b.check_in, endsAt: b.check_out, locationId: b.location_id ?? null, link: `/app/bookings/${b.id}`, past: FINAL.has(b.status) || new Date(b.check_out).getTime() < now });
    }
    for (const a of appointments) {
      const pkg = packages.find((p) => p.id === a.package_id);
      const status: string = a.status === 'done' ? 'checked_out' : a.status === 'in_progress' ? 'checked_in' : a.status;
      items.push({ id: a.id, kind: 'grooming', title: pkg?.name ?? 'Grooming & Spa', petIds: [a.pet_id], status, startsAt: a.starts_at, locationId: a.location_id ?? null, link: orderLink(a.id, orders), past: FINAL.has(a.status) || new Date(a.starts_at).getTime() + a.duration_min * 60000 < now });
    }
    for (const d of daycare) {
      const start = `${d.date}T${d.check_in_time}:00`, end = `${d.date}T${d.check_out_time}:00`;
      items.push({ id: d.id, kind: 'daycare', title: d.item === 'half_day' ? 'Daycare half day' : d.item === 'hour' ? 'Daycare play hour' : 'Daycare full day', petIds: d.pet_ids, status: d.status, startsAt: start, endsAt: end, locationId: d.location_id ?? null, link: `/app/daycare/bookings/${d.id}`, past: FINAL.has(d.status) || new Date(end).getTime() < now });
    }
    return items.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }, [customerId, bookings, bookingPets, appointments, daycare, packages, roomTypes, orders]);
}

/** C-55 shows a grooming order (one per booking, several appointments); appointments booked at the desk without an order fall back to the grooming hub. */
function orderLink(appointmentId: string, orders: { id: string; appointment_ids: string[] }[]): string {
  const o = orders.find((x) => Array.isArray(x.appointment_ids) && x.appointment_ids.includes(appointmentId));
  return o ? `/app/grooming/orders/${o.id}` : '/app/grooming';
}

export const petNames = (ids: string[], pets: PetRow[]) => ids.map((id) => pets.find((p) => p.id === id)?.name).filter(Boolean).join(', ') || '-';
export const locationShort = (id: string | null, locations: LocationRow[]) => locations.find((l) => l.id === id)?.short_name ?? '';

/** Today's opening hours line for a location ("7:00 AM - 7:00 PM" or "Closed today"). */
export function hoursToday(loc: LocationRow, now = new Date()): string {
  const h = loc.hours?.[String(now.getDay()) as unknown as keyof typeof loc.hours] ?? (loc.hours as unknown as Record<number, { open: string; close: string } | null> | undefined)?.[now.getDay()];
  if (!h) return 'Closed today';
  return `${fmtTimeHHMM(h.open)} - ${fmtTimeHHMM(h.close)}`;
}
