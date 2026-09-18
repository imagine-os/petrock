# 0011 - Grooming & Spa and Daycare customer flows (C-50..C-56, C-60..C-65)

version: 0.2.0 (pending merge)
date: 2026-09-18
prompt: 0005
intent: Give pet parents the two service flows the Figma customer app only sketched: a Grooming & Spa order (choose pet and package by size, add-ons, groom another pet, location / date / groomer / time slot, summary and payment, confirmation, history with re-create) and a Daycare day (pets, day and times with the live price, per-pet questionnaire, checkout, confirmation, history with book again), all priced from the settings tables and following the one booking lifecycle.
decision: D-004 / D-011 (one Grooming & Spa service, Spa as packages/add-ons); D-016 (responsive at 360..1920); D-019 (lifecycle, 6 h daycare threshold, 3.89 % card fee, 2 % tax). Module-level choices recorded in `docs/decisions/_pending/customer-grooming-daycare.md` (customer cancels only before confirmation, slot algorithm, daycare/grooming fit rule with a 60-minute buffer, appointments status mapping).
rejected: Reproducing the Figma totals ($500 / $64 / $565) or placeholder prices ($65 / $100 / $200) - every number comes from `quoteGrooming` / `quoteDaycare`; a "Daycare coming soon" screen (R-A03) - daycare is a full flow; a separate appointment-status vocabulary - grooming orders use the booking lifecycle and appointments map onto it; a bottom-nav tab per service - the flows are reached from the Home tiles so the tab bar stays four items; hardcoding the 5 h vs 6 h threshold - it is `daycare_pricing.threshold_hours`.
files: src/modules/customer-grooming-daycare/** (13 pages, specs, draft store, pricing, slots, actions, strings, css); src/components/molecule/{PetChoiceStrip,GroomingPackageCard,GroomingAddonRow,GroomingSlotPicker,GroomingPriceMenu,ServiceQuoteLines,ServiceFlowFooter,ServicePayMethod,GroomingOrderCard,DaycareDayCard}/**; src/data/schema/customer-grooming-daycare.ts; src/data/seed/customer-grooming-daycare.ts; src/rules/customer-grooming-daycare.ts; supabase/schema.sql + docs/data-model.md (regenerated, 41 tables); docs/pages/C-50..C-56.md, C-60..C-65.md; docs/screenshots/C-5x, C-6x; docs/decisions/_pending/customer-grooming-daycare.md; docs/ops-manual/en/_pending/customer-grooming-daycare.md
codes: C-50, C-51, C-52, C-53, C-54, C-55, C-56, C-60, C-61, C-62, C-63, C-64, C-65

## What exists now

- **Grooming & Spa** (`/app/grooming`): landing with the live packages x sizes menu and add-on chips (C-50); choose pet & package priced for the pet's size tier (C-51); add-ons with size-based added minutes and "Groom another pet" (C-52); location, date, groomer and computed start slots that respect hours, capacity and existing appointments (C-53); summary & payment with card (mock, Stripe-ready) or pay at location and engine totals (C-54); order detail / confirmation with re-create and cancel-before-confirmation (C-55); history with Upcoming / Past tabs (C-56).
- **Daycare** (`/app/daycare`): landing with pricing tiles and the extra-pet discount (C-60); reservation with multi-pet selection, day, drop-off / pick-up times, live price and the grooming-fit rule (C-61); per-pet flea-medication / medical-alert questionnaire (C-62); checkout (C-63); day detail / confirmation with book again, cancel, add grooming (C-64); history (C-65).
- **Tables**: `grooming_orders` (groups per-pet appointments, carries payment and lifecycle status), `daycare_booking_pets` (per-pet questionnaire). Seed: one order per core appointment, one detail row per daycare pet.
- **Rules** (16): R-G03, G05, G08, G13, G14 (deprecated), G15, G16, G18 (requested), G21, R-F06, R-A03, R-A11, R-X14, R-X15, R-X16, R-X17.
- **Components** (10, all with metas): PetChoiceStrip, GroomingPackageCard, GroomingAddonRow, GroomingSlotPicker, GroomingPriceMenu, ServiceQuoteLines, ServiceFlowFooter, ServicePayMethod, GroomingOrderCard, DaycareDayCard.
- **Writes**: orders / appointments / daycare days / details, invoices (+ payments for card), notifications; cancellation updates the rows and notifies. Drafts persist in `localStorage` (`petrock.draft.grooming`, `petrock.draft.daycare`).

## Verification

- `npm run typecheck` and `npm run build` green in the module worktree.
- Playwright (scratchpad runner against `vite preview`): all 13 routes at 360 / 390 / 768 / 1280 / 1920, light + dark for C-50, C-51, C-54, C-60, C-61, C-63: no console errors, no horizontal overflow. End-to-end: card checkout of a two-pet order ($217.23 = 205 + 4.10 tax + 8.13 card fee) lands on C-55 as Upcoming / Paid; daycare pay-at-location ($86.70 = 2 x 45 - 5 + 1.70 tax) lands on C-64 as Requested, then cancels; card ending 0002 shows "Card declined (mock)".

## Known gaps

- `appointments.status` enum (core) has no `pending_vaccines`; the order row carries it and appointments are written as `requested`. Suggest aligning the enum with the booking lifecycle in an integration pass.
- R-X02 (`src/rules/operations.ts`, requested) and R-A01 (in_dev) are implemented here (C-61 / C-50, C-60) but their statuses live in a shared file; flip them at merge.
- Links to `/app/pets/new`, `/app/pets` and `/app/chat` depend on the customer-home-pets and customer-settings-chat modules.
- Refunds after a customer cancellation and confirmed-order changes are desk actions (PIN-gated), not in-app.
- Daycare "Walk" item and the grooming-during-daycare handover are shown as copy; no capacity check against daycare capacity yet (R-E13 / open question 60).
