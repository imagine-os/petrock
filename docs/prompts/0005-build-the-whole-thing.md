# 0005 - Build the whole thing

- Source: Slack #petrock-hotel thread https://playsetllc.slack.com/archives/C0C2PP1NRPE/p1789669007022039 (message 2026-09-18 01:57 UTC)
- Date: 2026-09-18
- Requester: Justin Massion (owner)
- Follows: `docs/prompts/0004-figma-export-and-responsiveness.md`
- Changelog: `docs/changelog/0007-foundation.md` (and 0008+ per module)

## Prompt (verbatim)

Please build the whole thing

## Response

Release 0.1.0 - 2026-09-18 (changelog `docs/changelog/0020-release-0.1.0.md`; module changelogs 0007..0019).

### What was built

One Vite + React 18 + TypeScript codebase with four surfaces behind a HashRouter, mock data in localStorage behind the `DataProvider` seam (Company-OS REST adapter stubbed), payments behind `PaymentProvider` (mock now, Stripe stub), light / dark themes plus the `sunset` brand, and the super-admin builder tool (SpecChip + inspector with a Rules tab, Ctrl+.) on every page.

| Count | Value |
| --- | --- |
| Routes (all with a PageSpec) | 182: customer C 56, front desk F 34, owner / admin A 26, public site P 13, ops manual M 27 (M-01..M-03 + chapters 10..33), dev D 24, hub 2 |
| Components with metas (`/#/dev/components`) | 137 |
| Tables (`/#/dev/tables`, `docs/data-model.md`) | 74 |
| Rules in the registry (Settings > Rules, A-40) | 238 |
| Manual chapters (`docs/ops-manual/en`) | 24 |
| Page docs (`docs/pages`) | 172 |
| Screenshots (`docs/screenshots`) | 462 + 8 release shots in `docs/screenshots/release-0.1/` |
| Decisions | D-001..D-182 (`docs/decisions.md`) |
| QA | typecheck and build green; responsive matrix 182 routes x 5 widths x 2 themes, 0 failing; e2e journeys 11 / 11 (`docs/qa/`) |

### Live URL

https://imagine-os.github.io/petrock/ - **not live yet**. The Pages site does not exist: `actions/configure-pages` fails with `Get Pages site failed ... Not Found` (run #7) and, with `enablement: true`, `Create Pages site failed. Error: Resource not accessible by integration` (run #8): the workflow token may not create the site, the Pages REST API is not reachable from the build sandbox (`Access to this GitHub API path is not permitted through this proxy`), and pushing a `gh-pages` branch was refused by the session's permission policy. **Justin: Settings > Pages > Build and deployment > Source = "GitHub Actions"**, then re-run "Deploy to GitHub Pages" (Actions tab > Run workflow) or push anything to `main`. The workflow (`.github/workflows/pages.yml`: Node 22, `npm ci`, `npm run build`, upload `dist`, `deploy-pages`) is correct and its build step passes.

Until then: `npm install && npm run build && npm run preview` serves the same `dist` at `http://localhost:4173/#/`.

### How to test each role from the hub (`/#/`)

- **Customer app** - "Enter as Avery Thompson" (or Sign in / sign up: C-01..C-09). Home C-10, pets and vaccines C-11..C-21, hotel booking C-30..C-41, Grooming & Spa C-50..C-56, daycare C-60..C-65, profile / settings / chat C-70..C-84. Resize to 390 or use the phone frame in the hub.
- **Front desk** - "Encino" or "Westwood" pins the desk to that location: Today F-01, reservations table / form / detail / timeline / board / availability F-10..F-15, grooming day / board / agenda F-30..F-34, customers, pets, vaccine verification queue, messages, invoice F-50..F-59, notifications, inquiries, reviews, reports, tasks F-60..F-68.
- **Owner / admin** - "Enter as Jordan Blake": dashboard A-01, reports A-10..A-12, Control Panel A-20..A-28 (pricing, discounts, fees, daycare, packages, add-ons), staff and roles A-30..A-32, reviews, feedback inbox, approvals, audit, backups A-35..A-38, Settings > Rules A-40, locations A-41, settings A-42..A-44.
- **Staff roles row** - one button per role (super admin, owner, manager, front desk, groomer); PIN login at `/#/staff/pin`: 0000 super admin, 1111 owner, 2222 manager, 3333 / 4444 front desk, 5555 groomer. Super admin has "view as" in the top bar and the builder tool.
- **Ops manual** (M-01..M-33) and **Docs** (in-app render of `docs/`) from the hub cards; dev pages at `/#/dev` (components, specs, tables, rules, responsive QA, a11y, perf budget).

### Known gaps

1. Not deployed until Pages is enabled by Justin (above).
2. Daycare desk pages F-40..F-49 are not built; daycare capacity (R-E13) is `in_dev` and not enforced in the booking flows (D-181).
3. Data is mock-only (localStorage, daily reseed keeps runtime rows, D-180): no backend, no cross-device persistence, no real auth; `CompanyOsProvider` is a seam, not an integration.
4. Payments are mock; `StripePaymentProvider` is a stub with no keys; receipts, refunds and card storage are simulated.
5. Bundle is one 5.2 MB chunk (1.03 MB gzip) against the 500 kB perf budget; code-splitting per surface is pending. Figma second pass (illegible screens, node-id mapping, D-012), Capacitor wrapping and app-store legal pages are also open.

### Needs Justin

D-010 (port older-section screens), D-012 (Figma paid seat or wait for the quota), D-024 (password policy), D-025 (lockout 5 tries / 15 min), D-067 (Suite description copy), D-074 (daycare vs grooming duration rule), D-075 (daycare Full Day threshold 6 h; Figma says 5 h / $45), D-076 (Diamond package prices are placeholders), D-080 (size tiers by weight), D-109 (chargeable days: nights only), D-112 (desk deposit defaults to 0), D-114 (hotel guests not deducted from daycare capacity), D-179 (PIN at check-in?), card fee 3.89 % (D-060). Open questions: `docs/figma/open-questions.md`.
