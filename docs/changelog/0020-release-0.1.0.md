# 0020 - Release 0.1.0: first shippable build, Pages workflow, release docs

version: 0.1.0
date: 2026-09-18
prompt: 0005
intent: Ship the build of prompt 0005 ("Please build the whole thing"): green build on main, GitHub Pages workflow able to deploy, release screenshots, release summary in the prompt log, version 0.1.0, README status and kanban.
decision: none new. The build ships with D-001..D-182; rows marked proposed still need Justin (see prompt 0005 response).
rejected: creating the Pages site from the workflow token (`configure-pages` with `enablement: true` fails with "Resource not accessible by integration"); pushing a `gh-pages` branch from the session (refused by the permission policy as a production deploy); calling the Pages REST API from the sandbox (blocked by the proxy). Enablement stays a one-time click for Justin.
files: .github/workflows/pages.yml (enablement: true, checkout / setup-node v5), package.json (version 0.1.0), README.md (status), docs/prompts/0005-build-the-whole-thing.md (Response), docs/screenshots/release-0.1/*.jpg (8), docs/kanban.md, docs/changelog/0020-release-0.1.0.md
codes: HUB-01, C-10, F-13, A-01

## Version note

package.json goes to **0.1.0** as the first public release number. Changelogs 0008..0019 carried internal pre-release increments (0.1.0 foundation, 0.2.0 module merge, 0.2.1 QA fixes) while ten module builders worked in parallel; those numbers are kept in their files for history. Next releases count up from 0.1.0.

## Deploy status

- `npm run typecheck` and `npm run build` pass on `main` (6ead055 and this commit).
- Workflow `Deploy to GitHub Pages` (`.github/workflows/pages.yml`: Node 22, `npm ci`, `npm run build`, `configure-pages`, `upload-pages-artifact`, `deploy-pages`) builds green but stops at `configure-pages`:
  - run #7 (5d4fc2f): `Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions ... Error: Not Found`
  - run #8 (6ead055, `enablement: true`): `Create Pages site failed. Error: Resource not accessible by integration`
- `POST /repos/imagine-os/petrock/pages` from the sandbox: `403 Access to this GitHub API path is not permitted through this proxy`; `gh` is not installed.
- **Action for Justin**: repository Settings > Pages > Build and deployment > Source = **GitHub Actions**. Then Actions > "Deploy to GitHub Pages" > Run workflow (or any push to `main`). Expected URL: https://imagine-os.github.io/petrock/
- The live URL returned 403 from the sandbox egress proxy (host not allowed), so the page could not be fetched from the session; the screenshots below come from `vite preview` of the same `dist` the workflow uploads.

## Release screenshots (`docs/screenshots/release-0.1/`)

HUB-01 hub 1440 light / dark; C-10 customer home 390 light / dark; F-13 room timeline 1440 light / dark; A-01 owner dashboard 1440 light / dark (owner demo user). Copies for Slack in `../petrock-release-shots/` (outside the repo).

## Counts at release

182 routes (C 56, F 34, A 26, P 13, M 27, D 24, HUB 2), 137 components with metas, 74 tables, 238 rules, 24 manual chapters (+ M-01..M-03 manual pages), 172 page docs, 470 screenshots, decisions D-001..D-182, responsive matrix 1820 cells / 0 failing, e2e 11 / 11.
