/** Seed for the extras-manual-website tables: website FAQs and inquiries, training completions, walks, tasks. Runs after core. */
import type { SeedCtx } from './index';
import { addDays, at, isoDay } from './rng';

export const order = 100;

export function seed(ctx: SeedCtx) {
  const { add, now } = ctx;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const D = (n: number) => addDays(today, n);
  const [encino, westwood] = ctx.ids.locations ?? ['loc_encino', 'loc_westwood'];
  const pets = ctx.ids.pets ?? [];
  const bookings = ctx.ids.bookings ?? [];

  // ---- website FAQs (P-11) ----
  const faqs: [string, string, string][] = [
    ['hotel', 'What do I need before my dog can stay at the hotel?', 'A pet profile in the Petrock app and current Rabies, DHPP and Bordetella vaccines. Upload the proof from your vet; the front desk verifies it and your booking moves from "pending vaccines" to "confirmed".'],
    ['hotel', 'Can two of my dogs share a room?', 'Yes. When you book you choose whether your dogs share a room; multi-dog discounts apply to shared rooms and are computed from our current price list.'],
    ['hotel', 'Do you send photos during the stay?', 'Every hotel guest gets nightly photos in the app so you can see how the day went.'],
    ['grooming', 'What is the difference between Gold, Platinum and Diamond?', 'All three include a bath, dry and nail trim. Platinum adds a full haircut or de-shed, Diamond adds the spa treatments. Prices depend on your dog\'s size band.'],
    ['grooming', 'Can I add grooming to a hotel stay?', 'Yes. We generally do grooms at the end of hotel stays; ask for it when you book or message the front desk.'],
    ['daycare', 'How long is a full day of daycare?', 'A day longer than the full-day threshold in our price list counts as a full day; shorter visits are a half day. Play hours and walks can be added.'],
    ['vaccines', 'Which vaccines are required?', 'Rabies, DHPP (distemper / parvo) and Bordetella are required; Leptospirosis and Canine Influenza are recommended. Each record has an expiry date and we remind you before it lapses.'],
    ['payments', 'Is there a fee for paying by card?', 'Card payments carry the non-cash fee shown at checkout; cash and prepaid stays avoid it. Paying a stay in full upfront unlocks the prepay discount where it applies.'],
    ['general', 'Where are you?', 'Encino (Ventura Blvd) and Westwood (Wilshire Blvd), Los Angeles. Hours and phone numbers are on the Locations page.'],
    ['general', 'Do you offer in-home care?', 'In-home service is by inquiry only: message the front desk in the app or use the contact form.'],
  ];
  faqs.forEach(([topic, question, answer], i) => add('site_faqs', { id: `faq_${i + 1}`, topic, question, answer, sort_order: i, published: true }));

  // ---- website inquiries (P-10) ----
  add('site_inquiries', { id: 'inq_1', location_id: encino, name: 'Taylor Nguyen', email: 'taylor@example.test', phone: '+1 (818) 555-0101', topic: 'hotel', message: 'Do you have a penthouse available over Thanksgiving for a 45 lb labradoodle?', status: 'new', replied_by: null, replied_at: null });
  add('site_inquiries', { id: 'inq_2', location_id: westwood, name: 'Morgan Ellis', email: 'morgan@example.test', phone: null, topic: 'grooming', message: 'Looking for a de-shed for a husky. Which package is that?', status: 'replied', replied_by: 'usr_desk_ww', replied_at: at(D(-2), 11, 30) });

  // ---- training completions (F-66) ----
  const done: [string, string, string, string, 'in_person' | 'online', number, string | null][] = [
    ['emp_desk', 'usr_desk', '11-front-desk-daily-operations', 'M-11', 'in_person', -20, 'emp_manager'],
    ['emp_desk', 'usr_desk', '12-check-in-and-check-out', 'M-12', 'in_person', -19, 'emp_manager'],
    ['emp_desk', 'usr_desk', '13-vaccine-verification', 'M-13', 'online', -12, null],
    ['emp_groomer', 'usr_groomer', '15-grooming-and-spa-agenda', 'M-15', 'in_person', -30, 'emp_manager'],
    ['emp_manager', 'usr_manager', '17-pin-approvals', 'M-17', 'online', -25, null],
  ];
  done.forEach(([employee_id, user_id, chapter_slug, chapter_code, mode, days, signed_off_by], i) => add('training_completions', { id: `trn_${i + 1}`, location_id: encino, employee_id, user_id, chapter_slug, chapter_code, mode, completed_at: at(D(days), 10), signed_off_by, note: null }));

  // ---- walks (F-67) ----
  const walkPets = pets.slice(0, 4);
  walkPets.forEach((pet_id, i) => add('walks', { id: `walk_${i + 1}`, location_id: encino, pet_id, handler_id: i % 2 ? 'emp_theo' : 'emp_desk', booking_id: bookings[i] ?? null, daycare_booking_id: null, started_at: at(D(0), 8 + i, 15), duration_min: i === 0 ? 30 : 20, status: i < 2 ? 'done' : i === 2 ? 'in_progress' : 'planned', potty: i < 2 ? true : null, note: i === 0 ? 'Pulled a bit on the leash; calm after 10 min.' : null }));
  if (walkPets[0]) add('walks', { id: 'walk_5', location_id: encino, pet_id: walkPets[0], handler_id: 'emp_desk', booking_id: bookings[0] ?? null, daycare_booking_id: null, started_at: at(D(-1), 17, 0), duration_min: 25, status: 'done', potty: true, note: null });

  // ---- tasks (F-68) ----
  const tasks: [string, string | null, string | null, number | null, 'low' | 'normal' | 'high', 'open' | 'in_progress' | 'done', 'task' | 'checklist'][] = [
    ['Restock towels in grooming', null, 'emp_groomer', 0, 'normal', 'open', 'task'],
    ['Call vet for Bruno\'s Bordetella record', 'Ventura Animal Hospital, ask for the updated certificate', 'emp_desk', 0, 'high', 'in_progress', 'task'],
    ['Deep clean penthouse row B', null, 'emp_theo', 2, 'normal', 'open', 'task'],
    ['Opening checklist: lights, HVAC, cash float, arrivals list printed', null, 'emp_desk', 0, 'normal', 'done', 'checklist'],
    ['Closing checklist: kennels checked, meds logged, doors locked', null, 'emp_desk', 0, 'normal', 'open', 'checklist'],
    ['Review pending reviews before the weekend', null, 'emp_manager', 3, 'low', 'open', 'task'],
  ];
  tasks.forEach(([title, description, assignee_id, due, priority, status, kind], i) => add('tasks', { id: `task_${i + 1}`, location_id: encino, title, description, assignee_id, created_by: 'usr_manager', due_on: due == null ? null : isoDay(D(due)), priority, status, kind, completed_at: status === 'done' ? at(D(0), 7, 45) : null }));
  add('tasks', { id: 'task_7', location_id: westwood, title: 'Order Diamond package spa supplies', description: null, assignee_id: 'emp_jessica', created_by: 'usr_owner', due_on: isoDay(D(5)), priority: 'normal', status: 'open', kind: 'task', completed_at: null });
}
