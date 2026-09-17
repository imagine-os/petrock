# 0003 - Figma deep-dive, token draft, and build plan proposal

version: 0.0.3
date: 2026-09-17
prompt: 0002
intent: Finish the follow-up analysis promised in prompt 0002's response: check older Figma sections for screens missing from the approved scope, settle the timeline-view question, map vaccine and hotel coverage, settle spa vs grooming, extract a first token set, and put a build plan in front of Justin. Record the final Slack reply verbatim.
decision: Timeline view decided from the sitemap (D-008: Hotel & Daycare Table + Timeline, Spa Table + Board). Three proposals logged for Justin: port eight older-section screens (D-010), Grooming as the single flow with Spa as a package category and rules as configurable conditions (D-011), and the build plan / stack (D-013: React + TS, mock data + Company-OS adapter, GitHub Pages, Capacitor for mobile, foundation first then hotel journey). Figma API quota exhaustion recorded as a blocker (D-012). Tokens are published as a derived draft, not as the design system.
rejected: Presenting the derived tokens as final (Figma has no authored token set and coverage is partial); retrying the Figma API inside the quota window (plan-tier 429 with a ~4.6-day Retry-After, retries cannot succeed); designing the timeline from the Section 14 frames (they are relabelled grooming skeletons); waiting for the second Figma pass before proposing the build plan (enough was read to plan the foundation).
files: docs/figma/deep-dive.md, docs/figma/renders/render-zoom-addpetdetails.png, docs/figma/renders/render-zoom-choose-room-pets.png, docs/figma/renders/render-zoom-estimate-checkout.png, docs/figma/renders/render-zoom-table.png, docs/design/tokens-draft.md, docs/figma/README.md, docs/README.md, docs/decisions.md, docs/prompts/0002-scope-decisions.md, docs/kanban.md, docs/changelog/0003-figma-deep-dive.md
codes: n/a

## What changed

- **docs/figma/deep-dive.md (new)**: second-pass analysis with a coverage caveat up top (Starter-tier quota exhausted mid-pass, 429 with Retry-After ~4.6 days; items marked (verify) need a second pass after ~2026-09-22). Sections: gap check (canonical set vs older-generation frames, keep / drop verdicts), timeline & table views, vaccines & hotel coverage, spa vs grooming, Design System page and older pages, draft tokens, renders, open verifications.
- **docs/figma/renders/render-zoom-*.png (4 new)**: zoom crops from the first-pass renders (add pet details, choose room / pets, estimate / checkout, boarding table). Low-res; fresh renders blocked by the quota.
- **docs/design/tokens-draft.md (new)**: the deep-dive's "Draft tokens" section extracted on its own, flagged as derived: observed colors (purple primary #552583), proposed color tokens, typography, spacing and radii, icons. Input to the rebuilt design system (D-007), not the system itself.
- **docs/figma/README.md**, **docs/README.md**: link deep-dive, tokens draft, zoom renders; record the API quota status; add the `design/` folder row.
- **docs/decisions.md**: D-008 decided (timeline from sitemap); new D-010 (port older screens, proposed), D-011 (Grooming flow with Spa category, proposed), D-012 (Figma quota, blocked), D-013 (build plan and stack, proposed).
- **docs/prompts/0002-scope-decisions.md**: `## Response` placeholder replaced with the final Slack reply, verbatim; changelog line now points at 0002 and 0003.
- **docs/kanban.md**: Done gains Figma gap check, Timeline view analysis, Design tokens draft. Backlog gains Second Figma pass (~Sep 22), Vaccine flow design (customer + front desk), Reports/analytics design, Capacitor vs native decision, Port older-section screens. New Blocked lane holds the Santa Maria digest (unchanged status). Doing = awaiting Justin.

## Findings worth carrying forward

- Eight older-section screens have no counterpart in Sections 22/14 and should be ported (D-010); Choose Vaccine is the only vaccine-upload UI on the page.
- Vaccines: one screen plus a checkbox today; no expiry, proof storage, front-desk verification, or booking gating. Needs design on both surfaces.
- Hotel is the most complete journey (Penthouse / Suite, pets, estimate with deposit, checkout with tips). Missing: room inventory admin, reservation detail/edit, explicit check-in/out actions.
- Reports is an empty shell in Figma; analytics will be designed fresh.
- Design system: three different fonts across design generations; the Design System page holds only an icon set and a button set.

## Verification

- deep-dive.md and tokens-draft.md render as markdown; image paths in deep-dive.md resolve to `renders/`.
- No app code, no build step.

## Follow-ups

- Justin: go-ahead on D-013, review of D-010 / D-011, paid Figma seat or wait for ~Sep 22 (D-012).
- Second Figma pass after the quota reset; then author the real token set and design-system doc (`docs/design/design-system.md`).
