<!-- Adopted per D-229 (prompt 0017); the live-site source set is `docs/reference/petrockhotel-scrape/` (D-224). -->

# Pricing + company facts adopted from petrockhotel.com (D-187)

Date: 2026-09-20. Source of truth: `docs/reference/petrockhotel-scrape/pages/home.md` (live-site crawl
2026-09-20), summarised in `docs/reference/petrockhotel-scrape/INVENTORY.md`.
Scope: seed rows and company facts only — no schema columns changed, no page/component changes,
nothing under `src/modules/extras-manual-website/`, `src/components/`, `public/`, `scripts/site-images.mjs`.

Files changed
- `src/data/seed/core.ts` (seasons, rates, discounts, packages, addons, daycare_pricing)
- `src/data/MockProvider.ts` (`SEED_VERSION` 3 -> 4)
- `src/pricing/engine.ts` (daycare threshold fallback 6 -> 5, comment only; the real value is data)
- `src/rules/pricing.ts` (R-D05, R-F01, R-F02, R-G02, R-G04, R-G06, R-G11 text + sources)
- `src/modules/admin-control-panel/specs.ts` (A-23 purpose: "6 h chosen" -> "5 h, from petrockhotel.com")
- `src/data/seed/admin-control-panel.ts` (demo audit-log diff kept consistent with the new seasonal rate)
- `src/tenant/locations.ts` (`company.legalName`)
- `scripts/test-pricing.mjs` (fixtures + expectations)

## Before / after

### `seasons`
| Row | Field | Old | New | Source (home.md) |
| --- | --- | --- | --- | --- |
| `sea_summer` | name | Summer peak | Seasonal rates (Easter - Labor Day) | L68 "Seasonal Rates (Easter - Labor Day)" |
| `sea_summer` | starts_on / ends_on | Jun 15 - Aug 31 | **Apr 5 - Sep 7** (2026 dates) | L68-69 |
| `sea_summer` | is_holiday | false | false (unchanged) | — |
| `sea_winter` | name | Winter holidays | Holiday rates (Thanksgiving - New Year's) | L76 "HOLIDAY Rates (THANKSGIVING - NEW YEARS)" |
| `sea_winter` | starts_on / ends_on | Dec 18 - Jan 4 | **Nov 26 - Jan 1** (2026 -> 2027) | L76-77 |
| `sea_winter` | is_holiday | true | true (unchanged) | — |

Note: the two season ids are kept (`sea_summer` = the site's "Seasonal" band, `sea_winter` = the site's
"Holiday" band) so existing references (e.g. the A-24 demo audit-log row id
`rate_rt_penthouse_weekend_sea_summer`) stay valid. Dates are seeded as `${currentYear}-04-05` etc., i.e.
the **2026** dates from the task; Easter and Thanksgiving move every year, so the owner must add/adjust a
season row per year in A-20 (owner question below).

### `rates` (per dog per night; weekday = Mon-Thu, weekend = Fri-Sun)
| Room type | Band | Day kind | Old | New | Source |
| --- | --- | --- | --- | --- | --- |
| Penthouse | base | weekday | $120 | **$135** | L64-65 |
| Penthouse | base | weekend | $135 | **$150** | L66-67 |
| Penthouse | seasonal | weekday | $140 | **$145** | L72-73 |
| Penthouse | seasonal | weekend | $155 | **$160** | L74-75 |
| Penthouse | holiday | weekday | $140 | **$165** | L80-81 |
| Penthouse | holiday | weekend | $155 | **$175** | L82-83 |
| Suite | base | weekday | $85 | **$100** | L94-95 |
| Suite | base | weekend | $95 | **$110** | L96-97 |
| Suite | seasonal | weekday | $100 | **$110** | L102-103 |
| Suite | seasonal | weekend | $110 | **$120** | L104-105 |
| Suite | holiday | weekday | $100 | **$120** | L110-111 |
| Suite | holiday | weekend | $110 | **$130** | L112-113 |

Before, both seasons shared one seasonal price set; the site has two distinct bands, so the seed now maps
each season id to its own price pair.

**`day_kind` semantics checked, no engine change needed**: `dayKind()` in `src/pricing/engine.ts:23` treats
day numbers 0/5/6 (Sun, Fri, Sat) as `weekend`, i.e. Fri-Sun — exactly the site's "Friday - Sunday" split,
with Mon-Thu as weekday. Test asserts Fri = weekend, Thu = weekday.

### `discounts`
| Row | Field | Old | New | Source |
| --- | --- | --- | --- | --- |
| `dis_ph2` | amount_off | $15/dog/night | unchanged — already matches | L86 |
| `dis_ph3` | amount_off | $20/dog/night | unchanged — already matches | L87 |
| `dis_su2` | amount_off | $10/dog/night | unchanged — already matches | L116 |
| `dis_dc` | amount_off | $5 per extra pet | unchanged — matches all three daycare items ($45/$40, $35/$30, $15/$10) | L223-230 |
| `dis_dcp7` | — | (new row) | kind `prepay`, min_nights 7, **5 %**, requires_paid_in_full | L232-233 |
| `dis_dcp14` | — | (new row) | kind `prepay`, min_nights 14, **7.5 %** | L234-235 |
| `dis_dcp21` | — | (new row) | kind `prepay`, min_nights 21, **10 %** | L236-238 |

The `discounts` schema does express a per-room-type, per-dog amount (`room_type_id` + `dog_count` +
`amount_off`, applied per dog per night by `quoteHotel`), so the multi-dog rules needed no change.
The hotel `long_stay` rows (7/14/21 nights at 5 / 7.5 / 10 %) are untouched; the new `prepay` rows are the
**daycare package** discounts, which are a different product (see gaps).

### `daycare_pricing`
| Row | Field | Old | New | Source |
| --- | --- | --- | --- | --- |
| `dc_full` | price | $45 | unchanged | L222-224 |
| `dc_full` | threshold_hours | 6 | **5** | L222 "Full Day (>5 hr.)" |
| `dc_half` | price | $35 | unchanged | L225-227 |
| `dc_half` | threshold_hours | 6 | **5** | L225 "Half Day (<5hr.)" |
| `dc_hour` | price | $15 | unchanged | L228-230 |
| `dc_walk` | price | $12 | unchanged (not on the site; internal item) | — |

**Where the 5 h cutoff lives**: it is *data*, on the `daycare_pricing` rows (`threshold_hours`), editable in
A-23. Three places also carried the old number and were updated: the engine's fallback default
(`src/pricing/engine.ts` `quoteDaycare`, used only when both rows are missing), rule **R-F01**
(`src/rules/pricing.ts`, was "6 h chosen until Justin confirms"), and the A-23 spec purpose string.
All customer/desk/site copy already reads `threshold_hours` from the row, so it follows automatically.

### `packages` (Spa Menu; every price already includes the $12 sanitation fee)
| Package | S | M | L | XL | Giant | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Gold old | 50 | 65 | 80 | 95 | 135 | — |
| **Gold new** | **55** | **70** | **85** | **100** | **140** | L129-145 |
| Platinum old | 65 | 80 | 95 | 115 | 150 | — |
| **Platinum new** | **70** | **85** | **100** | **120** (site $120-140) | **155** | L146-164 |
| Diamond old | 85 | 100 | 120 | 145 | 185 (placeholder, R-G06) | — |
| **Diamond new** | **95** | **110** | **130** | **150** (site $150-175) | **210** | L165-182 |

Also updated: `inclusions` copy now quotes the site's package contents verbatim, and `notes` records the
XL ranges, the cat prices (not seeded — no species column), the "rates are estimates / assessed in person"
disclaimer and the dematting surcharge. Minutes per size are unchanged (the site has no durations).
`fee_sanitation` ($12, `included: true`) left exactly as it was.

### `addons` ("On the Side", L183-201)
| Add-on | Old price | New price | Note |
| --- | --- | --- | --- |
| Furminator | 25 | 25 | unchanged (L184) |
| Medicated Shampoo | 20 (starting at) | **25** (starting at) | "Based on size $25+" (L185) |
| Flea Shampoo | 20 | 20 | unchanged (L186) |
| Frontline Plus | 30 | 30 | unchanged (L187) |
| Spa Facial | 25 | 25 | unchanged (L188) |
| Nail Trim and File | 16 | **18** | L189 |
| Nail Polish | 30 (starting at) | **25** (flat) | L190 — site shows a flat $25 |
| Color / Highlights | 15 | **35** (starting at) | L191 "Starting at $35+" |
| Express Anal Glands (External) | 30 | **15** | L192 "$15/30" = external/internal |
| Express Anal Glands (Internal) | 25 | **30** | L192 (still `employee_type: special employee`) |
| Sanitary Trim | 10 (starting at) | 10 (starting at) | unchanged; site range $10-20 (L196) |
| Ear Clean | — | **25** (new row `add_12`) | L193 |
| Brush Teeth | — | **16** (new row `add_13`) | L194 |
| Face Trim | — | **20** (new row `add_14`) | L195 |
| Face Trim with Sanitary | — | **25** starting at (new `add_15`) | L197 "$25-30" |
| Foxtail Removal | — | **20** starting at (new `add_16`) | L198 "$20-25" |
| Dental Scale / Polish (non-anesthetic) | — | **175** (new `add_17`, special employee) | L199 |
| Transportation | — | **35** starting at (new `add_18`) | L200 "$35-55" — on the menu but not in the task list; added, flag if unwanted |

Ids `add_1`..`add_11` keep their meaning (`scripts/qa-lib.mjs` seeds a draft with `add_1` = Furminator);
new rows are appended as `add_12`+. Added minutes for the new rows are our estimates, not site data.

### Company facts
| File / row | Field | Old | New | Source |
| --- | --- | --- | --- | --- |
| `src/tenant/locations.ts` `company` | legalName | Petrock Hotel LLC | **Petrock Holdings LLC** | `pages/privacy.md` / INVENTORY "Privacy Policy for Petrock Hotel & Spa (Petrock Holdings LLC)" |
| Encino | address / phone / SMS / email / hours | 17401 Ventura Blvd, (818) 817-9451, (818) 406-5196, info@, M-F 7-19, Sa-Su 9-17:30 | **unchanged — all match** | home.md L309-341 |
| Westwood | address / phone / SMS / email / hours | 10946 Santa Monica Blvd, (310) 479-4319, (310) 405-2076, westwood@, M-F 8-18, Sa-Su 8-17:30 | **unchanged — all match** | home.md L309-341 |

### Seed / tests
| Item | Old | New |
| --- | --- | --- |
| `SEED_VERSION` (`src/data/MockProvider.ts`) | 3 | **4** (existing localStorage databases reseed with the new prices) |
| `scripts/test-pricing.mjs` | 120/135, 140/155, 85/95 fixtures; daycare threshold 6 | new rates, holiday band Nov 26 - Jan 1, Gold 55/70/85/100/140, threshold 5, plus two new boundary assertions (5 h = full day, 4.5 h = half day) |

Recomputed expectations: 2 weekday penthouse nights 270 (tax 5.40, total 275.40); Thu-Sun 2 dogs
870 - 90 = 780 (tax 15.60, card fee 30.95, total 826.55); 7-night suite prepaid 730 - 36.50 = 693.50
(total 707.37); holiday week penthouse 1185 with no long-stay discount; Gold L + Furminator 110 -> 112.20.

## Not adopted (schema gap or owner question)

1. **"Holidays — Please Call"** (home.md L70, 78, 84, 98, 106, 114). Every rate block ends with a
   call-for-price line for individual holidays inside a band. The `rates` table has no "call for price"
   state. Not seeded; the holiday *band* rates are. Owner: are single holidays (July 4th, Christmas Day)
   priced above the band rate?
2. **Easter / Thanksgiving move each year.** Seeded with the 2026 dates
   (Easter Apr 5, Labor Day Sep 7, Thanksgiving Nov 26 -> Jan 1 2027) against the current year. A season
   row per year is an owner/A-20 task; there is no rule engine for moveable feasts. Edge case: between
   Jan 1 and the following Thanksgiving the holiday band sits in the future, which is correct, but a stay
   on Dec 31 -> Jan 2 crossing into a new year needs the next year's row.
3. **Daycare prepaid packages** (7/14/21 days at 5 / 7.5 / 10 %). Rows are seeded as `kind: 'prepay'`
   with `min_nights` carrying the package length, but **`quoteDaycare` does not apply them** — there is no
   package-purchase/redemption flow or `daycare_packages` table yet. Engine gap, not a schema gap.
4. **Per-item daycare extra-pet prices.** The site prices the additional pet per item ($40 / $30 / $10).
   That is a flat $5 off each item, which the single `daycare_extra_pet` row expresses exactly today; if
   the owner ever breaks the pattern, `discounts` would need an `item` column.
5. **Grooming price ranges.** Platinum XL $120-140, Diamond XL $150-175, Sanitary Trim $10-20, Face Trim
   with Sani $25-30, Foxtail $20-25, Transportation $35-55, Medicated Shampoo $25+, Color $35+.
   `packages` has one money column per size (no min/max), so the low end is seeded and the range is in
   `notes`; `addons` has `starting_at`, which is used for the add-on ranges. Owner: confirm the low end is
   the right quote to show.
6. **Cat grooming** (Platinum $120-130, Diamond $130-140, L162-163 / L180-181). No species column on
   `packages` and the app is dog-only; not seeded. Owner question.
7. **"Large Dog Accommodation fee may be applicable"** (L88, L118). No amount on the site; `fees` supports
   a flat `other` fee but the value is unknown. Not seeded. Owner question.
8. **Specialty breed cuts & Asian fusion — "please call"** (L179). Kept as a Diamond package note.
9. **Dematting surcharge** (L144, L164, L182) — still R-G09 (requested); no price on the site.
10. **Training & fitness prices** — no table exists (see list below). Not seeded.
11. **Hotel long-stay discounts** (7/14/21 nights, 5 / 7.5 / 10 %, paid in full, no holidays) are **not on
    the live site**; they come from the older design docs and are left as they were. Owner: still current?
12. **Tax 2 % and card fee 3.89 %** are not on the site either; unchanged (R-H03, R-H04).

## Training & Fitness price list (for the docs — no table, not seeded)

From home.md L243-270 ("Training & Fitness Menu"):

- Private personal training, 6-week course (45 min, once a week): **$500** ($83 per class). Courses:
  Puppy/Beginner, Intermediate, Advanced, Clicker — each an individual course.
- 12-week combo course: **$900** ($75 per class) — beginner plus a chosen second track
  (Intermediate / Clicker / Agility).
- Seminars (Puppy/Beginner, Intermediate, Advanced), 45 min session: **$95**. Workshops: Sit/Down,
  Loose-leash Walking, Potty Training, Crate Training, Behavioral Substitute, Wait/Leave it, Sit/Stay.
- Agility course: **$125** for a one-hour session, or **$660** for a six-week course ($110 per class).
- Consultations (30 min, one-on-one): **$70**. Puppy consult includes a small bag of puppy food, chew toy,
  pee pads and a free Gold grooming service; adult consult includes "Stop That" spray and training treats.
- Canine Good Citizen course: available, price not published ("ask about").
- Note: "additional fees apply for distances further than 5 miles" (in-home training).

To adopt these later we would need a `training_courses` / `training_sessions` pair (course, length,
sessions, price, per-class price, includes) plus a `quoteTraining` path, or a generic `services`
catalogue with a price and a session count.
