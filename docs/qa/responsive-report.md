# Responsive QA report

generated: 2026-09-18T05:48:57.820Z
routes: 35
widths: 360, 390, 768, 1280, 1920
themes: light, dark
cells: 350
failing_cells: 0
a11y_findings: 1106

_Written by `npm run qa:responsive` (scripts/qa-responsive.mjs). Fail = horizontal scroll (documentElement.scrollWidth > viewport) or a console error. A11y findings come from the same checks D-15 runs live. Open `/#/dev/qa/responsive` for the interactive matrix._

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
| `A-00` | `/staff/pin` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-03` | `/dev` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-01` | `/dev/tokens` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `D-02` | `/dev/components` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
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
| `HUB-01` | `/` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `HUB-02` | `/no-access` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `P-00` | `/site` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |
| `A-40` | `/admin/settings/rules` | ok / ok | ok / ok | ok / ok | ok / ok | ok / ok |

## A11y findings by rule

| Rule | Findings |
| --- | --- |
| target-size | 1026 |
| landmark-main | 50 |
| heading-skip | 20 |
| h1 | 10 |

## A11y findings (unique per route)

| Code | Rule | Sev | Finding | Element | Cells |
| --- | --- | --- | --- | --- | --- |
| `C-10` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-10` | target-size | warn | target 27x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `C-10` | target-size | warn | target 53x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `C-10` | target-size | warn | target 80x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `C-10` | target-size | warn | target 106x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `C-10` | target-size | warn | target 86x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `C-10` | target-size | warn | target 33x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 40 |
| `C-02` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `C-02` | target-size | warn | target 33x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `C-02` | target-size | warn | target 60x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-01` | target-size | warn | target 53x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-01` | target-size | warn | target 80x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-01` | target-size | warn | target 60x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-01` | target-size | warn | target 27x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-01` | target-size | warn | target 33x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 200 |
| `F-01` | target-size | warn | target 66x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-30` | target-size | warn | target 80x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-30` | target-size | warn | target 60x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-30` | target-size | warn | target 27x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-30` | target-size | warn | target 53x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-30` | target-size | warn | target 40x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-30` | target-size | warn | target 33x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 70 |
| `F-60` | target-size | warn | target 86x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `F-60` | target-size | warn | target 33x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `A-01` | target-size | warn | target 53x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 40 |
| `A-01` | target-size | warn | target 80x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `A-01` | target-size | warn | target 106x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `A-01` | target-size | warn | target 33x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `M-01` | target-size | warn | target 60x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `M-01` | target-size | warn | target 33x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `A-00` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `A-00` | target-size | warn | target 96x21 px is under 24 px | `div.pinlogin > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `A-00` | target-size | warn | target 96x12 px is under 24 px | `div.card.card-p-lg > div.row.wrap > a > button.btn.btn-link` | 10 |
| `D-02` | target-size | warn | target 120x14 px is under 24 px | `div.stack-sm > div.comp-usage > div.row.wrap > button.btn.btn-link` | 10 |
| `D-02` | target-size | warn | target 16x16 px is under 24 px | `div.comp-usage > div.row.wrap > span.chip.chip-neutral > button.chip-remove` | 20 |
| `D-02` | target-size | warn | target 39x21 px is under 24 px | `div.comp-usage > figure.figure > figcaption > a.figure-code` | 10 |
| `D-02` | target-size | warn | target 187x21 px is under 24 px | `ol.shl > li.shl-hit > div.shl-head > a.shl-title` | 10 |
| `D-02` | target-size | warn | target 126x21 px is under 24 px | `ol.shl > li.shl-hit > div.shl-head > a.shl-title` | 10 |
| `D-02` | target-size | warn | target 175x19 px is under 24 px | `section.section > div.section-head > div.section-text > button.section-toggle` | 10 |
| `D-02` | target-size | warn | target 20x20 px is under 24 px | `div.comp-usage > ol.stepper.is-compact > li.step.is-done > button.step-btn` | 16 |
| `D-02` | target-size | warn | target 18x18 px is under 24 px | `div > div.toasts > div.toast.toast-success > button.toast-close` | 10 |
| `D-02` | target-size | warn | target 81x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 30 |
| `D-02` | target-size | warn | target 88x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 10 |
| `D-02` | target-size | warn | target 52x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 10 |
| `D-02` | target-size | warn | target 103x18 px is under 24 px | `div.trp-side > ul > li.trp-row > a.trp-table` | 20 |
| `D-02` | target-size | warn | target 66x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 10 |
| `D-02` | target-size | warn | target 33x19 px is under 24 px | `div.container.page > div.card.card-p-lg > div.row.wrap > a` | 150 |
| `D-04` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-04` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-04` | target-size | warn | target 557x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `D-10` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-10` | target-size | warn | target 118x18 px is under 24 px | `header.pagehead > div.pagehead-bar > div.row.wrap > a.xs` | 10 |
| `D-10` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-10` | target-size | warn | target 557x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `D-11` | target-size | warn | target 328x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-11` | target-size | warn | target 77x18 px is under 24 px | `header.pagehead > div.pagehead-bar > div.row.wrap > a.xs` | 10 |
| `D-11` | target-size | warn | target 358x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 2 |
| `D-11` | target-size | warn | target 583x18 px is under 24 px | `header.pagehead > div.pagehead-row > div.pagehead-text > a.pagehead-back` | 6 |
| `D-18` | heading-skip | warn | heading jumps from h1 to h3 | `#main > div.page.stack > div.empty > h3.empty-title` | 10 |
| `HUB-01` | heading-skip | warn | heading jumps from h1 to h3 | `div.card.card-p-lg > div.hub-phone > div.stack-sm > h3` | 10 |
| `HUB-02` | h1 | warn | no visible h1 on the page | `document` | 10 |
| `HUB-02` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `P-00` | landmark-main | warn | no <main> landmark | `document` | 10 |
| `P-00` | target-size | warn | target 35x21 px is under 24 px | `div.site > header.site-head.container > nav.site-nav > a` | 10 |
| `P-00` | target-size | warn | target 111x21 px is under 24 px | `div.site > header.site-head.container > nav.site-nav > a` | 10 |
| `P-00` | target-size | warn | target 64x21 px is under 24 px | `div.site > header.site-head.container > nav.site-nav > a` | 10 |
| `P-00` | target-size | warn | target 66x18 px is under 24 px | `#root > div.site > footer.container.site-foot > a` | 10 |
