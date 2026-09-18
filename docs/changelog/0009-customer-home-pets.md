# 0009 - Customer home, pets, add / edit pet wizard, vaccines, notifications (C-10..C-21)

version: 0.2.0 (pending integration)
date: 2026-09-18
prompt: 0005 (module build, "Please build the whole thing")
intent: Give the pet parent a working home: pick the Petrock location, see the three bookable services, manage pets through one clean five-step wizard (Basics, Size in lbs, Personality & feeding, Vet & emergency, Vaccines), keep per-pet vaccine records with proof uploads and verification state that gates bookings, and read notifications. Replace the C-10 stub.
decision: docs/decisions/_pending/customer-home-pets.md (wizard structure, weight in lbs, per-vaccine uploads, notification kinds, one display date format, In Home dropped from the tiles, soft delete of pets, emergency contact per pet, customer location preference). Rule ids R-X20..R-X25 reserved for this module.
rejected: A 2-step wizard mirroring the Figma stepper (duplicated questions, unresolved split); one bulk "invoices or certificates" upload (staff cannot verify per vaccine); Kg on the profile (lbs everywhere, R-C02); the UI-kit Pet Profile reminders / notes and owner fields on the pet form; hard-deleting pets; a notifications bottom tab (Figma reaches it from the bell); an In Home tile (D-003).
files: src/modules/customer-home-pets/** (index, specs, strings, lib, actions, HomePage, MyPetsPage, PetWizardPage, PetProfilePage, VaccinesPages, NotificationsPage, customer-home-pets.css), src/data/schema/customer-home-pets.ts, src/data/seed/customer-home-pets.ts, src/rules/customer-home-pets.ts, src/components/atom/VaccineStatusChip/**, src/components/molecule/{PetAvatarCard,HomeServiceTile,CustomerBookingCard,VaccineRecordRow,PetDocumentUpload,PetPhotoPicker,AppNotificationRow,PhonePageHeader}/**, src/components/organism/VaccineRecordForm/**, docs/pages/C-10..C-15,C-20,C-21.md, docs/screenshots/C-1x,C-2x/**, supabase/schema.sql + docs/data-model.md + docs/specs.md (regenerated)
codes: C-10, C-11, C-12, C-13, C-14, C-15, C-20, C-21 (built)

## What exists now

- **C-10 Home** (`/app`, replaces the stub): greeting, location chip + picker (sets LocationProvider and `customers.home_location_id`), bell with unread badge, hero, services row Hotel / Grooming & Spa / Daycare with the "Add a pet first" gate (R-A01), vaccine banner, pets strip with approval / vaccine chips, upcoming bookings across hotel / grooming / daycare with the one lifecycle's customer labels, past bookings link. Service tiles navigate to the other modules' routes when they exist, else toast.
- **C-11 My pets**: grid with status per pet, add pet, empty state. Bottom tab "Pets".
- **C-12 / C-14 wizard**: five steps in one stepper, per-step validation (R-C01), lbs weight with live size band (R-C02, R-X21), slot-based meals (R-C04), breeds / colours from `pet_lookups` with inline add, vets with inline add (R-B08), emergency contact (`emergency_contacts`, R-X22), vaccines step with VaccineRecordForm drafts inserted as `submitted` after the pet exists; skip allowed with the pending warning (R-B07, R-A05, R-X25). Edit mode prefilled with Save on every step.
- **C-13 Pet profile**: hero, stats, vaccine summary, care, medical, emergency contact, upcoming bookings, soft remove blocked by upcoming bookings (R-X24).
- **C-20 Vaccines** and **C-21 Pet vaccine records**: pet selector, status card, required / recommended rows, upload / update through the modal form, front desk notified (`vaccine_submitted`), history of earlier records. Statuses derive from record + expiry (R-X20).
- **C-15 Notifications**: All / Unread tabs, mark all read, deep links when the route exists (R-M07, R-M08).
- **Components (10, all with metas)**: VaccineStatusChip; PetAvatarCard, HomeServiceTile, CustomerBookingCard, VaccineRecordRow, PetDocumentUpload (mock upload with progress / cancel), PetPhotoPicker (downscaled data URL), AppNotificationRow, PhonePageHeader; VaccineRecordForm.
- **Tables (2)**: `emergency_contacts`, `pet_lookups` (+ typed `VetRow` for the core `vets` table). Seed: 30 breeds, 12 colours, 4 emergency contacts, 4 more customer notifications.
- **Rules (18)**: R-A04, R-A06, R-C01..C05, R-B06, R-B08, R-B09, R-M07, R-M08 (implemented) and R-X20..R-X25 (new, implemented).

## Verification

- `npm run typecheck` and `npm run build` green.
- Playwright (`scratchpad/qa.mjs`, vite preview on port 4271) over the 8 routes at 360 / 390 / 768 / 1280 / 1920: no horizontal overflow, no console errors; screenshots at 390 and 1280 (dark for C-10, C-12, C-13, C-20).
- Functional run: add a pet through all five steps with one mock vaccine upload -> profile shows the pet with a pending chip -> pet listed in My pets; location picker switches to Westwood; mark-all-read clears unread rows; empty household -> Hotel tile opens the gate modal.

## Known gaps

- Booking detail / hotel / grooming / daycare / chat / bookings routes belong to other modules; the home degrades to a toast until they ship.
- Foundation rule statuses R-A01, R-B05, R-B07, R-B11 are now implemented here but their rows live in `src/rules/operations.ts` / `vaccines.ts` (not edited); the integrator should flip them.
- PhoneShell puts the unread badge on the paw tab (foundation behaviour); the home bell already carries it, so the paw badge could be dropped.
- Proofs and photos are mock URLs / data URLs until Company-OS storage exists; staff verification queue is F-5x.

## Integration note (2026-09-18)

- C-15 `/app/notifications` was retired at merge: customer-settings-chat's notification centre (C-80) owns that path (it adds per-category preferences and the same relative-time grammar). `AppNotificationRow` was removed with it; the Home bell still opens `/app/notifications`.
