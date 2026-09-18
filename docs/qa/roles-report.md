# QA report: roles, location, PIN

- **Dimension**: ROLES, LOCATION, PIN (route guards per role, location pinning and switching, PIN approvals, per-role side menus (D-014), super-admin view-as, staff PIN login).
- **Build under test**: `main` @ `769c234` (v0.2.0), `npm run build` green, served with `vite preview` on `:4173`.
- **Method**: Playwright (Chromium from `/opt/pw-browsers`) against the preview build. Sessions were seeded exactly like `scripts/qa-lib.mjs` does: `localStorage` keys `petrock.session` (`{ userId, devMode, viewAs }`), `petrock.location` (`{ locationId, all }`) and `petrock.theme`, then the app was driven through the UI (status menus, PinPad keyboard entry, TopBar selects, sidebar buttons). The mock database (`petrock.db.v1`) was read back after each action to verify rows. Every route in the manifest (`window.__petrock.routes`, 181 unique paths after removing `*`) was visited by 14 sessions: the 8 demo users plus the super admin viewing as each of the 6 other roles.
- **Date**: 2026-09-18.

## Summary

| Area | Result |
| --- | --- |
| Route guards (`RequireRole`) | **Pass.** 181 routes x 14 sessions = 2 534 navigations, 0 deviations from the declared `roles[]`, 0 console/page errors. Blocked routes land on `/no-access?from=...` (HUB-02) with the role named. |
| Location pinning (front desk, groomer, manager) | **Pass on lists, gap on deep links.** Top bar shows a fixed label (no select) and ignores a forced `petrock.location = Westwood + all`. 25 front-desk list routes show only the pinned location's `PR-`/`GR-`/`DC-` codes. But F-12 booking detail and F-52 customer detail render (and let you mutate) the other location's records by URL (finding 1). |
| Owner / super admin location switch | **Pass.** Select with Encino / Westwood / All locations on every desk and admin page; F-10 shows 12 / 12 / 24 bookings, F-13 timeline 58 / 40 / 94 rows, A-37 adds a Location column in All mode. |
| PIN approvals on booking status | **Pass.** Gated transitions open `PinApprovalModal`, front-desk PIN is rejected with a clear message, manager PIN writes an `approvals` row (all fields), links it from `booking_events.approval_id`, writes `audit_log`, and the row shows in A-37 and on F-12. Non-gated transitions do not prompt. |
| Side menu per role (D-014) | **Pass with one gap.** Categorised, per-category collapse, expand-all / collapse-all, per-role persistence, rail mode, 390 px drawer. Gap: the manager's menu on `/desk` pages has no entry for the 7 admin pages the manager may open (finding 2). |
| View-as (super admin) | **Pass.** Reachable set under view-as is byte-identical to the real role for all 6 roles; TopBar shows "(view as)"; builder chip stays available; reset works. Minor: view-as staff is not pinned to a location (finding 6). |
| Staff PIN login (A-00) | **Pass.** 4444 -> Dana / Westwood / `/desk`, 5555 -> Renee / Encino / `/desk/grooming`, 2222 -> Priya, 1111 -> Jordan `/admin`, 000000 -> Sam; unknown PIN and <4 digits rejected. Minor: an employee with a PIN but no login gets "PIN not recognised" (finding 7). |

No blockers. 2 major, 7 minor findings below.

## Findings (most severe first)

### 1. MAJOR - Pinned staff can open and mutate the other location's booking / customer by URL

- **Where**: `src/modules/frontdesk-reservations/BookingDetailPage.tsx:45` (`useRow<BookingRow>('bookings', id)` - no location check), `src/modules/frontdesk-grooming-people/pages/CustomerDetailPage.tsx` (same for customers). Contrast: `src/modules/frontdesk-grooming-people/hooks.ts:34` scopes appointments, so F-34 `/desk/grooming/:id` correctly shows "not found" for the other location.
- **Repro**: session `usr_desk` (Encino). Open `#/desk/reservations/bk_1003` (a Westwood booking, `PR-1003`) -> the page renders the booking with the full action bar. Open `#/desk/reservations/bk_1011` (Westwood, confirmed) -> Set status -> No show -> PIN 2222 -> status becomes `no_show`; the `approvals` row is written with `location_id = loc_encino` (the actor's UI location, not the booking's). Open `#/desk/customers/cus_3` (Diego Fernandez, home Westwood) -> renders.
- **Why it matters**: list pages hide the other location, but deep links do exist: F-60 notification `ntf_fgp_1` for the Encino desk links to Westwood customer `cus_8` and names `PR-1028`; the customer detail bookings list, search hits and pasted URLs all bypass the scope. A-37 filtered to Westwood therefore does not show the Westwood approval (it is stored under Encino).
- **Fix**: in `BookingDetailPage` / `CustomerDetailPage` / `PetDetailPage` / `InvoicePage`, compare `row.location_id` (or `customer.home_location_id`) with `useLocation().locationId` unless `allLocations`, and render the existing not-found / "belongs to Westwood" EmptyState; write `approvals.location_id` from the subject row (`b.location_id`) in `useBookingActions.changeStatus` and `PinApprovalModal` (accept an optional `locationId` in `PinApprovalRequest`).

### 2. MAJOR - Manager's side menu omits the admin pages the manager may use (D-014)

- **Where**: `src/app/shells.tsx` (`frontdesk` shell uses `surfaces: ['frontdesk', 'manual']`; `admin` shell uses `['admin', 'frontdesk', 'manual']`), `src/modules/admin-control-panel/index.ts:52` (`OWN_MGR` routes: A-27, A-35, A-36, A-37, A-38, A-40, A-42).
- **Repro**: session `usr_manager`, open `#/desk`. Sidebar codes: `F-01 F-10 F-13 F-15 F-11 F-30 ... F-68 M-01 M-03` - no `A-*`. Open `#/admin/approvals` directly: it renders (guard passes) and *now* the menu shows `A-35 A-36 A-42 A-37 A-38 A-27 A-40`, and the shell title flips to "Owner / admin". The manager has no link to the Approvals log, Feedback inbox, Reviews moderation, Pricing hub or Reports from any page they land on (`ROLE_HOME.manager = '/desk'`).
- **Fix**: pick the menu surfaces by role rather than by the current route's surface (e.g. `DesktopShell` includes `admin` routes whenever `hasRole` passes for at least one admin route), or give the manager a "Reports & approvals" group on the frontdesk shell. Keep one shell title per role.

### 3. MINOR - Customers and Pets lists let pinned staff toggle to "All locations"

- **Where**: `src/modules/frontdesk-grooming-people/pages/CustomersPage.tsx:26,55`, `PetsPage.tsx:22`.
- **Repro**: `usr_desk` -> `#/desk/customers` -> button "Encino only" -> click -> "All locations · 9 pet parents", Westwood customers (Fernandez, Kim, Marchetti, Nakamura) appear. Same on `/desk/pets`. `/desk/vaccines` has no such toggle.
- **Note**: customers are company-wide (`home_location_id`, not `location_id`), so this may be intended; but it contradicts the pinned label in the TopBar and the `canSwitch` rule. Either hide the toggle when `!canSwitch` or document it as a rule (R-K0x) and show a "home location" hint.

### 4. MINOR - Groomer may open the hotel reservations board (F-14) but not the table, timeline or detail

- **Where**: `src/modules/frontdesk-reservations/index.ts` (F-14 `/desk/reservations/board` roles include `groomer`; F-10, F-12, F-13, F-15 use `DESK = STAFF_ROLES minus groomer`).
- **Repro**: `usr_groomer` -> `#/desk/reservations/board` renders; `#/desk/reservations`, `#/desk/reservations/timeline`, `#/desk/reservations/bk_1011` -> `/no-access`. The board exposes hotel bookings (codes, pets, statuses) the groomer cannot otherwise see. Decide one way (probably remove `groomer` from F-14).

### 5. MINOR - `bookings.status` permission is never checked; status menu keys off `bookings.write_any`

- **Where**: `src/auth/permissions.ts` (only manager+ hold `bookings.status`), `src/modules/frontdesk-reservations/BookingDetailPage.tsx:116` (`disabled={!can('bookings.write_any')}`), no `can('bookings.status')` call anywhere in `src/`.
- **Effect**: today the PIN gate (`PIN_GATED_TRANSITIONS`) is the only control, which matches R-I06, but the permission string is dead and the A-32 roles matrix shows it as if it mattered. Either wire the non-gated transitions (`requested -> confirmed`, check-in / check-out) to `can('bookings.write_any')` and the gated ones to "PIN or `can('bookings.status')`", or drop the permission.

### 6. MINOR - View-as staff is not pinned to a location and cannot change it

- **Where**: `src/tenant/LocationProvider.tsx:38` (`pinned = user.locationId`; the super admin's is `null`).
- **Repro**: `usr_super` with `petrock.location = { loc_westwood, all: true }`, view as front desk, open `#/desk/reservations`: TopBar says "Westwood" as a fixed label, no select, 3 bookings. To look at Encino you must leave view-as, switch, and re-enter. Suggest: when `viewAs` is a pinned role, pin to `demoUserByRole(viewAs).locationId` or keep the select enabled for the underlying super admin.

### 7. MINOR - PIN login rejects an active employee whose PIN exists but who has no login user

- **Where**: `src/modules/auth/PinLoginPage.tsx:35` (`!users.some(u => u.id === h.userId)` -> "PIN not recognised. Try again."), seed `src/data/seed/core.ts:52` (`emp_jessica`, PIN 6666, `user_id: null`).
- **Repro**: `#/staff/pin`, type 6666 -> "PIN not recognised". The PIN *is* recognised; the person has no `users` row. Say so ("Jessica has no login yet - ask a manager") or create the login from A-30 when a PIN is set.

### 8. MINOR - "(view as)" suffix shown for non-super users with a stale `viewAs`

- **Where**: `src/components/organism/TopBar/TopBar.tsx:41` (`{viewAs ? ' (view as)' : ''}` uses raw `state.viewAs`), `SessionProvider.tsx` exposes `viewAs` even when `!isSuperAdmin`.
- **Repro**: `petrock.session = { userId: 'usr_owner', viewAs: 'customer' }` -> `/admin` renders as Owner (correct, `role` ignores it) but the TopBar reads "Jordan Blake · Owner (view as)". Only reachable through storage today (`switchUser` clears `viewAs`), so cosmetic. Expose `viewAs: isSuperAdmin ? state.viewAs : null`.

### 9. MINOR - Seed notification for the Encino desk points at a Westwood booking

- **Where**: `src/data/seed/frontdesk-grooming-people.ts:101` (`usr_desk`, "Grace Nakamura requested a Suite ... (PR-1028)", link `/desk/customers/cus_8`).
- **Effect**: the only cross-location leak in the 25-route sweep (F-60 `/desk/notifications` shows `PR-1028`), and it is the deep link that exercises finding 1. Move it to `usr_desk_ww` or use an Encino booking.

Also observed (not counted as findings): `PinApprovalModal` accepts any approver PIN regardless of location, and a manager can approve their own request with their own PIN (self-approval; `PinApprovalModal.tsx:38`). `LocationProvider` silently falls back to the first active location when a pinned location is inactive. Owner cannot open any `/app` (customer) page or the dev pages except D-05..D-07 - by declared roles, consistent with view-as being super-admin-only.

## 1. Route reachability per role

Legend: ✓ reachable, ↪ reachable but redirected by the page itself (wizard steps that bounce to their first step when state is missing), · redirected to `/no-access`. Columns: SA super admin (no view-as), OW owner, MG manager, FD front desk (Encino and Westwood are identical), GR groomer, CU customer, PU public. The super admin viewing as a role gets exactly that role's column (verified for all six).

Per surface (reachable / total):

| Session | frontdesk | admin | dev | docs | manual | customer | public |
| --- | --- | --- | --- | --- | --- | --- | --- |
| super_admin | 34/34 | 25/25 | 22/22 | 1/1 | 27/27 | 56/56 | 15/16* |
| owner | 34/34 | 25/25 | 3/22 | 1/1 | 27/27 | 9/56 | 15/16* |
| manager | 34/34 | 7/25 | 2/22 | 1/1 | 27/27 | 9/56 | 15/16* |
| front_desk (Encino / Westwood) | 30/34 | 0/25 | 0/22 | 0/1 | 27/27 | 9/56 | 15/16* |
| groomer | 17/34 | 0/25 | 0/22 | 0/1 | 27/27 | 9/56 | 15/16* |
| customer | 0/34 | 0/25 | 0/22 | 0/1 | 0/27 | 56/56 | 15/16* |
| public | 0/34 | 0/25 | 0/22 | 0/1 | 0/27 | 9/56 | 15/16* |

\* the 16th public route is HUB-02 `/no-access` itself, which the sweep classifies as "no-access" by definition. The 9 customer-surface routes everyone reaches are the auth screens C-01..C-09.

Groomer's 17 front-desk routes: F-01, F-30, F-31, F-32, F-34, F-14 (see finding 4), F-50, F-52, F-53, F-55, F-57, F-59, F-60, F-61, F-66, F-67, F-68. Manager's 7 admin routes: A-27, A-35, A-36, A-37, A-38, A-40, A-42 (see finding 2).

Full matrix:

### frontdesk (34 routes)

| Code | Route | Declared roles | SA | OW | MG | FD | GR | CU | PU |
| --- | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| F-01 | `/desk` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-30 | `/desk/grooming` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-60 | `/desk/notifications` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-61 | `/desk/inquiries` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-65 | `/desk/reviews` | SA OW MG | ✓ | ✓ | ✓ | · | · | · | · |
| F-62 | `/desk/reports` | SA OW MG | ✓ | ✓ | ✓ | · | · | · | · |
| F-63 | `/desk/reports/revenue` | SA OW MG | ✓ | ✓ | ✓ | · | · | · | · |
| F-64 | `/desk/reports/occupancy` | SA OW MG | ✓ | ✓ | ✓ | · | · | · | · |
| F-66 | `/desk/education` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-67 | `/desk/walking` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-68 | `/desk/tasks` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-31 | `/desk/grooming/board` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-32 | `/desk/grooming/agenda` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-33 | `/desk/grooming/new` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-33 | `/desk/grooming/:id/edit` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-34 | `/desk/grooming/:id` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-50 | `/desk/customers` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-51 | `/desk/customers/new` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-51 | `/desk/customers/:id/edit` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-52 | `/desk/customers/:id` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-53 | `/desk/pets` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-54 | `/desk/pets/new` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-54 | `/desk/pets/:id/edit` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-55 | `/desk/pets/:id` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-56 | `/desk/vaccines` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-57 | `/desk/messages` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-59 | `/desk/invoices/:id` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-10 | `/desk/reservations` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-13 | `/desk/reservations/timeline` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-14 | `/desk/reservations/board` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| F-15 | `/desk/reservations/availability` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-11 | `/desk/reservations/new` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-11 | `/desk/reservations/:id/edit` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |
| F-12 | `/desk/reservations/:id` | SA OW MG FD | ✓ | ✓ | ✓ | ✓ | · | · | · |

### admin (25 routes)

| Code | Route | Declared roles | SA | OW | MG | FD | GR | CU | PU |
| --- | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| A-01 | `/admin` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-42 | `/admin/reports` | OW SA MG | ✓ | ✓ | ✓ | · | · | · | · |
| A-10 | `/admin/company` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-41 | `/admin/locations/new` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-11 | `/admin/locations/:id` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-12 | `/admin/rooms` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-27 | `/admin/pricing` | OW SA MG | ✓ | ✓ | ✓ | · | · | · | · |
| A-20 | `/admin/pricing/rates` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-21 | `/admin/pricing/discounts` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-22 | `/admin/pricing/fees` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-23 | `/admin/pricing/daycare` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-24 | `/admin/pricing/packages` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-25 | `/admin/pricing/addons` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-26 | `/admin/services` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-28 | `/admin/providers` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-30 | `/admin/employees` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-31 | `/admin/roles` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-32 | `/admin/menus` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-35 | `/admin/reviews` | OW SA MG | ✓ | ✓ | ✓ | · | · | · | · |
| A-36 | `/admin/feedback` | OW SA MG | ✓ | ✓ | ✓ | · | · | · | · |
| A-37 | `/admin/approvals` | OW SA MG | ✓ | ✓ | ✓ | · | · | · | · |
| A-38 | `/admin/audit` | OW SA MG | ✓ | ✓ | ✓ | · | · | · | · |
| A-43 | `/admin/backups` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-44 | `/admin/settings` | OW SA | ✓ | ✓ | · | · | · | · | · |
| A-40 | `/admin/settings/rules` | OW SA MG | ✓ | ✓ | ✓ | · | · | · | · |

### dev (22 routes)

| Code | Route | Declared roles | SA | OW | MG | FD | GR | CU | PU |
| --- | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| D-03 | `/dev` | SA | ✓ | · | · | · | · | · | · |
| D-01 | `/dev/tokens` | SA | ✓ | · | · | · | · | · | · |
| D-02 | `/dev/components` | SA | ✓ | · | · | · | · | · | · |
| D-03 | `/dev/specs` | SA | ✓ | · | · | · | · | · | · |
| D-04 | `/dev/tables` | SA | ✓ | · | · | · | · | · | · |
| D-04 | `/dev/tables/:table` | SA | ✓ | · | · | · | · | · | · |
| D-05 | `/dev/rules` | SA OW MG | ✓ | ✓ | ✓ | · | · | · | · |
| D-07 | `/dev/knowledge` | SA OW | ✓ | ✓ | · | · | · | · | · |
| D-08 | `/dev/components/matrix` | SA | ✓ | · | · | · | · | · | · |
| D-09 | `/dev/specs/report` | SA | ✓ | · | · | · | · | · | · |
| D-10 | `/dev/data` | SA | ✓ | · | · | · | · | · | · |
| D-10 | `/dev/data/:table` | SA | ✓ | · | · | · | · | · | · |
| D-11 | `/dev/layout` | SA | ✓ | · | · | · | · | · | · |
| D-11 | `/dev/layout/:code` | SA | ✓ | · | · | · | · | · | · |
| D-14 | `/dev/seed` | SA | ✓ | · | · | · | · | · | · |
| D-19 | `/dev/routes` | SA | ✓ | · | · | · | · | · | · |
| D-12 | `/dev/qa/responsive` | SA | ✓ | · | · | · | · | · | · |
| D-13 | `/dev/qa/preview` | SA | ✓ | · | · | · | · | · | · |
| D-15 | `/dev/qa/a11y` | SA | ✓ | · | · | · | · | · | · |
| D-16 | `/dev/qa/perf` | SA | ✓ | · | · | · | · | · | · |
| D-17 | `/dev/qa/screenshots` | SA | ✓ | · | · | · | · | · | · |
| D-18 | `/dev/docs-search` | SA OW MG | ✓ | ✓ | ✓ | · | · | · | · |

### docs (1 routes)

| Code | Route | Declared roles | SA | OW | MG | FD | GR | CU | PU |
| --- | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| D-06 | `/docs` | SA OW MG | ✓ | ✓ | ✓ | · | · | · | · |

### manual (27 routes)

| Code | Route | Declared roles | SA | OW | MG | FD | GR | CU | PU |
| --- | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| M-01 | `/manual` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-03 | `/manual/pending` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-10 | `/manual/10-welcome-and-how-to-use-this-manual` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-11 | `/manual/11-front-desk-daily-operations` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-12 | `/manual/12-check-in-and-check-out` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-13 | `/manual/13-vaccine-verification` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-14 | `/manual/14-hotel-reservations-and-the-booking-lifecycle` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-15 | `/manual/15-grooming-and-spa-agenda` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-16 | `/manual/16-daycare-day` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-17 | `/manual/17-pin-approvals` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-18 | `/manual/18-payments-invoices-and-refunds` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-19 | `/manual/19-messages-notifications-and-reviews` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-20 | `/manual/20-manager-duties` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-21 | `/manual/21-owner-settings-and-pricing` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-22 | `/manual/22-roles-permissions-and-locations` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-23 | `/manual/23-reports` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-24 | `/manual/24-staff-feedback-and-the-rules-registry` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-25 | `/manual/25-glossary-and-data-tables` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-26 | `/manual/26-website-and-customer-app` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-27 | `/manual/27-walks-tasks-and-education` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-28 | `/manual/28-hotel-reservations-at-the-desk` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-29 | `/manual/29-grooming-customers-and-pets-at-the-desk` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-30 | `/manual/30-hotel-stays-booked-in-the-app` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-31 | `/manual/31-grooming-and-daycare-booked-in-the-app` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-32 | `/manual/32-owner-control-panel` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-33 | `/manual/33-quality-tools` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |
| M-02 | `/manual/:slug` | SA OW MG FD GR | ✓ | ✓ | ✓ | ✓ | ✓ | · | · |

### customer (56 routes)

| Code | Route | Declared roles | SA | OW | MG | FD | GR | CU | PU |
| --- | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| C-10 | `/app` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-02 | `/auth/sign-in` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C-01 | `/auth` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C-03 | `/auth/sign-up` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C-04 | `/auth/verify` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C-05 | `/auth/forgot` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C-06 | `/auth/reset` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C-07 | `/auth/locked` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C-08 | `/auth/welcome` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C-09 | `/auth/sign-out` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C-50 | `/app/grooming` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-51 | `/app/grooming/new` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-52 | `/app/grooming/new/add-ons` | CU SA | ↪ | · | · | · | · | ↪ | · |
| C-53 | `/app/grooming/new/time` | CU SA | ↪ | · | · | · | · | ↪ | · |
| C-54 | `/app/grooming/new/checkout` | CU SA | ↪ | · | · | · | · | ↪ | · |
| C-56 | `/app/grooming/orders` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-55 | `/app/grooming/orders/:id` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-60 | `/app/daycare` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-61 | `/app/daycare/new` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-62 | `/app/daycare/new/details` | CU SA | ↪ | · | · | · | · | ↪ | · |
| C-63 | `/app/daycare/new/checkout` | CU SA | ↪ | · | · | · | · | ↪ | · |
| C-65 | `/app/daycare/bookings` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-64 | `/app/daycare/bookings/:id` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-11 | `/app/pets` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-12 | `/app/pets/new` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-13 | `/app/pets/:petId` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-14 | `/app/pets/:petId/edit` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-21 | `/app/pets/:petId/vaccines` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-20 | `/app/vaccines` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-30 | `/app/hotel` | CU | ✓ | · | · | · | · | ✓ | · |
| C-31 | `/app/hotel/room` | CU | ↪ | · | · | · | · | ↪ | · |
| C-32 | `/app/hotel/pets` | CU | ↪ | · | · | · | · | ↪ | · |
| C-33 | `/app/hotel/grooming` | CU | ↪ | · | · | · | · | ↪ | · |
| C-34 | `/app/hotel/customer` | CU | ↪ | · | · | · | · | ↪ | · |
| C-35 | `/app/hotel/estimate` | CU | ↪ | · | · | · | · | ↪ | · |
| C-36 | `/app/hotel/pay` | CU | ↪ | · | · | · | · | ↪ | · |
| C-37 | `/app/hotel/done/:id` | CU | ✓ | · | · | · | · | ✓ | · |
| C-38 | `/app/bookings` | CU | ✓ | · | · | · | · | ✓ | · |
| C-39 | `/app/bookings/:id` | CU | ✓ | · | · | · | · | ✓ | · |
| C-40 | `/app/bookings/:id/invoice` | CU | ✓ | · | · | · | · | ✓ | · |
| C-41 | `/app/bookings/:id/change` | CU | ✓ | · | · | · | · | ✓ | · |
| C-70 | `/app/profile` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-71 | `/app/profile/edit` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-72 | `/app/settings` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-73 | `/app/settings/language` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-74 | `/app/payment-methods` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-75 | `/app/settings/notifications` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-76 | `/app/settings/delete-account` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-77 | `/app/help` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-78 | `/app/about` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-79 | `/app/legal/:slug` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-80 | `/app/notifications` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-81 | `/app/inbox` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-82 | `/app/inbox/:conversationId` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-83 | `/app/rate` | CU SA | ✓ | · | · | · | · | ✓ | · |
| C-84 | `/app/settings/password` | CU SA | ✓ | · | · | · | · | ✓ | · |

### public (16 routes)

| Code | Route | Declared roles | SA | OW | MG | FD | GR | CU | PU |
| --- | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| A-00 | `/staff/pin` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-01 | `/site` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-01 | `/site/home` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-02 | `/site/hotel` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-03 | `/site/grooming` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-04 | `/site/daycare` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-05 | `/site/pricing` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-06 | `/site/locations` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-07 | `/site/reviews` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-08 | `/site/policies` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-09 | `/site/book` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-10 | `/site/contact` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-11 | `/site/faq` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P-12 | `/site/about` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| HUB-01 | `/` | everyone | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| HUB-02 | `/no-access` | everyone | · | · | · | · | · | · | · |

## 2. Location pinning and switching

Pinned roles were started with `petrock.location = { locationId: <other location>, all: true }` to prove storage cannot override the pin. Every non-parameterised front-desk route (25) was visited; the page text was scanned for `PR-`, `GR-`, `DC-` codes and compared with the seed's per-location sets ("All upcoming" tab clicked where present).

| User | Pinned label in TopBar | Location select | Leaks in 25 list routes | `/desk/reservations/<other loc booking>` | `/desk/grooming/<other loc appt>` | `/desk/customers/<other loc customer>` |
| --- | --- | --- | --- | --- | --- | --- |
| `usr_desk` front desk Encino | Encino | none | 1: F-60 shows `PR-1028` (seed notification, finding 9) | renders `PR-1003` (finding 1) | not found (scoped) | renders Diego Fernandez (finding 1) |
| `usr_desk_ww` front desk Westwood | Westwood | none | 0 | renders `PR-1001` (finding 1) | not found | renders Avery Thompson (finding 1) |
| `usr_groomer` Encino | Encino | none | 0 | `/no-access` (role) | not found | renders (finding 1) |
| `usr_manager` Encino | Encino | none | 0 | renders `PR-1003` (finding 1) | not found | renders (finding 1) |

Owner and super admin (`petrock.location` Encino):

| Step (F-10 table, "All upcoming") | Bookings shown | Encino | Westwood | storage after |
| --- | --- | --- | --- | --- |
| select Encino | 12 | 12 | 0 | `{ loc_encino, all:false }` |
| select Westwood | 12 | 0 | 12 | `{ loc_westwood, all:false }` |
| select All locations | 24 | 12 | 12 | `{ loc_westwood, all:true }` |

F-13 timeline: 58 rows / 12 blocks (Encino: 54 rooms + unassigned + daycare rows), 40 / 14 (Westwood: 36 rooms), 94 / 26 (All). The select (Encino, Westwood, All locations) is present in the TopBar on every desk and admin page for both roles; A-37 gains a Location column in All mode. PIN login as owner (1111) or super admin (000000) lands on `/admin` with the select.

## 3. PIN approvals

Session `usr_desk` (Encino), F-12 booking detail. Seed had 2 approvals.

| Action | Prompted? | Result |
| --- | --- | --- |
| `PR-1010` confirmed -> Set status -> Cancelled (menu shows lock icons on Cancelled and No show) | yes, `PinApprovalModal` "Set PR-1010 to Cancelled", badge `booking.status` | PIN 3333 (front desk): "Marcus Lee is Front desk; a manager or owner PIN is needed". PIN 9999: "PIN not recognised". PIN 2222 (manager): modal closes, toast, status `cancelled`, `payment_status` `refunded`. |
| `approvals` row written | - | `{ action: booking.status, location_id: loc_encino, subject_table: bookings, subject_id: bk_1010, requested_by: usr_desk, approved_by: usr_manager, approver_role: manager, details: { from: confirmed, to: cancelled }, approved_at, created_at }`; `booking_events` status row carries `approval_id`; `audit_log` row `booking.status`. |
| `PR-1029` requested -> quick "Confirm" | no | status `confirmed`, approvals unchanged (correct: not in `PIN_GATED_TRANSITIONS`). |
| `PR-1025` pending_vaccines -> "Confirm anyway" | yes | Escape closes the modal without writing. |
| Delete booking (trash icon) | yes, action `record.delete` | closed without writing. |
| Westwood booking `PR-1011` by direct URL -> No show | yes | approved with 2222; row stored under `loc_encino` (finding 1). |
| A-37 `/admin/approvals` as manager (switched via TopBar demo-user select) | - | reachable, KPI "Approvals 4", both new rows listed. As owner: Encino shows 4, Westwood 0 (the Westwood booking's approval is under Encino), All shows 4 with a Location column. F-12 history shows "approved by Priya Natarajan". |

Grooming appointments use the same modal through `appointmentNeedsPin` (`src/modules/frontdesk-grooming-people/lib.ts:27`: confirmed -> cancelled / no_show, re-open) - code-read only.

## 4. Side menu per role (D-014)

Collapse all -> every `.sidebar-cat[aria-expanded=false]`, button reads "Expand all"; Expand all restores; clicking one category collapses only it; state persisted under `petrock.sidebar.<role>` (e.g. `["reservations"]`); rail toggle present at 1280; at 390 the sidebar is hidden, the TopBar menu button opens an overlay drawer with the same groups, and the drawer closes on navigation; no horizontal scroll.

| Session @ page | Groups (items) |
| --- | --- |
| super admin @ /admin (identical to owner @ /admin and view-as owner) | Overview 2, Hotel reservations 4, Grooming & Spa 5, People & pets 3, Vaccines 1, Messages & reviews 6, Reports 6, Settings 10, Extras 3, Ops manual 2 |
| super admin @ /dev | Overview 1, People & pets 1, Messages & reviews 2, Reports 3, Settings 10, Developer 12, Docs 2, Quality 5 |
| manager @ /desk (= view-as manager) | Overview 1, Hotel reservations 4, Grooming & Spa 5, People & pets 2, Vaccines 1, Messages & reviews 4, Reports 3, Extras 3, Ops manual 2 (no A-* entries, finding 2) |
| front desk @ /desk (= view-as front desk) | Overview 1, Hotel reservations 4, Grooming & Spa 5, People & pets 2, Vaccines 1, Messages & reviews 3, Extras 3, Ops manual 2 |
| groomer @ /desk/grooming (= view-as groomer) | Overview 1, Grooming & Spa 4, People & pets 2, Messages & reviews 3, Extras 3, Ops manual 2 |

TopBar role label per session: "Super admin", "Owner", "Manager", "Front desk", "Groomer"; under view-as: "<Role> (view as)".

## 5. View-as (super admin)

- TopBar user menu -> "View as role" options: myself, owner, manager, front_desk, groomer, customer, public.
- View as front desk while on `/admin` -> immediate redirect to `/no-access?from=/admin`; `/desk` renders with the front desk menu (identical code list to `usr_desk`), label "Sam Rivera · Front desk (view as)", builder chip still present (`devMode` stays on), location shown as a pinned label (finding 6).
- View as customer -> `/app` renders in the PhoneShell with the bottom nav. Back to "myself" -> `/admin` renders as Super admin.
- Reachability under view-as equals the real role for all six roles (181 routes each). `hasRole` grants the super admin every route only when `viewAs` is null.

## 6. Staff PIN login (A-00)

| PIN | Result |
| --- | --- |
| 9999 | "PIN not recognised. Try again.", stays on `/staff/pin` |
| 4444 | Dana Whitfield, front desk, `/desk`, TopBar "Westwood" (pinned) even with `petrock.location = Encino + all` in storage; toast "Welcome, Dana - Front desk · Westwood" |
| 5555 | Renee Castillo, groomer, `/desk/grooming`, "Encino" |
| 3333 / 2222 | Marcus Lee / Priya Natarajan, `/desk`, "Encino" |
| 1111 / 000000 | Jordan Blake / Sam Rivera, `/admin`, location select |
| 12, 123 | submit key disabled below 4 digits |
| 6666 (employee Jessica, no login) | "PIN not recognised" (finding 7) |

## Passed checks

- `RequireRole` on every route: 0 deviations from declared roles across 14 sessions; `/no-access` names the role and the blocked path and offers hub + PIN login.
- Super admin without view-as reaches all 180 routes; view-as removes the bypass.
- Pinned roles (front desk both locations, groomer, manager): fixed TopBar label, no select, storage override ignored, list/timeline/board/today/availability/messages scoped through `useLocation().scope`.
- Owner / super admin: select with All locations everywhere on desk + admin; counts add up (12 + 12 = 24 bookings; 58 + 40 - shared rows = 94 timeline rows).
- Booking status changes: locks shown in the menu for gated transitions, modal, role check on the approver PIN, approvals + booking_events + audit_log written before/with the action, A-37 and F-12 show the approval; non-gated transitions bypass the modal.
- Side menu: categories, collapse/expand all, single toggle, per-role persistence, rail, 390 drawer, per-role item sets.
- Staff PIN login: 4-6 digits, demo holders and `employees.pin_hash`, `ROLE_HOME` landing, location follows the user.
- No page errors or console errors in any scenario.

## How to reproduce

1. `npm run build && npx vite preview --port 4173`.
2. Seed a session in DevTools before loading: `localStorage.setItem('petrock.session', JSON.stringify({ userId: 'usr_desk', devMode: false, viewAs: null }))`, `localStorage.setItem('petrock.location', JSON.stringify({ locationId: 'loc_westwood', all: true }))`, then open `http://localhost:4173/#/desk`.
3. Demo ids: `usr_super` (PIN 000000), `usr_owner` (1111), `usr_manager` (2222), `usr_desk` (3333, Encino), `usr_desk_ww` (4444, Westwood), `usr_groomer` (5555), `usr_customer`, `usr_public`.
4. Read the mock DB with `JSON.parse(localStorage.getItem('petrock.db.v1')).db.approvals`.
