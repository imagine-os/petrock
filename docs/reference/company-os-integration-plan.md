# Petrock x Company-OS integration plan

Status: **proposed** (2026-09-18). Written in answer to Justin's question "I want to connect this system to the backend from Company OS Repo. How will we do it?" (Slack #petrock-hotel, thread 1789744140.751369, prompt 0011). D-183 (Company-OS reference only) stays in force until Justin confirms Phase 1 below; nothing in `src/` changes with this document.

Revised 2026-09-18 15:24 UTC after Justin's direction (prompt 0011 running log): booking, pricing, PIN approvals and similar features are Company-OS modules, not a Petrock-owned server. Section 2 option B is withdrawn; see section 2b.

Sources: `docs/reference/company-os.md` (digest of Playset-LLC/Company-OS, 2026-09-17), `src/data/provider.ts`, `src/data/CompanyOsProvider.ts`, `src/data/DataContext.tsx`, `src/auth/SessionProvider.tsx`, `src/modules/customer-auth/authService.ts`, `src/data/schema/*.ts` (74 tables), decisions D-183 and D-184.

## 1. Where the two systems stand

**Petrock today.** Every page reads and writes through the `DataProvider` interface (`list / get / insert / update / remove / subscribe`, optional `peek` and `reset`). `MockProvider` (localStorage, seeded, daily reseed) is the only runtime. `CompanyOsProvider` already implements the same interface against the Company-OS REST shape (`POST /t/:tenant/query`, `GET/POST /t/:tenant/api/:entity`, `GET/PATCH/DELETE .../:id`) and flattens `{ id, org_unit_id, data }` records into rows with `location_id`; it has never been pointed at a server. Customer auth is `authService.ts` over three mock tables (`auth_credentials`, `auth_codes`, `auth_events`); staff identity is `demoUsers` plus the `users` table; staff PIN approval is app-side (`employees.pin_hash`, `approvals`). Pricing is `src/pricing/engine.ts` over settings tables. Payments sit behind `PaymentProvider` (mock now, Stripe stub).

**Company-OS today** (per the digest). A metadata-driven multi-tenant platform: Fastify API, Drizzle on Postgres, one JSONB `records` table for all business data, entities and fields as metadata, roles / permissions / policies enforced in the API layer, JWT auth with a dev stub and a Clerk seam. No Postgres RLS, no end-user (customer) identity, no pricing / invoice / payment / availability logic, no transactions across entities, audit log not persisted, realtime absent. Supabase appears only as a possible managed Postgres host.

The gap that decides the architecture: Company-OS is a good system of record for rows, but Petrock needs customer identity, a booking engine (availability, pricing, deposits), Stripe, and auditable PIN approvals. Those belong in a layer Petrock owns.

## 2. Architecture

Three options were weighed:

| Option | What it means | Verdict |
| --- | --- | --- |
| A. Browser -> Company-OS REST directly | `CompanyOsProvider` talks to `/t/petrock/*` with a user JWT. | Base of the recommended approach: the browser talks to Company-OS directly; what A lacks is added as Company-OS modules (2b). |
| B. Browser -> Petrock BFF -> Company-OS | A thin server Petrock owns. Verifies Supabase Auth tokens, maps them to Company-OS memberships, hosts the booking engine and Stripe webhooks, proxies plain CRUD to Company-OS. | **Withdrawn by Justin (15:24 UTC).** Petrock must not own business logic outside Company-OS. |
| C. Browser -> Supabase Postgres directly | supabase-js against the tables. | Not viable until Company-OS ships RLS and relational "graduation" tables (its ADR 0003 / ADR 0016). Revisit then. |

Recommended shape:

```
Customer app / Front desk / Admin (Vite, GitHub Pages / Capacitor)
   |  supabase-js (Auth only)            |  fetch (Bearer <Supabase JWT>)
   v                                     v
Supabase Auth  <-- verifies JWT -->  Company-OS API (tenant petrock)
                                       |- generic CRUD + /query        (records)
                                       |- module: bookings             (availability, lifecycle, gated transitions)
                                       |- module: pricing              (rate tables, quote)
                                       |- module: approvals            (PIN-gated actions, audit)
                                       |- module: payments             (Stripe intents, webhooks, invoices)
                                       |- module: end-user auth        (customer role, $me policies)
                                       |- modules: catalog, compliance (vaccines), messaging, notifications, reviews, feedback, tasks
                                       v
                                 Postgres (records + metadata)
```

`CompanyOsProvider` stays the browser client of Company-OS for plain CRUD. Booking, quote, checkout, PIN approval and vaccine verification call module endpoints (`POST /t/petrock/modules/<module>/<command>`) instead of raw row writes, so availability, pricing and approvals are enforced server-side for every tenant that enables the module.

## 2b. Company-OS modules Petrock contributes

Each module = a manifest in `packages/core/src/modules/<key>.ts` (entities, fields, roles, permissions, rules, settings schema), API routes under `apps/api/src/modules/<key>/`, and a `tenant_modules` row to enable it per tenant. Petrock-specific facts (room fit rules, size bands, penthouse names, Diamond prices) stay tenant configuration in `settings` / `rules` records, never module code. Every module below is written so a yoga studio, tennis club or marketplace can enable it unchanged.

| Module | Generic scope | Petrock source today | Notes |
| --- | --- | --- | --- |
| `bookings` (extend the existing `packages/core/src/modules/bookings.ts`) | Resources (rooms, kennels, groomer slots, daycare capacity, courts, mats), availability with `no_overlap` enforced, one configurable lifecycle state machine, gated transitions, day buckets | `src/domain/booking.ts`, `bookings`, `booking_pets`, `appointments`, `daycare_bookings`, `capacities`, `holidays` | Lifecycle vocabulary stays configurable per tenant; Petrock's is `requested -> pending_vaccines -> confirmed -> checked_in -> checked_out` (+ cancelled, no_show). |
| `pricing` | Rate tables (base rates, seasons, day kinds, discounts, fees, taxes, packages, add-ons, per-size pricing) and `POST .../pricing/quote` | `src/pricing/engine.ts`, `scripts/test-pricing.mjs`, tables `rates`, `seasons`, `discounts`, `fees`, `taxes`, `packages`, `addons`, `daycare_pricing` | The engine is pure TypeScript with tests; it ports as-is into the module and the tests become module tests. |
| `approvals` | Staff PIN (hashed) per member, PIN-gated actions declared per entity/transition, `approvals` audit rows, lockout | `src/auth/pin.ts`, `PinApprovalModal`, `employees.pin_hash`, `approvals` | `POST .../approvals/verify` returns a short-lived approval token the gated command consumes. |
| `payments` | Stripe keys per tenant in `tenant_modules.settings`, PaymentIntents, deposits, refunds, webhooks, `invoices` / `payments` entities | `src/payments/*`, `invoices`, `payments`, `payment_methods` | Publishable key served to the client by the API; secrets never in Petrock. |
| `end-user auth` | Supabase Auth JWT verification, `customer` (end-user) role, `$me` row policies on customer-owned entities, account deletion grace | `authService.ts`, `SessionProvider.tsx`, `users`, `customers`, `account_deletion_requests` | Company-OS Roadmap Phase 5; replaces the Clerk-only seam. |
| `catalog` | Services, packages, add-ons with per-location availability | `services`, `packages`, `addons`, `room_types`, `rooms` | Rooms / resources link to `bookings`. |
| `compliance` | Requirement types with expiry, per-subject records with proof upload, status, booking gate | `vaccine_types`, `vaccine_records`, `pending_vaccines` gate | Same module covers waivers (yoga), certifications (tennis). |
| `messaging`, `notifications` | Conversations, messages, assignments, quick replies; in-app / email / SMS / push with per-user prefs and provider config | `conversations`, `messages`, `conversation_assignments`, `chat_quick_replies`, `notifications`, `notification_prefs`, `providers` | Provider secrets in `tenant_modules.settings`. |
| `i18n` | Tenant `locales` + `default_locale` in settings; a `localized_text` field type storing `{ en, es, ... }` JSONB per value; API resolves `Accept-Language` / `?locale=` with fallback to the tenant default and can return all locales for editors; metadata labels (`entities.name`, `fields.name`, select options in `fields.config`) accept the same object; `users.locale` chosen at sign-up drives emails / SMS / push templates; `/query` filters and sorts on localized fields use the resolved locale; a `missing-translations` report per tenant | `src/i18n/*` (`{ en, es? }` `StringTable`, `useT()`, English fallback), `legal_documents`, `faq_items`, `site_faqs`, `room_types.description`, `services`, `packages`, `addons`, notification copy | Petrock ships English + Spanish (D-184). UI strings stay in each app (Petrock's strings layer; Company-OS dashboard gets the same pattern). Dates, money and units are formatted client-side with `Intl` from `users.locale` plus tenant `currency` / `timezone`. Never concatenate translated fragments; use ICU-style placeholders for plurals. |
| `reviews`, `feedback`, `tasks`, `training` | Small generic modules | `reviews`, `feedback`, `tasks`, `walks`, `training_completions` | Lowest priority. |

Contribution model (open question for Justin): either Claude builds these in a separate Company-OS session (Playset-LLC repos cannot sit next to imagine-os repos in one session) from specs kept in this repo under `docs/specs/company-os-modules/`, or the Company-OS developer builds them from those specs. Either way the specs live here first, one file per module, with the Petrock tables, rules (R-ids) and page codes each module must satisfy.

## 3. Auth mapping (D-184)

| Concern | Petrock today | Target |
| --- | --- | --- |
| Customer sign-up / sign-in / OTP / reset | `authService.ts` over `auth_credentials`, `auth_codes` | **Supabase Auth** (email + password, email OTP, reset). `authService` keeps its function signatures and calls `supabase.auth.*` inside; the three mock tables stop being written (`auth_events` stays as an app audit table). Password policy and lockout are Supabase Auth settings (D-184). |
| Staff login | `demoUsers`, `switchUser`, `/staff/pin` | Supabase Auth account per staff member (email + magic link or password). The 4-6 digit **PIN stays app-side**: `employees.pin_hash` verified by the BFF, `approvals` row written before the gated action, exactly as today. |
| Identity link to Company-OS | none | Supabase `auth.users.id` stored in Company-OS `users.external_id` (the column reserved for Clerk). Company-OS `apps/api/src/auth/provider.ts` gains a Supabase JWT verifier (JWKS / project JWT secret) next to the Clerk seam. **Change in Company-OS, by its dev.** |
| Roles | `super_admin, owner, manager, front_desk, groomer, customer, public` (`src/auth/roles.ts`) | Company-OS `roles` under tenant `petrock` with the same keys; `memberships` (user, tenant, org_unit = location, role) binds staff. Front desk / groomer / manager get one membership with `org_unit_id` set (pinned location); owner / super_admin get `org_unit_id` null (all locations). `SessionProvider` reads role and `locationId` from `GET /t/petrock/me` instead of `demoUsers`. |
| Customers | `users.role = customer`, `customers.user_id` | Either (a) a `customer` role in Company-OS with `policies` row filters `$me` on `customers`, `pets`, `bookings`, `appointments`, `daycare_bookings`, `invoices`, `payments`, `conversations`, `messages`, `notifications` (needs the dev to accept end-user memberships, which Company-OS treats as Roadmap Phase 5), or (b) the BFF holds a service token and enforces customer scoping itself. Recommend (a) if the dev agrees; (b) is the fallback and needs no Company-OS change. |
| Permissions strings (`can('bookings.status')`) | `src/auth/permissions.ts` | Kept in the app for UI; mirrored as Company-OS `permissions` (role x entity x action x scope) so the API enforces the same matrix. `/#/dev/tables` can show the drift. |

## 4. Entity mapping

Petrock is **one tenant** (`slug = petrock`) with **two `org_units`** (Encino, Westwood; more later). Every Petrock table becomes one Company-OS `entity` with the same key; every column becomes a `field`. Location-scoped tables (`scope: 'location'`) write `location_id` into `records.org_unit_id`; global tables leave it null.

Column type map (`src/data/schema/types.ts` -> Company-OS `fields.type`): `uuid` with `references` -> `reference`; `uuid` without -> `text`; `text` -> `text` (or `long_text` when `wide`); `int`, `numeric`, `money` -> `number` (money as cents or 2-decimal number, decide with the dev); `bool` -> `boolean`; `timestamptz` -> `datetime`; `date` -> `date`; `time` -> `text`; `json` -> `json`; `enum` -> `select` with the options in `config`. `users` references become `user_reference`.

Rather than 74 hand-written entities, add `scripts/gen-companyos-template.mjs` (`npm run companyos:template`) that emits `packages/core/src/templates/petrock.ts`-shaped JSON from `src/data/schema/*.ts`, the same way `npm run sql` emits `supabase/schema.sql`. The dev either checks it into Company-OS as the Petrock template or we `POST /t/petrock/meta/entities` and `/meta/fields` at provisioning. Schema changes then stay one-directional: TypeScript schema -> generated template -> tenant metadata.

Tables by destination:

| Destination | Tables |
| --- | --- |
| Company-OS records (system of record) | `locations`, `users` (mirror of memberships), `roles`, `permissions`, `employees`, `capacities`, `holidays`, `customers`, `customer_profiles`, `customer_notes`, `emergency_contacts`, `vets`, `pets`, `pet_profiles`, `pet_lookups`, `lookup_values`, `vaccine_types`, `vaccine_records`, `room_types`, `rooms`, `seasons`, `rates`, `discounts`, `fees`, `taxes`, `services`, `packages`, `addons`, `daycare_pricing`, `bookings`, `booking_pets`, `booking_pet_care`, `booking_services`, `booking_events`, `booking_change_requests`, `appointments`, `appointment_extras`, `grooming_orders`, `daycare_bookings`, `daycare_booking_pets`, `invoices`, `payments`, `conversations`, `conversation_assignments`, `messages`, `notifications`, `notification_prefs`, `reviews`, `feedback`, `approvals`, `audit_log`, `rules`, `settings`, `page_layouts`, `walks`, `tasks`, `training_completions`, `site_faqs`, `site_inquiries`, `faq_items`, `legal_documents`, `support_requests`, `chat_quick_replies`, `account_deletion_requests`, `groomer_column_prefs`, `attachments` (metadata only; files go to Supabase Storage or S3 with the URL in the row) |
| Supabase Auth owns | `auth_credentials`, `auth_codes` (deleted from the schema once Phase 2 lands; `auth_events` stays as app audit) |
| Stripe owns | `payment_methods` keeps only brand / last4 / expiry and the Stripe customer + payment-method ids; card data never touches Company-OS |
| Stay local (dev tooling, mock only) | `backups`, `qa_runs`, `perf_budgets` |

Closest existing Company-OS seeds: the `dh` template (owner, dog, kennel, booking) and `grooming` template (person, pet, appointment). Petrock does not reuse them; its own entity set is richer and the keys differ. Provision Petrock from the generated template instead.

## 5. What lives in the CompanyOsProvider adapter

`src/data/CompanyOsProvider.ts` keeps its interface and gains:

- **Auth header** from the Supabase session (`supabase.auth.getSession()`), refreshed on `onAuthStateChange`, instead of the constructor `token`.
- **Query translation**: `where` with arrays -> `in`; `null` -> `is_null`; `orderBy`, `limit`, `offset` -> `sort` / `page` (already sketched). Company-OS filters allow two-hop references; anything deeper calls a module endpoint.
- **Read-only mode** (`VITE_DATA_PROVIDER=company-os-readonly`): `insert / update / remove` reject with a visible error toast "Connected to Company-OS read-only: this action is not wired yet" (org rule: unfinished functions must say so; nothing silently no-ops).
- **Change feed**: `subscribe` emits locally after own writes (already there) plus a poll every 15 s per subscribed table (`updated_at > lastSeen` filter) in Phase 1; swap for Supabase Realtime on `records` (or a Company-OS webhook) in Phase 3.
- **Peek**: an in-memory LRU of the last `list` result per `table|query` so `useTable` renders without flicker, mirroring what `MockProvider.peek` does today.
- **Errors**: 401 -> sign the user out; 403 -> permission toast; 5xx / network -> retry once then toast. All surfaced through the existing `Toast` molecule.
- **Provider chooser** in `src/data/DataContext.tsx` `createDefaultProvider()`: `VITE_DATA_PROVIDER` = `mock` (default, GitHub Pages demo) | `company-os-readonly` | `company-os`. The TopBar shows a "Connected: Company-OS (staging)" chip whenever the provider is not `mock`, and the `/#/dev` hub keeps the mock for demos and tests.

## 6. Env and config

`.env.example` (no secrets in the repo; anon / publishable keys only):

```
VITE_DATA_PROVIDER=mock            # mock | company-os-readonly | company-os
VITE_COMPANY_OS_URL=               # Company-OS API base
VITE_COMPANY_OS_TENANT=petrock
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PK=
```

GitHub Pages stays the demo build (`mock`). A second workflow input or a `staging` branch builds with the Company-OS values from repository variables. Company-OS must allow CORS from `https://imagine-os.github.io` and any staging host. Stripe, email, SMS and push secrets live in Company-OS `tenant_modules.settings`, never in Petrock.

## 7. Migration of mock data

- **Config tables migrate for real**: `locations`, `roles`, `permissions`, `room_types`, `rooms`, `seasons`, `rates`, `discounts`, `fees`, `taxes`, `services`, `packages`, `addons`, `daycare_pricing`, `vaccine_types`, `capacities`, `holidays`, `settings`, `legal_documents`, `faq_items`, `site_faqs`, `chat_quick_replies`, `lookup_values`, `pet_lookups`. Script `scripts/export-mock.mjs` runs the seed in Node and writes `docs/data/export/<table>.json`; the Company-OS `apps/importer` (or a loop of `POST /api/:entity`) loads them into the tenant. Prices already carry the placeholders marked "pending owner" (D-187); those rows migrate with the flag and get corrected in Settings, not in code.
- **Transactional demo rows** (customers, pets, bookings, appointments, invoices, messages): load only into a **staging** tenant for testing; the production tenant starts empty or from a real export.
- **Real data**: if Petrock has an existing system (PetLinx was mentioned in the pricing questions), its CSV export maps to `customers`, `pets`, `vaccine_records`, `bookings`, `appointments` through the same importer; field mapping is a Phase 4 task once a sample export exists.
- `MockProvider` and the seed stay in the repo for the demo build, the dev hub and the QA scripts; `SEED_VERSION` is unaffected.

## 8. Changes needed in Company-OS (the other developer)

1. Supabase JWT verification in `apps/api/src/auth/provider.ts` (next to the Clerk seam) and `users.external_id` = Supabase user id.
2. Tenant `petrock` with two `org_units`, provisioned from the generated Petrock template (or accept our `POST /meta/*` calls with an operator key).
3. CORS for the Petrock origins.
4. Either a `customer` end-user role with `$me` policies, or agreement that the BFF uses a service token and scopes customers itself.
5. The modules in section 2b, starting with bookings, pricing, approvals, payments and end-user auth. Contribution model per Justin's answer.
6. i18n module (section 10): localized_text field type, tenant locales, users.locale, API resolution with fallback.

Company-OS's physical schema does not change; the modules add metadata, records and API routes.

## 9. Phases

| Phase | Scope | Needs from Justin / the dev | Done when |
| --- | --- | --- | --- |
| 0. Contract (this doc) | Agree architecture, entity template, auth seam. Add `npm run companyos:template` and `.env.example`. Write module specs under `docs/specs/company-os-modules/`. No runtime change. | Justin: confirm Phase 1 scope (lifts D-183 for read-only). Dev: staging Company-OS URL, operator key, CORS. | Template generated and reviewed by the dev. |
| 1. Read-only | Provision tenant + entities, import config tables, `CompanyOsProvider` live behind `VITE_DATA_PROVIDER=company-os-readonly` with polling and the read-only toast. Staff pages render Company-OS data; writes show the toast. | Dev: tenant provisioned or our `/meta` calls allowed. | Front desk and admin pages list real rows from staging; `npm run build` and QA scripts green in both modes. |
| 2. Supabase Auth | `authService` over `supabase.auth`; staff accounts + memberships; `SessionProvider` from `/me`; PIN unchanged; mock auth tables retired. | Justin: which Supabase project (dev's or a new Petrock one). Dev: JWT verifier, memberships. | Customer sign-up -> row in `customers` under the right tenant; staff login pins location by membership. |
| 3. Modules + write-through | bookings, pricing, approvals, payments modules live in Company-OS (ported from src/pricing/engine.ts and src/domain/booking.ts), Petrock pages call module endpoints, realtime replaces polling. | Justin: who builds the modules (Claude in a Company-OS session, or the dev from our specs). Dev: module API conventions. | End-to-end booking with deposit on staging; scripts/qa-*.mjs pass in Company-OS mode. |
| 4. Cutover | Real data import, production tenant, Pages demo stays on mock, Capacitor builds point at production BFF. | Sample export from the current system (if any). | Owner signs off on first live booking. |

## 10. Multilingual

Company-OS has no multilingual support today (Justin, 15:27 UTC). Proposal: two layers, both generic.

**Interface text** lives in each app. Petrock's `src/i18n` layer already does this: every string is English with optional Spanish and falls back to English; the language is a per-user choice stored on the device today and on `users.locale` after Phase 2. The Company-OS dashboard and console get the same pattern when their UI needs it.

**Data** goes through the `i18n` module in section 2b: one `localized_text` field type, tenant locale settings, per-user locale, API-side resolution with fallback, and localized metadata labels. Because Company-OS stores records as JSONB, a localized value is just an object inside `data`, so no schema change and the GIN index still applies.

**Petrock mapping**: mark `room_types.description`, `services.name / description`, `packages.*`, `addons.*`, `faq_items`, `site_faqs`, `legal_documents`, `chat_quick_replies` and notification templates as `localized_text` in the generated template (a `localized: true` flag on the column definition in `src/data/schema/*.ts`, added in Phase 0). Everything else stays plain text.

**Rules**: English is the source language; a missing translation falls back and is listed in the dev hub's missing-translations report (Petrock) and the tenant report (Company-OS), so nothing ships half-translated silently. Formatting of dates, money and units happens client-side with `Intl` from the user's locale plus the tenant's `currency` and `timezone` (both new tenant settings). Use placeholders, never concatenation, for translated sentences. Right-to-left is not needed now; keep `document.documentElement.lang` and `dir` driven by the locale so it costs nothing later.

Model note: plan and revision written with Claude Fable 5.1 (judgment); file writing and commits by Sonnet 5 workers.
