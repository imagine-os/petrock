# 0027 - Figma fidelity part (c): front desk shell, tables, timeline, KPI cards, desk forms

version: 0.2.0
date: 2026-09-18
prompt: 0010 (Justin: "get the design to actually look closer to the artwork ... fix this at the design system level"), branch `fidelity/frontdesk-shell`
intent: Land the front desk exports (`front desk*.jpg`, `all reservation grooming*.jpg`, `front desk-4.jpg`, `employees.jpg`, `Booking details*.png`) on the shared shell and components so every desk / owner page inherits them: sidebar rhythm, top-bar "New Booking", 24/700 page titles, framed white table container with ONE purple head and group rows, dot-less tinted badges, KPI cards with the purple icon square, Figma timeline grid, 40 px r4 desk form fields.
decision: Group rows live INSIDE the DataTable (`groupBy`) instead of one table per Section (Figma 598:23540). Filters move into a `FilterPopover` tool button (Figma "Filters") so the toolbar is one row; every filter is kept. The D-014 expand-all / collapse-all and rail controls stay but as small icon buttons in the sidebar logo row (Figma has none); the page-code pill (`PageHeader.code`) renders in dev mode only. The F-13 legend row is removed (Figma has none; the status is in the block popover). Desk `StatusBadge` fill has no dot (598:23563). KPI `StatTile` follows `front desk-4.jpg` (purple 40 px icon square, 28/700 value, hint under a hairline), not the audit's icon-less guess. Timeline blocks use the existing `--status-*-bg` tokens until the Figma flat hues are added to `tokens.ts` (see "Token changes needed").
rejected: hand-rolling a checkbox in the table (reuses `Checkbox`, sized 14 px in the cell); editing `tokens.ts` from this branch (reported instead); dropping the location switcher (binding rule); removing the F-01 KPI strip (Figma has no "today" page; the strip now wears the `front desk-4.jpg` card skin).
files: src/components/organism/{Sidebar,TopBar,DataTable,RoomTimeline,AdminBarChart}, template/DesktopShell, molecule/{PageHeader,StatTile,FilterPopover (new)}, atom/{Button,Badge,StatusBadge,Input}, src/modules/frontdesk-reservations/{ReservationsTablePage,TimelinePage,TodayPage,lib/columns.tsx,frontdesk-reservations.css,specs.ts}, src/modules/frontdesk-grooming-people/pages/GroomingAgendaPage.tsx, docs/pages/{F-10,F-13}.md, docs/screenshots/{F-01,F-10,F-13,F-32,A-01,F-11,F-51}, docs/kanban.md
codes: F-01, F-10, F-13, F-32, A-01, F-11, F-51 (shell: every F-xx / A-xx / D-xx / docs page)

## What changed

- **Sidebar** (`front desk.jpg`): logo row with the D-014 expand / collapse-all and rail controls as hover-revealed icon buttons; letter-spaced grey group labels (chevron on hover only); items 44 tall on a 50 px rhythm with 24 px icons and 16 px labels; purple text + icon active state; `#D8D9D9`-class divider between groups (`--color-border-card`); Log Out footer 30 px inset.
- **TopBar**: "New Booking" 172x47 text button (icons dropped, as the export shows); label collapses to "+" only under 1024 px.
- **DesktopShell**: content-area field skin `--h-field` 40 / `--r-field` r4 / `--color-border-field` `#B6B6B6` / 14 px `#181818` labels (`Booking details*.png`, `Frame*.png`) - the top-bar search keeps r8 `#EDEDED`. `Input.css` gained `--fs-field-label`, `--color-field-label`, `--lh-field-label`, `--h-field` hooks.
- **PageHeader** (`employees.jpg`): title Open Sans 700 24 `#181818`, actions vertically centred, code pill dev-only.
- **DataTable** (598:23508..23564, `front desk.jpg`): `framed` (white container, padding 10, desk shadow, square head), `title`, `groupBy` (group rows "ARRIVING (34) ▾" 14/600 `#808080` with caret, collapsible, `showEmpty` / `emptyText` / `defaultCollapsed`), `selectable` (14 px head / row checkboxes, "k selected" foot), sort glyph shown on hover / when sorted only; card fallback handles group rows and the frame.
- **Badge / StatusBadge**: desk `fill` variant without the dot, 73 px min width (598:23563); `pill` keeps the dot.
- **StatTile** (`front desk-4.jpg`): 40 px purple icon square + 16 px label, 28/700 value, hint under a `#F1F1F1` rule, r8, desk shadow. `AdminBarChart` series 1 = `--color-primary`.
- **RoomTimeline** (`all reservation grooming.jpg`, `front desk-9.jpg`): full week-range headers ("Sunday, June 1, 2024 - Saturday, June 7, 2024"), 54 px day heads (DOW 12/600, number 14/600, weekends `--color-success-strong`, black TODAY pill), alternating white / `#EEF2F5` day columns, dashed today line, grey group rows with caret, 54 px room rows with a 32 px grey disc (sub-label moved to a tooltip), flat square blocks in the status hue with dark text, flag icons left and a clock right, no left status bar / shadow / radius.
- **Button**: new `outline` variant (white, `#DFDFDF` hairline, 14/400 dark text) for the desk tool buttons "Filters" / "See All" / "Agenda View".
- **FilterPopover** (new molecule): outline "Filters" button with the filter glyph, active count badge, Clear link, popover panel for Select / Toggle / Input controls; Escape / outside click close it.
- **F-10**: top line (view switch, "+ Hotel Reservation"), then one framed table (title, day nav, Filters, See All / By day) with the five group rows inside; 18 columns flat (no "Stay / Pets / Contact / Money" tier), cell tones per column (`RESERVATION_COLUMNS_FLAT`), checkboxes.
- **F-13**: top line (view switch, New Booking), range pill centred with the span switch and Filter popover right; legend removed.
- **F-01**: reservations table framed; status-colour legend line removed; KPI strip in the new card skin (220 px min columns).
- **F-32**: framed table titled "Grooming Agenda".
- **Verification**: `npm run typecheck` + `npm run build` green; screenshots regenerated for F-01, F-10, F-13, F-32, A-01, F-11, F-51 (390 / 1280, dark for F-01 / A-01), no console errors; `qa:responsive` on the touched codes (see the commit body).

## Token changes needed (not made here - `tokens.ts` is off-limits on this branch)

- Timeline flat fills from the export (`all reservation grooming.jpg`): confirmed `#B4F0A0`, checked_in `#7A7CE3`, checked_out `#FFF0B3`, pending_vaccines `#C9A6E9`, requested `#D18ACF`, daycare `#00D8D8` - as `--timeline-<status>-fill` (or a `timelineHues` map next to `bookingHues`) with dark-mode derivations; `RoomTimeline.css` then swaps `--status-*-bg` for them.
- Desk table badge hues seen in `front desk-9.jpg`: "Future" green `#DFF5E3` / `#27B14E`, "Checking In" blue `#E3F0FF` / `#1456F5`, "Checked Out" amber `#FFF3E0` / `#FF7A00` - today `confirmed` is green, `checked_in` pink, `checked_out` mint; if Justin wants the export hues, `bookingHues.checked_in` should move to the blue pair.
- Sidebar group divider `#D8D9D9` (currently `--color-border-card` `#D8DADE`, 1 step off) and timeline hairline `#D9D9D9` (currently `--color-border-row` `#D4D4D4`): a `--color-border-grid` token would remove both approximations.
- `--h-field` 40 for desk forms exists only as a shell-scoped custom property; a `h-control-field` layout token would make it first-class.

## Remaining gaps vs the exports

- F-10 export shows every status as "Completed" mint and "#1" ids; we show the real lifecycle badges and codes (vocabulary rule).
- Timeline: no "SORT" control (no sort semantics defined); Suites group rendered only when rooms exist; block hues approximate until the tokens above land.
- Sidebar menu items come from routes (Today / Dashboard / Table / Timeline ...), not the export's Dashboard / All Reservations / Grooming / Day Care / Customer & Pets / Walking / Employees / Tasks / Reviews / Education / Finance / Reports / Settings list; sub-items (Groom / Broad / Day Care) are not modelled.
- Top bar keeps the location switcher (binding rule; Figma has none) and the theme / brand controls in the user menu.
- Booking / Customer forms keep their page layout (Sections in the canvas) rather than the export's modal-over-table presentation; the field skin matches.
