# 0004 - Figma export drop 1 and responsiveness requirement

- Source: Slack #petrock-hotel thread https://playsetllc.slack.com/archives/C0C2PP1NRPE/p1789669007022039 (message 2026-09-17 19:29 UTC, with attachment `Petrock Main.zip`)
- Date: 2026-09-17
- Requester: Justin Massion (owner)
- Follows: `docs/prompts/0003-side-menu-figma-export.md` (response asked Justin to export Sections 22 and 14 and the Design System page)
- Changelog: `docs/changelog/0005-figma-export-drop-1.md`
- Attachment saved to: `docs/figma/exports/petrock-main/` (inventory in `INVENTORY.md`)

## Prompt (verbatim)

check this. As a note everything needs to be responisve. It should not be limited to the sizes we designed for. please always check the responsiveness is correct.

Its not crazy important for some of the calendar features like kanban and timeline to work perfect on phone since front desk has an imac. However, it certainly would be nice if everything did end up being perfectly responsive. You may be able to pull that off

The design system page has 6223 items. ites at 0 of 6223 . so ill upload it as soon as its ready
[attachment: Petrock Main.zip]

**Follow-up note (19:33 UTC)** — Justin's second message (recorded as D-018): "of note, there aer some things like the messaging system and auth, which you might actually make even better since you know best practices, and the figma system was designed by hand"

## Response

Every screen in the export is now catalogued: 109 distinct screens from 238 files, in docs/figma/screen-catalog.md, with companion lists of entities (docs/data/entities-from-designs.md), components (docs/design/components-from-designs.md), 158 business rules (docs/rules/business-rules-from-designs.md) and open questions (docs/figma/open-questions.md). The responsiveness rule (D-016) and the messaging/auth note (D-018) are recorded as decisions.

What changed my understanding:
- The numbered PDFs are the owner Control Panel draft: locations with hours, boarding charge rules, tax rates, email/SMS providers, permissions, and service setup. That's where the real pricing rules live.
- Prices conflict between screens and several mock totals don't add up. Decision: treat the settings tables as the source of truth and compute everything from them.
- Booking status names differ on every surface, so one booking lifecycle will be defined before building the hotel journey.
- Vaccine lists differ per surface, and reservations stay pending until vaccines are verified.
- No dark-mode screen exists; the side-by-side pairs are two light variants, so dark mode will come from the tokens.
- Manager PIN gates booking status changes, matching the PIN approval system.
- Add Pet and Daycare are unresolved in the designs, so both will need light redesign.

The open-questions doc has 118 items. They will be resolved with best judgment, each logged as a decision, and only the ones affecting pricing or scope brought to Justin.
