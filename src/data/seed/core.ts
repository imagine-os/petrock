/**
 * Core seed: 2 locations, demo users per role, employees with hashed PINs, 8 customers, 14 pets with vaccine records
 * in mixed states, rooms per location, rates/seasons/discounts/fees/taxes, packages/add-ons, daycare pricing,
 * ~30 hotel bookings across statuses around today, appointments, daycare days, invoices, payments, messages,
 * reviews, feedback, approvals, notifications. Deterministic (rng). All people and pets are fictional.
 */
import type { SeedCtx } from './index';
import { locations as LOCS, DEFAULT_LOCATION_ID } from '../../tenant/locations';
import { demoUsers } from '../../auth/demoUsers';
import { hashPin } from '../../auth/pin';
import { ROLES, ROLE_LABEL } from '../../auth/roles';
import { ROLE_PERMISSIONS } from '../../auth/permissions';
import { addDays, at, isoDay } from './rng';
import { quoteHotel, quoteGrooming, quoteDaycare, nightsBetween, type RateLike, type SeasonLike, type DiscountLike, type FeeLike, type TaxLike, type PackageLike, type AddonLike, type DaycarePriceLike, type Size } from '../../pricing/engine';
import { sizeFromWeightLbs } from '../../domain/booking';

export const order = 0;

export function seed(ctx: SeedCtx) {
  const { add, r, now } = ctx;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const D = (n: number) => addDays(today, n);

  // ---- locations & capacities & holidays ----
  LOCS.forEach((l, i) => {
    add('locations', { id: l.id, name: l.name, short_name: l.shortName, slug: l.slug, city: l.city, address: l.address, phone: l.phone, timezone: l.timezone, hours: l.hours, sort_order: i, active: true, note: null });
    (['penthouse', 'suite', 'daycare', 'grooming'] as const).forEach((kind) => add('capacities', { id: `cap_${l.slug}_${kind}`, location_id: l.id, kind, max_simultaneous: l.capacities[kind], note: kind === 'penthouse' ? 'Dogs over 30 lbs only fit the bottom 6 penthouse rooms' : null }));
    add('holidays', { id: `hol_${l.slug}_xmas`, location_id: l.id, date: `${today.getFullYear()}-12-25`, name: 'Christmas Day', is_holiday: true, boarding_closed: false });
    add('holidays', { id: `hol_${l.slug}_tg`, location_id: l.id, date: `${today.getFullYear()}-11-26`, name: 'Thanksgiving', is_holiday: true, boarding_closed: false });
  });
  ctx.ids.locations = LOCS.map((l) => l.id);

  // ---- roles & permissions ----
  for (const role of ROLES) {
    add('roles', { id: `role_${role}`, key: role, label: ROLE_LABEL[role], description: null, menu: null });
    for (const p of ROLE_PERMISSIONS[role]) add('permissions', { id: `perm_${role}_${p.replace(/\W/g, '_')}`, role, permission: p, granted: true });
  }

  // ---- users & employees (demo staff) ----
  for (const u of demoUsers) {
    if (u.role === 'public') continue;
    add('users', { id: u.id, name: u.name, email: u.email, role: u.role, location_id: u.locationId, phone: null, avatar_url: null, active: true, preferred_language: 'en' });
  }
  const staff = demoUsers.filter((u) => u.pin);
  const colors = ['#552583', '#E79DD1', '#2A9D8F', '#F4A261', '#1456F5', '#039B00'];
  staff.forEach((u, i) => add('employees', {
    id: `emp_${u.id.replace('usr_', '')}`, location_id: u.locationId ?? DEFAULT_LOCATION_ID, user_id: u.id, name: u.name, display_name: u.name.split(' ')[0], email: u.email, phone: null,
    department: u.role === 'groomer' ? 'Groom' : u.role === 'front_desk' ? 'Receptionist' : 'Operations', job_title: ROLE_LABEL[u.role], status: 'active', color: colors[i % colors.length],
    is_groomer: u.role === 'groomer', is_handler: u.role !== 'owner' && u.role !== 'super_admin', pin_hash: hashPin(u.pin!), working_hours: null, date_started: isoDay(D(-400 - i * 30)), note: null,
  }));
  // a second groomer and a handler at Westwood (no login)
  add('employees', { id: 'emp_jessica', location_id: 'loc_westwood', user_id: null, name: 'Jessica Moreno', display_name: 'Jessica', email: 'jessica@demo.petrock.test', phone: null, department: 'Groom', job_title: 'Groomer', status: 'active', color: '#F4A261', is_groomer: true, is_handler: false, pin_hash: hashPin('6666'), working_hours: null, date_started: isoDay(D(-200)), note: null });
  add('employees', { id: 'emp_theo', location_id: 'loc_encino', user_id: null, name: 'Theo Park', display_name: 'Theo', email: null, phone: null, department: 'Take Care', job_title: 'Handler', status: 'on_leave', color: '#2A9D8F', is_groomer: false, is_handler: true, pin_hash: null, working_hours: null, date_started: isoDay(D(-90)), note: 'Back in two weeks' });
  ctx.ids.groomers = ['emp_groomer', 'emp_jessica'];

  // ---- vets & vaccine types ----
  const vets = ['Ventura Animal Hospital', 'Westwood Veterinary Group', 'Dr. Ana Solis DVM'].map((name, i) => add('vets', { id: `vet_${i + 1}`, name, phone: null, address: null }));
  const vaccineTypes = [
    { id: 'vt_rabies', name: 'Rabies', short_name: 'Rabies', required: true }, { id: 'vt_dhpp', name: 'DHPP (Distemper / Parvo)', short_name: 'DHPP', required: true },
    { id: 'vt_bord', name: 'Bordetella', short_name: 'Bordetella', required: true }, { id: 'vt_lepto', name: 'Leptospirosis', short_name: 'Lepto', required: false }, { id: 'vt_flu', name: 'Canine Influenza', short_name: 'Influenza', required: false },
  ].map((v, i) => add('vaccine_types', { ...v, sort_order: i, note: null }));

  // ---- customers & pets ----
  const people = [
    ['Avery', 'Thompson', 'usr_customer', 'loc_encino'], ['Maya', 'Okafor', null, 'loc_encino'], ['Diego', 'Fernandez', null, 'loc_westwood'], ['Hannah', 'Kim', null, 'loc_westwood'],
    ['Liam', 'Goldberg', null, 'loc_encino'], ['Sofia', 'Marchetti', null, 'loc_westwood'], ['Noah', 'Patel', null, 'loc_encino'], ['Grace', 'Nakamura', null, 'loc_westwood'],
  ] as const;
  const customers = people.map(([first, last, userId, home], i) => add('customers', {
    id: `cus_${i + 1}`, user_id: userId, first_name: first, last_name: last, email: `${first.toLowerCase()}.${last.toLowerCase()}@demo.petrock.test`, mobile: `+1 (818) 555-01${String(20 + i).padStart(2, '0')}`, alt_phone: null,
    address: `${1200 + i * 37} ${r.pick(['Ventura Blvd', 'Wilshire Blvd', 'Balboa Blvd', 'Sepulveda Blvd'])}`, apt_suite: null, city: home === 'loc_encino' ? 'Encino' : 'Los Angeles', state: 'CA', zip: home === 'loc_encino' ? '91316' : '90024',
    status: 'active', preferred_contact: 'mobile', home_location_id: home, marketing_opt_in: r.chance(0.7), note: null, balance: 0,
  }));
  ctx.ids.customers = customers.map((c) => c.id);
  const petSpecs: [string, string, string, number, 'male' | 'female', string][] = [
    ['Biscuit', 'Golden Retriever', 'cus_1', 68, 'male', 'Calm'], ['Mochi', 'Shiba Inu', 'cus_1', 22, 'female', 'Shy'],
    ['Pepper', 'Border Collie', 'cus_2', 42, 'female', 'Hyper'], ['Bruno', 'Boxer', 'cus_3', 64, 'male', 'Calm'], ['Luna', 'Pomeranian', 'cus_3', 8, 'female', 'Calm'],
    ['Max', 'German Shepherd', 'cus_4', 82, 'male', 'Aggressive'], ['Olive', 'Cavapoo', 'cus_5', 16, 'female', 'Hyper'], ['Rocky', 'Bulldog', 'cus_5', 52, 'male', 'Calm'],
    ['Nala', 'Labradoodle', 'cus_6', 55, 'female', 'Calm'], ['Ziggy', 'Dachshund', 'cus_6', 14, 'male', 'Shy'], ['Bear', 'Bernese Mountain Dog', 'cus_7', 105, 'male', 'Calm'],
    ['Coco', 'Cockapoo', 'cus_7', 19, 'female', 'Hyper'], ['Daisy', 'Beagle', 'cus_8', 26, 'female', 'Calm'], ['Apollo', 'Doberman', 'cus_8', 78, 'male', 'Calm'],
  ];
  const pets = petSpecs.map(([name, breed, cid, lbs, sex, personality], i) => add('pets', {
    id: `pet_${i + 1}`, customer_id: cid, name, type: 'Dog', breed, is_mixed: false, sex, neutered: r.chance(0.8), color: r.pick(['Black', 'Brown', 'Cream', 'Brindle', 'Black and tan', 'White']), weight_lbs: lbs, size: sizeFromWeightLbs(lbs),
    date_of_birth: isoDay(D(-r.int(400, 3000))), personality, socialized_with: ['Humans', 'Dogs'], can_have_treats: r.chance(0.9), own_food: r.chance(0.5), meals_per_day: 'AM & PM', feeding_am: '1 cup kibble', feeding_midday: null, feeding_pm: '1 cup kibble',
    medical_conditions: i === 5 ? 'Hip dysplasia; no stairs' : null, allergies: i === 2 ? 'Chicken' : null, vet_id: vets[i % vets.length].id, attributes: personality === 'Aggressive' ? ['Muzzle', 'Staff only'] : null,
    approval_status: i === 12 ? 'pending' : i === 13 ? 'needs_details' : 'approved', status: 'active', photo_url: null, note: null,
  }));
  ctx.ids.pets = pets.map((p) => p.id);
  // vaccine records: mixed states. pet 13/14 pending pets have missing/submitted; a few expired
  pets.forEach((p, pi) => {
    vaccineTypes.forEach((vt, vi) => {
      let status = 'verified';
      if (pi === 12) status = vi < 2 ? 'submitted' : 'missing';
      else if (pi === 13) status = vi === 0 ? 'verified' : 'missing';
      else if (pi === 3 && vt.id === 'vt_bord') status = 'expired';
      else if (pi === 8 && vt.id === 'vt_rabies') status = 'expired';
      else if (!vt.required && r.chance(0.35)) status = 'missing';
      else if (pi === 6 && vt.id === 'vt_dhpp') status = 'submitted';
      const vaccinated = status === 'missing' ? null : isoDay(D(status === 'expired' ? -r.int(400, 500) : -r.int(20, 300)));
      const expires = vaccinated ? isoDay(addDays(new Date(vaccinated), 365)) : null;
      add('vaccine_records', { id: `vr_${pi + 1}_${vt.short_name.toLowerCase()}`, pet_id: p.id, vaccine_type_id: vt.id, vaccinated_on: vaccinated, expires_on: expires, proof_url: vaccinated ? `mock://uploads/${p.name.toLowerCase()}-${vt.short_name.toLowerCase()}.pdf` : null, proof_name: vaccinated ? `${p.name}-${vt.short_name}.pdf` : null, status, verified_by: status === 'verified' ? 'usr_desk' : null, verified_at: status === 'verified' ? at(D(-r.int(5, 200)), 11) : null, note: null });
    });
  });

  // ---- room types, rooms ----
  const rtPh = add('room_types', { id: 'rt_penthouse', name: 'Penthouse', key: 'penthouse', description: 'Petrock Penthouses offer a TV, premium bed, toys, potty pads, room service, playtime, 2 walks per day, photos and videos every night, a bedtime tuck-in and tummy rub.', max_weight_lbs: null, sort_order: 0, photo_url: null });
  const rtSu = add('room_types', { id: 'rt_suite', name: 'Suite', key: 'suite', description: 'Petrock Suites offer a premium bed, toys, potty pads, playtime, 2 walks per day and a bedtime tuck-in.', max_weight_lbs: null, sort_order: 1, photo_url: null });
  const rooms: Record<string, string[]> = {};
  for (const l of LOCS) {
    rooms[l.id] = [];
    for (let i = 0; i < l.capacities.penthouse; i++) { const pos = i < 6 ? 'bottom' : 'top'; rooms[l.id].push(add('rooms', { id: `room_${l.slug}_ph${i + 1}`, location_id: l.id, code: `PH(${pos === 'bottom' ? 'B' : 'T'}) ${100 + i + 1}`, room_type_id: rtPh.id, position: pos, sort_order: i, active: true, note: pos === 'bottom' ? 'Fits dogs over 30 lbs' : null }).id); }
    for (let i = 0; i < l.capacities.suite; i++) rooms[l.id].push(add('rooms', { id: `room_${l.slug}_s${i + 1}`, location_id: l.id, code: `Suite ${String.fromCharCode(65 + Math.floor(i / 8))}${(i % 8) + 1}`, room_type_id: rtSu.id, position: null, sort_order: 100 + i, active: true, note: null }).id);
  }

  // ---- pricing tables ----
  const seasonRows: SeasonLike[] = [add('seasons', { id: 'sea_winter', name: 'Winter holidays', starts_on: `${today.getFullYear()}-12-18`, ends_on: `${today.getFullYear() + 1}-01-04`, is_holiday: true }), add('seasons', { id: 'sea_summer', name: 'Summer peak', starts_on: `${today.getFullYear()}-06-15`, ends_on: `${today.getFullYear()}-08-31`, is_holiday: false })].map((s) => s as unknown as SeasonLike);
  const rateRows: RateLike[] = [];
  const rate = (rt: string, kind: 'weekday' | 'weekend', season: string | null, price: number) => rateRows.push(add('rates', { id: `rate_${rt}_${kind}_${season ?? 'base'}`, room_type_id: rt, day_kind: kind, season_id: season, price_per_night: price, location_id: null }) as unknown as RateLike);
  rate(rtPh.id, 'weekday', null, 120); rate(rtPh.id, 'weekend', null, 135); rate(rtSu.id, 'weekday', null, 85); rate(rtSu.id, 'weekend', null, 95);
  for (const s of seasonRows) { rate(rtPh.id, 'weekday', s.id, 140); rate(rtPh.id, 'weekend', s.id, 155); rate(rtSu.id, 'weekday', s.id, 100); rate(rtSu.id, 'weekend', s.id, 110); }
  const discountRows: DiscountLike[] = [
    { id: 'dis_ph2', name: '2 dogs in a penthouse', kind: 'multi_dog', room_type_id: rtPh.id, dog_count: 2, min_nights: null, amount_off: 15, percent_off: null, requires_paid_in_full: false, excludes_holidays: false, active: true },
    { id: 'dis_ph3', name: '3 dogs in a penthouse', kind: 'multi_dog', room_type_id: rtPh.id, dog_count: 3, min_nights: null, amount_off: 20, percent_off: null, requires_paid_in_full: false, excludes_holidays: false, active: true },
    { id: 'dis_su2', name: '2 dogs in a suite', kind: 'multi_dog', room_type_id: rtSu.id, dog_count: 2, min_nights: null, amount_off: 10, percent_off: null, requires_paid_in_full: false, excludes_holidays: false, active: true },
    { id: 'dis_7', name: 'Long stay 7 nights, paid in full', kind: 'long_stay', room_type_id: null, dog_count: null, min_nights: 7, amount_off: 0, percent_off: 5, requires_paid_in_full: true, excludes_holidays: true, active: true },
    { id: 'dis_14', name: 'Long stay 14 nights, paid in full', kind: 'long_stay', room_type_id: null, dog_count: null, min_nights: 14, amount_off: 0, percent_off: 7.5, requires_paid_in_full: true, excludes_holidays: true, active: true },
    { id: 'dis_21', name: 'Long stay 21 nights, paid in full', kind: 'long_stay', room_type_id: null, dog_count: null, min_nights: 21, amount_off: 0, percent_off: 10, requires_paid_in_full: true, excludes_holidays: true, active: true },
    { id: 'dis_dc', name: 'Each additional pet (daycare)', kind: 'daycare_extra_pet', room_type_id: null, dog_count: null, min_nights: null, amount_off: 5, percent_off: null, requires_paid_in_full: false, excludes_holidays: false, active: true },
  ].map((d) => add('discounts', d) as unknown as DiscountLike);
  const feeRows: FeeLike[] = [add('fees', { id: 'fee_card', name: 'Card service fee', kind: 'card', percent: 3.89, applies_to: 'card_payments', active: true }) as unknown as FeeLike];
  const taxRows: TaxLike[] = [add('taxes', { id: 'tax_main', name: 'Tax', tax_number: 'US-PETROCK-0001', service_rate: 2, product_rate: 2, boarding_rate: 2, prices_inclusive: false, active: true }) as unknown as TaxLike];
  const pkgRows: PackageLike[] = [
    { id: 'pkg_gold', name: 'Gold Groom', tier: 'gold', inclusions: 'Bath, blow-dry, brush teeth, four-paw massage and scented spray', price_s: 50, price_m: 65, price_l: 80, price_xl: 95, price_giant: 135, minutes_s: 60, minutes_m: 60, minutes_l: 60, minutes_xl: 90, minutes_giant: 90, notes: null, sort_order: 0, active: true },
    { id: 'pkg_platinum', name: 'Platinum Groom', tier: 'platinum', inclusions: 'Gold package + nail trim, ear cleanse and gland expression', price_s: 65, price_m: 80, price_l: 95, price_xl: 115, price_giant: 150, minutes_s: 75, minutes_m: 75, minutes_l: 90, minutes_xl: 105, minutes_giant: 120, notes: null, sort_order: 1, active: true },
    { id: 'pkg_diamond', name: 'Diamond Groom', tier: 'diamond', inclusions: 'Platinum package + shave or clip', price_s: 85, price_m: 100, price_l: 120, price_xl: 145, price_giant: 185, minutes_s: 90, minutes_m: 105, minutes_l: 120, minutes_xl: 135, minutes_giant: 150, notes: 'Specialty breed cuts & Asian fusion: please call. Prices pending confirmation (R-G06).', sort_order: 2, active: true },
  ].map((p) => add('packages', p) as unknown as PackageLike);
  const addonRows: AddonLike[] = [
    ['Furminator', 25, false, 15, 20, null], ['Medicated Shampoo', 20, true, 10, 10, null], ['Flea Shampoo', 20, false, 10, 10, null], ['Frontline Plus', 30, false, 0, 0, null], ['Spa Facial', 25, false, 10, 10, null],
    ['Nail Trim and File', 16, false, 10, 10, null], ['Nail Polish', 30, true, 15, 15, null], ['Color / Highlights', 15, false, 20, 30, null], ['Express Anal Glands (External)', 30, false, 5, 5, null], ['Express Anal Glands (Internal)', 25, false, 5, 5, 'special employee'], ['Sanitary Trim', 10, true, 10, 15, null],
  ].map(([name, price, starting, sm, l, emp], i) => add('addons', { id: `add_${i + 1}`, name, price, starting_at: starting, added_minutes_sm: sm, added_minutes_l: l, employee_type: emp, description: name === 'Sanitary Trim' ? 'Trim under paws, private areas, between eyes' : null, active: true }) as unknown as AddonLike);
  const dcRows: DaycarePriceLike[] = [
    { id: 'dc_full', item: 'full_day', name: 'Full Day', price: 45, threshold_hours: 6, active: true }, { id: 'dc_half', item: 'half_day', name: 'Half Day', price: 35, threshold_hours: 6, active: true },
    { id: 'dc_hour', item: 'hour', name: 'Play Hour', price: 15, threshold_hours: null, active: true }, { id: 'dc_walk', item: 'walk', name: 'Walk', price: 12, threshold_hours: null, active: true },
  ].map((d) => add('daycare_pricing', d) as unknown as DaycarePriceLike);
  [['Veterinary Travel', 'extra', 50], ['Vaccination Fee', 'extra', 40], ['Hotel night', 'hotel', 0], ['Daycare', 'daycare', 0], ['Grooming & Spa', 'grooming', 0]].forEach(([name, cat, price], i) => add('services', { id: `svc_${i + 1}`, name, category: cat, price, taxable_as: cat === 'hotel' ? 'boarding' : 'service', active: true, description: null }));
  add('settings', { id: 'set_boarding', key: 'boarding', value: { charge_by: 'day', check_in_window: ['07:00', '20:00'], first_day_multiplier: 1, last_day_multiplier: 1, minimum_charge_days: 1, book_out_whole_room_by_default: false }, description: 'Boarding charge rules (4.pdf)' });
  add('settings', { id: 'set_invoice', key: 'invoice', value: { next_number: 1043, title: 'Invoice', footer: 'Rock Out With Your Paws Out!', show_tax_number: true }, description: 'Invoice settings (9.pdf)' });
  add('settings', { id: 'set_general', key: 'general', value: { time_format: '12h', slot_minutes: 15, weight_unit: 'lbs', default_pet_type: 'Dog' }, description: 'General settings (7.pdf)' });

  // ---- bookings (~30) ----
  const statusesByOffset = (ci: number, co: number): string => {
    if (co < 0) return r.chance(0.85) ? 'checked_out' : r.chance(0.5) ? 'cancelled' : 'no_show';
    if (ci <= 0 && co >= 0) return ci === 0 ? (r.chance(0.5) ? 'confirmed' : 'checked_in') : 'checked_in';
    return r.chance(0.7) ? 'confirmed' : r.chance(0.6) ? 'pending_vaccines' : 'requested';
  };
  let bookingNo = 1001;
  const custPets = (cid: string) => pets.filter((p) => p.customer_id === cid);
  const stays: [number, number][] = [[-20, -15], [-12, -10], [-9, -2], [-6, -1], [-4, 0], [-3, 2], [-2, 1], [-1, 3], [0, 2], [0, 4], [0, 1], [1, 3], [1, 8], [2, 5], [3, 4], [4, 11], [5, 7], [6, 9], [7, 21], [8, 10], [10, 12], [12, 19], [14, 16], [15, 17], [18, 25], [-8, -6], [-15, -14], [2, 3], [9, 11], [20, 27]];
  const invoices: string[] = [];
  let invNo = 1001;
  stays.forEach(([ci, co], idx) => {
    const c = customers[idx % customers.length];
    const cps = custPets(c.id);
    const petsOn = cps.length > 1 && r.chance(0.45) ? cps.slice(0, 2) : [cps[0]];
    const heavy = petsOn.some((p) => (p.weight_lbs ?? 0) >= 55);
    const rt = heavy ? rtSu : r.chance(0.55) ? rtPh : rtSu;
    const locId = c.home_location_id ?? DEFAULT_LOCATION_ID;
    const checkIn = new Date(D(ci)); checkIn.setHours(10, 0, 0, 0);
    const checkOut = new Date(D(co)); checkOut.setHours(11, 0, 0, 0);
    const paidInFull = r.chance(0.5), card = r.chance(0.7);
    const q = quoteHotel({ roomTypeId: rt.id, roomTypeName: rt.name, checkIn, checkOut, dogs: petsOn.length, paidInFull, payWithCard: card, rates: rateRows, seasons: seasonRows, discounts: discountRows, fees: feeRows, taxes: taxRows });
    let status = statusesByOffset(ci, co);
    if (petsOn.some((p) => p.approval_status !== 'approved') && ci >= 0) status = 'pending_vaccines';
    const roomPool = rooms[locId].filter((rid) => rid.includes(rt.id === rtPh.id ? '_ph' : '_s'));
    const room = ['confirmed', 'checked_in', 'checked_out'].includes(status) ? roomPool[idx % roomPool.length] : null;
    const paymentStatus = status === 'checked_out' ? 'paid' : status === 'cancelled' || status === 'no_show' ? 'refunded' : paidInFull ? 'paid' : r.chance(0.5) ? 'authorized' : 'pending';
    const deposit = paidInFull ? q.total : paymentStatus === 'authorized' ? Math.round(q.total * 0.3) : 0;
    const b = add('bookings', {
      id: `bk_${bookingNo}`, location_id: locId, code: `PR-${bookingNo}`, customer_id: c.id, room_type_id: rt.id, room_id: room, check_in: checkIn.toISOString(), check_out: checkOut.toISOString(), nights: nightsBetween(checkIn, checkOut), status,
      share_room: petsOn.length > 1, add_grooming: r.chance(0.3), handler_id: r.chance(0.5) ? 'emp_desk' : null, paid_in_full: paidInFull, payment_method: card ? 'card' : 'cash', payment_status: paymentStatus,
      subtotal: q.subtotal, discount_total: q.discountTotal, fee_total: q.feeTotal, tax_total: q.taxTotal, total: q.total, deposit, quote: q, notes: idx % 5 === 0 ? 'Bring own food; call on arrival' : null, include_notes_on_invoice: false, source: idx % 3 === 0 ? 'app' : 'desk',
    });
    bookingNo++;
    petsOn.forEach((p) => add('booking_pets', { id: `bp_${b.id}_${p.id}`, booking_id: b.id, pet_id: p.id, room_id: room, takes_medication: p.id === 'pet_6', medication: p.id === 'pet_6' ? 'Carprofen 75mg' : null, dosing: p.id === 'pet_6' ? '1 daily (AM only)' : null, flea_medication: r.chance(0.4), medical_alert: p.medical_conditions }));
    if (['checked_out', 'checked_in', 'confirmed'].includes(status) && (paymentStatus === 'paid' || paymentStatus === 'authorized')) {
      const inv = add('invoices', { id: `inv_${invNo}`, location_id: locId, number: `INV-${invNo}`, customer_id: c.id, source_type: 'booking', source_id: b.id, lines: q.lines, subtotal: q.subtotal, discount_total: q.discountTotal, fee_total: q.feeTotal, tax_total: q.taxTotal, total: q.total, deposit, balance: Math.round((q.total - deposit) * 100) / 100, status: paymentStatus === 'paid' ? 'paid' : 'issued', issued_at: at(D(Math.min(ci, 0) - 1), 9), footer: 'Rock Out With Your Paws Out!' });
      invoices.push(inv.id); invNo++;
      add('payments', { id: `pay_${inv.id}`, location_id: locId, invoice_id: inv.id, customer_id: c.id, amount: deposit, method: card ? 'card' : 'cash', status: paymentStatus === 'paid' ? 'paid' : 'authorized', provider: 'mock', provider_ref: `mock_${inv.id}`, card_brand: card ? r.pick(['visa', 'mastercard', 'amex']) : null, card_last4: card ? String(r.int(1000, 9999)) : null, is_deposit: !paidInFull, paid_at: at(D(Math.min(ci, 0) - 1), 9, 5), refund_of: null, note: null });
    }
  });
  ctx.ids.bookings = ctx.db.bookings.map((b) => b.id);

  // ---- grooming appointments (~16) ----
  let apNo = 501;
  const apOffsets = [-7, -5, -3, -1, 0, 0, 0, 1, 1, 2, 3, 4, 6, 8, 10, 13];
  apOffsets.forEach((off, i) => {
    const p = pets[(i * 3) % pets.length];
    const c = customers.find((x) => x.id === p.customer_id)!;
    const locId = c.home_location_id ?? DEFAULT_LOCATION_ID;
    const pkg = pkgRows[i % 3];
    const adds = i % 2 === 0 ? [addonRows[i % addonRows.length]] : [];
    const size = (p.size ?? 'M') as Size;
    const q = quoteGrooming({ pkg, size, addons: adds, payWithCard: true, fees: feeRows, taxes: taxRows });
    const status = off < 0 ? (r.chance(0.85) ? 'done' : 'no_show') : off === 0 ? r.pick(['confirmed', 'in_progress', 'done']) : r.chance(0.8) ? 'confirmed' : 'requested';
    add('appointments', { id: `ap_${apNo}`, location_id: locId, code: `GR-${apNo}`, customer_id: c.id, pet_id: p.id, package_id: pkg.id, addon_ids: adds.map((a) => a.id), groomer_id: locId === 'loc_encino' ? 'emp_groomer' : 'emp_jessica', starts_at: at(D(off), 9 + (i % 5) * 1.5 | 0, (i % 2) * 30), duration_min: q.minutes ?? 60, status, booking_id: null, size, subtotal: q.subtotal, tax_total: q.taxTotal, total: q.total, payment_status: status === 'done' ? 'paid' : 'pending', notes: i === 4 ? 'Sensitive skin; use medicated shampoo' : null });
    apNo++;
  });

  // ---- daycare bookings (~10) ----
  let dcNo = 301;
  [-6, -2, -1, 0, 0, 1, 2, 3, 5, 9].forEach((off, i) => {
    const c = customers[(i * 5) % customers.length];
    const cps = custPets(c.id).filter((p) => p.approval_status === 'approved');
    if (!cps.length) return;
    const hours = r.pick([3, 4, 5, 7, 8, 9]);
    const petIds = cps.slice(0, i % 3 === 0 ? 2 : 1).map((p) => p.id);
    const q = quoteDaycare({ hours, pets: petIds.length, pricing: dcRows, discounts: discountRows, payWithCard: false, fees: feeRows, taxes: taxRows });
    const status = off < 0 ? 'checked_out' : off === 0 ? 'checked_in' : 'confirmed';
    add('daycare_bookings', { id: `dc_${dcNo}`, location_id: c.home_location_id ?? DEFAULT_LOCATION_ID, code: `DC-${dcNo}`, customer_id: c.id, pet_ids: petIds, date: isoDay(D(off)), check_in_time: '08:00', check_out_time: `${String(8 + hours).padStart(2, '0')}:00`, item: q.item, status, subtotal: q.subtotal, discount_total: q.discountTotal, tax_total: q.taxTotal, total: q.total, payment_status: off < 0 ? 'paid' : 'pending', notes: null });
    dcNo++;
  });

  // ---- conversations & messages ----
  customers.slice(0, 5).forEach((c, i) => {
    const locId = c.home_location_id ?? DEFAULT_LOCATION_ID;
    const conv = add('conversations', { id: `conv_${i + 1}`, location_id: locId, customer_id: c.id, last_message_at: at(D(-i), 14, 10), last_preview: i === 0 ? 'Thanks! See you Friday.' : 'How much is the Gold package?', unread_staff: i === 1 ? 2 : 0, unread_customer: 0, status: 'open' });
    const thread: [('customer' | 'staff' | 'system'), string][] = [
      ['system', 'Session start'], ['customer', `Hi! Quick question about ${custPets(c.id)[0]?.name ?? 'my dog'}'s stay.`], ['staff', 'Of course, happy to help. What would you like to know?'],
      ['customer', 'How much is the Gold package for a large dog?'], ['staff', 'The Gold Groom is $50-$135 depending on size; large is $80. We generally do grooms at the end of hotel stays.'], ['customer', i === 0 ? 'Thanks! See you Friday.' : 'Great, please add it to the booking.'],
    ];
    thread.forEach(([sender, text], j) => add('messages', { id: `msg_${i + 1}_${j}`, conversation_id: conv.id, sender, sender_user_id: sender === 'staff' ? 'usr_desk' : sender === 'customer' ? c.user_id : null, text, image_url: null, sent_at: at(D(-i), 13, j * 7), read: !(i === 1 && j >= 4) }));
  });

  // ---- notifications (customer + staff) ----
  [['booking_confirmed', 'Your hotel booking is confirmed', 'Biscuit and Mochi, Penthouse, check-in Friday 10:00 AM', '/app/bookings'], ['payment', 'Payment received', 'Deposit of $95.00 for PR-1009', '/app/bookings'], ['vaccine_expiring', 'Bordetella expires soon', "Bruno's Bordetella expires in 14 days", '/app/pets'], ['pet_added', 'Pet added', 'Mochi is waiting for approval', '/app/pets']]
    .forEach(([kind, title, body, link], i) => add('notifications', { id: `ntf_${i + 1}`, user_id: 'usr_customer', kind, title, body, link, read: i > 1, sent_at: at(D(-i), 9 + i) }));
  add('notifications', { id: 'ntf_staff_1', user_id: 'usr_desk', kind: 'vaccine_submitted', title: 'Vaccine proof submitted', body: 'Daisy (Nakamura) uploaded Rabies and DHPP; verify to confirm PR-1013', link: '/desk/vaccines', read: false, sent_at: at(D(0), 8, 15) });

  // ---- reviews, feedback, approvals, audit ----
  [[5, 'Best boarding in the Valley', 'Biscuit came home happy and tired. The nightly photos are the best part.', ['Excellent'], 'published'], [4.5, 'Great groom', 'Mochi looks adorable after the Gold Groom.', ['Amazing'], 'published'], [3, 'Pickup took a while', 'Front desk was busy at 6pm; otherwise fine.', ['Normal'], 'pending'], [5, 'Love the app', 'Booking daycare takes a minute.', ['Excellent'], 'pending']]
    .forEach(([rating, title, body, tags, status], i) => add('reviews', { id: `rev_${i + 1}`, location_id: customers[i].home_location_id ?? DEFAULT_LOCATION_ID, customer_id: customers[i].id, rating, title, body, tags, status }));
  [['usr_desk', 'Marcus Lee', 'front_desk', 'F-01', '/desk', 'idea', 'Could the arrivals list show the handler name?', 'new'], ['usr_groomer', 'Renee Castillo', 'groomer', 'F-30', '/desk/grooming', 'bug', 'Add-on minutes do not show on the day view card.', 'seen'], ['usr_manager', 'Priya Natarajan', 'manager', 'A-00', '/staff/pin', 'praise', 'PIN login is fast, thanks.', 'done']]
    .forEach(([uid, name, role, code, route, cat, text, status], i) => add('feedback', { id: `fb_${i + 1}`, location_id: 'loc_encino', user_id: uid, user_name: name, role, page_code: code, route, category: cat, text, status, owner_reply: status === 'done' ? 'Noted!' : null }));
  add('approvals', { id: 'apr_1', location_id: 'loc_encino', action: 'booking.status', subject_table: 'bookings', subject_id: 'bk_1002', requested_by: 'usr_desk', requested_by_name: 'Marcus Lee', approved_by: 'usr_manager', approved_by_name: 'Priya Natarajan', approver_role: 'manager', details: { from: 'confirmed', to: 'cancelled' }, approved_at: at(D(-11), 16, 20) });
  add('approvals', { id: 'apr_2', location_id: 'loc_encino', action: 'payment.refund', subject_table: 'payments', subject_id: invoices[0] ? `pay_${invoices[0]}` : null, requested_by: 'usr_desk', requested_by_name: 'Marcus Lee', approved_by: 'usr_owner', approved_by_name: 'Jordan Blake', approver_role: 'owner', details: { amount: 95 }, approved_at: at(D(-6), 12, 5) });
  add('audit_log', { id: 'aud_1', location_id: 'loc_encino', user_id: 'usr_manager', user_name: 'Priya Natarajan', action: 'update', table_name: 'bookings', row_id: 'bk_1002', diff: { status: ['confirmed', 'cancelled'] } });
  add('rules', { id: 'rul_1', rule_id: 'R-X03', title: 'Groomer break between appointments', description: 'Leave 15 minutes between grooming appointments for cleanup.', category: 'operations', status: 'requested', pages: ['F-30'], source: 'Renee (groomer) via feedback', requested_by: 'usr_groomer' });
}
