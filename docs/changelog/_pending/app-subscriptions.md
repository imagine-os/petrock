# Apps and subscriptions

Date: 2026-10-17. Codes: A-28a.

Intent: a reusable workspace dependency directory and linked subscription expense tracker, with no SantaMaria changes.
Decision: portable browser-local manual records with explicit persistence warning. No inferred bills, seeded prices, or card labels. Alternative rejected: presenting mock integrations as verified paid services or implementing an invented production backend.

Files: shared subscriptions model/panel/strings/styles, host route/spec/links, component metadata, regression scripts, documentation and screenshots.

See `docs/pages/A-28a.md` for exact storage, role, cadence and integration boundaries. Source base: 87837f0.

Release verification: Pages now runs a read-only browser smoke check after deployment, captures desktop/phone evidence and checks the empty directory, disconnected adapters and page errors. This replaces local live verification, blocked by the workspace network proxy.
