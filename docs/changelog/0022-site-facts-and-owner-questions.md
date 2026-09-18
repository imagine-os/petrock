# 0022 - Site facts in the seed, room decisions D-185..D-187, owner question list

version: 0.1.0
date: 2026-09-18
prompt: 0008
intent: Justin (13:45 UTC) asked for a list of questions for the owner, noted that suites are smaller than penthouses, that each penthouse has a theme (music genre or art style, e.g. rock, pop, Andy Warhol) and must carry its name in the system, and said to look at petrockhotel.com first for pricing and facts. Fact-find the site, adopt what it settles into the seed, log the room notes as decisions, post the owner list and keep it in the repo.
decision: D-185 (suites smaller than penthouses; Suite copy = penthouse minus TV, D-067 superseded), D-186 (penthouses themed and named in the system; `display_name` / `theme` column and per-location names pending the owner), D-187 (petrockhotel.com is the first source for pricing and business facts; adopted Westwood address and hours, real phones / SMS / emails, Suite and Penthouse copy, $12 grooming sanitation fee included in the price, estimate disclaimer).
rejected: changing the `rooms` schema now (theme names unknown; kanban item instead); adding the $12 sanitation fee to quote totals (the site says it is inside the groom price, so `quoteGrooming` is untouched and `npm run test:pricing` stays green); fetching the Squarespace mirror or a cache to get around the proxy denial (policy denial is reported, not routed around); keeping one hours object for both locations.
files: src/tenant/locations.ts, src/data/schema/core.ts (locations sms_phone / email; fees kind grooming_sanitation, amount, applies_to grooming, included), src/data/seed/core.ts (locations, room_types copy, fee_sanitation), src/data/MockProvider.ts (SEED_VERSION 3), src/pricing/engine.ts (FeeLike type only), src/modules/customer-grooming-daycare/strings.ts (cgd.groomingEstimateNote), src/modules/customer-grooming-daycare/GroomingCheckoutPage.tsx, src/modules/admin-control-panel/PricingPages.tsx (A-22 shows flat amount / included), supabase/schema.sql + docs/data-model.md (npm run sql), docs/decisions.md, docs/reference/petrockhotel-site.md (new), docs/prompts/0008-open-questions-qa.md, docs/pages/C-54.md, docs/kanban.md, docs/screenshots/{C-31,C-54,A-22}/*.jpg, docs/changelog/0022-site-facts-and-owner-questions.md
codes: C-31, C-54, A-22

## What changed

- **Locations** (`src/tenant/locations.ts`, seeded into `locations`): Westwood address 10946 Santa Monica Blvd, Los Angeles, CA 90025 (was the placeholder 10900 Wilshire Blvd 90024); phones Encino (818) 817-9451 and Westwood (310) 479-4319 (were 555 placeholders); new optional `smsPhone` / `email` (Encino (818) 406-5196, info@petrockhotel.com; Westwood (310) 405-2076, westwood@petrockhotel.com) with matching nullable `sms_phone` / `email` columns on `locations`; Westwood gets its own hours (Mon-Fri 8:00-18:00, Sat-Sun 8:00-17:30), Encino keeps Mon-Fri 7:00-19:00, Sat-Sun 9:00-17:30. Code comment: from public listings 2026-09-18; verify with owner (Q13 Sunday).
- **Room-type copy** (`room_types.description`, seed only): Suite = "Premium bed, toys during the day, potty pads, room service, playtime, 2 walks per day, photos and videos every night of the stay, bedtime tuck-in and tummy rub." (no TV, smaller than a penthouse; D-185). Penthouse gains "toys during the day" and "photos and videos every night of the stay". Shown on C-31 and everywhere the table is read.
- **Fees**: new row `fee_sanitation` "Grooming sanitation fee", kind `grooming_sanitation`, amount $12, `applies_to: grooming`, `included: true`. Schema gains `amount` (money, nullable) and `included` (bool) and the two enum values; `FeeLike` in the engine widens its types only. Every quote path still looks for `kind === 'card'`, so no total changes. A-22 renders a flat amount with "(included)" instead of "0%" and offers the new kind in the form.
- **Grooming disclaimer**: string `cgd.groomingEstimateNote` ("Grooming rates are estimates; pets are assessed in person for the final rate.", with Spanish) under the quote lines on C-54.
- `SEED_VERSION` 2 -> 3 so existing localStorage databases pick up the new location, room-type and fee rows.
- **Docs**: D-185..D-187 appended, D-067 set to `superseded by D-185`; `docs/reference/petrockhotel-site.md` (site facts with URLs, before / after diff, access caveat, the 15 owner questions); prompt 0008 running log extended with the 13:45 / 13:53 UTC exchange verbatim and an owner-questions section with a question-to-decision map; kanban items for the rooms theme column and for verifying the facts on the live site; screenshots regenerated for C-31, C-54, A-22 (390 and 1280, no console errors).

## Verification

`npm ci`, `npm run sql`, `npm run build` (tokens + tsc + vite) and `npm run test:pricing` ("all assertions passed") on this commit. `npm run screenshots -- --codes=C-31,C-54,A-22`: 3 routes, no console errors, 6 files.

## Next

Owner answers arrive through Justin in the same thread: each becomes a decision row (D-188 onward). Q1-2 unblock the `rooms.display_name` / `theme` column and the per-location penthouse names (D-186). Re-check every adopted fact against the live petrockhotel.com once an org owner allows the domain (D-187).
