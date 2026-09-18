// Tiny unit tests for src/pricing/engine.ts. Run: npm run test:pricing (Node 22 type stripping). Exit 1 on failure.
import assert from 'node:assert/strict';
const e = await import('../src/pricing/engine.ts');

const rates = [
  { room_type_id: 'rt_ph', day_kind: 'weekday', season_id: null, price_per_night: 120 }, { room_type_id: 'rt_ph', day_kind: 'weekend', season_id: null, price_per_night: 135 },
  { room_type_id: 'rt_ph', day_kind: 'weekday', season_id: 'sea_x', price_per_night: 140 }, { room_type_id: 'rt_ph', day_kind: 'weekend', season_id: 'sea_x', price_per_night: 155 },
  { room_type_id: 'rt_su', day_kind: 'weekday', season_id: null, price_per_night: 85 }, { room_type_id: 'rt_su', day_kind: 'weekend', season_id: null, price_per_night: 95 },
];
const discounts = [
  { name: '2 dogs in a penthouse', kind: 'multi_dog', room_type_id: 'rt_ph', dog_count: 2, min_nights: null, amount_off: 15, percent_off: null, requires_paid_in_full: false, excludes_holidays: false, active: true },
  { name: '3 dogs in a penthouse', kind: 'multi_dog', room_type_id: 'rt_ph', dog_count: 3, min_nights: null, amount_off: 20, percent_off: null, requires_paid_in_full: false, excludes_holidays: false, active: true },
  { name: '7+ nights paid in full', kind: 'long_stay', room_type_id: null, dog_count: null, min_nights: 7, amount_off: 0, percent_off: 5, requires_paid_in_full: true, excludes_holidays: true, active: true },
  { name: '14+ nights paid in full', kind: 'long_stay', room_type_id: null, dog_count: null, min_nights: 14, amount_off: 0, percent_off: 7.5, requires_paid_in_full: true, excludes_holidays: true, active: true },
  { name: 'Extra pet daycare', kind: 'daycare_extra_pet', room_type_id: null, dog_count: null, min_nights: null, amount_off: 5, percent_off: null, requires_paid_in_full: false, excludes_holidays: false, active: true },
];
const fees = [{ name: 'Card service fee', kind: 'card', percent: 3.89, applies_to: 'card_payments', active: true }];
const taxes = [{ name: 'Tax', service_rate: 2, product_rate: 2, boarding_rate: 2, prices_inclusive: false, active: true }];
const seasons = [{ id: 'sea_x', starts_on: '2026-12-20', ends_on: '2027-01-03', is_holiday: true }];

// Mon 2026-09-21 -> Wed 2026-09-23: 2 weekday nights penthouse, 1 dog, cash, no discount
let q = e.quoteHotel({ roomTypeId: 'rt_ph', roomTypeName: 'Penthouse', checkIn: new Date(2026, 8, 21, 10), checkOut: new Date(2026, 8, 23, 10), dogs: 1, paidInFull: false, payWithCard: false, rates, seasons, discounts, fees, taxes });
assert.equal(q.nights, 2); assert.equal(q.subtotal, 240); assert.equal(q.taxTotal, 4.8); assert.equal(q.total, 244.8);

// Thu 24 -> Sun 27: Thu weekday 120 + Fri 135 + Sat 135 = 390, 2 dogs = 780, discount 15*2*3 = 90 -> 690; tax 13.8; card fee 3.89% of 703.8 = 27.38 -> 731.18
q = e.quoteHotel({ roomTypeId: 'rt_ph', roomTypeName: 'Penthouse', checkIn: new Date(2026, 8, 24, 10), checkOut: new Date(2026, 8, 27, 10), dogs: 2, paidInFull: false, payWithCard: true, rates, seasons, discounts, fees, taxes });
assert.equal(q.nights, 3); assert.equal(q.subtotal, 780); assert.equal(q.discountTotal, 90); assert.equal(q.taxTotal, 13.8); assert.equal(q.feeTotal, 27.38); assert.equal(q.total, 731.18);

// 7 nights suite paid in full (Mon 21 -> Mon 28): 4 weekday*85 + 3 weekend*95 = 340+285 = 625; 5% = 31.25 -> 593.75; tax 11.88 (11.875) -> total 605.63
q = e.quoteHotel({ roomTypeId: 'rt_su', roomTypeName: 'Suite', checkIn: new Date(2026, 8, 21, 10), checkOut: new Date(2026, 8, 28, 10), dogs: 1, paidInFull: true, payWithCard: false, rates, seasons, discounts, fees, taxes });
assert.equal(q.nights, 7); assert.equal(q.subtotal, 625); assert.equal(q.discountTotal, 31.25); assert.equal(q.total, 605.63);
// same stay not paid in full -> no long-stay discount, note present
q = e.quoteHotel({ roomTypeId: 'rt_su', roomTypeName: 'Suite', checkIn: new Date(2026, 8, 21, 10), checkOut: new Date(2026, 8, 28, 10), dogs: 1, paidInFull: false, payWithCard: false, rates, seasons, discounts, fees, taxes });
assert.equal(q.discountTotal, 0); assert.ok(q.notes.some((n) => /Pay in full/.test(n)));
// holiday season: seasonal rates and no long-stay discount (Dec 21 Mon -> Dec 28 Mon: 4 weekday*140 + 3 weekend*155 = 560+465 = 1025)
q = e.quoteHotel({ roomTypeId: 'rt_ph', roomTypeName: 'Penthouse', checkIn: new Date(2026, 11, 21, 10), checkOut: new Date(2026, 11, 28, 10), dogs: 1, paidInFull: true, payWithCard: false, rates, seasons, discounts, fees, taxes });
assert.equal(q.subtotal, 1025); assert.equal(q.discountTotal, 0); assert.ok(q.notes.some((n) => /holiday/.test(n)));

// grooming: Gold L 80 + Furminator 25 = 105; tax 2.1; total 107.1; minutes 60 + 0
const gold = { id: 'pk_gold', name: 'Gold Groom', price_s: 50, price_m: 65, price_l: 80, price_xl: 95, price_giant: 135, minutes_s: 60, minutes_m: 60, minutes_l: 60, minutes_xl: 90, minutes_giant: 90 };
const fur = { id: 'ad_fur', name: 'Furminator', price: 25, starting_at: false, added_minutes_sm: 15, added_minutes_l: 20 };
let g = e.quoteGrooming({ pkg: gold, size: 'L', addons: [fur], payWithCard: false, fees, taxes });
assert.equal(g.subtotal, 105); assert.equal(g.taxTotal, 2.1); assert.equal(g.total, 107.1); assert.equal(g.minutes, 80);
g = e.quoteGrooming({ pkg: gold, size: 'Giant', addons: [], payWithCard: true, fees, taxes });
assert.equal(g.subtotal, 135); assert.equal(g.feeTotal, e.round2(137.7 * 0.0389)); assert.equal(g.minutes, 90);

// daycare: 4 h -> half day $35 (threshold 6), 2 pets -> 70 - 5 = 65, tax 1.3 -> 66.3
const pricing = [{ item: 'full_day', name: 'Full Day', price: 45, threshold_hours: 6, active: true }, { item: 'half_day', name: 'Half Day', price: 35, threshold_hours: 6, active: true }, { item: 'hour', name: 'Play Hour', price: 15, threshold_hours: null, active: true }];
let d = e.quoteDaycare({ hours: 4, pets: 2, pricing, discounts, payWithCard: false, fees, taxes });
assert.equal(d.item, 'half_day'); assert.equal(d.subtotal, 70); assert.equal(d.discountTotal, 5); assert.equal(d.total, 66.3);
d = e.quoteDaycare({ hours: 8, pets: 1, pricing, discounts, payWithCard: false, fees, taxes });
assert.equal(d.item, 'full_day'); assert.equal(d.total, 45.9);
d = e.quoteDaycare({ hours: 1, pets: 1, pricing, discounts, payWithCard: false, fees, taxes });
assert.equal(d.item, 'hour'); assert.equal(d.subtotal, 15);

assert.equal(e.dayKind(new Date(2026, 8, 18)), 'weekend'); // Friday
assert.equal(e.dayKind(new Date(2026, 8, 17)), 'weekday'); // Thursday
console.log('pricing engine: all assertions passed');
