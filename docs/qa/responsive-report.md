# Responsive QA report

generated: 2026-09-18T14:23:43.227Z
routes: 181
widths: 360, 390, 768, 1280, 1920
themes: light, dark
cells: 1810
failing_cells: 0
a11y_findings: 8356

_Written by `npm run qa:responsive` (scripts/qa-responsive.mjs). Fail = horizontal scroll (documentElement.scrollWidth > viewport), a console error, visible text under 12 px, a fixed element covering a sticky one, or a blank page. Customer routes run as the customer demo user with seeded wizard drafts; staff routes as the super admin with dev mode off (D-016 brief). A11y findings come from the same checks D-15 runs live. Open `/#/dev/qa/responsive` for the interactive matrix._

## Matrix (light / dark)

| Code | Route | 360 | 390 | 768 | 1280 | 1920 |
| --- | --- | --- | --- | --- | --- | --- |
| `C-10` | `/app` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-02` | `/auth/sign-in` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-01` | `/desk` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-30` | `/desk/grooming` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-60` | `/desk/notifications` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-01` | `/admin` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-01` | `/manual` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-42` | `/admin/reports` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-10` | `/admin/company` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-41` | `/admin/locations/new` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-11` | `/admin/locations/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-12` | `/admin/rooms` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-27` | `/admin/pricing` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-20` | `/admin/pricing/rates` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-21` | `/admin/pricing/discounts` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-22` | `/admin/pricing/fees` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-23` | `/admin/pricing/daycare` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-24` | `/admin/pricing/packages` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-25` | `/admin/pricing/addons` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-26` | `/admin/services` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-28` | `/admin/providers` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-30` | `/admin/employees` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-31` | `/admin/roles` | warn 7 / warn 7 | warn 7 / warn 7 | warn 7 / warn 7 | warn 7 / warn 7 | warn 7 / warn 7 |
| `A-32` | `/admin/menus` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-35` | `/admin/reviews` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-36` | `/admin/feedback` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-37` | `/admin/approvals` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-38` | `/admin/audit` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-43` | `/admin/backups` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-44` | `/admin/settings` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-00` | `/staff/pin` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-01` | `/auth` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-03` | `/auth/sign-up` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-04` | `/auth/verify` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-05` | `/auth/forgot` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-06` | `/auth/reset` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-07` | `/auth/locked` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-08` | `/auth/welcome` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-09` | `/auth/sign-out` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-50` | `/app/grooming` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-51` | `/app/grooming/new` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-52` | `/app/grooming/new/add-ons` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-53` | `/app/grooming/new/time` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-54` | `/app/grooming/new/checkout` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-56` | `/app/grooming/orders` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-55` | `/app/grooming/orders/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-60` | `/app/daycare` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-61` | `/app/daycare/new` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-62` | `/app/daycare/new/details` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-63` | `/app/daycare/new/checkout` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-65` | `/app/daycare/bookings` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-64` | `/app/daycare/bookings/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-11` | `/app/pets` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-12` | `/app/pets/new` | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 |
| `C-13` | `/app/pets/:petId` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-14` | `/app/pets/:petId/edit` | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 |
| `C-21` | `/app/pets/:petId/vaccines` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-20` | `/app/vaccines` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-30` | `/app/hotel` | warn 2 / warn 2 | warn 2 / warn 2 | warn 2 / warn 2 | warn 2 / warn 2 | warn 2 / warn 2 |
| `C-31` | `/app/hotel/room` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-32` | `/app/hotel/pets` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-33` | `/app/hotel/grooming` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-34` | `/app/hotel/customer` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-35` | `/app/hotel/estimate` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-36` | `/app/hotel/pay` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-37` | `/app/hotel/done/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-38` | `/app/bookings` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-39` | `/app/bookings/:id` | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 |
| `C-40` | `/app/bookings/:id/invoice` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-41` | `/app/bookings/:id/change` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-70` | `/app/profile` | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 |
| `C-71` | `/app/profile/edit` | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 |
| `C-72` | `/app/settings` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-73` | `/app/settings/language` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-74` | `/app/payment-methods` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-75` | `/app/settings/notifications` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-76` | `/app/settings/delete-account` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-77` | `/app/help` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-78` | `/app/about` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-79` | `/app/legal/:slug` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-80` | `/app/notifications` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-81` | `/app/inbox` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-82` | `/app/inbox/:conversationId` | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 | warn 1 / warn 1 |
| `C-83` | `/app/rate` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `C-84` | `/app/settings/password` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-03` | `/dev` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-01` | `/dev/tokens` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-02` | `/dev/components` | warn 22 / warn 22 | warn 22 / warn 22 | warn 22 / warn 22 | warn 22 / warn 22 | warn 22 / warn 22 |
| `D-03` | `/dev/specs` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-04` | `/dev/tables` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-04` | `/dev/tables/:table` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-05` | `/dev/rules` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-07` | `/dev/knowledge` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-08` | `/dev/components/matrix` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-09` | `/dev/specs/report` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-10` | `/dev/data` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-10` | `/dev/data/:table` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-11` | `/dev/layout` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-11` | `/dev/layout/:code` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-14` | `/dev/seed` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-19` | `/dev/routes` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-12` | `/dev/qa/responsive` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-13` | `/dev/qa/preview` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-15` | `/dev/qa/a11y` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-16` | `/dev/qa/perf` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-17` | `/dev/qa/screenshots` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-18` | `/dev/docs-search` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-06` | `/docs` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-01` | `/site` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-01` | `/site/home` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-02` | `/site/hotel` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-03` | `/site/grooming` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-04` | `/site/daycare` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-05` | `/site/pricing` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-06` | `/site/locations` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-07` | `/site/reviews` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-08` | `/site/policies` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-09` | `/site/book` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-10` | `/site/contact` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-11` | `/site/faq` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-12` | `/site/about` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-03` | `/manual/pending` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-10` | `/manual/10-welcome-and-how-to-use-this-manual` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-11` | `/manual/11-front-desk-daily-operations` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-12` | `/manual/12-check-in-and-check-out` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-13` | `/manual/13-vaccine-verification` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-14` | `/manual/14-hotel-reservations-and-the-booking-lifecycle` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-15` | `/manual/15-grooming-and-spa-agenda` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-16` | `/manual/16-daycare-day` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-17` | `/manual/17-pin-approvals` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-18` | `/manual/18-payments-invoices-and-refunds` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-19` | `/manual/19-messages-notifications-and-reviews` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-20` | `/manual/20-manager-duties` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-21` | `/manual/21-owner-settings-and-pricing` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-22` | `/manual/22-roles-permissions-and-locations` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-23` | `/manual/23-reports` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-24` | `/manual/24-staff-feedback-and-the-rules-registry` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-25` | `/manual/25-glossary-and-data-tables` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-26` | `/manual/26-website-and-customer-app` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-27` | `/manual/27-walks-tasks-and-education` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-28` | `/manual/28-hotel-reservations-at-the-desk` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-29` | `/manual/29-grooming-customers-and-pets-at-the-desk` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-30` | `/manual/30-hotel-stays-booked-in-the-app` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-31` | `/manual/31-grooming-and-daycare-booked-in-the-app` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-32` | `/manual/32-owner-control-panel` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-33` | `/manual/33-quality-tools` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `M-02` | `/manual/:slug` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-61` | `/desk/inquiries` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-65` | `/desk/reviews` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-62` | `/desk/reports` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-63` | `/desk/reports/revenue` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-64` | `/desk/reports/occupancy` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-66` | `/desk/education` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-67` | `/desk/walking` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-68` | `/desk/tasks` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-31` | `/desk/grooming/board` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-32` | `/desk/grooming/agenda` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-33` | `/desk/grooming/new` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-33` | `/desk/grooming/:id/edit` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-34` | `/desk/grooming/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-50` | `/desk/customers` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-51` | `/desk/customers/new` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-51` | `/desk/customers/:id/edit` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-52` | `/desk/customers/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-53` | `/desk/pets` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-54` | `/desk/pets/new` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-54` | `/desk/pets/:id/edit` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-55` | `/desk/pets/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-56` | `/desk/vaccines` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-57` | `/desk/messages` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-59` | `/desk/invoices/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-10` | `/desk/reservations` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-13` | `/desk/reservations/timeline` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-14` | `/desk/reservations/board` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-15` | `/desk/reservations/availability` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-11` | `/desk/reservations/new` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-11` | `/desk/reservations/:id/edit` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `F-12` | `/desk/reservations/:id` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `HUB-01` | `/` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `HUB-02` | `/no-access` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-40` | `/admin/settings/rules` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |

## A11y findings by rule

| Rule | Findings |
| --- | --- |
| target-size | 6446 |
| heading-skip | 940 |
| landmark-main | 580 |
| input-label | 360 |
| h1 | 20 |
| control-name | 10 |

## A11y findings (unique per route)

| Code | Rule | Sev | Finding | Element | Cells |
| --- | --- | --- | --- | --- | --- |
| `C-10` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-10` | target-size | warn | target 43x21 px is under 24 px | `div.chp-page > section.chp-section > div.chp-section-head > a.chp-link` | 10 |
| `C-10` | target-size | warn | target 130x14 px is under 24 px | `div.chp-page > section.chp-section > div.chp-center > button.btn.btn-link` | 10 |
| `C-02` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `F-30` | target-size | warn | target 72x21 px is under 24 px | `div.fgp-toolbar > div.gdatenav.gdatenav-md > div.gdatenav-group > button.gdatenav-label.is-today` | 10 |
| `A-01` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-01` | target-size | warn | target 85x22 px is under 24 px | `div.acp-two > div.card.card-p-md > div.achart > button.achart-toggle` | 10 |
| `A-01` | target-size | warn | target 39x18 px is under 24 px | `div.card.card-p-md > div.card-header > div.acp-card-title > a.xs` | 10 |
| `A-42` | heading-skip | warn | heading jumps from h1 to h3 | `div.acp-two > div.card.card-p-md > div.card-header > h3` | 10 |
| `A-42` | target-size | warn | target 85x22 px is under 24 px | `div.acp-two > div.card.card-p-md > div.achart > button.achart-toggle` | 20 |
| `A-10` | heading-skip | warn | heading jumps from h1 to h3 | `div.card.card-p-md > div.card-header > div.acp-card-title > h3` | 10 |
| `A-41` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `A-41` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `A-41` | target-size | warn | target 560x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `A-11` | h1 | warn | no visible h1 on the page | `document` | 10 |
| `A-12` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-27` | heading-skip | warn | heading jumps from h1 to h3 | `div.card.card-p-md > div.card-header > div.acp-card-title > h3` | 10 |
| `A-20` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-21` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-22` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-23` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-24` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-25` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-26` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-28` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-provider > div > h3` | 10 |
| `A-30` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-31` | input-label | error | textarea[type=textarea] without a label | `#:r2:` | 70 |
| `A-31` | heading-skip | warn | heading jumps from h1 to h3 | `div.card.card-p-sm > div.card-header > div.acp-card-title > h3` | 10 |
| `A-35` | heading-skip | warn | heading jumps from h1 to h3 | `#main > div.page.stack > div.empty > h3.empty-title` | 10 |
| `A-43` | heading-skip | warn | heading jumps from h1 to h3 | `div.page.stack > div.card.card-p-md > div.card-header > h3` | 10 |
| `A-44` | heading-skip | warn | heading jumps from h1 to h3 | `div.card-header > div.acp-card-title > div > h3` | 10 |
| `A-00` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `A-00` | target-size | warn | target 97x21 px is under 24 px | `div.pinlogin > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `A-00` | target-size | warn | target 97x12 px is under 24 px | `div.card.card-p-lg > div.row.wrap > a > button.btn.btn-link` | 10 |
| `C-01` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-01` | target-size | warn | target 136x16 px is under 24 px | `div.cauth.cauth-welcome > div.cauth-footer > div.row.wrap > button.btn.btn-link` | 10 |
| `C-01` | target-size | warn | target 180x21 px is under 24 px | `div.cauth.cauth-welcome > div.cauth-footer > div.row.wrap > a` | 10 |
| `C-01` | target-size | warn | target 180x16 px is under 24 px | `div.cauth-footer > div.row.wrap > a > button.btn.btn-link` | 10 |
| `C-03` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-03` | target-size | warn | target 46x21 px is under 24 px | `div.cauth > div.cauth-footer > p > a` | 10 |
| `C-04` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-05` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-05` | target-size | warn | target 94x21 px is under 24 px | `div.cauth > div.cauth-footer > p > a` | 10 |
| `C-06` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-06` | target-size | warn | target 79x12 px is under 24 px | `form.cauth-form > div.stack-sm > div.row > button.btn.btn-link` | 10 |
| `C-06` | target-size | warn | target 94x21 px is under 24 px | `div.cauth > div.cauth-footer > p > a` | 10 |
| `C-07` | heading-skip | warn | heading jumps from h1 to h3 | `div.cauth > div.card.card-p-md > div.card-header > h3` | 10 |
| `C-07` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-07` | target-size | warn | target 117x21 px is under 24 px | `div.card.card-p-md > div.cauth-phones > div.cauth-phone > a` | 20 |
| `C-07` | target-size | warn | target 82x21 px is under 24 px | `div.cauth > div.cauth-footer > p > a` | 10 |
| `C-08` | heading-skip | warn | heading jumps from h1 to h3 | `ol.cauth-steps > li.cauth-step > div > h3` | 10 |
| `C-08` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-09` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-50` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-50` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `C-50` | target-size | warn | target 63x21 px is under 24 px | `div.cgd-body > section.cgd-list > div.cgd-section-title > a.small` | 10 |
| `C-50` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `C-50` | target-size | warn | target 396x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-51` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-51` | target-size | warn | target 156x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 4 |
| `C-51` | target-size | warn | target 296x16 px is under 24 px | `div.cgd-body > div.flowfooter.is-sticky > div.flowfooter-actions > button.btn.btn-primary` | 2 |
| `C-51` | target-size | warn | target 187x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-52` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-52` | target-size | warn | target 134x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 10 |
| `C-52` | target-size | warn | target 296x16 px is under 24 px | `div.cgd-body > div.flowfooter.is-sticky > div.flowfooter-actions > button.btn.btn-secondary` | 4 |
| `C-53` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-53` | target-size | warn | target 189x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 4 |
| `C-53` | target-size | warn | target 296x16 px is under 24 px | `div.cgd-body > div.flowfooter.is-sticky > div.flowfooter-actions > button.btn.btn-primary` | 2 |
| `C-53` | target-size | warn | target 227x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-54` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-54` | target-size | warn | target 204x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 4 |
| `C-54` | target-size | warn | target 296x16 px is under 24 px | `div.cgd-body > div.flowfooter.is-sticky > div.flowfooter-actions > button.btn.btn-primary` | 2 |
| `C-54` | target-size | warn | target 245x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-56` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-56` | target-size | warn | target 275x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 4 |
| `C-56` | target-size | warn | target 330x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-55` | heading-skip | warn | heading jumps from h1 to h3 | `div.cgd > div.cgd-body > div.empty > h3.empty-title` | 10 |
| `C-55` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-55` | target-size | warn | target 156x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 4 |
| `C-55` | target-size | warn | target 187x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-60` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-60` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `C-60` | target-size | warn | target 50x21 px is under 24 px | `div.cgd-body > section.cgd-list > div.cgd-section-title > a.small` | 10 |
| `C-60` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `C-60` | target-size | warn | target 396x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-61` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-61` | target-size | warn | target 195x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 4 |
| `C-61` | target-size | warn | target 296x16 px is under 24 px | `div.cgd-body > div.flowfooter.is-sticky > div.flowfooter-actions > button.btn.btn-primary` | 2 |
| `C-61` | target-size | warn | target 234x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-62` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-62` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `C-62` | target-size | warn | target 296x16 px is under 24 px | `div.cgd-body > div.flowfooter.is-sticky > div.flowfooter-actions > button.btn.btn-primary` | 2 |
| `C-62` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `C-62` | target-size | warn | target 396x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-63` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-63` | target-size | warn | target 204x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 4 |
| `C-63` | target-size | warn | target 296x16 px is under 24 px | `div.cgd-body > div.flowfooter.is-sticky > div.flowfooter-actions > button.btn.btn-primary` | 2 |
| `C-63` | target-size | warn | target 245x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-65` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-65` | target-size | warn | target 177x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 4 |
| `C-65` | target-size | warn | target 212x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-64` | heading-skip | warn | heading jumps from h1 to h3 | `div.cgd > div.cgd-body > div.empty > h3.empty-title` | 10 |
| `C-64` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-64` | target-size | warn | target 79x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 4 |
| `C-64` | target-size | warn | target 94x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `C-11` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-12` | input-label | error | input[type=file] without a label | `section.chp-wizard-step > div.chp-center > div.photopick > input.sr-only` | 10 |
| `C-12` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-13` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-13` | target-size | warn | target 54x21 px is under 24 px | `section.section > div.section-head > div.section-actions > a.chp-link` | 10 |
| `C-13` | target-size | warn | target 26x21 px is under 24 px | `section.section > div.section-head > div.section-actions > button.chp-link` | 10 |
| `C-14` | input-label | error | input[type=file] without a label | `section.chp-wizard-step > div.chp-center > div.photopick > input.sr-only` | 10 |
| `C-14` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-21` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-20` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-20` | target-size | warn | target 250x21 px is under 24 px | `div > div.chp-page > div.chp-center > a.chp-link` | 10 |
| `C-30` | input-label | error | select[type=select-one] without a label | `#:r2:` | 20 |
| `C-30` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-30` | target-size | warn | target 72x18 px is under 24 px | `div.hbf-body > div > div.row-between > a.xs` | 10 |
| `C-31` | heading-skip | warn | heading jumps from h1 to h3 | `article.roomcard.is-disabled > div.roomcard-body > div.row-between.wrap > h3.roomcard-name` | 10 |
| `C-31` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-32` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-33` | heading-skip | warn | heading jumps from h1 to h3 | `div.hbf-body > section.estcard.is-compact > header.estcard-head > h3.estcard-title` | 10 |
| `C-33` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-34` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-35` | heading-skip | warn | heading jumps from h1 to h3 | `div.hbf-body > section.estcard > header.estcard-head > h3.estcard-title` | 10 |
| `C-35` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-36` | heading-skip | warn | heading jumps from h1 to h3 | `div.hbf-body > section.estcard.is-compact > header.estcard-head > h3.estcard-title` | 10 |
| `C-36` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-37` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-38` | heading-skip | warn | heading jumps from h1 to h3 | `a.rescard.is-link > div.rescard-head > div.rescard-titles > h3.rescard-title` | 10 |
| `C-38` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-39` | control-name | error | a without an accessible name | `div.hbf > header.hbf-head > div.hbf-aside > a` | 10 |
| `C-39` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-39` | target-size | warn | target 39x18 px is under 24 px | `section.section > div.section-head > div.section-actions > a.xs` | 10 |
| `C-40` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-41` | heading-skip | warn | heading jumps from h1 to h3 | `div.hbf > div.hbf-body > div.empty > h3.empty-title` | 10 |
| `C-41` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-70` | input-label | error | input[type=file] without a label | `div.csc-screen > div.acchero > div.acchero-avatar > input.sr-only` | 10 |
| `C-70` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-71` | input-label | error | input[type=file] without a label | `div.csc-screen > div.acchero > div.acchero-avatar > input.sr-only` | 10 |
| `C-71` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-71` | target-size | warn | target 79x12 px is under 24 px | `div.section-body > div.stack-sm > div.csc-link-row > button.btn.btn-link` | 10 |
| `C-71` | target-size | warn | target 102x12 px is under 24 px | `div.section-body > div.stack-sm > div.csc-link-row > button.btn.btn-link` | 10 |
| `C-72` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-73` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-74` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-75` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-76` | heading-skip | warn | heading jumps from h1 to h3 | `div.csc-body > div.card.card-p-md > div.stack-sm > h3` | 10 |
| `C-76` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-77` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-78` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-79` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-80` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-80` | target-size | warn | target 76x12 px is under 24 px | `div.csc-screen > div.csc-body.is-flush > div.csc-filters > button.btn.btn-link` | 10 |
| `C-81` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-82` | input-label | error | input[type=file] without a label | `div.csc-chat-composer > div.chatcomp > div.chatcomp-row > input.sr-only` | 10 |
| `C-82` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-83` | heading-skip | warn | heading jumps from h1 to h3 | `div.csc-body > div.card.card-p-md > div.csc-rate-stars > h3` | 10 |
| `C-83` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-84` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-84` | target-size | warn | target 102x12 px is under 24 px | `div.card.card-p-md > div.stack-sm > div.csc-link-row > button.btn.btn-link` | 10 |
| `D-02` | input-label | error | input[type=file] without a label | `div.comp-usage > div.acchero > div.acchero-avatar > input.sr-only` | 60 |
| `D-02` | input-label | error | select[type=select-one] without a label | `#:rk:` | 160 |
| `D-02` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 10 |
| `D-02` | target-size | warn | target 119x14 px is under 24 px | `div.stack-sm > div.comp-usage > div.row.wrap > button.btn.btn-link` | 10 |
| `D-02` | target-size | warn | target 16x16 px is under 24 px | `div.comp-usage > div.row.wrap > span.chip.chip-neutral > button.chip-remove` | 20 |
| `D-02` | target-size | warn | target 20x20 px is under 24 px | `div.stack-sm > div.comp-usage > div.stars.is-readonly > button.stars-star.is-on` | 50 |
| `D-02` | target-size | warn | target 157x22 px is under 24 px | `div.stack-sm > div.ahours > div.ahours-tools > button` | 10 |
| `D-02` | target-size | warn | target 95x22 px is under 24 px | `div.stack-sm > div.ahours > div.ahours-tools > button` | 10 |
| `D-02` | target-size | warn | target 116x21 px is under 24 px | `div.cuscard-text > div.cuscard-meta > span > a` | 40 |
| `D-02` | target-size | warn | target 41x22 px is under 24 px | `div.comp-usage > figure.figure > figcaption > a.figure-code` | 10 |
| `D-02` | target-size | warn | target 102x12 px is under 24 px | `div.formalert.formalert-danger > div.formalert-text > div.formalert-action > button.btn.btn-link` | 10 |
| `D-02` | target-size | warn | target 72x21 px is under 24 px | `div.comp-usage > div.gdatenav.gdatenav-md > div.gdatenav-group > button.gdatenav-label.is-today` | 10 |
| `D-02` | target-size | warn | target 79x12 px is under 24 px | `div.comp-usage > div.otpverify > div.otpverify-resend > button.btn.btn-link` | 10 |
| `D-02` | target-size | warn | target 45x18 px is under 24 px | `div.docup > div.docup-card.is-done > div.docup-actions > button.docup-link` | 10 |
| `D-02` | target-size | warn | target 47x18 px is under 24 px | `div.docup > div.docup-card.is-done > div.docup-actions > button.docup-link.is-danger` | 10 |
| `D-02` | target-size | warn | target 188x21 px is under 24 px | `ol.shl > li.shl-hit > div.shl-head > a.shl-title` | 10 |
| `D-02` | target-size | warn | target 126x21 px is under 24 px | `ol.shl > li.shl-hit > div.shl-head > a.shl-title` | 10 |
| `D-02` | target-size | warn | target 228x16 px is under 24 px | `div.comp-usage > div.flowfooter > div.flowfooter-actions > button.btn.btn-primary` | 8 |
| `D-02` | target-size | warn | target 18x18 px is under 24 px | `div > div.toasts > div.toast.toast-success > button.toast-close` | 10 |
| `D-02` | target-size | warn | target 85x22 px is under 24 px | `div.stack-sm > div.comp-usage > div.achart > button.achart-toggle` | 30 |
| `D-02` | target-size | warn | target 28x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `D-02` | target-size | warn | target 33x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `D-02` | target-size | warn | target 150x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `D-02` | target-size | warn | target 81x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 30 |
| `D-02` | target-size | warn | target 88x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 10 |
| `D-02` | target-size | warn | target 52x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 20 |
| `D-02` | target-size | warn | target 103x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 20 |
| `D-02` | target-size | warn | target 182x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 10 |
| `D-02` | target-size | warn | target 117x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 10 |
| `D-02` | target-size | warn | target 132x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 20 |
| `D-02` | target-size | warn | target 72x18 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `D-02` | target-size | warn | target 36x18 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 210 |
| `D-02` | target-size | warn | target 226x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `D-02` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `D-02` | target-size | warn | target 238x21 px is under 24 px | `div.cuscard-text > div.cuscard-meta > span > a` | 8 |
| `D-02` | target-size | warn | target 256x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `D-02` | target-size | warn | target 297x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `D-02` | target-size | warn | target 157x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `D-02` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `D-04` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-04` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-04` | target-size | warn | target 546x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `D-10` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-10` | target-size | warn | target 116x18 px is under 24 px | `header.pagehead > div.pagehead-bar > div.row.wrap > a.xs` | 10 |
| `D-10` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-10` | target-size | warn | target 546x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `D-11` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-11` | target-size | warn | target 75x18 px is under 24 px | `header.pagehead > div.pagehead-bar > div.row.wrap > a.xs` | 10 |
| `D-11` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-11` | target-size | warn | target 560x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `D-18` | heading-skip | warn | heading jumps from h1 to h3 | `#main > div.page.stack > div.empty > h3.empty-title` | 10 |
| `P-01` | target-size | warn | target 294x18 px is under 24 px | `div.shero-inner.container > div.shero-aside > div.card.card-p-lg > a.xs` | 4 |
| `P-01` | target-size | warn | target 94x21 px is under 24 px | `div.ps-tiles > div.card.card-p-lg > div.row-between > a.small` | 60 |
| `P-01` | target-size | warn | target 328x21 px is under 24 px | `#site-main > div.container.ps > section.ps-section > a.small` | 24 |
| `P-01` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 40 |
| `P-01` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 20 |
| `P-01` | target-size | warn | target 324x18 px is under 24 px | `div.shero-inner.container > div.shero-aside > div.card.card-p-lg > a.xs` | 4 |
| `P-01` | target-size | warn | target 358x21 px is under 24 px | `#site-main > div.container.ps > section.ps-section > a.small` | 24 |
| `P-01` | target-size | warn | target 686x18 px is under 24 px | `div.shero-inner.container > div.shero-aside > div.card.card-p-lg > a.xs` | 4 |
| `P-01` | target-size | warn | target 736x21 px is under 24 px | `#site-main > div.container.ps > section.ps-section > a.small` | 4 |
| `P-01` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-01` | target-size | warn | target 450x18 px is under 24 px | `div.shero-inner.container > div.shero-aside > div.card.card-p-lg > a.xs` | 8 |
| `P-01` | target-size | warn | target 1232x21 px is under 24 px | `#site-main > div.container.ps > section.ps-section > a.small` | 8 |
| `P-01` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 40 |
| `P-02` | target-size | warn | target 294x21 px is under 24 px | `section.ps-section > div.grid.grid-3 > div.card.card-p-lg > a.small` | 2 |
| `P-02` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-02` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-02` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-02` | target-size | warn | target 324x21 px is under 24 px | `section.ps-section > div.grid.grid-3 > div.card.card-p-lg > a.small` | 2 |
| `P-02` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-02` | target-size | warn | target 310x21 px is under 24 px | `section.ps-section > div.grid.grid-3 > div.card.card-p-lg > a.small` | 2 |
| `P-02` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-02` | target-size | warn | target 350x21 px is under 24 px | `section.ps-section > div.grid.grid-3 > div.card.card-p-lg > a.small` | 4 |
| `P-02` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-03` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-03` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-03` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-03` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-03` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-03` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-04` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-04` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-04` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-04` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-04` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-04` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-05` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-05` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-05` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-05` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-05` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-05` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-06` | heading-skip | warn | heading jumps from h1 to h3 | `div.ps-two > div.card.card-p-lg > div.row-between.wrap > h3` | 10 |
| `P-06` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-06` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-06` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-06` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-06` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-06` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-07` | heading-skip | warn | heading jumps from h1 to h3 | `article.review.is-compact > div.review-text > div.row.wrap > h3.review-title` | 10 |
| `P-07` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-07` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-07` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-07` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-07` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-07` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-08` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-08` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-08` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-08` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-08` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-08` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-09` | heading-skip | warn | heading jumps from h1 to h3 | `div.container.ps > div.ps-tiles > div.card.card-p-lg > h3` | 10 |
| `P-09` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-09` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-09` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-09` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-09` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-09` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-10` | heading-skip | warn | heading jumps from h1 to h3 | `div.ps-two > div.stack > div.card.card-p-lg > h3` | 10 |
| `P-10` | target-size | warn | target 294x21 px is under 24 px | `div.ps-two > div.stack > div.card.card-p-lg > a.small` | 4 |
| `P-10` | target-size | warn | target 294x18 px is under 24 px | `div.ps-two > div.stack > div.card.card-p-lg > a.xs` | 4 |
| `P-10` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-10` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-10` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-10` | target-size | warn | target 324x21 px is under 24 px | `div.ps-two > div.stack > div.card.card-p-lg > a.small` | 4 |
| `P-10` | target-size | warn | target 324x18 px is under 24 px | `div.ps-two > div.stack > div.card.card-p-lg > a.xs` | 4 |
| `P-10` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-10` | target-size | warn | target 686x21 px is under 24 px | `div.ps-two > div.stack > div.card.card-p-lg > a.small` | 4 |
| `P-10` | target-size | warn | target 686x18 px is under 24 px | `div.ps-two > div.stack > div.card.card-p-lg > a.xs` | 4 |
| `P-10` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-10` | target-size | warn | target 450x21 px is under 24 px | `div.ps-two > div.stack > div.card.card-p-lg > a.small` | 8 |
| `P-10` | target-size | warn | target 450x18 px is under 24 px | `div.ps-two > div.stack > div.card.card-p-lg > a.xs` | 8 |
| `P-10` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-11` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-11` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-11` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-11` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-11` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-11` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `P-12` | target-size | warn | target 116x21 px is under 24 px | `div.container.site2-foot-grid > div.site2-foot-col > p.small > a` | 20 |
| `P-12` | target-size | warn | target 328x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-12` | target-size | warn | target 65x18 px is under 24 px | `div.site2 > footer.site2-foot > div.container.site2-foot-legal > a` | 10 |
| `P-12` | target-size | warn | target 358x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-12` | target-size | warn | target 356x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 10 |
| `P-12` | target-size | warn | target 230x21 px is under 24 px | `footer.site2-foot > div.container.site2-foot-grid > div.site2-foot-col > a` | 20 |
| `M-10` | heading-skip | warn | heading jumps from h1 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 10 |
| `M-10` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 30 |
| `M-10` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 20 |
| `M-10` | target-size | warn | target 50x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-10` | target-size | warn | target 33x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-10` | target-size | warn | target 55x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 6 |
| `M-11` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 30 |
| `M-11` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-11` | target-size | warn | target 50x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-11` | target-size | warn | target 33x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-11` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 16 |
| `M-11` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 210 |
| `M-11` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-12` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 20 |
| `M-12` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-12` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 30 |
| `M-12` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-12` | target-size | warn | target 33x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-12` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 8 |
| `M-13` | heading-skip | warn | heading jumps from h1 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 10 |
| `M-13` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 20 |
| `M-13` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-13` | target-size | warn | target 77x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-13` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 16 |
| `M-13` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 190 |
| `M-13` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-14` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 30 |
| `M-14` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-14` | target-size | warn | target 150x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-14` | target-size | warn | target 28x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-14` | target-size | warn | target 54x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-14` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 20 |
| `M-14` | target-size | warn | target 33x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-14` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 210 |
| `M-14` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-15` | heading-skip | warn | heading jumps from h1 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 10 |
| `M-15` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 30 |
| `M-15` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-15` | target-size | warn | target 52x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-15` | target-size | warn | target 42x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-15` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 18 |
| `M-15` | target-size | warn | target 55x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-15` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 260 |
| `M-15` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-16` | heading-skip | warn | heading jumps from h1 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 10 |
| `M-16` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 20 |
| `M-16` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-16` | target-size | warn | target 87x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-16` | target-size | warn | target 55x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-16` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 110 |
| `M-16` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-17` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 20 |
| `M-17` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-17` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 20 |
| `M-17` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 110 |
| `M-17` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-17` | target-size | warn | target 33x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-17` | target-size | warn | target 150x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-18` | heading-skip | warn | heading jumps from h1 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 10 |
| `M-18` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 20 |
| `M-18` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-18` | target-size | warn | target 23x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-18` | target-size | warn | target 54x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-18` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 120 |
| `M-18` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-19` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 10 |
| `M-19` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-19` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 30 |
| `M-19` | target-size | warn | target 150x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-20` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 20 |
| `M-20` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-20` | target-size | warn | target 55x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-20` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 10 |
| `M-21` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 60 |
| `M-21` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-21` | target-size | warn | target 28x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-21` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 10 |
| `M-21` | target-size | warn | target 54x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-21` | target-size | warn | target 23x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-21` | target-size | warn | target 52x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-21` | target-size | warn | target 42x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-21` | target-size | warn | target 87x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-21` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 210 |
| `M-21` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-22` | heading-skip | warn | heading jumps from h1 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 10 |
| `M-22` | heading-skip | warn | heading jumps from h2 to h4 | `section.live > header.live-head > div.grow > h4.live-title` | 30 |
| `M-22` | target-size | warn | target 65x18 px is under 24 px | `div.card.card-p-none > header.manual-head > div.manual-lessons > a.xs` | 10 |
| `M-22` | target-size | warn | target 75x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-22` | target-size | warn | target 41x22 px is under 24 px | `div.manual-body > figure.figure > figcaption > a.figure-code` | 20 |
| `M-22` | target-size | warn | target 50x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
| `M-22` | target-size | warn | target 48x20 px is under 24 px | `div.live-body > ul.live-list > li > a.live-code` | 210 |
| `M-22` | target-size | warn | target 85x18 px is under 24 px | `section.live > footer.live-foot > span.live-source > a` | 10 |
