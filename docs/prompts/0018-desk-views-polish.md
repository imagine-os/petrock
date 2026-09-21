# 0018 - Front-desk hotel and grooming views polish: one card, one board, calm timeline and day grid

date: 2026-09-21 00:03 UTC · from: Justin Massion (Slack thread https://playsetllc.slack.com/archives/C0C2PP1NRPE/p1789937344275589) · surface: front desk hotel and grooming views (F-10, F-13, F-14, F-30, F-31, F-32), component library, tokens · follows: prompts 0013 (desk fidelity), 0017

Models: Fable 5.1 (review of the current views, design brief, docs), Opus 5 (build).

## Prompt (verbatim)

Justin: "Clean up the look and feel of the grooming views and hotel views for things like the timeline and Kanban board and point of views"

## Response

The hotel and grooming views are cleaned up and live (Fable 5.1 reviewed the current screens and wrote the brief, Opus 5 built it): room timeline https://imagine-os.github.io/petrock/#/desk/reservations/timeline , grooming day view https://imagine-os.github.io/petrock/#/desk/grooming , grooming board https://imagine-os.github.io/petrock/#/desk/grooming/board , Grooming & Spa board https://imagine-os.github.io/petrock/#/desk/reservations/board , agenda and the reservations table.

- One card design everywhere (ScheduleCard): status stripe, time, pet and breed, customer, package and add-on chips, alert chips only when they apply, and one "more" menu per card instead of a "Move to" select under every card. PIN-gated moves show a lock.
- One board organism for both Kanban boards: status dot, count, collapse, columns that scroll sideways with a visible scrollbar and edge fade, compact empty columns, KPI tiles on one row.
- Timeline: light grid with weekends marked in the header, group rows grey only in the label cell, sticky day header and room column, a thin dashed today line, rounded bars with a dark left edge, a "…" chip for one-night stays, and a booking popover on click, Enter or hover.
- Grooming day view: white groomer heads with an initials disc in a muted groomer hue, light working-hours tint, faint half-hour lines, overlapping appointments side by side in lanes, a current-time line, and a legend row.
- Agenda and table: numbers and times no longer look like links, group rows carry a count badge, the purple header stays (D-216).
- Before/after captures for the six pages are in docs/screenshots/<CODE>/1280-before.jpg and 1280.jpg (the screenshot diff at /#/dev/qa/screenshots shows them side by side).

"Point of views" was read as the different views (table, timeline, board, day, agenda). If you meant the per-role views (front desk vs manager vs groomer), say so and that is the next pass.

Docs this turn: prompt 0018, changelog 0032, decisions D-231..D-235, kanban, page docs F-10, F-13, F-14, F-30, F-31, F-32, surfaces.md, v0.3.1.
