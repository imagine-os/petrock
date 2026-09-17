# Petrock project brief

Source: Justin Massion, Slack #petrock-hotel, 2026-09-17 (prompts `docs/prompts/0001-figma-analysis-and-project-brief.md` and `docs/prompts/0002-scope-decisions.md`). This file organizes everything Justin said; it is updated as decisions land. Individual decisions are logged with IDs in **`docs/decisions.md`** (D-001...).

## Client

- **Petrock Hotel**, a dog hotel and spa. Website [petrockhotel.com](https://petrockhotel.com), currently built in Squarespace. Rebuilding the website is a possible later phase, if appropriate.
- **Two locations today** (Figma nav shows "Encino, Los Angeles"; the app shows Westwood and Encino). More locations may open later.

### Location rules

- The system must **always know which location the user is in**.
- **Front-desk users** on location see only their own store's dashboard.
- **Owners** can see both (all) locations.
- **Adding a location** must be a nice, easy flow later, so location is a first-class entity from day one.

## Scope: "everything they need, all in one"

| Surface | Notes |
|---|---|
| Customer app, iOS + Android | Mobile design system is locked in Figma (Section 22). Booking boarding (hotel), daycare, grooming & spa (one service, D-004); pets, vaccines (first-class flow, D-003), profile, payments, chat/notifications. |
| Front-desk web | Desktop. Can look better than Figma where it helps; the calendar **timeline and kanban views** in particular should be built properly. |
| Admin / owner web | Desktop. Management dashboards, Control Panel (owner / super-admin only, D-002), people & pets, staff, settings (including Settings > Rules, see below). |
| Extras (D-005) | report, education, reviews, employees, walking, management. Reports/analytics are in scope; Employees is required (user management); walking and management can be extended later. |
| Stripe | Included from the start. |
| Push notifications, automated emails | Possible later integrations. |
| App-store requirements | All the standard things the app stores require (legal, privacy, account deletion, etc.) built into settings. |
| Supabase | Later, not yet. Data will come through Company-OS (see Data layer). |
| Website rebuild | Later, if appropriate (Squarespace today). |

## Cross-cutting features Justin asked for

### Super-admin builder tool on every page
Every page carries a builder tool that super admins can see and toggle open. It shows all key info for the page:
- which tables it connects to
- which roles have access
- the components on the page and their layout
- calculations and rules the page uses
- integrations
- etc.

(hoy's InspectorPanel / PageSpec is the reference implementation; see `docs/reference/hoy-patterns.md` section 4.)

### Standardized component library + design system
Components must be standardized so upgrading a component upgrades it on every page that uses it. Deliverables: a component library and a design system.

**Theming (D-007):** the design system is rebuilt fresh from the Figma main page's icons, fonts and colors (there is no dedicated design-system page to rely on). It must support **light and dark mode** from the start and make **new themes easy** to add later, so colors, type and spacing live as tokens, not hard-coded values.

### Business rules registry (D-006)
A single place that tracks every business rule the system enforces. Each rule is shown in two places:
- on the **spec builder / page inspector** of every page that uses it (see "Super-admin builder tool" above), and
- in a central **Settings > Rules** area, where owners can add new rules and see each rule's **status** (requested, in dev, implemented, etc.).

Seed rules from Figma: "Dog 55lb or greater must be a Suite"; "Daycare shorter than X leaves no time for spa"; pricing rules (details TBD). Justin will supply more rules later.

### Services
**Spa and grooming are the same service** (D-004): one flow, one name (proposal: "Grooming & Spa"). Vaccines are a first-class flow across customer app and front desk (D-003). Hotel reservations must be clear and consistent across every surface (D-003). In Home is out of the initial scope; day care is not designed yet (D-003).

### Table library
A library for organizing **all the tables**, so it is very clear the table system is perfect and everything looks good. (hoy: `schema.ts` + `tableRegistry` + generated SQL and data-model docs.)

### Role management
Assign what each role can **see** and whether it can **edit**, tied to each role's **individualized side menu**.

### PIN system
Staff log in fast with a PIN. Managers approve things by typing their PIN into a popup, so approvals happen in place without a full re-login.

### Staff feedback
A nice, easy way for staff to leave feedback directly in the system.

### Testing hub
Like hoy: a hub with the user manual, front-end website, customer/staff experiences, so we can test logging in as different user types. Also hoy-style dev tricks in the dashboard.

### Documentation
Changelogs and revision history for everything, plus a **business operations manual** with screenshots teaching the in-person and online lessons each staff member needs per role (hoy's ops manual is the template).

## Design source

- Figma file **Petrock Main** (`3UXEOzU9ORGm5mInQqhiUW`), page **new(justin + Mark)** (`404:14656`). Very deep design work; as long as all those features and pages exist, the rest is bonus features and polish.
- Mobile (customer) design: locked. Desktop (front desk, admin): may be improved.
- **Scope confirmed 2026-09-17 (D-001):** Sections 22 and 14 are the approved scope; older sections are reference only but are mined for useful screens missing from 22/14. Remaining open items are marked in `docs/figma/analysis.md` and tracked in `docs/decisions.md`.

## Data layer

- **Playset-LLC/Company-OS** is the database system a separate developer is building. It will be connected to **Supabase** later.
- Justin's instruction: integration method (direct vs API) is **undecided**; the developer may connect or rebuild everything cleanly later. **Develop regardless**, with Company-OS in mind for general insight.
- Digest (`docs/reference/company-os.md`, 2026-09-17): Company-OS is a metadata-driven, multi-tenant low-code platform (Fastify REST API, Drizzle/Postgres, business entities stored as JSONB `records` plus metadata; tenant isolation and row policies enforced in the API layer, Postgres RLS deferred).
- **Recommendation:** do not talk to the database directly. Integrate via the **Company-OS REST API** (`/t/petrock/api/:entity`, `/query`) or a **thin Petrock BFF** in front of it; consider Supabase-direct only if RLS and relational "graduation" tables ship. Model **Petrock as one tenant with two `org_units`** (the two locations); start from the `dh` (dog hotel) template merged with grooming's party model.
- Fits today: owner/person, pet/dog, kennel or resource, booking, appointment, staff roles/permissions, per-tenant theme.
- **New entities Petrock needs:** customer self-service auth (no end-user identity exists), service catalog with prices, invoices and payments via Stripe, spa add-ons on bookings, vaccination/medical records, persisted audit log, real availability / no-overlap enforcement. Keep availability and pricing logic in the API/BFF, not the front end.
- Front-end pattern regardless of outcome: a swappable data access layer (hoy's `DataProvider` interface with a mock provider) so the UI can be built before the data layer lands.

## Reference repos

| Repo | Why | Access status (2026-09-17) |
|---|---|---|
| [imagine-os/hoy](https://github.com/imagine-os/hoy) | Strong hub, user manual, website, customer/staff experiences, role login testing, dev-dashboard tricks, docs conventions | Cloned and digested: `docs/reference/hoy-patterns.md` |
| [Playset-LLC/Company-OS](https://github.com/Playset-LLC/Company-OS) | Database system, future Supabase connection | Digested in a separate read-only session (not attachable alongside imagine-os repos): `docs/reference/company-os.md` |
| [Santa-Maria-Tenis-Club/os](https://github.com/Santa-Maria-Tenis-Club/os) | Spec builder and dev/doc tricks (not the content) | Access granted 2026-09-17 (D-009); digest pending in a separate session: `docs/reference/santa-maria-os.md` |

Justin's note: don't worry about the content of hoy or Santa Maria; notice the things done to make development and documentation better, smarter, stronger.

## Org rules

- Projects are published with **GitHub repos + GitHub Pages** unless told otherwise. Empty repos exist for new projects and can be renamed.
- **Save prompts, replies, changelogs and all data** to documentation in the project repo (`docs/prompts`, `docs/changelog`, etc.).
