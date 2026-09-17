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
