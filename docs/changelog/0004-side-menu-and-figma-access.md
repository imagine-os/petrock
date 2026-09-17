# 0004 - Side-menu requirement and access status

version: 0.0.4
date: 2026-09-17
prompt: 0003
intent: Record Justin's 19:17 UTC follow-up: the side-menu categories requirement, the Figma Design System page he pointed at, and his report that Santa Maria is connected. Log the prompt verbatim with the reply pending while the Figma plan / export question is researched.
decision: D-014 (side menu: collapsible categories with per-category toggle plus expand-all / collapse-all, styled to the design system) and D-015 (Figma Design System page node 58:118 is a reference input, not the source of truth; code design system still rebuilt fresh per D-007) are decided. D-009 updated: Justin reports connected at 19:17 UTC, still not visible to Claude Tag at 19:18 UTC; the gap is the Santa-Maria-Tenis-Club org specifically (Company-OS and imagine-os repos are visible), so the Claude GitHub App must be installed on that org and the repo enabled in Claude Tag settings. D-012 (Figma quota) left unchanged until the plan / export research lands.
rejected: Answering the Figma export vs paid-plan question in this change set (research in progress; the reply will be recorded in prompt 0003's Response section); treating the Design System page as the design system (Justin himself doubts it, and D-007 already commits to a fresh rebuild); marking D-009 unblocked on Justin's report alone (the repo was re-checked and is still not attachable).
files: docs/prompts/0003-side-menu-figma-export.md, docs/decisions.md, docs/project-brief.md, docs/kanban.md, docs/changelog/0004-side-menu-and-figma-access.md
codes: n/a

## What changed

- **docs/prompts/0003-side-menu-figma-export.md (new)**: Justin's 19:17 UTC message verbatim; `## Response` holds a placeholder until the Figma plan research is done.
- **docs/decisions.md**: new D-014 (side menu categories) and D-015 (Figma Design System page as reference), both decided. D-009 re-stated with the 19:17 / 19:18 UTC check and the org-level remedy; still blocked.
- **docs/project-brief.md**: Role management gains the side-menu requirement (D-014); the design-system section gains the Figma Design System page reference (D-015); Santa Maria row in Reference repos reflects the re-check.
- **docs/kanban.md**: Backlog gains "Side menu: collapsible categories + expand/collapse all (D-014)"; Blocked lane's Santa Maria line reflects the re-check.

## Findings worth carrying forward

- Access gap is org-scoped: Playset-LLC and imagine-os repos are attachable, Santa-Maria-Tenis-Club is not, so the fix is installing the Claude GitHub App on that org (and enabling the repo), not a Petrock-side setting.
- Figma Design System page (node 58:118) exists after all; the deep-dive found only an icon set and a button set there, which matches Justin's own doubt about it. Use it as a cross-check when authoring the token set.

## Verification

- New prompt and changelog follow the header conventions in `docs/README.md`; decisions table rows added append-only, no renumbering.
- No app code, no build step.

## Follow-ups

- Research Figma export vs paid upgrade (what to buy, discount codes) and update D-012 and prompt 0003's Response with the final reply.
- Santa Maria: once the org is enabled, run the digest in its own session (D-009).
