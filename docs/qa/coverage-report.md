# QA report: spec, rules, component and table coverage

- **Dimension**: SPEC, RULES, COMPONENT, TABLE COVERAGE - every route has a full PageSpec, every component has a meta and is in the library, every table has seeds and is in `/dev/tables`, every pricing / discount / fee / tax / capacity / vaccine / PIN / booking-status rule from `docs/rules/business-rules-from-designs.md` is in the registry with a sensible status and is referenced by a page spec, and the pricing engine matches the rules doc.
- **Build under test**: `main` @ `769c234` (v0.2.0; report written on top of `42f093a`).
- **Method**: static, read-only. A Node script loaded the real aggregators through Vite SSR (`ssrLoadModule` on `src/app/registry.ts`, `src/rules/index.ts`, `src/data/schema/index.ts`, `src/data/seed/index.ts`, `src/design/library.ts`), dumped a JSON snapshot (182 resolved routes, 214 merged rules, 74 tables, 74 seeded tables, 135 component metas) and cross-checked it against the component folders, `docs/pages/`, `docs/screenshots/` and the 133 `R-xxx` rows parsed from the rules doc. Pricing: 26 assertions (22 quote cases + 4 seed-value checks) derived from the rules doc were run with the same loader against `src/pricing/engine.ts` **and the real seed rows** from `buildSeed()` (not the hand-written fixtures of `scripts/test-pricing.mjs`). Nothing in `src/` was changed.
- **Date**: 2026-09-18.

## Summary

| Check | Result |
| --- | --- |
| Route has a PageSpec | **Pass.** 182 / 182 resolved routes carry a spec; 0 stubs; 7 `_stubs` homes are correctly shadowed by real pages. |
| Spec non-empty: purpose, layout, roles, logic, components, states | **Pass.** 182 / 182. |
| Spec non-empty: `rules` | **Gap.** 12 routes have `rules: []` (finding 3). |
| Spec non-empty: `data` | **Gap.** 15 routes have `data: []` (finding 3). All are dev / manual tooling pages. |
| Spec references resolve | **Gap.** 0 unknown tables; 10 specs name component `StatusBadge`, which has no meta (finding 1); 13 spec entries name rule ids that are not in the registry (finding 2). |
| Spec roles = route roles | Minor. 16 routes disagree (finding 8). |
| `checkedAt` covers 360 / 390 / 768 / 1280 / 1920 | **Pass** except HUB-02 (no 1920). |
| Component folder -> meta -> library | **Pass with one naming gap.** 135 folders, 135 metas, 135 library entries, every meta has >= 1 usage, no stray `.tsx` outside a folder. `atom/Radio` exports and registers as `RadioGroup` (finding 9). `StatusBadge` is exported from `Badge.tsx` without a meta (finding 1). |
| Table in schema -> seed -> `/dev/tables` | **Pass with 4 empty tables.** 74 tables, all in a known `TABLE_GROUPS` group (so all render in D-04), 0 duplicate names, 0 seed tables missing from the schema. 4 tables have zero seed rows (finding 7). |
| Doc rules in scope present in registry | **Gap.** 96 doc rows concern pricing / discounts / fees / tax / capacity / vaccines / PIN / booking status; 77 are in the registry, **19 are not** (finding 4). |
| Rule status sensible | **Gap.** Capacity rules R-E10..E13 and R-G21 are `implemented` although no code enforces a capacity limit on booking creation; R-E13 points at a page that does not exist (finding 5). 7 `implemented` rules carry no `implementedIn` (finding 10). |
| Rule referenced by >= 1 page spec | **Gap.** 4 registry rules (R-B10, R-D09, R-D10, R-D12) appear in no `spec.rules`; 11 rule `pages` entries point at unbuilt codes F-20 / F-40 (finding 6). 101 rule->page links are one-directional (the page's `spec.rules` omits the id); the Inspector merges both directions so the builder tool still shows them (informational). |
| Pricing engine vs rules doc | **Pass.** 26 / 26 assertions (table below). Two design ambiguities are resolved one way by the engine and should be confirmed by Justin (R-F01 threshold "more than 6 h" vs engine `>= 6`; 4+ dogs in a penthouse falls back to the 3-dog tier). |
| Page docs and screenshots | **Pass.** 182 / 182 codes have `docs/pages/<CODE>.md` and a `docs/screenshots/<CODE>/` folder; 0 orphan page docs. |

No blockers. 3 major, 7 minor findings.

## Counts

- Routes: 182 (customer 56, front desk 34, admin 25, manual 27, public 16, dev 22, docs 2). 10 page codes are shared by two paths on purpose (`new` + `:id/edit` forms F-11 / F-33 / F-51 / F-54; index + detail D-03 / D-04 / D-10 / D-11 / D-06; P-01 `/site` + `/site/home`).
- Specs 8 / 8 fields filled (`specCompleteness`): 162 of 182. `integrations` is empty on 122 specs; that is acceptable for pages with no external system, and every payment, upload, auth, chat and notification page does declare one.
- Rules: 214 merged (231 declarations); status implemented 183, in_dev 16, requested 14, deprecated 1. By category: account 41, grooming 23, operations 22, booking 20, people 20, vaccines 18, pricing 13, daycare 11, pin_approvals 11, discounts 8, capacity 8, fees_tax 8, locations 8, room_fit 3.
- Rules doc: 133 `R-xxx` rows; 106 are in the registry, 27 are not (19 of them in the scope of this dimension, listed in finding 4; the other 8 are R-A09, R-C07, R-G19, R-J11, R-K07, R-K08, R-L04, R-L08). 35 registry ids are not in the doc (R-M20..M28, R-P01/P02, R-S01 and 22 catalog-style ids such as R-A10, R-A11, R-C03 that were added by modules with doc-style ids).
- Components: 135 (atom / molecule / organism / template). 8 are in no spec, all shell / tooling parts: BottomNav, SpecChip, FeedbackButton, Sidebar, TopBar, DesktopShell, PageStub, PhoneShell.
- Tables: 74; every table is named in at least one `spec.data`.

## Findings (most severe first)

### 1. MAJOR - `StatusBadge` is used by 10 specs and mandated by CLAUDE.md but has no meta and is not in `/dev/components`

- **Where**: `src/components/atom/Badge/Badge.tsx:15` (`export function StatusBadge(...)` as a second export of the Badge folder); no `StatusBadge.meta.ts` anywhere. Specs naming it: A-01, C-10, C-39, F-01, F-10, F-12, F-13, F-52, F-55, P-08 (`grep -rn "'StatusBadge'" src/modules/*/specs.ts`). 12 page files import it (`grep -rl StatusBadge src/modules`). `GroomStatusBadge` (molecule) does have its own folder and meta.
- **Repro**: open `#/dev/components`, search "StatusBadge": nothing. Open `#/desk/reservations` (F-10), press Ctrl+., Components tab: `StatusBadge` links to `/dev/components#StatusBadge`, which lands on the library with no matching entry.
- **Why it matters**: rule "no component without a meta"; the one lifecycle badge (`BOOKING_STATUS_LABEL` / customer labels) is the most reused domain component and has no documented props, states or usages.
- **Fix**: move it to `src/components/atom/StatusBadge/StatusBadge.tsx` + `StatusBadge.meta.ts` (usages: each of the 7 statuses, `customer` labels, sizes) and re-export from `Badge.tsx` for compatibility; or add the meta inside the Badge folder as a second `defineMeta` file named `StatusBadge.meta.ts` (the glob `**/*.meta.ts` would pick it up; the folder contract would still be bent).

### 2. MAJOR - 13 spec `rules` entries point at ids that are not in the registry

- **Where / list**: `A-12: R-K07`, `A-44: R-J09`, `C-33: R-A09`, `C-35: R-A09`, `C-35: R-H02`, `C-36: R-H01`, `C-36: R-H02`, `C-37: R-I04`, `C-38: R-I04`, `C-39: R-I04`, `C-50: R-A09`, `F-51: R-J11` (twice, both F-51 paths). Modules: `src/modules/customer-hotel/specs.ts`, `customer-grooming-daycare/specs.ts`, `admin-control-panel/specs.ts`, `frontdesk-grooming-people/specs.ts`.
- **Repro**: `#/app/hotel/estimate` (C-35) -> Ctrl+. -> Rules tab shows `R-H02 (not in registry yet)` and `R-A09 (not in registry yet)`; `#/admin/settings/rules` (A-40) has no row for them. D-16 spec report flags them as `unknown_rule` warnings.
- **Why it matters**: the builder tool and Settings > Rules disagree about which rules a page implements; three of the ids are in scope here (R-H01 payment methods, R-H02 deposit / pay-in-full paths, R-I04 customer-facing booking statuses) and are actually implemented by those pages.
- **Fix**: add the seven ids to the owning module's `src/rules/<module>.ts` with the doc's title / source (R-A09, R-H01, R-H02, R-I04 `implemented`; R-J09, R-J11, R-K07 `requested` or `deprecated`). Ids are catalog ids, so no renumbering is needed.

### 3. MAJOR - 12 routes have empty `spec.rules`, 15 have empty `spec.data` (spec contract: "non-empty purpose, data, roles, components, rules")

- **`rules: []`**: A-40 `/admin/settings/rules` (it reuses the D-05 spec), C-78 `/app/about`, C-79 `/app/legal/:slug`, D-02 `/dev/components`, D-03 `/dev` and `/dev/specs`, D-05 `/dev/rules`, D-06 `/docs` and `/docs/*`, D-07, D-18, HUB-02 `/no-access`.
- **`data: []`**: D-01, D-02, D-03 (x2), D-06 (x2), D-07, D-08, D-09, D-13, D-15, D-17, D-18, D-19, M-03.
- **Repro**: `#/admin/settings/rules` -> Ctrl+. -> Rules tab is empty on the very page that manages rules; Overview shows the D-05 name overridden but the spec body untouched (`src/modules/settings-rules/index.ts:9`).
- **Fix**: the registry / tokens / components / docs pages should at least cite the meta-rules they enforce (R-X80 spec report, R-X84 table edits, D-006 registry rule) and list the tooling tables they read (`rules`, `feedback`, `page_layouts`, `perf_budgets`, ...). For C-78 / C-79 add the legal / support rules (R-X39, R-M05). For HUB-02 add the role-guard rule. `specReport.ts:43` already downgrades `rules` / `states` / tooling `data` to warnings; the binding text in the task says non-empty, so either fill them or record the tooling exemption as a decision.

### 4. MINOR - 19 in-scope rows of the rules doc are not in the registry

Grouped by what they are about (all are `seen in design` in the doc and would become `requested`, `deprecated` or `implemented` rows):

| Ids | Topic | Suggested status |
| --- | --- | --- |
| R-D15 | Discount entered as % on booking forms (legacy $ or %) - the desk discount flow that R-X64 PIN-gates | `in_dev` (pages F-11, F-33) |
| R-H01, R-H02 | Payment methods (card / cash at location); Pay deposit vs Pay in full | `implemented` (C-36, C-35; already referenced by those specs, see finding 2) |
| R-I04 | Customer-facing statuses "Pending Verification" / "Upcoming" | `implemented` (C-37..C-39, `BOOKING_STATUS_CUSTOMER_LABEL`) |
| R-D08, R-D11 | Fractional chargeable days; charge N days if check-in after / check-out before a time | `requested` (A-20, with R-D09 / R-D10 / R-D12) |
| R-D02, R-D03, R-D04 | Room inclusions copy (Suite copy is a placeholder); customer-app avg price $150 / $105 conflicting with R-D05 | `implemented` (room_types.description) / `deprecated` (R-D04 conflict resolved to the rates table) |
| R-G07, R-G09 | Diamond "specialty cuts, please call"; dematting surcharge | `implemented` (packages.notes) / `requested` |
| R-E07 | Legacy 6 % prepay discount | `deprecated` |
| R-D18, R-D19, R-D20, R-H06, R-H07, R-B04, R-I10 | Placeholder or legacy rows (mock numbers, legacy HST flag, legacy vaccine types, startup prompts) | `deprecated` or `requested` |

- **Why it matters**: the registry is meant to carry the decision for every row, including conflicts (doc intro: "the conflict is recorded as its own row so the registry carries the decision"). Without R-D04, R-E07, R-H06 the Settings > Rules page cannot show that those design numbers were rejected.
- **Fix**: add them to `src/rules/pricing.ts` / `operations.ts` / the owning module file; deprecate placeholders explicitly.

### 5. MINOR - Capacity rules are `implemented` but only displayed, never enforced; R-E13 points at an unbuilt page

- **Where**: `src/rules/operations.ts` (or the module file that declares them): R-E10 grooming 2 simultaneous, R-E11 penthouses 12 / 20, R-E12 suites 42 / 16, R-E13 daycare 20 / 15, R-G21 grooming slots respect capacity - all `implemented` with `implementedIn: 'capacities seed'`. `grep -rn capacities src/modules` shows the table is read only by A-10 / A-11, reports (F-62..F-64), the public site (P-04, P-06) and the dashboard meters. Booking creation (`frontdesk-reservations/lib/availability.ts`, `customer-hotel`, `customer-grooming-daycare`, `frontdesk-grooming-people/lib.ts`) checks rooms (R-X03 / R-X56) and groomer slots, not `capacities.max_simultaneous`; the merge report itself says "daycare ignores capacity (R-E13)".
- **Repro**: `#/app/daycare/book` (C-60): book 21 dogs for the same Encino day (or run the seed and count `daycare_bookings` for one day) - no block, no warning. `#/admin/settings/rules`: R-E13 shows Implemented, pages `F-40, A-10`; `#/desk/daycare` (F-40) is `/no-access`-free but does not exist (404 to the hub).
- **Fix**: set R-E13 and R-G21 to `in_dev` (or `requested`) until the daycare day page (F-40..F-49) lands; set R-E10..E12 `implementedIn` to the room-availability code they actually rely on and note that `capacities` is informational; or add a `capacityFor(locationId, kind, day)` helper in `src/domain` and call it from the three booking flows.

### 6. MINOR - Rule `pages` reference codes that are not routes; 4 rules are in no page spec

- **Unknown pages** (11 entries): `F-20` in R-B10, R-D14, R-H03, R-H04, R-H09, R-H10, R-P01; `F-40` in R-E13, R-F01, R-F02, R-F05. Neither code is registered (desk invoices F-20..F-29 and daycare day F-40..F-49 are the known unbuilt ranges).
- **Not in any `spec.rules`**: R-B10 (vaccination fee $40, pages F-20 only), R-D09, R-D10, R-D12 (boarding charge multipliers / charge-by / minimum days; pages A-20, but `src/modules/admin-control-panel/specs.ts:16` A-20 lists R-D05, R-D06, R-E15, R-X44, R-X41, R-X42 only).
- **Repro**: `#/admin/settings/rules` -> R-H09 -> page chip `F-20` has nowhere to link; Ctrl+. on A-20 shows R-D09 / R-D10 / R-D12 only because the Inspector merges `rule.pages` (`InspectorPanel.tsx:27`), while `docs/specs.md` and the D-16 report (which read `spec.rules`) show A-20 without them.
- **Fix**: until F-20 / F-40 exist, point those rules at the pages that do the work today (F-12 invoice section, C-40 reservation invoice, C-60 / C-63 daycare, A-23) and add R-D09 / R-D10 / R-D12 to the A-20 spec (they are its settings).

### 7. MINOR - 4 tables have no seed rows

- `account_deletion_requests` (system), `auth_codes` (core), `groomer_column_prefs` (grooming), `page_layouts` (design). They are runtime-written tables and the app handles the empty state, but `/dev/tables` shows them at 0 rows and the D-14 seed inspector cannot demonstrate them.
- **Fix**: one demo row each in the owning seed file (an expired OTP code, one pending deletion request for a fictional customer, one saved groomer column order, one saved layout for D-11), or record "intentionally empty" in `TableDef.description`.

### 8. MINOR - `spec.roles` disagrees with `route.roles` on 16 routes

- F-01 `/desk`: spec omits `groomer`, route includes it (`src/modules/frontdesk-reservations/index.ts`). C-70..C-84 (all of `customer-settings-chat`): spec says `customer`, route adds `super_admin`.
- **Effect**: `RequireRole` uses the route array, the Inspector Overview and `docs/specs.md` show the spec array, so the builder tool under-reports who can open the page.
- **Fix**: derive `roles` on the route from `spec.roles` in the module's `index.ts` (`roles: spec.roles`) so there is one source.

### 9. MINOR - `atom/Radio` folder registers as `RadioGroup`

- `src/components/atom/Radio/Radio.tsx` exports `RadioGroup`; `Radio.meta.ts:13` has `name: 'RadioGroup'`; 11 specs reference `'RadioGroup'`. The folder contract is `<Name>/<Name>.tsx` with the meta named after the component, so a folder-to-library check by name fails for this one component (it is the only mismatch in 135).
- **Fix**: rename the folder and files to `RadioGroup/` (imports in 4 modules), or rename the export.

### 10. MINOR - 7 `implemented` rules carry no `implementedIn`; two "bug" rows are marked implemented

- R-A01, R-B05, R-B07, R-B11, R-M05, R-X01, R-X02 are `implemented` without a code pointer (the integration commit flipped R-A01, R-M05, R-X01, R-X02 to implemented per builder requests). R-F06 "Mobile computed price bug" and R-G15 "Grooming totals in the mobile mock do not reconcile" are design errors, not rules; `implemented` reads as if the bug were implemented. R-X50 "Deposit is a settings percentage" is implemented, but `src/modules/customer-hotel/lib.ts:15` keeps `deposit_percent: 30` and `free_cancellation_hours: 48` as `DEFAULT_HOTEL_SETTINGS` fallbacks (the seed writes the `settings` row, so the fallback is only hit when the row is missing; both values are on the needs-Justin list).
- **Fix**: fill `implementedIn`; retitle R-F06 / R-G15 as "Daycare price derives from hours (fixes design error)" / "Grooming total = package + add-ons + tax" or deprecate them and point to R-F01 / R-G01.

## Pricing engine vs rules doc (26 / 26 pass)

Run with the real seed rows from `buildSeed()`; dates in 2026 (Mon 21 Sep; winter holiday season 18 Dec - 4 Jan is `is_holiday`). Script: Vite SSR loader (not committed; the assertions below are reproducible by adding them to `scripts/test-pricing.mjs`).

| # | Rule(s) | Case | Expected | Result |
| --- | --- | --- | --- | --- |
| Q01 | R-D05 R-D06 R-H04 | Penthouse, 1 Mon night, cash | 120 + 2 % tax = 122.40 | pass |
| Q02 | R-D05 R-D06 | Suite, 1 Fri night (Fri-Sun = weekend) | 95 -> 96.90 | pass |
| Q03 | R-D05 R-D06 | Penthouse, Mon night inside winter season | seasonal 140 -> 142.80 | pass |
| Q04 | R-E01 | 2 dogs, penthouse, 2 weekday nights | 480 - 15 x 2 x 2 = 420 -> 428.40 | pass |
| Q05 | R-E02 | 3 dogs, penthouse, 1 weekday night | 360 - 20 x 3 = 300 -> 306.00 | pass |
| Q06 | R-E03 | 2 dogs, suite, 1 weekday night | 170 - 10 x 2 = 150 -> 153.00 | pass |
| Q07 | R-E04 R-E08 | 7 nights suite, paid in full, no holiday | 625 - 5 % = 593.75, tax 11.88, total 605.63 | pass |
| Q07b | R-E04 R-E08 | same stay not paid in full | no discount, note "Pay in full upfront..." | pass |
| Q08 | R-E05 | 14 nights penthouse, paid in full | 1770 - 7.5 % = 132.75 off | pass |
| Q09 | R-E06 | 21 nights penthouse, paid in full | 2655 - 10 % = 2389.50, tax 47.79, total 2437.29 | pass |
| Q10 | R-E15 | 7 nights paid in full crossing 18 Dec | no long-stay discount, holiday note | pass |
| Q11 | R-H03 | Penthouse 1 night by card | fee 3.89 % of 122.40 = 4.76, total 127.16 | pass |
| Q12 | R-E02 edge | 4 dogs in a penthouse | falls back to 3-dog tier: 80 off (doc silent - confirm) | pass |
| Q13 | R-G02 R-G11 R-G10 R-G13 | Gold L + Furminator | 80 + 25 = 105, tax 2.10, 60 + 20 min | pass |
| Q14 | R-G04 R-H03 | Platinum XL by card | 115, tax 2.30, fee 4.56, total 121.86 | pass |
| Q14b | R-G02 R-G04 | seeded Gold / Platinum prices | 50/65/80/95/135 and 65/80/95/115/150 | pass |
| Q14c | R-G11 | seeded add-on prices and starting-at flags | 10 add-ons as in the doc | pass |
| Q15 | R-F01 | daycare 8 h, 1 pet | full day 45 -> 45.90 | pass |
| Q16 | R-F02 | daycare 4 h | half day 35 -> 35.70 | pass |
| Q17 | R-F03 | daycare 1 h | play hour 15 -> 15.30 | pass |
| Q18 | R-F05 | daycare 4 h, 3 pets | 105 - 5 x 2 = 95 -> 96.90 | pass |
| Q19 | R-F01 edge | daycare exactly 6 h | full day (settings copy says "more than 6 h" - confirm) | pass |
| Q19b | R-F01 R-F02 edge | daycare 5.5 h | half day (mobile copy "> 5 h" would say full) | pass |
| Q20 | R-F04 | walk $12 | seeded, not quotable (R-F04 in_dev, consistent) | pass |
| Q21 | R-H03 R-H04 R-H05 | seeded fee / tax | 3.89 % card-only; 2 / 2 / 2 exclusive | pass |
| Q22 | R-D05 | all 12 seeded rate rows | PH 120 / 135, seasonal 140 / 155; Suite 85 / 95, seasonal 100 / 110 | pass |

Notes for Justin (engine choices where the doc is ambiguous or conflicting): card fee 3.89 % (customer copy said 3.8 %); daycare threshold 6 h inclusive (settings "more than 6" vs mobile "> 5"); long-stay tiers count nights, the doc says days; long-stay % applies after the multi-dog discount; the summer season (15 Jun - 31 Aug) is seeded with the same seasonal rates as winter but is not a holiday, so long-stay discounts still apply in summer; Diamond prices are placeholders (R-G06 requested).

Existing `npm run test:pricing` still passes (14 assertions on hand-written fixtures).

## What passed (for the record)

- 182 / 182 routes have a `PageSpec` with non-empty purpose, layout, roles, logic, components and states; 181 / 182 record all five D-016 widths in `checkedAt`.
- 0 unknown table names across all `spec.data`; every one of the 74 tables is cited by at least one spec.
- 135 component folders, each with `<Name>.tsx` + `<Name>.meta.ts`, all in `componentLibrary`, all with >= 1 usage, correct tier, no stray component files.
- 74 tables: unique names, valid groups (all render in D-04), base columns never redeclared (rates / users add an explicit nullable `location_id` as a real column because they are `scope: 'global'`).
- Rules registry: 214 unique ids after merge, no rule without pages, ids sort numerically; Settings > Rules (A-40) and D-05 render every rule with status and offer the add-rule drawer (`RulesPage.tsx:71`) behind `can('rules.write')`; Inspector Rules tab merges `spec.rules` with `rule.pages`.
- In-scope rules present with sensible status: vaccines R-A04/A05/A06/A11/A12, R-B01..B03, B05..B09, R-X04, R-X20, R-X25, R-X60, R-X61; PIN R-I06, R-P01, R-P02, R-X06, R-X42, R-X43, R-X63, R-X64, R-X68, R-X77, R-X84 (all `implemented`, `PIN_GATED_TRANSITIONS` gates confirmed -> cancelled / no_show, cancelled / no_show -> requested, pending_vaccines -> confirmed); pricing R-D01, D05..D07, D14; discounts R-E01..E06, E08, E15; fees / tax R-H03..H05, H08..H10; daycare R-F01..F05; grooming R-G01..G06, G08, G10..G13, G17, G22; booking status R-I01..I03, I07, I09, I11, R-X14, R-X52.
- 182 / 182 page docs and screenshot folders exist; no orphan page docs.
