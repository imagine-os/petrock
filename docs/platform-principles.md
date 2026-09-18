# Platform principles (binding)

Standing principles for everything built in this repo, from Justin's notes of 2026-09-18 (prompt 0014). They sit above the module contract in `CLAUDE.md`: a page that follows the contract but breaks one of these is not done. Each principle has an id (`P-nn`), the rule an agent applies, **what it means for Petrock today**, and a **queued work** pointer (kanban card, decision or page code). Decisions D-193..D-209 record them; rows marked _proposed_ are implementation choices that need Justin.

Start here if you are new: `docs/README.md` (map of the docs), then this file, then `CLAUDE.md`, `docs/build-plan.md`, `docs/decisions.md`.

## 1. Quality bar

**P-01 - It works on a phone and on a 4K TV.** The responsive matrix is 360, 390, 768, 1280, 1920, **2560 and 3840** px (D-016 extended, D-194). Large screens are "10-foot UI": body text is at least 16 px at 1920 and above, type and spacing scale up at >= 2560 (a `--scale` custom property on `:root` per width band, not per-page font sizes), focus rings and selection states are visible from across a room (>= 3 px ring, high-contrast token, never colour alone). Nothing is pinned to a 390 or 1440 design width; centred max-width layouts are fine, tiny centred layouts on a TV are not.
- _Today_: the QA matrix stops at 1920 (`scripts/qa-responsive.mjs`, `WIDTHS`); the customer app is 390-first, the desk 1440-first; 12 px is the text floor (D-175). TV widths may be verified on the key pages first (HUB-01, C-10, C-30, F-01, F-10, F-12, A-01, P-01) and then across the matrix.
- _Queued_: kanban "4K / TV QA pass"; D-194 (proposed widths and 10-foot rules); `spec.checkedAt` gains 2560 / 3840 as pages are verified.

**P-02 - The quality bar is checked, not assumed.** Definition of done stays: build green, `spec.checkedAt` recorded, screenshots, page doc, changelog, no console errors; plus the new checks below (placeholder marking P-09, actions manifest P-05, en/es strings P-12, surfaces recorded P-10).
- _Today_: `npm run qa:responsive`, `npm run qa:bundle`, D-09 spec report, D-15 a11y scan.
- _Queued_: extend `scripts/qa-responsive.mjs` with the two TV widths and a legibility check (computed font-size >= 16 px on body text at >= 1920).

## 2. Input modalities

**P-03 - Keyboard, mouse, trackpad, touch and pen are expected now.** Every interactive element is reachable and operable by keyboard in a sensible focus order, with a visible focus state (never `outline: none` without a replacement). Touch targets are at least 44 x 44 px (WCAG 2.5.8; D-171 makes `target-size` a warning today, it becomes an error). Hover is never the only affordance: anything shown on hover is also shown on focus and reachable on touch (tap to reveal, or always visible on coarse pointers via `@media (pointer: coarse)`). No drag-only interaction: drag and drop (timeline, board, layout editor) always has a click / keyboard alternative (move up / down, "move to" menu), because pens and screen readers do not drag well. Scroll containers are usable with trackpad inertial scrolling (no scroll-jacking).
- _Today_: the library components carry a11y notes (D-08 matrix, R-X81); the D-15 scan checks names, labels, heading order, targets. Drag exists in D-11 layout editor (has up / down buttons) and in the room timeline (assignment picker as alternative).
- _Queued_: promote `target-size` to an error; hover-only audit across the library (tooltips, row actions that appear on hover, DataTable row menus).

**P-04 - TV remote, gamepad d-pad and voice are expected in the near future; never design against them.** D-pad navigation means spatial focus: from any focused element, up / down / left / right moves to the geometrically nearest focusable element, so pages must have a clear grid of focusables, no focus traps, and one obvious primary action per screen. Voice means every action has a name (P-05). Do not build interactions that only work with a pointer position (hover menus, precise drags, tiny close buttons in corners).
- _Today_: nothing is d-pad aware; tab order is the only sequence.
- _Queued_: kanban "spatial-navigation (d-pad) focus manager spike" (a `useSpatialNav` hook in `src/a11y/`, opt-in per shell, arrow keys move focus by geometry; gamepad via the Gamepad API mapped to the same handler).

## 3. Control and voice abilities

**P-05 - Every change updates the control and voice abilities.** Each `PageSpec` lists its actions in an `actions` manifest: `{ id, label, intent, permission?, params? }` where `id` is `<module>.<verb>` (e.g. `reservations.checkIn`), `intent` is the phrase a person would say ("check in {pet}"), and `permission` is the string the page already calls through `can()`. A page's buttons, menu items and form submits are its actions; a new button without an action entry is incomplete, and removing a button removes its entry in the same commit. The manifest is data (`window.__petrock.routes[].spec.actions`), so a voice controller, an agent or a test can enumerate what a page can do and drive it. The actions registry is the future WebMCP surface (P-10): each action becomes one tool with the same id, description = intent, input schema = params.
- _Today_: pages call `can('...')` and render buttons; there is no action list. The route manifest (`src/app/manifest.ts`) already exposes specs to tooling.
- _Queued_: kanban "`actions` manifest on PageSpec + `/#/dev/actions` (D-20)"; D-197 (proposed shape). `specCompleteness` adds an `actions` check once the field exists. Voice today = nothing; the manifest is the prerequisite.

**P-06 - Voice will move fast and feel real time, and it multiplayers with the person.** The voice / agent controller operates the same UI the person sees (highlighting what it is doing, on screen, as it does it) or works on its own in the background; either way it goes through the actions registry and the `DataProvider`, never a private code path. Design implications now: actions are idempotent where possible, take ids not screen positions, return a result the controller can read, and UI state that matters (selected pet, current step) is addressable (URL, hash params or a store), not trapped in a component.
- _Today_: wizard drafts live in the mock DB (`*_drafts`), which is the right direction; some selection state is component-local.
- _Queued_: part of the actions-manifest card (each action gets a `run()` handler registered by the page while mounted); later "voice controller" module.

## 4. Tables, design system and the component library

**P-07 - Table management, design-system management and the component library are first-class, in the product.** Every table is in the schema registry and editable in the table manager (D-04 / D-10); every design value is a token in `src/design/tokens.ts` and visible in D-01; every component has a `.meta.ts` and shows in `/#/dev/components` (D-02) with states, props, a11y notes and usages (D-08). Pages never hand-roll a table, button, input, modal, card or tooltip. New components are added to the library first, then used. The builder tool (SpecChip + InspectorPanel, Ctrl+.) stays on every page and links spec -> tables -> rules -> components.
- _Today_: 74 tables, 137 components with metas, D-01..D-19 dev pages; this is already the contract in `CLAUDE.md`.
- _Queued_: keep; the `Placeholder` atom (P-09) and annotation pins (P-08) are library components.

## 5. Annotations and Submissions in the product

**P-08 - Testers annotate the product itself.** The existing FeedbackButton / `feedback` table / A-36 inbox grows into **element-pinned annotations**: from any page a tester picks an element (or the whole page), writes a note, chooses a kind (`comment | request | bug`), and the record stores author (`user_id`, `user_name`), role, `page_code`, route, element path (a stable CSS selector plus the component name from the library when it can be resolved), viewport width and theme, a screenshot (mock upload today, storage later), and status. Pins render on the page for people with permission (dev mode or `feedback.read`), so a tester sees what was already said.
- **Agent triage workflow** (recorded, not ad hoc): (1) read the store (`feedback` rows with `status = new`), (2) for each, decide _fix_ (clear, low risk, inside the module contract) vs _ask the developer / Justin_ (behaviour change, pricing, business rule, design intent), taking into account **who** wrote it (owner / Justin: binding; staff tester: request; customer tester: signal), (3) record the decision on the row (`triage`, `triage_note`, `decision_ref` = D-nnn or changelog) before changing anything, (4) fix in the same turn with docs, or add a question to `docs/figma/open-questions.md` / the kanban "Awaiting Justin" card and set `status = waiting`.
- _Today_: `feedback` has `category` (bug / idea / question / praise), `text`, `status`, `owner_reply`; A-36 lists and replies. No element path, no screenshot, no pins.
- _Queued_: kanban "Annotations module"; D-200 (proposed columns and pin UI); `docs/reference/annotations-triage.md` when the module ships.

## 6. Placeholder and undeveloped UI

**P-09 - If it is on screen and does not work, it says so.** Any UI that is a placeholder, stub or not yet wired is marked with the `Placeholder` component: a badge / tooltip on hover and focus ("Not wired yet - <what it will do>") and a "not wired yet" toast on activation, so a click never silently does nothing. In dev mode the marker is always visible (dashed outline + badge); in production it is a subtle tooltip and the toast. Every `PageStub` uses it, and every `onClick` that only toasts ("coming soon") is replaced by it, so the D-09 spec report and the A-36 inbox can count what is not real. Placeholders list a `spec.notes` line naming the module that will build the real thing.
- _Today_: `PageStub` renders a stub card; five `onClick`s toast "coming soon" (HomePage, PetProfilePage, ...); nothing is machine-readable.
- _Queued_: kanban "`Placeholder` atom + dev-mode toggle"; D-202 (proposed design). The dev-mode toggle already exists in `SessionProvider` (`devMode`, super admin only).

## 7. Surfaces: MCP, CLI, API

**P-10 - Every surface a machine can drive is recorded every pass.** `docs/reference/surfaces.md` lists, and is updated in the same turn as any change to: the route manifest (`window.__petrock.routes`), the `DataProvider` methods, npm scripts and their flags, the actions manifest (P-05), any HTTP API (none today), and planned WebMCP / MCP tools and CLI commands. A new script, a new provider method or a new action without a `surfaces.md` line is incomplete.
- _Today_: `docs/reference/surfaces.md` initial version (this turn) documents what exists.
- _Queued_: WebMCP tools generated from the actions registry; a `petrock` CLI wrapping the scripts; Company-OS REST when D-183 lifts.

## 8. Context and memory

**P-11 - Any agent or developer sees the big picture and the details with ease.** The memory system is the docs tree: `docs/README.md` (map and start-here), `docs/kanban.md` (state of work), `docs/decisions.md` (why), `docs/changelog/` (what changed), `docs/prompts/` (what was asked and answered, verbatim), `docs/pages/<CODE>.md` (each screen), `docs/build-plan.md` (phases and code ranges), this file (principles). All are updated **in the same turn** as the work, never later; the app renders them at `/#/docs` and `/#/dev/knowledge`. A new agent should be able to read `docs/README.md`, this file and the kanban and know where to start within minutes. Numbered files are append-only; reversals add rows, never edit history.
- _Today_: all of the above exist; `docs/README.md` gains a start-here line and rows for the new files in this turn.
- _Queued_: keep current every turn (rule, not a card).

## 9. The Hub and the standard deliverable batch

**P-12 - Every project ships the same batch, reachable from one hub.** Unless the brief says otherwise a project has: a public website (P-xx), a customer-facing app (C-xx), staff / admin dashboards (F-xx, A-xx), documentation in-app (D-06 / D-07), an operations manual for the business in person and in software (M-xx), the dev / builder tools (D-xx) and a testing hub (HUB-01) that opens every surface as any demo user. **Until real auth is connected and the product is live, the viewer can see everything from the perspective of any role** (super admin "view as", demo users per role) **with dev mode on / off**; role guards stay real (`RequireRole`, `can()`), only the identity is mocked.
- _Today_: exactly this: HUB-01, PhoneShell / DesktopShell, `SessionProvider.switchUser / viewAs / devMode`, `demoUsers.ts`.
- _Queued_: keep; when Supabase Auth lands (D-184) the hub keeps view-as for super admins only.

## 10. Multilingual

**P-13 - English and Spanish from the start.** Every visible string goes through `useT()` with a namespaced key in the module's `strings` table (`{ en, es? }`); Spanish falls back to English, so a missing translation is never a blocker but always a gap. The language toggle (C-72 for customers, TopBar user menu for staff) is present on every surface. A "Spanish fill" pass translates the `es` side; hard-coded English in JSX is a defect the D-09 report will flag once the strings check exists.
- _Today_: `src/i18n` (`useT`, `I18nProvider`, `petrock.lang`), module `strings` exports; coverage is partial and mostly English.
- _Queued_: kanban "Spanish fill pass"; a strings-coverage check in the spec report.

## 11. Multiplayer and realtime

**P-14 - Many people at once, with insight into what each is doing.** Expected (not first pass, but never designed against): presence (who is viewing / editing which record or page), optimistic concurrency with conflict handling (every row has `id`, `updated_at` and a `version` or etag; a stale write is detected and surfaced, not silently overwritten), online / offline status with queued writes, realtime data through Company-OS subscriptions (the `DataProvider.subscribe` seam already exists). Rules today: no in-memory-only state that would break with two users (drafts and selections that matter go through the provider), writes go through `insert / update` with ids (never index-based), lists re-render from `subscribe` events, and no page assumes it is the only writer.
- _Today_: `MockProvider` broadcasts `ChangeEvent`s and `useTable` re-renders on them; base columns include `created_at` / `updated_at`; no `version`, no presence, single browser.
- _Queued_: kanban "presence / realtime plan doc tied to Company-OS" (`docs/reference/realtime-plan.md`: presence table, version column, conflict UI, offline queue); `version` base column when the plan is approved.

## 12. Company-OS and the 2027+ bar

**P-15 - Build on the Company-OS framework at the strength of 2027+ technology, not the old way.** Petrock is one of many next-gen systems on our company OS, whose capabilities are growing; assume realtime data, agents as first-class users, voice and multi-device as normal, and do not reach for legacy patterns (page reloads, form posts, one-user-at-a-time locks, hover-only desktop UI, hard-coded strings and prices). D-183 still holds: nothing wires into Company-OS until Justin says so; the seam (`CompanyOsProvider`) is where it will connect, and every principle here is written so that the switch is an adapter change, not a rewrite.
- _Today_: `DataProvider` / `PaymentProvider` seams, tables-as-rules (pricing, budgets), the actions manifest (P-05) as the agent surface.
- _Queued_: `docs/reference/company-os.md` gets a "what Petrock expects from Company-OS" section when the realtime plan is written.

## Checklist for a change (paste into your turn)

- [ ] Works at 360 / 390 / 768 / 1280 / 1920 (+ 2560 / 3840 for key pages); `spec.checkedAt` updated (P-01)
- [ ] Keyboard order and visible focus; 44 px targets; nothing hover-only or drag-only (P-03)
- [ ] `spec.actions` lists every button / submit with intent and permission (P-05)
- [ ] Library components only; new component has a meta (P-07)
- [ ] Every non-working control uses `Placeholder` (P-09)
- [ ] `docs/reference/surfaces.md` updated if a route, action, provider method or script changed (P-10)
- [ ] Page doc, changelog (or `_pending`), kanban, decisions, prompt log, screenshots in the same turn (P-11)
- [ ] Strings through `useT()` with `es` where known (P-13)
- [ ] No in-memory-only shared state; writes by id through the provider (P-14)
