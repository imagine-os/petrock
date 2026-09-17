# 0002 - Scope decisions from Justin

version: 0.0.2
date: 2026-09-17
prompt: 0002
intent: Record Justin's answers to the eight open Figma/scope questions from prompt 0001 as numbered decisions, and propagate them into the brief, the Figma analysis, and the kanban so no open question is left unmarked.
decision: Introduce `docs/decisions.md` as an append-only decision log (D-001..D-009). Sections 22 + 14 are the approved scope; Control Panel is owner/super-admin; spa = grooming (one flow); old single-screen rows become an "Extras" category with reports and employees firmly in scope; a business rules registry (page spec builder + Settings > Rules with per-rule status) is a requirement; the design system is rebuilt fresh with light/dark mode and multi-theme support; timeline-view scope and the Santa Maria digest stay pending.
rejected: Editing the questions in `docs/figma/analysis.md` in place (original wording is kept and annotated so the history stays readable); treating "Grooming & Spa" as the final name (it is a proposal, D-004 says naming TBD); starting the follow-up analysis in this change set (it lands as its own prompt/changelog).
files: docs/prompts/0002-scope-decisions.md, docs/decisions.md, docs/changelog/0002-scope-decisions.md, docs/project-brief.md, docs/figma/analysis.md, docs/kanban.md, docs/README.md
codes: n/a

## What changed

- **docs/decisions.md (new)**: decision log with columns #, date, decision, source, status. D-001 scope = Sections 22 + 14; D-002 Control Panel = owner/super-admin; D-003 day care not designed, In Home out, vaccines first-class, hotel reservations clear everywhere; D-004 spa = grooming; D-005 Extras category (reports in scope, employees required); D-006 business rules registry; D-007 rebuild design system with light/dark + themes; D-008 timeline view pending analysis; D-009 Santa Maria: Justin connected GitHub but repo not yet enabled for Claude Tag (blocked), digest pending.
- **docs/prompts/0002-scope-decisions.md (new)**: Justin's message verbatim, the eight questions it answers, and a placeholder response pointing at the decision log and the pending follow-up analysis.
- **docs/project-brief.md**: source line now cites prompt 0002 and links `docs/decisions.md`; scope table gains vaccines, "one service" for grooming & spa, owner-only Control Panel, Settings > Rules, and an Extras row; new sections "Theming" (under the design system), "Business rules registry" and "Services"; design-source bullet records the confirmed scope; Santa Maria access status updated (corrected in the follow-up commit: connected but not yet enabled for Claude Tag).
- **docs/figma/analysis.md**: "Decisions needed from Justin" keeps all ten original questions and adds an "Answered, D-00x" line under each (items 9 and 10 marked open / partly answered).
- **docs/kanban.md**: "Confirm Figma scope with Justin" moved to Done; Backlog gains business rules registry, design tokens from Figma, timeline view analysis, vaccine flow design, Figma gap check, Extras category; Santa Maria card reworded to "digest" now that access is granted; Doing is the follow-up analysis.
- **docs/README.md**: table row for `decisions.md`.

## Verification

- All ten numbered questions in `docs/figma/analysis.md` carry an annotation line (checked by script while editing).
- Markdown tables render; no app code touched.

## Follow-ups

- Follow-up analysis (gap check across older Figma sections, timeline-view frames, vaccine touchpoints, design tokens, Santa Maria digest) will be appended to `docs/figma/analysis.md` and `docs/reference/`, with its own prompt/changelog number.
- Replace the placeholder `## Response` in prompt 0002 with the final Slack reply once sent.
