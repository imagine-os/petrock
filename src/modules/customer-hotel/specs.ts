import { defineSpec } from '../../specs/defineSpec';
import type { Role } from '../../auth/roles';

const ROLES: Role[] = ['customer'];
const W = [360, 390, 768, 1280, 1920];
const FRAME = ['HotelBookingFrame', 'Stepper', 'Button'];

export const petsDatesSpec = defineSpec({
  code: 'C-30', tone: 'form', name: 'Hotel: choose pets & dates',
  purpose: 'First step of a hotel stay: pick the location, the pets that are coming, whether they share a room, and the check-in / check-out days and times on a range calendar bounded by opening hours.',
  layout: ['HotelBookingFrame (CustomerScreenHeader "Hotel Reservation" with rule, no stepper - D-191)', 'SelectYourPet (centred label + BookingPetCard x n: 100x138, primary fill when selected, vaccine pill; Manage pets link)', 'ShareRoomSelect (only with 2+ pets, 28 px xs select)', 'LocationSelect (xs)', 'StayDatesCard (calendar card, then Check In / Check Out card with 48 px fields and filled icons)', 'Footer (full-width Next 48)'],
  data: ['customers', 'pets', 'vaccine_records', 'vaccine_types', 'locations', 'settings'], roles: ROLES,
  logic: ['R-A01: no pets -> EmptyState with Add a pet.', 'Share-room question only for 2+ pets; more than settings.max_pets_per_room forces separate rooms (R-X53).', 'validateStay(): check-out after check-in, min nights, times inside location hours for that weekday, closed days disabled (R-X54).', 'Vaccine chip per pet from vaccine_records vs required vaccine_types (R-A05).', 'Draft persists in localStorage (petrock.hotelDraft.v1) across steps and refreshes.'],
  integrations: [], components: [...FRAME, 'Select', 'BookingPetCard', 'StayDatesCard', 'DatePicker', 'TimePicker', 'EmptyState', 'Badge'],
  rules: ['R-A01', 'R-A04', 'R-A05', 'R-A07', 'R-K02', 'R-X53', 'R-X54'], states: ['no pets', 'one pet', 'multi-pet with share question', 'date error', 'valid'],
  figma: ['Choose Pets-3.png', 'Choose Pets-2.png', 'Hotel Reservation.png', 'Frame 1171276425.png'], checkedAt: W,
  notes: ['Chosen over the text-input variant: the room-share question is a Yes/No select (open question 39).', 'Grooming is its own step (C-33) instead of the Yes/No dropdown on this screen.', 'Fidelity part (b), prompt 0012: no stepper on the hotel flow (D-191), #EEF2F5 form tone, CustomerScreenHeader with the #B6B6B6 rule, flat 48 px CTA.'],
});

export const roomTypeSpec = defineSpec({
  code: 'C-31', tone: 'form', name: 'Hotel: choose room type',
  purpose: 'Pick Penthouse or Suite for the chosen pets and dates. Cards show the inclusions copy, the average nightly rate per pet from the pricing engine, rooms left, and are disabled by the fit rules (55 lb Suite only, 30 lb bottom rooms) or when the location is full.',
  layout: ['HotelBookingFrame ("Choose Your Room Type", no stepper)', 'SummaryLine (pets, dates, location, rooms)', 'HotelRoomTypeCard x n (239 px photo with BOOK NOW overlay, title 20/600, inclusions 12, "$150 Avg Per Night/Pet"; books from the card)', 'Footer Next only once a room is selected'],
  data: ['room_types', 'rates', 'seasons', 'rooms', 'capacities', 'bookings', 'booking_pets', 'pets'], roles: ROLES,
  logic: ['avgNightly(): quoteHotel for 1 dog over the dates / nights (R-X59, weekday / weekend / seasonal rates R-D05, R-D06).', 'roomFit(): any pet >= 55 lb blocks Penthouse (R-X01); pets >= 30 lb need a bottom penthouse room (R-E09, R-X57).', 'availability(): capacities.max_simultaneous minus overlapping active stays; rooms needed = 1 when sharing else pets count (R-X56, R-E11, R-E12).'],
  integrations: [], components: [...FRAME, 'HotelRoomTypeCard', 'Badge', 'Card'],
  rules: ['R-D01', 'R-D05', 'R-D06', 'R-E09', 'R-E11', 'R-E12', 'R-X01', 'R-X56', 'R-X57', 'R-X59'], states: ['both available', 'Penthouse blocked (55 lb)', 'bottom rooms full', 'location full'],
  figma: ['Choose Your Room.png', 'Choose Your Room-1.png'], checkedAt: W,
  notes: ['Suite description is its own copy (the Figma card repeats the Penthouse text).', 'Prices are never hardcoded: $150 / $105 / $115 in the exports were conflicting placeholders (open question 48).', 'Fidelity part (b), prompt 0012: no stepper on the hotel flow (D-191), #EEF2F5 form tone, CustomerScreenHeader with the #B6B6B6 rule, flat 48 px CTA.'],
});

export const petDetailsSpec = defineSpec({
  code: 'C-32', tone: 'form', name: 'Hotel: pet stay details',
  purpose: 'Per pet coming to stay: feeding plan, own food, medication and dosing, vet-recommended flea medication (brand, last dose), belongings, medical alert and notes. Prefilled from the pet profile.',
  layout: ['HotelBookingFrame (Stepper 3/7)', 'One collapsible Section per pet (BookingPetCard compact header)', 'Feeding fields', 'Medication fields (conditional)', 'Flea medication fields (conditional)', 'Belongings, medical alert, notes', 'Sticky footer: Next'],
  data: ['pets', 'settings'], roles: ROLES,
  logic: ['Defaults from pets.feeding_am / feeding_pm / own_food / medical_conditions.', 'Medication and flea sub-fields appear only when the answer is Yes (R-A10).', 'Saved into booking_pets (medical) and booking_pet_care (feeding, belongings, flea) at payment.'],
  integrations: [], components: [...FRAME, 'Section', 'BookingPetCard', 'Select', 'Input', 'Textarea', 'Toggle'],
  rules: ['R-A10', 'R-A13'], states: ['no medication', 'medication + flea', 'multiple pets'],
  figma: ['Booking Details Add Pets.png', 'Booking Details Add Pets-4.png', 'Frame 1171276426.png'], checkedAt: W,
  notes: ['Resolves open question 42: the form is per pet (one section each), titled once; the unlabeled date is the last flea dose.', 'Fidelity part (b), prompt 0012: no stepper on the hotel flow (D-191), #EEF2F5 form tone, CustomerScreenHeader with the #B6B6B6 rule, flat 48 px CTA.'],
});

export const groomingSpec = defineSpec({
  code: 'C-33', tone: 'form', name: 'Hotel: add grooming during the stay',
  purpose: 'Optionally add one Grooming & Spa package (Gold / Platinum / Diamond priced by the pet size) plus add-ons per pet, scheduled at the end of the stay. Skippable.',
  layout: ['HotelBookingFrame (Stepper 4/7)', 'Info band (grooms at the end of stays)', 'Per pet: package RadioGroup cards with size price, add-on Chips', 'Running grooming total (HotelEstimateCard compact)', 'Sticky footer: Skip / Continue'],
  data: ['packages', 'addons', 'pets', 'taxes', 'fees'], roles: ROLES,
  logic: ['packagePrice(pkg, pet.size) from packages.price_<size> (R-G01, R-G02); add-ons from addons with starting-at flag (R-G10, R-G11).', 'quoteGrooming() per pet (service tax); appointments are created at payment with booking_id and 09:00 on check-out day (R-X55, R-A09).'],
  integrations: [], components: [...FRAME, 'RadioGroup', 'Chip', 'HotelEstimateCard', 'BookingPetCard', 'Card'],
  rules: ['R-A08', 'R-A09', 'R-G01', 'R-G02', 'R-G10', 'R-G11', 'R-X55'], states: ['nothing selected', 'package per pet', 'skipped'],
  figma: ['Frame 1171276430.png', 'Frame 1171276428.png', 'Booking Detail.jpg'], checkedAt: W,
  notes: ['Fidelity part (b), prompt 0012: no stepper on the hotel flow (D-191), #EEF2F5 form tone, CustomerScreenHeader with the #B6B6B6 rule, flat 48 px CTA.'],
});

export const customerDetailsSpec = defineSpec({
  code: 'C-34', tone: 'form', name: 'Hotel: customer details',
  purpose: 'Confirm the contact and billing details for the stay: names, mobile and alternate phone, email, US address. Prefilled from the customer record and written back on payment.',
  layout: ['HotelBookingFrame (Stepper 5/7)', 'Two-column rows: first / last name, mobile / alt phone', 'Email', 'Address, apt / suite, city', 'State Select / ZIP', 'Sticky footer: Next'],
  data: ['customers'], roles: ROLES,
  logic: ['Required: first, last, mobile, email, address, city, state, zip; email and ZIP format checks.', 'One address serves contact and billing (open question 44).'],
  integrations: [], components: [...FRAME, 'Input', 'Select'],
  rules: ['R-L01'], states: ['prefilled', 'validation errors'],
  figma: ['Booking Details Final Customer Details.png', 'Booking Details Final Customer Details-2.png'], checkedAt: W,
  notes: ['Fidelity part (b), prompt 0012: no stepper on the hotel flow (D-191), #EEF2F5 form tone, CustomerScreenHeader with the #B6B6B6 rule, flat 48 px CTA.'],
});

export const estimateSpec = defineSpec({
  code: 'C-35', tone: 'form', name: 'Hotel: estimate',
  purpose: 'Pre-payment estimate: room line items by night kind and season, multi-dog and long-stay discounts, tax, grooming, then the two payment paths (deposit or full) with the card fee shown for the amount charged now.',
  layout: ['HotelBookingFrame ("Estimate", no stepper)', '"Booking Detail" + HotelEstimateCard (line-art house, room name in primary, total in green, Room / discount / Tax / TOTAL lines)', 'StayDatesCard readOnly (Check-in / Check-out)', 'Grooming HotelEstimateCard (when grooming was added)', '"Payment Details" + HotelEstimateCard (Hotel Rent, Tax, Total, deposit, balance)', 'GroomingBand (#DED0E9 full-bleed copy + outlined Add Grooming) when no grooming', 'PayButtons (Pay Deposit 48 primary, green note, Pay In Full 40 outlined)'],
  data: ['rates', 'seasons', 'discounts', 'fees', 'taxes', 'packages', 'addons', 'room_types', 'settings'], roles: ROLES,
  logic: ['buildHotelQuote(): one room with N dogs when sharing, else one room per pet (R-X53); quoteHotel per room (R-D05, R-E01..E06).', 'Long-stay discount only when paid in full and no holiday nights; the engine note explains why it did not apply (R-E04..E06, R-E08, R-E15).', 'Tax: boarding rate on stays, service rate on grooming (R-H04, R-H05).', 'depositFor(): settings.hotel_booking.deposit_percent of the pre-fee total (R-X50).', 'chargeFor(): card fee percent from fees on the amount charged now (R-H03, R-X58).'],
  integrations: [], components: [...FRAME, 'SegmentedControl', 'RadioGroup', 'HotelEstimateCard', 'StayDatesCard', 'Card'],
  rules: ['R-D05', 'R-D06', 'R-E01', 'R-E02', 'R-E03', 'R-E04', 'R-E05', 'R-E06', 'R-E08', 'R-E15', 'R-H02', 'R-H03', 'R-H04', 'R-A08', 'R-A09', 'R-X50', 'R-X53', 'R-X58'], states: ['deposit by card', 'full by cash', 'with grooming', 'discount not applied note'],
  figma: ['Booking Detail.jpg', 'Booking Detail-3.jpg', 'Frame 1171276427.png', 'Frame 1171276430.png'], checkedAt: W,
  notes: ['Merges the two Estimate variants: Payment Details card AND the card-fee footnote (open question 46).', 'Fidelity part (b), prompt 0012: no stepper on the hotel flow (D-191), #EEF2F5 form tone, CustomerScreenHeader with the #B6B6B6 rule, flat 48 px CTA.'],
});

export const paymentSpec = defineSpec({
  code: 'C-36', tone: 'form', name: 'Hotel: payment',
  purpose: 'Charge the deposit or the full amount with a Stripe-shaped card form through the PaymentProvider (mock today), or record cash at location; then create the booking, its pets, care notes, grooming appointments, invoice, payment and notification.',
  layout: ['HotelBookingFrame ("Choose Payment", no stepper)', 'PaymentMethodRows (RadioGroup cards: Credit card / Pay With Cash At Location, purple radio right)', 'HotelEstimateCard compact (due now, fee, charged now, balance)', 'HotelCardPaymentForm (card) or cash note', 'Footer (Pay / Confirm booking)'],
  data: ['bookings', 'booking_pets', 'booking_pet_care', 'appointments', 'invoices', 'payments', 'notifications', 'customers', 'fees', 'settings', 'vaccine_records', 'vaccine_types'], roles: ROLES,
  logic: ['validateCard(): Luhn, expiry, CVC, name, ZIP; last4 0002 declines in the mock.', 'createPaymentIntent(amountCents, method) then confirm; failure shows the provider error and keeps the draft.', 'initialStatusFor(): requested, or pending_vaccines when any pet is not verified (R-X51, R-A05).', 'Booking code PR-<next>, invoice INV-<next> from existing rows / settings.invoice.next_number (R-H09); invoice balance = total - charged.', 'Grooming appointments: one per pet with booking_id, 09:00 on check-out day, requested (R-X55).', 'Customer row updated with the details from C-34; draft cleared on success.'],
  integrations: ['PaymentProvider (MockPaymentProvider now; StripePaymentProvider + PaymentElement later, no keys)'], components: [...FRAME, 'RadioGroup', 'HotelCardPaymentForm', 'HotelEstimateCard', 'Card', 'Toast'],
  rules: ['R-H01', 'R-H02', 'R-H03', 'R-H09', 'R-X50', 'R-X51', 'R-X55', 'R-X58'], states: ['card', 'cash', 'declined', 'processing'],
  figma: ['Payment-1.png', 'Frame 1171276435.png', 'Frame 1171276427.png'], checkedAt: W,
  notes: ['Fidelity part (b), prompt 0012: no stepper on the hotel flow (D-191), #EEF2F5 form tone, CustomerScreenHeader with the #B6B6B6 rule, flat 48 px CTA.'],
});

export const confirmationSpec = defineSpec({
  code: 'C-37', tone: 'list', name: 'Hotel: confirmation',
  purpose: 'After payment: the booking code, the current status on the lifecycle timeline, what happens next (vaccine proofs, desk confirmation, balance at check-in) and links to the reservation and home.',
  layout: ['Success header (icon, code)', 'BookingStatusTimeline', 'Next steps Card', 'Actions: View reservation, Back to home'],
  data: ['bookings', 'booking_pets', 'pets', 'room_types', 'locations'], roles: ROLES,
  logic: ['pending_vaccines -> call-out to upload proofs (R-A05); requested -> desk confirms (R-I04 Pending verification / Upcoming).'],
  integrations: [], components: [...FRAME, 'BookingStatusTimeline', 'Card', 'Icon'],
  rules: ['R-A05', 'R-I04', 'R-X51'], states: ['requested', 'pending vaccines', 'not found'],
  figma: ['notification.png (Your Hotel Booking is confirmed)'], checkedAt: W,
});

export const reservationsSpec = defineSpec({
  code: 'C-38', tone: 'list', name: 'My reservations',
  purpose: 'Every reservation of the pet parent in one list: hotel stays, Grooming & Spa appointments and daycare days, split into Upcoming and Previous, filterable by kind; tapping a stay opens its detail.',
  layout: ['HotelBookingFrame (title, + New stay)', 'Tabs Upcoming / Previous with counts', 'Kind filter Chips (All / Hotel / Grooming / Daycare)', 'CustomerReservationCard list', 'EmptyState with Book a stay'],
  data: ['bookings', 'booking_pets', 'appointments', 'daycare_bookings', 'pets', 'room_types', 'packages', 'locations', 'invoices'], roles: ROLES,
  logic: ['Upcoming = end (check-out / appointment / day) in the future and status not checked_out / cancelled / no_show; else Previous.', 'Sorted by start ascending (upcoming) / descending (previous).', 'Balance due chip from the invoice when > 0.'],
  integrations: [], components: [...FRAME, 'Tabs', 'Chip', 'CustomerReservationCard', 'EmptyState'],
  rules: ['R-I04', 'R-A06'], states: ['empty', 'upcoming', 'previous', 'filtered'],
  figma: ['Home Page-1.png', 'Home Page.png', 'Frame 1171276434.png'], checkedAt: W,
  notes: ['Grooming and daycare cards have no detail link until their modules register /app/grooming/:id and /app/daycare/:id.'],
});

export const reservationDetailSpec = defineSpec({
  code: 'C-39', tone: 'list', name: 'Reservation detail',
  purpose: 'One stay in full: status timeline, dates, pets with vaccine state and care notes, linked grooming, payment summary with balance, open change requests, and the actions to request a change or cancel.',
  layout: ['HotelBookingFrame (code, status chip, invoice button)', 'StayDatesCard read-only + location', 'BookingStatusTimeline', 'Pets Section (BookingPetCard compact, vaccine chip, care notes)', 'Grooming Section', 'Payment HotelEstimateCard (paid, balance)', 'Change requests Section', 'Sticky footer: Request change / Cancel stay', 'Cancel Modal'],
  data: ['bookings', 'booking_pets', 'booking_pet_care', 'pets', 'vaccine_records', 'vaccine_types', 'room_types', 'locations', 'appointments', 'packages', 'invoices', 'payments', 'booking_change_requests'], roles: ROLES,
  logic: ['Customer may cancel requested / pending_vaccines stays directly (status -> cancelled, approved change request logged); confirmed stays file an open cancel request for the desk (manager PIN there, R-I06); checked_in and later cannot be cancelled here (R-X52).', 'Free-cancellation window from settings.hotel_booking.free_cancellation_hours shown in the modal.', 'Balance = invoice.balance; without an invoice, total - deposit.'],
  integrations: [], components: [...FRAME, 'StayDatesCard', 'BookingStatusTimeline', 'BookingPetCard', 'HotelEstimateCard', 'Section', 'Badge', 'StatusBadge', 'Modal', 'IconButton', 'EmptyState'],
  rules: ['R-A05', 'R-I04', 'R-I06', 'R-X50', 'R-X51', 'R-X52'], states: ['upcoming', 'pending vaccines', 'staying now', 'completed', 'cancelled', 'not found'],
  figma: ['Booking Detail.jpg', 'front desk-5.jpg (booking detail, ported per D-010)'], checkedAt: W,
});

export const invoiceSpec = defineSpec({
  code: 'C-40', tone: 'list', name: 'Reservation invoice',
  purpose: 'Printable invoice for a stay: line items, discounts, tax, card fee, total, deposit paid and balance due, payments made, footer. Print button.',
  layout: ['HotelBookingFrame (back, print)', 'HotelInvoiceView'],
  data: ['invoices', 'payments', 'bookings', 'booking_pets', 'pets', 'customers', 'room_types', 'locations', 'taxes', 'settings'], roles: ROLES,
  logic: ['Falls back to the booking quote when no invoice row exists yet (cash bookings before the desk issues one).', 'Footer and title from settings.invoice (R-H10); tax number from taxes (R-H05).'],
  integrations: [], components: [...FRAME, 'HotelInvoiceView', 'IconButton', 'EmptyState'],
  rules: ['R-H05', 'R-H09', 'R-H10'], states: ['issued with balance', 'paid', 'no invoice yet'],
  figma: ['9.pdf', 'front desk-5.jpg'], checkedAt: W,
});

export const changeRequestSpec = defineSpec({
  code: 'C-41', tone: 'list', name: 'Request a change',
  purpose: 'Ask the front desk to modify a stay: new dates, add or remove a pet, add grooming, or something else, with a message. Creates a booking_change_requests row and notifies the desk at that location.',
  layout: ['HotelBookingFrame (back)', 'Kind RadioGroup', 'Conditional: StayDatesCard (dates) / pet Checkboxes', 'Message Textarea', 'Sticky footer: Send request'],
  data: ['bookings', 'booking_pets', 'pets', 'booking_change_requests', 'notifications', 'users', 'locations', 'settings'], roles: ROLES,
  logic: ['Only for stays that are requested, pending_vaccines or confirmed (R-X52).', 'Modify dates validates like C-30 (R-X54).', 'Staff notification to front_desk users of the booking location.'],
  integrations: [], components: [...FRAME, 'RadioGroup', 'StayDatesCard', 'Checkbox', 'Textarea', 'Card', 'Toast'],
  rules: ['R-X52', 'R-X54'], states: ['modify dates', 'add pet', 'other', 'not allowed'],
  checkedAt: W,
});
