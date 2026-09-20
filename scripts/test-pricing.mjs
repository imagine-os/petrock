// Tiny unit tests for src/pricing/engine.ts. Run: npm run test:pricing (Node 22 type stripping). Exit 1 on failure.
import assert from 'node:assert/strict';
const e = await import('../src/pricing/engine.ts');

// Numbers mirror the seed, which mirrors petrockhotel.com (D-187): Penthouse $135/$150, holiday $165/$175; Suite $100/$110.
const rates = [
  { room_type_id: 'rt_ph', day_kind: 'weekday', season_id: null, price_per_night: 135 }, { room_type_id: 'rt_ph', day_kind: 'weekend', season_id: null, price_per_night: 150 },
  { room_type_id: 'rt_ph', day_kind: 'weekday', season_id: 'sea_x', price_per_night: 165 }, { room_type_id: 'rt_ph', day_kind: 'weekend', season_id: 'sea_x', price_per_night: 175 },
  { room_type_id: 'rt_su', day_kind: 'weekday', season_id: null, price_per_night: 100 }, { room_type_id: 'rt_su', day_kind: 'weekend', season_id: null, price_per_night: 110 },
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
const seasons = [{ id: 'sea_x', starts_on: '2026-11-26', ends_on: '2027-01-01', is_holiday: true }]; // Thanksgiving - New Year's

// Mon 2026-09-21 -> Wed 2026-09-23: 2 weekday nights penthouse (135), 1 dog, cash, no discount
let q = e.quoteHotel({ roomTypeId: 'rt_ph', roomTypeName: 'Penthouse', checkIn: new Date(2026, 8, 21, 10), checkOut: new Date(2026, 8, 23, 10), dogs: 1, paidInFull: false, payWithCard: false, rates, seasons, discounts, fees, taxes });
assert.equal(q.nights, 2); assert.equal(q.subtotal, 270); assert.equal(q.taxTotal, 5.4); assert.equal(q.total, 275.4);

// Thu 24 -> Sun 27: Thu weekday 135 + Fri 150 + Sat 150 = 435, 2 dogs = 870, discount 15*2*3 = 90 -> 780; tax 15.6; card fee 3.89% of 795.6 = 30.95 -> 826.55
q = e.quoteHotel({ roomTypeId: 'rt_ph', roomTypeName: 'Penthouse', checkIn: new Date(2026, 8, 24, 10), checkOut: new Date(2026, 8, 27, 10), dogs: 2, paidInFull: false, payWithCard: true, rates, seasons, discounts, fees, taxes });
assert.equal(q.nights, 3); assert.equal(q.subtotal, 870); assert.equal(q.discountTotal, 90); assert.equal(q.taxTotal, 15.6); assert.equal(q.feeTotal, 30.95); assert.equal(q.total, 826.55);

// 7 nights suite paid in full (Mon 21 -> Mon 28): 4 weekday*100 + 3 weekend*110 = 400+330 = 730; 5% = 36.5 -> 693.5; tax 13.87 -> total 707.37
q = e.quoteHotel({ roomTypeId: 'rt_su', roomTypeName: 'Suite', checkIn: new Date(2026, 8, 21, 10), checkOut: new Date(2026, 8, 28, 10), dogs: 1, paidInFull: true, payWithCard: false, rates, seasons, discounts, fees, taxes });
assert.equal(q.nights, 7); assert.equal(q.subtotal, 730); assert.equal(q.discountTotal, 36.5); assert.equal(q.total, 707.37);
// same stay not paid in full -> no long-stay discount, note present
q = e.quoteHotel({ roomTypeId: 'rt_su', roomTypeName: 'Suite', checkIn: new Date(2026, 8, 21, 10), checkOut: new Date(2026, 8, 28, 10), dogs: 1, paidInFull: false, payWithCard: false, rates, seasons, discounts, fees, taxes });
assert.equal(q.discountTotal, 0); assert.ok(q.notes.some((n) => /Pay in full/.test(n)));
// holiday season: holiday rates and no long-stay discount (Dec 21 Mon -> Dec 28 Mon: 4 weekday*165 + 3 weekend*175 = 660+525 = 1185)
q = e.quoteHotel({ roomTypeId: 'rt_ph', roomTypeName: 'Penthouse', checkIn: new Date(2026, 11, 21, 10), checkOut: new Date(2026, 11, 28, 10), dogs: 1, paidInFull: true, payWithCard: false, rates, seasons, discounts, fees, taxes });
assert.equal(q.subtotal, 1185); assert.equal(q.discountTotal, 0); assert.ok(q.notes.some((n) => /holiday/.test(n)));

// grooming (Spa Menu prices): Gold L 85 + Furminator 25 = 110; tax 2.2; total 112.2; minutes 60 + 20
const gold = { id: 'pk_gold', name: 'Gold Groom', price_s: 55, price_m: 70, price_l: 85, price_xl: 100, price_giant: 140, minutes_s: 60, minutes_m: 60, minutes_l: 60, minutes_xl: 90, minutes_giant: 90 };
const fur = { id: 'ad_fur', name: 'Furminator', price: 25, starting_at: false, added_minutes_sm: 15, added_minutes_l: 20 };
let g = e.quoteGrooming({ pkg: gold, size: 'L', addons: [fur], payWithCard: false, fees, taxes });
assert.equal(g.subtotal, 110); assert.equal(g.taxTotal, 2.2); assert.equal(g.total, 112.2); assert.equal(g.minutes, 80);
g = e.quoteGrooming({ pkg: gold, size: 'Giant', addons: [], payWithCard: true, fees, taxes });
assert.equal(g.subtotal, 140); assert.equal(g.feeTotal, e.round2(142.8 * 0.0389)); assert.equal(g.minutes, 90);

// daycare: 4 h -> half day $35 (threshold 5 h per the site), 2 pets -> 70 - 5 = 65, tax 1.3 -> 66.3
const pricing = [{ item: 'full_day', name: 'Full Day', price: 45, threshold_hours: 5, active: true }, { item: 'half_day', name: 'Half Day', price: 35, threshold_hours: 5, active: true }, { item: 'hour', name: 'Play Hour', price: 15, threshold_hours: null, active: true }];
let d = e.quoteDaycare({ hours: 4, pets: 2, pricing, discounts, payWithCard: false, fees, taxes });
assert.equal(d.item, 'half_day'); assert.equal(d.subtotal, 70); assert.equal(d.discountTotal, 5); assert.equal(d.total, 66.3);
d = e.quoteDaycare({ hours: 8, pets: 1, pricing, discounts, payWithCard: false, fees, taxes });
assert.equal(d.item, 'full_day'); assert.equal(d.total, 45.9);
d = e.quoteDaycare({ hours: 1, pets: 1, pricing, discounts, payWithCard: false, fees, taxes });
assert.equal(d.item, 'hour'); assert.equal(d.subtotal, 15);
// 5 h is a full day, 4.5 h is still a half day (site cutoff: "Full Day (>5 hr.)" / "Half Day (<5hr.)")
assert.equal(e.quoteDaycare({ hours: 5, pets: 1, pricing, discounts, payWithCard: false, fees, taxes }).item, 'full_day');
assert.equal(e.quoteDaycare({ hours: 4.5, pets: 1, pricing, discounts, payWithCard: false, fees, taxes }).item, 'half_day');

assert.equal(e.dayKind(new Date(2026, 8, 18)), 'weekend'); // Friday
assert.equal(e.dayKind(new Date(2026, 8, 17)), 'weekday'); // Thursday
console.log('pricing engine: all assertions passed');
