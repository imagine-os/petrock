# Figma deep-dive: Petrock Main / page "new(justin + Mark)" (404:14656)

> **Derived 2026-09-17; Figma API quota (Starter tier) exhausted mid-pass, 429 with Retry-After ~4.6 days, so text-level coverage of Sections 22/14 is partial; items marked (verify) need a second pass after ~2026-09-22.** Renders referenced below live in `renders/`; the draft tokens section is also extracted to `../design/tokens-draft.md`.

Follow-up to `analysis.md` (the first-pass inventory), incorporating Justin's decisions (Section 22 + Section 14 = approved scope; Control Panel = owner/super-admin; Day care / In Home not built; vaccines and hotel reservations must be first-class; Spa = Grooming; reports + employees in scope as "extras"; design system to be rebuilt from this page).

## Coverage caveat (read first)

Figma's REST API cut us off part-way through this pass. The token is on a **Starter** plan and every request to `/v1/files/:key/nodes`, `/v1/files/:key` and `/v1/images` now returns `429 Rate limit exceeded` with `X-Figma-Rate-Limit-Type: high` and `Retry-After: ~397,700 s` (about 4.6 days). This is a plan-tier quota, not a burst limit, so retries within this session cannot succeed. Before the cut-off we fetched **18 additional frames at depth 4-6** plus a partial subtree that includes pieces of the Design System page. Everything below is built from:

- `figma-mark-page.json` (page at depth 2), `figma-nested-sections.json` (16 nested sections at depth 1), `figma-banners.json` (banners + timeline container at depth 3 + Control Panel screens 1/2/5/10 at depth 3)
- `nodes/*.json` - 18 deep frames: Choose Vaccine, Pet Edit 3, Hotel Reservation, Hotel Flow, Day care x2, Popup, change Password, forget password, Invoice (593:15939), Customer & Pets frames (598:21062, 601:24910), Amenities (602:8690), All Reservations (598:23506), notification wording (636:9009), report, settings, education
- `test_files.json` - sign in (1841:45239) + Invoice + the referenced component masters on pages "Design System" and "user flow"
- the three existing PNG renders (`overview-*.png`) and 4 zoom crops made from them

Rows marked **not inspected** below are judged from the frame name, size, and direct-child names only (sidebar variant, container names). Items marked **(verify)** need either a fresh API window (after the Retry-After expires, or a Professional-plan token) or a look in the Figma UI. Recommendation: ask Justin whether a Professional-tier token exists, or plan a second pass after ~Sep 22.

---

## 1. Gap check

### Canonical screen set (approved scope)

**Customer app - Section 22 (1841:50551), 48 mobile frames, 9 flows**

| Flow (nested section) | Screens |
|---|---|
| Onboarding / Password (Sec 16) | Create Account, sign in ("Hello Evana! Welcome Back to the Petrock"), forget password, change Password, Popup (password reset success) |
| Home + Add pet (Sec 15) | Home Page x4 (states), Pet Edit (Add Pet form w/ step progress), Pet Edit 5, Pet Edit 6, Pet Edit 7, Checkout. Rule note: "If Dog is 55lb or greater Must be Suite" |
| Boarding (Sec 20) | Hotels (locations Westwood / Encino, BOOK NOW), Choose Your Room Type (Penthouse $150/night, Suite $105/night), Choose Pets (pet cards + calendar + check-in/out date & time), Booking Details Add Pets x2 = "Additional Pet Details" (medication/supplements, feeding times, flea/tick, notes, a date field), Booking Detail = "Estimate" (Pay Deposit / Pay in full), Checkout (card, tips 10/15/20/custom, Confirm Booking) |
| Credit Card (Sec 22 inner) | Booking Details Final Customer Details (+ duplicate 1841:46299) |
| Chat (Sec 17) | notification, Message Support x2 |
| Grooming (Sec 18) | grooming package x2, Grooming Add-On, Checkout x3 (variants), Payment |
| Spa (Sec 19) | Spa Flow, grooming package x2, Grooming Add-On, 2 "Conditions" stubs |
| Settings & Profile (Sec 21) | profile, My pets, Pet Profile (Single Pet), edit profile, setting, language |
| Daycare (Sec 23) | DayCare Flow, DayCare x3 + rules note |

**Front desk web - Section 14 (1813:146926), 31 desktop frames (+4 timeline variants)**

| Nested section | Screens |
|---|---|
| Sec 6 Boarding Table view | front desk x3 = "Hotel Reservations" spreadsheet (see section 2) |
| Sec 11 Timeline view | container 1813:59996 with all reservation grooming x4 |
| Sec 10 Groom | Grooming x1 |
| Sec 7 Grooming Agenda list | front desk x3 |
| Sec 13 Message | message x1 |
| Sec 12 Adds | Groom booking, Board booking, Pet details, Customer details forms |
| Sec 8 Control Panel (Draft) | screens 1-15 (owner/super-admin per Justin) |

### Older-generation frames with no counterpart in the canonical sets

Verdicts: **KEEP** = useful content missing from Section 22/14, port it; **SUPERSEDED** = same purpose exists in canonical set; **NEEDS-DESIGN** = the purpose is in scope but no adequate screen exists anywhere; **SHELL** = frame is only sidebar + top bar with no content.

| Frame | id | What it actually shows (from TEXT nodes / children) | Verdict |
|---|---|---|---|
| Choose Vaccine | 443:17908 | "Please choose your pet and upload the following vaccine information". Pet cards Jack / Riff / Jumba each with a date (3-03-2024) and status badge Active / Pending. Three vaccine rows: **Distemper/Parvo, Bordetella, Rabies**, each with an Upload control (".jpg, .png, .gif, .pdf") and a Submit button. Note above it on canvas: "THIS SCreen Is Getting Replaced". | **KEEP / NEEDS-DESIGN**. The only vaccine-upload UI in the whole page. Nothing in Section 22 replaces it (Pet Edit 5-7 not inspected, see caveat). Justin says vaccines are important throughout, so this must be re-designed into the Add-pet flow and the Pet Profile, not dropped. |
| Pet Edit 3 | 443:17941 | "Pet Details" step 2 of 2: socialized with Humans/Dogs; personality Shy/Calm/Hyper/Aggressive; providing own food Y/N; meals per day (AM & PM); AM / Mid Day / PM feeding instructions; can have treats. | **Probably SUPERSEDED by Pet Edit 5/6/7** (Section 15 has a 4-step Add-pet sequence: Pet Edit 1082h, 5 895h, 6 895h, 7 1091h). **(verify)** that feeding/personality questions survived; if not, KEEP. |
| Hotel Reservation | 1807:27133 | "Hotel Reservation - Select Your Pet" pet cards (date + Active/Pending badge), toggle "Do you want your pets to share a room?", calendar (February 2024), next. | **SUPERSEDED** by Section 20 Choose Pets (same pets + calendar). **KEEP the "share a room" toggle** - it is absent from the Section 20 texts we can see (verify in Choose Pets 1841:46557). |
| Hotel Flow | 1805:24855 | "Locations" screen: Hotel Cards for Westwood and Encino, copy "Petrock Penthouses offer a TV, premium bed, toys, potty pads, room service, playtime, 2 walks per day, photos and videos every night, a bedtime tuck in and tummy rub." BOOK NOW. | **SUPERSEDED** by Section 20 Hotels (identical). The amenity copy is useful content for the room-type data model. |
| Day care (coming soon) | 736:11010 | Placeholder: "daycare service coming soon". | SUPERSEDED (Section 23 has actual Daycare screens). |
| Day care / In Home | 739:11121 | Placeholder: "in home service coming soon". | **SUPERSEDED / out of scope** - only In-Home artefact; Justin: not built. Keep as a "coming soon" state if the nav exposes In Home. |
| Invoice (front desk) | 593:15939 | Grooming **Booking detail** page: customer Michael Davis / email; Pet name Tutu, breed Bulldog; Booking status Confirm; Date 06-29-2024, Time 10:00 AM, Groomer Dr. Benjamin Parker; Payment Status Pending; Contact; Reason: Grooming; Additional information; "Your appointment" summary; total $250.89; EDIT. | **KEEP (as booking-detail / invoice view)**. Section 14 has add-forms (Sec 12) and lists, but no read-only booking detail / invoice page. Needed by front desk. |
| Customer & Pets - Frame | 598:21062 | "add customer" shell with "additional services" - mostly empty (8 texts). | SUPERSEDED by Sec 12 Customer details form. |
| Customer & Pets - Frame | 601:24910 | **Customer Details** form: first/last name, status, Address, Town/city, state, zip, mobile, Email, alternate phone, preferred contact method, reference; **attribute checklist: arthritis, barks, bites, blind, deaf, escaper, lead on in cage, muzzle, old, vaccination**; note (0/100); Attachment drag-and-drop (SVG/PNG/JPG/GIF max 400x400); Cancel / Add Customer. | SUPERSEDED by Sec 12 Customer details (1813:33391), **but verify** the attribute checklist and attachment survived. Note: "vaccination" here is a checkbox attribute, not a record. |
| Amenities | 602:8690 | **Pet Details** form (the "add new pet" panel): first name, type (dog), status (active), breed (+Add New breed), size, sex, mixed, color, temper, weight, date of birth (MM-DD-YYYY), vet / VET registration number, microchip number, attributes (same list incl. **vaccination** checkbox), mobile, email, reference, note, Cancel / Add pet. | SUPERSEDED by Sec 12 Pet details (1813:32944, 1694h - taller, so likely a superset). **Vaccine gap**: no vaccine type / date / expiry / proof fields, only a checkbox. |
| All Reservations | 598:23506 | **Hotel Reservations** table (the Boarding Table view). Columns: ID, Status, Customer, Hotel Room, Date In, Time In, Date out, Time Out, Nbr days, pet(s), Breed, Pet count, Mobile, Home, Total Charge, Deposits, Balance, Booking notes. Row groups ARRIVING (34), DEPARTING (18), Checking out (18). Sample row: #1 Completed, Mr. Maegan, 105 - Rock, 09:00, 02 nights, Blue / Bulldog, $150 / $0. Button "+ Hotel Reservation". | SUPERSEDED by Sec 6 (render matches). Column list is authoritative for the data model. |
| notification wording | 636:9009 | Same Hotel Reservations shell with only "+ Hotel Reservation" and Log Out visible at depth 6 - the notification copy sits deeper (toast/modal). | **(verify)** - likely a toast/notification-copy variant of Sec 6. Treat as content reference for notification strings. |
| report | 660:20003 | sidebar/Reports + top bar only. | **SHELL / NEEDS-DESIGN**. Reports are in scope (Justin) and no reports screen exists anywhere. Stray widgets Group 2914xx ("Income Analysis", axis 100/50/-50/-100) at x -2050 y 42k are the only report fragments. |
| settings | 661:20411 | sidebar/Settings + top bar only. | SHELL; superseded by Control Panel 1/12-15 (owner) - front-desk-level settings still NEEDS-DESIGN if staff need any. |
| education | 661:21269 | sidebar/Education + top bar only. | SHELL. "Extras" - park. |
| reviews | 661:21616 | not inspected; sidebar/Reviews + Frame 2019 (1143x1024) content container. | Extras - park; content unknown (verify). |
| education (2nd, under "reviews" banner) | 661:21860 | sidebar/Tasks + top bar only. | SHELL (Tasks). Park. |
| employees | 661:22104 | not inspected; sidebar/Employees + Container 1149x951. | **KEEP purpose** (user management required). Content unknown (verify) - likely staff list. |
| employees | 682:10902 | not inspected; sidebar/Employees + Container 1145x818. | KEEP purpose; variant (verify). |
| add employees | 685:10951 | not inspected; sidebar/Employees + Container + **Popup** 1440x1282 overlay = add-employee modal. | **KEEP** - only add-staff UI. |
| employees (check list) | 740:11023 | sidebar/Employees + top bar only. | SHELL. |
| employees (banner "walking") | 661:22347 | sidebar/Walking + top bar only. | SHELL. Walking = extras. |
| day care (desktop) | 661:22591 | sidebar/Day Care + top bar only. | SHELL. Daycare front-desk view NEEDS-DESIGN if daycare ships. |
| Management front desk | 487:13977 | not inspected; sidebar/Settings + two content frames (846h + 654h) at 1432x1663. | Owner dashboard candidate; probably an ancestor of Control Panel 12-15 (same 1432x1663 size). SUPERSEDED by Sec 8 (verify). |
| Management front desk | 487:14241 | not inspected; sidebar/Settings + 6 stat/card frames (476x243, 626x243, 1153x327 x2, 548x423, 581x183). | Owner **dashboard with KPI cards** - no equivalent in Sec 8 texts we have. **KEEP as reports/analytics reference** (verify). |
| top row front desk | 443:13228 | not inspected; sidebar/Default + one 1527x1447 container + Button. | Early dashboard/home. SUPERSEDED (verify). |
| top row front desk | 462:11197 | not inspected; "All Statistic" strip (1139x152) + Frame 1000002959 (536h) + Button. | **Front-desk home with statistics row** - Section 14 has no home/dashboard screen. **KEEP as reference / NEEDS-DESIGN** for a front-desk home. |
| top row front desk | 444:19287 | not inspected; Header instance + Frame 3 sidebar + **"OTP Verify" (301x332)** + full-screen Rectangle 5500 overlay. | **KEEP** - OTP verification modal is the only artefact for "Pin Code Authentication" in the sitemap. |
| top row front desk | 462:12100 | not inspected; Auto Layout stat rows + Frame 1171276268/269 (booking detail pattern like 593:15939). | Likely another booking-detail / dashboard variant; SUPERSEDED (verify). |
| Add New Booking - Light | 462:15090, 598:22838, 594:16539 | not inspected; sidebar/All Booking + form container 1154x1335. | SUPERSEDED by Sec 12 Groom/Board booking forms. |
| add new customer / add new pet | 590:21566, 590:25347, 598:21445, 598:21497 | contain the "Amenities" form panel above. | SUPERSEDED by Sec 12. |
| Grooming (old) | 443:14162, 443:14366 | not inspected; 443:14366 has a **Calendar** (353x314) popover + filter bar 654x40. | SUPERSEDED by Sec 10 / Sec 7. |
| all reservation grooming (old) | 443:13910 | same skeleton as the Sec 11 timeline frames (Frame 1171276318 1314x951, filter bar 691x40, two ellipsis menus). | SUPERSEDED by Sec 11 (it is the first timeline). |
| message (old) | 640:9218 | sidebar/All Booking + Frame 1000002790 (1142x976). | SUPERSEDED by Sec 13. |
| Nave menu sidebars | 1598:57148 / 57226 / 57306 | not inspected; 243 / 84 / 84 wide = expanded + two collapsed states, label "Encino, Los Angeles" (location switcher). | **KEEP** - collapsible nav spec; Section 14 frames use the sidebar instances but the collapsed spec lives only here. |
| Form fields spec | 1698:21684-21687 | not inspected; Groom Booking / Board Booking / Pet Details / Customer Details at 1966-2532 px wide + 50 redline LINEs. | **KEEP** - field-level spec (redlines) for the four Sec 12 forms; use as the field inventory when building. |
| Section 5 "Before" | 1740:73173 | pasted legacy screenshots. | Reference only. |
| Bookings component instance | 522:19275 | "Upcoming Bookings" card. | Component reference (My Reservations: Upcoming / Previous in sitemap). |

**Net additions to build beyond Section 22/14:** (1) vaccine upload/records (Choose Vaccine, re-designed), (2) booking detail / invoice page, (3) employees list + add-employee modal, (4) reports/analytics (only fragments exist), (5) collapsed-nav states + location switcher, (6) OTP / pin-code modal, (7) front-desk home/dashboard with stats, (8) the Form-fields redline specs as the source of truth for the four forms.

---

## 2. Timeline & table views

### Timeline view (Section 11, container 1813:59996, four `all reservation grooming` frames 1813:57965 / 58170 / 58418 / 58674)

What we could read at depth 3: each frame = sidebar/All Booking + top bar + Button (172x47, the "+ new" action) + two "Ellipsis horizontal" menus + one content frame `Frame 1171276361` 1314x1032; the 4th variant adds a full-width overlay `Frame 1171276405` 1440x1277 (a modal/drawer open state). **No TEXT nodes were reachable at this depth**, so column headers, row labels and legend could not be extracted. The same skeleton (frame name "all reservation grooming", filter bar, ellipsis menus) appears in the older 443:13910 and in Sections 3/4 - it was originally the *grooming* "all reservations" screen, then re-labelled "Timeline view" under the Boarding subtitle ("Spreadsheet view that shows checking in, checking out, and staying overnight").

Working conclusion **(verify with a render or deeper fetch)**: the timeline is a Gantt-style grid intended for **hotel/boarding stays** (rows = rooms or reservations, columns = days, blocks = stay spans check-in to check-out); the frame name is a leftover from cloning the grooming list. The Region B sitemap confirms the intent: *Reservations -> Hotel & Daycare Reservations -> Table View | Timeline View*, and *Spa Reservations -> Table View | Board View*. So: **Timeline = hotel + daycare; Spa/grooming gets a Table and a Board (kanban), not a timeline.**

### Boarding Table view (Section 6; identical to 598:23506, confirmed by render)

- Page title "Hotel Reservations", primary button "+ Hotel Reservation", toolbar: date picker ("Today" / month calendar popover in variant 2), View selector, Filters/Columns.
- Row groups (collapsible): **ARRIVING (n)**, **DEPARTING (n)**, **Checking out (n)** - i.e. the spreadsheet is grouped by today's movement, with "staying over" implied by the remainder.
- Columns: ID | Status (pill: Completed etc.) | Customer | Hotel Room ("105 - Rock") | Date In | Time In | Date Out | Time Out | Nbr days | Pet(s) | Breed | Pet count | Mobile | Home | Total Charge | Deposits | Balance | Booking notes.
- Section 1 sits next to a screenshot of the legacy spreadsheet (Ericom AccessNow client) that this replaces.

### Grooming Agenda list view (Section 7; not inspected at depth)

Three `front desk` 1440x1621 frames plus 9 pasted icon images (status icons). Column set could not be read (API cut-off). From the Invoice frame's data model the agenda rows will carry: time, pet name/breed, customer, groomer, service/package, status, payment status. **(verify)**

---

## 3. Vaccines & hotel coverage

Corpus searched: 873 TEXT strings across the depth-2 page, nested sections, banners, 18 deep frames and test_files. Coverage of Section 22/14 screen interiors is partial (most were not fetched before the cut-off).

### Vaccines ("vaccin", "rabies", "bordetella", "dhpp", "distemper", "proof", "expire")

| Where | What |
|---|---|
| Choose Vaccine 443:17908 (old customer row, "getting replaced") | Full upload flow: Distemper/Parvo, Bordetella, Rabies; file types; per-pet Active/Pending status + date. |
| Customer Details 601:24910 (old front desk) | "vaccination" as one checkbox in the pet attribute list. |
| Pet Details / Amenities 602:8690 (old front desk add-pet) | "vaccination" checkbox only; no type/date/expiry/document. |
| Pet cards on Choose Pets / Hotel Reservation / Choose Vaccine | Each pet shows a date (3-03-2024) and a green **Active** / **Pending** badge - almost certainly vaccine (or account) status surfaced on the pet card. (verify semantics) |
| Section 22 canonical screens | **No hits** in what was fetched (sign in, password screens). Pet Edit 5/6/7, Pet Profile, Booking Details Add Pets were not fetched. The "Additional Pet Details" screens (render) contain one date field next to medication questions - could be a vaccine or flea-treatment date. (verify) |
| Section 14 canonical screens | **No hits**; Sec 12 Pet details form not fetched (verify whether it inherited only the checkbox). |
| "DHPP", "proof", "expire" | 0 hits anywhere. |

**Assessment:** vaccines are handled today only in a screen the designer marked as being replaced, and everywhere else as a single yes/no attribute. There is no expiry tracking, no document storage on the pet record, no front-desk view of vaccine status, and no gating of bookings on vaccine validity. Required additions: vaccine records (type, date given, expiry, proof file, verified-by) on the pet entity; upload step in Add-pet and Pet Profile (customer app); vaccine section + verify action on Pet details (front desk); status badge + booking-time check ("Pending" blocks/warns on Choose Pets); expiry reminders in notifications.

### Hotel reservations ("suite", "room", "kennel", "check-in/out", "hotel", "boarding", "reservation", "penthouse")

| Surface | Where it appears |
|---|---|
| Customer app | Hotels (locations), Choose Your Room Type ("Choose your room type"; Penthouse / Suite with nightly price), Hotel Reservation (share-a-room toggle), Boarding Flow banner, rule "If Dog is 55lb or greater Must be Suite", Hotel Flow amenity copy, Estimate ("Hotel Penthouse"), My Reservations (Upcoming / Previous) in sitemap. |
| Front desk | Hotel Reservations table (ARRIVING / DEPARTING / Checking out; Hotel Room column; Date/Time In/Out; Deposits/Balance), "+ Hotel Reservation" button (598:23506, 636:9009), Boarding Table view + Timeline view banners ("checking in, checking out, and staying overnight"), Board booking form (Sec 12, 2297h - the tallest form), Board Booking redline spec. |
| Sitemap (Region B) | Reservations -> Hotel & Daycare Reservations (Table View, Timeline View); Spa Reservations (Table View, Board View); Pricing Rules stub on the hotel row. |
| "kennel" | 0 hits - the vocabulary is **Room / Suite / Penthouse**, use that. |

**Assessment:** hotel reservations are the most complete journey on both surfaces. Gaps: no room inventory/availability admin (rooms are only referenced as "105 - Rock"), no reservation detail/edit page on front desk (only the add form and the table), no check-in / check-out action UI (the table groups imply it but no button/state change was visible), pricing rules are a stub. Room-type constraint (55 lb -> Suite) and shared-room option need to be in the booking engine.

---

## 4. Spa vs grooming

- Section 18 "Grooming Flow": grooming package x2, Grooming Add-On, Payment, Checkout x3.
- Section 19 "Spa Flow": Spa Flow (a 390x937 entry screen, same size as Hotels/DayCare Flow entry screens -> a service landing/location picker), then the **same** grooming package x2 + Grooming Add-On frames, no Payment/Checkout of its own, plus two "Conditions" stubs (Group 1171275506 39h, Group 1171275507 69h - the taller one has two lines).
- Region B row y 3107: Spa Flow 1805:25012 -> grooming package ("grooming Reservation") x2 -> Grooming Add-On, with the same two **"Conditions"** groups (1807:28469, 1807:28479) placed above the package screens. The old hotel row has a "Pricing Rules" group (1805:27130). These stubs hold only the word "Conditions" - they are placeholders for business rules to be written, not UI.
- Daycare note (Section 23 / 1808:28773): "Rules: If Daycare is less than x time, then there's not enough time for spa? Daycare timing, and spa time logic need to work proper. If adding spa 2 pets over 5 hours. $5 discount for 2nd pet."
- Sitemap: "Spa Reservations -> Table View | Board View" on the front-desk side, while the front desk sections are all named **Groom / Grooming** (Sec 7 "Grooming system: Agenda list view", Sec 10 Groom, Sec 12 Groom booking).

Differences in treatment: only naming and the presence of a Spa landing screen; the package/add-on/checkout screens are literally the same frames. **Recommendation: one flow named "Grooming"** in code and UI (`grooming` service type; "Spa" as an optional marketing label / package category), with the Spa entry screen folded into the Grooming landing. Capture the "Conditions" as configurable rules on the grooming service: minimum daycare duration to add grooming, multi-pet discount ($5 for 2nd pet), duration/slot logic.

---

## 5. Design System page (58:118) and older pages

Only the components referenced by the fetched frames came back (the full-page fetch was blocked), so this is a partial view:

- Page **Design System 58:118** contains at least: frame **ICON SET (58:8763)** with sub-frames **UI** (e.g. `Question_light`) and **Chart** (`pie_chart_light`, `Chart_light`) - an icon library using a `<name>_light` naming scheme; and frame **Button (188:5725)** holding component set **Button 188:5727** (variants `Icon Only x Size (2xs/md/lg) x Type (Fill/Outline) x State (Active...)`). Styles attached to that page: FILL `fill_icon`, `line_icon`, `Theme 1`, `Shy Black - 100`; TEXT `Text xs/sm/md Regular`, `Link bold`; EFFECT `Shadow md`.
- Component set **Input Field 264:944** (`Size=2xl, Type=Default, State=Disable`, ...) and the **Huge-icon/...** icon components (`interface/outline/notification`, `communication/outline/chat-notification`, `user/outline/user`, `arrows/outline/direction-right 01`, `interface/outline/information-circle`) live on other pages (ids 188.., 217.., 264..) - i.e. Hugeicons outline set is the second icon source.
- Page **user flow 162:1853** holds the master components `top bar` (421:10167) and `sidebar/Default` (421:10140) inside a frame named "front desk" - the shell components are not on the Design System page.
- Pages **Final UI 203:1960** and **front desk 157:4274** returned no children in the subset (nothing referenced from the new page) - consistent with them being older, unreferenced work. Counts could not be taken (429).
- Conclusion matches Justin: there is no usable, consolidated design-system page; the styles are split across pages with duplicate names (White x3, Line x2, Shy Black x2). Rebuild fresh.

---

## 6. Draft tokens (DERIVED - from 1,458 scanned nodes, not from a designer-authored system)

### Colors observed (solid fills, top 30, with usage counts)

| Hex | Count | Used on | Reading |
|---|---|---|---|
| #FFFFFF | 234 | frames, instances, text-on-purple | surface / on-primary |
| **#552583** | 153 | buttons, sidebar active, banners, headings | **brand primary (purple)** |
| #000000 | 86 | text | text default (old screens) |
| #F4F0FF | 57 | frames | primary tint / hover / selected row |
| #F4F6FA | 41 | frames | app background (desktop) |
| #D9D9D9 | 33 | rectangles, sections | placeholder grey |
| #EEF2F5 | 22 | frames | table header / card bg |
| #EBF1FE | 17 | text | text on dark? (light blue tint) |
| #F2F2F2 | 17 | rectangles | divider / disabled |
| #0E0C11 | 15 | vectors, text | ink (near-black) |
| #E6E6E6 | 12 | sections | canvas |
| #11104A | 9 | text, frames | heading navy |
| #E8DFF5 | 8 | ellipses | avatar bg (lavender) |
| #039B00 | 5 | text | success / "Active", "Completed" |
| #F7F7F7 | 5 | frames | subtle bg |
| #93939C | 4 | text | muted text |
| #FBF8FF | 4 | frames | primary tint 2 |
| #323232 @80% | 4 | rectangles | modal scrim |
| #7C7E93 | 4 | text | secondary text |
| #DED0E9 @50% | 3 | frames | primary tint border |
| #808080 / #757575 / #A1A1A1 | 2 each | text | placeholder text |
| #E79DD1 | 2 | ellipse | pink accent (avatar) |
| #AEDDE6 | 2 | rectangle | teal tag |
| #F04336 | 2 | rectangle | error / danger |
| #1456F5 | 1 | text | link blue |
| #4552CB @10% | 1 | rectangle | info tint |
| #1C1C24 | 1 | rectangle | dark surface |
| Strokes: #EDEDED 43, #B6B6B6 31, #552583 15, #D8DADE 5, #E0E0E0 4, #222222 5 | | | border-light, border-strong, border-primary |

Text styles named in the file point to a `Colors/Theme colors/secondary`, `Colors/Text colors/heading|body`, `Colors/BG, Icon, Boarder colors/background|border-light|white`, `Foundation/Blue/B0`, `Lazy Violet-300`, `Shy Black-100` taxonomy - use these as the seed names.

### Proposed color tokens

```
--color-primary-600: #552583   (brand purple, buttons, active nav, banners)
--color-primary-700: #43196A   (derived hover, not observed)
--color-primary-100: #E8DFF5   (avatar / chip bg)
--color-primary-50:  #F4F0FF   (selected row, hover, tinted cards)
--color-primary-25:  #FBF8FF
--color-secondary-500: #E79DD1 (pink accent - observed once, confirm)
--color-ink-900: #0E0C11       (primary text)
--color-ink-800: #11104A       (headings, navy)
--color-ink-600: #7C7E93       (secondary text)
--color-ink-500: #93939C       (muted / placeholder)
--color-border-strong: #B6B6B6
--color-border: #EDEDED
--color-border-subtle: #D8DADE
--color-bg-app: #F4F6FA
--color-bg-surface: #FFFFFF
--color-bg-table-head: #EEF2F5
--color-bg-subtle: #F7F7F7
--color-success: #039B00
--color-danger:  #F04336
--color-info:    #1456F5
--color-info-tint: rgba(69,82,203,.10)
--color-scrim: rgba(50,50,50,.80)
```
Dark mode: invert the ink/bg ramps (bg-app #0E0C11 / surface #1C1C24, ink-900 -> #F4F6FA), keep primary-600 but lift it to ~#7B4FB0 for contrast on dark; expose everything via CSS variables so theming is a token swap.

### Typography observed (screen-level; banner labels at 36-128 px excluded)

Families: **Open Sans** (dominant in screens; 600 @ 20 px is the page/screen title), **Inter** (14 px 500/400 body in newer components, styles `Inter/14/Regular`, `Inter/20/Semi Bold`), **Be Vietnam Pro** (14/16 px 400/500 in the auth screens), Lexend (banners only), Epilogue (1 stray). Sizes seen: 8, 10, 12, 14, 15, 16, 20, 22 px; line-heights ~1.2-1.7.

Proposed scale (pick **one** family - recommend Inter for product UI; Open Sans if brand insists):
```
--font-sans: "Inter", system-ui, sans-serif
--text-xs: 12px / 16px   (table meta, badges)          [observed OS 400 12/17, style Text xs]
--text-sm: 14px / 20px   (body, inputs, table cells)   [observed Inter 500 14/24, OS 600 14/24]
--text-md: 16px / 24px   (body large, card titles)     [observed OS 400 16/24, BVP 500 16/26]
--text-lg: 20px / 28px   (screen/page titles)          [observed OS 600 20/35 x34]
--text-xl: 24px / 32px   (dashboard headings h4)       [style Dashboard Typography/Heading/h4]
--text-2xl: 32px / 40px  (hero / KPI numbers)
weights: 400 regular, 500 medium, 600 semibold (700 only for KPI numbers)
```

### Spacing & radii

Radii observed: 0 (50, mostly rectangles), **8 px (38 - inputs, cards, buttons)**, 10 px (18 - mobile cards/pet cards), 24 px (6 - pills/badges), 12 px (3), 16 px (2), 50 px (2 - avatars/circles), 2-4 px (small chips/checkboxes).
```
--radius-xs: 2px   --radius-sm: 4px   --radius-md: 8px (default)   --radius-lg: 12px   --radius-xl: 16px   --radius-pill: 24px/999px   --radius-round: 50%
--space: 4-pt grid: 4, 8, 12, 16, 20, 24, 32, 40, 48 (mobile screen gutter 20 px = (390-350)/2 from Text Input 350 wide; desktop sidebar 243 expanded / 84 collapsed; top bar 80 high; table row ~48)
--shadow-md / --shadow-xl : reuse the two EFFECT styles
```

### Icons

Two sources in use: (1) **Hugeicons outline** (`Huge-icon/<category>/outline/<name>`: notification, chat-notification, user, direction-right, information-circle), (2) a custom `_light` / `_line_light` set on the Design System page (`Home_light`, `Setting_line_light`, `Question_light`, `pie_chart_light`, `Chart_light`), plus one-offs `Expand_left` (back chevron, 32 uses), `Ellipsis horizontal 1 - 16px`, `Arrow-Left`, `Message`, `logo_icon 1` (42x40 brand mark), iOS status-bar glyphs (Wifi, Mobile Signal). Recommendation: standardise on one outline set (Hugeicons or Lucide) at 16/20/24 px, keep `logo_icon` as the only custom asset.

---

## 7. Renders

New renders could not be produced: `/v1/images` returned 429 (plan quota) on every attempt for 443:17908, 1841:44669, 1813:59996 and 1813:128225. Existing renders from the first pass remain: `overview-boarding-flow-section20.png` (Section 20 mobile flow), `overview-boarding-table-view-section1.png` (Boarding Table view + legacy screenshot), `overview-onboarding-flow-section16.png`. Zoom crops made from those (3-4x upscale, still low-res) are saved as `render-zoom-addpetdetails.png`, `render-zoom-estimate-checkout.png`, `render-zoom-choose-room-pets.png`, `render-zoom-table.png`.

Re-run when the quota resets (Retry-After points to ~Sep 22) or with a Professional-tier token: `python3 render.py 0.35 "443:17908=choose-vaccine" "1841:44669=section15-home-addpet" "1813:59996=timeline-container"` and `python3 render.py 0.25 "1813:128225=section8-control-panel"`; and `./run_queue.sh` to finish the deep fetch of all canonical frames (`fetch2.py` uses `/v1/files?ids=&depth=` and caches into `nodes/`).

---

## Appendix - open verifications (need API window or Figma UI)

1. Pet Edit 5/6/7 (Section 15): do they contain a vaccine upload step? feeding/personality questions from Pet Edit 3?
2. Choose Pets 1841:46557: does it have the "share a room" toggle?
3. Sec 12 Pet details (1813:32944): vaccine fields beyond the checkbox?
4. Timeline frames: exact rows/columns/legend; render one.
5. Section 7 agenda list columns; Sec 8 Control Panel screens 3-15 content (owner scope).
6. 462:11197 "All Statistic" home, 487:14241 KPI dashboard, 444:19287 OTP Verify, 685:10951 add-employee popup, 661:21616 reviews, Nave menu collapsed states, Form-fields redlines.
7. Full Design System page 58:118 inventory (frames/components counts) and confirmation that 203:1960 / 157:4274 are unreferenced.
