import { defineSpec } from '../../specs/defineSpec';
import { STAFF_ROLES } from '../../auth/roles';

const DESK = STAFF_ROLES.filter((r) => r !== 'groomer');
const W = [360, 390, 768, 1280, 1920];

export const todaySpec = defineSpec({
  code: 'F-01', name: 'Front desk today',
  purpose: 'Run the day at one location: arrivals, departures, in-house and daycare counts, rooms free tonight, balances due and vaccine blockers, then the reservations of the selected day with one-click check-in / check-out (PIN-gated changes open the approval modal).',
  layout: ['PageHeader (location, day navigator, New booking)', 'StatTiles (arriving, departing, in house, daycare, rooms free, pending vaccines, balance due, grooming)', 'NeedsAttention (no room, vaccine issues, balance due today)', 'DayTabs (All / Arriving / Departing / Staying / Daycare / Checked out)', 'ReservationsTable (quick actions)', 'PinApprovalModal'],
  data: ['bookings', 'booking_pets', 'daycare_bookings', 'appointments', 'customers', 'pets', 'rooms', 'room_types', 'vaccine_records', 'vaccine_types', 'booking_events', 'approvals', 'audit_log'], roles: STAFF_ROLES,
  logic: ['bucketOf(row, day) groups rows with dayBucket() (R-I05); daycare days form their own group.', 'Rooms free tonight = availabilityByType(day, day+1) per room type (R-X03).', 'Quick action = natural next transition (Check in / Check out / Confirm); check-in without a room opens the room picker first (R-X05).', 'transitionNeedsPin() decides whether PinApprovalModal opens; every change writes booking_events + audit_log.'],
  integrations: [], components: ['PageHeader', 'ReservationDayNav', 'StatTile', 'Card', 'Tabs', 'DataTable', 'StatusBadge', 'PetVaccineStatus', 'BookingStatusMenu', 'Button', 'IconButton', 'Modal', 'RoomAssignmentPicker', 'PinApprovalModal', 'EmptyState'],
  rules: ['R-I05', 'R-I06', 'R-I01', 'R-I02', 'R-X03', 'R-X05', 'R-K01', 'R-E11', 'R-E12', 'R-A05'], states: ['today', 'other day', 'empty day', 'needs attention', 'PIN approval'], figma: ['front desk-4.jpg', 'Frame 1171276264.png'], checkedAt: W,
});

export const tableSpec = defineSpec({
  code: 'F-10', name: 'Hotel & Daycare reservations (table)',
  purpose: 'The reservations table of the design (18 columns) grouped by Arriving / Departing / Staying / Daycare / Checked out for the selected day, with filters, search, a date navigator and the switch to the Timeline and Board views (D-008). Rows open the booking detail.',
  layout: ['TopLine (view switch, + Hotel Reservation)', 'ReservationsTable (framed DataTable: title, day navigator, Filters popover, See All / By day; one purple head; Arriving / Departing / Staying / Daycare / Checked out group rows; head + row checkboxes)', 'DaycareDrawer'],
  data: ['bookings', 'booking_pets', 'daycare_bookings', 'customers', 'pets', 'rooms', 'room_types', 'vaccine_records', 'vaccine_types'], roles: DESK,
  logic: ['18 design columns: ID, Status, Customer, Hotel room, Date in, Time in, Date out, Time out, Nbr days, Pet(s), Breed, Pet count, Mobile, Home, Total charge, Deposits, Balance, Booking notes.', 'Balance = total - deposits (R-D14).', 'Nbr days = nights for hotel, 1 for daycare.', 'Cancelled and no-show rows hidden unless the toggle is on.'],
  integrations: [], components: ['SegmentedControl', 'ReservationDayNav', 'FilterPopover', 'Select', 'Input', 'Toggle', 'DataTable', 'Checkbox', 'StatusBadge', 'PetVaccineStatus', 'Drawer', 'BookingInfoGrid', 'Button', 'IconButton', 'EmptyState'],
  rules: ['R-I05', 'R-I02', 'R-I01', 'R-D14', 'R-H08', 'R-I08', 'R-K01'], states: ['by day', 'all', 'filtered', 'group collapsed', 'empty group', 'rows selected', 'daycare drawer'], figma: ['front desk.jpg', 'front desk-9.jpg', 'Frame 1171276264-10.png', 'front desk-10.jpg', 'front desk-11.jpg'], checkedAt: W,
});

export const formSpec = defineSpec({
  code: 'F-11', name: 'New / edit board booking',
  purpose: 'Create or edit a hotel stay at the desk from the Board Bookings form: dates and times, customer (or a new one inline) and pets with vaccine state, room type and room with fit rules, additional services, payment terms and the live quote from the pricing engine.',
  layout: ['PageHeader', 'Stay (date in / time in / date out / time out, nights, reminder)', 'Customer & pets (customer select, New customer modal, handler, pet cards with vaccines)', 'Room (room type cards, share room, RoomAssignmentPicker)', 'Additional services (service rows: occurs, M/A/E)', 'Payment (paid in full, card / cash, deposit)', 'Notes (100 chars, include on invoice)', 'Quote (BookingChargeSummary)', 'Footer (Cancel / Save)'],
  data: ['bookings', 'booking_pets', 'booking_services', 'booking_events', 'customers', 'pets', 'employees', 'rooms', 'room_types', 'rates', 'seasons', 'discounts', 'fees', 'taxes', 'services', 'vaccine_records', 'vaccine_types', 'settings'], roles: DESK,
  logic: ['quoteHotel() from rates / seasons / discounts / fees / taxes; services add lines taxed at the service rate; nothing hardcoded.', 'Status on create = confirmed when every pet has all required vaccines verified, else pending_vaccines (R-X04).', 'Room list = rooms of the type free for the dates minus fit failures (R-E09); 55 lb penthouse shows the R-X01 warning.', 'Edit keeps the status; checked-in stays cannot change dates (R-X05).', 'Deposit defaults to 0; paid in full sets deposit = total.'],
  integrations: ['PaymentProvider (deposit recording, mock)'], components: ['PageHeader', 'Section', 'Card', 'Input', 'Select', 'TimePicker', 'Toggle', 'Checkbox', 'RadioGroup', 'Textarea', 'Button', 'Modal', 'Avatar', 'PetVaccineStatus', 'RoomAssignmentPicker', 'BookingChargeSummary', 'Badge', 'EmptyState'],
  rules: ['R-X04', 'R-A05', 'R-A07', 'R-A10', 'R-E09', 'R-X01', 'R-E01', 'R-E04', 'R-H03', 'R-H04', 'R-D16', 'R-J02', 'R-J05', 'R-J06', 'R-I11', 'R-D13', 'R-D17', 'R-X03'], states: ['new', 'edit', 'new customer modal', 'no pets on account', 'no room free', 'saving', 'validation errors'], figma: ['Board Booking.pdf', 'Booking details -1.png', 'Frame 1171276342.png'], checkedAt: W,
});

export const detailSpec = defineSpec({
  code: 'F-12', name: 'Booking detail',
  purpose: 'Everything about one stay in one place: customer, pets with vaccine and medical flags, dates and room, charges and payments, notes, and the actions of the day (check in / out, set status with PIN, assign room, record payment, edit, rebook) plus the activity trail.',
  layout: ['PageHeader (code, StatusBadge, actions)', 'CustomerCard', 'StayCard (BookingInfoGrid)', 'PetsCard (PetVaccineStatus, medication)', 'ChargesCard (BookingChargeSummary, services)', 'PaymentsCard (invoice, payments, record payment)', 'NotesCard', 'ActivityCard (booking_events, approvals)', 'RoomModal', 'PaymentModal', 'PinApprovalModal'],
  data: ['bookings', 'booking_pets', 'booking_services', 'booking_events', 'customers', 'pets', 'employees', 'rooms', 'room_types', 'vaccine_records', 'vaccine_types', 'invoices', 'payments', 'approvals', 'audit_log'], roles: DESK,
  logic: ['Actions come from BOOKING_TRANSITIONS; PIN-gated ones open PinApprovalModal and link the approval to the event (R-I06, R-J08).', 'Check-in needs a room (R-X05).', 'Record payment: PaymentProvider intent -> payments row -> bookings.deposit += amount; balance recomputed (R-H08).', 'Rebook = new booking form prefilled with customer, pets and room type.'],
  integrations: ['PaymentProvider (mock now, Stripe later)'], components: ['PageHeader', 'Card', 'Avatar', 'StatusBadge', 'Badge', 'BookingInfoGrid', 'PetVaccineStatus', 'BookingChargeSummary', 'BookingStatusMenu', 'Button', 'IconButton', 'Textarea', 'Toggle', 'Modal', 'Select', 'Input', 'RoomAssignmentPicker', 'DataTable', 'PinApprovalModal', 'EmptyState'],
  rules: ['R-I06', 'R-I07', 'R-J08', 'R-H08', 'R-D14', 'R-X05', 'R-A05', 'R-A10', 'R-J06', 'R-D16', 'R-P01'], states: ['confirmed', 'checked in', 'checked out', 'cancelled', 'pending vaccines', 'no room', 'balance due', 'not found'], figma: ['front desk-5.jpg', 'front desk-8.jpg', 'all reservation grooming-2.jpg'], checkedAt: W,
});

export const timelineSpec = defineSpec({
  code: 'F-13', name: 'Room timeline',
  purpose: 'Rooms as rows, days as columns, stays as blocks coloured by status: see occupancy at a glance, spot vaccine and balance flags, move a stay to another room or day by dragging, and act on a stay from its popover.',
  layout: ['TopLine (view switch, New Booking)', 'TimelineBar (range pill centred; 1 / 2 weeks + Filter popover right: room type, status, unassigned, daycare, cancelled)', 'RoomTimeline (Unassigned, Penthouses, Suites, Daycare groups; alternating day columns, TODAY pill, flat status blocks)', 'BlockPopover (summary, Open, Set status, Assign room)', 'MoveModal', 'RoomModal', 'PinApprovalModal'],
  data: ['bookings', 'booking_pets', 'daycare_bookings', 'customers', 'pets', 'rooms', 'room_types', 'vaccine_records', 'vaccine_types', 'booking_events', 'approvals'], roles: DESK,
  logic: ['Block = [check-in day, check-out day) starting at the check-in half-day; same-day stays take one cell.', 'Colour from booking status tokens (R-I09); flags: vaccine issue, balance due, notes, medication.', 'Drop onto (room, day): nights kept, target room must be the booked type, fit the heaviest dog (R-E09) and be free (R-X03); confirmed in a modal, logged as a booking event (R-X07).', 'Empty cell click starts a new booking for that room and day.'],
  integrations: [], components: ['SegmentedControl', 'ReservationDayNav', 'FilterPopover', 'Select', 'Toggle', 'RoomTimeline', 'StatusBadge', 'Badge', 'PetVaccineStatus', 'BookingStatusMenu', 'Button', 'Modal', 'RoomAssignmentPicker', 'PinApprovalModal', 'EmptyState'],
  rules: ['R-I09', 'R-I01', 'R-I07', 'R-X07', 'R-X03', 'R-E09', 'R-I06', 'R-X05'], states: ['week', 'two weeks', 'today in view', 'popover open', 'dragging', 'move confirm', 'filtered', 'phone scroll'], figma: ['all reservation grooming-1.jpg', 'all reservation grooming-2.jpg', 'all reservation grooming-3.jpg', 'all reservation grooming.jpg'], checkedAt: W,
});

export const boardSpec = defineSpec({
  code: 'F-14', name: 'Grooming & Spa board',
  purpose: 'Kanban of the day\'s (or week\'s) Grooming & Spa appointments by status - requested, confirmed, in progress, done, cancelled / no show. Drag cards to move them through the day; cancelling or no-show needs a manager PIN. Cards open a drawer with the appointment.',
  layout: ['PageHeader (view switch, day navigator, Day / Week)', 'StatTiles (appointments, in progress, done, booked revenue)', 'FilterBar (groomer, package)', 'AppointmentBoard', 'AppointmentDrawer (pet, customer, package, add-ons, groomer, price, vaccines, notes, status select)', 'CancelModal (cancelled vs no show)', 'PinApprovalModal'],
  data: ['appointments', 'customers', 'pets', 'employees', 'packages', 'addons', 'bookings', 'vaccine_records', 'vaccine_types', 'approvals', 'audit_log'], roles: DESK,
  logic: ['Columns = APPOINTMENT_STATUS with cancelled + no_show merged into one locked column.', 'Move to cancelled / no_show -> PinApprovalModal (R-X06); other moves update appointments.status directly and log audit_log.', 'Card accent = groomer colour (R-L02); price and minutes come from the appointment quote (packages + add-ons).'],
  integrations: [], components: ['PageHeader', 'SegmentedControl', 'ReservationDayNav', 'StatTile', 'Select', 'AppointmentBoard', 'Badge', 'Avatar', 'Drawer', 'BookingInfoGrid', 'PetVaccineStatus', 'Button', 'Modal', 'RadioGroup', 'PinApprovalModal', 'EmptyState'],
  rules: ['R-X06', 'R-I06', 'R-G01', 'R-G10', 'R-E10', 'R-L02', 'R-I01'], states: ['day', 'week', 'filtered by groomer', 'drawer open', 'cancel modal', 'PIN approval', 'empty'], figma: ['Grooming.png', 'all reservation grooming-3.jpg'], checkedAt: W,
});

export const availabilitySpec = defineSpec({
  code: 'F-15', name: 'Quick availability check',
  purpose: 'Answer the phone question in ten seconds: for these dates, this many dogs and this weight, which room types have rooms free, do the fit rules allow it, what would it cost, and how full are the next two weeks.',
  layout: ['PageHeader', 'QueryCard (check-in, check-out, dogs, heaviest dog or pick a customer\'s pets, paid in full, card)', 'ResultCards per room type (free / total, bottom rooms, fit warnings, quote, Book this)', 'DaycareCapacity (check-in day)', 'OccupancyTable (next 14 days per type)'],
  data: ['bookings', 'daycare_bookings', 'rooms', 'room_types', 'capacities', 'customers', 'pets', 'rates', 'seasons', 'discounts', 'fees', 'taxes'], roles: DESK,
  logic: ['availabilityByType() (R-X03): free = active rooms - rooms occupied on any night - unassigned overlapping bookings.', 'Fit: over 30 lb needs bottom penthouse rooms (R-E09); 55 lb+ in a penthouse shows the R-X01 warning.', 'Daycare free = capacity - daycare bookings on the day (hotel guests not deducted, R-E14 working answer).', 'Quote = quoteHotel() for the chosen inputs; Book this opens F-11 prefilled.'],
  integrations: [], components: ['PageHeader', 'Card', 'Input', 'Select', 'Toggle', 'Button', 'Badge', 'BookingInfoGrid', 'BookingChargeSummary', 'DataTable', 'EmptyState'],
  rules: ['R-X03', 'R-E09', 'R-X01', 'R-E11', 'R-E12', 'R-E13', 'R-E14', 'R-D05', 'R-E01', 'R-E04'], states: ['default (tonight, 1 dog)', 'no rooms free', 'fit warning', 'customer pets picked'], figma: ['front desk-7.jpg (capacities)', 'Choose Your Room.png'], checkedAt: W,
});
