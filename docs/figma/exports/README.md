# Figma exports

Manual exports from the **Petrock Main** Figma file (`3UXEOzU9ORGm5mInQqhiUW`), supplied by Justin instead of a paid Figma plan (D-012, prompt 0003). The API caps reads on Starter-plan files regardless of the caller's seat, so visuals come from here and text-level reads come from the API after the quota resets (~2026-09-22).

## What goes here

| File / folder | Content | How it was exported |
|---|---|---|
| `section-22-*.png` | Section 22 (`1841:50551`), customer mobile app | Page new(justin + Mark), select Section 22, Export as PNG at 2x |
| `section-14-*.png` | Section 14 (`1813:146926`), front desk web | Page new(justin + Mark), select Section 14, Export as PNG at 2x |
| `design-system-*.png` | Design System page (`58:118`), reference input only (D-015) | Design System page, select all, Export as PNG at 2x |
| `Petrock-Main.fig` | Full local copy of the file | File menu > Save local copy |

Keep Figma's default export names where practical, prefixed with the section as above. If a zip is uploaded instead, unzip it here and delete the zip.

## Rules

- Exports are **derived reference material**, not the design system; the code design system is built fresh (D-007, D-015).
- Large binaries: keep PNGs at 2x only (no 3x/4x). If the `.fig` exceeds GitHub's 100 MB file limit, note where it lives (Slack thread or Drive) in this README instead of committing it.
- Record every drop of new exports in a changelog entry (`docs/changelog/`).

## Drops

### Drop 1: `petrock-main/` (2026-09-17)

- **Source:** Slack upload `Petrock Main.zip` (68.3 MiB) by Justin, #petrock-hotel, 2026-09-17 19:29 UTC (prompt 0004). Unzipped here with the original folder structure (`Iconly/Two-tone/`, `sidebar/`); the zip itself is not committed.
- **Contents:** 238 files, 71.7 MB: 124 png, 60 jpg, 25 pdf (vector page exports), 29 svg icons. **No `.fig`** in this drop. Nothing exceeded the 95 MB limit, so **no files were skipped**.
- **Scale:** mobile frames at 1x (390 wide; `Message Support*` at 2x), front desk at 1x (1440 wide; a few 2x at 2880), not the 2x export this README asks for. Good enough for reference; a 2x re-export of the tables would help legibility.
- **Groups (guessed from names, sizes and thumbnails):** mobile 89 (Home + Add pet 26, Boarding 21, Settings & Profile 13, two-up light/dark pairs 12, Credit card 6, Daycare 6, Chat 3, Grooming 1, Onboarding 1); front desk 109 (Add forms 26, Boarding table 18, Timeline 16, Grooming agenda 12, Front desk other 12, unlabeled numbered PDFs 11, Control Panel 10, Message 2, Grooming 1, Section overview 1); shared assets 32 (icons, logos); reference 7 (legacy software screenshots, spa price card, storefront photo); unknown 1.
- **Inventory:** `petrock-main/INVENTORY.md` (per-file dimensions, group, scale, notes) and `petrock-main/export-list.json` (machine-readable, same fields).
- **Still pending:** Design System page export (Justin: 6223 items, exporting; D-017) and the `.fig` local copy.
