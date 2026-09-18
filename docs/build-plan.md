# Build plan

Started 2026-09-18 on Justin's "Please build the whole thing" (prompt 0005). Foundation first (this document's phase 1, changelog 0007), then ten module builders in parallel, then integration passes. Every module follows the contract in `CLAUDE.md`.

## Phases

| Phase | What | Status |
| --- | --- | --- |
| 1. Foundation | Stack, tokens + themes, component library (42), app plumbing (registry, shells, session, location, PIN, feedback), schema (39 tables) + seed, rules registry (76), pricing engine + tests, payments seam, hub, PIN login, dev pages D-01..D-07, docs viewer, public placeholder, CI to GitHub Pages | done (v0.1.0) |
| 2. Modules in parallel | Ten module agents build their page ranges against the contract; each replaces stubs, adds schema/seed/rules/specs files, page docs, screenshots, `_pending` changelog | next |
| 3. Integration | Merge pending changelogs into numbered entries, full screenshot pass, responsive QA on every page (D-016), spec completeness to 100 %, data-model + specs regenerated, kanban | after 2 |
| 4. Data layer | Wire `CompanyOsProvider` (or the Petrock BFF) behind the same `DataProvider`; Stripe Elements behind `StripePaymentProvider`; real PIN check | when the API exists |
| 5. Apps | Capacitor wrap of the customer surface; store settings (legal, privacy, account deletion) | after 3 |

## Modules, page code ranges and owners

| Module (folder) | Codes | Scope | Stubs to replace |
| --- | --- | --- | --- |
| `customer-auth` | C-01..C-09 | Splash, sign in, sign up, OTP verify, forgot / reset password, locked, account created (D-018: improve beyond Figma) | `/auth/sign-in` (C-02) |
| `customer-home-pets` | C-10..C-29 | Home, pets list, add pet wizard (details, care, medical), pet profile, vaccines per pet (C-20..C-29: list, upload proof, status) | `/app` (C-10) |
| `customer-hotel` | C-30..C-49 | Choose pets, share room, room type, dates, medical questionnaire, estimate, payment (deposit / full, card / cash), confirmation, my bookings, booking detail / invoice | - |
| `customer-grooming-daycare` | C-50..C-69 | Grooming & Spa: choose pet, package by size, add-ons, time, summary, pay, past orders / re-create (C-50..C-59); Daycare: date, times, computed price, pets, medical, pay (C-60..C-69) | - |
| `customer-settings-chat` | C-70..C-89 | Profile hub, edit profile, address, settings (dark mode, language, delete account), notifications centre, Front Desk chat, rate app, help, legal (C-70..C-79); chat + notifications (C-80..C-89) | - |
| `frontdesk-reservations` | F-01..F-29 | Today dashboard, reservations table (day buckets), booking detail, new booking wizard, room assignment (30 lb rule), check-in / check-out, status changes with PIN, timeline (rooms x days), invoices & payments at the desk (F-20..F-29) | `/desk` (F-01) |
| `frontdesk-grooming-people` | F-30..F-59 | Grooming day view (groomer columns), board (kanban by status), agenda list, appointment form (F-30..F-39); daycare day (F-40..F-49); customers, pets, vaccine verification queue, employees list (F-50..F-59) | `/desk/grooming` (F-30) |
| `admin-control-panel` | A-01..A-49 | Owner dashboard / KPIs / reports, locations + hours + capacities (A-10..A-19), pricing setup: rates, seasons, discounts, fees, taxes, packages, add-ons, daycare pricing (A-20..A-29), staff, roles & permissions, per-role menus (A-30..A-34), reviews (A-35), feedback inbox (A-36), approvals audit (A-37), settings incl. Settings › Rules (A-40 exists), add location flow (A-41) | `/admin` (A-01) |
| `extras-manual-website` | P-01..P-19, M-01..M-30, F-60..F-79 | Public website pages; ops manual chapters per role with screenshots; extras: staff notifications (F-60), messages inbox (F-61), reports (F-62..), education, walking, management | `/manual` (M-01), `/desk/notifications` (F-60) |
| `dev-quality` | D-08..D-19 | Responsive QA page, spec completeness report, seed inspector, layout editor, a11y checks, performance budget, screenshot diff | - |

Reserved by the foundation: HUB-01, HUB-02, A-00, A-40, D-01..D-07, P-00, and the stub specs C-02, C-10, F-01, F-30, F-60, A-01, M-01 (modules replace them; keep the codes).

## Definition of done (every page)

1. Route with a `PageSpec` (purpose, layout, data, roles, logic, components, rules, states, checkedAt) - completeness 100 % in D-03.
2. Library components only; new components have metas and show in D-02.
3. Data from tables through `useTable` / `useData`; prices through the pricing engine.
4. PIN-gated actions use `PinApprovalModal`; feedback button present (DesktopShell).
5. Responsive at 360 / 390 / 768 / 1280 / 1920 (D-016).
6. `docs/pages/<CODE>.md`, screenshots, `_pending` changelog, kanban line, rules statuses updated.
7. `npm run build` green, commit with codes in the body and the trailers.

## Open decisions carried into the build (see docs/figma/open-questions.md)

- Daycare threshold 6 h (settings) chosen over 5 h (mobile) until Justin confirms (R-F01).
- Card fee 3.89 % chosen over 3.8 % (R-H03). Tax 2 % across service / product / boarding (R-H04).
- Platinum prices from the Spa card, Diamond prices are placeholders (R-G04, R-G06).
- Weight unit lbs; size bands S <20, M <40, L <70, XL <100, Giant 100+ lb (working assumption).
- Room fit: 30 lb bottom-penthouse rule (R-E09) and 55 lb Suite rule (R-X01) both registered; R-X01 requested.
