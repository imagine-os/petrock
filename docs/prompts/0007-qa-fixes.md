# QA fixes - apply the 35 findings of the QA reports

date: 2026-09-18
from: build orchestration (prompt 0005 "Please build the whole thing", QA fan-in)
branch: main

## Prompt (summary of the computed task)

Apply the QA findings (35: 1 blocker, 12 major, 22 minor) from `docs/qa/{responsive,roles,coverage,e2e}-report.md` in `/home/claude/petrock` on `main`: fix all blockers and majors, minors when cheap, list why for anything not fixed. Re-run `npm run typecheck` and `npm run build`, the responsive check for touched pages (360 / 768 / 1280) and the failing e2e journeys. Update `docs/qa/*.md` with a Fixed status per item, add `docs/changelog/00xx-qa-fixes.md`, update the kanban. Commit (Conventional Commits, trailers) and push.

## Response

33 of 35 findings fixed, 2 deferred with reasons (`docs/qa/fix-status.md`, changelog 0019, decisions D-175..D-182). Blocker: F-12 white screen for app bookings (`quoteLinesOf()` + `ErrorBoundary`). Majors: F-56 refresh (MockProvider array identity), `/app/chat` links, C-10 links, location guards on detail pages + approvals location, manager menu (one staff shell), 12 px text floor, FeedbackButton position, PageHeader wrap, StatusBadge atom, 25 registry rows, spec gaps. Typecheck and build green; responsive matrix re-run over every route with the reworked scripts; `scripts/qa-fixes-e2e.mjs` 11 / 11.
