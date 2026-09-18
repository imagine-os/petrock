# 0021 - Open questions Q&A thread with Justin

version: 0.1.0
date: 2026-09-18
prompt: 0008
intent: Justin opened a Q&A thread in #petrock-hotel ("ask what ever questions you want of me here"). Post the consolidated list of 18 questions drawn from the 35 decision rows still marked proposed (needs Justin) plus the access blockers, each with its current default, and log the exchange as prompt 0008 with a question-to-decision map so answers can be filed without re-deriving what they resolve.
decision: none changed yet. Decision rows and open questions change only as answers arrive: each answer becomes a new row in docs/decisions.md (D-183 onward, never renumbering) and the superseded row's status is updated. Rows not asked about (D-004 name, D-010, D-011, D-035, D-037, D-047, D-086, D-123, D-138, D-148, D-154, D-174, module "proposed" rows) stay as built unless Justin objects.
rejected: editing docs/decisions.md or docs/open-questions.md before any answer exists; asking about every proposed row (the 18 cover the rows that change pricing, capacity or a hard rule, the rest are defaults Justin can override at any time); bundling the questions into one long paragraph instead of a numbered list with defaults in brackets (one-word answers must be possible).
files: docs/prompts/0008-open-questions-qa.md, docs/changelog/0021-open-questions-qa.md
codes: -

## What changed

- `docs/prompts/0008-open-questions-qa.md`: Justin's message verbatim, Claude's reply verbatim (18 questions in four groups: pricing & money, daycare, product / rules, access / blockers), and a question-to-decision map (Q1..Q18 -> D-xxx rows and open-question numbers).
- No code change; no build run (docs only).

## Next

Answers arrive in the same thread. For each: append the decision row, update the old row's status, tick the open question, and log the answer batch as the next prompt / changelog pair. Q15 (GitHub Pages enablement) unblocks the live URL from changelog 0020.
