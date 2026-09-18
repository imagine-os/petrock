# 0014 - Quality bar and platform principles

date: 2026-09-18 · from: Justin Massion (Slack, 16:09 UTC) via the workflow orchestrator · surface: whole platform · follows: prompts 0009 / 0010 (design fidelity)

## Prompt (verbatim)

Justin:

> Lets adjust the quality bar, because it needs to work on 4k tvs also. and we should consider, keyboard, mouse, trackpad, touchscreens, and pen input as expected. with other things like TV remotes, gamepads and Voice expected in the near future.  Everything change needs to update voice and control abilities accordingly.
>
> Table management, and Design System managment is key. Keeping Components organized as library is key.
>
> Integrating Annotations and Submissions into the developed products themselves is important so that testers can give feedback right on the product in a way that gives that feedback easily to the stored system where the agent can check and make changes or check with the developer accordingly if needed before making the adjustments according to who annotated or made a comment or request or bug report or whatever.
>
> any features not developed, or ui as placeholder needs clarity on a rollover or tool tip or error pop up or whatever is appropriate, so that if you put ui in place, and it doesnt actually function, we have a way to know. This could potentially be toggled on and off with developer mode.
>
> We do expect that voice control will eventually need to move super fast, and feel real time for the user, doing things on screen so the user can multiplayer with the voice, and the voice can control the entire user experience fast, or do things seperate on its own.
>
> WebMCP or anyother type of MCP, CLI, API abilities need to be well organized and recorded at every pass.
>
> The context and memory system needs to be brilliantly organized so any agent or developer can see the big picture and details with ease, so always keeping those docs updated will be key
>
> These are some notes and ideas to add to the instructions.
>
> We probably could add some instructions related to the Hub. where usually new projects will include Front End Website, Customer Facing App, Admin/Staff Dashboard like experiences, documentation, operations manual for the business in person and via software, and whatever else we're usually doing as the batch of deliverables our system provides . In particular until we connect real auth and go live, we have things setup so the viewer can see things from the perspective of any user role with dev mode on/off as needed.
>
> Multilingual Support, starting with english and spanish toggle is usually nice to have.
>
> We do need a good multiplayer ability such as expecting realtime data, and ability for multiple users to do things concurrently with insight into what they're doing. this does not necessarily need to be built at 1st pass, but it should be expected that most tools we'll be able to see who is doing what and it will have smart logic for managing online/offline, and multiuser editing concurrently so nothing breaks.  Again, this feature may be developed later. I just want the system to be aware that its always building super next gen systems ontop of our company os framework which we're actively building and growing capabilities at the strength of 2027+ technology, rather than limited to the old way of doing things. etc.

Orchestrator task (summary): document these as standing principles (docs only, no src changes): `docs/platform-principles.md` with ids P-nn, a "today" line and a "queued work" pointer each; a short pointer section plus the new rules in `CLAUDE.md` (responsive matrix to 2560 / 3840, placeholder marking, actions manifest, en/es strings, surfaces.md); decisions D-193 onward (binding for what Justin stated, proposed for implementation choices); this prompt log; kanban cards for the queued code work; a pending changelog draft; `docs/reference/surfaces.md` initial version; and a proposed Slack channel-instructions block returned to the orchestrator.

## Response

Recorded, docs only (model: Fable 5.1):

- **`docs/platform-principles.md`** (new): 15 principles P-01..P-15 in 12 groups, each with the rule, "what it means for Petrock today" and a queued-work pointer, plus a per-change checklist. Groups: quality bar incl. 4K TV (matrix 360 / 390 / 768 / 1280 / 1920 / 2560 / 3840, 10-foot legibility: >= 16 px body at 1920+, type / spacing scale at >= 2560, distance-visible focus rings); input modalities now (keyboard, mouse, trackpad, touch, pen: focus order, visible focus, 44 px targets, hover never the only affordance, no drag-only) and near future (TV remote / gamepad spatial focus, voice); control and voice abilities (`spec.actions` manifest = the future WebMCP surface; voice drives the same actions, fast, on screen or on its own); tables / design system / component library as first-class; in-product Annotations and Submissions (element-pinned feedback with author, role, page code, element path, screenshot, kind comment | request | bug; agent triage workflow: read store, fix vs ask by author, record decision first); placeholder marking (`Placeholder` component: badge / tooltip on hover, "not wired yet" toast, always visible in dev mode, subtle in production, every PageStub and toast-only onClick); MCP / CLI / API surfaces recorded every pass; context and memory (docs tree kept current every turn, start-here map); Hub and the standard deliverable batch (website, customer app, staff / admin, docs, ops manual, dev tools, testing hub; view-as any role + dev mode until real auth); en / es from the start; multiplayer / realtime expectations (presence, optimistic concurrency, online / offline, Company-OS realtime; never design against it); Company-OS at 2027+ strength (D-183 still holds).
- **`CLAUDE.md`**: new "Quality bar & platform principles" section; Responsive rule extended to 2560 and 3840 (TV widths on key pages first); placeholder-marking, actions-manifest, en / es strings and surfaces.md rules.
- **`docs/decisions.md`**: D-193..D-209 (binding rows for what Justin stated; D-194 widths / 10-foot rules, D-197 `actions` shape and D-20, D-200 annotation columns and pins, D-202 `Placeholder` design are proposed).
- **`docs/reference/surfaces.md`** (new): what exists (route manifest, `DataProvider` methods, npm scripts, no HTTP API, `CompanyOsProvider` seam, no MCP) and what is planned (WebMCP tools from the actions registry, CLI, realtime, annotations API).
- **`docs/kanban.md`**: backlog cards for the 4K / TV QA pass, `Placeholder` atom + dev-mode wiring, `actions` manifest + `/#/dev/actions` (D-20), Annotations module, Spanish fill pass, d-pad focus manager spike, presence / realtime plan doc; Done card for this turn.
- **`docs/changelog/_pending/platform-principles.md`** draft; `docs/README.md` rows and start-here line.

No source code changed; the code work is queued. Proposed Slack channel-instructions block (returned to the orchestrator, not applied):

```
Publishing: GitHub repos + GitHub Pages unless Justin says otherwise; empty repos are available, rename when ready. Git only: no PRs, no Slack posts from agents, no Contents API.
Docs same turn: every prompt (verbatim), reply, changelog, decision, kanban move and page doc lands in the repo in the same turn as the work; numbered files are append-only.
Model routing: Fable for judgment, architecture and shared code; Opus 5 for building modules / pages; Sonnet 5 for mechanical passes (screenshots, Spanish fill, QA matrices). Every reply states which model did the work.
Quality bar: phone to 4K TV (360, 390, 768, 1280, 1920, 2560, 3840); 10-foot legibility on large screens; build green before every push.
Inputs now: keyboard, mouse, trackpad, touch, pen (focus order, visible focus, 44 px targets, nothing hover-only or drag-only). Soon: TV remote / gamepad d-pad, voice. Never design against them.
Control: every page declares its actions (id, intent phrase, permission); every UI change updates them. The actions registry is the WebMCP surface and the voice controller's vocabulary.
Tables, design system and the component library are managed in the product (builder tool); no hand-rolled UI in pages.
Annotations: testers comment, request and report bugs on the product itself; agents triage from the store, fix or ask by author, and record the decision before changing anything.
Placeholders: any UI that does not work yet is marked (tooltip + "not wired yet" toast; always visible in dev mode).
Surfaces: MCP / WebMCP, CLI and API abilities are recorded in docs/reference/surfaces.md every pass.
Memory: docs/README.md is the start-here map; kanban, decisions, changelog, prompts and page docs are always current.
Hub: each project ships website, customer app, staff / admin dashboards, docs, ops manual, dev tools and a testing hub; until real auth, view as any role with dev mode on / off.
Languages: English and Spanish toggle from the start; Spanish fill is a pass, never a blocker.
Multiplayer: expect realtime data, presence, concurrent editing with conflict handling and online / offline logic; not first pass, but ids, updated_at and provider-based state from day one.
Company OS: build on it at 2027+ strength (agents, voice, realtime as normal); Petrock does not wire into it until Justin says so.
```
