/**
 * Seed for the frontdesk-grooming-people module: lookup lists, customer / pet profile extras, appointment extras,
 * a second and third Encino groomer with working hours (so the day view has real columns), extra appointments for
 * today across groomers and statuses, customer notes, conversation assignments, more Front Desk threads and staff
 * notifications. Runs after core (order 100). Everything fictional.
 */
import type { SeedCtx } from './index';
import type { BaseRow } from '../schema/types';
import { hashPin } from '../../auth/pin';
import { addDays, at, isoDay } from './rng';
import { quoteGrooming, type AddonLike, type FeeLike, type PackageLike, type Size, type TaxLike } from '../../pricing/engine';

export const order = 100;

const HOURS = { 1: { open: '08:00', close: '16:00' }, 2: { open: '08:00', close: '16:00' }, 3: { open: '09:00', close: '17:00' }, 4: { open: '08:00', close: '16:00' }, 5: { open: '08:00', close: '14:00' }, 6: { open: '09:00', close: '13:00' }, 0: null };

export function seed(ctx: SeedCtx) {
  const { add, r, now, db } = ctx;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const D = (n: number) => addDays(today, n);

  // ---- lookup lists (R-J04) ----
  const lookups: [string, string[]][] = [
    ['breed', ['Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Poodle (Miniature)', 'Poodle (Standard)', 'Shih Tzu', 'Bulldog', 'French Bulldog', 'Beagle', 'Boxer', 'Dachshund', 'Border Collie', 'Cavapoo', 'Cockapoo', 'Labradoodle', 'Pomeranian', 'Doberman', 'Bernese Mountain Dog', 'Shiba Inu', 'Cairn Terrier', 'Mini Aussie', 'Mixed']],
    ['color', ['Black', 'Brown', 'Cream', 'White', 'Brindle', 'Black and tan', 'Golden', 'Grey', 'Merle', 'Apricot']],
    ['city', ['Encino', 'Los Angeles', 'Sherman Oaks', 'Tarzana', 'Studio City', 'Westwood', 'Santa Monica', 'Beverly Hills', 'Van Nuys', 'Woodland Hills']],
    ['reference', ['Google', 'Instagram', 'Friend referral', 'Vet referral', 'Walk-in', 'Yelp', 'Returning customer']],
    ['attribute', ['VIP', 'Late payer', 'Prefers text', 'Spanish speaker', 'Allergy alert', 'Photo consent']],
    ['customer_title', ['Mr.', 'Ms.', 'Mrs.', 'Mx.', 'Dr.']],
    ['temper', ['Calm', 'Shy', 'Hyper', 'Aggressive', 'Anxious', 'Senior']],
  ];
  lookups.forEach(([kind, values]) => values.forEach((value, i) => add('lookup_values', { id: `lk_${kind}_${i + 1}`, kind, value, sort_order: i, active: true })));

  // ---- customer & pet profile extras ----
  const customers = db.customers as (BaseRow & { id: string; first_name: string; last_name: string; user_id: string | null })[];
  customers.forEach((c, i) => add('customer_profiles', { id: `cp_${c.id}`, customer_id: c.id, title: r.pick(['Mr.', 'Ms.', 'Dr.', null, null]), home_phone: i % 3 === 0 ? `+1 (818) 555-02${String(10 + i).padStart(2, '0')}` : null, work_phone: null, alt_contact: i % 4 === 0 ? 'Partner: Sam (same number)' : null, reference: r.pick(['Google', 'Instagram', 'Friend referral', 'Vet referral', 'Walk-in']), attributes: i === 0 ? ['VIP', 'Photo consent'] : i === 4 ? ['Late payer'] : null, customer_since: isoDay(D(-r.int(60, 900))) }));
  const pets = db.pets as (BaseRow & { id: string; name: string; personality: string | null; customer_id: string; breed: string | null; size: string | null })[];
  pets.forEach((p, i) => add('pet_profiles', { id: `pp_${p.id}`, pet_id: p.id, registration_number: i % 2 === 0 ? `LA-${100200 + i * 7}` : null, microchip_number: i % 3 === 0 ? `985${String(112000000000 + i * 9137).slice(0, 12)}` : null, dob_approximate: i % 4 === 1, temper: p.personality, groom_style: i % 3 === 0 ? r.pick(['Puppy cut, 1/2 inch', 'Teddy bear face, short body', 'Breed standard trim', 'Sanitary + feet only']) : null, groom_notes: i === 5 ? 'Muzzle for nails; two people' : null }));

  // ---- extra Encino groomers with working hours (Grooming.png has five columns) ----
  const emp = db.employees as (BaseRow & { id: string; working_hours: unknown })[];
  const core = emp.find((e) => e.id === 'emp_groomer'); if (core) core.working_hours = HOURS;
  const jess = emp.find((e) => e.id === 'emp_jessica'); if (jess) jess.working_hours = { ...HOURS, 5: { open: '09:00', close: '17:00' } };
  add('employees', { id: 'emp_tamsin', location_id: 'loc_encino', user_id: null, name: 'Tamsin Reyes', display_name: 'Tamsin', email: 'tamsin@demo.petrock.test', phone: null, department: 'Groom', job_title: 'Groomer', status: 'active', color: '#F4D06F', is_groomer: true, is_handler: false, pin_hash: hashPin('7777'), working_hours: { ...HOURS, 1: { open: '10:00', close: '18:00' }, 2: { open: '10:00', close: '18:00' } }, date_started: isoDay(D(-320)), note: 'Doodles and Asian fusion cuts' });
  add('employees', { id: 'emp_omar', location_id: 'loc_encino', user_id: null, name: 'Omar Haddad', display_name: 'Omar', email: 'omar@demo.petrock.test', phone: null, department: 'Groom', job_title: 'Bather / groomer', status: 'active', color: '#7FDBDA', is_groomer: true, is_handler: true, pin_hash: null, working_hours: { ...HOURS, 1: { open: '08:00', close: '12:00' }, 3: { open: '08:00', close: '12:00' }, 5: null }, date_started: isoDay(D(-95)), note: 'Mornings only' });
  add('employees', { id: 'emp_nadia', location_id: 'loc_westwood', user_id: null, name: 'Nadia Petrova', display_name: 'Nadia', email: 'nadia@demo.petrock.test', phone: null, department: 'Groom', job_title: 'Groomer', status: 'active', color: '#E79DD1', is_groomer: true, is_handler: false, pin_hash: null, working_hours: HOURS, date_started: isoDay(D(-500)), note: null });
  ctx.ids.groomers = [...(ctx.ids.groomers ?? []), 'emp_tamsin', 'emp_omar', 'emp_nadia'];

  // ---- extra appointments today and this week so the day view / board / agenda are busy ----
  const pkgs = db.packages as unknown as PackageLike[];
  const addons = db.addons as unknown as AddonLike[];
  const fees = db.fees as unknown as FeeLike[];
  const taxes = db.taxes as unknown as TaxLike[];
  const existing = db.appointments as (BaseRow & { code: string })[];
  let apNo = 600;
  const plan: [number, number, number, string, string, number, string, string][] = [
    // day offset, hour, minute, groomer, pet, pkg index, status, payment
    [0, 8, 0, 'emp_groomer', 'pet_2', 0, 'done', 'paid'], [0, 9, 30, 'emp_groomer', 'pet_7', 1, 'in_progress', 'pending'], [0, 11, 30, 'emp_groomer', 'pet_10', 2, 'confirmed', 'pending'], [0, 14, 0, 'emp_groomer', 'pet_12', 0, 'confirmed', 'authorized'],
    [0, 10, 0, 'emp_tamsin', 'pet_9', 2, 'confirmed', 'pending'], [0, 13, 0, 'emp_tamsin', 'pet_1', 1, 'requested', 'pending'], [0, 16, 0, 'emp_tamsin', 'pet_13', 0, 'requested', 'pending'],
    [0, 8, 30, 'emp_omar', 'pet_5', 0, 'done', 'paid'], [0, 10, 30, 'emp_omar', 'pet_14', 1, 'confirmed', 'pending'],
    [1, 9, 0, 'emp_groomer', 'pet_11', 1, 'confirmed', 'pending'], [1, 11, 0, 'emp_tamsin', 'pet_3', 2, 'confirmed', 'authorized'], [1, 8, 0, 'emp_omar', 'pet_8', 0, 'requested', 'pending'],
    [-1, 10, 0, 'emp_groomer', 'pet_4', 0, 'no_show', 'pending'], [-1, 13, 0, 'emp_tamsin', 'pet_6', 2, 'done', 'paid'], [2, 10, 0, 'emp_groomer', 'pet_2', 1, 'cancelled', 'refunded'],
    [0, 9, 0, 'emp_jessica', 'pet_4', 1, 'confirmed', 'pending'], [0, 11, 0, 'emp_nadia', 'pet_9', 0, 'in_progress', 'pending'], [0, 14, 0, 'emp_jessica', 'pet_6', 2, 'requested', 'pending'],
  ];
  const custOf = (petId: string) => pets.find((p) => p.id === petId)!;
  for (const [off, hh, mm, groomer, petId, pkgIdx, status, pay] of plan) {
    const p = custOf(petId);
    const c = customers.find((x) => x.id === p.customer_id)!;
    const locId = ['emp_jessica', 'emp_nadia'].includes(groomer) ? 'loc_westwood' : 'loc_encino';
    const pkg = pkgs[pkgIdx];
    const adds = r.chance(0.5) ? [addons[r.int(0, addons.length - 1)]] : [];
    const size = (p.size ?? 'M') as Size;
    const card = r.chance(0.6);
    const q = quoteGrooming({ pkg, size, addons: adds, payWithCard: card, fees, taxes });
    const ap = add('appointments', { id: `ap_${apNo}`, location_id: locId, code: `GR-${apNo}`, customer_id: c.id, pet_id: p.id, package_id: pkg.id, addon_ids: adds.map((a) => a.id), groomer_id: groomer, starts_at: at(D(off), hh, mm), duration_min: q.minutes ?? 60, status, booking_id: null, size, subtotal: q.subtotal, tax_total: q.taxTotal, total: q.total, payment_status: pay, notes: apNo % 4 === 0 ? 'Owner asked for a shorter cut around the ears' : null });
    add('appointment_extras', { id: `ax_${ap.id}`, appointment_id: ap.id, reminder: apNo % 2 === 0, pickup_at: null, delivery_at: null, discount_pct: 0, payment_method: card ? 'card' : 'cash', include_notes_on_invoice: false, groom_style: (db.pet_profiles as (BaseRow & { pet_id: string; groom_style: string | null })[]).find((x) => x.pet_id === p.id)?.groom_style ?? null, approval_id: null, invoice_id: null });
    apNo++;
  }
  for (const a of existing) add('appointment_extras', { id: `ax_${a.id}`, appointment_id: a.id, reminder: true, pickup_at: null, delivery_at: null, discount_pct: 0, payment_method: 'card', include_notes_on_invoice: false, groom_style: null, approval_id: null, invoice_id: null });

  // ---- customer notes ----
  [['cus_1', 'usr_desk', 'Marcus Lee', 'Prefers a call before pickup; Biscuit gets car sick.', true], ['cus_1', 'usr_manager', 'Priya Natarajan', 'Approved 10% loyalty discount for December stays.', false], ['cus_3', 'usr_desk', 'Marcus Lee', 'Bruno needs the slow feeder bowl (in cubby 4).', true], ['cus_5', 'usr_desk_ww', 'Dana Whitfield', 'Balance reminder sent by text.', false], ['cus_7', 'usr_groomer', 'Renee Castillo', 'Bear tolerates the dryer only on low.', false]]
    .forEach(([cid, uid, name, text, pinned], i) => add('customer_notes', { id: `cn_${i + 1}`, customer_id: cid, author_id: uid, author_name: name, text, pinned, created_at: at(D(-r.int(1, 40)), 10, i * 3), updated_at: at(D(-1), 10) }));

  // ---- more Front Desk threads (customers 6-8) + assignments ----
  customers.slice(5, 8).forEach((c, i) => {
    const locId = (c as unknown as { home_location_id: string | null }).home_location_id ?? 'loc_encino';
    const petName = pets.find((p) => p.customer_id === c.id)?.name ?? 'my dog';
    const conv = add('conversations', { id: `conv_${i + 6}`, location_id: locId, customer_id: c.id, last_message_at: at(D(-(i + 1) * 2), 16, 20), last_preview: i === 0 ? `Can ${petName} get a nail trim during daycare tomorrow?` : i === 1 ? 'Is the Diamond package available for a giant breed?' : 'Sent the Rabies certificate, please check.', unread_staff: i === 0 ? 1 : 0, unread_customer: 0, status: i === 2 ? 'closed' : 'open' });
    const thread: [('customer' | 'staff' | 'system'), string][] = i === 0
      ? [['system', 'Session start'], ['customer', `Hi! Can ${petName} get a nail trim during daycare tomorrow?`]]
      : i === 1 ? [['system', 'Session start'], ['customer', 'Is the Diamond package available for a giant breed?'], ['staff', 'Yes. For giants it is priced at the Giant tier and specialty cuts are by phone. Want me to book it?'], ['customer', 'Is the Diamond package available for a giant breed?']]
      : [['system', 'Session start'], ['customer', 'Sent the Rabies certificate, please check.'], ['staff', 'Got it, verified. The booking is confirmed now.'], ['system', 'Conversation closed by Marcus Lee']];
    thread.forEach(([sender, text], j) => add('messages', { id: `msg_${i + 6}_${j}`, conversation_id: conv.id, sender, sender_user_id: sender === 'staff' ? 'usr_desk' : sender === 'customer' ? c.user_id : null, text, image_url: null, sent_at: at(D(-(i + 1) * 2), 15, j * 9), read: !(i === 0 && j === 1) }));
  });
  [['conv_1', 'usr_desk', 'Marcus Lee'], ['conv_2', 'usr_desk', 'Marcus Lee'], ['conv_3', 'usr_desk_ww', 'Dana Whitfield'], ['conv_6', 'usr_groomer', 'Renee Castillo']]
    .forEach(([cid, uid, name], i) => add('conversation_assignments', { id: `ca_${i + 1}`, location_id: cid === 'conv_3' ? 'loc_westwood' : 'loc_encino', conversation_id: cid, assignee_user_id: uid, assignee_name: name, assigned_by: 'usr_manager', assigned_at: at(D(-3), 9, i * 5) }));

  // ---- staff notifications ----
  const staffNtf: [string, string, string, string, string, number, boolean][] = [
    ['usr_desk_ww', 'new_booking', 'New app booking', 'Grace Nakamura requested a Suite for Daisy and Apollo (PR-1028)', '/desk/customers/cus_8', 1, false],
    ['usr_desk', 'message', 'New message from Sofia Marchetti', 'Can Nala get a nail trim during daycare tomorrow?', '/desk/messages?conversation=conv_6', 2, false],
    ['usr_desk', 'vaccine_expiring', 'Vaccine expiring', "Bruno's Bordetella expired; flag on today's groom", '/desk/pets/pet_4', 4, true],
    ['usr_desk', 'appointment_requested', 'Groom request', 'Avery Thompson asked for a Platinum Groom for Biscuit today 1:00 PM', '/desk/grooming/ap_605', 3, false],
    ['usr_manager', 'approval', 'PIN approval used', 'Marcus Lee cancelled PR-1002 with your PIN', '/admin/approvals', 24, true],
    ['usr_manager', 'vaccine_submitted', 'Vaccine proof submitted', 'Daisy (Nakamura) uploaded Rabies and DHPP', '/desk/vaccines', 2, false],
    ['usr_groomer', 'appointment_assigned', 'New appointment on your column', 'Mochi (Thompson), Gold Groom, today 8:00 AM', '/desk/grooming', 6, true],
    ['usr_groomer', 'note', 'Groom note', 'Bear tolerates the dryer only on low (from Renee)', '/desk/pets/pet_11', 30, true],
    ['usr_super', 'system', 'Mock data reseeded', 'Seed version 1 loaded for today', '/dev/tables', 1, false],
    ['usr_owner', 'feedback', 'New staff feedback', 'Renee: add-on minutes do not show on the day view card', '/admin/feedback', 5, false],
    ['usr_desk_ww', 'message', 'New message from Diego Fernandez', 'Is the Diamond package available for a giant breed?', '/desk/messages?conversation=conv_7', 8, false],
  ];
  staffNtf.forEach(([uid, kind, title, body, link, hoursAgo, read], i) => add('notifications', { id: `ntf_fgp_${i + 1}`, user_id: uid, kind, title, body, link, read, sent_at: new Date(now.getTime() - hoursAgo * 3600_000).toISOString() }));

  // ---- a couple of mock attachments ----
  add('attachments', { id: 'att_1', subject_table: 'pets', subject_id: 'pet_6', name: 'max-vet-letter.pdf', url: 'mock://uploads/max-vet-letter.pdf', size_bytes: 184_320, mime: 'application/pdf', uploaded_by: 'usr_desk' });
  add('attachments', { id: 'att_2', subject_table: 'customers', subject_id: 'cus_1', name: 'thompson-intake-form.pdf', url: 'mock://uploads/thompson-intake-form.pdf', size_bytes: 96_100, mime: 'application/pdf', uploaded_by: 'usr_desk' });

  // ---- saved groomer column order for the Encino groomer (F-30 context menu) ----
  add('groomer_column_prefs', { id: 'gcp_seed_1', location_id: 'loc_encino', user_id: 'usr_groomer', groomer_id: 'emp_theo', color: null, sort_order: 0, hidden: false });
}
