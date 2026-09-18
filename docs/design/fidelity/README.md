# Figma fidelity composites

Side-by-side pairs: **left** the Figma export (`docs/figma/exports/petrock-main/`), **right** the app captured by `node scripts/fidelity-shots.mjs` at the same width (390 for the customer app, 1440 for the desk). Built by `python3 scripts/fidelity-composite.py --label=<label>`; scores in `scores.json`.

Similarity is a rough 0..1 index = mean of (a) block SSIM on a blurred 64 px greyscale thumbnail (layout structure), (b) global SSIM (tone), (c) 512-bin colour histogram overlap, over the shared height. It rewards colour and block layout; it does not read text. The `before` column for C-10, C-13, C-30, C-33 and C-70 came from a full-page capture with the fixed bottom nav / footer overlapping mid-page; from round 1 the capture grows the viewport to the content instead, so those five `before` values are pessimistic by a few hundredths (C-10 reads 0.70 -> 0.63 only because of that change).

| Pair | Export | Before | After | Composite | Top remaining deltas (by eye) |
| --- | --- | --- | --- | --- | --- |
| C-10 | `Home Page.png` | 0.70 | 0.63 | [C-10.png](C-10.png) | Hero is the placeholder logo card, not the pool photo (no licensed asset in the exports); pets / booking cards ~10 px wider than the frame; content 873 vs 844 tall. |
| C-10-empty | `Home Page-2.png` | 0.78 | 0.78 | [C-10-empty.png](C-10-empty.png) | Same hero gap; otherwise the band structure matches within 6 px. |
| C-10-gate | `Home Page-5.png` | 0.38 | 0.70 | [C-10-gate.png](C-10-gate.png) | Figma alert card sits ~30 px lower and its Back column is tinted; app scrim now 0.20 and Back in primary text. |
| C-13 | `Pet Profile (Single Pet).jpg` | 0.44 | 0.58 | [C-13.png](C-13.png) | No iOS status bar (44 px offset shifts every block up); Reminder card shows an icon instead of the pet photo; extra rows (Vaccines, Care, Emergency, Remove) below the Figma three notes. |
| C-14 | `Pet Edit.png` | 0.64 | 0.64 | [C-14.png](C-14.png) | Edit Pet keeps the real 5-step stepper (Figma Add Pet shows 2); no Weight select; "Save changes" link under Next; avatar shows initials. |
| C-30 | `Hotel Reservation.png` | 0.41 | 0.60 | [C-30.png](C-30.png) | Share-a-room is a select with a hint (Figma text input); extra Location select; calendar arrows are chevrons; Next sits above the nav instead of the frame bottom. |
| C-33 | `Frame 1171276428.png` | 0.41 | 0.38 | [C-33.png](C-33.png) | Export is a component two-up (Choose Pet / Choose Package with coral prices and check discs); the app keeps the per-pet radio-card list + add-ons + summary. Structural rebuild pending. |
| C-70 | `profile.jpg` | 0.47 | 0.51 | [C-70.png](C-70.png) | Row labels are Be Vietnam Pro 500 navy per setting.jpg (profile.jpg renders regular grey); extra Payment / Notifications / Front Desk Chat rows; initials avatar. |
| F-01 | `front desk-4.jpg` | 0.58 | 0.59 | [F-01.png](F-01.png) | F-01 is the "today" desk, not the owner dashboard the export shows: 9 KPI cards in two rows, no revenue chart or schedule calendar; table has real statuses. |
| F-10 | `front desk.jpg` | 0.82 | 0.82 | [F-10.png](F-10.png) | Real lifecycle badges and codes vs all-"Completed"/#1; five short groups (seed) vs 34/18/18 rows; view switch + day nav added to the toolbar. |
| F-13 | `all reservation grooming.jpg` | 0.47 | 0.59 | [F-13.png](F-13.png) | Group rows are full-width grey (Figma greys only the label cell); toolbar keeps the Table/Timeline/Board switch and 1 week / 2 weeks chips; fewer rooms and bookings in seed; no SORT. |
| A-01 | `front desk-4.jpg` | 0.50 | 0.54 | [A-01.png](A-01.png) | Owner layout differs by design (occupancy + attention columns, schedule list); chart is stacked card/cash with the real 30-day series; KPI cards now all white like the export. |

## What the two rounds changed

- Round 1 (shared / tokens): `--color-scrim-soft` 0.20 for `Modal size="alert"` (Home Page-5 overlay was 0.80); `--color-grid-alt #CDD2D8` / `--color-grid-alt-head #B1B8C2` for the RoomTimeline alternating columns; `--color-field-fill #F4F6FA` for the StayDatesCard fields; group rows on `--color-border-grid`; timeline blocks on the new `--timeline-<status>-fill` tokens; A-01 KPI cards all white.
- Round 2 (components / pages): alert footer `Back` in primary text; phone calendar chromeless inside StayDatesCard; capture grows the viewport to the content so fixed footers sit under it like the Figma frames.

## Regenerate

```
npm run build && node scripts/fidelity-shots.mjs && python3 scripts/fidelity-composite.py --label=after
```

`_shots/` holds the raw app captures. Pillow + numpy are needed (`pip3 install pillow numpy`).
