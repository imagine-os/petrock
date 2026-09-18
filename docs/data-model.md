# Data model

_Generated from `src/data/schema/*.ts` by `npm run sql`. The TypeScript files are the source of truth; `supabase/schema.sql` is the Postgres draft; this page is the human view. The table library at `/#/dev/tables` shows the same with live row counts._

## Principles
- **Location is first class.** Location-scoped tables carry `location_id`; front desk and groomer are pinned to one, owner and super admin see all.
- **Same interface, two providers.** Pages call `useData()` / `useTable()` (`DataProvider`: list, get, insert, update, remove, subscribe). `MockProvider` (localStorage) today; `CompanyOsProvider` (REST `/t/petrock/api/:entity`, `/query`) later. Swap is one line in `src/data/DataContext.tsx`.
- **Prices live in tables.** rates, seasons, discounts, fees, taxes, packages, addons, daycare_pricing feed `src/pricing/engine.ts`; pages never hardcode a price.
- **One booking lifecycle.** requested -> pending_vaccines -> confirmed -> checked_in -> checked_out (+ cancelled, no_show) on bookings and daycare_bookings.
- **Money is USD numeric(12,2).**

## Mapping Mock -> Company-OS
| Mock (today) | Company-OS (later) |
| --- | --- |
| `localStorage['petrock.db.v1']` | `records` rows per entity (JSONB data) |
| table name | entity key |
| `location_id` | `org_unit_id` |
| `MockProvider.emit()` | polling or a realtime channel |
| `demoUsers` + `SessionProvider` | `/t/petrock/auth` + memberships |

## Tables (74)

### Core & locations

#### `auth_codes` (global)
Six-digit codes for email verification, password reset and sign-in confirmation. 10 minute expiry, 5 attempts, one live code per email + purpose.  
_Source: C-04, C-06 (D-010 OTP modal)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid, null | -> `users`  |
| `email` | text |  |
| `purpose` | enum (verify_email \| reset_password \| sign_in) |  |
| `channel` | enum (email \| sms) |  |
| `code` | text | Plain in the mock so the demo can show it; hashed server-side later |
| `expires_at` | timestamptz |  |
| `consumed_at` | timestamptz, null |  |
| `attempts` | int |  |

#### `auth_credentials` (global)
Customer email + password login (mock hash today; a real auth provider later). Tracks verification, failed attempts and lockout.  
_Source: C-02, C-03 (D-018)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid | -> `users`  |
| `email` | text | Lower-cased; unique |
| `password_hash` | text | Mock FNV-1a today; bcrypt/argon2 server-side later |
| `email_verified` | bool |  |
| `email_verified_at` | timestamptz, null |  |
| `phone` | text, null |  |
| `failed_attempts` | int |  |
| `locked_until` | timestamptz, null |  |
| `last_sign_in_at` | timestamptz, null |  |
| `password_changed_at` | timestamptz, null |  |
| `terms_accepted_at` | timestamptz |  |
| `remember_me` | bool | Last "remember me" choice (30 days vs session) |

**Access:** customer read own; system write

#### `capacities` (per location)
Max simultaneous bookings per location per kind (penthouse, suite, daycare, grooming).  
_Source: R-E10..E13_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `kind` | enum (penthouse \| suite \| daycare \| grooming) |  |
| `max_simultaneous` | int |  |
| `note` | text, null |  |

#### `holidays` (per location)
Dates marked holiday (excluded from long-stay discounts) or boarding closed.  
_Source: R-E15_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `date` | date |  |
| `name` | text |  |
| `is_holiday` | bool |  |
| `boarding_closed` | bool |  |

#### `locations` (global)
Petrock stores (Encino, Westwood). Adding a location inserts a row; everything else is scoped by location_id.  
_Source: entities 6_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `short_name` | text |  |
| `slug` | text |  |
| `city` | text |  |
| `address` | text |  |
| `phone` | text, null |  |
| `timezone` | text |  |
| `hours` | json | weekday -> {open, close} | null |
| `sort_order` | int |  |
| `active` | bool |  |
| `note` | text, null |  |

**Access:** everyone read; owner write

#### `permissions` (global)
Role -> permission string grants (see src/auth/permissions.ts).  
_Source: R-L05_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `role` | text |  |
| `permission` | text |  |
| `granted` | bool |  |

#### `roles` (global)
Role catalog with label and description; the side menu and permissions key off `key`.  
_Source: D-002, R-L05_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `key` | text |  |
| `label` | text |  |
| `description` | text, null |  |
| `menu` | json, null | Per-role side menu overrides (category -> visible) |

#### `users` (global)
Login principals: staff and customers. Role is the primary role; permissions derive from it.  
_Source: entities 20_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `email` | text |  |
| `role` | enum (super_admin \| owner \| manager \| front_desk \| groomer \| customer \| public) |  |
| `location_id` | uuid, null | -> `locations`  |
| `phone` | text, null |  |
| `avatar_url` | text, null |  |
| `active` | bool |  |
| `preferred_language` | text, null |  |

### People & staff

#### `customer_notes` (global)
Timeline of staff notes on a customer (who, when, pinned). The 100-char customers.note stays the headline note (R-J02).  
_Source: legacy Notes tab, Customer Details.pdf_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `customer_id` | uuid | -> `customers`  |
| `author_id` | uuid, null | -> `users`  |
| `author_name` | text |  |
| `text` | text |  |
| `pinned` | bool |  |

**Access:** staff write; owner read

#### `customer_profiles` (global)
Front desk Customer Details fields that are not on the core customers row: title, home / work phone, alternative contact, reference, attributes (R-J01, Customer Details.pdf).  
_Source: Customer Details.pdf, entities 1_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `customer_id` | uuid | -> `customers`  |
| `title` | text, null | Mr. / Ms. / Dr. |
| `home_phone` | text, null |  |
| `work_phone` | text, null |  |
| `alt_contact` | text, null | Name of another person to call |
| `reference` | text, null | How they heard about Petrock |
| `attributes` | json, null | Staff flags e.g. VIP, Late payer |
| `customer_since` | date, null |  |

**Access:** front_desk write; customer read

#### `customers` (global)
Pet parents. One row per household account; linked to a user when they sign up in the app.  
_Source: entities 1_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid, null | -> `users`  |
| `first_name` | text |  |
| `last_name` | text |  |
| `email` | text |  |
| `mobile` | text |  |
| `alt_phone` | text, null |  |
| `address` | text, null |  |
| `apt_suite` | text, null |  |
| `city` | text, null |  |
| `state` | text, null |  |
| `zip` | text, null |  |
| `status` | enum (active \| inactive) |  |
| `preferred_contact` | text, null |  |
| `home_location_id` | uuid, null | -> `locations`  |
| `marketing_opt_in` | bool |  |
| `note` | text, null |  |
| `balance` | money | Outstanding balance, USD |

#### `emergency_contacts` (global)
Who to call about a pet when the parent is unreachable (customer-level, optionally pinned to one pet). Captured on the Add / Edit pet wizard step "Vet & emergency".  
_Source: customer-home-pets (R-X22)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `customer_id` | uuid | -> `customers`  |
| `pet_id` | uuid, null | -> `pets`  |
| `name` | text |  |
| `phone` | text |  |
| `relationship` | text, null | e.g. Partner, Neighbour, Dog walker |
| `note` | text, null |  |

**Access:** customer read/write own; staff read

#### `employees` (per location)
Staff records with job, status, calendar colour, working hours and hashed PIN.  
_Source: entities 20_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid, null | -> `users`  |
| `name` | text |  |
| `display_name` | text, null |  |
| `email` | text, null |  |
| `phone` | text, null |  |
| `department` | text, null |  |
| `job_title` | text, null |  |
| `status` | enum (active \| inactive \| on_leave) |  |
| `color` | text, null |  |
| `is_groomer` | bool |  |
| `is_handler` | bool |  |
| `pin_hash` | text, null |  |
| `working_hours` | json, null |  |
| `date_started` | date, null |  |
| `note` | text, null |  |

#### `tasks` (per location)
Management task list (F-68): to-dos per location with assignee, due date, priority and status; the "Tasks" and "Check List" items of the Figma sidebar.  
_Source: extras-manual-website (F-68); education-1.jpg (Tasks shell), employees-1.jpg (Check List)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `title` | text |  |
| `description` | text, null |  |
| `assignee_id` | uuid, null | -> `employees`  |
| `created_by` | uuid, null | -> `users`  |
| `due_on` | date, null |  |
| `priority` | enum (low \| normal \| high) |  |
| `status` | enum (open \| in_progress \| done) |  |
| `kind` | enum (task \| checklist) |  |
| `completed_at` | timestamptz, null |  |

**Access:** staff read/write; manager delete (PIN)

#### `training_completions` (per location)
Which ops-manual chapter each employee has completed (Education, F-66): one row per employee per chapter, with the lesson mode and who signed it off.  
_Source: extras-manual-website (F-66, M-xx)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `employee_id` | uuid | -> `employees`  |
| `user_id` | uuid, null | -> `users`  |
| `chapter_slug` | text | File name of the chapter in docs/ops-manual/en |
| `chapter_code` | text | Manual page code (M-xx) |
| `mode` | enum (in_person \| online) |  |
| `completed_at` | timestamptz |  |
| `signed_off_by` | uuid, null | -> `employees`  |
| `note` | text, null |  |

**Access:** staff read own; manager write

### Pets & vaccines

#### `pet_lookups` (global)
Extendable option lists for pet forms: breeds and colours (entities 5: "extendable inline via +"). Customers and staff can add a value from the form.  
_Source: entities 5, Pet Edit.png_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `kind` | enum (breed \| color) |  |
| `value` | text |  |
| `sort_order` | int |  |
| `active` | bool |  |
| `added_by` | text, null | user id when added from a form |

**Access:** everyone read; signed-in add

#### `pet_profiles` (global)
Front desk Pet Details fields beyond the core pets row: registration and microchip numbers, approximate-age flag, temper, saved groom style (R-C06, Pet Details .pdf).  
_Source: Pet Details .pdf, Groom Booking .pdf, entities 2, 13_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `pet_id` | uuid | -> `pets`  |
| `registration_number` | text, null |  |
| `microchip_number` | text, null |  |
| `dob_approximate` | bool | Date of birth is an estimate |
| `temper` | text, null | Front desk temper (mirrors personality on the app) |
| `groom_style` | text, null | Saved groom style used to prefill groom bookings |
| `groom_notes` | text, null |  |

**Access:** front_desk write

#### `pets` (global)
Dogs (and other pets) with profile, care instructions and approval status.  
_Source: entities 2_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `customer_id` | uuid | -> `customers`  |
| `name` | text |  |
| `type` | text |  |
| `breed` | text, null |  |
| `is_mixed` | bool |  |
| `sex` | enum (male \| female) |  |
| `neutered` | bool |  |
| `color` | text, null |  |
| `weight_lbs` | numeric, null |  |
| `size` | enum (S \| M \| L \| XL \| Giant), null |  |
| `date_of_birth` | date, null |  |
| `personality` | text, null |  |
| `socialized_with` | json, null |  |
| `can_have_treats` | bool |  |
| `own_food` | bool |  |
| `meals_per_day` | text, null |  |
| `feeding_am` | text, null |  |
| `feeding_midday` | text, null |  |
| `feeding_pm` | text, null |  |
| `medical_conditions` | text, null |  |
| `allergies` | text, null |  |
| `vet_id` | uuid, null | -> `vets`  |
| `attributes` | json, null | Staff flags e.g. Aggressive, Muzzle |
| `approval_status` | enum (pending \| needs_details \| approved) |  |
| `status` | enum (active \| inactive) |  |
| `photo_url` | text, null |  |
| `note` | text, null |  |

#### `vaccine_records` (global)
Per pet per vaccine: dates, proof upload (mock), status. Bookings stay pending_vaccines until every required record is verified.  
_Source: entities 3, R-A05_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `pet_id` | uuid | -> `pets`  |
| `vaccine_type_id` | uuid | -> `vaccine_types`  |
| `vaccinated_on` | date, null |  |
| `expires_on` | date, null |  |
| `proof_url` | text, null |  |
| `proof_name` | text, null |  |
| `status` | enum (missing \| submitted \| verified \| expired \| rejected) |  |
| `verified_by` | uuid, null | -> `users`  |
| `verified_at` | timestamptz, null |  |
| `note` | text, null |  |

#### `vaccine_types` (global)
Catalog: Rabies, DHPP (Distemper/Parvo), Bordetella, Leptospirosis, Canine Influenza; required or recommended.  
_Source: entities 3, R-B01..B04_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `short_name` | text |  |
| `required` | bool |  |
| `sort_order` | int |  |
| `note` | text, null |  |

#### `vets` (global)
Veterinarians a pet can reference.  
_Source: entities 4_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `phone` | text, null |  |
| `address` | text, null |  |

### Hotel

#### `booking_change_requests` (per location)
A pet parent asks to modify dates, add / remove a pet, add grooming or cancel a stay. The front desk approves or declines; approving a cancellation of a confirmed stay is PIN-gated (R-I06).  
_Source: C-39 / C-41 (no Figma screen; D-003 hotel consistency)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `booking_id` | uuid | -> `bookings`  |
| `customer_id` | uuid | -> `customers`  |
| `kind` | enum (modify_dates \| add_pet \| remove_pet \| add_grooming \| cancel \| other) |  |
| `requested_check_in` | timestamptz, null |  |
| `requested_check_out` | timestamptz, null |  |
| `pet_ids` | json, null |  |
| `message` | text, null |  |
| `status` | enum (open \| approved \| declined \| withdrawn) |  |
| `handled_by` | uuid, null | -> `users`  |
| `handled_at` | timestamptz, null |  |
| `staff_note` | text, null |  |

#### `booking_events` (per location)
Activity trail per hotel booking: creation, status changes (with the approval that allowed them), room moves, date changes, notes, payments. Replaces the legacy "Added / Last edited by" line (R-J08).  
_Source: F-12 booking detail; R-J08, R-I06_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `booking_id` | uuid | -> `bookings`  |
| `kind` | enum (created \| status \| room \| dates \| note \| payment \| edited) |  |
| `from_status` | enum (requested \| pending_vaccines \| confirmed \| checked_in \| checked_out \| cancelled \| no_show), null |  |
| `to_status` | enum (requested \| pending_vaccines \| confirmed \| checked_in \| checked_out \| cancelled \| no_show), null |  |
| `summary` | text |  |
| `user_id` | uuid, null | -> `users`  |
| `user_name` | text |  |
| `approval_id` | uuid, null | -> `approvals`  |
| `details` | json, null |  |
| `at` | timestamptz |  |

**Access:** staff read; system write

#### `booking_pet_care` (global)
Per pet per hotel stay: feeding, own food, belongings, flea medication brand and date, extra notes (the customer fills these in C-32; the desk reads them at check-in).  
_Source: entities 11, Booking Details Add Pets*.png_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `booking_id` | uuid | -> `bookings`  |
| `booking_pet_id` | uuid | -> `booking_pets`  |
| `pet_id` | uuid | -> `pets`  |
| `feeding_instructions` | text, null |  |
| `meals_per_day` | text, null |  |
| `own_food` | bool |  |
| `belongings` | text, null | Bed, toys, leash... brought along |
| `medication_count` | int, null |  |
| `dosing_frequency` | text, null | e.g. '1 daily (AM only)' |
| `flea_brand` | text, null |  |
| `flea_last_dose_on` | date, null |  |
| `emergency_contact` | text, null |  |
| `notes` | text, null |  |

#### `booking_pets` (global)
Pets on a stay with the per-booking medical questionnaire.  
_Source: entities 10-11_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `booking_id` | uuid | -> `bookings`  |
| `pet_id` | uuid | -> `pets`  |
| `room_id` | uuid, null | -> `rooms`  |
| `takes_medication` | bool |  |
| `medication` | text, null |  |
| `dosing` | text, null |  |
| `flea_medication` | bool |  |
| `medical_alert` | text, null |  |

#### `booking_services` (global)
Extra services attached to a hotel booking (Veterinary travel, Vaccination fee...): rate snapshot, quantity, occurrence and Morning / Afternoon / Evening flags (R-D16).  
_Source: Board Booking.pdf; R-D16_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `booking_id` | uuid | -> `bookings`  |
| `service_id` | uuid | -> `services`  |
| `label` | text |  |
| `pet_id` | uuid, null | -> `pets`  |
| `rate` | money |  |
| `qty` | int |  |
| `total` | money |  |
| `occurs` | enum (once \| daily \| per_night) |  |
| `morning` | bool |  |
| `afternoon` | bool |  |
| `evening` | bool |  |
| `note` | text, null |  |

**Access:** staff read/write

#### `bookings` (per location)
A stay: customer, dates, room type, status (one lifecycle), totals and payment status.  
_Source: entities 9_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `code` | text | Human reference e.g. PR-1042 |
| `customer_id` | uuid | -> `customers`  |
| `room_type_id` | uuid | -> `room_types`  |
| `room_id` | uuid, null | -> `rooms`  |
| `check_in` | timestamptz |  |
| `check_out` | timestamptz |  |
| `nights` | int |  |
| `status` | enum (requested \| pending_vaccines \| confirmed \| checked_in \| checked_out \| cancelled \| no_show) |  |
| `share_room` | bool |  |
| `add_grooming` | bool |  |
| `handler_id` | uuid, null | -> `employees`  |
| `paid_in_full` | bool |  |
| `payment_method` | enum (card \| cash), null |  |
| `payment_status` | enum (pending \| authorized \| paid \| refunded \| failed) |  |
| `subtotal` | money | USD |
| `discount_total` | money | USD |
| `fee_total` | money | USD |
| `tax_total` | money | USD |
| `total` | money | USD |
| `deposit` | money | USD |
| `quote` | json, null | Pricing engine breakdown at booking time |
| `notes` | text, null |  |
| `include_notes_on_invoice` | bool |  |
| `source` | text, null | app | desk | phone |

#### `room_types` (global)
Penthouse and Suite with inclusions copy and fit rules (max weight).  
_Source: entities 8, R-D01..D03_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `key` | text |  |
| `description` | text, null |  |
| `max_weight_lbs` | numeric, null | Fit rule (30 lb bottom rooms, 55 lb suite) - see rules |
| `sort_order` | int |  |
| `photo_url` | text, null |  |

#### `rooms` (per location)
Physical rooms per location: code, type, position (bottom/top) and timeline group.  
_Source: entities 8, R-K07_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `code` | text |  |
| `room_type_id` | uuid | -> `room_types`  |
| `position` | enum (bottom \| top), null |  |
| `sort_order` | int |  |
| `active` | bool |  |
| `note` | text, null |  |

#### `seasons` (global)
Date ranges with seasonal rates; holiday flag excludes long-stay discounts.  
_Source: R-D06, R-E15_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `starts_on` | date |  |
| `ends_on` | date |  |
| `is_holiday` | bool |  |

### Grooming & Spa

#### `addons` (global)
Add-ons (Furminator, Medicated Shampoo, Nail Trim...) with price, starting-at flag, added time and employee restriction.  
_Source: R-G08..G13_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `price` | money | USD |
| `starting_at` | bool |  |
| `added_minutes_sm` | int |  |
| `added_minutes_l` | int |  |
| `employee_type` | text, null |  |
| `description` | text, null |  |
| `active` | bool |  |

#### `appointment_extras` (global)
Groom Bookings form fields not on the core appointments row: reminder, pickup / delivery, discount %, payment method, include-notes-on-invoice, groom style at booking (Groom Booking .pdf).  
_Source: Groom Booking .pdf, entities 12_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `appointment_id` | uuid | -> `appointments`  |
| `reminder` | bool |  |
| `pickup_at` | timestamptz, null |  |
| `delivery_at` | timestamptz, null |  |
| `discount_pct` | numeric | Percent discount applied with manager PIN (R-P01) |
| `payment_method` | enum (card \| cash), null |  |
| `include_notes_on_invoice` | bool |  |
| `groom_style` | text, null |  |
| `approval_id` | uuid, null | -> `approvals`  |
| `invoice_id` | uuid, null | -> `invoices`  |

**Access:** front_desk write

#### `appointments` (per location)
Grooming & Spa appointments: pet, package, add-ons, groomer, time, status, linked hotel booking.  
_Source: entities 12_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `code` | text |  |
| `customer_id` | uuid | -> `customers`  |
| `pet_id` | uuid | -> `pets`  |
| `package_id` | uuid, null | -> `packages`  |
| `addon_ids` | json, null |  |
| `groomer_id` | uuid, null | -> `employees`  |
| `starts_at` | timestamptz |  |
| `duration_min` | int |  |
| `status` | enum (requested \| confirmed \| in_progress \| done \| cancelled \| no_show) |  |
| `booking_id` | uuid, null | -> `bookings`  |
| `size` | enum (S \| M \| L \| XL \| Giant), null |  |
| `subtotal` | money | USD |
| `tax_total` | money | USD |
| `total` | money | USD |
| `payment_status` | enum (pending \| authorized \| paid \| refunded \| failed) |  |
| `notes` | text, null |  |

#### `groomer_column_prefs` (per location)
Per staff user per location: groomer column order, colour and hidden state on the grooming day view (Grooming.png context menu).  
_Source: Grooming.png, open question 82_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid | -> `users`  |
| `groomer_id` | uuid | -> `employees`  |
| `color` | text, null | Hex tint; null = employee colour |
| `sort_order` | int |  |
| `hidden` | bool |  |

**Access:** staff write own

#### `grooming_orders` (per location)
One customer booking of Grooming & Spa for one or more pets at one time: groups the per-pet appointments, carries the payment and the one booking lifecycle status. Past orders can be re-created (R-G16).  
_Source: Frame 1171276434/35.png, entities 12_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `code` | text | Human reference e.g. GS-1042 |
| `customer_id` | uuid | -> `customers`  |
| `appointment_ids` | json | appointments.id per pet |
| `pet_ids` | json | pets.id in order |
| `starts_at` | timestamptz |  |
| `duration_min` | int | Longest chair time; pets are groomed in parallel up to the grooming capacity |
| `groomer_id` | uuid, null | -> `employees`  |
| `status` | enum (requested \| pending_vaccines \| confirmed \| checked_in \| checked_out \| cancelled \| no_show) |  |
| `payment_method` | enum (card \| cash), null |  |
| `payment_status` | enum (pending \| authorized \| paid \| refunded \| failed) |  |
| `subtotal` | money | USD |
| `tax_total` | money | USD |
| `fee_total` | money | USD |
| `total` | money | USD |
| `invoice_id` | uuid, null | -> `invoices`  |
| `notes` | text, null |  |
| `source` | text, null | app | desk | recreate |

**Access:** customer read own; front desk read/write; owner read

#### `packages` (global)
Gold / Platinum / Diamond priced by dog size S/M/L/XL/Giant with calendar minutes per size and inclusions.  
_Source: R-G01..G07_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `tier` | text |  |
| `inclusions` | text, null |  |
| `price_s` | money | USD |
| `price_m` | money | USD |
| `price_l` | money | USD |
| `price_xl` | money | USD |
| `price_giant` | money | USD |
| `minutes_s` | int |  |
| `minutes_m` | int |  |
| `minutes_l` | int |  |
| `minutes_xl` | int |  |
| `minutes_giant` | int |  |
| `notes` | text, null |  |
| `sort_order` | int |  |
| `active` | bool |  |

#### `services` (global)
Service catalog: hotel, daycare, grooming, extras (Veterinary travel, Vaccination fee).  
_Source: entities 10, 15_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `category` | enum (hotel \| daycare \| grooming \| extra) |  |
| `price` | money | Flat price when not size/package priced |
| `taxable_as` | enum (service \| product \| boarding) |  |
| `active` | bool |  |
| `description` | text, null |  |

### Daycare

#### `daycare_booking_pets` (global)
Per pet on a daycare day: the additional pet details questionnaire (vet-recommended flea medication with brand and date, medical alerts).  
_Source: DayCare-2.png, R-A10_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `daycare_booking_id` | uuid | -> `daycare_bookings`  |
| `pet_id` | uuid | -> `pets`  |
| `flea_medication` | bool | On a vet-recommended flea medication |
| `flea_brand` | text, null |  |
| `flea_date` | date, null | Last application |
| `medical_alert` | text, null |  |

**Access:** customer write own; front desk read

#### `daycare_bookings` (per location)
A daycare day: pets, date, in/out times, computed item and price, status (same lifecycle).  
_Source: entities 14_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `code` | text |  |
| `customer_id` | uuid | -> `customers`  |
| `pet_ids` | json |  |
| `date` | date |  |
| `check_in_time` | time |  |
| `check_out_time` | time |  |
| `item` | enum (full_day \| half_day \| hour) |  |
| `status` | enum (requested \| pending_vaccines \| confirmed \| checked_in \| checked_out \| cancelled \| no_show) |  |
| `subtotal` | money | USD |
| `discount_total` | money | USD |
| `tax_total` | money | USD |
| `total` | money | USD |
| `payment_status` | enum (pending \| authorized \| paid \| refunded \| failed) |  |
| `notes` | text, null |  |

#### `daycare_pricing` (global)
Full day / half day / play hour / walk with prices and the hour threshold.  
_Source: R-F01..F05_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `item` | enum (full_day \| half_day \| hour \| walk) |  |
| `name` | text |  |
| `price` | money | USD |
| `threshold_hours` | numeric, null | Half day below, full day at/above |
| `active` | bool |  |

#### `walks` (per location)
Walk log (Walking, F-67): which pet was walked by which handler, when, for how long, and how it went. Feeds the daycare "Walk" item later.  
_Source: extras-manual-website (F-67); front desk-7.jpg (Walk $12)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `pet_id` | uuid | -> `pets`  |
| `handler_id` | uuid, null | -> `employees`  |
| `booking_id` | uuid, null | -> `bookings`  |
| `daycare_booking_id` | uuid, null | -> `daycare_bookings`  |
| `started_at` | timestamptz |  |
| `duration_min` | int |  |
| `status` | enum (planned \| in_progress \| done \| skipped) |  |
| `potty` | bool, null |  |
| `note` | text, null |  |

**Access:** staff read/write; customer read own (later)

### Pricing, invoices & payments

#### `discounts` (global)
Multi-dog (per dog per night), long-stay (percent, paid in full, not holiday) and prepay discounts.  
_Source: R-E01..E08, R-F05_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `kind` | enum (multi_dog \| long_stay \| prepay \| daycare_extra_pet) |  |
| `room_type_id` | uuid, null | -> `room_types`  |
| `dog_count` | int, null |  |
| `min_nights` | int, null |  |
| `amount_off` | money | Per dog per night (multi_dog) or per pet (daycare) |
| `percent_off` | numeric, null |  |
| `requires_paid_in_full` | bool |  |
| `excludes_holidays` | bool |  |
| `active` | bool |  |

#### `fees` (global)
Card / non-cash fee (3.89% through the app) and any other surcharge.  
_Source: R-H03_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `kind` | enum (card \| other) |  |
| `percent` | numeric |  |
| `applies_to` | enum (card_payments \| all) |  |
| `active` | bool |  |

#### `invoices` (per location)
Invoice per booking / appointment / daycare day with line items, totals, deposit and balance.  
_Source: entities 15_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `number` | text |  |
| `customer_id` | uuid | -> `customers`  |
| `source_type` | enum (booking \| appointment \| daycare) |  |
| `source_id` | text |  |
| `lines` | json |  |
| `subtotal` | money | USD |
| `discount_total` | money | USD |
| `fee_total` | money | USD |
| `tax_total` | money | USD |
| `total` | money | USD |
| `deposit` | money | USD |
| `balance` | money | USD |
| `status` | enum (draft \| issued \| paid \| void) |  |
| `issued_at` | timestamptz, null |  |
| `footer` | text, null |  |

#### `payment_methods` (global)
Cards a customer saved in the app. Only brand, last4, expiry and the provider token are stored (mock now; Stripe PaymentMethod ids later).  
_Source: entities 16, Payment-1.png, R-M22_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `customer_id` | uuid | -> `customers`  |
| `type` | enum (card \| cash) |  |
| `brand` | enum (visa \| mastercard \| amex \| discover \| other), null |  |
| `last4` | text, null |  |
| `exp_month` | int, null |  |
| `exp_year` | int, null |  |
| `holder_name` | text, null |  |
| `billing_zip` | text, null |  |
| `is_default` | bool |  |
| `provider` | text | mock | stripe |
| `provider_token` | text, null | Tokenised reference; never a PAN |
| `status` | enum (active \| expired \| removed) |  |

#### `payments` (per location)
Payment attempts and results through the PaymentProvider (mock now, Stripe later).  
_Source: entities 16_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `invoice_id` | uuid, null | -> `invoices`  |
| `customer_id` | uuid | -> `customers`  |
| `amount` | money | USD |
| `method` | enum (card \| cash) |  |
| `status` | enum (pending \| authorized \| paid \| refunded \| failed) |  |
| `provider` | text |  |
| `provider_ref` | text, null |  |
| `card_brand` | text, null |  |
| `card_last4` | text, null |  |
| `is_deposit` | bool |  |
| `paid_at` | timestamptz, null |  |
| `refund_of` | uuid, null | -> `payments`  |
| `note` | text, null |  |

#### `rates` (global)
Nightly rate per room type, day kind (Mon-Thu / Fri-Sun) and season (null = base).  
_Source: R-D05_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `room_type_id` | uuid | -> `room_types`  |
| `day_kind` | enum (weekday \| weekend) |  |
| `season_id` | uuid, null | -> `seasons`  |
| `price_per_night` | money | USD |
| `location_id` | uuid, null | -> `locations`  |

#### `taxes` (global)
Tax settings: one named tax with service / product / boarding rates, prices exclusive by default.  
_Source: R-H04, R-H05_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `tax_number` | text, null |  |
| `service_rate` | numeric |  |
| `product_rate` | numeric |  |
| `boarding_rate` | numeric |  |
| `prices_inclusive` | bool |  |
| `active` | bool |  |

### Messages, reviews & feedback

#### `chat_quick_replies` (global)
Canned messages offered above the chat composer for customers and staff (C-82, F-61).  
_Source: D-018 (chat best practices)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `audience` | enum (customer \| staff) |  |
| `text` | text | May contain {pet} placeholder |
| `sort_order` | int |  |
| `active` | bool |  |

#### `conversation_assignments` (per location)
Which staff member owns a Front Desk chat thread (assign / reassign from the inbox).  
_Source: message-1.jpg (D-018 improvement)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `conversation_id` | uuid | -> `conversations`  |
| `assignee_user_id` | uuid, null | -> `users`  |
| `assignee_name` | text, null |  |
| `assigned_by` | uuid, null | -> `users`  |
| `assigned_at` | timestamptz |  |

**Access:** staff write

#### `conversations` (per location)
One Front Desk chat thread per customer per location.  
_Source: entities 22_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `customer_id` | uuid | -> `customers`  |
| `last_message_at` | timestamptz, null |  |
| `last_preview` | text, null |  |
| `unread_staff` | int |  |
| `unread_customer` | int |  |
| `status` | enum (open \| closed) |  |

#### `faq_items` (global)
Help & support questions and answers grouped by topic (C-77).  
_Source: profile.jpg (Help)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `question` | text |  |
| `answer` | text |  |
| `topic` | enum (booking \| payment \| vaccines \| app \| other) |  |
| `sort_order` | int |  |
| `active` | bool |  |

#### `feedback` (per location)
Feedback staff leave from any page (FeedbackButton); the owner reads it in an inbox.  
_Source: project brief_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid | -> `users`  |
| `user_name` | text |  |
| `role` | text |  |
| `page_code` | text |  |
| `route` | text |  |
| `category` | enum (bug \| idea \| question \| praise) |  |
| `text` | text |  |
| `status` | enum (new \| seen \| done) |  |
| `owner_reply` | text, null |  |

#### `messages` (global)
Chat messages between a customer and the front desk (text, optional image, system markers).  
_Source: entities 22_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `conversation_id` | uuid | -> `conversations`  |
| `sender` | enum (customer \| staff \| system) |  |
| `sender_user_id` | uuid, null | -> `users`  |
| `text` | text |  |
| `image_url` | text, null |  |
| `sent_at` | timestamptz |  |
| `read` | bool |  |

#### `notification_prefs` (global)
Per user per category: push / email / SMS on or off (C-75).  
_Source: setting.jpg, R-M23_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid | -> `users`  |
| `category` | enum (bookings \| vaccines \| chat \| payments \| promotions) |  |
| `push` | bool |  |
| `email` | bool |  |
| `sms` | bool |  |

#### `notifications` (global)
In-app notifications to a user (booking confirmed, payment done, vaccine expiring...).  
_Source: entities 21_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid | -> `users`  |
| `kind` | text |  |
| `title` | text |  |
| `body` | text, null |  |
| `link` | text, null |  |
| `read` | bool |  |
| `sent_at` | timestamptz |  |

#### `reviews` (per location)
Customer reviews with rating and tags; moderated (pending -> published | archived).  
_Source: entities 23_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `customer_id` | uuid | -> `customers`  |
| `rating` | numeric |  |
| `title` | text, null |  |
| `body` | text, null |  |
| `tags` | json, null |  |
| `status` | enum (pending \| published \| archived) |  |

#### `site_faqs` (global)
Questions and answers shown on the public website (P-11) grouped by topic; owners edit them here instead of in code.  
_Source: extras-manual-website (P-11)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `topic` | enum (hotel \| grooming \| daycare \| vaccines \| payments \| general) |  |
| `question` | text |  |
| `answer` | text |  |
| `sort_order` | int |  |
| `published` | bool |  |

**Access:** everyone read; owner write

#### `site_inquiries` (per location)
Contact-form submissions from the public website (P-10): who wrote, about what, for which location, and whether staff replied.  
_Source: extras-manual-website (P-10)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `name` | text |  |
| `email` | text |  |
| `phone` | text, null |  |
| `topic` | enum (hotel \| grooming \| daycare \| in_home \| other) |  |
| `message` | text |  |
| `status` | enum (new \| seen \| replied \| closed) |  |
| `replied_by` | uuid, null | -> `users`  |
| `replied_at` | timestamptz, null |  |

**Access:** public insert; staff read/write

#### `support_requests` (per location)
Help form submissions from the app; the front desk / owner answers them (C-77).  
_Source: profile.jpg (Help)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `customer_id` | uuid, null | -> `customers`  |
| `user_id` | uuid | -> `users`  |
| `user_name` | text |  |
| `email` | text, null |  |
| `topic` | enum (booking \| payment \| vaccines \| app \| other) |  |
| `message` | text |  |
| `status` | enum (new \| open \| resolved) |  |
| `staff_reply` | text, null |  |

### System

#### `account_deletion_requests` (global)
App-store requirement: a customer can request deletion; 30-day grace period, then anonymisation (R-M21).  
_Source: setting.jpg, Frame 1171276432.png, R-M05_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid | -> `users`  |
| `customer_id` | uuid, null | -> `customers`  |
| `reason` | enum (moving \| no_longer_needed \| privacy \| too_many_notifications \| other), null |  |
| `details` | text, null |  |
| `status` | enum (requested \| cancelled \| completed) |  |
| `requested_at` | timestamptz |  |
| `scheduled_for` | date | Day the data is anonymised unless cancelled |
| `completed_at` | timestamptz, null |  |

#### `approvals` (per location)
Every manager-PIN approval: who approved what, for whom, on which record.  
_Source: R-I06_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `action` | text | e.g. booking.status, payment.refund, discount.apply, record.delete |
| `subject_table` | text, null |  |
| `subject_id` | text, null |  |
| `requested_by` | uuid, null | -> `users`  |
| `requested_by_name` | text |  |
| `approved_by` | uuid | -> `users`  |
| `approved_by_name` | text |  |
| `approver_role` | text |  |
| `details` | json, null |  |
| `approved_at` | timestamptz |  |

#### `attachments` (global)
Mock file uploads from the add forms (customer / pet / appointment / vaccine certificate). URLs are mock:// until storage lands.  
_Source: Customer/Pet Details .pdf dropzone (R-J11)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `subject_table` | enum (customers \| pets \| appointments \| vaccine_records) |  |
| `subject_id` | text |  |
| `name` | text |  |
| `url` | text |  |
| `size_bytes` | int |  |
| `mime` | text, null |  |
| `uploaded_by` | uuid, null | -> `users`  |

**Access:** staff write

#### `audit_log` (per location)
Who changed what: table, row, action, diff.  
_Source: entities 9 (audit)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `location_id` | uuid | -> `locations` Owning location (Encino / Westwood) |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid, null | -> `users`  |
| `user_name` | text, null |  |
| `action` | text |  |
| `table_name` | text |  |
| `row_id` | text, null |  |
| `diff` | json, null |  |

#### `auth_events` (global)
Sign-up, sign-in, failed attempts, lockouts, code sends, password resets. Feeds the security audit and the owner reports.  
_Source: best practice (D-018)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `user_id` | uuid, null | -> `users`  |
| `email` | text, null |  |
| `kind` | enum (sign_up \| email_verified \| sign_in \| sign_in_failed \| locked \| sign_out \| otp_sent \| otp_failed \| password_reset_requested \| password_reset) |  |
| `page_code` | text, null |  |
| `details` | json, null |  |

#### `backups` (global)
Log of JSON exports of the mock database (A-43). Each row records who exported, how many tables / rows and the file size.  
_Source: project brief (backups / export)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `kind` | enum (manual \| scheduled) |  |
| `file_name` | text |  |
| `table_count` | int |  |
| `row_count` | int |  |
| `size_bytes` | int |  |
| `created_by` | uuid, null | -> `users`  |
| `created_by_name` | text, null |  |
| `note` | text, null |  |

**Access:** owner read/write; super_admin read/write

#### `legal_documents` (global)
Privacy policy, terms of service and open-source licences shown in the app (C-79); versioned markdown.  
_Source: app-store requirements (build plan phase 5)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `slug` | text |  |
| `title` | text |  |
| `kind` | enum (privacy \| terms \| licenses \| other) |  |
| `version` | text |  |
| `effective_on` | date |  |
| `body` | text | Markdown |
| `published` | bool |  |

#### `lookup_values` (global)
Extendable dropdown lists used by the add forms: breed, color, city, reference, attribute, customer title, temper (R-J04).  
_Source: Customer Details.pdf, Pet Details .pdf (+ buttons)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `kind` | enum (breed \| color \| city \| reference \| attribute \| customer_title \| temper) |  |
| `value` | text |  |
| `sort_order` | int |  |
| `active` | bool |  |

**Access:** staff write

#### `perf_budgets` (global)
Limits the bundle and runtime checks compare against (D-16). Edit here, never in code.  
_Source: dev-quality module (D-16)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `metric` | text | Key, e.g. js_total_kb, css_total_kb, largest_chunk_kb, route_count_max, localstorage_kb, ttfr_ms |
| `label` | text |  |
| `budget` | numeric |  |
| `unit` | enum (kb \| ms \| count \| percent) |  |
| `warn_at_percent` | int | Warn when usage passes this share of the budget (default 80) |
| `description` | text, null |  |
| `active` | bool |  |

**Access:** super_admin: read/write; owner: read

#### `providers` (global)
Outbound channel configuration: email (None / Gmail / SMTP), SMS (None / Twilio / Petlinx), push (None / FCM / APNs). Secrets are masked; test-send is a stub until an integration exists.  
_Source: 5.pdf, R-M13_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `kind` | enum (email \| sms \| push) |  |
| `name` | text | Display name (email From name, SMS sender name) |
| `provider` | text | none | gmail | smtp | twilio | petlinx | fcm | apns |
| `from_address` | text, null |  |
| `config` | json, null | Non-secret settings (host, port, sender id) |
| `secret_masked` | text, null | Last 4 of the API key; the real secret never lives in the mock |
| `status` | enum (not_configured \| configured \| test_ok \| error) |  |
| `last_test_at` | timestamptz, null |  |
| `last_test_result` | text, null |  |
| `enabled` | bool |  |

**Access:** owner write; super_admin write

#### `qa_runs` (global)
One row per quality pass (responsive matrix, a11y scan, bundle budget, screenshot pass): what ran, at which widths, how many issues, where the report lives.  
_Source: dev-quality module (D-12, D-15, D-16)_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `kind` | enum (responsive \| a11y \| bundle \| screenshots \| smoke) |  |
| `label` | text | Human label, e.g. "Responsive pass 2026-09-18" |
| `started_at` | timestamptz |  |
| `finished_at` | timestamptz, null |  |
| `routes` | int | Routes covered |
| `widths` | json, null | Widths checked, e.g. [360,390,768,1280,1920] |
| `issues` | int | Issues found |
| `result` | enum (pass \| warn \| fail) |  |
| `report_path` | text, null | docs/qa/<file>.md the run wrote |
| `triggered_by` | text, null | script | page | ci |
| `summary` | json, null | Per-route counts |

**Access:** super_admin: read/write; owner: read

#### `rules` (global)
Rules added in Settings > Rules at runtime (the code registry in src/rules is merged with these).  
_Source: D-006_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `rule_id` | text |  |
| `title` | text |  |
| `description` | text, null |  |
| `category` | text |  |
| `status` | enum (requested \| in_dev \| implemented \| deprecated) |  |
| `pages` | json, null |  |
| `source` | text, null |  |
| `requested_by` | text, null |  |

#### `settings` (global)
Key/value settings per scope (boarding charge rules, invoice numbering, general).  
_Source: entities 26_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `key` | text |  |
| `value` | json |  |
| `description` | text, null |  |

### Design & layout

#### `page_layouts` (global)
Per page code: section order and hidden sections (builder tool layout editor).  
_Source: hoy pattern_

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `created_at` | timestamptz |  |
| `updated_at` | timestamptz |  |
| `page_code` | text |  |
| `order` | json |  |
| `hidden` | json |  |

## Adding a table
1. Add a `TableDef` to `src/data/schema/<area>.ts` (new file per module; `index.ts` globs them) plus a typed row interface.
2. Seed it in `src/data/seed/<area>.ts` (exports `seed(ctx)`).
3. `npm run sql` regenerates `supabase/schema.sql` and this file.
4. Reference it in the page's `PageSpec.data` so the inspector links to it.
