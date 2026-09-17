# 0006 - Screen catalog, entities, components and rules from the Figma export

version: 0.0.6
date: 2026-09-17
prompt: 0004
intent: Turn Justin's Figma export drop 1 (238 files, D-017) into build-ready documentation: a complete screen catalog, the entities and fields the screens imply, a component inventory, a seed list for the business rules registry, and the merged open questions. Record the 19:33 UTC follow-up (D-018).
decision: D-018 (messaging and auth flows may be improved beyond the hand-designed Figma screens using current best practices) decided. D-017 updated with the actual drop contents (238 files: 124 png, 60 jpg, 29 svg, 25 pdf; no .fig; mostly 1x) and marked "screen catalog written"; drop 2 (Design System page, .fig) still pending.
rejected: Guessing Figma node ids (deferred to the second pass after the quota resets, or the .fig); treating the `Frame 11712764xx` two-ups as light/dark pairs (readers confirmed every pair is two light variants, so INVENTORY.md's "light + dark" note is superseded by the catalog); dropping duplicate exports from the catalog (kept, collapsed under a canonical entry, so every one of the 238 files is indexed); assigning final rule ids or statuses beyond "seen in design" (Justin has not confirmed any rule yet); writing per-page `pages/<CODE>.md` docs (no app code exists yet).
files: docs/figma/screen-catalog.md (new), docs/data/entities-from-designs.md (new), docs/design/components-from-designs.md (new), docs/rules/business-rules-from-designs.md (new), docs/figma/open-questions.md (new), docs/decisions.md, docs/kanban.md, docs/README.md, docs/figma/README.md, docs/prompts/0004-figma-export-and-responsiveness.md, docs/changelog/0006-screen-catalog.md
codes: n/a

## What changed

- **docs/figma/screen-catalog.md (new, ~290 KB)**: intro (source, scale, method), one section per platform with subsections per flow, one entry per distinct screen (title, file link with dimensions, embedded thumbnail, description, layout, fields, actions, components, states, rules/notes, variants among duplicates), a "second Figma pass" list and a full file index. Counts: **109 distinct screens from 238 files** - customer mobile app 54 (89 files), front desk web 20 (75), owner/admin web 24 (34), shared & reference 11 (40, including the 29 svg icons as one entry). 3 screens flagged illegible (`Frame 1171276424.png`, `Form fields.pdf`, `front desk-3.jpg`) plus 16 svg icons not viewed individually.
- **docs/data/entities-from-designs.md (new)**: 27 entity groups plus a contradictions section (Customer, Pet, Vaccination record, Vet, lookup lists, Location, Company/brand, Room type and room, Hotel booking, booking sub-tables, medical questionnaire, Grooming appointment, Grooming package / add-on / groom style, Daycare, line items / estimate / invoice, Payment, Tax, Discount and capacity rules, statuses, Employee / role / PIN, Notification, Conversation, Review, Reminder / pet note, Agenda item, Settings entities, Dashboard KPI) with every field seen and its screens; single-surface fields flagged; 15 cross-surface contradictions listed.
- **docs/design/components-from-designs.md (new)**: ~135 component rows in 9 groups (shell/nav, buttons, inputs, cards, tables, calendar/scheduling, overlays, messaging, brand/icons) with where used and variants/states drawn, plus a gaps list (dark theme, form states, empty states, board view, filters, confirmations, phone layouts for tables/timelines).
- **docs/rules/business-rules-from-designs.md (new)**: 158 rows `R-A01`..`R-M15` in 13 areas plus a copy bank; every row has value/copy, source screen and status `seen in design`; conflicts recorded as their own rows (daycare 5 h vs 6 h, card fee 3.8 vs 3.89 %, room prices, package prices, tax model, status vocabularies).
- **docs/figma/open-questions.md (new)**: 118 de-duplicated questions in 15 flow groups, build-blocking ones marked.
- **docs/decisions.md**: D-017 rewritten with the real drop contents and "screen catalog written"; D-018 added (decided).
- **docs/kanban.md**: "Screen catalog from exports" moved to Done; Backlog gains "Second Figma pass: illegible screens + node-id mapping", "Answer the open questions with Justin", "Seed the rules registry".
- **docs/README.md**: folder table gains `data/` and `rules/`, and `design/` / `figma/` rows list the new files. **docs/figma/README.md**: files list gains the catalog and open questions. **docs/prompts/0004**: Response updated (reply to Justin still to be posted from the thread).

## Findings worth carrying forward

1. **No dark-mode screens exist.** Every `Frame 11712764xx` two-up is two light variants (Figma design vs an implemented build, or two layouts). The Dark mode toggle (`setting.jpg`) still demands a dark theme (D-007), designed in code.
2. **The 15 numbered PDFs are the owner Control Panel (Draft)** (D-002): brand, company, locations with weekly hours, boarding charge rules (by Day/Night/Hours, first/last-day multipliers, minimum charge), email/SMS providers, form/general/grooming/invoice/tax/permissions settings, spa and hotel/daycare setup, employee setup. Copied from PetLinx; several options do not fit a web app.
3. **The richest rule source is `front desk-7.jpg` / `13.pdf`**: room rates per 24 h (Penthouse $120/$135, seasonal $140/$155; Suite $85/$95, seasonal $100/$110), capacities per location (Encino/LA: penthouses 12/20, suites 42/16, daycare 20/15, grooming 2/2), "Dogs over 30lbs can only fit in bottom 6 rooms", multi-dog discounts ($15/$20/$10 off per dog per night), long-stay 5/7.5/10 % if paid in full and not holiday, 3.89 % card fee in-app, daycare $45/$35/$15/$12 with $5 off per additional pet.
4. **Manager PIN gate on booking status changes** ("You Will Get A PIN CODE From Manager To Change The Status") confirms the PIN approval popup on the kanban; which transitions need it is open.
5. **Booking status vocabulary differs on every surface** (timeline: Future / Checked In / Checked out and Complete / Canceled / No Show; tables: Future / Checking In / Checked Out / Completed; detail: Confirm; customer: Pending Verification / Upcoming). One lifecycle must be defined before the hotel journey is built.
6. **Vaccine lists differ per surface** (customer: Distemper/Parvo, Bordetella, Rabies + Lepto, Influenza; front desk: DHPP, Leptospirosis, Bordetella, Rabies; legacy: Bordetella, Canine Influenza, DHPP) and upload patterns differ (per vaccine vs one multi-file upload). Reservations stay Pending until vaccines are verified.
7. **Numbers in the mocks do not reconcile** (Estimate $31 + $1.09 = $232.09; grooming $50 + $200 -> $500, tax $64, total $565; daycare 4 h priced as full day) and prices conflict between customer app and settings (rooms $150/$105 or $115 vs $120-$155/$85-$110; Platinum $65-$150 on the spa card vs Gold prices in settings). Pricing must come from the settings tables, not the mobile mocks.
8. **The Add Pet wizard is unresolved** (2-step stepper, three step screens, questions duplicated between steps, personality radio vs dropdown, meals 'AM & PM' vs '1', weight lbs vs Kg); and **Daycare scope is contradictory** ('Coming Soon' screen vs full reservation flow; D-003).

## Verification

- Coverage script: all 238 export files appear exactly once in the catalog data (0 missing, 0 extra, 0 double-listed); the file index lists 238 rows; dimensions come from `export-list.json`.
- Image links are relative (`exports/petrock-main/...`, URL-encoded) and were checked against the files on disk.
- Docs follow `docs/README.md` conventions: decision rows appended (D-017 edited in place as its status is still in progress, D-018 new), kanban cards moved not deleted, numbered files not renumbered. No app code.

## Follow-ups

- Second Figma pass (kanban): re-read the 3 flagged screens and 16 unviewed icons, map all 238 files to node ids, confirm the approved side of each two-up.
- Take the build-blocking open questions to Justin; record answers as decisions and update the rules registry statuses.
- Post the prompt 0004 reply in the Slack thread (summary of the catalog and the eight findings).
- Drop 2: Design System page export and `.fig` (D-017).
