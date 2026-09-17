# 0005 - Figma export drop 1 and responsiveness decision

version: 0.0.5
date: 2026-09-17
prompt: 0004
intent: Save Justin's first manual Figma export (`Petrock Main.zip`, Slack 2026-09-17 19:29 UTC) into the repo with a full inventory, and record his standing requirement that everything is responsive.
decision: D-016 (everything responsive, not limited to designed sizes; responsiveness checked on every page as definition of done; kanban/timeline may degrade gracefully on phones) decided. D-017 (Figma exports: Drop 1 received and inventoried; Design System page export of 6223 items and .fig pending) in progress.
rejected: Committing the zip itself (unzipped with folder structure instead, per the exports README); renaming Figma's default export names (kept verbatim so they can be matched back to the file); guessing content of the 15 unlabeled vector PDFs beyond frame-size matching (text is glyph-encoded; left as "verify"); treating this drop as the 2x export requested (it is mostly 1x, noted, not re-requested yet).
files: docs/figma/exports/petrock-main/ (238 files + INVENTORY.md + export-list.json), docs/figma/exports/README.md, docs/prompts/0004-figma-export-and-responsiveness.md, docs/decisions.md, docs/project-brief.md, docs/kanban.md, docs/changelog/0005-figma-export-drop-1.md
codes: n/a

## What changed

- **docs/figma/exports/petrock-main/ (new)**: the unzipped export, original names and folders (`Iconly/Two-tone/`, `sidebar/`). 238 files, 71.7 MB: 124 png, 60 jpg, 25 pdf, 29 svg. No file exceeded the 95 MB limit, none skipped. No `.fig` in the drop.
- **docs/figma/exports/petrock-main/INVENTORY.md (new)** and **export-list.json (new)**: per-file type, size, pixel/point dimensions, guessed platform, guessed flow group, scale and a content note. Groups: mobile 89 (Home + Add pet 26, Boarding 21, Settings & Profile 13, two-up light/dark pairs 12, Credit card 6, Daycare 6, Chat 3, Grooming 1, Onboarding 1); front desk 109 (Add forms 26, Boarding table 18, Timeline 16, Grooming agenda 12, other 12, unlabeled PDFs 11, Control Panel 10, Message 2, Grooming 1, Section overview 1); shared assets 32; reference 7; unknown 1.
- **docs/figma/exports/README.md**: dated "Drop 1" entry with source, counts, scale and groups.
- **docs/prompts/0004-figma-export-and-responsiveness.md (new)**: Justin's message verbatim; Response pending the screen catalog.
- **docs/decisions.md**: D-016 (responsiveness), D-017 (export drops).
- **docs/project-brief.md**: Responsiveness paragraph (D-016) under the design system section.
- **docs/kanban.md**: Done "Figma export drop 1 received"; Backlog "Screen catalog from exports" and "Responsive QA checklist per page (D-016)".

## Findings worth carrying forward

- Exports are 1x (mobile 390 wide, front desk 1440 wide), except `Message Support*` and a few front-desk frames at 2x. Fine for layout reference; table text is small.
- The `Frame 11712764xx` PNGs are side-by-side light + dark pairs of mobile screens: evidence the dark theme was designed (D-007).
- Five `image 1xx.png` / `cloud1-*.png` files are screenshots of the current legacy desktop software (customer, pet, booking and groom-booking forms): useful for the data model and the front-desk form fields.
- `Spa 12.7 2.png` is the spa price card (Gold / Platinum / Diamond Groom by size S-Giant): seed for the service catalog and pricing rules (D-006).
- No kanban / board view for grooming in this drop (D-008); 15 numbered PDFs and one long strip remain unlabeled.

## Verification

- `python3` PIL read every png/jpg; svg viewBox and PDF MediaBox parsed by regex; counts in INVENTORY.md match `find | wc -l` (238).
- Docs follow the header conventions in `docs/README.md`; decision rows appended, none renumbered. No app code.

## Follow-ups

- Screen catalog: map every export to a Figma node id and flow (second API pass after ~Sep 22, or the .fig) and answer prompt 0004.
- Receive the Design System page export and the .fig (D-017); ask for 2x PNGs of the front-desk tables if legibility matters.
- Responsive QA checklist per page (D-016) once the build starts.
