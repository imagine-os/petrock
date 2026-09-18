# pending - Figma fidelity part (b): customer screens

version: 0.2.0
date: 2026-09-18
prompt: 0012
branch: fidelity/customer-screens (not merged; integrator merges onto main after part c)
intent: Make the customer app match the Figma exports block by block (Justin: "especially the homepage on mobile ... everything needs to match the exact styling from before"), using only the restyled shared components and tokens from part (a): C-10 home first, then My Pets, Pet Profile, Add Pet, the hotel flow, Settings, Notification and the grooming frame.
decision: D-189 (home layout), D-190 (filled pointer stepper, five circles), D-191 (no stepper on the hotel flow) applied as defaults. New: the Chat tab leaves the bottom nav (Figma has four tabs); chat is reached from Notification > Front Desk Chat and Settings > Front Desk Chat. `Section band` variant for the home label-row + grey-band pattern. `AccountProfileHero` serves pets too (dashed coral ring + pencil disc). `HotelBookingFrame` is built on `CustomerScreenHeader`. Location on home moved into the hotel flow (xs select) per D-189.
rejected: Hand-rolled home cards (kept PetAvatarCard / CustomerBookingCard); a licensed pool photo (none in the exports: HomeHero ships a brand-gradient placeholder with the logo, open question 116); room photos (none in the exports: HotelRoomTypeCard keeps a tinted line-art placeholder with the exact 239 px footprint); reordering the wizard into two Figma steps (five internal steps stay, D-190); per-page colour overrides (everything is tokens / component CSS).
files: src/components/molecule/HomeHero/* (new), molecule/Section, molecule/AccountProfileHero, molecule/CustomerScreenHeader (onBack), template/HotelBookingFrame, molecule/StayDatesCard, molecule/DatePicker, molecule/HotelRoomTypeCard, molecule/HotelEstimateCard, molecule/BookingPetCard, molecule/PetPhotoPicker, atom/RadioGroup (card rows); src/modules/customer-home-pets/{HomePage,MyPetsPage,PetProfilePage,PetWizardPage,strings,specs,customer-home-pets.css}; src/modules/customer-hotel/{PetsDatesPage,RoomTypePage,EstimatePage,PaymentPage,PetDetailsPage,GroomingPage,CustomerDetailsPage,ConfirmationPage,ReservationsPage,ReservationDetailPage,ChangeRequestPage,InvoicePage,strings,specs,customer-hotel.css}; src/modules/customer-settings-chat/{ProfileHubPage,AppSettingsPage,NotificationCenterPage,InboxPage,index,useCustomerAccount,specs,customer-settings-chat.css}; src/modules/customer-grooming-daycare/{layout,cgd.css,specs}; docs/pages/{C-10,C-11,C-12,C-13,C-14,C-30,C-31,C-35,C-36,C-70,C-72,C-80}.md; docs/screenshots/{C-10,C-11,C-12,C-13,C-30,C-31,C-35,C-36,C-50,C-70,C-72,C-80,C-82}
codes: C-10, C-11, C-12, C-13, C-14, C-30, C-31, C-32, C-33, C-34, C-35, C-36, C-50, C-70, C-72, C-80, C-81, C-82

## What changed

- **C-10 Home** (`Home Page.png`): `HomeHero` (142 px, logo plate on a brand-gradient placeholder), `Section band` rows - label on white, body on the `#EEF2F5` band - for Services (4 tiles: Hotel, Spa, Daycare, In Home -> coming-soon toast, D-003), Pets (122 px cards, first pet with the 2 px `#9D67EF` border, others with the pet glow, "Add a Pet" card; empty = centred Add a Pet button, `Home Page-2.png`), Upcoming Bookings (160 px cards, hidden without pets), underlined "View Past Reservations"; `Modal size="alert"` "Hey! To Book An Appointment Please 1st Add A Pet" with Back / Add a Pet (`Home Page-5.png`). Greeting, location chip, bell, counts, gradient hero card and the yellow vaccine banner removed (D-189).
- **Bottom nav**: `/app/inbox` no longer has a `nav` entry, so the tab bar is Home / Bookings / Pets / Settings like the Figma Navbar; the unread dot stays on the paw.
- **C-11 My Pets**: list tone, "Add Pet" text action, 2-up grid (gap 20 / gutter 24), 76 px avatar, display-font name, "Breed: X", no pills.
- **C-13 Pet Profile**: `AccountProfileHero` (pet, dashed coral ring, pencil disc), stats card, Reminder card (next booking), "Notes for <pet>" rows via `AccountMenuRow` (Vaccines, Care & feeding, Medical & vet, Emergency contact) with detail modals.
- **C-12 / C-14 Add / Edit Pet**: form tone, `CustomerScreenHeader`, compact filled stepper, 70 px photo with the green dot, Figma field labels (Color, Date Of Birth, Neutered/Spayed), one 40 px Next.
- **Hotel flow C-30..C-37** (D-191): `HotelBookingFrame` now uses `CustomerScreenHeader` (rule) with a flat 48 px CTA footer and 20 px gutter; no stepper anywhere. C-30 "Hotel Reservation": centred "Select Your Pet", 100x138 `BookingPetCard` (primary fill, no check disc), xs selects, calendar card above the Check In / Check Out card. C-31 "Choose Your Room Type": borderless photo cards (239 px, BOOK NOW overlay, 20/600 title, 12 px `#304050` copy, "$150 Avg Per Night/Pet"), books from the card. C-35 "Estimate": Booking Detail / Check-in / Payment Details cards, `#DED0E9` grooming band, Pay Deposit + green note + Pay In Full. C-36 "Choose Payment": option rows with the purple radio right, then the card form.
- **C-70 / C-72 Settings**: hero 110 with dashed coral ring, twelve rows (alternating purple / coral) directly on the list tone, no cards / group labels / sub-labels; C-72 rows Language, Change password, Dark mode toggle, ..., Delete account.
- **C-80 Notification**: "Mark all read" as header text action, split tabs Notification | Front Desk Chat, plain rows; filters, day groups, gear and dismiss removed. C-81 inbox header gets a back chevron.
- **C-50 / grooming & daycare frame**: `CgdPage` uses `CustomerScreenHeader` + compact stepper; the gradient hero became a white card; `NoPetsModal` is the Figma alert.
- **Shared**: `Section.band`; `CustomerScreenHeader.onBack`; `AccountProfileHero.subtitle / kind / action` (110 default); `DatePicker` Figma skin (18/600 month, outlined arrow squares, purple 600 days); `StayDatesCard` calendar-first with 48 px `#F1F1F1` fields and filled icons; `HotelRoomTypeCard` chromeless; `HotelEstimateCard` Figma card (36 px line icon, primary title, green headline, `--shadow-card`); `RadioGroup cards` = 56 px option rows with the radio right; `BookingPetCard` Figma pet card; `PetPhotoPicker` no ring, 22 px green dot. All customer specs now carry `tone` (home / list / form).

## Remaining gaps vs the exports

- Hero pool photo and room photos: no licensed assets in the exports (placeholders keep the footprint).
- `svc-*` services glyphs stay provisional until the Design System export (part a note).
- C-13 "Reminder" shows the next booking (Figma: a vet appointment) - no reminders entity yet (open question 26).
- C-31 keeps the fit / capacity chips and reason lines (business rules) that the Figma card does not show.
- C-36 shows the card form inline under the rows (Figma: a following screen).
- C-72 keeps Notifications, Payment methods and Colour theme rows that `setting.jpg` does not have.
- Language icon uses the exported `category` glyph (no translate icon in the exports); Address row uses `tag`.

## Token changes needed (not made here, tokens.ts untouched)

- none blocking; optional `--color-icon-cash #148F00` style constant is covered by `--color-success-strong`.

## Verification

`npm run typecheck` + `npm run build` green; screenshots regenerated for C-10, C-11, C-12, C-13, C-30, C-31, C-35, C-36, C-50, C-70, C-72, C-80, C-82 at 390 / 1280 (C-10 also dark); no console errors in the capture run.
