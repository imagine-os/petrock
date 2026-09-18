/** customer-hotel seed: hotel booking settings (deposit %), stay care notes for the demo customer's stays, two change requests. */
import type { SeedCtx } from './index';
import type { BaseRow } from '../schema/types';
import { HOTEL_SETTINGS_KEY, type HotelBookingSettings } from '../schema/customer-hotel';

export const order = 50;

export function seed(ctx: SeedCtx) {
  const { add, db } = ctx;
  const settings: HotelBookingSettings = { deposit_percent: 30, default_check_in_time: '10:00', default_check_out_time: '11:00', min_nights: 1, free_cancellation_hours: 48, max_pets_per_room: 3 };
  add('settings', { id: 'set_hotel_booking', key: HOTEL_SETTINGS_KEY, value: settings, description: 'Customer hotel booking: deposit percent, default times, minimum nights, free-cancellation window, max pets per room (C-30..C-36)' });

  const bookings = (db.bookings ?? []) as (BaseRow & { customer_id: string; status: string; check_in: string })[];
  const bookingPets = (db.booking_pets ?? []) as (BaseRow & { booking_id: string; pet_id: string; takes_medication: boolean; medication: string | null })[];
  const pets = (db.pets ?? []) as (BaseRow & { name: string; own_food: boolean; feeding_am: string | null; feeding_pm: string | null; meals_per_day: string | null })[];
  // care notes for every booking pet of the demo customer (Avery, cus_1) plus a few others
  for (const bp of bookingPets) {
    const b = bookings.find((x) => x.id === bp.booking_id);
    const p = pets.find((x) => x.id === bp.pet_id);
    if (!b || !p) continue;
    if (b.customer_id !== 'cus_1' && !ctx.r.chance(0.3)) continue;
    add('booking_pet_care', { id: `bpc_${bp.id}`, booking_id: b.id, booking_pet_id: bp.id, pet_id: p.id, feeding_instructions: [p.feeding_am && `AM: ${p.feeding_am}`, p.feeding_pm && `PM: ${p.feeding_pm}`].filter(Boolean).join(' · ') || null, meals_per_day: p.meals_per_day, own_food: p.own_food, belongings: ctx.r.pick(['Own bed and a squeaky toy', 'Leash, harness, blanket', 'Food container (labelled)', null]), medication_count: bp.takes_medication ? 1 : null, dosing_frequency: bp.takes_medication ? '1 daily (AM only)' : null, flea_brand: ctx.r.chance(0.5) ? ctx.r.pick(['NexGard', 'Frontline Plus', 'Bravecto']) : null, flea_last_dose_on: ctx.r.chance(0.5) ? b.check_in.slice(0, 10) : null, emergency_contact: null, notes: p.name === 'Mochi' ? 'Shy with new dogs; slow introductions please' : null });
  }
  // change requests: one open modify on an upcoming confirmed stay of Avery, one approved cancel elsewhere
  const upcoming = bookings.filter((b) => b.customer_id === 'cus_1' && b.status === 'confirmed' && b.check_in > ctx.now.toISOString());
  if (upcoming[0]) {
    const b = upcoming[0];
    const ci = new Date(b.check_in); ci.setDate(ci.getDate() + 1);
    add('booking_change_requests', { id: `bcr_${b.id}`, location_id: b.location_id ?? 'loc_encino', booking_id: b.id, customer_id: b.customer_id, kind: 'modify_dates', requested_check_in: ci.toISOString(), requested_check_out: null, pet_ids: null, message: 'Could we arrive one day later? Flight moved.', status: 'open', handled_by: null, handled_at: null, staff_note: null });
  }
  const cancelled = bookings.find((b) => b.status === 'cancelled');
  if (cancelled) add('booking_change_requests', { id: `bcr_${cancelled.id}`, location_id: cancelled.location_id ?? 'loc_encino', booking_id: cancelled.id, customer_id: cancelled.customer_id, kind: 'cancel', requested_check_in: null, requested_check_out: null, pet_ids: null, message: 'Trip cancelled, sorry!', status: 'approved', handled_by: 'usr_manager', handled_at: ctx.now.toISOString(), staff_note: 'Refunded deposit' });
}
