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

## Tables (41)

### Core & locations

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

### Pets & vaccines

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

### System

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
