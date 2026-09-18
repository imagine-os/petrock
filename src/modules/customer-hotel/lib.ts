/**
 * customer-hotel shared logic: account resolution, vaccine state, stay validation, availability + room fit,
 * quotes built ONLY from settings tables through src/pricing/engine.ts, deposit / card-fee maths, formatting.
 */
import { useMemo } from 'react';
import { useSession } from '../../auth/SessionProvider';
import { useTable } from '../../data/DataContext';
import type { AddonRow, BookingPetRow, BookingRow, CapacityRow, CustomerRow, DiscountRow, FeeRow, LocationRow, PackageRow, PetRow, RateRow, RoomRow, RoomTypeRow, SeasonRow, SettingRow, TaxRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import { HOTEL_SETTINGS_KEY, type HotelBookingSettings } from '../../data/schema/customer-hotel';
import { nightsBetween, quoteGrooming, quoteHotel, round2, type Quote, type QuoteLine, type Size } from '../../pricing/engine';
import type { BookingStatus } from '../../domain/booking';
import type { PetVaccineState } from '../../components/molecule/BookingPetCard/BookingPetCard';
import type { HotelDraft, PetGrooming } from './draft';

export const DEFAULT_HOTEL_SETTINGS: HotelBookingSettings = { deposit_percent: 30, default_check_in_time: '10:00', default_check_out_time: '11:00', min_nights: 1, free_cancellation_hours: 48, max_pets_per_room: 3 };

/** The customer behind the session. Staff / super admin previewing the app fall back to the demo pet parent so pages render. */
export function useCustomerAccount() {
  const { user, role } = useSession();
  const { rows: customers, loading } = useTable<CustomerRow>('customers');
  const customer = useMemo(() => customers.find((c) => c.user_id === user.id) ?? (role !== 'customer' ? customers.find((c) => c.user_id === 'usr_customer') ?? null : null), [customers, user.id, role]);
  const { rows: pets } = useTable<PetRow>('pets', { where: { customer_id: customer?.id ?? '__none__' } });
  return { customer, pets: pets.filter((p) => p.status !== 'inactive'), loading, previewing: !!customer && customer.user_id !== user.id };
}

export function useHotelSettings(): HotelBookingSettings {
  const { rows } = useTable<SettingRow>('settings', { where: { key: HOTEL_SETTINGS_KEY } });
  return { ...DEFAULT_HOTEL_SETTINGS, ...((rows[0]?.value as Partial<HotelBookingSettings> | undefined) ?? {}) };
}

export function usePricingTables() {
  const { rows: rates } = useTable<RateRow>('rates');
  const { rows: seasons } = useTable<SeasonRow>('seasons');
  const { rows: discounts } = useTable<DiscountRow>('discounts');
  const { rows: fees } = useTable<FeeRow>('fees');
  const { rows: taxes } = useTable<TaxRow>('taxes');
  const { rows: packages } = useTable<PackageRow>('packages', { orderBy: { column: 'sort_order' } });
  const { rows: addons } = useTable<AddonRow>('addons');
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  return { rates, seasons, discounts, fees, taxes, packages: packages.filter((p) => p.active), addons: addons.filter((a) => a.active), roomTypes };
}

// ---- vaccines (R-A05, R-B01) ----
export function petVaccineState(petId: string, records: VaccineRecordRow[], types: VaccineTypeRow[], today = new Date()): PetVaccineState {
  const t = today.toISOString().slice(0, 10);
  let state: PetVaccineState = 'ok';
  for (const vt of types.filter((x) => x.required)) {
    const r = records.find((x) => x.pet_id === petId && x.vaccine_type_id === vt.id);
    if (!r || r.status === 'missing' || r.status === 'rejected') return 'missing';
    if (r.status === 'expired' || (r.expires_on && r.expires_on < t)) state = 'expired';
    else if (r.status !== 'verified' && state === 'ok') state = 'pending';
  }
  return state;
}
/** R-X31: app bookings start requested, or pending_vaccines when any pet is not fully verified. */
export function initialStatusFor(petIds: string[], records: VaccineRecordRow[], types: VaccineTypeRow[]): BookingStatus {
  return petIds.every((id) => petVaccineState(id, records, types) === 'ok') ? 'requested' : 'pending_vaccines';
}

// ---- dates ----
export const combineDateTime = (isoDay: string, hhmm: string): string => { const [h, m] = hhmm.split(':').map(Number); const d = new Date(`${isoDay}T00:00:00`); d.setHours(h, m, 0, 0); return d.toISOString(); };
export const hoursForLocation = (loc: LocationRow | null | undefined) => (iso: string) => { if (!loc?.hours) return { open: '07:00', close: '19:00' }; const h = loc.hours[String(new Date(`${iso}T00:00:00`).getDay()) as keyof typeof loc.hours]; return h ?? null; };
export function validateStay(d: { checkIn: string | null; checkInTime: string; checkOut: string | null; checkOutTime: string }, settings: HotelBookingSettings, hoursFor: (iso: string) => { open: string; close: string } | null): string | null {
  if (!d.checkIn || !d.checkOut) return 'Pick your check-in and check-out days.';
  if (d.checkOut <= d.checkIn) return 'Check-out must be after check-in.';
  const nights = nightsBetween(new Date(`${d.checkIn}T00:00:00`), new Date(`${d.checkOut}T00:00:00`));
  if (nights < settings.min_nights) return `Stays are at least ${settings.min_nights} night${settings.min_nights === 1 ? '' : 's'}.`;
  const hi = hoursFor(d.checkIn), ho = hoursFor(d.checkOut);
  if (hi === null) return 'We are closed on your check-in day.';
  if (ho === null) return 'We are closed on your check-out day.';
  if (d.checkInTime < hi.open || d.checkInTime > hi.close) return `Check-in must be between ${hi.open} and ${hi.close}.`;
  if (d.checkOutTime < ho.open || d.checkOutTime > ho.close) return `Check-out must be between ${ho.open} and ${ho.close}.`;
  return null;
}
export const fmtDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }) => (iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('en-US', opts) : '—');
export const fmtDateTime = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
export const fmtTime = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—');

// ---- room fit (R-E09, R-X01, R-X37) & availability (R-X36) ----
export const HEAVY_LBS = 30; // needs a bottom penthouse room (R-E09)
export const SUITE_ONLY_LBS = 55; // must be a Suite (R-X01)
export function roomFit(roomType: RoomTypeRow, pets: PetRow[]): { blocked: boolean; reason?: string; needsBottom: boolean } {
  const heavy = pets.filter((p) => (p.weight_lbs ?? 0) >= SUITE_ONLY_LBS);
  if (roomType.key === 'penthouse' && heavy.length) return { blocked: true, reason: `${heavy.map((p) => p.name).join(' and ')} ${heavy.length > 1 ? 'are' : 'is'} ${SUITE_ONLY_LBS} lb or more: Suite only`, needsBottom: false };
  if (roomType.max_weight_lbs != null) { const over = pets.filter((p) => (p.weight_lbs ?? 0) > roomType.max_weight_lbs!); if (over.length) return { blocked: true, reason: `${over.map((p) => p.name).join(', ')} over ${roomType.max_weight_lbs} lb limit`, needsBottom: false }; }
  return { blocked: false, needsBottom: roomType.key === 'penthouse' && pets.some((p) => (p.weight_lbs ?? 0) >= HEAVY_LBS) };
}
const ACTIVE: string[] = ['requested', 'pending_vaccines', 'confirmed', 'checked_in'];
export interface AvailabilityInput { locationId: string; roomType: RoomTypeRow; checkIn: string; checkOut: string; bookings: BookingRow[]; bookingPets: BookingPetRow[]; pets: PetRow[]; rooms: RoomRow[]; capacities: CapacityRow[]; roomsNeeded: number }
export function availability(i: AvailabilityInput): { capacity: number; used: number; free: number; bottomTotal: number; bottomUsed: number; bottomFree: number; ok: boolean } {
  const kind = i.roomType.key === 'penthouse' ? 'penthouse' : 'suite';
  const cap = i.capacities.find((c) => c.location_id === i.locationId && c.kind === kind)?.max_simultaneous ?? i.rooms.filter((r) => r.location_id === i.locationId && r.room_type_id === i.roomType.id && r.active).length;
  const overlapping = i.bookings.filter((b) => b.location_id === i.locationId && b.room_type_id === i.roomType.id && ACTIVE.includes(b.status) && b.check_in < i.checkOut && b.check_out > i.checkIn);
  // a stay with pets not sharing occupies one room per pet
  const used = overlapping.reduce((s, b) => s + (b.share_room ? 1 : Math.max(1, i.bookingPets.filter((bp) => bp.booking_id === b.id).length)), 0);
  const bottomRooms = i.rooms.filter((r) => r.location_id === i.locationId && r.room_type_id === i.roomType.id && r.position === 'bottom' && r.active);
  const bottomUsed = overlapping.filter((b) => { const ps = i.bookingPets.filter((bp) => bp.booking_id === b.id).map((bp) => i.pets.find((p) => p.id === bp.pet_id)); return ps.some((p) => (p?.weight_lbs ?? 0) >= HEAVY_LBS) || bottomRooms.some((r) => r.id === b.room_id); }).length;
  const free = Math.max(0, cap - used);
  return { capacity: cap, used, free, bottomTotal: bottomRooms.length, bottomUsed, bottomFree: Math.max(0, bottomRooms.length - bottomUsed), ok: free >= i.roomsNeeded };
}

// ---- quotes (engine only) ----
export interface PricingRows { rates: RateRow[]; seasons: SeasonRow[]; discounts: DiscountRow[]; fees: FeeRow[]; taxes: TaxRow[]; packages: PackageRow[]; addons: AddonRow[] }
export interface HotelQuoteBundle { rooms: { label: string; petNames: string[]; quote: Quote }[]; lines: QuoteLine[]; subtotal: number; discountTotal: number; taxTotal: number; total: number; nights: number; notes: string[] }

/** R-X33: one room with N dogs when sharing, else one room per pet. Fee is NOT included here (see chargeFor). */
export function buildHotelQuote(d: Pick<HotelDraft, 'checkIn' | 'checkInTime' | 'checkOut' | 'checkOutTime' | 'shareRoom' | 'locationId'>, roomType: RoomTypeRow, pets: PetRow[], paidInFull: boolean, t: PricingRows): HotelQuoteBundle | null {
  if (!d.checkIn || !d.checkOut || !pets.length) return null;
  const ci = new Date(combineDateTime(d.checkIn, d.checkInTime)), co = new Date(combineDateTime(d.checkOut, d.checkOutTime));
  const groups: PetRow[][] = d.shareRoom ? [pets] : pets.map((p) => [p]);
  const rooms = groups.map((g, i) => ({ label: groups.length > 1 ? `${roomType.name} ${i + 1}` : roomType.name, petNames: g.map((p) => p.name), quote: quoteHotel({ roomTypeId: roomType.id, roomTypeName: roomType.name, checkIn: ci, checkOut: co, dogs: g.length, paidInFull, payWithCard: false, locationId: d.locationId, rates: t.rates, seasons: t.seasons, discounts: t.discounts, fees: t.fees, taxes: t.taxes }) }));
  const lines = rooms.flatMap((r) => r.quote.lines.map((l) => (rooms.length > 1 && l.kind === 'room' ? { ...l, label: `${l.label} · ${r.petNames.join(', ')}` } : l)));
  const sum = (k: keyof Quote) => round2(rooms.reduce((s, r) => s + (r.quote[k] as number), 0));
  return { rooms, lines, subtotal: sum('subtotal'), discountTotal: sum('discountTotal'), taxTotal: sum('taxTotal'), total: sum('total'), nights: rooms[0]?.quote.nights ?? 0, notes: [...new Set(rooms.flatMap((r) => r.quote.notes))] };
}
/** Average nightly rate per pet over the stay (R-X39). */
export function avgNightly(d: Pick<HotelDraft, 'checkIn' | 'checkInTime' | 'checkOut' | 'checkOutTime' | 'locationId'>, roomType: RoomTypeRow, t: PricingRows): number | null {
  if (!d.checkIn || !d.checkOut) return null;
  const q = quoteHotel({ roomTypeId: roomType.id, roomTypeName: roomType.name, checkIn: new Date(combineDateTime(d.checkIn, d.checkInTime)), checkOut: new Date(combineDateTime(d.checkOut, d.checkOutTime)), dogs: 1, paidInFull: false, payWithCard: false, locationId: d.locationId, rates: t.rates, seasons: t.seasons, discounts: [], fees: [], taxes: [] });
  return q.nights ? round2(q.subtotal / q.nights) : null;
}
export interface GroomingQuoteItem { pet: PetRow; pkg: PackageRow; addons: AddonRow[]; size: Size; quote: Quote }
export function buildGroomingQuotes(grooming: Record<string, PetGrooming>, pets: PetRow[], t: PricingRows): GroomingQuoteItem[] {
  return pets.flatMap((p) => {
    const g = grooming[p.id]; if (!g?.packageId) return [];
    const pkg = t.packages.find((x) => x.id === g.packageId); if (!pkg) return [];
    const addons = t.addons.filter((a) => g.addonIds.includes(a.id));
    const size = (p.size ?? 'M') as Size;
    return [{ pet: p, pkg, addons, size, quote: quoteGrooming({ pkg, size, addons, payWithCard: false, fees: t.fees, taxes: t.taxes }) }];
  });
}
export const depositFor = (total: number, s: HotelBookingSettings) => round2(total * s.deposit_percent / 100);
/** R-X38: card fee on the amount charged now (deposit or full), from the fees table. */
export function chargeFor(amount: number, payWithCard: boolean, fees: FeeRow[]): { fee: number; feePercent: number; charged: number } {
  const f = fees.find((x) => x.active && x.kind === 'card');
  const fee = payWithCard && f ? round2(amount * f.percent / 100) : 0;
  return { fee, feePercent: f?.percent ?? 0, charged: round2(amount + fee) };
}
export const nextCode = (rows: { code: string }[], prefix: string, start: number) => `${prefix}-${rows.reduce((m, r) => Math.max(m, Number(r.code.replace(/\D/g, '')) || 0), start - 1) + 1}`;
export const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
