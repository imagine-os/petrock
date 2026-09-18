import { defineTables, type BaseRow, type ColumnDef } from './types.ts';
import { BOOKING_STATUSES, PET_SIZES } from '../../domain/booking.ts';
import { ROLES } from '../../auth/roles.ts';

const money = (name: string, description?: string): ColumnDef => ({ name, type: 'money', description: description ?? 'USD' });
const ref = (name: string, references: string, nullable = false): ColumnDef => ({ name, type: 'uuid', references, nullable });
const text = (name: string, nullable = false, description?: string): ColumnDef => ({ name, type: 'text', nullable, description });
const bool = (name: string, description?: string): ColumnDef => ({ name, type: 'bool', description });
const en = (name: string, values: readonly string[], nullable = false): ColumnDef => ({ name, type: 'enum', enum: values, nullable });

export const VACCINE_STATUSES = ['missing', 'submitted', 'verified', 'expired', 'rejected'] as const;
export const PET_APPROVAL = ['pending', 'needs_details', 'approved'] as const;
export const EMPLOYEE_STATUS = ['active', 'inactive', 'on_leave'] as const;
export const PAYMENT_STATUS = ['pending', 'authorized', 'paid', 'refunded', 'failed'] as const;
export const INVOICE_STATUS = ['draft', 'issued', 'paid', 'void'] as const;
export const RULE_STATUS = ['requested', 'in_dev', 'implemented', 'deprecated'] as const;
export const APPOINTMENT_STATUS = ['requested', 'confirmed', 'in_progress', 'done', 'cancelled', 'no_show'] as const;

export const tables = defineTables([
  // ---- core ----
  { name: 'locations', label: 'Locations', description: 'Petrock stores (Encino, Westwood). Adding a location inserts a row; everything else is scoped by location_id.', group: 'core', scope: 'global', titleColumn: 'name', source: 'entities 6', access: ['everyone read', 'owner write'],
    columns: [text('name'), text('short_name'), text('slug'), text('city'), text('address'), text('phone', true), text('timezone'), { name: 'hours', type: 'json', description: 'weekday -> {open, close} | null', wide: true }, { name: 'sort_order', type: 'int' }, bool('active'), text('note', true)] },
  { name: 'users', label: 'Users', description: 'Login principals: staff and customers. Role is the primary role; permissions derive from it.', group: 'core', scope: 'global', titleColumn: 'name', source: 'entities 20',
    columns: [text('name'), text('email'), en('role', ROLES), ref('location_id', 'locations', true), text('phone', true), text('avatar_url', true), bool('active'), text('preferred_language', true)] },
  { name: 'roles', label: 'Roles', description: 'Role catalog with label and description; the side menu and permissions key off `key`.', group: 'core', scope: 'global', titleColumn: 'label', source: 'D-002, R-L05',
    columns: [text('key'), text('label'), text('description', true), { name: 'menu', type: 'json', description: 'Per-role side menu overrides (category -> visible)', wide: true, nullable: true }] },
  { name: 'permissions', label: 'Permissions', description: 'Role -> permission string grants (see src/auth/permissions.ts).', group: 'core', scope: 'global', source: 'R-L05',
    columns: [text('role'), text('permission'), bool('granted')] },
  { name: 'employees', label: 'Employees', description: 'Staff records with job, status, calendar colour, working hours and hashed PIN.', group: 'people', scope: 'location', titleColumn: 'name', source: 'entities 20',
    columns: [ref('user_id', 'users', true), text('name'), text('display_name', true), text('email', true), text('phone', true), text('department', true), text('job_title', true), en('status', EMPLOYEE_STATUS), text('color', true), bool('is_groomer'), bool('is_handler'), text('pin_hash', true), { name: 'working_hours', type: 'json', wide: true, nullable: true }, { name: 'date_started', type: 'date', nullable: true }, text('note', true)] },
  { name: 'capacities', label: 'Capacities', description: 'Max simultaneous bookings per location per kind (penthouse, suite, daycare, grooming).', group: 'core', scope: 'location', source: 'R-E10..E13',
    columns: [en('kind', ['penthouse', 'suite', 'daycare', 'grooming']), { name: 'max_simultaneous', type: 'int' }, text('note', true)] },
  { name: 'holidays', label: 'Holidays & closures', description: 'Dates marked holiday (excluded from long-stay discounts) or boarding closed.', group: 'core', scope: 'location', source: 'R-E15',
    columns: [{ name: 'date', type: 'date' }, text('name'), bool('is_holiday'), bool('boarding_closed')] },

  // ---- people & pets ----
  { name: 'customers', label: 'Customers', description: 'Pet parents. One row per household account; linked to a user when they sign up in the app.', group: 'people', scope: 'global', titleColumn: 'last_name', source: 'entities 1',
    columns: [ref('user_id', 'users', true), text('first_name'), text('last_name'), text('email'), text('mobile'), text('alt_phone', true), text('address', true), text('apt_suite', true), text('city', true), text('state', true), text('zip', true), en('status', ['active', 'inactive']), text('preferred_contact', true), ref('home_location_id', 'locations', true), bool('marketing_opt_in'), text('note', true), money('balance', 'Outstanding balance, USD')] },
  { name: 'vets', label: 'Vets', description: 'Veterinarians a pet can reference.', group: 'pets', scope: 'global', titleColumn: 'name', source: 'entities 4', columns: [text('name'), text('phone', true), text('address', true)] },
  { name: 'pets', label: 'Pets', description: 'Dogs (and other pets) with profile, care instructions and approval status.', group: 'pets', scope: 'global', titleColumn: 'name', source: 'entities 2',
    columns: [ref('customer_id', 'customers'), text('name'), text('type'), text('breed', true), bool('is_mixed'), en('sex', ['male', 'female']), bool('neutered'), text('color', true), { name: 'weight_lbs', type: 'numeric', nullable: true }, en('size', PET_SIZES, true), { name: 'date_of_birth', type: 'date', nullable: true }, text('personality', true), { name: 'socialized_with', type: 'json', nullable: true }, bool('can_have_treats'), bool('own_food'), text('meals_per_day', true), text('feeding_am', true), text('feeding_midday', true), text('feeding_pm', true), text('medical_conditions', true), text('allergies', true), ref('vet_id', 'vets', true), { name: 'attributes', type: 'json', nullable: true, description: 'Staff flags e.g. Aggressive, Muzzle' }, en('approval_status', PET_APPROVAL), en('status', ['active', 'inactive']), text('photo_url', true), text('note', true)] },
  { name: 'vaccine_types', label: 'Vaccine types', description: 'Catalog: Rabies, DHPP (Distemper/Parvo), Bordetella, Leptospirosis, Canine Influenza; required or recommended.', group: 'pets', scope: 'global', titleColumn: 'name', source: 'entities 3, R-B01..B04',
    columns: [text('name'), text('short_name'), bool('required'), { name: 'sort_order', type: 'int' }, text('note', true)] },
  { name: 'vaccine_records', label: 'Vaccine records', description: 'Per pet per vaccine: dates, proof upload (mock), status. Bookings stay pending_vaccines until every required record is verified.', group: 'pets', scope: 'global', source: 'entities 3, R-A05',
    columns: [ref('pet_id', 'pets'), ref('vaccine_type_id', 'vaccine_types'), { name: 'vaccinated_on', type: 'date', nullable: true }, { name: 'expires_on', type: 'date', nullable: true }, text('proof_url', true), text('proof_name', true), en('status', VACCINE_STATUSES), ref('verified_by', 'users', true), { name: 'verified_at', type: 'timestamptz', nullable: true }, text('note', true)] },

  // ---- hotel ----
  { name: 'room_types', label: 'Room types', description: 'Penthouse and Suite with inclusions copy and fit rules (max weight).', group: 'hotel', scope: 'global', titleColumn: 'name', source: 'entities 8, R-D01..D03',
    columns: [text('name'), text('key'), text('description', true), { name: 'max_weight_lbs', type: 'numeric', nullable: true, description: 'Fit rule (30 lb bottom rooms, 55 lb suite) - see rules' }, { name: 'sort_order', type: 'int' }, text('photo_url', true)] },
  { name: 'rooms', label: 'Rooms', description: 'Physical rooms per location: code, type, position (bottom/top) and timeline group.', group: 'hotel', scope: 'location', titleColumn: 'code', source: 'entities 8, R-K07',
    columns: [text('code'), ref('room_type_id', 'room_types'), en('position', ['bottom', 'top'], true), { name: 'sort_order', type: 'int' }, bool('active'), text('note', true)] },
  { name: 'seasons', label: 'Seasons', description: 'Date ranges with seasonal rates; holiday flag excludes long-stay discounts.', group: 'hotel', scope: 'global', titleColumn: 'name', source: 'R-D06, R-E15',
    columns: [text('name'), { name: 'starts_on', type: 'date' }, { name: 'ends_on', type: 'date' }, bool('is_holiday')] },
  { name: 'rates', label: 'Room rates', description: 'Nightly rate per room type, day kind (Mon-Thu / Fri-Sun) and season (null = base).', group: 'commerce', scope: 'global', source: 'R-D05',
    columns: [ref('room_type_id', 'room_types'), en('day_kind', ['weekday', 'weekend']), ref('season_id', 'seasons', true), money('price_per_night'), ref('location_id', 'locations', true)] },
  { name: 'discounts', label: 'Discounts', description: 'Multi-dog (per dog per night), long-stay (percent, paid in full, not holiday) and prepay discounts.', group: 'commerce', scope: 'global', titleColumn: 'name', source: 'R-E01..E08, R-F05',
    columns: [text('name'), en('kind', ['multi_dog', 'long_stay', 'prepay', 'daycare_extra_pet']), ref('room_type_id', 'room_types', true), { name: 'dog_count', type: 'int', nullable: true }, { name: 'min_nights', type: 'int', nullable: true }, money('amount_off', 'Per dog per night (multi_dog) or per pet (daycare)'), { name: 'percent_off', type: 'numeric', nullable: true }, bool('requires_paid_in_full'), bool('excludes_holidays'), bool('active')] },
  { name: 'bookings', label: 'Hotel bookings', description: 'A stay: customer, dates, room type, status (one lifecycle), totals and payment status.', group: 'hotel', scope: 'location', source: 'entities 9',
    columns: [text('code', false, 'Human reference e.g. PR-1042'), ref('customer_id', 'customers'), ref('room_type_id', 'room_types'), ref('room_id', 'rooms', true), { name: 'check_in', type: 'timestamptz' }, { name: 'check_out', type: 'timestamptz' }, { name: 'nights', type: 'int' }, en('status', BOOKING_STATUSES), bool('share_room'), bool('add_grooming'), ref('handler_id', 'employees', true), bool('paid_in_full'), en('payment_method', ['card', 'cash'], true), en('payment_status', PAYMENT_STATUS), money('subtotal'), money('discount_total'), money('fee_total'), money('tax_total'), money('total'), money('deposit'), { name: 'quote', type: 'json', wide: true, nullable: true, description: 'Pricing engine breakdown at booking time' }, text('notes', true), bool('include_notes_on_invoice'), text('source', true, 'app | desk | phone')] },
  { name: 'booking_pets', label: 'Booking pets', description: 'Pets on a stay with the per-booking medical questionnaire.', group: 'hotel', scope: 'global', source: 'entities 10-11',
    columns: [ref('booking_id', 'bookings'), ref('pet_id', 'pets'), ref('room_id', 'rooms', true), bool('takes_medication'), text('medication', true), text('dosing', true), bool('flea_medication'), text('medical_alert', true)] },

  // ---- grooming & spa ----
  { name: 'services', label: 'Services', description: 'Service catalog: hotel, daycare, grooming, extras (Veterinary travel, Vaccination fee).', group: 'grooming', scope: 'global', titleColumn: 'name', source: 'entities 10, 15',
    columns: [text('name'), en('category', ['hotel', 'daycare', 'grooming', 'extra']), money('price', 'Flat price when not size/package priced'), en('taxable_as', ['service', 'product', 'boarding']), bool('active'), text('description', true)] },
  { name: 'packages', label: 'Grooming packages', description: 'Gold / Platinum / Diamond priced by dog size S/M/L/XL/Giant with calendar minutes per size and inclusions.', group: 'grooming', scope: 'global', titleColumn: 'name', source: 'R-G01..G07',
    columns: [text('name'), text('tier'), text('inclusions', true), money('price_s'), money('price_m'), money('price_l'), money('price_xl'), money('price_giant'), { name: 'minutes_s', type: 'int' }, { name: 'minutes_m', type: 'int' }, { name: 'minutes_l', type: 'int' }, { name: 'minutes_xl', type: 'int' }, { name: 'minutes_giant', type: 'int' }, text('notes', true), { name: 'sort_order', type: 'int' }, bool('active')] },
  { name: 'addons', label: 'Grooming add-ons', description: 'Add-ons (Furminator, Medicated Shampoo, Nail Trim...) with price, starting-at flag, added time and employee restriction.', group: 'grooming', scope: 'global', titleColumn: 'name', source: 'R-G08..G13',
    columns: [text('name'), money('price'), bool('starting_at'), { name: 'added_minutes_sm', type: 'int' }, { name: 'added_minutes_l', type: 'int' }, text('employee_type', true), text('description', true), bool('active')] },
  { name: 'appointments', label: 'Grooming appointments', description: 'Grooming & Spa appointments: pet, package, add-ons, groomer, time, status, linked hotel booking.', group: 'grooming', scope: 'location', source: 'entities 12',
    columns: [text('code'), ref('customer_id', 'customers'), ref('pet_id', 'pets'), ref('package_id', 'packages', true), { name: 'addon_ids', type: 'json', nullable: true }, ref('groomer_id', 'employees', true), { name: 'starts_at', type: 'timestamptz' }, { name: 'duration_min', type: 'int' }, en('status', APPOINTMENT_STATUS), ref('booking_id', 'bookings', true), en('size', PET_SIZES, true), money('subtotal'), money('tax_total'), money('total'), en('payment_status', PAYMENT_STATUS), text('notes', true)] },

  // ---- daycare ----
  { name: 'daycare_pricing', label: 'Daycare pricing', description: 'Full day / half day / play hour / walk with prices and the hour threshold.', group: 'daycare', scope: 'global', titleColumn: 'name', source: 'R-F01..F05',
    columns: [en('item', ['full_day', 'half_day', 'hour', 'walk']), text('name'), money('price'), { name: 'threshold_hours', type: 'numeric', nullable: true, description: 'Half day below, full day at/above' }, bool('active')] },
  { name: 'daycare_bookings', label: 'Daycare bookings', description: 'A daycare day: pets, date, in/out times, computed item and price, status (same lifecycle).', group: 'daycare', scope: 'location', source: 'entities 14',
    columns: [text('code'), ref('customer_id', 'customers'), { name: 'pet_ids', type: 'json' }, { name: 'date', type: 'date' }, { name: 'check_in_time', type: 'time' }, { name: 'check_out_time', type: 'time' }, en('item', ['full_day', 'half_day', 'hour']), en('status', BOOKING_STATUSES), money('subtotal'), money('discount_total'), money('tax_total'), money('total'), en('payment_status', PAYMENT_STATUS), text('notes', true)] },

  // ---- commerce ----
  { name: 'fees', label: 'Fees', description: 'Card / non-cash fee (3.89% through the app) and any other surcharge.', group: 'commerce', scope: 'global', titleColumn: 'name', source: 'R-H03',
    columns: [text('name'), en('kind', ['card', 'other']), { name: 'percent', type: 'numeric' }, en('applies_to', ['card_payments', 'all']), bool('active')] },
  { name: 'taxes', label: 'Taxes', description: 'Tax settings: one named tax with service / product / boarding rates, prices exclusive by default.', group: 'commerce', scope: 'global', titleColumn: 'name', source: 'R-H04, R-H05',
    columns: [text('name'), text('tax_number', true), { name: 'service_rate', type: 'numeric' }, { name: 'product_rate', type: 'numeric' }, { name: 'boarding_rate', type: 'numeric' }, bool('prices_inclusive'), bool('active')] },
  { name: 'invoices', label: 'Invoices', description: 'Invoice per booking / appointment / daycare day with line items, totals, deposit and balance.', group: 'commerce', scope: 'location', titleColumn: 'number', source: 'entities 15',
    columns: [text('number'), ref('customer_id', 'customers'), en('source_type', ['booking', 'appointment', 'daycare']), text('source_id'), { name: 'lines', type: 'json', wide: true }, money('subtotal'), money('discount_total'), money('fee_total'), money('tax_total'), money('total'), money('deposit'), money('balance'), en('status', INVOICE_STATUS), { name: 'issued_at', type: 'timestamptz', nullable: true }, text('footer', true)] },
  { name: 'payments', label: 'Payments', description: 'Payment attempts and results through the PaymentProvider (mock now, Stripe later).', group: 'commerce', scope: 'location', source: 'entities 16',
    columns: [ref('invoice_id', 'invoices', true), ref('customer_id', 'customers'), money('amount'), en('method', ['card', 'cash']), en('status', PAYMENT_STATUS), text('provider'), text('provider_ref', true), text('card_brand', true), text('card_last4', true), bool('is_deposit'), { name: 'paid_at', type: 'timestamptz', nullable: true }, ref('refund_of', 'payments', true), text('note', true)] },

  // ---- comms ----
  { name: 'conversations', label: 'Conversations', description: 'One Front Desk chat thread per customer per location.', group: 'comms', scope: 'location', source: 'entities 22',
    columns: [ref('customer_id', 'customers'), { name: 'last_message_at', type: 'timestamptz', nullable: true }, text('last_preview', true), { name: 'unread_staff', type: 'int' }, { name: 'unread_customer', type: 'int' }, en('status', ['open', 'closed'])] },
  { name: 'messages', label: 'Messages', description: 'Chat messages between a customer and the front desk (text, optional image, system markers).', group: 'comms', scope: 'global', source: 'entities 22',
    columns: [ref('conversation_id', 'conversations'), en('sender', ['customer', 'staff', 'system']), ref('sender_user_id', 'users', true), text('text'), text('image_url', true), { name: 'sent_at', type: 'timestamptz' }, bool('read')] },
  { name: 'notifications', label: 'Notifications', description: 'In-app notifications to a user (booking confirmed, payment done, vaccine expiring...).', group: 'comms', scope: 'global', source: 'entities 21',
    columns: [ref('user_id', 'users'), text('kind'), text('title'), text('body', true), text('link', true), bool('read'), { name: 'sent_at', type: 'timestamptz' }] },
  { name: 'reviews', label: 'Reviews', description: 'Customer reviews with rating and tags; moderated (pending -> published | archived).', group: 'comms', scope: 'location', source: 'entities 23',
    columns: [ref('customer_id', 'customers'), { name: 'rating', type: 'numeric' }, text('title', true), text('body', true), { name: 'tags', type: 'json', nullable: true }, en('status', ['pending', 'published', 'archived'])] },
  { name: 'feedback', label: 'Staff feedback', description: 'Feedback staff leave from any page (FeedbackButton); the owner reads it in an inbox.', group: 'comms', scope: 'location', source: 'project brief',
    columns: [ref('user_id', 'users'), text('user_name'), text('role'), text('page_code'), text('route'), en('category', ['bug', 'idea', 'question', 'praise']), text('text'), en('status', ['new', 'seen', 'done']), text('owner_reply', true)] },

  // ---- system ----
  { name: 'approvals', label: 'Approvals (PIN audit)', description: 'Every manager-PIN approval: who approved what, for whom, on which record.', group: 'system', scope: 'location', source: 'R-I06',
    columns: [text('action', false, 'e.g. booking.status, payment.refund, discount.apply, record.delete'), text('subject_table', true), text('subject_id', true), ref('requested_by', 'users', true), text('requested_by_name'), ref('approved_by', 'users'), text('approved_by_name'), text('approver_role'), { name: 'details', type: 'json', nullable: true, wide: true }, { name: 'approved_at', type: 'timestamptz' }] },
  { name: 'rules', label: 'Business rules', description: 'Rules added in Settings > Rules at runtime (the code registry in src/rules is merged with these).', group: 'system', scope: 'global', titleColumn: 'title', source: 'D-006',
    columns: [text('rule_id'), text('title'), text('description', true), text('category'), en('status', RULE_STATUS), { name: 'pages', type: 'json', nullable: true }, text('source', true), text('requested_by', true)] },
  { name: 'audit_log', label: 'Audit log', description: 'Who changed what: table, row, action, diff.', group: 'system', scope: 'location', source: 'entities 9 (audit)',
    columns: [ref('user_id', 'users', true), text('user_name', true), text('action'), text('table_name'), text('row_id', true), { name: 'diff', type: 'json', nullable: true, wide: true }] },
  { name: 'settings', label: 'Settings', description: 'Key/value settings per scope (boarding charge rules, invoice numbering, general).', group: 'system', scope: 'global', titleColumn: 'key', source: 'entities 26',
    columns: [text('key'), { name: 'value', type: 'json', wide: true }, text('description', true)] },
  { name: 'page_layouts', label: 'Page layouts', description: 'Per page code: section order and hidden sections (builder tool layout editor).', group: 'design', scope: 'global', titleColumn: 'page_code', source: 'hoy pattern',
    columns: [text('page_code'), { name: 'order', type: 'json' }, { name: 'hidden', type: 'json' }] },
]);

// ---- typed rows pages use ----
export interface LocationRow extends BaseRow { name: string; short_name: string; slug: string; city: string; address: string; phone: string | null; timezone: string; hours: Record<string, { open: string; close: string } | null>; sort_order: number; active: boolean }
export interface UserRow extends BaseRow { name: string; email: string; role: string; location_id: string | null; phone: string | null; active: boolean }
export interface EmployeeRow extends BaseRow { user_id: string | null; name: string; display_name: string | null; email: string | null; job_title: string | null; department: string | null; status: string; color: string | null; is_groomer: boolean; is_handler: boolean; pin_hash: string | null }
export interface CapacityRow extends BaseRow { kind: 'penthouse' | 'suite' | 'daycare' | 'grooming'; max_simultaneous: number }
export interface CustomerRow extends BaseRow { user_id: string | null; first_name: string; last_name: string; email: string; mobile: string; city: string | null; state: string | null; status: string; home_location_id: string | null; balance: number }
export interface PetRow extends BaseRow { customer_id: string; name: string; type: string; breed: string | null; sex: 'male' | 'female'; neutered: boolean; weight_lbs: number | null; size: string | null; date_of_birth: string | null; approval_status: string; status: string; personality: string | null; attributes: string[] | null }
export interface VaccineTypeRow extends BaseRow { name: string; short_name: string; required: boolean; sort_order: number }
export interface VaccineRecordRow extends BaseRow { pet_id: string; vaccine_type_id: string; vaccinated_on: string | null; expires_on: string | null; proof_url: string | null; proof_name: string | null; status: string; verified_by: string | null; verified_at: string | null }
export interface RoomTypeRow extends BaseRow { name: string; key: string; description: string | null; max_weight_lbs: number | null; sort_order: number }
export interface RoomRow extends BaseRow { code: string; room_type_id: string; position: 'bottom' | 'top' | null; sort_order: number; active: boolean }
export interface SeasonRow extends BaseRow { name: string; starts_on: string; ends_on: string; is_holiday: boolean }
export interface RateRow extends BaseRow { room_type_id: string; day_kind: 'weekday' | 'weekend'; season_id: string | null; price_per_night: number }
export interface DiscountRow extends BaseRow { name: string; kind: 'multi_dog' | 'long_stay' | 'prepay' | 'daycare_extra_pet'; room_type_id: string | null; dog_count: number | null; min_nights: number | null; amount_off: number; percent_off: number | null; requires_paid_in_full: boolean; excludes_holidays: boolean; active: boolean }
export interface FeeRow extends BaseRow { name: string; kind: 'card' | 'other'; percent: number; applies_to: 'card_payments' | 'all'; active: boolean }
export interface TaxRow extends BaseRow { name: string; service_rate: number; product_rate: number; boarding_rate: number; prices_inclusive: boolean; active: boolean }
export interface PackageRow extends BaseRow { name: string; tier: string; inclusions: string | null; price_s: number; price_m: number; price_l: number; price_xl: number; price_giant: number; minutes_s: number; minutes_m: number; minutes_l: number; minutes_xl: number; minutes_giant: number; active: boolean; sort_order: number }
export interface AddonRow extends BaseRow { name: string; price: number; starting_at: boolean; added_minutes_sm: number; added_minutes_l: number; employee_type: string | null; active: boolean }
export interface DaycarePricingRow extends BaseRow { item: 'full_day' | 'half_day' | 'hour' | 'walk'; name: string; price: number; threshold_hours: number | null; active: boolean }
export interface BookingRow extends BaseRow { code: string; customer_id: string; room_type_id: string; room_id: string | null; check_in: string; check_out: string; nights: number; status: string; share_room: boolean; add_grooming: boolean; paid_in_full: boolean; payment_method: 'card' | 'cash' | null; payment_status: string; subtotal: number; discount_total: number; fee_total: number; tax_total: number; total: number; deposit: number; notes: string | null; source: string | null }
export interface BookingPetRow extends BaseRow { booking_id: string; pet_id: string; room_id: string | null; takes_medication: boolean; medication: string | null; medical_alert: string | null }
export interface ServiceRow extends BaseRow { name: string; category: string; price: number; taxable_as: string; active: boolean }
export interface AppointmentRow extends BaseRow { code: string; customer_id: string; pet_id: string; package_id: string | null; addon_ids: string[] | null; groomer_id: string | null; starts_at: string; duration_min: number; status: string; booking_id: string | null; size: string | null; subtotal: number; tax_total: number; total: number; payment_status: string }
export interface DaycareBookingRow extends BaseRow { code: string; customer_id: string; pet_ids: string[]; date: string; check_in_time: string; check_out_time: string; item: string; status: string; subtotal: number; discount_total: number; tax_total: number; total: number; payment_status: string }
export interface InvoiceRow extends BaseRow { number: string; customer_id: string; source_type: string; source_id: string; lines: { label: string; qty: number; unit: number; amount: number }[]; subtotal: number; discount_total: number; fee_total: number; tax_total: number; total: number; deposit: number; balance: number; status: string; issued_at: string | null }
export interface PaymentRow extends BaseRow { invoice_id: string | null; customer_id: string; amount: number; method: 'card' | 'cash'; status: string; provider: string; provider_ref: string | null; card_brand: string | null; card_last4: string | null; is_deposit: boolean; paid_at: string | null }
export interface ConversationRow extends BaseRow { customer_id: string; last_message_at: string | null; last_preview: string | null; unread_staff: number; unread_customer: number; status: string }
export interface MessageRow extends BaseRow { conversation_id: string; sender: 'customer' | 'staff' | 'system'; sender_user_id: string | null; text: string; image_url: string | null; sent_at: string; read: boolean }
export interface NotificationRow extends BaseRow { user_id: string; kind: string; title: string; body: string | null; link: string | null; read: boolean; sent_at: string }
export interface ReviewRow extends BaseRow { customer_id: string; rating: number; title: string | null; body: string | null; tags: string[] | null; status: string }
export interface FeedbackRow extends BaseRow { user_id: string; user_name: string; role: string; page_code: string; route: string; category: string; text: string; status: string; owner_reply: string | null }
export interface ApprovalRow extends BaseRow { action: string; subject_table: string | null; subject_id: string | null; requested_by: string | null; requested_by_name: string; approved_by: string; approved_by_name: string; approver_role: string; details: Record<string, unknown> | null; approved_at: string }
export interface RuleRow extends BaseRow { rule_id: string; title: string; description: string | null; category: string; status: string; pages: string[] | null; source: string | null; requested_by: string | null }
export interface AuditLogRow extends BaseRow { user_id: string | null; user_name: string | null; action: string; table_name: string; row_id: string | null; diff: Record<string, unknown> | null }
export interface SettingRow extends BaseRow { key: string; value: unknown; description: string | null }
export interface PageLayoutRow extends BaseRow { page_code: string; order: string[]; hidden: string[] }
