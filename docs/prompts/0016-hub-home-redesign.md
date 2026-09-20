# 0016 - Hub home redesign: a CTL-style testing hub for Petrock (HUB-01)

date: 2026-09-20 20:49 UTC · from: Justin Massion (Slack thread https://playsetllc.slack.com/archives/C0C2PP1NRPE/p1789937344275589) · surface: hub (HUB-01), design system, scripts · follows: prompt 0014 (platform principles), 0015

Models: Fable 5.1 (architecture, review, docs), Opus 5 (HubPage build), Sonnet 5 (thumbnail capture script and captures).

## Prompt (verbatim)

Justin: "Reference this hub home page. it has thumbnail images and things like that for the customer which in this case is a law firm. <https://imagine-os.github.io/cal-tenant-law/|imagine-os.github.io/cal-tenant-law>

We need a better hub home page for petrock please.

@Claude"

(attachment: image.png, a full-page screenshot of the CTL OS testing hub at imagine-os.github.io/cal-tenant-law: hero band, session bar, audience groups "What a tenant sees" / "Every seat at the firm" / "How CTL OS is built" / "See the whole system at once", cards with thumbnails, Built / In progress / You are here pills, "Enter as <person>" buttons, stat footer.)

## Response

The new Petrock testing hub is live at https://imagine-os.github.io/petrock/ . Fable 5.1 planned and reviewed it, Opus 5 built the page, Sonnet 5 captured the thumbnails.

What changed on HUB-01:
- Hero band with the Petrock lockup and tagline, then a floating session bar (demo user, view as, location).
- Four audience sections like the CTL hub: "What a pet parent sees" (customer app in a phone frame, public website, sign-in, book from the website), "Every seat at the hotel" (front desk Encino and Westwood, Grooming & Spa, manager, owner, admin & settings), "How Petrock is built" (ops manual, docs, dev tools, quality) and "See the whole system at once" (13 tool rows).
- Every card carries a real screenshot of its page taken as that card's demo person, a Built / Stub / Planned pill from the route manifest, a "You are here" pill for the viewer's own role, and exactly one "Enter as <person>" or "Open" button. Codes show only with the builder tool on.
- Thumbnails are files, not live iframes: `npm run thumbs` (new `scripts/hub-thumbs.mjs`) captures 14 pages in light and dark; the hub bundles them. The old live phone frame showed "No access" for public viewers and is gone.
- English and Spanish for every string (105 keys), 44 px targets, visible focus, hover never the only affordance, and a hub scale band so it reads at 2560 and 3840.
- Firsts for the repo: the `Placeholder` atom (D-202) marks the three tools that are not built yet (canvas, demo simulator, plan viewer) with a tooltip and a "not wired yet" toast; `PageSpec.actions` exists and HUB-01 declares 7 actions (D-197). The actions bus and the /dev/actions page stay in the backlog.

Docs this turn: prompt 0016, changelog 0030, decisions D-218..D-223, kanban, `docs/pages/HUB-01.md`, `docs/reference/surfaces.md`, HUB-01 screenshots at 390 / 1280 / 3840 light and dark.

Next passes worth doing: the canvas, demo simulator and plan viewer behind the placeholders; the actions bus and D-20; moving `hub.role.*` and `placeholder.*` strings to a shared table in the Spanish-fill pass.
