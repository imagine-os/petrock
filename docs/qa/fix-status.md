# QA findings - fix status (changelog 0019)

Status per finding of the four QA reports in this folder (responsive, roles / location / PIN, spec / rules / component / table coverage, end-to-end flows). `Fixed` = code changed and re-verified in this pass (`npm run typecheck`, `npm run build`, `node scripts/qa-responsive.mjs` over every route, `node scripts/qa-fixes-e2e.mjs` 11 / 11). `Deferred` = not changed, reason given.

| # | Sev | Area | Finding | Status | Where |
| --- | --- | --- | --- | --- | --- |
| 1 | major | PageHeader | F-12 eyebrow row overflows at 360 px | Fixed | `PageHeader` eyebrow row wraps (`row wrap`), F-12 eyebrow span wraps |
| 2 | major | FeedbackButton | Fixed button covers the sticky sidebar / sticky headers | Fixed | Button moved to the right edge, stacked above the SpecChip; shell content gets extra bottom padding |
| 3 | major | tokens | Text below 12 px on 178 routes | Fixed | `--fs-2xs` = 12 px; every hard-coded 10 / 11 px in component CSS -> `var(--fs-xs)`; count badges 18 px boxes; `code`/`small` floor at 12 px; chart tick labels 12 px; TODAY tag 12 px |
| 4 | minor | QA tooling | Wizard steps never rendered (redirect) | Fixed | `scripts/qa-lib.mjs` seeds the hotel / grooming / daycare drafts for `/app` routes; screenshots regenerated for C-31..C-36, C-52..C-54, C-62, C-63 |
| 5 | minor | QA tooling | Scripts diverge from the D-016 brief; stale report | Fixed | Per-surface demo user, dev mode off, `:slug` / `:conversationId` params, `layoutScan` (small text, fixed-over-stuck-sticky, blank) + redirect detection in `qa-responsive.mjs`; full matrix re-run and committed |
| 6 | minor | RoomTimeline | Legend wraps, 4 day columns, header under the chip | Partly fixed | Chip moved (no longer over the header), TODAY tag readable. Legend collapse below 600 px deferred: the wrapped legend is the documented "degrade gracefully" (D-016) and no overflow occurs |
| 7 | major | location | Pinned staff open the other location's booking / customer by URL | Fixed | F-12, F-52, F-55 render the not-found state ("belongs to Westwood"); approvals rows carry the subject booking's `location_id` (`PinApprovalRequest.locationId`); seed notification moved to the Westwood desk |
| 8 | major | side menu | Manager menu omits admin pages | Fixed | One staff shell (`surfaces: admin + frontdesk + manual`, filtered by `hasRole`), title per role (Owner / admin, Manager, Front desk, Grooming) |
| 9 | minor | location | Customers / Pets "All locations" toggle for pinned staff | Fixed | Toggle only when `canSwitch` |
| 10 | minor | roles | Groomer reaches F-14 board | Fixed | F-14 route and spec use the DESK role set |
| 11 | minor | permissions | `bookings.status` never checked | Fixed | Front desk gets `bookings.status`; the status menu keys off it; PIN gate unchanged for gated transitions |
| 12 | minor | view-as | View-as staff not pinned | Fixed | `LocationProvider` pins a view-as session to the demo user's location for that role |
| 13 | minor | PIN login | Misleading message for an employee without a login | Fixed | "Jessica has no login yet - ask a manager to create one in Employees (A-30)." |
| 14 | minor | view-as | "(view as)" suffix for non-super users | Fixed | `SessionProvider` exposes `viewAs` only for the super admin |
| 15 | minor | seed | Encino desk notification points at a Westwood customer | Fixed | Assigned to `usr_desk_ww` |
| 16 | major | components | `StatusBadge` has no meta | Fixed | `src/components/atom/StatusBadge/` (+ meta with all statuses, customer labels, sizes); `Badge.tsx` re-exports |
| 17 | major | rules | 13 spec rule ids missing from the registry | Fixed | R-A09, R-H01, R-H02, R-I04, R-K07 implemented; R-J09 deprecated; R-J11 implemented |
| 18 | major | specs | 12 empty `rules`, 15 empty `data` | Fixed | Tooling specs cite R-X80 / R-X81 / R-M04 and the tables they read (`rules`, `page_layouts`, `qa_runs`, `audit_log`); C-78 / C-79 cite R-X39 / R-M05; HUB-02 cites the new R-X88 (route guard) |
| 19 | minor | rules | 19 catalog rows missing | Fixed | Added to `pricing.ts`, `operations.ts`, `vaccines.ts` with the statuses suggested (implemented / in_dev / requested / deprecated with the resolution) |
| 20 | minor | rules | Capacity rules displayed, not enforced | Fixed (status) | R-E13 -> `in_dev` pointing at C-60 / F-14 / A-10; R-E11 / R-E12 marked informational (rooms drive availability); R-E10 points at the slot finder that enforces it. Enforcing daycare capacity in the booking flows is deferred to the daycare desk pages (F-40..F-49) |
| 21 | minor | rules | Rule pages reference F-20 / F-40; 4 rules in no spec | Fixed | Pages repointed at F-12 / F-59 / C-63 / F-14 / F-11; A-20 spec lists R-D09, R-D10, R-D12 |
| 22 | minor | tables | 4 tables with zero seed rows | Fixed | One demo row each: `auth_codes`, `account_deletion_requests`, `groomer_column_prefs`, `page_layouts` |
| 23 | minor | specs | `spec.roles` vs `route.roles` on 16 routes | Fixed | F-01 spec includes groomer (route was right); C-70..C-84 routes use `['customer']` (super admin passes `hasRole` anyway) |
| 24 | minor | components | `atom/Radio` registers as `RadioGroup` | Fixed | Folder and files renamed to `RadioGroup/`, 10 imports updated |
| 25 | minor | rules | 7 implemented rules without `implementedIn`; bug rows | Fixed | `implementedIn` filled; R-F06 / R-G15 retitled as positive rules. `DEFAULT_HOTEL_SETTINGS` fallback stays (only hit when the settings row is missing; values on the needs-Justin list) |
| 26 | blocker | F-12 | White screen for app bookings (`quote.lines` not iterable) | Fixed | `quoteLinesOf()` / `quoteNotesOf()` in `src/domain/booking.ts` used by F-12, F-59 and C-39; `ErrorBoundary` organism around every route so a page error never blanks the shell |
| 27 | major | data | F-56 does not refresh after Verify | Fixed | `MockProvider.insert / update` replace the table array (fresh reference); verified 1 -> 0 without reload |
| 28 | major | chat | Links to `/app/chat` | Fixed | Staff-reply notification deep-links to `/app/inbox/<conversation>`; C-55 / C-64 buttons and the seed notification point at `/app/inbox` |
| 29 | major | C-10 / C-13 | Grooming / daycare cards link to missing routes | Fixed | Grooming items resolve their `grooming_orders` row -> `/app/grooming/orders/<id>` (hub fallback); daycare -> `/app/daycare/bookings/<id>` |
| 30 | minor | seed | Chat timestamps later today; staff reply quotes a price | Fixed | Core chat thread stamped relative to seeding time (3 h ago, one day apart per thread); reply reworded without a price (R-M10) |
| 31 | minor | F-13 | Timeline "Checked in" only assigns the room; popover clips | Fixed | Check-in from the popover opens the room picker with "Assign & check in" and calls `changeStatus(..., 'checked_in', { roomId })`; popover flips above the block near the bottom |
| 32 | minor | StatusBadge | `customer` prop ignored | Fixed | Customer labels from `BOOKING_STATUS_CUSTOMER_LABEL` (R-I04) |
| 33 | minor | domain | Check-in not PIN-gated | Deferred (needs Justin) | Recorded as D-179 proposed; the current exemption stays until decided |
| 34 | minor | data | Daily reseed wipes user data | Fixed | `MockProvider.carryOver()` keeps rows with runtime ids across the daily reseed (edits to seeded rows still reset) |
| 35 | minor | Toast | Toasts linger / stack over the footer | Fixed (CSS) | Phone widths: viewport sits above the bottom nav, stack capped at 2; 4 s auto-dismiss confirmed in code (headless screenshots froze timers) |

Re-verification: `docs/qa/e2e-shots-fixes/` (screens from `scripts/qa-fixes-e2e.mjs`), `docs/qa/responsive-report.{md,json}` (full matrix).
