# Module prompt - frontdesk-grooming-people (F-30..F-59)

date: 2026-09-18
from: build orchestration (prompt 0005 "Please build the whole thing", module fan-out)
branch: module/frontdesk-grooming-people

## Prompt (summary of the computed task)

Build the module `frontdesk-grooming-people` (page codes F-30..F-59) in its own worktree against the foundation on `main` (f03e9dd): front desk grooming agenda list (day agenda by groomer, statuses, line items), groom booking form, customers list / detail (pets, bookings, balance, notes), pets list / detail with the vaccine verification action (approve -> booking status advances), add customer and add pet forms from the form-field specs, staff messages inbox (threads with customers, reply, assign), staff notifications, invoice view / print for a booking. Follow CLAUDE.md: PageSpec per route, library components with metas, tables / seeds / rules in per-module files, PIN approvals, pricing from tables, one lifecycle, responsive at 360 / 390 / 768 / 1280 / 1920, docs in the same turn, Conventional Commits with trailers, no push, no Slack, no PR.

## Response

Built 15 pages (F-30..F-34, F-50..F-59), 14 components, 8 tables, 27 rules, seed extension, page docs, screenshots, pending changelog / decisions / ops-manual chapter. Typecheck and build green; Playwright responsive pass clean. Details in `docs/changelog/_pending/frontdesk-grooming-people.md`; open choices in `docs/decisions/_pending/frontdesk-grooming-people.md`.
