/**
 * Seed for the customer-settings-chat module: saved cards, notification preferences, legal documents, FAQ, quick
 * replies, a second Front Desk thread (Westwood) for the demo customer, an image message and a few more
 * notifications. Runs after core (order 100). All data fictional.
 */
import type { SeedCtx } from './index';
import { addDays, at } from './rng';
import { NOTIFICATION_CATEGORIES } from '../schema/customer-settings-chat';
import type { BaseRow } from '../schema/types';

export const order = 110;

/** Small inline SVG so the demo image attachment needs no network and no bundled photo. */
export const DEMO_PHOTO_URL = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8DFF5"/><stop offset="1" stop-color="#F7E3F1"/></linearGradient></defs><rect width="480" height="320" rx="24" fill="url(#g)"/><g fill="#552583"><ellipse cx="240" cy="200" rx="70" ry="52"/><circle cx="170" cy="130" r="26"/><circle cx="222" cy="100" r="26"/><circle cx="258" cy="100" r="26"/><circle cx="310" cy="130" r="26"/></g><text x="240" y="290" font-family="Inter, Arial, sans-serif" font-size="18" fill="#552583" text-anchor="middle">Biscuit at playtime · Petrock Encino</text></svg>',
);

const PRIVACY = `# Privacy policy

_Version 1.0 · effective 2026-09-01 · Petrock Hotel LLC_

## What we collect
- **Account**: name, email, phone, address, saved payment method tokens (never card numbers).
- **Pets**: profiles, care instructions, medical notes and vaccine certificates you upload.
- **Bookings**: hotel stays, daycare days and Grooming & Spa appointments, including photos our team shares with you.
- **Device**: app version, language, notification token when you enable push notifications.

## How we use it
We use your data to run your pet's stay safely, to verify vaccines, to process payments through our payment provider and to message you about your bookings. We never sell personal data.

## Sharing
Payments are processed by our payment provider; vaccine records may be shared with the vet you named in an emergency. Staff at the location you book see what they need to care for your dog.

## Your choices
You can edit your profile, change notification preferences, export your data or **delete your account** from Settings. Deletion requests complete after a 30-day grace period.

## Contact
privacy@petrockhotel.com · Petrock Hotel, Encino & Westwood, Los Angeles, CA.`;

const TERMS = `# Terms of service

_Version 1.0 · effective 2026-09-01_

1. **Bookings** are confirmed when required vaccines (Rabies, DHPP, Bordetella) are verified by our staff. Until then a booking stays *pending vaccines*.
2. **Deposits and payments** follow the prices shown in the estimate at booking time. Card payments through the app carry the card fee displayed in the estimate. Long-stay discounts require payment in full.
3. **Cancellations** made 48 hours before check-in are refunded in full; later cancellations forfeit the deposit unless the location manager waives it.
4. **Health and behaviour**: you confirm your dog is healthy, socialised and free of fleas. Aggressive dogs may be declined or moved to a private room at our discretion.
5. **Photos**: our team may share photos of your dog with you in the app. We only publish photos publicly with your consent.
6. **Liability**: we care for your dog with reasonable skill; in an emergency we contact you and your vet. Vet costs are your responsibility.
7. These terms are governed by the laws of the State of California.`;

const LICENSES = `# Open-source licences

Petrock is built with open-source software. Thank you to the maintainers.

| Package | Licence |
| --- | --- |
| React, React DOM | MIT |
| react-router-dom | MIT |
| react-markdown | MIT |
| Vite | MIT |
| TypeScript | Apache-2.0 |
| Inter (typeface) | SIL Open Font License 1.1 |
| Playwright (development) | Apache-2.0 |

Full licence texts ship with the source code of each package.`;

export function seed(ctx: SeedCtx) {
  const { add, now, db } = ctx;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const D = (n: number) => addDays(today, n);
  const customers = (db.customers ?? []) as (BaseRow & { id: string; user_id: string | null; home_location_id: string | null })[];
  const demo = customers.find((c) => c.user_id === 'usr_customer') ?? customers[0];
  const demoUserId = demo?.user_id ?? 'usr_customer';

  // ---- saved payment methods (demo customer + one more) ----
  if (demo) {
    add('payment_methods', { id: 'pm_1', customer_id: demo.id, type: 'card', brand: 'visa', last4: '4242', exp_month: 8, exp_year: today.getFullYear() + 2, holder_name: 'Avery Thompson', billing_zip: '91316', is_default: true, provider: 'mock', provider_token: 'pm_mock_visa_4242', status: 'active' });
    add('payment_methods', { id: 'pm_2', customer_id: demo.id, type: 'card', brand: 'mastercard', last4: '4444', exp_month: 1, exp_year: today.getFullYear() + 1, holder_name: 'Avery Thompson', billing_zip: '91316', is_default: false, provider: 'mock', provider_token: 'pm_mock_mc_4444', status: 'active' });
  }
  if (customers[1]) add('payment_methods', { id: 'pm_3', customer_id: customers[1].id, type: 'card', brand: 'amex', last4: '0005', exp_month: 11, exp_year: today.getFullYear() + 3, holder_name: 'Maya Okafor', billing_zip: '91316', is_default: true, provider: 'mock', provider_token: 'pm_mock_amex_0005', status: 'active' });

  // ---- notification preferences for the demo customer (promotions off by default) ----
  NOTIFICATION_CATEGORIES.forEach((category, i) => add('notification_prefs', { id: `np_${i + 1}`, user_id: demoUserId, category, push: category !== 'promotions', email: category === 'bookings' || category === 'payments' || category === 'vaccines', sms: category === 'bookings' }));

  // ---- legal documents ----
  add('legal_documents', { id: 'legal_privacy', slug: 'privacy-policy', title: 'Privacy policy', kind: 'privacy', version: '1.0', effective_on: `${today.getFullYear()}-09-01`, body: PRIVACY, published: true });
  add('legal_documents', { id: 'legal_terms', slug: 'terms-of-service', title: 'Terms of service', kind: 'terms', version: '1.0', effective_on: `${today.getFullYear()}-09-01`, body: TERMS, published: true });
  add('legal_documents', { id: 'legal_licenses', slug: 'open-source-licenses', title: 'Open-source licences', kind: 'licenses', version: '1.0', effective_on: `${today.getFullYear()}-09-01`, body: LICENSES, published: true });

  // ---- FAQ ----
  ([
    ['booking', 'What do I need before my dog\'s first stay?', 'A pet profile in the app and verified vaccine records for Rabies, DHPP (Distemper / Parvo) and Bordetella. Upload the certificates under Pets and our front desk verifies them; your booking stays *pending vaccines* until then.'],
    ['booking', 'What are check-in and check-out times?', 'Check-in and check-out follow the hours of the location you booked (see About & legal for both locations). Late pick-ups may add a daycare day; the estimate shows every charge before you pay.'],
    ['booking', 'Can two of my dogs share a room?', 'Yes. Choose "share a room" when you book; multi-dog discounts apply per dog per night and appear in the estimate.'],
    ['payment', 'Which payment methods do you accept?', 'Credit or debit card in the app (a card fee shown in the estimate applies) or cash at the location. You can save cards under Payment methods.'],
    ['payment', 'How do deposits and refunds work?', 'Hotel stays take a deposit at booking; the balance is due at check-out. Cancellations 48 hours before check-in are refunded in full to the original card.'],
    ['vaccines', 'My dog\'s vaccine expires during the stay. Is that a problem?', 'Yes, every required vaccine must be valid for the whole stay. Upload the new certificate as soon as you have it and we verify it within a business day.'],
    ['app', 'How do I switch to dark mode or Spanish?', 'Settings > App settings has the dark mode toggle and the language screen. Both are remembered on this device and on your account.'],
    ['app', 'How do I delete my account?', 'Settings > App settings > Delete account. We keep your data for 30 days in case you change your mind, then anonymise it. Active bookings must be completed or cancelled first.'],
    ['other', 'Do you offer in-home services?', 'Not yet. Message the Front Desk in the app to ask about in-home care and we will let you know when it launches.'],
  ] as const).forEach(([topic, question, answer], i) => add('faq_items', { id: `faq_${i + 1}`, topic, question, answer, sort_order: i, active: true }));

  // ---- quick replies ----
  ([
    ['customer', 'Hi! How is {pet} doing today?'], ['customer', 'Could you send a photo of {pet}?'], ['customer', 'What time can I pick up?'], ['customer', 'Running about 15 minutes late.'], ['customer', 'Can I add a groom to this stay?'],
    ['staff', 'Hi! {pet} is doing great today.'], ['staff', 'Here is a photo from playtime.'], ['staff', 'Pick-up is any time before closing.'], ['staff', 'We generally do grooms at the end of hotel stays - shall I add one?'],
  ] as const).forEach(([audience, text], i) => add('chat_quick_replies', { id: `qr_${i + 1}`, audience, text, sort_order: i, active: true }));

  // ---- richer Encino thread for the demo customer (core seeded conv_1 with six messages) ----
  const conv1 = (db.conversations ?? []).find((c) => c.id === 'conv_1') as (BaseRow & { last_message_at: string | null; last_preview: string | null; unread_customer: number }) | undefined;
  if (conv1 && demo) {
    const extra: [('customer' | 'staff'), string, string | null][] = [
      ['staff', 'Morning update: Biscuit ate all of his breakfast and is out for his first walk.', null],
      ['customer', 'Love it, thank you! Could you send a picture when you have a second?', null],
      ['staff', 'Here he is at playtime.', DEMO_PHOTO_URL],
      ['staff', 'He made a new friend, a Labradoodle called Nala.', null],
    ];
    // ~40 minutes before seeding so relative times read naturally (core seeds its thread at fixed clock times today)
    const base = now.getTime() - 40 * 60000;
    const stamp = (j: number) => new Date(base + j * 3 * 60000).toISOString();
    extra.forEach(([sender, text, image], j) => add('messages', { id: `msg_cs_1_${j}`, conversation_id: 'conv_1', sender, sender_user_id: sender === 'staff' ? 'usr_desk' : demoUserId, text, image_url: image, sent_at: stamp(j), read: sender === 'customer' ? true : j < 2 }));
    conv1.last_message_at = stamp(3); conv1.last_preview = 'He made a new friend, a Labradoodle called Nala.'; conv1.unread_customer = 2; conv1.updated_at = stamp(3);
  }
  // ---- Westwood thread (one per customer per location, R-M09 / R-M20) ----
  if (demo) {
    add('conversations', { id: 'conv_cs_ww', location_id: 'loc_westwood', customer_id: demo.id, last_message_at: at(D(-9), 16, 40), last_preview: 'Thanks, we will see you at 7:00 AM.', unread_staff: 0, unread_customer: 0, status: 'open' });
    ([['system', 'Session start'], ['customer', 'Hi Westwood! Do you have daycare space next Tuesday for Mochi?'], ['staff', 'Hi Avery, yes we do. Drop-off from 7:00 AM; would you like a full day?'], ['customer', 'Full day please, I booked it in the app just now.'], ['staff', 'Thanks, we will see you at 7:00 AM.']] as const)
      .forEach(([sender, text], j) => add('messages', { id: `msg_cs_ww_${j}`, conversation_id: 'conv_cs_ww', sender, sender_user_id: sender === 'staff' ? 'usr_desk_ww' : sender === 'customer' ? demoUserId : null, text, image_url: null, sent_at: at(D(-9), 16, 10 + j * 7), read: true }));
  }

  // ---- more notifications for the demo customer ----
  ([
    ['chat', 'New message from Front Desk Encino', 'He made a new friend, a Labradoodle called Nala.', '/app/inbox/conv_1', false, 0, -1, 0],
    ['photo', 'New photo of Biscuit', 'Front Desk Encino shared a photo from playtime.', '/app/inbox/conv_1', false, 0, -1, -6],
    ['checkin_reminder', 'Check-in tomorrow at 10:00 AM', 'Biscuit and Mochi, Penthouse at Encino. Bring their food if they eat their own.', '/app/bookings', true, -1, 18, 0],
    ['promo', 'App-user offer: 10% off a Gold Groom', 'Add a groom to any hotel stay booked in the app this month.', '/app', true, -4, 12, 0],
    ['receipt', 'Receipt for PR-1009', 'Your invoice is ready to view.', '/app/bookings', true, -6, 15, 30],
  ] as const).forEach(([kind, title, body, link, read, dayOff, hh, mm], i) => add('notifications', { id: `ntf_cs_${i + 1}`, user_id: demoUserId, kind, title, body, link, read, sent_at: hh < 0 ? new Date(now.getTime() - (38 - mm) * 60000).toISOString() : at(D(dayOff), hh, mm) }));

  // ---- one support request answered, for the help page history ----
  if (demo) add('support_requests', { id: 'sr_1', location_id: demo.home_location_id ?? 'loc_encino', customer_id: demo.id, user_id: demoUserId, user_name: 'Avery Thompson', email: 'avery.thompson@demo.petrock.test', topic: 'payment', message: 'Can I get a receipt for last month\'s stay emailed to me?', status: 'resolved', staff_reply: 'Sent! You can also open it any time under Bookings > receipt.' });
}
