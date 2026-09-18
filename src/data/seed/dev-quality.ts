/**
 * dev-quality seed (R-X86): twelve months of history so reports have something to chart, plus performance budgets
 * and a first QA run. Runs after core (order 50) and reads the pricing tables core created, so every historical
 * total comes from src/pricing/engine.ts, never from a constant here. Historical rows carry `quote: null` to keep
 * the localStorage snapshot small (the invoice keeps the lines).
 */
import type { SeedCtx } from './index';
import { rng, addDays, at, isoDay } from './rng';
import { quoteHotel, quoteGrooming, quoteDaycare, nightsBetween, type RateLike, type SeasonLike, type DiscountLike, type FeeLike, type TaxLike, type PackageLike, type AddonLike, type DaycarePriceLike, type Size } from '../../pricing/engine';
import { DEFAULT_LOCATION_ID } from '../../tenant/locations';

export const order = 50;

export function seed(ctx: SeedCtx) {
  const { add, db, now } = ctx;
  const r = rng(20250918); // own stream so core's data does not shift when this file changes
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const D = (n: number) => addDays(today, n);

  const customers = db.customers as unknown as { id: string; home_location_id: string | null }[];
  const pets = db.pets as unknown as { id: string; customer_id: string; weight_lbs: number | null; size: string | null; approval_status: string }[];
  const roomTypes = db.room_types as unknown as { id: string; name: string; key: string }[];
  const rooms = db.rooms as unknown as { id: string; location_id: string; room_type_id: string }[];
  const rates = db.rates as unknown as RateLike[];
  const seasons = db.seasons as unknown as SeasonLike[];
  const discounts = db.discounts as unknown as DiscountLike[];
  const fees = db.fees as unknown as FeeLike[];
  const taxes = db.taxes as unknown as TaxLike[];
  const packages = db.packages as unknown as PackageLike[];
  const addons = db.addons as unknown as AddonLike[];
  const daycarePricing = db.daycare_pricing as unknown as DaycarePriceLike[];
  const groomers = (db.employees as unknown as { id: string; location_id: string; is_groomer: boolean }[]).filter((e) => e.is_groomer);
  if (!customers.length || !pets.length || !roomTypes.length) return;

  const ph = roomTypes.find((t) => t.key === 'penthouse') ?? roomTypes[0];
  const su = roomTypes.find((t) => t.key === 'suite') ?? roomTypes[roomTypes.length - 1];
  const petsOf = (cid: string) => pets.filter((p) => p.customer_id === cid && p.approval_status === 'approved');
  const monthWeight = (d: Date) => { const m = d.getMonth(); return [0.7, 0.6, 0.8, 0.9, 1.0, 1.3, 1.5, 1.4, 0.9, 0.8, 1.1, 1.4][m]; }; // summer + holidays busier

  let bkNo = 5001, invNo = 5001, apNo = 2001, dcNo = 1001;
  // ---- hotel stays: check-out between 365 and 22 days ago ----
  for (let day = -365; day <= -22; day++) {
    const dayDate = D(day);
    const arrivals = r.chance(monthWeight(dayDate) * 0.55) ? r.int(1, 2) : 0; // about 1 stay per day on average
    for (let k = 0; k < arrivals; k++) {
      const c = r.pick(customers);
      const cps = petsOf(c.id);
      if (!cps.length) continue;
      const petsOn = cps.length > 1 && r.chance(0.35) ? cps.slice(0, 2) : [r.pick(cps)];
      const heavy = petsOn.some((p) => (p.weight_lbs ?? 0) >= 55);
      const rt = heavy ? su : r.chance(0.5) ? ph : su;
      const nights = r.chance(0.6) ? r.int(1, 4) : r.int(5, 14);
      if (day + nights > -22) continue;
      const locId = c.home_location_id ?? DEFAULT_LOCATION_ID;
      const checkIn = new Date(dayDate); checkIn.setHours(r.pick([8, 9, 10, 11, 16, 17]), 0, 0, 0);
      const checkOut = new Date(D(day + nights)); checkOut.setHours(r.pick([9, 10, 11, 12]), 0, 0, 0);
      const paidInFull = r.chance(0.55), card = r.chance(0.75);
      const q = quoteHotel({ roomTypeId: rt.id, roomTypeName: rt.name, checkIn, checkOut, dogs: petsOn.length, paidInFull, payWithCard: card, rates, seasons, discounts, fees, taxes });
      const status = r.chance(0.9) ? 'checked_out' : r.chance(0.6) ? 'cancelled' : 'no_show';
      const pool = rooms.filter((x) => x.location_id === locId && x.room_type_id === rt.id);
      const room = status === 'checked_out' && pool.length ? r.pick(pool).id : null;
      const paymentStatus = status === 'checked_out' ? 'paid' : 'refunded';
      const id = `bk_${bkNo}`;
      add('bookings', { id, location_id: locId, code: `PR-${bkNo}`, customer_id: c.id, room_type_id: rt.id, room_id: room, check_in: checkIn.toISOString(), check_out: checkOut.toISOString(), nights: nightsBetween(checkIn, checkOut), status, share_room: petsOn.length > 1, add_grooming: r.chance(0.3), handler_id: null, paid_in_full: paidInFull, payment_method: card ? 'card' : 'cash', payment_status: paymentStatus, subtotal: q.subtotal, discount_total: q.discountTotal, fee_total: q.feeTotal, tax_total: q.taxTotal, total: q.total, deposit: paidInFull ? q.total : Math.round(q.total * 0.3), quote: null, notes: null, include_notes_on_invoice: false, source: r.chance(0.5) ? 'app' : 'desk', created_at: at(D(day - r.int(3, 30)), 12), updated_at: checkOut.toISOString() });
      petsOn.forEach((p) => add('booking_pets', { id: `bp_${id}_${p.id}`, booking_id: id, pet_id: p.id, room_id: room, takes_medication: false, medication: null, dosing: null, flea_medication: r.chance(0.3), medical_alert: null }));
      if (status === 'checked_out') {
        const invId = `inv_${invNo}`;
        add('invoices', { id: invId, location_id: locId, number: `INV-${invNo}`, customer_id: c.id, source_type: 'booking', source_id: id, lines: q.lines, subtotal: q.subtotal, discount_total: q.discountTotal, fee_total: q.feeTotal, tax_total: q.taxTotal, total: q.total, deposit: q.total, balance: 0, status: 'paid', issued_at: checkOut.toISOString(), footer: 'Rock Out With Your Paws Out!' });
        add('payments', { id: `pay_${invId}`, location_id: locId, invoice_id: invId, customer_id: c.id, amount: q.total, method: card ? 'card' : 'cash', status: 'paid', provider: 'mock', provider_ref: `mock_${invId}`, card_brand: card ? r.pick(['visa', 'mastercard', 'amex']) : null, card_last4: card ? String(r.int(1000, 9999)) : null, is_deposit: false, paid_at: checkOut.toISOString(), refund_of: null, note: null });
        invNo++;
      }
      bkNo++;
    }
  }

  // ---- grooming appointments: about one per working day per location ----
  for (let day = -365; day <= -8; day++) {
    const dayDate = D(day);
    if (dayDate.getDay() === 0) continue;
    const n = r.chance(monthWeight(dayDate) * 0.6) ? r.int(1, 3) : 0;
    for (let k = 0; k < n; k++) {
      const p = r.pick(pets);
      const c = customers.find((x) => x.id === p.customer_id);
      if (!c || !packages.length) continue;
      const locId = c.home_location_id ?? DEFAULT_LOCATION_ID;
      const pkg = r.pick(packages);
      const adds = r.chance(0.5) && addons.length ? [r.pick(addons)] : [];
      const size = (p.size ?? 'M') as Size;
      const card = r.chance(0.8);
      const q = quoteGrooming({ pkg, size, addons: adds, payWithCard: card, fees, taxes });
      const status = r.chance(0.88) ? 'done' : r.chance(0.5) ? 'cancelled' : 'no_show';
      const groomer = groomers.find((g) => g.location_id === locId) ?? groomers[0];
      const startsAt = at(dayDate, r.pick([9, 10, 11, 13, 14, 15]), r.pick([0, 30]));
      const id = `ap_${apNo}`;
      add('appointments', { id, location_id: locId, code: `GR-${apNo}`, customer_id: c.id, pet_id: p.id, package_id: pkg.id, addon_ids: adds.map((a) => a.id), groomer_id: groomer?.id ?? null, starts_at: startsAt, duration_min: q.minutes ?? 60, status, booking_id: null, size, subtotal: q.subtotal, tax_total: q.taxTotal, total: q.total, payment_status: status === 'done' ? 'paid' : 'refunded', notes: null, created_at: at(D(day - r.int(1, 14)), 10), updated_at: startsAt });
      if (status === 'done') {
        const invId = `inv_${invNo}`;
        add('invoices', { id: invId, location_id: locId, number: `INV-${invNo}`, customer_id: c.id, source_type: 'appointment', source_id: id, lines: q.lines, subtotal: q.subtotal, discount_total: q.discountTotal, fee_total: q.feeTotal, tax_total: q.taxTotal, total: q.total, deposit: q.total, balance: 0, status: 'paid', issued_at: startsAt, footer: 'Rock Out With Your Paws Out!' });
        add('payments', { id: `pay_${invId}`, location_id: locId, invoice_id: invId, customer_id: c.id, amount: q.total, method: card ? 'card' : 'cash', status: 'paid', provider: 'mock', provider_ref: `mock_${invId}`, card_brand: card ? r.pick(['visa', 'mastercard', 'amex']) : null, card_last4: card ? String(r.int(1000, 9999)) : null, is_deposit: false, paid_at: startsAt, refund_of: null, note: null });
        invNo++;
      }
      apNo++;
    }
  }

  // ---- daycare days ----
  for (let day = -365; day <= -7; day++) {
    const dayDate = D(day);
    if (dayDate.getDay() === 0 || dayDate.getDay() === 6) continue;
    const n = r.chance(0.7) ? r.int(1, 2) : 0;
    for (let k = 0; k < n; k++) {
      const c = r.pick(customers);
      const cps = petsOf(c.id);
      if (!cps.length || !daycarePricing.length) continue;
      const hours = r.pick([3, 4, 5, 7, 8, 9, 10]);
      const petIds = cps.slice(0, r.chance(0.3) ? 2 : 1).map((p) => p.id);
      const card = r.chance(0.6);
      const q = quoteDaycare({ hours, pets: petIds.length, pricing: daycarePricing, discounts, payWithCard: card, fees, taxes });
      const locId = c.home_location_id ?? DEFAULT_LOCATION_ID;
      const status = r.chance(0.93) ? 'checked_out' : 'cancelled';
      const id = `dc_${dcNo}`;
      const checkIn = r.pick([7, 8, 9]);
      add('daycare_bookings', { id, location_id: locId, code: `DC-${dcNo}`, customer_id: c.id, pet_ids: petIds, date: isoDay(dayDate), check_in_time: `${String(checkIn).padStart(2, '0')}:00`, check_out_time: `${String(Math.min(19, checkIn + hours)).padStart(2, '0')}:00`, item: q.item, status, subtotal: q.subtotal, discount_total: q.discountTotal, tax_total: q.taxTotal, total: q.total, payment_status: status === 'checked_out' ? 'paid' : 'refunded', notes: null, created_at: at(D(day - 1), 18), updated_at: at(dayDate, 18) });
      if (status === 'checked_out') {
        const invId = `inv_${invNo}`;
        add('invoices', { id: invId, location_id: locId, number: `INV-${invNo}`, customer_id: c.id, source_type: 'daycare', source_id: id, lines: q.lines, subtotal: q.subtotal, discount_total: q.discountTotal, fee_total: q.feeTotal, tax_total: q.taxTotal, total: q.total, deposit: q.total, balance: 0, status: 'paid', issued_at: at(dayDate, 18), footer: 'Rock Out With Your Paws Out!' });
        add('payments', { id: `pay_${invId}`, location_id: locId, invoice_id: invId, customer_id: c.id, amount: q.total, method: card ? 'card' : 'cash', status: 'paid', provider: 'mock', provider_ref: `mock_${invId}`, card_brand: card ? 'visa' : null, card_last4: card ? String(r.int(1000, 9999)) : null, is_deposit: false, paid_at: at(dayDate, 18), refund_of: null, note: null });
        invNo++;
      }
      dcNo++;
    }
  }

  // ---- reviews spread over the year (published) ----
  const reviewText: [number, string, string][] = [[5, 'Home away from home', 'Nightly photos, happy dog, easy pickup.'], [4, 'Great groom', 'Platinum groom was worth it; a bit of a wait at pickup.'], [5, 'Daycare champion', 'Comes home tired and happy every time.'], [4, 'Clean rooms', 'Penthouse was spotless; TV was a nice touch.'], [3, 'Busy front desk', 'Took a while at 6 pm but staff were kind.'], [5, 'Trust them completely', 'Medication given on time, updates every night.']];
  for (let m = 11; m >= 1; m--) {
    const c = r.pick(customers);
    const [rating, title, body] = r.pick(reviewText);
    add('reviews', { id: `rev_h_${m}`, location_id: c.home_location_id ?? DEFAULT_LOCATION_ID, customer_id: c.id, rating, title, body, tags: rating >= 5 ? ['Excellent'] : rating >= 4 ? ['Amazing'] : ['Normal'], status: 'published', created_at: at(D(-m * 30 - r.int(0, 20)), 15), updated_at: at(D(-m * 30), 15) });
  }

  // ---- performance budgets (R-X85) ----
  const budgets: [string, string, number, 'kb' | 'ms' | 'count' | 'percent', string][] = [
    ['js_total_kb', 'Total JavaScript (gzip)', 500, 'kb', 'All JS assets in dist/assets, gzip size'],
    ['css_total_kb', 'Total CSS (gzip)', 60, 'kb', 'All CSS assets in dist/assets, gzip size'],
    ['largest_chunk_kb', 'Largest JS chunk (gzip)', 450, 'kb', 'Biggest single JS asset'],
    ['docs_kb', 'Bundled docs (raw)', 1200, 'kb', 'Markdown pulled in by the docs viewer glob'],
    ['localstorage_kb', 'Mock database in localStorage', 3500, 'kb', 'petrock.db.v1 snapshot; browsers cap the origin at about 5 MB'],
    ['seed_ms', 'Seed build time', 400, 'ms', 'buildSeed() on this machine'],
    ['first_render_ms', 'First render', 1500, 'ms', 'performance.timing domContentLoaded to first paint of #root'],
    ['route_count_max', 'Routes in the manifest', 220, 'count', 'Sanity limit for the registry'],
    ['assets_count_max', 'Files in dist/assets', 120, 'count', 'Chunks + images + fonts'],
  ];
  budgets.forEach(([metric, label, budget, unit, description], i) => add('perf_budgets', { id: `pb_${i + 1}`, metric, label, budget, unit, warn_at_percent: 80, description, active: true }));

  // ---- a first QA run so D-12 has a row before scripts run ----
  add('qa_runs', { id: 'qa_seed_1', kind: 'responsive', label: 'Foundation responsive check', started_at: at(D(-1), 9), finished_at: at(D(-1), 9, 12), routes: 21, widths: [360, 390, 768, 1280, 1920], issues: 0, result: 'pass', report_path: 'docs/qa/responsive-report.md', triggered_by: 'script', summary: null });

  // ---- one saved D-11 layout (F-01 with the attention list first) so page_layouts has a demo row ----
  add('page_layouts', { id: 'pl_seed_1', page_code: 'F-01', order: ['Attention list', 'KPI tiles', 'Arrivals', 'Departures', 'Grooms today', 'Daycare today'], hidden: [] });
}
