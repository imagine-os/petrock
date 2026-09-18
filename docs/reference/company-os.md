# Playset-LLC/Company-OS - data-layer digest

Status (2026-09-18, D-183): reference only. Do not write to or wire into Company-OS until Justin says so; its developer will connect it.

Digested 2026-09-17 in a separate read-only session because this session cannot attach Playset-LLC repos alongside imagine-os repos.

**1. Tech stack and layout**
Company-OS ("Configurator") is a metadata-driven, multi-tenant low-code platform, not a fixed booking schema. TypeScript everywhere, pnpm workspaces, Node 24, run via tsx (`package.json`, `docs/adr/0006-tech-stack.md`).
- `apps/api` — Fastify 5 + Zod + jsonwebtoken. Provisioning, generic CRUD runtime, query/policy engine (`apps/api/src/app.ts`).
- `apps/dashboard` (tenant admin) and `apps/console` (operator control plane) — React + Vite shells that both mount `packages/admin-ui` TenantWorkspace.
- `apps/importer` — CSV importers (tennis, grooming).
- `packages/db` — Drizzle ORM schema + drizzle-kit SQL migrations (`packages/db/src/schema.ts`, `packages/db/drizzle/0000-0003*.sql`).
- `packages/core` — tenant templates, module manifests, permission logic (no DB/HTTP deps).
- `packages/components` — DataTable, StatCard, EditForm, AttendanceTakeDetail, etc.
- Postgres 16 via docker-compose; CI runs typecheck, unit, migrate, integration tests (`.github/workflows/ci.yml`).

**2. Data model**
Physical tables are all platform tables (Drizzle, `packages/db/src/schema.ts`). Business entities are NOT tables; they are metadata rows plus JSONB records (ADR 0003).

Control plane:
- `users` (id, external_id, email, name) — global login principals; external_id reserved for Clerk.
- `tenants` (id, slug, name, status, theme jsonb) — the organization/tenant.
- `org_units` (id, tenant_id, slug, name) — sub-org inside a tenant. This is the closest thing to a location.
- `memberships` (user_id, tenant_id, org_unit_id nullable, role_id) — staff binding.

Metadata plane:
- `entities` (tenant_id, org_unit_id, key, name, config jsonb, source_module)
- `fields` (entity_id, key, name, type enum [text, long_text, number, boolean, date, datetime, select, reference, user_reference, email, json], config jsonb, position)
- `roles` (tenant_id, org_unit_id, key, name, is_system, source_module)
- `permissions` (role_id, entity_id, action [read/create/update/delete], scope [all/own/none])
- `policies` (role_id, entity_id, action, row_filter jsonb) — declarative row-level rules incl. `$me`, 2-hop ref/exists (`apps/api/src/query/types.ts`).
- `pages` (tenant_id, key, surface [admin/public], audience roles[], layout jsonb), `views` (legacy layouts).
- `tenant_modules` (tenant_id, module_key, version, settings jsonb).

Data plane:
- `records` (id, tenant_id, org_unit_id, entity_id, data jsonb, created_by, created_at, updated_at) with GIN index on data. Every tenant record of every entity lives here.

Tenant isolation: `tenant_id` on every scoped row, enforced in app code through one seam (`apps/api/src/services/tenant-context.ts`, `apps/api/src/query/policy.ts`). Postgres RLS is explicitly deferred (ADR 0002, ADR 0016 §6, `docs/ROADMAP.md:106`). Migrations are drizzle-kit generated SQL, not Supabase-generated; Supabase is only named as a possible managed Postgres host (ADR 0006).

Booking-relevant overlap exists only as templates/modules (metadata seeds):
- `packages/core/src/templates/dh.ts` — dog hotel: owner, dog (breed, size, owner ref), kennel (size, available), booking (dog, kennel, check_in, check_out, status reserved/checked_in/checked_out/cancelled, price). Roles super_admin, front_desk.
- `packages/core/src/templates/grooming.ts` — person (party model with roles json for customer/groomer), pet (owner ref), appointment (customer, groomer, pet, date, time, duration, status, services text, total, discount, invoice #). Roles super_admin, manager, groomer.
- `packages/core/src/modules/bookings.ts` — generic resource + booking (start/end datetime, status), booking_manager role; no_overlap rule declared but not enforced.
- No services/catalog, invoice, or payment entities anywhere; grooming stores services as free text and invoice as a string.
- Audit log: `apps/api/src/audit.ts` only emits pino log lines. Nothing persisted or queryable (`docs/tech-debt.md` §3).
- Customer/end-user identity does not exist. `users` are staff/operators only; end-user auth is Roadmap Phase 5 (`docs/ROADMAP.md:65`).

**3. API surface**
REST only, Fastify, JWT bearer (dev-stub provider, Clerk seam in `apps/api/src/auth/provider.ts`). No GraphQL, no edge functions, no direct-DB client path. Key routes (`apps/api/src/routes/*`):
- `POST /provision`, `GET /templates`, `/platform/*` (operator key or login), `/platform/tenants/:slug/modules`.
- `POST /t/:tenant/auth/dev-login`, `GET /t/:tenant/me`.
- `GET/POST /t/:tenant/meta/entities`, `.../fields`, `/meta/roles`, `/meta/org-units`.
- Generic CRUD: `GET/POST /t/:tenant/api/:entityKey`, `GET/PATCH/DELETE .../:id` (`routes/runtime.ts`).
- `POST /t/:tenant/query` — declarative QuerySpec with filters, sort, pagination, aggregates, policy AND-injected (`routes/query.ts`).
- `/t/:tenant/pages`, `/admin/users`, `/admin/roles`, `/admin/roles/:key/permissions`, `PUT /theme`, `/members`.

**4. Documentation**
Eighteen ADRs in `docs/adr/` (index in `docs/adr/README.md`, with glossary). Hand-drawn SVG diagrams: `docs/diagrams/db-schema.svg`, `db-schema-proposed.svg`, `architecture.svg`, `pages-query-policy-architecture.svg`. Drizzle snapshots in `packages/db/drizzle/meta/*.json` are the machine-readable schema. No per-table markdown, no generated docs, and no docs for tenant entity shapes beyond the template source files. `docs/ROADMAP.md` and `docs/tech-debt.md` state what is deferred.

**5. Recommendation**
Petrock should not talk to the database directly: the schema is one JSONB `records` table whose meaning lives in metadata, tenant isolation and row policies are enforced only in the Fastify layer, and there is no RLS to protect a Supabase anon key. Integrate through the REST API (`/t/petrock/api/:entity` and `/query`), or via a thin Petrock BFF in front of it, and only consider Supabase-direct if the developer ships the deferred RLS plus relational "graduation" tables (ADR 0003, ADR 0016). Model Petrock as one tenant with two org_units (the two locations) and start from the `dh` template merged with grooming's party model. Fits today: owner/person, pet/dog, kennel or resource, booking, appointment, staff roles/permissions, per-tenant theme. New for Petrock: customer self-service auth (no end-user identity exists), a service catalog with prices, invoices and payments (Stripe), spa add-ons on bookings, vaccination/medical records, persisted audit log, and real availability/no-overlap enforcement. Expect that JSONB records with 2-hop filters, no joins across locations, and no transactions across entities will constrain a booking engine, so keep availability and pricing logic in the API/BFF rather than the front end.
