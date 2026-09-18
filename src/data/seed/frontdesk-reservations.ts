/**
 * Seed for the front desk reservations module: an activity trail for every core booking (created + each status it
 * passed through) and a few additional services on desk-created stays. Runs after core (order 10).
 */
import type { SeedCtx } from './index';
import type { BaseRow } from '../schema/types';

export const order = 10;

interface B extends BaseRow { id: string; location_id: string; status: string; check_in: string; created_at: string; source: string | null; customer_id: string; notes: string | null }
interface S extends BaseRow { id: string; name: string; category: string; price: number }

const PATH: Record<string, string[]> = {
  requested: ['requested'], pending_vaccines: ['requested', 'pending_vaccines'], confirmed: ['requested', 'confirmed'],
  checked_in: ['requested', 'confirmed', 'checked_in'], checked_out: ['requested', 'confirmed', 'checked_in', 'checked_out'],
  cancelled: ['requested', 'confirmed', 'cancelled'], no_show: ['requested', 'confirmed', 'no_show'],
};
const STAFF = [['usr_desk', 'Marcus Lee'], ['usr_desk_ww', 'Dana Whitfield'], ['usr_manager', 'Priya Natarajan']] as const;

export function seed(ctx: SeedCtx) {
  const { add, r } = ctx;
  const bookings = (ctx.db.bookings ?? []) as B[];
  const extras = ((ctx.db.services ?? []) as S[]).filter((s) => s.category === 'extra');
  bookings.forEach((b, i) => {
    const path = PATH[b.status] ?? ['requested'];
    const created = new Date(b.created_at);
    const who = b.source === 'app' ? [null, 'Customer app'] as const : STAFF[i % STAFF.length];
    add('booking_events', { id: `bev_${b.id}_0`, location_id: b.location_id, booking_id: b.id, kind: 'created', from_status: null, to_status: 'requested', summary: b.source === 'app' ? 'Booked from the customer app' : 'Created at the front desk', user_id: who[0], user_name: who[1], approval_id: null, details: null, at: created.toISOString() });
    path.slice(1).forEach((to, n) => {
      const from = path[n];
      const at = new Date(created); at.setHours(at.getHours() + (n + 1) * r.int(2, 40));
      const gated = to === 'cancelled' || to === 'no_show';
      add('booking_events', { id: `bev_${b.id}_${n + 1}`, location_id: b.location_id, booking_id: b.id, kind: 'status', from_status: from, to_status: to, summary: `Status ${from.replace('_', ' ')} → ${to.replace('_', ' ')}${gated ? ' (manager PIN)' : ''}`, user_id: STAFF[i % 2][0], user_name: STAFF[i % 2][1], approval_id: null, details: gated ? { approver: 'Priya Natarajan' } : null, at: at.toISOString() });
    });
    if (b.source !== 'app' && i % 4 === 1 && extras.length) {
      const s = extras[i % extras.length];
      add('booking_services', { id: `bsv_${b.id}_1`, booking_id: b.id, service_id: s.id, label: s.name, pet_id: null, rate: s.price, qty: 1, total: s.price, occurs: 'once', morning: true, afternoon: false, evening: false, note: null });
    }
  });
}
