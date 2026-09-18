# 0010 - hotel stay booking, my reservations, detail / invoice / change requests

version: 0.2.0 (pending integration)
date: 2026-09-18
prompt: 0005
intent: Build the customer hotel journey end to end on the foundation: a seven-step booking wizard (pets & dates, room type with fit and capacity rules, per-pet stay details, grooming during the stay, customer details, estimate from the pricing engine, payment through the PaymentProvider) plus confirmation, a unified My reservations list, a reservation detail with the lifecycle timeline and change / cancel requests, a printable invoice and a change-request form.
decision: docs/decisions/_pending/customer-hotel.md (D-052..18; deposit 30 %, 48 h free cancellation, Suite copy and the 55 lb rule flagged needs Justin)
rejected: separate Customer + Billing forms (one form, card ZIP on the card form); hardcoded room prices ($150 / $105 / $115 placeholders) in favour of the average nightly rate from rates + seasons; a grooming Yes/No dropdown on step 1 (grooming is its own skippable step); customer-side cancellation of confirmed stays without the desk (they file a request the manager approves with a PIN); storing the wizard state in the URL (localStorage draft survives refreshes and the Capacitor wrapper)
files: src/modules/customer-hotel/** (index, specs, strings, draft, lib, 12 pages, css), src/components/molecule/{BookingPetCard,HotelRoomTypeCard,StayDatesCard,HotelEstimateCard,BookingStatusTimeline,CustomerReservationCard}/**, src/components/organism/{HotelCardPaymentForm,HotelInvoiceView}/**, src/components/template/HotelBookingFrame/**, src/data/schema/customer-hotel.ts, src/data/seed/customer-hotel.ts, src/rules/customer-hotel.ts, docs/pages/C-30..C-41.md, docs/screenshots/C-30..C-41/**, docs/decisions/_pending/customer-hotel.md, docs/ops-manual/en/_pending/customer-hotel.md
codes: C-30, C-31, C-32, C-33, C-34, C-35, C-36, C-37, C-38, C-39, C-40, C-41

## What exists now

- **Routes (customer surface, PhoneShell)**: `/app/hotel` C-30 → `/app/hotel/room` C-31 → `/app/hotel/pets` C-32 → `/app/hotel/grooming` C-33 → `/app/hotel/customer` C-34 → `/app/hotel/estimate` C-35 → `/app/hotel/pay` C-36 → `/app/hotel/done/:id` C-37; `/app/bookings` C-38 (BottomNav "Bookings"), `/app/bookings/:id` C-39, `/app/bookings/:id/invoice` C-40, `/app/bookings/:id/change` C-41. Every route has a full PageSpec (completeness 100 %) with rule ids, figma sources and checkedAt.
- **Draft**: `useHotelDraft()` (localStorage `petrock.hotelDraft.v1`) with `draftStage()` guards that send a deep link back to the first incomplete step.
- **Rules**: `src/rules/customer-hotel.ts` adds R-X50..R-X59 (deposit %, initial status, change requests, separate rooms, stay validation, grooming at check-out, capacity, bottom rooms, card fee on the charged amount, average nightly rate), all `implemented`.
- **Tables**: `booking_pet_care` (feeding, belongings, flea brand / last dose, notes per booking pet) and `booking_change_requests` (kind, requested dates, pets, message, status, staff handling). Seed adds `settings.hotel_booking` (deposit 30 %, defaults 10:00 / 11:00, min 1 night, 48 h free cancellation, 3 pets per room), care notes for the demo customer's stays and two change requests.
- **Components (9, all with metas in D-02)**: BookingPetCard, HotelRoomTypeCard, StayDatesCard, HotelEstimateCard, BookingStatusTimeline, CustomerReservationCard (molecules); HotelCardPaymentForm, HotelInvoiceView (organisms); HotelBookingFrame (template).
- **Pricing**: nothing hardcoded. `buildHotelQuote()` runs `quoteHotel()` per room (sharing = one room with N dogs, else one per pet), `buildGroomingQuotes()` runs `quoteGrooming()` per pet by size, `depositFor()` and `chargeFor()` read settings and fees.
- **Payment**: `HotelCardPaymentForm` (Luhn, expiry, brand) → `usePayments().createPaymentIntent()`; success creates bookings, booking_pets, booking_pet_care, appointments (grooming with booking_id), invoices, payments, a notification, and updates the customer row; the mock declines last4 0002.

## Verification

- `npm run typecheck` and `npm run build` green.
- Playwright walk-through (scratch script, vite preview): choose 2 pets → dates → Penthouse blocked for a 68 lb dog (R-X01) with the Suite at the average nightly rate → medication for one pet → Gold Groom + Furminator → customer details → estimate shows the "2 dogs in a suite" discount and the card fee → pay in full with 4242… → confirmation PR-1031 → detail shows the grooming appointment and "Paid in full" → self-service cancel → declined card (…0002) shows the provider error → change request "Other" lands on the detail.
- Every route rendered at 360, 390, 768, 1280 and 1920 with no horizontal overflow and no console errors; screenshots at 390 and 1280 (dark for C-30, C-31, C-35, C-38, C-39) under `docs/screenshots/<CODE>/`.

## Known gaps

- Grooming / daycare cards in My reservations have no detail link until those modules register `/app/grooming/:id` and `/app/daycare/:id`; C-41's staff notification links to `/desk/reservations/:id` (frontdesk-reservations module path, to confirm at merge).
- Links to `/app/pets` (add pet, upload vaccine proofs) and `/auth/sign-in` depend on the customer-home-pets and customer-auth modules.
- Payments are the mock provider; Stripe Elements replaces `HotelCardPaymentForm` when `StripePaymentProvider.needsCardElement` is true. No refunds are executed on self-service cancellation (payment_status is set to refunded; the desk module issues the refund).
- Room photos: `room_types.photo_url` is null in the seed, so the room cards show the placeholder icon.
