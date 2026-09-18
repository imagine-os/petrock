# Responsive QA report (D-016)

generated: 2026-09-18T06:41:37.786Z
build: `npm run build` (dist served with `vite preview`), Chromium via Playwright (/opt/pw-browsers)
routes: 181 (every route in `window.__petrock.routes`, wildcard routes skipped)
widths: 360, 390, 768, 1280, 1920
themes: light, dark
users: super_admin `usr_super` with dev mode OFF for staff/admin/dev/docs/manual/public routes; customer demo `usr_customer` for customer-surface routes; location Encino
cells: 1810

## Summary

| Check | Result |
| --- | --- |
| Horizontal overflow (`scrollingElement.scrollWidth > innerWidth`) | 2 cells |
| Console / page errors | 0 cells |
| Blank page (#root empty or < 5 chars of text) | 0 cells |
| Elements past the viewport edge, not inside a scroll container (visible) | 0 cells |
| Elements past the viewport edge but clipped by an `overflow:hidden` ancestor | 0 cells |
| Overlapping fixed/sticky bars (intersection > 25% of the smaller) | 330 cells |
| Text nodes rendered below 12px | 120902 nodes across 1780 cells (178 routes) |
| Route redirected elsewhere on load | 0 cells |

_Written by an independent pass (scratch script, same helpers as `scripts/qa-lib.mjs`). Screenshots of failing / warning cells are in `docs/qa/shots/<CODE>-<width>-<theme>.jpg`. See the findings section at the end for interpretation._

## Matrix (light / dark)

| Code | Route | User | 360 | 390 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `C-10` | `/app` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-02` | `/auth/sign-in` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-01` | `/desk` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-30` | `/desk/grooming` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-60` | `/desk/notifications` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-01` | `/admin` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `M-01` | `/manual` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-42` | `/admin/reports` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-10` | `/admin/company` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-41` | `/admin/locations/new` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-11` | `/admin/locations/:id` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-12` | `/admin/rooms` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-27` | `/admin/pricing` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-20` | `/admin/pricing/rates` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-21` | `/admin/pricing/discounts` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-22` | `/admin/pricing/fees` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-23` | `/admin/pricing/daycare` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-24` | `/admin/pricing/packages` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-25` | `/admin/pricing/addons` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-26` | `/admin/services` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-28` | `/admin/providers` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-30` | `/admin/employees` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-31` | `/admin/roles` | super_admin | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-32` | `/admin/menus` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-35` | `/admin/reviews` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-36` | `/admin/feedback` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-37` | `/admin/approvals` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-38` | `/admin/audit` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-43` | `/admin/backups` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-44` | `/admin/settings` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `A-00` | `/staff/pin` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-01` | `/auth` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-03` | `/auth/sign-up` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-04` | `/auth/verify` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-05` | `/auth/forgot` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-06` | `/auth/reset` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-07` | `/auth/locked` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-08` | `/auth/welcome` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-09` | `/auth/sign-out` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-50` | `/app/grooming` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-51` | `/app/grooming/new` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-52` | `/app/grooming/new/add-ons` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-53` | `/app/grooming/new/time` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-54` | `/app/grooming/new/checkout` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-56` | `/app/grooming/orders` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-55` | `/app/grooming/orders/:id` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-60` | `/app/daycare` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-61` | `/app/daycare/new` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-62` | `/app/daycare/new/details` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-63` | `/app/daycare/new/checkout` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-65` | `/app/daycare/bookings` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-64` | `/app/daycare/bookings/:id` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-11` | `/app/pets` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-12` | `/app/pets/new` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-13` | `/app/pets/:petId` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-14` | `/app/pets/:petId/edit` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-21` | `/app/pets/:petId/vaccines` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-20` | `/app/vaccines` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-30` | `/app/hotel` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-31` | `/app/hotel/room` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-32` | `/app/hotel/pets` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-33` | `/app/hotel/grooming` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-34` | `/app/hotel/customer` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-35` | `/app/hotel/estimate` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-36` | `/app/hotel/pay` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-37` | `/app/hotel/done/:id` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-38` | `/app/bookings` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-39` | `/app/bookings/:id` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-40` | `/app/bookings/:id/invoice` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-41` | `/app/bookings/:id/change` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-70` | `/app/profile` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-71` | `/app/profile/edit` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-72` | `/app/settings` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-73` | `/app/settings/language` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-74` | `/app/payment-methods` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-75` | `/app/settings/notifications` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-76` | `/app/settings/delete-account` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-77` | `/app/help` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-78` | `/app/about` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-79` | `/app/legal/:slug` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-80` | `/app/notifications` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-81` | `/app/inbox` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-82` | `/app/inbox/:conversationId` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-83` | `/app/rate` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-84` | `/app/settings/password` | customer | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-03` | `/dev` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-01` | `/dev/tokens` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-02` | `/dev/components` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-03` | `/dev/specs` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-04` | `/dev/tables` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-04` | `/dev/tables/:table` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-05` | `/dev/rules` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-07` | `/dev/knowledge` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-08` | `/dev/components/matrix` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-09` | `/dev/specs/report` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-10` | `/dev/data` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-10` | `/dev/data/:table` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-11` | `/dev/layout` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-11` | `/dev/layout/:code` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-14` | `/dev/seed` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-19` | `/dev/routes` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-12` | `/dev/qa/responsive` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-13` | `/dev/qa/preview` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-15` | `/dev/qa/a11y` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-16` | `/dev/qa/perf` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-17` | `/dev/qa/screenshots` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-18` | `/dev/docs-search` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `D-06` | `/docs` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-01` | `/site` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-01` | `/site/home` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-02` | `/site/hotel` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-03` | `/site/grooming` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-04` | `/site/daycare` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-05` | `/site/pricing` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-06` | `/site/locations` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-07` | `/site/reviews` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-08` | `/site/policies` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-09` | `/site/book` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-10` | `/site/contact` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-11` | `/site/faq` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-12` | `/site/about` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-03` | `/manual/pending` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-10` | `/manual/10-welcome-and-how-to-use-this-manual` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-11` | `/manual/11-front-desk-daily-operations` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-12` | `/manual/12-check-in-and-check-out` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-13` | `/manual/13-vaccine-verification` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-14` | `/manual/14-hotel-reservations-and-the-booking-lifecycle` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-15` | `/manual/15-grooming-and-spa-agenda` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-16` | `/manual/16-daycare-day` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-17` | `/manual/17-pin-approvals` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-18` | `/manual/18-payments-invoices-and-refunds` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-19` | `/manual/19-messages-notifications-and-reviews` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-20` | `/manual/20-manager-duties` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-21` | `/manual/21-owner-settings-and-pricing` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-22` | `/manual/22-roles-permissions-and-locations` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-23` | `/manual/23-reports` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-24` | `/manual/24-staff-feedback-and-the-rules-registry` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-25` | `/manual/25-glossary-and-data-tables` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-26` | `/manual/26-website-and-customer-app` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-27` | `/manual/27-walks-tasks-and-education` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-28` | `/manual/28-hotel-reservations-at-the-desk` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-29` | `/manual/29-grooming-customers-and-pets-at-the-desk` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-30` | `/manual/30-hotel-stays-booked-in-the-app` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-31` | `/manual/31-grooming-and-daycare-booked-in-the-app` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-32` | `/manual/32-owner-control-panel` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-33` | `/manual/33-quality-tools` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-02` | `/manual/:slug` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-61` | `/desk/inquiries` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-65` | `/desk/reviews` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-62` | `/desk/reports` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-63` | `/desk/reports/revenue` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-64` | `/desk/reports/occupancy` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-66` | `/desk/education` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-67` | `/desk/walking` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-68` | `/desk/tasks` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-31` | `/desk/grooming/board` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-32` | `/desk/grooming/agenda` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-33` | `/desk/grooming/new` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-33` | `/desk/grooming/:id/edit` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-34` | `/desk/grooming/:id` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-50` | `/desk/customers` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-51` | `/desk/customers/new` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-51` | `/desk/customers/:id/edit` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-52` | `/desk/customers/:id` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-53` | `/desk/pets` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-54` | `/desk/pets/new` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-54` | `/desk/pets/:id/edit` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-55` | `/desk/pets/:id` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-56` | `/desk/vaccines` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-57` | `/desk/messages` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-59` | `/desk/invoices/:id` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-10` | `/desk/reservations` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-13` | `/desk/reservations/timeline` | super_admin | warn:ovl / warn:ovl | warn:ovl / warn:ovl | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-14` | `/desk/reservations/board` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-15` | `/desk/reservations/availability` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-11` | `/desk/reservations/new` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-11` | `/desk/reservations/:id/edit` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `F-12` | `/desk/reservations/:id` | super_admin | HSCROLL 363 / HSCROLL 363 | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |
| `HUB-01` | `/` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `HUB-02` | `/no-access` | super_admin | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-40` | `/admin/settings/rules` | super_admin | ok / ok | ok / ok | ok / ok | warn:ovl / warn:ovl | warn:ovl / warn:ovl |

## Failing cells (horizontal scroll, errors, blank)

- `F-12` `/desk/reservations/:id` @ 360-light: scrollWidth 363;  ([shot](shots/F-12-360-light.jpg))
- `F-12` `/desk/reservations/:id` @ 360-dark: scrollWidth 363;  ([shot](shots/F-12-360-dark.jpg))

## Elements wider than the viewport (visible, not in a scroll container)

none

## Overlapping fixed / sticky bars

| A (pos) | B (pos) | Overlap | Routes | Cells |
| --- | --- | --- | --- | --- |
| `div#root > div.shell > div.shell-side:nth-of-type(1)` (sticky) | `div#root > div.shell > button.feedbackbtn` (fixed) | 4494px², 100% of smaller | 73 routes (F-01, F-30, F-60, A-01, A-42, A-10, …) | 1280-dark, 1280-light, 1920-dark, 1920-light |
| `div.apm:nth-of-type(2) > table > thead > tr > th:nth-of-type(8)` (sticky) | `div#root > div.shell > button.feedbackbtn` (fixed) | 421px², 26% of smaller | 1 routes (A-31) | 768-dark, 768-light |
| `div.apm:nth-of-type(2) > table > tbody > tr.apm-group:nth-of-type(1) > td` (sticky) | `div#root > div.shell > button.feedbackbtn` (fixed) | 1139px², 71% of smaller | 1 routes (A-31) | 768-dark, 768-light |
| `div.rtl:nth-of-type(2) > div.rtl-scroll > div.rtl-grid > div.rtl-group:nth-of-type(4) > button.rtl-grouphead` (sticky) | `div#root > div.shell > button.feedbackbtn` (fixed) | 1240px², 78% of smaller | 1 routes (F-13) | 360-dark, 360-light, 390-dark, 390-light |

## Clipped elements (past the viewport edge inside overflow:hidden)

none

## Text below 12px

Total: 120902 text nodes below 12px across 178/181 routes. Tokens: `--fs-2xs` = 11px is the main source; `.sidebar-code`, badges and nav labels use 10-11px.

| Element (last 2 levels) | px | Sample | Routes | Cells |
| --- | --- | --- | --- | --- |
| `button.iconbtn.iconbtn-ghost > span.iconbtn-badge` | 10 | 1 | 102 | 1100 |
| `div.sidebar-tools > button.sidebar-tool` | 11 | Collapse all | 101 | 436 |
| `button.sidebar-cat > span.sidebar-cat-label` | 11 | Overview | 101 | 436 |
| `a.sidebar-link > code.sidebar-code` | 10 | F-10 | 101 | 436 |
| `a.sidebar-link.is-active > code.sidebar-code` | 10 | F-01 | 98 | 420 |
| `div.eyebrow.row > code.pagehead-code` | 11 | F-01 | 74 | 820 |
| `a.bottomnav-item > span.bottomnav-label` | 11 | Bookings | 47 | 470 |
| `span.bottomnav-icon > span.bottomnav-badge` | 10 | 6 | 46 | 460 |
| `div.row.wrap > span.badge.badge-neutral` | 11 | hotel | 28 | 280 |
| `div.manual-part > div.eyebrow` | 11 | Part I · Start here | 27 | 108 |
| `a.manual-link > span.badge.badge-warn` | 11 | 5 | 26 | 104 |
| `span.chip.chip-neutral > span.chip-label` | 11 | Hotel | 26 | 266 |
| `td > span.badge.badge-success` | 11 | free | 24 | 250 |
| `div.row.wrap > code.chcard-code` | 11 | M-10 | 24 | 240 |
| `nav.toc > div.eyebrow` | 11 | On this page | 24 | 160 |
| `div.grow > div.eyebrow` | 11 | table locations | 18 | 168 |
| `header.live-head > span.badge.badge-success` | 11 | live | 18 | 152 |
| `footer.live-foot > span` | 11 | Live from the system: this block reads t | 17 | 102 |
| `span.live-source > a` | 11 | locations | 17 | 102 |
| `div.callout-body > span.callout-label` | 11 | In-person lesson | 17 | 156 |
| `button.tab > span.badge.badge-neutral` | 11 | 2 | 16 | 160 |
| `button.tab.is-active > span.badge.badge-primary` | 11 | 5 | 15 | 150 |
| `td > span.badge.badge-neutral` | 11 | top | 15 | 146 |
| `a.bottomnav-item.is-active > span.bottomnav-label` | 11 | Home | 14 | 140 |
| `figcaption > a.figure-code` | 11 | HUB-01 | 13 | 106 |
| `span > small` | 11 | Hotel & Spa | 12 | 130 |
| `div.shero-text > p.shero-eyebrow` | 11 | Dog hotel & spa · Encino & Westwood, Los | 12 | 130 |
| `div.site2-foot-col > div.eyebrow` | 11 | Encino | 12 | 130 |
| `span.chip.chip-primary > span.chip-label` | 11 | Overview | 10 | 100 |
| `a > span` | 11 | Previous | 10 | 84 |
| `div.authbrand-word > span.authbrand-tag` | 11 | Hotel and Spa | 8 | 80 |
| `td > span.badge.badge-warn` | 11 | special employee | 8 | 82 |
| `td > span.badge.badge-primary` | 11 | occupied | 7 | 66 |
| `div.hbf-foot > div.hbf-foot-note` | 11 | Select at least one pet | 7 | 70 |
| `button.chip.chip-neutral > span.chip-label` | 11 | Furminator | 7 | 80 |
| `li > a.live-code` | 11 | R-E09 | 7 | 42 |
| `td > span.badge.badge-info` | 11 | bottom | 6 | 56 |
| `span > code` | 11.04 | GS-1006 | 4 | 40 |
| `div.datepicker-grid > div.datepicker-dow` | 11 | Su | 4 | 50 |
| `div.row.wrap > span.badge.badge-success` | 11 | 41 of 42 free | 4 | 50 |
| `li > span.badge.badge-success` | 11 | paid | 4 | 28 |
| `div.csc-group > p.eyebrow.csc-group-title` | 11 | Account | 4 | 40 |
| `span.row > span.badge.badge-status` | 11 | Checked in | 3 | 30 |
| `div.row-between > span.badge.badge-neutral` | 11 | no | 3 | 30 |
| `span.vchip.vchip-sm > span` | 11 | Verified | 3 | 40 |
| `td > code` | 11.04 | 120ms | 3 | 26 |
| `div.eyebrow.row > code` | 10.12 | bookings | 3 | 30 |
| `p.pagehead-sub.muted > span.badge.badge-neutral` | 11 | Encino | 3 | 30 |
| `g.rbar-bar > text.rbar-x` | 10 | Aug 20 | 3 | 30 |
| `g.rbar-bar > text.rbar-val` | 10 | $1,218.63 | 3 | 30 |
| `button.chip.chip-primary > span.chip-label` | 11 | Encino | 2 | 20 |
| `span.petcard-status > span.badge.badge-success` | 11 | Approved | 2 | 20 |
| `span.cbcard-status > span.badge.badge-status` | 11 | Checked in | 2 | 20 |
| `span.cbcard-time > span.cbcard-time-label` | 11 | Appointment | 2 | 40 |
| `span.cbcard-time > span` | 11 | 18 Sep 2026 | 2 | 40 |
| `span.row > span.badge.badge-warn` | 11 | submitted | 2 | 20 |
| `div.gapcard-body > span.gapcard-sub` | 11 | 8:00 AM – 9:00 AM · Frontline Plus | 2 | 40 |
| `g.achart-axis > text` | 11 | $0 | 2 | 20 |
| `g.achart-band > text.achart-label` | 11 | $1,218.63 | 2 | 20 |
| `div.chcard-top > code.chcard-code` | 11 | M-10 | 2 | 20 |

### Routes with the most sub-12px text nodes (at 390 light)

| Code | Route | Nodes |
| --- | --- | --- |
| `D-02` | `/dev/components` | 2672 |
| `D-08` | `/dev/components/matrix` | 727 |
| `D-04` | `/dev/tables` | 616 |
| `D-19` | `/dev/routes` | 527 |
| `D-09` | `/dev/specs/report` | 330 |
| `D-03` | `/dev` | 302 |
| `D-03` | `/dev/specs` | 302 |
| `D-05` | `/dev/rules` | 202 |
| `A-40` | `/admin/settings/rules` | 202 |
| `D-17` | `/dev/qa/screenshots` | 186 |
| `D-11` | `/dev/layout` | 174 |
| `D-10` | `/dev/data/:table` | 156 |
| `D-01` | `/dev/tokens` | 155 |
| `D-04` | `/dev/tables/:table` | 155 |
| `M-22` | `/manual/22-roles-permissions-and-locations` | 134 |
| `D-14` | `/dev/seed` | 124 |
| `M-01` | `/manual` | 101 |
| `F-13` | `/desk/reservations/timeline` | 97 |
| `M-25` | `/manual/25-glossary-and-data-tables` | 93 |
| `M-15` | `/manual/15-grooming-and-spa-agenda` | 83 |
| `A-12` | `/admin/rooms` | 74 |
| `A-31` | `/admin/roles` | 74 |
| `F-14` | `/desk/reservations/board` | 74 |
| `M-21` | `/manual/21-owner-settings-and-pricing` | 71 |
| `M-13` | `/manual/13-vaccine-verification` | 68 |

## Redirects on load

none

## Findings

Method notes: wizard-step routes (`C-31..C-36`, `C-52..C-54`, `C-62`, `C-63`) redirect to their flow start when no draft exists, so they were re-run with seeded drafts in localStorage (`petrock.hotelDraft.v1`, `petrock.draft.grooming`, `petrock.draft.daycare`) and the rows above are from that second pass. `/app/legal/:slug` used `privacy-policy`, `/app/inbox/:conversationId` used `conv_1`. Raw per-cell data: `docs/qa/responsive-report.qa.json` (not committed). Screenshots: `docs/qa/shots/` (not committed; 300 files, one per warning cell).

### 1. MAJOR - F-12 booking detail: header eyebrow row overflows at 360 px

- Repro: super_admin, `/#/desk/reservations/bk_1001` at 360 x 844, light or dark. `document.scrollingElement.scrollWidth` = 363 (> 360); the "FROM THE APP" badge is cut at the right edge (`shots/F-12-360-light.jpg`). At 390 px it fits (scrollWidth 390).
- Cause: `PageHeader` renders `<div className="eyebrow row">` (src/components/molecule/PageHeader/PageHeader.tsx:15); `.row` (src/styles/global.css:29) is `display:flex` without `flex-wrap`, and the three badges passed as `eyebrow` from src/modules/frontdesk-reservations/BookingDetailPage.tsx (StatusBadge + "Suite · 5 nights" + source badge) are `white-space: nowrap`, so the row is 347 px inside a 328 px column.
- Fix: add `flex-wrap: wrap` (or `className="eyebrow row wrap"`) to the eyebrow row in PageHeader, and let the payments `DataTable` keep its own horizontal scroll (it already does).

### 2. MAJOR - FeedbackButton overlaps the sidebar on every desktop staff page (>= 900 px)

- Repro: super_admin, any DesktopShell route (73 routes: F-*, A-*, D-*, M-*, /docs) at 1280 x 900 or 1920 x 900. The fixed `button.feedbackbtn` (left 16 px, bottom 16 px, src/components/organism/FeedbackButton/FeedbackButton.css:1) sits on top of the sticky `div.shell-side` (src/components/template/DesktopShell/DesktopShell.css:2, width `--w-sidebar` 244 px). Intersection 4494 px², 100 % of the button. On F-01 at 1280 it covers the "Website inquiries" (F-61) link (`shots/F-01-1280-light.jpg`); with the menu fully expanded it hides whichever link scrolls under it and the sidebar footer.
- Same root cause at other widths: at 768 px the button covers the sticky first column / header of the permissions matrix on A-31 (`shots/A-31-768-light.jpg`); at 360/390 it covers the sticky room-group header in the F-13 timeline (`shots/F-13-360-light.jpg`).
- Fix: move the button to the right edge next to the SpecChip (e.g. `right: var(--sp-4); bottom: calc(var(--sp-4) + 48px)`), or offset it by the sidebar width (`left: calc(var(--w-sidebar) + var(--sp-4))` / `--w-rail` when `.is-rail`), and add `padding-bottom` to `.sidebar-foot` so no link ever sits under it.

### 3. MAJOR (systemic) - text below 12 px on 178 of 181 routes

- 120,902 visible text nodes render below 12 px across the matrix (identical in light and dark). Sources, by reach:
  - `--fs-2xs: 11px` (src/design/tokens.ts -> src/styles/tokens.css:22) used by `.eyebrow` (global.css:37), `.badge-sm`/`.chip-sm`/`.vchip-sm` (11 px hard-coded), `.pagehead-code`, bottom-nav labels (`.bottomnav-label`), `.rescard-kind`, `.bpetcard-sub`, `.gapcard-*`, `.ntfrow-time`, `.callout-label`, `.datepicker-dow`, `.figure-code`, `.chp-stat-label`, manual eyebrows, etc.
  - 10 px: `.sidebar-code` and `.sidebar-badge` (src/components/organism/Sidebar/Sidebar.css:22-23), `.iconbtn-badge` (src/components/atom/IconButton/IconButton.css:9), `.bottomnav-badge`, `.svctile-hint` (HomeServiceTile.css:7), `.table-cols code` (src/modules/dev/dev.css:17), SVG axis/value labels `text.rbar-x`/`text.rbar-val` on the reports charts.
  - Heaviest pages at 390 px: D-02 /dev/components (2672 nodes), D-08 (727), D-04 (616), D-19 (527), D-09 (330), D-03 (302); customer pages 6-45 nodes each (bottom nav + badges).
- Fix: raise `--fs-2xs` to 12 px in tokens.ts (one line, regenerates tokens.css), replace hard-coded 10/11 px in the files above with `var(--fs-xs)`, and either accept numeric count badges (`.iconbtn-badge`, `.sidebar-badge`, `.bottomnav-badge`) at 10 px as a recorded exception (decision needed) or bump them to 11-12 px with a 18 px min size. Chart tick labels should use `--fs-xs`.

### 4. MINOR - the repo's own QA never renders the wizard steps; committed screenshots are wrong

- `scripts/qa-responsive.mjs` and `scripts/screenshots.mjs` load `C-31..C-36`, `C-52..C-54`, `C-62`, `C-63` without a draft, so each redirects (`Navigate replace` in src/modules/customer-hotel/*Page.tsx, `useEffect` guards in src/modules/customer-grooming-daycare/*Page.tsx) and what gets measured/captured is the flow start. `docs/screenshots/C-31/390.jpg` shows C-30 "Choose pets & dates" (SpecChip reads C-30); same for C-32..C-36, C-52..C-54, C-62, C-63.
- Fix: in `scripts/qa-lib.mjs` `initScript`, seed the three drafts for customer routes (shapes in src/modules/customer-hotel/draft.ts and src/modules/customer-grooming-daycare/draft.ts; pets `pet_1`/`pet_2`, room `rt_suite`, package `pkg_gold`, add-on `add_1`) and regenerate `docs/screenshots/C-3x`, `C-5x`, `C-6x`.

### 5. MINOR - repo QA scripts diverge from the D-016 brief; committed report is stale

- `scripts/qa-lib.mjs` `initScript` signs in as super_admin with `devMode: true` for every route (the brief asks for dev mode off, and customer routes as the customer demo user); `scripts/qa-responsive.mjs` checks only hscroll + console errors + a11y, not sub-12 px text, fixed-bar overlap or elements past the viewport edge; `PARAMS` lacks `:slug` and `:conversationId` (filled with `x`). The previously committed `docs/qa/responsive-report.md` covered 35 routes (pre-merge).
- Fix: user per surface + `devMode:false` in `initScript`, add the checks from this pass to `qa-responsive.mjs` (they are in the scan function used here), add the two params, re-run so `/#/dev/qa/responsive` (D-12) reads a full matrix.

### 6. MINOR - F-13 room timeline on phones

- At 360/390 the legend and flag hints wrap into 4-5 lines and the grid scrolls inside `.rtl-scroll` (acceptable "degrade gracefully" per D-016), but the sticky group header is under the feedback chip (finding 2) and the week header shows 4 day columns. No overflow.

### Passed

- 0 cells with `scrollWidth > innerWidth` except F-12 @ 360 (2 cells of 1810).
- 0 console errors / page errors in 1810 cells; 0 blank pages; every route rendered content for its user (no `/no-access` redirects; RequireRole let super_admin and the customer demo user through everywhere they should).
- 0 visible elements past the viewport edge outside a scroll container; 0 elements clipped by `overflow:hidden` ancestors at any width.
- Dark mode produced identical geometry to light in every cell (theme switch does not change layout).
- Tables collapse to key/value cards at 360/390 (F-10, F-01 reservations), the DesktopShell hides the sidebar behind the hamburger below 900 px, the PhoneShell centres a 430 px column with its bottom nav at 768-1920, and the public site (P-01) stacks cleanly at 360.

