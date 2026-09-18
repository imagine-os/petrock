import { defineSpec } from '../../specs/defineSpec';
import type { Role } from '../../auth/roles';

const ROLES: Role[] = ['customer', 'super_admin'];
const W = [360, 390, 768, 1280, 1920];
const PRICING = ['packages', 'addons', 'fees', 'taxes'];

export const groomingStartSpec = defineSpec({
  code: 'C-50', tone: 'list', name: 'Grooming & Spa', purpose: 'Entry point of the Grooming & Spa service for a pet parent: what it is, live price menu by package and size, spa add-ons, upcoming orders, and the Book now call to action (D-004 / D-011: one service, Spa is a package category).',
  layout: ['PageHeader (back to home)', 'Hero (Book now)', 'Upcoming orders (GroomingOrderCard x3)', 'Packages price menu (GroomingPriceMenu)', 'Spa add-ons chips', 'EmptyState / past orders link', 'NoPetsModal (R-A01)'],
  data: ['grooming_orders', 'appointments', 'packages', 'addons', 'pets', 'locations', 'employees', 'customers'], roles: ROLES,
  logic: ['Customer = customers.user_id == session user (super admin falls back to the demo customer).', 'Upcoming = orders in requested / pending_vaccines / confirmed / checked_in starting later than 3 h ago, first 3.', 'Price menu highlights the first pet\'s size tier (sizeFromWeightLbs).', 'Book now with zero pets opens the Add-a-pet modal; otherwise resets the grooming draft and opens C-51.'],
  integrations: [], components: ['PageHeader', 'Button', 'Card', 'Chip', 'Icon', 'EmptyState', 'GroomingPriceMenu', 'GroomingOrderCard', 'Modal'],
  rules: ['R-G01', 'R-G02', 'R-G04', 'R-G03', 'R-G05', 'R-G06', 'R-G11', 'R-G22', 'R-A01', 'R-A09'], states: ['no pets', 'no upcoming', 'upcoming orders', 'dark'],
  figma: ['Home Page-1.png (Spa tile)', 'Spa 12.7 2.png'], checkedAt: W, notes: ['Reached from the Home service tile (C-10) at /app/grooming.'],
});
export const groomingPetPackageSpec = defineSpec({
  code: 'C-51', tone: 'form', name: 'Choose pet & package', purpose: 'Step 1 of the Grooming & Spa order: pick the pet and the package; prices are the package table values for that pet\'s size tier.',
  layout: ['PageHeader + Stepper (1/4)', 'PetChoiceStrip (single select, other pets in the order disabled)', 'Vaccine notice (R-A05 / R-A11)', 'Package list (GroomingPackageCard x3)', 'ServiceFlowFooter (Next)'],
  data: ['pets', 'vaccine_records', 'vaccine_types', 'packages', 'customers'], roles: ROLES,
  logic: ['Draft item = { petId, packageId, addonIds } stored in localStorage petrock.draft.grooming; current index points at the pet being configured.', 'Price = packagePrice(pkg, pet.sizeTier); minutes = packageMinutes.', 'Pets already in the order cannot be chosen twice.', 'Next enabled when pet and package are set.'],
  integrations: [], components: ['PageHeader', 'Stepper', 'PetChoiceStrip', 'GroomingPackageCard', 'ServiceFlowFooter', 'EmptyState', 'Button'],
  rules: ['R-G01', 'R-G02', 'R-G04', 'R-G06', 'R-G03', 'R-G05', 'R-G14', 'R-A05', 'R-A11', 'R-A01'], states: ['no pet selected', 'pet + package selected', 'pet with pending vaccines', 'pet 2 of N'],
  figma: ['Frame 1171276428.png'], checkedAt: W,
});
export const groomingAddonsSpec = defineSpec({
  code: 'C-52', tone: 'form', name: 'Add-ons', purpose: 'Step 2: toggle spa add-ons for the current pet (price and added minutes by size), see the running total, and add another pet to the same order.',
  layout: ['PageHeader + Stepper (2/4)', 'Other pets in the order (Chips, removable)', 'Add-on list (GroomingAddonRow per active add-on)', 'Starting-price notice', 'ServiceFlowFooter (Groom another pet | Next, running subtotal)'],
  data: ['addons', 'packages', 'pets', 'fees', 'taxes'], roles: ROLES,
  logic: ['addedMinutes = added_minutes_l for L/XL/Giant, else added_minutes_sm (R-G13).', 'Running subtotal = quoteOrder(items) before tax.', '"Groom another pet" appends an empty item and returns to C-51 when a pet is still unbooked (R-G16).', 'Redirects to C-51 when the current item has no pet or package.'],
  integrations: [], components: ['PageHeader', 'Stepper', 'Chip', 'GroomingAddonRow', 'ServiceFlowFooter'],
  rules: ['R-G11', 'R-G08', 'R-G12', 'R-G13', 'R-G16', 'R-G14'], states: ['no add-ons', 'add-ons on', 'multi-pet order', 'restricted add-on'],
  figma: ['Frame 1171276429.png'], checkedAt: W,
});
export const groomingTimeSpec = defineSpec({
  code: 'C-53', tone: 'form', name: 'Choose date & time', purpose: 'Step 3: location, date, groomer and start time. Slots come from location hours, grooming capacity and existing appointments; the Figma export had no slot screen (open question 54) so this is designed fresh.',
  layout: ['PageHeader + Stepper (3/4)', 'Location chips + address', 'DatePicker (closed days disabled, 90-day window)', 'Groomer select (any / named groomer at that location)', 'Day card: hours + GroomingSlotPicker', 'Notes for the groomer (100 chars)', 'ServiceFlowFooter (Next)'],
  data: ['locations', 'employees', 'capacities', 'appointments', 'packages', 'addons'], roles: ROLES,
  logic: ['orderMinutes = longest per-pet chair time (pets are groomed in parallel up to capacity).', 'computeSlots(): 30-min steps from open to close - orderMinutes; a slot is unavailable when for any 15-min step booked appointments + pets in the order > capacities.grooming, or the chosen groomer is busy; today\'s past times are "Too soon" (R-X15, R-G21).', 'Changing location or groomer clears the chosen time.'],
  integrations: [], components: ['PageHeader', 'Stepper', 'Chip', 'DatePicker', 'Select', 'Card', 'GroomingSlotPicker', 'Textarea', 'ServiceFlowFooter'],
  rules: ['R-X15', 'R-G21', 'R-E10', 'R-G17', 'R-G13', 'R-K02', 'R-J02'], states: ['no date', 'open day with slots', 'closed day', 'all slots taken', 'specific groomer'],
  figma: ['Grooming.png (day view as reference)'], checkedAt: W,
});
export const groomingCheckoutSpec = defineSpec({
  code: 'C-54', tone: 'form', name: 'Summary & payment', purpose: 'Step 4: review when / where / who, per-pet package and add-ons, pick card or pay at location, see engine totals (tax, card fee) and pay. Creates the order, appointments, invoice, payment and notification.',
  layout: ['PageHeader + Stepper (4/4)', 'When / where / groomer / duration card', 'Per-pet cards (GroomingPackageCard compact + add-on lines)', 'Vaccine notice', 'ServicePayMethod (card fields or Stripe mount | pay at location)', 'ServiceQuoteLines', 'ServiceFlowFooter (Pay $X)'],
  data: ['grooming_orders', 'appointments', 'invoices', 'payments', 'notifications', ...PRICING, 'locations', 'employees', 'pets'], roles: ROLES,
  logic: ['quoteOrder(): one quoteGrooming per pet (package for size + add-ons), service tax on the sum, card fee only for card (R-H03, R-H04, R-G15).', 'PaymentProvider.createPaymentIntent for card; last4 0002 declines (mock).', 'Status: vaccines missing -> pending_vaccines; card paid -> confirmed; pay at location -> requested (R-A05).', 'Writes grooming_orders, one appointments row per pet, invoices (+ payments when card), notifications; clears the draft; opens C-55 with ?new=1.'],
  integrations: ['PaymentProvider (Mock now, Stripe Elements later)'], components: ['PageHeader', 'Stepper', 'Card', 'GroomingPackageCard', 'ServicePayMethod', 'ServiceQuoteLines', 'ServiceFlowFooter', 'Toast'],
  rules: ['R-G15', 'R-H03', 'R-H04', 'R-H05', 'R-A05', 'R-A11', 'R-G08', 'R-G16'], states: ['card', 'pay at location', 'declined card', 'pending vaccines', 'paying'],
  figma: ['Frame 1171276435.png', 'Frame 1171276430.png'], checkedAt: W,
});
export const groomingOrderSpec = defineSpec({
  code: 'C-55', tone: 'list', name: 'Order detail & confirmation', purpose: 'One Grooming & Spa order: confirmation state right after booking, status in the one lifecycle, per-pet lines, location, groomer, payment and invoice totals; re-create it or cancel before confirmation.',
  layout: ['PageHeader', 'Success block (?new=1)', 'GroomingOrderCard', 'Pending-vaccines notice', 'Details card (status, location, groomer, chair time, payment, invoice, notes)', 'Totals (ServiceQuoteLines from the invoice)', 'Actions: Re-create | Cancel booking / Message the front desk', 'Cancel confirm Modal'],
  data: ['grooming_orders', 'appointments', 'invoices', 'locations', 'employees', 'pets', 'packages', 'addons', 'notifications'], roles: ROLES,
  logic: ['Customer labels via BOOKING_STATUS_CUSTOMER_LABEL (Pending verification, Upcoming, Completed).', 'Re-create writes a draft with the same pets, packages, add-ons, location and groomer, then opens C-53 for a new time (R-G16).', 'Cancel allowed only in requested / pending_vaccines (R-X14): sets order and appointments to cancelled and notifies; otherwise offers the front desk chat.'],
  integrations: [], components: ['PageHeader', 'GroomingOrderCard', 'Card', 'ServiceQuoteLines', 'Button', 'Modal', 'EmptyState', 'Toast'],
  rules: ['R-X14', 'R-I06', 'R-A05', 'R-G16', 'R-G15', 'R-D14'], states: ['just booked', 'upcoming', 'pending vaccines', 'completed', 'cancelled', 'not found'],
  figma: ['Frame 1171276435.png'], checkedAt: W,
});
export const groomingOrdersSpec = defineSpec({
  code: 'C-56', tone: 'list', name: 'Your Grooming & Spa orders', purpose: 'History of Grooming & Spa orders split into upcoming and past, each re-creatable in one tap; entry to a new order.',
  layout: ['PageHeader (New)', 'Tabs Upcoming / Past with counts', 'GroomingOrderCard list (Re-create, Details)', 'EmptyState'],
  data: ['grooming_orders', 'appointments', 'pets', 'packages', 'addons', 'locations', 'employees'], roles: ROLES,
  logic: ['Upcoming = active statuses starting later than 3 h ago, ascending; past = the rest, newest first.', 'Re-create = same as C-55.'],
  integrations: [], components: ['PageHeader', 'Tabs', 'GroomingOrderCard', 'Button', 'EmptyState'],
  rules: ['R-G16', 'R-G18', 'R-I01'], states: ['upcoming', 'past', 'empty'], figma: ['Frame 1171276434.png'], checkedAt: W,
});

export const daycareStartSpec = defineSpec({
  code: 'C-60', tone: 'list', name: 'Daycare', purpose: 'Entry point of Daycare: what it is, live pricing (full day, half day, play hour, walk with the hour threshold and the extra-pet discount), upcoming days and Book now. Replaces the "Coming soon" placeholder (R-A03).',
  layout: ['PageHeader', 'Hero (Book now)', 'Upcoming days (DaycareDayCard x3)', 'Pricing tiles from daycare_pricing', 'EmptyState / past days link', 'NoPetsModal (R-A01)'],
  data: ['daycare_bookings', 'daycare_pricing', 'discounts', 'pets', 'locations', 'customers'], roles: ROLES,
  logic: ['Threshold hours come from the full_day row (fallback half_day).', 'Upcoming = date >= today and active status, first 3.', 'Book now resets the daycare draft with the customer\'s home location.'],
  integrations: [], components: ['PageHeader', 'Button', 'Card', 'Icon', 'EmptyState', 'DaycareDayCard', 'Modal'],
  rules: ['R-F01', 'R-F02', 'R-F03', 'R-F04', 'R-F05', 'R-A03', 'R-A01'], states: ['no upcoming', 'upcoming', 'no pets', 'dark'], figma: ['Day care.png', 'DayCare-1.png'], checkedAt: W,
});
export const daycareBookSpec = defineSpec({
  code: 'C-61', tone: 'form', name: 'Daycare reservation', purpose: 'Step 1: pick pets, location and day, set drop-off and pick-up times and see the computed price live; the day length decides whether grooming can be added (R-X02 / R-X17).',
  layout: ['PageHeader + Stepper (1/3)', 'PetChoiceStrip (multi)', 'Vaccine notice', 'Location chips', 'Pricing tiles (current item highlighted)', 'DatePicker (closed days disabled)', 'Check in / Check out TimePickers', 'Computed price block', 'Add-grooming toggle or "no time for grooming" notice', 'ServiceFlowFooter (Next)'],
  data: ['pets', 'vaccine_records', 'locations', 'daycare_pricing', 'discounts', 'fees', 'taxes', 'packages', 'settings'], roles: ROLES,
  logic: ['hours = check_out - check_in; quoteDaycare(hours, pets): full day at/above threshold, half day below, play hour at 1 h or less; extra-pet discount per additional pet (R-F01..F06).', 'Times are clamped to the location\'s hours, check-out at least 1 h after check-in (R-X16).', 'groomingFitMinutes = shortest package for the pets\' sizes + settings.daycare.grooming_buffer_min (default 60); day >= fit offers the add-grooming toggle, otherwise explains (R-X17).'],
  integrations: [], components: ['PageHeader', 'Stepper', 'PetChoiceStrip', 'Chip', 'Card', 'DatePicker', 'TimePicker', 'Toggle', 'ServiceFlowFooter'],
  rules: ['R-F01', 'R-F02', 'R-F03', 'R-F05', 'R-F06', 'R-X02', 'R-X16', 'R-X17', 'R-A05', 'R-A11', 'R-K02'], states: ['nothing selected', 'half day', 'full day', 'play hour', 'multi-pet with discount', 'too short for grooming', 'closed day'],
  figma: ['DayCare-1.png', 'DayCare.png'], checkedAt: W,
});
export const daycareDetailsSpec = defineSpec({
  code: 'C-62', tone: 'form', name: 'Additional pet details', purpose: 'Step 2: per selected pet, vet-recommended flea medication (brand, last applied) and medical alerts for the handlers.',
  layout: ['PageHeader + Stepper (2/3)', 'One collapsible Section per pet: flea medication select, brand + date, medical alerts textarea (100 chars), on-file notice', 'ServiceFlowFooter (Next)'],
  data: ['pets', 'daycare_booking_pets'], roles: ROLES,
  logic: ['Answers live in draft.details[petId] and are written to daycare_booking_pets at checkout.', 'Brand and date only when flea medication = Yes.', 'Redirects to C-61 when no pets or day are set.'],
  integrations: [], components: ['PageHeader', 'Stepper', 'Card', 'Section', 'Avatar', 'Select', 'Input', 'Textarea', 'ServiceFlowFooter'],
  rules: ['R-A10', 'R-J02'], states: ['one pet', 'several pets (collapsed)', 'flea medication yes'], figma: ['DayCare-2.png'], checkedAt: W,
});
export const daycareCheckoutSpec = defineSpec({
  code: 'C-63', tone: 'form', name: 'Daycare checkout', purpose: 'Step 3: summary of day, times, location and pets, payment method, engine totals and pay. The Figma checkout was empty (DayCare-3), so this is designed to match the grooming checkout.',
  layout: ['PageHeader + Stepper (3/3)', 'Summary card + pet chips', 'Vaccine notice', 'ServicePayMethod', 'ServiceQuoteLines', 'ServiceFlowFooter (Pay $X)'],
  data: ['daycare_bookings', 'daycare_booking_pets', 'invoices', 'payments', 'notifications', 'daycare_pricing', 'discounts', 'fees', 'taxes', 'locations', 'pets'], roles: ROLES,
  logic: ['quoteDaycare with payWithCard for the card fee; service tax rate (R-H03, R-H04).', 'Status per statusFor(): pending_vaccines / confirmed / requested (R-A05).', 'Writes daycare_bookings, one daycare_booking_pets row per pet, invoices (+ payments), notifications; clears the draft; opens C-64 with ?new=1.'],
  integrations: ['PaymentProvider (Mock now, Stripe Elements later)'], components: ['PageHeader', 'Stepper', 'Card', 'Chip', 'ServicePayMethod', 'ServiceQuoteLines', 'ServiceFlowFooter', 'Toast'],
  rules: ['R-F01', 'R-F02', 'R-F05', 'R-H03', 'R-H04', 'R-A05', 'R-F06'], states: ['card', 'pay at location', 'declined', 'pending vaccines', 'paying'], figma: ['DayCare-3.png (empty)'], checkedAt: W,
});
export const daycareBookingSpec = defineSpec({
  code: 'C-64', tone: 'list', name: 'Daycare day detail', purpose: 'One daycare day: confirmation right after booking, status, pets with their questionnaire answers, payment and totals; book again, cancel before confirmation, or add grooming when the day is long enough.',
  layout: ['PageHeader', 'Success block (?new=1)', 'DaycareDayCard', 'Pending-vaccines notice', 'Add-grooming card (R-X17)', 'Details card', 'Pet details card', 'Totals', 'Actions: Book again | Cancel / Message the front desk', 'Cancel Modal'],
  data: ['daycare_bookings', 'daycare_booking_pets', 'invoices', 'locations', 'pets', 'daycare_pricing', 'packages', 'notifications'], roles: ROLES,
  logic: ['Book again prefills the daycare draft (pets, times, location, questionnaire) and opens C-61.', 'Book grooming prefills the grooming draft with the same pets, date and location and opens C-51 (R-X17).', 'Cancel only in requested / pending_vaccines (R-X14).'],
  integrations: [], components: ['PageHeader', 'DaycareDayCard', 'Card', 'ServiceQuoteLines', 'Button', 'Modal', 'EmptyState', 'Toast'],
  rules: ['R-X14', 'R-X17', 'R-X02', 'R-A05', 'R-F05'], states: ['just booked', 'upcoming', 'pending vaccines', 'checked in', 'completed', 'cancelled'], figma: [], checkedAt: W,
});
export const daycareBookingsSpec = defineSpec({
  code: 'C-65', tone: 'list', name: 'Your daycare days', purpose: 'History of daycare days split into upcoming and past; book any day again in one tap.',
  layout: ['PageHeader (New)', 'Tabs Upcoming / Past', 'DaycareDayCard list (Book again, Details)', 'EmptyState'],
  data: ['daycare_bookings', 'daycare_pricing', 'pets', 'locations'], roles: ROLES,
  logic: ['Upcoming = date >= today with an active status, ascending; past = the rest, newest first.'], integrations: [],
  components: ['PageHeader', 'Tabs', 'DaycareDayCard', 'Button', 'EmptyState'], rules: ['R-I01', 'R-F01', 'R-F02'], states: ['upcoming', 'past', 'empty'], figma: [], checkedAt: W,
});
