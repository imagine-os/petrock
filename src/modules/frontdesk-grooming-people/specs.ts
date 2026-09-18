/** PageSpecs for F-30..F-59 (frontdesk-grooming-people). The builder tool shows these on every page. */
import { defineSpec } from '../../specs/defineSpec';
import type { Role } from '../../auth/roles';

const STAFF: Role[] = ['super_admin', 'owner', 'manager', 'front_desk', 'groomer'];
const DESK: Role[] = ['super_admin', 'owner', 'manager', 'front_desk'];
const CHECKED = [360, 390, 768, 1280, 1920];

export const dayViewSpec = defineSpec({
  code: 'F-30', name: 'Grooming day view', purpose: 'Run the grooming day at one location: groomer columns tinted by working hours, appointments by time, flags for vaccines / payment / unconfirmed, column order-colour-hide per user, click a slot to book, drag to reschedule.',
  layout: ['PageHeader (title, New groom booking)', 'GroomingDateNav + filters (groomer, status) + view toggle (Day / Board / Agenda)', 'GroomDayGrid (time x groomers, now line, capacity shading)', 'Legend + hidden columns chips'],
  data: ['appointments', 'appointment_extras', 'employees', 'groomer_column_prefs', 'customers', 'pets', 'vaccine_records', 'vaccine_types', 'packages', 'capacities', 'locations'], roles: STAFF,
  logic: ['Card label R-G20 "Owner Last, PET; Breed; Package Size"', 'Vaccine flag from petVaccineSummary (R-A11)', 'Grid hours from location hours ±1h; column tint from employees.working_hours', 'Over-capacity rows when overlaps > capacities.grooming (R-G21)', 'Column prefs upsert to groomer_column_prefs per user + location (R-X32)', 'Drag / slot click writes appointments.starts_at + groomer_id (audit)'],
  integrations: [], components: ['PageHeader', 'GroomingDateNav', 'SegmentedControl', 'Select', 'Chip', 'Button', 'GroomDayGrid', 'GroomAppointmentCard', 'Badge', 'PetVaccineChip', 'EmptyState'],
  rules: ['R-G20', 'R-G21', 'R-A11', 'R-X32', 'R-G10', 'R-G17', 'R-E10', 'R-J08'], states: ['loading (snapshot)', 'no groomers at location', 'all columns hidden', 'over capacity', 'groomer off today', 'unassigned column'],
  figma: ['Grooming.png', 'Grooming-1.png'], checkedAt: CHECKED, notes: ['Replaces the F-30 stub at /desk/grooming.', 'Phones: horizontal scroll with sticky time column (D-016).'],
});
export const boardSpec = defineSpec({
  code: 'F-31', name: 'Grooming board', purpose: 'Kanban of the day\'s appointments by status (requested, confirmed, in progress, done, cancelled / no show) with drag or "Move to" transitions, PIN-gated where the lifecycle says so.',
  layout: ['PageHeader', 'GroomingDateNav + groomer filter + view toggle', 'GroomStatusBoard (5 columns)', 'PinApprovalModal'],
  data: ['appointments', 'employees', 'customers', 'pets', 'packages', 'vaccine_records', 'vaccine_types', 'approvals', 'audit_log'], roles: STAFF,
  logic: ['Allowed moves from APPOINTMENT_TRANSITIONS (mirror of the booking lifecycle)', 'confirmed -> cancelled / no_show and re-open need a manager PIN (R-X33)', 'Every move writes audit_log (R-J08)'],
  integrations: [], components: ['PageHeader', 'GroomingDateNav', 'SegmentedControl', 'Select', 'GroomStatusBoard', 'GroomAppointmentCard', 'PinApprovalModal', 'Toast'],
  rules: ['R-X33', 'R-I06', 'R-J08', 'R-G20', 'R-I01'], states: ['empty day', 'drag over', 'PIN modal', 'collapsed columns'], checkedAt: CHECKED, notes: ['D-008: Spa gets Table + Board; no Figma board existed, designed fresh.'],
});
export const agendaSpec = defineSpec({
  code: 'F-32', name: 'Grooming agenda list', purpose: 'Table of the day\'s grooming appointments (Time, Groomer, Status flags, Agenda with package + add-on line items, Payment, Total) with filters and a date navigator.',
  layout: ['PageHeader', 'GroomingDateNav + Filters (groomer, status, payment) + view toggle', 'DataTable (agenda rows with line items)', 'Totals footer'],
  data: ['appointments', 'appointment_extras', 'employees', 'customers', 'pets', 'packages', 'addons', 'fees', 'taxes', 'vaccine_records', 'vaccine_types'], roles: STAFF,
  logic: ['Line items recomputed by quoteForAppointment from packages / addons / fees / taxes (never hardcoded)', 'Status flag icons: warning (requested / note), coin (payment pending), cross (vaccine issue)', 'Day totals = sum of totals excluding cancelled / no-show'],
  integrations: [], components: ['PageHeader', 'GroomingDateNav', 'SegmentedControl', 'DataTable', 'GroomStatusBadge', 'PetVaccineChip', 'Badge', 'Icon', 'Button'],
  rules: ['R-A11', 'R-G01', 'R-G11', 'R-H04', 'R-H03'], states: ['empty day', 'filtered', 'phone card layout'], figma: ['Frame 1171276264-11.png', 'front desk-12.jpg', 'front desk-14.jpg'], checkedAt: CHECKED,
});
export const bookingFormSpec = defineSpec({
  code: 'F-33', name: 'Groom booking form', purpose: 'Create or edit a Grooming & Spa appointment at the desk: date, time, groomer, customer (+ New customer), one or more pets with vaccine status, package priced by size, add-ons, discount (PIN), payment method, invoice preview, note.',
  layout: ['PageHeader (back)', 'When: DatePicker, TimePicker, duration (computed, editable), reminder, pickup / delivery', 'Customer & pets: customer Select + New customer, pet chips with PetVaccineChip + attributes, groomer Select', 'Package (RadioGroup cards by size) + add-ons (Checkbox list)', 'Invoice: lines, discount %, payment method, totals', 'Note + include on invoice', 'Footer: Cancel / Save', 'PinApprovalModal (discount)'],
  data: ['appointments', 'appointment_extras', 'customers', 'pets', 'pet_profiles', 'employees', 'packages', 'addons', 'fees', 'taxes', 'vaccine_records', 'vaccine_types', 'capacities', 'approvals', 'audit_log', 'notifications'], roles: DESK,
  logic: ['Duration = package minutes by size + add-on minutes (R-G10, R-G13); default 1 h when no package (R-G17)', 'Quote via quoteGrooming (packages, addons, taxes, card fee)', 'Discount > 0 opens PinApprovalModal action discount.apply (R-X34)', 'One appointment row per pet (R-G16)', 'Status: confirmed when vaccines OK, requested otherwise', 'Capacity warning when overlaps >= capacities.grooming (R-G21)', 'New customer returns via ?return= with the new id (R-J05)'],
  integrations: ['PaymentProvider (later: take deposit)'], components: ['PageHeader', 'Section', 'DatePicker', 'TimePicker', 'Input', 'Select', 'Checkbox', 'Chip', 'RadioGroup', 'Textarea', 'Button', 'Card', 'PetVaccineChip', 'Badge', 'PinApprovalModal', 'Toast'],
  rules: ['R-G01', 'R-G10', 'R-G13', 'R-G16', 'R-G17', 'R-G21', 'R-X34', 'R-J05', 'R-J06', 'R-I11', 'R-J02', 'R-J03', 'R-A11', 'R-H03', 'R-H04'], states: ['new', 'edit', 'no customer chosen', 'pet with vaccine issue', 'over capacity', 'PIN for discount', 'validation errors'],
  figma: ['Groom Booking .pdf', 'Booking details .png'], checkedAt: CHECKED, notes: ['Recurrence (legacy) not built: R-G18 requested.'],
});
export const appointmentDetailSpec = defineSpec({
  code: 'F-34', name: 'Grooming appointment detail', purpose: 'Read one appointment like the Figma booking detail: customer card, pet, status and payment, date / time / groomer, note, line items and total; change status (PIN where gated), edit, message the customer, open the invoice.',
  layout: ['PageHeader (back, Edit, Invoice)', 'CustomerSummaryCard with pet + status', 'Info card: Date, Time, Groomer, Payment status, Contact, Reason', 'Additional information (note) + Your appointment (line items, tax, fee, total)', 'Status actions', 'PinApprovalModal'],
  data: ['appointments', 'appointment_extras', 'customers', 'pets', 'employees', 'packages', 'addons', 'fees', 'taxes', 'vaccine_records', 'vaccine_types', 'invoices', 'approvals', 'audit_log'], roles: STAFF,
  logic: ['Lines from quoteForAppointment (stored total shown when it differs)', 'Transitions from APPOINTMENT_TRANSITIONS; PIN per R-X33', 'Audit on every change (R-J08)'],
  integrations: [], components: ['PageHeader', 'CustomerSummaryCard', 'Card', 'GroomStatusBadge', 'Badge', 'PetVaccineChip', 'Button', 'PinApprovalModal', 'Toast', 'EmptyState'],
  rules: ['R-I03', 'R-X33', 'R-J08', 'R-A11', 'R-G01', 'R-H04'], states: ['not found', 'each status', 'PIN modal', 'invoice exists / preview'], figma: ['front desk-5.jpg', 'front desk-8.jpg'], checkedAt: CHECKED,
});
export const customersSpec = defineSpec({
  code: 'F-50', name: 'Customers', purpose: 'Find any pet parent: searchable table with pets, phone, email, home location, balance and status; add a customer; open the detail.',
  layout: ['PageHeader (Add customer)', 'StatTiles (customers, with balance due, new this month)', 'DataTable (search, filters: location, status, balance)'],
  data: ['customers', 'customer_profiles', 'pets', 'locations'], roles: STAFF,
  logic: ['Default filter = current location (home_location_id) unless all-locations mode', 'Balance due tile sums customers.balance > 0'], integrations: [],
  components: ['PageHeader', 'StatTile', 'DataTable', 'Avatar', 'Badge', 'Button'], rules: ['R-J07', 'R-K05'], states: ['empty search', 'phone cards', 'all locations'], figma: ['Frame.png (list behind the modal)'], checkedAt: CHECKED,
});
export const customerFormSpec = defineSpec({
  code: 'F-51', name: 'Add / edit customer', purpose: 'The Figma Customer Details form: identity, address, contacts, preferred contact, reference, attributes, note (100 chars) and attachment; validates the required fields.',
  layout: ['PageHeader (back)', 'Identity: title, first, last, status', 'Address: address, town/city (+), state, zip', 'Contacts: mobile, email, home, work, alt phone, alt contact', 'Preferences: preferred contact, reference (+), attributes (+), home location, marketing opt-in', 'Note (0/100) + attachment dropzone', 'Footer Cancel / Add customer'],
  data: ['customers', 'customer_profiles', 'lookup_values', 'attachments', 'locations', 'audit_log'], roles: DESK,
  logic: ['Required: first, last, city, state, mobile, email (R-J01)', 'Defaults: active, mobile contact, since today, marketing on (R-J07)', 'Lookups extendable inline (R-J04)', '?return= sends the new id back to the caller (R-J05)'],
  integrations: ['File storage (later)'], components: ['PageHeader', 'Section', 'Input', 'Select', 'DeskLookupSelect', 'Checkbox', 'Textarea', 'DeskAttachmentDropzone', 'Button', 'Toast'],
  rules: ['R-J01', 'R-J02', 'R-J04', 'R-J05', 'R-J07', 'R-J11'], states: ['new', 'edit', 'validation errors', 'adding lookup value'], figma: ['Customer Details.pdf', 'Frame.png', 'Amenities.png'], checkedAt: CHECKED,
});
export const customerDetailSpec = defineSpec({
  code: 'F-52', name: 'Customer detail', purpose: 'Everything about one pet parent: contact card with balance, pets with vaccine standing, hotel bookings, grooming appointments, daycare days, invoices, notes timeline; edit, add pet, message, deactivate (PIN).',
  layout: ['PageHeader (back, Edit, Message, Add pet)', 'CustomerSummaryCard', 'Tabs: Pets / Bookings / Grooming / Daycare / Invoices / Notes', 'Tab content (cards or DataTable)', 'PinApprovalModal (deactivate)'],
  data: ['customers', 'customer_profiles', 'pets', 'vaccine_records', 'vaccine_types', 'bookings', 'booking_pets', 'appointments', 'daycare_bookings', 'invoices', 'customer_notes', 'conversations', 'attachments', 'approvals', 'audit_log'], roles: STAFF,
  logic: ['Balance = customers.balance + unpaid invoice balances', 'Deactivate = soft delete with PIN record.delete (R-X38)', 'Notes: add, pin'], integrations: [],
  components: ['PageHeader', 'CustomerSummaryCard', 'Tabs', 'Card', 'DataTable', 'StatusBadge', 'GroomStatusBadge', 'PetVaccineChip', 'Badge', 'Textarea', 'Button', 'EmptyState', 'PinApprovalModal', 'Toast'],
  rules: ['R-X38', 'R-A11', 'R-J02', 'R-I01'], states: ['not found', 'no pets', 'balance due', 'inactive customer'], checkedAt: CHECKED,
});
export const petsSpec = defineSpec({
  code: 'F-53', name: 'Pets', purpose: 'All pets with owner, breed, size / weight, approval and vaccine standing; filters for pending approval and vaccine issues; add a pet.',
  layout: ['PageHeader (Add pet)', 'StatTiles (pets, pending approval, vaccine issues)', 'DataTable'],
  data: ['pets', 'customers', 'vaccine_records', 'vaccine_types', 'locations'], roles: STAFF,
  logic: ['Vaccine standing per pet via petVaccineSummary (R-A11)', 'Size from weight when missing (sizeFromWeightLbs)'], integrations: [],
  components: ['PageHeader', 'StatTile', 'DataTable', 'Avatar', 'Badge', 'PetVaccineChip', 'Button'], rules: ['R-A11', 'R-A04', 'R-B11', 'R-G01'], states: ['filtered to issues', 'phone cards'], figma: ['Frame-1.png (list behind the modal)'], checkedAt: CHECKED,
});
export const petFormSpec = defineSpec({
  code: 'F-54', name: 'Add / edit pet', purpose: 'The Figma Pet Details form: owner, identity (id read-only), breed (+) / mixed, size, sex, weight, colour (+), temper, DOB / approximate, vet (+), registration and microchip, attributes, the vaccination table with certificate upload, note, attachment.',
  layout: ['PageHeader (back)', 'Owner + identity row', 'Traits row', 'Dates + vet + ids row', 'Vaccination table (type, vaccinated, expires, reference, certificate)', 'Note (0/100) + attachment', 'Footer Cancel / Add pet'],
  data: ['pets', 'pet_profiles', 'customers', 'vets', 'vaccine_types', 'vaccine_records', 'lookup_values', 'attachments', 'audit_log'], roles: DESK,
  logic: ['Required: owner, name, type, sex (R-C01)', 'Size auto from weight (working bands) unless overridden', 'Expiry defaults to vaccinated + 1 year', 'Certificate + dates by a verifier = verified; dates only = submitted; none = missing (R-X35)', 'Approval status recomputed from required vaccines'], integrations: ['File storage (later)'],
  components: ['PageHeader', 'Section', 'Input', 'Select', 'DeskLookupSelect', 'Checkbox', 'DatePicker', 'Textarea', 'DeskAttachmentDropzone', 'Badge', 'Button', 'Toast'],
  rules: ['R-C01', 'R-C06', 'R-B03', 'R-B08', 'R-J04', 'R-J02', 'R-X35', 'R-A13'], states: ['new', 'edit', 'owner preselected (?customer=)', 'validation errors'], figma: ['Pet Details .pdf', 'Frame-1.png'], checkedAt: CHECKED,
});
export const petDetailSpec = defineSpec({
  code: 'F-55', name: 'Pet detail & vaccine verification', purpose: 'One pet: profile, owner, care and medical, staff attributes, and the vaccine table where staff verify or reject uploads; verifying every required vaccine approves the pet and confirms its pending bookings.',
  layout: ['PageHeader (back, Edit, Book groom)', 'Pet header card (avatar, breed, size, age, approval, PetVaccineChip)', 'Owner CustomerSummaryCard', 'Vaccines: PetVaccineVerifyTable + result banner', 'Profile / care / medical facts', 'Bookings + appointments for this pet', 'Reject reason Modal, dates Modal, PinApprovalModal (deactivate)'],
  data: ['pets', 'pet_profiles', 'customers', 'vets', 'vaccine_records', 'vaccine_types', 'bookings', 'booking_pets', 'daycare_bookings', 'appointments', 'attachments', 'notifications', 'approvals', 'audit_log'], roles: STAFF,
  logic: ['verifyVaccineRecord -> settleVaccineStatus: approve pet + confirm pending_vaccines bookings whose pets are all approved (R-X30)', 'Reject asks a reason and notifies the customer (R-X31)', 'Expired records flagged even when verified (R-B11)', 'Deactivate = PIN + soft delete (R-X38)'], integrations: [],
  components: ['PageHeader', 'Card', 'Avatar', 'Badge', 'PetVaccineChip', 'CustomerSummaryCard', 'PetVaccineVerifyTable', 'DeskAttachmentDropzone', 'StatusBadge', 'GroomStatusBadge', 'Modal', 'Textarea', 'DatePicker', 'Button', 'PinApprovalModal', 'Toast', 'EmptyState'],
  rules: ['R-X30', 'R-X31', 'R-B01', 'R-B02', 'R-B03', 'R-B11', 'R-A05', 'R-A13', 'R-X38', 'R-J08'], states: ['not found', 'pending approval', 'approved', 'reject modal', 'bookings confirmed banner'], figma: ['Pet Details .pdf', 'Choose Vaccine.png'], checkedAt: CHECKED,
});
export const vaccineQueueSpec = defineSpec({
  code: 'F-56', name: 'Vaccine verification queue', purpose: 'Every submitted proof waiting for staff, plus expired / rejected records, across pets at the location: verify or reject inline, jump to the pet.',
  layout: ['PageHeader', 'StatTiles (to verify, expired, missing on upcoming bookings)', 'Tabs: To verify / Expired / Rejected / All', 'PetVaccineVerifyTable (pet + owner columns)', 'Reject Modal'],
  data: ['vaccine_records', 'vaccine_types', 'pets', 'customers', 'bookings', 'booking_pets', 'notifications', 'audit_log'], roles: DESK,
  logic: ['Location scope through the customer\'s home location (records are global)', 'Same verify / reject chain as F-55 (R-X30, R-X31)'], integrations: [],
  components: ['PageHeader', 'StatTile', 'Tabs', 'PetVaccineVerifyTable', 'Modal', 'Textarea', 'Button', 'Toast'], rules: ['R-X30', 'R-X31', 'R-B01', 'R-B11', 'R-A05'], states: ['empty queue', 'verified toast with confirmed bookings'], checkedAt: CHECKED,
});
export const messagesSpec = defineSpec({
  code: 'F-57', name: 'Staff messages inbox', purpose: 'Front Desk chat with customers: thread list (search, unread, assignee), conversation with reply, assign to a colleague, close / reopen, quick links to the customer and pets. Marks messages read on open.',
  layout: ['PageHeader', 'Filter Tabs (Mine / Unassigned / All / Closed)', 'Two panes: DeskChatThreadList | DeskChatThread (stacked on phones)', 'Thread actions: assign Select, close / reopen, open customer'],
  data: ['conversations', 'messages', 'conversation_assignments', 'customers', 'users', 'employees', 'notifications'], roles: STAFF,
  logic: ['Open thread marks customer messages read and zeroes unread_staff', 'Reply inserts messages (sender staff), updates last_preview / last_message_at, bumps unread_customer and notifies the customer user', 'Assign upserts conversation_assignments (R-X36)', 'Relative timestamps (R-M08)'], integrations: ['Push / SMS delivery (later)'],
  components: ['PageHeader', 'Tabs', 'DeskChatThreadList', 'DeskChatThread', 'Select', 'Button', 'Badge', 'EmptyState', 'Toast'], rules: ['R-M08', 'R-M09', 'R-M11', 'R-X36'], states: ['no conversation selected', 'closed conversation', 'phone: list or thread'], figma: ['message-1.jpg'], checkedAt: CHECKED, notes: ['D-018: improved beyond Figma (assignment, close, filters); voice / video dropped (R-M11 requested).'],
});
export const notificationsSpec = defineSpec({
  code: 'F-58', name: 'Staff notifications', purpose: 'Notifications for the signed-in staff user (vaccine proofs, new app bookings, messages, approvals): unread first, mark read on open, mark all read, follow the link.',
  layout: ['PageHeader (Mark all read)', 'Tabs: Unread / All', 'StaffNotificationItem list grouped by day'],
  data: ['notifications'], roles: STAFF,
  logic: ['Rows where user_id = session user', 'Open = mark read + navigate to link', 'Relative time (R-M08)'], integrations: ['Push (later)'],
  components: ['PageHeader', 'Tabs', 'Card', 'StaffNotificationItem', 'Button', 'EmptyState'], rules: ['R-M07', 'R-M08'], states: ['all read', 'unread'], figma: ['notification.png'], checkedAt: CHECKED, notes: ['Replaces the F-60 stub at /desk/notifications (the TopBar bell links here). Kept in the F-5x range; the extras module should not rebuild it.'],
});
export const invoiceSpec = defineSpec({
  code: 'F-59', name: 'Invoice view & print', purpose: 'Printable invoice for a hotel booking, grooming appointment or daycare day: issued invoice from the invoices table or a live preview from the pricing engine, with Create invoice, Mark paid and Print.',
  layout: ['PageHeader (back, actions: Create invoice / Mark paid / Print)', 'DeskInvoiceSheet', 'Payments on this invoice'],
  data: ['invoices', 'payments', 'bookings', 'booking_pets', 'appointments', 'appointment_extras', 'daycare_bookings', 'customers', 'pets', 'employees', 'locations', 'packages', 'addons', 'fees', 'taxes', 'settings'], roles: STAFF,
  logic: [':id = invoice id, or a booking / appointment / daycare id (preview when no invoice exists)', 'Preview lines: booking.quote JSON or quoteForAppointment', 'Create invoice numbers from settings.invoice.next_number (R-X37)', 'Mark paid writes a payments row through the payment method and sets invoice + source payment_status paid (payments.write)'], integrations: ['PaymentProvider (Stripe later)'],
  components: ['PageHeader', 'DeskInvoiceSheet', 'Button', 'Badge', 'DataTable', 'EmptyState', 'Toast'], rules: ['R-X37', 'R-J06', 'R-H03', 'R-H04', 'R-H05', 'R-J03'], states: ['issued', 'paid', 'preview (not issued)', 'not found', 'print'], figma: ['front desk-5.jpg', 'front desk-8.jpg', '9.pdf'], checkedAt: CHECKED,
});
