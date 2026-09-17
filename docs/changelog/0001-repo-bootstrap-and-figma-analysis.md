# 0001 - Repo bootstrap and Figma analysis

version: 0.0.1
date: 2026-09-17
prompt: 0001
intent: Turn the empty imagine-os/petrock repo into a documented project: capture Justin's brief, inventory the Figma design page, digest the reference repos, and set up the hoy-style docs conventions before any app code is written.
decision: Docs-first bootstrap with hoy conventions (numbered append-only prompts and changelogs, `## Response` split, kanban lanes). Section 22 and Section 14 of the Figma page are treated as the canonical mobile and front-desk designs pending Justin's confirmation. Company-OS is to be reached through its REST API or a thin BFF, not direct DB access; Petrock modelled as one tenant with two org_units.
rejected: Starting app code now (stack and Figma scope not confirmed); inventorying all ten Figma pages (only the linked page matters today); attaching Company-OS / Santa Maria to this session (cross-owner sessions are refused, so a separate session digested Company-OS instead).
files: README.md, .gitignore, docs/README.md, docs/project-brief.md, docs/kanban.md, docs/figma/README.md, docs/figma/analysis.md, docs/figma/renders/*.png (3), docs/reference/hoy-patterns.md, docs/reference/company-os.md, docs/reference/santa-maria-os.md, docs/prompts/0001-figma-analysis-and-project-brief.md, docs/changelog/0001-repo-bootstrap-and-figma-analysis.md
codes: n/a

## What was created

- **README.md**: project purpose, planned surfaces (customer iOS/Android, front desk web, admin/owner web, builder overlay), status "analysis phase, no app code yet", pointer to docs and to hoy as reference architecture.
- **docs/README.md**: how the docs folders work and the numbering rules.
- **docs/project-brief.md**: everything from Justin's two messages organized into client/locations, scope, cross-cutting features (builder tool, component + table libraries, roles, PIN, staff feedback, testing hub, docs/ops manual), design source, data layer (with the Company-OS digest's recommendation), reference repos with access status, org rules.
- **docs/figma/**: `README.md` (file key, page list, page id), `analysis.md` (summary, 10 decisions needed from Justin, full node-level inventory), `renders/` (3 PNG exports).
- **docs/reference/**: `hoy-patterns.md` (digest of imagine-os/hoy at ee83bcc), `company-os.md` (data-layer digest from a separate read-only session), `santa-maria-os.md` (not readable yet: not visible to the GitHub connector; planned skim).
- **docs/prompts/0001**: Justin's two messages verbatim and the analysis reply.
- **docs/kanban.md**: Backlog / Doing / Done.
- **.gitignore**: node_modules, dist, .DS_Store, *.log, .vite.

## Findings worth carrying forward

- Figma page new(justin + Mark): 253 frames, 25 sections, two products drawn 2-3 times over. Build from Section 22 (48 mobile screens, 9 flows) and Section 14 (31 desktop screens + 4 timeline variants). No team library; 45 local components, 23 fill / 10 text styles with inconsistent naming.
- Company-OS is a metadata-driven multi-tenant platform (JSONB records, API-enforced isolation, no RLS). New entities Petrock needs: customer auth, service catalog with prices, invoices/payments (Stripe), spa add-ons, vaccination records, persisted audit log, availability enforcement.

## Verification

- All files render as plain markdown; renders referenced by relative path from `docs/figma/analysis.md`.
- No app code, no build step yet.

## Follow-ups

See `docs/kanban.md` Backlog. First blockers: Justin's answers to the 10 Figma decisions, stack decision, Santa Maria os access.
