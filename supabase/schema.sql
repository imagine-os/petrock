-- Petrock - Postgres schema draft (Company-OS entity shapes / Supabase later)
-- GENERATED from src/data/schema/*.ts by scripts/gen-sql.mjs. Edit the TS, regenerate, review, then apply as a migration.
-- Conventions: every table has id, created_at, updated_at; location-scoped tables add location_id -> locations.
-- Company-OS mapping: one tenant "petrock", org_unit = location; each table below is an entity whose columns are fields.

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- grooming · Grooming add-ons: Add-ons (Furminator, Medicated Shampoo, Nail Trim...) with price, starting-at flag, added time and employee restriction.
create table if not exists public.addons (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  -- USD
  price numeric(12,2) not null,
  starting_at boolean not null default false,
  added_minutes_sm integer not null,
  added_minutes_l integer not null,
  employee_type text,
  description text,
  active boolean not null default false
);
create trigger addons_touch before update on public.addons for each row execute function public.touch_updated_at();

-- grooming · Appointment extras: Groom Bookings form fields not on the core appointments row: reminder, pickup / delivery, discount %, payment method, include-notes-on-invoice, groom style at booking (Groom Booking .pdf).
-- access:
--   · front_desk write
create table if not exists public.appointment_extras (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  appointment_id uuid not null references public.appointments(id) on delete set null,
  reminder boolean not null default false,
  pickup_at timestamptz,
  delivery_at timestamptz,
  -- Percent discount applied with manager PIN (R-P01)
  discount_pct numeric(12,2) not null,
  payment_method text check (payment_method in ('card', 'cash')),
  include_notes_on_invoice boolean not null default false,
  groom_style text,
  approval_id uuid references public.approvals(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null
);
create index if not exists appointment_extras_appointment_id_idx on public.appointment_extras(appointment_id);
create index if not exists appointment_extras_approval_id_idx on public.appointment_extras(approval_id);
create index if not exists appointment_extras_invoice_id_idx on public.appointment_extras(invoice_id);
create trigger appointment_extras_touch before update on public.appointment_extras for each row execute function public.touch_updated_at();

-- grooming · Grooming appointments: Grooming & Spa appointments: pet, package, add-ons, groomer, time, status, linked hotel booking.
create table if not exists public.appointments (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  code text not null,
  customer_id uuid not null references public.customers(id) on delete set null,
  pet_id uuid not null references public.pets(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  addon_ids jsonb,
  groomer_id uuid references public.employees(id) on delete set null,
  starts_at timestamptz not null,
  duration_min integer not null,
  status text not null check (status in ('requested', 'confirmed', 'in_progress', 'done', 'cancelled', 'no_show')),
  booking_id uuid references public.bookings(id) on delete set null,
  size text check (size in ('S', 'M', 'L', 'XL', 'Giant')),
  -- USD
  subtotal numeric(12,2) not null,
  -- USD
  tax_total numeric(12,2) not null,
  -- USD
  total numeric(12,2) not null,
  payment_status text not null check (payment_status in ('pending', 'authorized', 'paid', 'refunded', 'failed')),
  notes text
);
create index if not exists appointments_location_idx on public.appointments(location_id);
create index if not exists appointments_customer_id_idx on public.appointments(customer_id);
create index if not exists appointments_pet_id_idx on public.appointments(pet_id);
create index if not exists appointments_package_id_idx on public.appointments(package_id);
create index if not exists appointments_groomer_id_idx on public.appointments(groomer_id);
create index if not exists appointments_booking_id_idx on public.appointments(booking_id);
create trigger appointments_touch before update on public.appointments for each row execute function public.touch_updated_at();

-- system · Approvals (PIN audit): Every manager-PIN approval: who approved what, for whom, on which record.
create table if not exists public.approvals (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- e.g. booking.status, payment.refund, discount.apply, record.delete
  action text not null,
  subject_table text,
  subject_id text,
  requested_by uuid references public.users(id) on delete set null,
  requested_by_name text not null,
  approved_by uuid not null references public.users(id) on delete set null,
  approved_by_name text not null,
  approver_role text not null,
  details jsonb,
  approved_at timestamptz not null
);
create index if not exists approvals_location_idx on public.approvals(location_id);
create index if not exists approvals_requested_by_idx on public.approvals(requested_by);
create index if not exists approvals_approved_by_idx on public.approvals(approved_by);
create trigger approvals_touch before update on public.approvals for each row execute function public.touch_updated_at();

-- system · Attachments: Mock file uploads from the add forms (customer / pet / appointment / vaccine certificate). URLs are mock:// until storage lands.
-- access:
--   · staff write
create table if not exists public.attachments (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subject_table text not null check (subject_table in ('customers', 'pets', 'appointments', 'vaccine_records')),
  subject_id text not null,
  name text not null,
  url text not null,
  size_bytes integer not null,
  mime text,
  uploaded_by uuid references public.users(id) on delete set null
);
create index if not exists attachments_uploaded_by_idx on public.attachments(uploaded_by);
create trigger attachments_touch before update on public.attachments for each row execute function public.touch_updated_at();

-- system · Audit log: Who changed what: table, row, action, diff.
create table if not exists public.audit_log (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references public.users(id) on delete set null,
  user_name text,
  action text not null,
  table_name text not null,
  row_id text,
  diff jsonb
);
create index if not exists audit_log_location_idx on public.audit_log(location_id);
create index if not exists audit_log_user_id_idx on public.audit_log(user_id);
create trigger audit_log_touch before update on public.audit_log for each row execute function public.touch_updated_at();

-- hotel · Booking pets: Pets on a stay with the per-booking medical questionnaire.
create table if not exists public.booking_pets (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  booking_id uuid not null references public.bookings(id) on delete set null,
  pet_id uuid not null references public.pets(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  takes_medication boolean not null default false,
  medication text,
  dosing text,
  flea_medication boolean not null default false,
  medical_alert text
);
create index if not exists booking_pets_booking_id_idx on public.booking_pets(booking_id);
create index if not exists booking_pets_pet_id_idx on public.booking_pets(pet_id);
create index if not exists booking_pets_room_id_idx on public.booking_pets(room_id);
create trigger booking_pets_touch before update on public.booking_pets for each row execute function public.touch_updated_at();

-- hotel · Hotel bookings: A stay: customer, dates, room type, status (one lifecycle), totals and payment status.
create table if not exists public.bookings (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Human reference e.g. PR-1042
  code text not null,
  customer_id uuid not null references public.customers(id) on delete set null,
  room_type_id uuid not null references public.room_types(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  check_in timestamptz not null,
  check_out timestamptz not null,
  nights integer not null,
  status text not null check (status in ('requested', 'pending_vaccines', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  share_room boolean not null default false,
  add_grooming boolean not null default false,
  handler_id uuid references public.employees(id) on delete set null,
  paid_in_full boolean not null default false,
  payment_method text check (payment_method in ('card', 'cash')),
  payment_status text not null check (payment_status in ('pending', 'authorized', 'paid', 'refunded', 'failed')),
  -- USD
  subtotal numeric(12,2) not null,
  -- USD
  discount_total numeric(12,2) not null,
  -- USD
  fee_total numeric(12,2) not null,
  -- USD
  tax_total numeric(12,2) not null,
  -- USD
  total numeric(12,2) not null,
  -- USD
  deposit numeric(12,2) not null,
  -- Pricing engine breakdown at booking time
  quote jsonb,
  notes text,
  include_notes_on_invoice boolean not null default false,
  -- app | desk | phone
  source text
);
create index if not exists bookings_location_idx on public.bookings(location_id);
create index if not exists bookings_customer_id_idx on public.bookings(customer_id);
create index if not exists bookings_room_type_id_idx on public.bookings(room_type_id);
create index if not exists bookings_room_id_idx on public.bookings(room_id);
create index if not exists bookings_handler_id_idx on public.bookings(handler_id);
create trigger bookings_touch before update on public.bookings for each row execute function public.touch_updated_at();

-- core · Capacities: Max simultaneous bookings per location per kind (penthouse, suite, daycare, grooming).
create table if not exists public.capacities (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in ('penthouse', 'suite', 'daycare', 'grooming')),
  max_simultaneous integer not null,
  note text
);
create index if not exists capacities_location_idx on public.capacities(location_id);
create trigger capacities_touch before update on public.capacities for each row execute function public.touch_updated_at();

-- comms · Conversation assignments: Which staff member owns a Front Desk chat thread (assign / reassign from the inbox).
-- access:
--   · staff write
create table if not exists public.conversation_assignments (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  conversation_id uuid not null references public.conversations(id) on delete set null,
  assignee_user_id uuid references public.users(id) on delete set null,
  assignee_name text,
  assigned_by uuid references public.users(id) on delete set null,
  assigned_at timestamptz not null
);
create index if not exists conversation_assignments_location_idx on public.conversation_assignments(location_id);
create index if not exists conversation_assignments_conversation_id_idx on public.conversation_assignments(conversation_id);
create index if not exists conversation_assignments_assignee_user_id_idx on public.conversation_assignments(assignee_user_id);
create index if not exists conversation_assignments_assigned_by_idx on public.conversation_assignments(assigned_by);
create trigger conversation_assignments_touch before update on public.conversation_assignments for each row execute function public.touch_updated_at();

-- comms · Conversations: One Front Desk chat thread per customer per location.
create table if not exists public.conversations (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_id uuid not null references public.customers(id) on delete set null,
  last_message_at timestamptz,
  last_preview text,
  unread_staff integer not null,
  unread_customer integer not null,
  status text not null check (status in ('open', 'closed'))
);
create index if not exists conversations_location_idx on public.conversations(location_id);
create index if not exists conversations_customer_id_idx on public.conversations(customer_id);
create trigger conversations_touch before update on public.conversations for each row execute function public.touch_updated_at();

-- people · Customer notes: Timeline of staff notes on a customer (who, when, pinned). The 100-char customers.note stays the headline note (R-J02).
-- access:
--   · staff write
--   · owner read
create table if not exists public.customer_notes (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_id uuid not null references public.customers(id) on delete set null,
  author_id uuid references public.users(id) on delete set null,
  author_name text not null,
  text text not null,
  pinned boolean not null default false
);
create index if not exists customer_notes_customer_id_idx on public.customer_notes(customer_id);
create index if not exists customer_notes_author_id_idx on public.customer_notes(author_id);
create trigger customer_notes_touch before update on public.customer_notes for each row execute function public.touch_updated_at();

-- people · Customer profile extras: Front desk Customer Details fields that are not on the core customers row: title, home / work phone, alternative contact, reference, attributes (R-J01, Customer Details.pdf).
-- access:
--   · front_desk write
--   · customer read
create table if not exists public.customer_profiles (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_id uuid not null references public.customers(id) on delete set null,
  -- Mr. / Ms. / Dr.
  title text,
  home_phone text,
  work_phone text,
  -- Name of another person to call
  alt_contact text,
  -- How they heard about Petrock
  reference text,
  -- Staff flags e.g. VIP, Late payer
  attributes jsonb,
  customer_since date
);
create index if not exists customer_profiles_customer_id_idx on public.customer_profiles(customer_id);
create trigger customer_profiles_touch before update on public.customer_profiles for each row execute function public.touch_updated_at();

-- people · Customers: Pet parents. One row per household account; linked to a user when they sign up in the app.
create table if not exists public.customers (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references public.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  mobile text not null,
  alt_phone text,
  address text,
  apt_suite text,
  city text,
  state text,
  zip text,
  status text not null check (status in ('active', 'inactive')),
  preferred_contact text,
  home_location_id uuid references public.locations(id) on delete set null,
  marketing_opt_in boolean not null default false,
  note text,
  -- Outstanding balance, USD
  balance numeric(12,2) not null
);
create index if not exists customers_user_id_idx on public.customers(user_id);
create index if not exists customers_home_location_id_idx on public.customers(home_location_id);
create trigger customers_touch before update on public.customers for each row execute function public.touch_updated_at();

-- daycare · Daycare bookings: A daycare day: pets, date, in/out times, computed item and price, status (same lifecycle).
create table if not exists public.daycare_bookings (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  code text not null,
  customer_id uuid not null references public.customers(id) on delete set null,
  pet_ids jsonb not null,
  date date not null,
  check_in_time time not null,
  check_out_time time not null,
  item text not null check (item in ('full_day', 'half_day', 'hour')),
  status text not null check (status in ('requested', 'pending_vaccines', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  -- USD
  subtotal numeric(12,2) not null,
  -- USD
  discount_total numeric(12,2) not null,
  -- USD
  tax_total numeric(12,2) not null,
  -- USD
  total numeric(12,2) not null,
  payment_status text not null check (payment_status in ('pending', 'authorized', 'paid', 'refunded', 'failed')),
  notes text
);
create index if not exists daycare_bookings_location_idx on public.daycare_bookings(location_id);
create index if not exists daycare_bookings_customer_id_idx on public.daycare_bookings(customer_id);
create trigger daycare_bookings_touch before update on public.daycare_bookings for each row execute function public.touch_updated_at();

-- daycare · Daycare pricing: Full day / half day / play hour / walk with prices and the hour threshold.
create table if not exists public.daycare_pricing (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  item text not null check (item in ('full_day', 'half_day', 'hour', 'walk')),
  name text not null,
  -- USD
  price numeric(12,2) not null,
  -- Half day below, full day at/above
  threshold_hours numeric(12,2),
  active boolean not null default false
);
create trigger daycare_pricing_touch before update on public.daycare_pricing for each row execute function public.touch_updated_at();

-- commerce · Discounts: Multi-dog (per dog per night), long-stay (percent, paid in full, not holiday) and prepay discounts.
create table if not exists public.discounts (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  kind text not null check (kind in ('multi_dog', 'long_stay', 'prepay', 'daycare_extra_pet')),
  room_type_id uuid references public.room_types(id) on delete set null,
  dog_count integer,
  min_nights integer,
  -- Per dog per night (multi_dog) or per pet (daycare)
  amount_off numeric(12,2) not null,
  percent_off numeric(12,2),
  requires_paid_in_full boolean not null default false,
  excludes_holidays boolean not null default false,
  active boolean not null default false
);
create index if not exists discounts_room_type_id_idx on public.discounts(room_type_id);
create trigger discounts_touch before update on public.discounts for each row execute function public.touch_updated_at();

-- people · Employees: Staff records with job, status, calendar colour, working hours and hashed PIN.
create table if not exists public.employees (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  display_name text,
  email text,
  phone text,
  department text,
  job_title text,
  status text not null check (status in ('active', 'inactive', 'on_leave')),
  color text,
  is_groomer boolean not null default false,
  is_handler boolean not null default false,
  pin_hash text,
  working_hours jsonb,
  date_started date,
  note text
);
create index if not exists employees_location_idx on public.employees(location_id);
create index if not exists employees_user_id_idx on public.employees(user_id);
create trigger employees_touch before update on public.employees for each row execute function public.touch_updated_at();

-- comms · Staff feedback: Feedback staff leave from any page (FeedbackButton); the owner reads it in an inbox.
create table if not exists public.feedback (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references public.users(id) on delete set null,
  user_name text not null,
  role text not null,
  page_code text not null,
  route text not null,
  category text not null check (category in ('bug', 'idea', 'question', 'praise')),
  text text not null,
  status text not null check (status in ('new', 'seen', 'done')),
  owner_reply text
);
create index if not exists feedback_location_idx on public.feedback(location_id);
create index if not exists feedback_user_id_idx on public.feedback(user_id);
create trigger feedback_touch before update on public.feedback for each row execute function public.touch_updated_at();

-- commerce · Fees: Card / non-cash fee (3.89% through the app) and any other surcharge.
create table if not exists public.fees (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  kind text not null check (kind in ('card', 'other')),
  percent numeric(12,2) not null,
  applies_to text not null check (applies_to in ('card_payments', 'all')),
  active boolean not null default false
);
create trigger fees_touch before update on public.fees for each row execute function public.touch_updated_at();

-- grooming · Groomer column preferences: Per staff user per location: groomer column order, colour and hidden state on the grooming day view (Grooming.png context menu).
-- access:
--   · staff write own
create table if not exists public.groomer_column_prefs (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references public.users(id) on delete set null,
  groomer_id uuid not null references public.employees(id) on delete set null,
  -- Hex tint; null = employee colour
  color text,
  sort_order integer not null,
  hidden boolean not null default false
);
create index if not exists groomer_column_prefs_location_idx on public.groomer_column_prefs(location_id);
create index if not exists groomer_column_prefs_user_id_idx on public.groomer_column_prefs(user_id);
create index if not exists groomer_column_prefs_groomer_id_idx on public.groomer_column_prefs(groomer_id);
create trigger groomer_column_prefs_touch before update on public.groomer_column_prefs for each row execute function public.touch_updated_at();

-- core · Holidays & closures: Dates marked holiday (excluded from long-stay discounts) or boarding closed.
create table if not exists public.holidays (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  date date not null,
  name text not null,
  is_holiday boolean not null default false,
  boarding_closed boolean not null default false
);
create index if not exists holidays_location_idx on public.holidays(location_id);
create trigger holidays_touch before update on public.holidays for each row execute function public.touch_updated_at();

-- commerce · Invoices: Invoice per booking / appointment / daycare day with line items, totals, deposit and balance.
create table if not exists public.invoices (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  number text not null,
  customer_id uuid not null references public.customers(id) on delete set null,
  source_type text not null check (source_type in ('booking', 'appointment', 'daycare')),
  source_id text not null,
  lines jsonb not null,
  -- USD
  subtotal numeric(12,2) not null,
  -- USD
  discount_total numeric(12,2) not null,
  -- USD
  fee_total numeric(12,2) not null,
  -- USD
  tax_total numeric(12,2) not null,
  -- USD
  total numeric(12,2) not null,
  -- USD
  deposit numeric(12,2) not null,
  -- USD
  balance numeric(12,2) not null,
  status text not null check (status in ('draft', 'issued', 'paid', 'void')),
  issued_at timestamptz,
  footer text
);
create index if not exists invoices_location_idx on public.invoices(location_id);
create index if not exists invoices_customer_id_idx on public.invoices(customer_id);
create trigger invoices_touch before update on public.invoices for each row execute function public.touch_updated_at();

-- core · Locations: Petrock stores (Encino, Westwood). Adding a location inserts a row; everything else is scoped by location_id.
-- access:
--   · everyone read
--   · owner write
create table if not exists public.locations (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  short_name text not null,
  slug text not null,
  city text not null,
  address text not null,
  phone text,
  timezone text not null,
  -- weekday -> {open, close} | null
  hours jsonb not null,
  sort_order integer not null,
  active boolean not null default false,
  note text
);
create trigger locations_touch before update on public.locations for each row execute function public.touch_updated_at();

-- system · Lookup lists: Extendable dropdown lists used by the add forms: breed, color, city, reference, attribute, customer title, temper (R-J04).
-- access:
--   · staff write
create table if not exists public.lookup_values (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in ('breed', 'color', 'city', 'reference', 'attribute', 'customer_title', 'temper')),
  value text not null,
  sort_order integer not null,
  active boolean not null default false
);
create trigger lookup_values_touch before update on public.lookup_values for each row execute function public.touch_updated_at();

-- comms · Messages: Chat messages between a customer and the front desk (text, optional image, system markers).
create table if not exists public.messages (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  conversation_id uuid not null references public.conversations(id) on delete set null,
  sender text not null check (sender in ('customer', 'staff', 'system')),
  sender_user_id uuid references public.users(id) on delete set null,
  text text not null,
  image_url text,
  sent_at timestamptz not null,
  read boolean not null default false
);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_sender_user_id_idx on public.messages(sender_user_id);
create trigger messages_touch before update on public.messages for each row execute function public.touch_updated_at();

-- comms · Notifications: In-app notifications to a user (booking confirmed, payment done, vaccine expiring...).
create table if not exists public.notifications (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references public.users(id) on delete set null,
  kind text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  sent_at timestamptz not null
);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create trigger notifications_touch before update on public.notifications for each row execute function public.touch_updated_at();

-- grooming · Grooming packages: Gold / Platinum / Diamond priced by dog size S/M/L/XL/Giant with calendar minutes per size and inclusions.
create table if not exists public.packages (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  tier text not null,
  inclusions text,
  -- USD
  price_s numeric(12,2) not null,
  -- USD
  price_m numeric(12,2) not null,
  -- USD
  price_l numeric(12,2) not null,
  -- USD
  price_xl numeric(12,2) not null,
  -- USD
  price_giant numeric(12,2) not null,
  minutes_s integer not null,
  minutes_m integer not null,
  minutes_l integer not null,
  minutes_xl integer not null,
  minutes_giant integer not null,
  notes text,
  sort_order integer not null,
  active boolean not null default false
);
create trigger packages_touch before update on public.packages for each row execute function public.touch_updated_at();

-- design · Page layouts: Per page code: section order and hidden sections (builder tool layout editor).
create table if not exists public.page_layouts (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  page_code text not null,
  order jsonb not null,
  hidden jsonb not null
);
create trigger page_layouts_touch before update on public.page_layouts for each row execute function public.touch_updated_at();

-- commerce · Payments: Payment attempts and results through the PaymentProvider (mock now, Stripe later).
create table if not exists public.payments (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  invoice_id uuid references public.invoices(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete set null,
  -- USD
  amount numeric(12,2) not null,
  method text not null check (method in ('card', 'cash')),
  status text not null check (status in ('pending', 'authorized', 'paid', 'refunded', 'failed')),
  provider text not null,
  provider_ref text,
  card_brand text,
  card_last4 text,
  is_deposit boolean not null default false,
  paid_at timestamptz,
  refund_of uuid references public.payments(id) on delete set null,
  note text
);
create index if not exists payments_location_idx on public.payments(location_id);
create index if not exists payments_invoice_id_idx on public.payments(invoice_id);
create index if not exists payments_customer_id_idx on public.payments(customer_id);
create index if not exists payments_refund_of_idx on public.payments(refund_of);
create trigger payments_touch before update on public.payments for each row execute function public.touch_updated_at();

-- core · Permissions: Role -> permission string grants (see src/auth/permissions.ts).
create table if not exists public.permissions (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  role text not null,
  permission text not null,
  granted boolean not null default false
);
create trigger permissions_touch before update on public.permissions for each row execute function public.touch_updated_at();

-- pets · Pet profile extras: Front desk Pet Details fields beyond the core pets row: registration and microchip numbers, approximate-age flag, temper, saved groom style (R-C06, Pet Details .pdf).
-- access:
--   · front_desk write
create table if not exists public.pet_profiles (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  pet_id uuid not null references public.pets(id) on delete set null,
  registration_number text,
  microchip_number text,
  -- Date of birth is an estimate
  dob_approximate boolean not null default false,
  -- Front desk temper (mirrors personality on the app)
  temper text,
  -- Saved groom style used to prefill groom bookings
  groom_style text,
  groom_notes text
);
create index if not exists pet_profiles_pet_id_idx on public.pet_profiles(pet_id);
create trigger pet_profiles_touch before update on public.pet_profiles for each row execute function public.touch_updated_at();

-- pets · Pets: Dogs (and other pets) with profile, care instructions and approval status.
create table if not exists public.pets (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_id uuid not null references public.customers(id) on delete set null,
  name text not null,
  type text not null,
  breed text,
  is_mixed boolean not null default false,
  sex text not null check (sex in ('male', 'female')),
  neutered boolean not null default false,
  color text,
  weight_lbs numeric(12,2),
  size text check (size in ('S', 'M', 'L', 'XL', 'Giant')),
  date_of_birth date,
  personality text,
  socialized_with jsonb,
  can_have_treats boolean not null default false,
  own_food boolean not null default false,
  meals_per_day text,
  feeding_am text,
  feeding_midday text,
  feeding_pm text,
  medical_conditions text,
  allergies text,
  vet_id uuid references public.vets(id) on delete set null,
  -- Staff flags e.g. Aggressive, Muzzle
  attributes jsonb,
  approval_status text not null check (approval_status in ('pending', 'needs_details', 'approved')),
  status text not null check (status in ('active', 'inactive')),
  photo_url text,
  note text
);
create index if not exists pets_customer_id_idx on public.pets(customer_id);
create index if not exists pets_vet_id_idx on public.pets(vet_id);
create trigger pets_touch before update on public.pets for each row execute function public.touch_updated_at();

-- commerce · Room rates: Nightly rate per room type, day kind (Mon-Thu / Fri-Sun) and season (null = base).
create table if not exists public.rates (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  room_type_id uuid not null references public.room_types(id) on delete set null,
  day_kind text not null check (day_kind in ('weekday', 'weekend')),
  season_id uuid references public.seasons(id) on delete set null,
  -- USD
  price_per_night numeric(12,2) not null,
  location_id uuid references public.locations(id)
);
create index if not exists rates_room_type_id_idx on public.rates(room_type_id);
create index if not exists rates_season_id_idx on public.rates(season_id);
create index if not exists rates_location_id_idx on public.rates(location_id);
create trigger rates_touch before update on public.rates for each row execute function public.touch_updated_at();

-- comms · Reviews: Customer reviews with rating and tags; moderated (pending -> published | archived).
create table if not exists public.reviews (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_id uuid not null references public.customers(id) on delete set null,
  rating numeric(12,2) not null,
  title text,
  body text,
  tags jsonb,
  status text not null check (status in ('pending', 'published', 'archived'))
);
create index if not exists reviews_location_idx on public.reviews(location_id);
create index if not exists reviews_customer_id_idx on public.reviews(customer_id);
create trigger reviews_touch before update on public.reviews for each row execute function public.touch_updated_at();

-- core · Roles: Role catalog with label and description; the side menu and permissions key off `key`.
create table if not exists public.roles (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  key text not null,
  label text not null,
  description text,
  -- Per-role side menu overrides (category -> visible)
  menu jsonb
);
create trigger roles_touch before update on public.roles for each row execute function public.touch_updated_at();

-- hotel · Room types: Penthouse and Suite with inclusions copy and fit rules (max weight).
create table if not exists public.room_types (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  key text not null,
  description text,
  -- Fit rule (30 lb bottom rooms, 55 lb suite) - see rules
  max_weight_lbs numeric(12,2),
  sort_order integer not null,
  photo_url text
);
create trigger room_types_touch before update on public.room_types for each row execute function public.touch_updated_at();

-- hotel · Rooms: Physical rooms per location: code, type, position (bottom/top) and timeline group.
create table if not exists public.rooms (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  -- Owning location (Encino / Westwood)
  location_id uuid not null references public.locations(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  code text not null,
  room_type_id uuid not null references public.room_types(id) on delete set null,
  position text check (position in ('bottom', 'top')),
  sort_order integer not null,
  active boolean not null default false,
  note text
);
create index if not exists rooms_location_idx on public.rooms(location_id);
create index if not exists rooms_room_type_id_idx on public.rooms(room_type_id);
create trigger rooms_touch before update on public.rooms for each row execute function public.touch_updated_at();

-- system · Business rules: Rules added in Settings > Rules at runtime (the code registry in src/rules is merged with these).
create table if not exists public.rules (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  rule_id text not null,
  title text not null,
  description text,
  category text not null,
  status text not null check (status in ('requested', 'in_dev', 'implemented', 'deprecated')),
  pages jsonb,
  source text,
  requested_by text
);
create trigger rules_touch before update on public.rules for each row execute function public.touch_updated_at();

-- hotel · Seasons: Date ranges with seasonal rates; holiday flag excludes long-stay discounts.
create table if not exists public.seasons (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  starts_on date not null,
  ends_on date not null,
  is_holiday boolean not null default false
);
create trigger seasons_touch before update on public.seasons for each row execute function public.touch_updated_at();

-- grooming · Services: Service catalog: hotel, daycare, grooming, extras (Veterinary travel, Vaccination fee).
create table if not exists public.services (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  category text not null check (category in ('hotel', 'daycare', 'grooming', 'extra')),
  -- Flat price when not size/package priced
  price numeric(12,2) not null,
  taxable_as text not null check (taxable_as in ('service', 'product', 'boarding')),
  active boolean not null default false,
  description text
);
create trigger services_touch before update on public.services for each row execute function public.touch_updated_at();

-- system · Settings: Key/value settings per scope (boarding charge rules, invoice numbering, general).
create table if not exists public.settings (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  key text not null,
  value jsonb not null,
  description text
);
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- commerce · Taxes: Tax settings: one named tax with service / product / boarding rates, prices exclusive by default.
create table if not exists public.taxes (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  tax_number text,
  service_rate numeric(12,2) not null,
  product_rate numeric(12,2) not null,
  boarding_rate numeric(12,2) not null,
  prices_inclusive boolean not null default false,
  active boolean not null default false
);
create trigger taxes_touch before update on public.taxes for each row execute function public.touch_updated_at();

-- core · Users: Login principals: staff and customers. Role is the primary role; permissions derive from it.
create table if not exists public.users (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  role text not null check (role in ('super_admin', 'owner', 'manager', 'front_desk', 'groomer', 'customer', 'public')),
  location_id uuid references public.locations(id),
  phone text,
  avatar_url text,
  active boolean not null default false,
  preferred_language text
);
create index if not exists users_location_id_idx on public.users(location_id);
create trigger users_touch before update on public.users for each row execute function public.touch_updated_at();

-- pets · Vaccine records: Per pet per vaccine: dates, proof upload (mock), status. Bookings stay pending_vaccines until every required record is verified.
create table if not exists public.vaccine_records (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  pet_id uuid not null references public.pets(id) on delete set null,
  vaccine_type_id uuid not null references public.vaccine_types(id) on delete set null,
  vaccinated_on date,
  expires_on date,
  proof_url text,
  proof_name text,
  status text not null check (status in ('missing', 'submitted', 'verified', 'expired', 'rejected')),
  verified_by uuid references public.users(id) on delete set null,
  verified_at timestamptz,
  note text
);
create index if not exists vaccine_records_pet_id_idx on public.vaccine_records(pet_id);
create index if not exists vaccine_records_vaccine_type_id_idx on public.vaccine_records(vaccine_type_id);
create index if not exists vaccine_records_verified_by_idx on public.vaccine_records(verified_by);
create trigger vaccine_records_touch before update on public.vaccine_records for each row execute function public.touch_updated_at();

-- pets · Vaccine types: Catalog: Rabies, DHPP (Distemper/Parvo), Bordetella, Leptospirosis, Canine Influenza; required or recommended.
create table if not exists public.vaccine_types (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  short_name text not null,
  required boolean not null default false,
  sort_order integer not null,
  note text
);
create trigger vaccine_types_touch before update on public.vaccine_types for each row execute function public.touch_updated_at();

-- pets · Vets: Veterinarians a pet can reference.
create table if not exists public.vets (
  -- Primary key
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  phone text,
  address text
);
create trigger vets_touch before update on public.vets for each row execute function public.touch_updated_at();

-- Access intent per role (enforced in the API layer / RLS later):
--   super_admin, owner   read/write everything, every location
--   manager              read/write at their location; approves PIN-gated actions
--   front_desk           read/write bookings, appointments, daycare, customers, pets, vaccines, payments, messages at their location
--   groomer              read appointments/pets/customers at their location; write own appointments
--   customer             read/write own customers/pets/vaccine_records/bookings/appointments/daycare_bookings/messages; read catalog tables
--   public               read locations, room_types, packages (website)
