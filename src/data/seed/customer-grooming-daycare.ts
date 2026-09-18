/**
 * Seed for the customer-grooming-daycare module: one grooming_orders row per core-seeded appointment (mapped onto the
 * one booking lifecycle) and a daycare_booking_pets questionnaire row per pet on every core-seeded daycare day.
 * Runs after core (order 100) so it can read ctx.db.appointments / daycare_bookings.
 */
import type { SeedCtx } from './index';
import type { BaseRow } from '../schema/types';

export const order = 100;

interface Ap extends BaseRow { location_id: string; code: string; customer_id: string; pet_id: string; groomer_id: string | null; starts_at: string; duration_min: number; status: string; subtotal: number; tax_total: number; total: number; payment_status: string; notes: string | null }
interface Dc extends BaseRow { pet_ids: string[]; date: string }

const ORDER_STATUS: Record<string, string> = { requested: 'requested', confirmed: 'confirmed', in_progress: 'checked_in', done: 'checked_out', cancelled: 'cancelled', no_show: 'no_show' };

export function seed(ctx: SeedCtx) {
  const { add, r } = ctx;
  const aps = (ctx.db.appointments ?? []) as Ap[];
  let n = 1;
  for (const ap of aps) {
    const method = r.chance(0.7) ? 'card' : 'cash';
    const fee = method === 'card' ? Math.round(ap.total * 3.89) / 100 : 0; // mirrors the seeded card fee row; display only
    add('grooming_orders', {
      id: `gro_${n}`, location_id: ap.location_id, code: `GS-${1000 + n}`, customer_id: ap.customer_id, appointment_ids: [ap.id], pet_ids: [ap.pet_id], starts_at: ap.starts_at, duration_min: ap.duration_min,
      groomer_id: ap.groomer_id, status: ORDER_STATUS[ap.status] ?? 'requested', payment_method: method, payment_status: ap.payment_status, subtotal: ap.subtotal, tax_total: ap.tax_total, fee_total: fee, total: Math.round((ap.total + fee) * 100) / 100,
      invoice_id: null, notes: ap.notes, source: n % 4 === 0 ? 'desk' : 'app',
    });
    n++;
  }
  const dcs = (ctx.db.daycare_bookings ?? []) as Dc[];
  let m = 1;
  for (const dc of dcs) {
    for (const petId of dc.pet_ids) {
      const flea = r.chance(0.5);
      add('daycare_booking_pets', { id: `dbp_${m}`, daycare_booking_id: dc.id, pet_id: petId, flea_medication: flea, flea_brand: flea ? r.pick(['Frontline Plus', 'NexGard', 'Bravecto', 'Seresto']) : null, flea_date: flea ? dc.date.slice(0, 8) + '01' : null, medical_alert: m % 5 === 0 ? 'Gets anxious around big dogs' : null });
      m++;
    }
  }
}
