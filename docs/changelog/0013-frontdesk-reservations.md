# 0013 - Front desk today, reservations table, board booking form, booking detail, room timeline, Grooming & Spa board, availability

version: 0.2.0 (pending integration)
date: 2026-09-18
prompt: 0005 (module frontdesk-reservations of "Please build the whole thing")
intent: Give the front desk its daily tools for one location: a Today dashboard that surfaces arrivals, departures, in-house dogs, free rooms, vaccine blockers and balances; the 18-column reservations table grouped by day bucket; a board booking form driven by the pricing engine and the vaccine gate; a booking detail with PIN-gated status changes, room assignment, payments and an activity trail; a rooms × days timeline with drag-and-drop moves; a Grooming & Spa kanban; and a quick availability check.
decision: Resolved open questions 69-74, 77-78, 81, 84-85, 87-90 locally (see docs/decisions/_pending/frontdesk-reservations.md); pricing-affecting ones (deposit default, chargeable-day multipliers, daycare capacity) marked needs Justin. Board view (D-008) designed fresh since no Figma board exists. Booking status changes, deletes and refunds always go through PinApprovalModal (R-I06, R-P01); every action writes booking_events (R-J08).
rejected: A second status vocabulary for the table chips (Future / Checking In / Completed) - mapped onto the one lifecycle (R-I02). Hand-rolled table / modal / menu markup inside pages - everything is library components. Chargeable-day multipliers on the form - nights drive the price until Justin confirms R-D09. Editing appointments on the board - that stays in the grooming module.
files: src/modules/frontdesk-reservations/** (index, specs, strings, 7 pages, lib/*), src/components/molecule/{ReservationDayNav,BookingStatusMenu,PetVaccineStatus,BookingChargeSummary,BookingInfoGrid}/**, src/components/organism/{RoomTimeline,AppointmentBoard,RoomAssignmentPicker}/**, src/data/schema/frontdesk-reservations.ts, src/data/seed/frontdesk-reservations.ts, src/rules/frontdesk-reservations.ts, supabase/schema.sql + docs/data-model.md (regenerated), docs/pages/F-01.md F-10.md F-11.md F-12.md F-13.md F-14.md F-15.md, docs/screenshots/F-01 F-10 F-11 F-12 F-13 F-14 F-15, docs/decisions/_pending/frontdesk-reservations.md, docs/ops-manual/en/_pending/frontdesk-reservations.md
codes: F-01 (replaces stub), F-10, F-11, F-12, F-13, F-14, F-15

## What exists now

- **F-01 Front desk today** (`/desk`): stat tiles (arriving, departing, in house, daycare, rooms free per type, pending vaccines, balance due, grooming), "Needs attention" (vaccine issues, no room, balance due), day tabs with counts, dense reservations table with Check in / Check out / Confirm quick actions. Check-in without a room opens the room picker (R-X05).
- **F-10 Reservations table** (`/desk/reservations`): the 18 design columns, groups Arriving / Departing / Staying / Daycare / Checked out (collapsible with counts), filters, search, cancelled toggle, "All upcoming" mode, Table / Timeline / Board switch, daycare drawer.
- **F-11 New / edit booking** (`/desk/reservations/new`, `/:id/edit`): Board Bookings form sections; inline new customer (R-J05); pet cards with vaccine state; room type cards + RoomAssignmentPicker (30 lb rule, 55 lb warning); additional services with occurs and M / A / E; payment terms; 100-char notes; live quote via `quoteDeskStay()`; status confirmed vs pending_vaccines by R-X04; prefills from availability, timeline and Rebook.
- **F-12 Booking detail** (`/desk/reservations/:id`): customer, stay grid, pets with vaccine / medical flags, notes, charges with Record payment (PaymentProvider) and Refund (PIN), payments, activity trail; header actions Check in / Check out, Set status (lock when PIN), Edit, Rebook, Delete (PIN).
- **F-13 Room timeline** (`/desk/reservations/timeline`): RoomTimeline organism with week headers, TODAY marker, groups Unassigned / Penthouses / Suites / Daycare, status-coloured blocks with flags, lanes for overlaps, drag-and-drop moves validated for type / fit / clash (R-X07), popover with Open / Assign room / Set status, empty-cell click starts a booking.
- **F-14 Grooming & Spa board** (`/desk/reservations/board`): AppointmentBoard kanban by status, day / week, groomer and package filters, stat tiles, appointment drawer, Cancelled / no show needs a PIN (R-X06).
- **F-15 Quick availability** (`/desk/reservations/availability`): dates, dogs, heaviest weight or a customer's pets; per-type free rooms with fit notes and quote; daycare spots; next-14-days occupancy table.
- **Components (8 new, all with metas)**: ReservationDayNav, BookingStatusMenu, PetVaccineStatus, BookingChargeSummary, BookingInfoGrid (molecules); RoomTimeline, AppointmentBoard, RoomAssignmentPicker (organisms).
- **Tables (2 new)**: `booking_events` (activity trail, location-scoped), `booking_services` (additional services with occurs / M A E). Seed adds an activity trail for every core booking and services on a few desk bookings.
- **Rules (17 in `src/rules/frontdesk-reservations.ts`)**: R-I02, R-I07, R-I09, R-I11, R-D13, R-D16, R-D17, R-J05, R-J06, R-J08, R-H08, R-E14, R-X03..R-X07 (13 implemented, 1 in_dev, 3 requested).
- **Shared helpers** (`src/modules/frontdesk-reservations/lib`): dates, vaccines (`petVaccineSummary`), reservations (`useReservationRows`, `bucketOf`), availability (`availabilityByType`, `roomFits`, `staysOverlap`), quote (`quoteDeskStay`), `useBookingActions` (PIN gate + events), RoomPickModal, columns.

## Verification

- `npm run typecheck` and `npm run build` green; `npm run sql` regenerated (41 tables).
- Playwright (scratchpad `qa.mjs`, vite preview on port 4327): all 7 routes at 360 / 390 / 768 / 1280 / 1920 - no horizontal page overflow, no console errors. Screenshots 390 + 1280 for every code, dark for F-01, F-10, F-12, F-13.

## Known gaps

- Invoice PDF / print is a toast placeholder (invoices module F-20s). Message / Profile buttons on the detail link to `/desk/messages` and `/desk/customers`, which other modules register.
- Deposit default, chargeable-day multipliers (R-D09), book-out-whole-room (R-D13), pickup / delivery (R-D17) and the daycare-capacity question (R-E14) wait for Justin.
- Timeline drag has no keyboard equivalent beyond the popover actions and the Edit page.
- The Board only changes appointment status; creating / editing appointments lives in `frontdesk-grooming-people`.
