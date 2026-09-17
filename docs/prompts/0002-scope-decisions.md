# 0002 - Scope decisions

- Source: Slack #petrock-hotel thread https://playsetllc.slack.com/archives/C0C2PP1NRPE/p1789669007022039
- Date: 2026-09-17
- Requester: Justin Massion (owner)
- Answers: the eight questions in `docs/prompts/0001-figma-analysis-and-project-brief.md` (Response section)
- Changelogs: `docs/changelog/0002-scope-decisions.md` (decisions), `docs/changelog/0003-figma-deep-dive.md` (deep-dive, tokens, build plan)

## Prompt (verbatim)

1. it appeasr yes. But you can reference other sections to see if anything was there that looks useful that may be missing in 22 and 14
2. thos are owner/super admin i think. Keep in mind we'll have a role management system to adjust if needed later. 
3. I think Day care hasnt been built yet unless you see it. In home hasnt been built. Vaccines are important throughout the system so there should be plenty of owrk on vaccine flow . hotel reservations should also be clear across the board. 
4. spa and grooming are the same thing. 
5. You can set those in a category of extras fo rnow. Reports/analytics are deff in scope.  Employees is required for user management, Dog walking & management can be built out further if needed later. 
6. Business Rules i can look deeper for you later. But we deff need a place to keep track of all rules. Those rules will be on the spec builder of the actual pages, as well as in settings so all rules are clearly in teh right place in settings. with the ability to add new ones, and be clear on whether those added are requested, implemented, in dev or whatever. 
7. I dont know if there's a page that holds the design system. You can look around, or just rebuild it better, fresh. I think this page has all the icons fonts colors etc. so its good enough for you to build a perfect, clean awesome design system. Keep in mind we will want light/dark mode and ease to make new themes later if appropraite. 
8. If you look closer at the timeline views, you'll see what they relate to. I think it might be hotel only, but maybe you'll see something more specific on the spa that requires timeline view. I'm not sure. 
Github connected to Santa Maria

### The questions being answered (from prompt 0001's response)

1. Are Section 22 + Section 14 the approved scope, with everything else superseded?
2. Control Panel screens 1-15: which are in scope, and are they front desk or owner-only?
3. Flows missing from Section 22 (In Home, Hotel Reservation/Hotel Flow, Choose Vaccine, Day care "coming soon"): dropped or pending?
4. Spa vs Grooming: one flow with conditions, or two flows?
5. Old single-screen rows (report, education, reviews, employees, walking, Management): in scope?
6. Business rules ("55lb+ must be Suite", daycare duration vs spa, pricing rules): written down anywhere else?
7. The "Re-build with new design system" note: is that done, and which Figma page holds the new system?
8. Timeline view: boarding, grooming, or both?

## Response

Your answers are recorded as decisions D-001 to D-009 in petrock/docs/decisions.md, and the deeper Figma pass turned up eight screens worth keeping from the older sections. One blocker first: the Figma key hit its plan quota (Starter tier) after about 40 reads, and Figma won't accept more until around Sep 22. I got enough for the plan below, but not full text of every screen.

Findings from the deeper pass:
- Keep from older sections: Choose Vaccine (the only vaccine upload screen, marked "getting replaced" but nothing replaces it), the read-only Invoice/booking detail page, the employees list and add-employee popup, the front-desk home with its stats strip, the owner KPI dashboard, the OTP verify modal, the collapsible nav with location switcher, and the form-field redlines.
- Vaccines exist today only as that one screen plus a checkbox on the old pet form. No expiry, proof storage, front-desk verification, or booking gating anywhere, so that flow needs design work on both surfaces.
- Timeline view: your sitemap resolves it. Hotel & Daycare get Table + Timeline views, Spa gets Table + Board (kanban). The Section 14 timeline frames are still the old grooming skeleton relabelled, so I'd design the timeline properly around rooms and stays.
- Hotel is the most complete journey (room types Penthouse and Suite, pets, estimate with deposit, checkout with tips). Missing: room inventory admin, reservation detail/edit, explicit check-in/out actions.
- Grooming & Spa: one flow named Grooming with Spa as a package category, and the daycare-duration and second-pet rules as configurable conditions.
- Reports is an empty shell in Figma, so analytics will be designed fresh.
- Design system: purple primary (#552583), three different fonts across generations. I'll standardize on one family with a light/dark token set and theme switching. The Design System page only holds an icon set and a button set, so rebuilding fresh is right.

Proposed build plan, in order: foundation (tokens and themes, component library with per-component docs, table library, roles and location context, PIN login and approvals, spec builder with the rules registry, testing hub with demo users, docs viewer), then the hotel journey end to end on customer and front desk, then grooming, daycare, vaccines, reports, and extras. Same architecture as hoy: React and TypeScript, mock data first with an adapter for the Company-OS API later, deployed on GitHub Pages. The customer app would be the same codebase wrapped with Capacitor for iOS and Android unless you'd rather have a separate native app.

Questions: Can I start the foundation now, or do you want to review the plan first? Does the Figma key have a paid seat you can point me at, or should I wait until Sep 22 for the rest of the screen text?
