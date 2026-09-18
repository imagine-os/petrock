# admin-control-panel - Owner / super-admin Control Panel (A-01..A-44)

version: 0.2.0-admin-control-panel
date: 2026-09-18
prompt: 0005
intent: Give the owner every settings, staff, pricing, reporting and audit page the Control Panel PDFs (1-15.pdf) and front desk-4/-6/-7 describe, on the foundation's tables, with audited edits and PIN-gated deletes.
decision: D-pending-ACP-01..18 (docs/decisions/_pending/admin-control-panel.md); pricing pages only edit tables and the preview quotes through src/pricing/engine.ts (R-X44); every Control Panel write goes through useAdminCrud() and lands in audit_log (R-X41); deletes and PIN resets need a manager PIN (R-X42, R-X43).
rejected: A separate front-desk copy of the settings screens (one Settings area, D-002); hand-rolled tables / forms in pages (CrudTable composes DataTable + AdminRecordDrawer); a chart library (two small SVG components with a validated palette per the dataviz method); storing secrets for providers (last 4 characters only).
files: src/modules/admin-control-panel/** (index, specs, lib, CrudTable, admin.css, 12 page files), src/components/organism/{AdminBarChart,AdminLineChart,AdminRecordDrawer,AdminPermissionMatrix}, src/components/molecule/{AdminMeter,AdminHoursGrid}, src/data/schema/admin-control-panel.ts, src/data/seed/admin-control-panel.ts, src/rules/admin-control-panel.ts, docs/pages/A-*.md (24), docs/screenshots/A-*/ (24 folders), docs/decisions/_pending/admin-control-panel.md, docs/ops-manual/en/_pending/admin-control-panel.md
codes: A-01, A-10, A-11, A-12, A-20, A-21, A-22, A-23, A-24, A-25, A-26, A-27, A-28, A-30, A-31, A-32, A-35, A-36, A-37, A-38, A-41, A-42, A-43, A-44

## What exists now

- **A-01 Dashboard** replaces the stub: KPIs (revenue today / month from paid payments, dogs in house, grooms + daycare today, attention count), stacked revenue chart (card / cash; 7 d / 30 d / 12 m), occupancy meters per room type + daycare + grooming, today's schedule across services, attention list linking to A-36 / A-35 / A-37.
- **Company & locations**: A-10 company profile (settings.company) and location cards; A-11 location detail with AdminHoursGrid, capacities, holidays CrudTable and PIN-gated delete; A-41 four-step add-location flow (locations + 4 capacities rows).
- **A-12 Rooms & room types** with tonight's occupancy and the fit rules in the copy.
- **Pricing** A-27 overview + live quote calculator (hotel / grooming / daycare), A-20 rates & seasons, A-21 discounts (fields by kind), A-22 fees & taxes, A-23 daycare pricing, A-24 packages by size (price + minutes column groups), A-25 add-ons, A-26 services.
- **A-28 Providers**: email / SMS / push stubs with configure drawer and test-send log; payment seam card.
- **People**: A-30 employees (add / edit, role + login link, status, colour, flags, Set / Reset PIN with manager approval), A-31 roles x permissions matrix on the permissions table with drift badge and reset, A-32 per-role side-menu editor writing roles.menu with a preview.
- **Inboxes & logs**: A-35 reviews moderation, A-36 feedback inbox (seen / reply / done), A-37 approvals log (CSV), A-38 audit log with diffs (CSV).
- **A-42 Reports & analytics**: revenue by week / service / location, occupancy line + RevPAR, bookings funnel + source, groomer utilization + package mix, customers & balances; CSV per tab; 30 d / 90 d / all.
- **A-43 Backups & export** (JSON of every table, per-table JSON, export log, PIN-gated reseed) and **A-44 General settings** (boarding, invoices, general, brand, security groups in the settings table).
- 6 new components with metas (AdminBarChart, AdminLineChart, AdminMeter, AdminRecordDrawer, AdminHoursGrid, AdminPermissionMatrix); 2 new tables (providers, backups); 18 rules (R-K03, R-K04, R-K06, R-J10, R-H12, R-M13, R-L06, R-H11, R-X40..R-X49).
- Responsive QA (Playwright) at 360 / 390 / 768 / 1280 / 1920 on all 24 routes: no console errors, no horizontal overflow. Screenshots 390 + 1280 for every page, dark for A-01, A-10, A-27, A-30, A-31, A-42.

## Known gaps

- DesktopShell does not yet read `roles.menu` (shared file); A-32 stores it and previews it (R-X40 in_dev).
- SessionProvider still uses `ROLE_PERMISSIONS` from code; A-31 edits the `permissions` table (R-X49 in_dev). Wiring both is a foundation change.
- Providers, brand colours and uploads are stubs; nothing leaves the browser.
- Dashboard revenue uses paid payments (seed has few paid_at values today), reports use booked value; Justin to pick the KPI set (Q75).
