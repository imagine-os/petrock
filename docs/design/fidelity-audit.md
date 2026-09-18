# Figma fidelity audit - what the build must change to match the artwork

date: 2026-09-18 · prompt: `docs/prompts/0009-figma-fidelity-audit.md` · status: part (a) implemented (prompt 0010), parts (b) / (c) open · **decision numbers**: the D-185..D-188 proposed below were logged as **D-188..D-191** (D-185..D-187 were taken by prompt 0011 while this audit was written): D-185 -> D-188 fonts, D-186 -> D-189 home, D-187 -> D-190 wizard stepper, D-188 -> D-191 hotel flow · owner of the follow-up: the three implementation agents named in section 5

Justin (2026-09-18): "get the design to actually look closer to the artwork. From figma, the icons, the colors, especially the homepage on mobile, everything needs to match the exact styling from before. Please fix this at the design system level."

This audit compares the Figma customer app and front desk artwork with v0.1.0 and says, per token, icon, component and screen, what changes and where. Every Figma value carries the node id it was read from (raw node JSON, `scratchpad/nodes/*.json`, `figma-mark-page.json`; pixel reads from `docs/figma/exports/petrock-main/*.png` are marked **px**). Design images and docs were treated as data.

Sources: node JSON of 18 deep frames (Hotel Flow `1805:24855`, Hotel Reservation `1807:27133`, Pet Edit 3 `443:17941`, Choose Vaccine `443:17908`, Day care `736:11010`/`739:11121`, auth `1841:45136/45173/45213`, front desk `593:15939`, `598:23506`, `636:9009`, `598:21062`, `601:24910`, Amenities `602:8690`, report/settings/education `660:20003`/`661:20411`/`661:21269`), depth-2 of every 390 frame on the main page, and the exports listed per screen in section 4. The Home Page `Services` / `Pets` / `Bookings` instances (`528:13558`, `529:13775`, `1824:40234`) were only fetched at depth 1, so their internals come from `Home Page.png`, `Services.png` and `Frame 1171276424.png` (px), to be confirmed against the node JSON after the Figma quota resets (~Sep 22).

---

## 1. Tokens

### 1.1 Colour - mobile (customer app)

| Role | Figma | Evidence (node id) |
|---|---|---|
| Screen background, home | `#FFFFFF` | `1824:40206`, `1217:11166`, `443:17833` frame fills |
| Screen background, list / settings screens | `#F4F6FA` | `1805:24855` Hotel Flow, `716:55038` Hotels, `730:56044` profile, `730:56324` setting, `730:56451` Pet Profile, `730:56556` My pets, `549:7669` notification, `613:22970` Message Support, `621:10262` grooming package, `538:13591` Checkout |
| Screen background, form / booking screens | `#EEF2F5` | `1807:27133` Hotel Reservation, `443:17865` Pet Edit, `443:17941` Pet Edit 3, `443:17908` Choose Vaccine, `443:17987` Add Pets, `443:18126` Choose Your Room, `531:14684` Booking Detail, `533:5293` Payment |
| Section band behind the Services tiles | `#EEF2F5` | px `Home Page.png` (5,215) |
| Primary (buttons, bottom nav, selected pet card, step pointer, header action text) | `#552583` | `1824:40233` Navbar, `1807:27181` Button, `1807:27155` Pets Card selected, `443:17984` Step Pointer, `730:56595` "add Pet" text |
| Primary tint band (grooming upsell block on Estimate) | `#DED0E9` | `542:15049` |
| Primary tint, avatar disc | `#E8DFF5` | `1841:45150` |
| Selected-card border (pets card on home, booking card) | `#9D67EF` 2 px (px reads `#D0ACFF` / `#C8A5FA` anti-aliased) | px `Home Page.png` (17,400), (31,600); matches the `#9D67EF` icon exports |
| Icon purple (settings rows, notification icons) | `#9D67EF` | `Setting.svg`, `Info-Circle.svg`, `Calendar.svg`, `User-1.svg` fills |
| Icon coral (settings rows alternate, danger rows) | `#FD866E` | `Lock.svg`, `Logout.svg`, `Trash Bin.svg`, `Users.svg`, `medal*.svg`; px `profile.jpg` (34,442) |
| Card surface | `#FFFFFF` | `1807:27156` Pets Card, `1807:27162` Check In Out, `626:12758` payment option, `539:14854` checkout card |
| Text: page title | `#000000` | `1805:24877`, `443:17888`, `731:56897` (Open Sans 600 20) |
| Text: card title, input value, pet name (on white) | `#181818` | `I1805:24878;716:55162`, `I443:17975;121:2766`, `I1807:27156;123:1996` |
| Text: heading navy (auth titles, profile name, front-desk names) | `#11104A` | `1841:45170`, `1841:45180`; px `profile.jpg` name `#100F48` |
| Text: body muted | `#7C7E93` | `1841:45171`, `1841:45217` |
| Text: field label / caption / description | `#808080` | `I1807:27183;573:15119`, `443:17934`, `I443:17975;121:2764` |
| Text: card description (hotel card) | `#304050` | `I1805:24878;716:55163` |
| Text: checkbox / option label | `#3B4256` | `I443:17967;121:2956` |
| Text: placeholder / hint | `#A1A1A1` | `I1807:27183;573:15126` |
| Text: section label on home ("Services", "Pets", "Upcoming Bookings") | `#5E6A6C` (px, likely `#7C7E93`/`#808080` at 1x) | px `Home Page.png` (14..70,152..170) |
| Status: active / confirmed | `#27B14E` dot + text on white pill | `I1807:27155;120:1717;119:1533/1534` |
| Status: pending | `#FF7A00` | `I1807:27156;123:1998;119:1542/1543` |
| Status: "Pending & Needs more Details" (home pet card) | `#FF6868` (px) | px `Home Page.png` (160..240,420..445) |
| Status: "Upcoming" (home booking card) | `#62BA20` (px) | px `Home Page.png` (240..320,628..642) |
| Success note ("*pay full upfront to get discount") | `#039B00` | `522:19570` |
| Danger | `#F04336` | `1841:45162` |
| Notification badge dot on nav paw | `#BF0000` 8x7 | `I1805:24880;522:18009` |
| Borders: card outline | `#D8DADE` 1 px | `1807:27162` |
| Borders: header bottom rule | `#B6B6B6` 1 px | `1807:27182`, `626:12620`, `621:10313` |
| Borders: text input | `#F1F1F1` 1 px | `I443:17975;121:2765` |
| Borders: select / input field, tab underline inactive | `#DFDFDF` 1 px | `I1807:27183;573:15121`, `550:8403` |
| Borders: checkout card | `#E0E0E0` 1 px | `539:14854` |
| Stepper track (remaining) | `#D0D5DD` 2 px | `512:20365` |
| Tab underline active | `#000000` 1 px | `550:8397` |
| Scrim | `#323232` @ 80 % | `602:8051` |
| Shadow: pet card | `0 0 5px #441D67` (alpha 1.0 in Figma; render as `0 0 5px rgba(68,29,103,.35)` and verify against `Hotel Reservation.png`) | `1807:27156` effects |

### 1.2 Colour - front desk (1440)

| Role | Figma | Evidence |
|---|---|---|
| App background | `#F4F0FF` | `593:15939`, `598:23506`, `636:9009` frame fills (not `#F4F6FA`) |
| Sidebar | `#FFFFFF`, 243 wide, no right border; logo block separated by `#F3F3F3` 0.5 px; group divider `#D8D9D9` 1 px | `593:16048` sidebar/Default, `I593:16048;418:7406`, `;418:7469` |
| Sidebar active item | text `#552583`, icon `#552583`, no fill (px `front desk.jpg`) ; group labels "MAIN" / "Other" `#7C7E93`, letter-spaced | px `front desk.jpg` |
| Sidebar logout | button 178x52 `#552583` r8, Open Sans 600 14 ls .56 white (`I593:16048;418:7513`) or text link "Log Out" Open Sans 400 14 `#181818` + `Sign_out_squre_light` 20 (`598:24011;1596:32975`) |
| Top bar | `#FFFFFF` 80 tall, bottom stroke `#EDEDED` 1 px, padding 16/20 | `593:16049` |
| Top bar search | 320x48, r8, stroke `#EDEDED`, padding 12/16, search icon 24, placeholder Lexend 300 16 `#292929` | `I593:16049;421:9933;19:11460..11463` |
| Top bar primary button | 172x47 `#552583` r8, padding 10/16, Open Sans 600 14 white, user 20 + arrow 20 | `I593:16049;613:20421` |
| Top bar icons | chat-notification 24, Question_light 24 + "Help" Open Sans 400 14 `#292929`, notification 24, avatar 32 r100, name block, chevron 20; cluster gap 15 | `I593:16049;421:9934..9945` |
| Page header card | `#FFFFFF` 80 tall, padding 14/25, title Be Vietnam Pro 500 20/26 `#11104A`, EDIT button 99x52 r8 Be Vietnam Pro 600 14 ls .56 | `593:16044..16047` |
| Content card | `#FFFFFF`, stroke `#F3F3F3`, padding 30, two shadows `0 2 4 -2 rgba(0,0,0,.06)` + `0 5 8 -2 rgba(0,0,0,.08)` | `593:15940`, `593:15958` |
| Table container | `#FFFFFF`, padding 10, gap 11, same two shadows | `598:23508` |
| Table title | Open Sans 700 20/20 `#030C09` | `598:23512` |
| Table head | row 49 tall, fill `#552583`, labels Open Sans 400 10/15 `#FFFFFF`, checkbox 10x10 r3 stroke `#D8D9D9` | `598:23519..23539` |
| Group tab ("ARRIVING (34)") | Open Sans 600 14/22.4 `#808080` + `Arrow_drop_down` 42x37; 37..42 tall | `598:23540..23542` |
| Table row | 44 tall, bottom stroke `#D4D4D4`; cells Open Sans 400 10/15: id / room / breed `#7C7E93`, customer `#11104A`, dates `#181818`, times / counts / phones / money `#552583` | `598:23543..23562` |
| Table (forms variant) | outer stroke `#B9B9B9` r4, cells `#000000` @ 6 % zebra | `601:24372`, `601:24399` |
| Status badge (table) | 73x26 `#E9FBF7` r4, padding 8/16, text `#25D9AB` Open Sans 400 10/15 | `598:23563/23564` |
| Status text (detail card) | Confirm `#148F00`, Pending `#FD866E`, Be Vietnam Pro 500 18/23.4 | `593:15957`, `593:15973` |
| Detail card labels / values | label Open Sans 400 14/24.5 `#7C7E93`; value Open Sans 600 18/23.4 or Be Vietnam Pro 500 18/23.4 `#11104A`; name Be Vietnam Pro 500 20/26 `#11104A`; email Be Vietnam Pro 400 16/28 `#7C7E93` | `593:15944..15957` |
| Secondary tab pill | `#F7F7F7` fill, 40 tall | `1813:128830` |
| Gradient button (control panel) | linear `#8B47D3` -> `#6137EE` top-to-bottom | `601:25178` |
| Scrim | `#323232` @ 80 % | `1813:129566` |

### 1.3 Typography

The mobile screens are **Open Sans** (≈70 of the ≈85 text nodes in the deep 390 frames). **Be Vietnam Pro** carries the auth section and the front-desk detail cards, **Lexend 300** only placeholder / hint text, **Inter** appears once (`1807:27470`), **Plus Jakarta Sans** once (step number `443:17985`). The build uses Inter everywhere (`type['font-sans']`), which is why every screen reads "off" even where colours match.

| Text role | Figma family / weight / size / line-height / letter-spacing | Evidence |
|---|---|---|
| Page title (mobile header) | Open Sans 600 20 / 35.2 / 0, `#000000`, centred | `1805:24877`, `443:17888`, `549:7894` |
| Header right action | Open Sans 600 14 / 35.2, `#552583` | `730:56595` |
| Section title on home ("Services") | Open Sans 400 16 / 24, grey (px) | px `Home Page.png`; `Services.png` |
| Card title (hotel card, daycare tile) | Open Sans 600 20 / 35.2 `#181818`; Open Sans 700 24 / 35.2 (daycare tile) | `I1805:24878;716:55162`, `736:11148` |
| Pet card name | Open Sans 600 14 / 20 | `I1807:27155;120:1711` |
| Body / input value / option label | Open Sans 600 16 / 24 / 0.16 `#181818` (`#3B4256` for options) | `I443:17975;121:2766`, `I443:17967;121:2956` |
| Body muted (auth) | Be Vietnam Pro 400 14 / 24 `#7C7E93`; Open Sans 400 14 / 24 elsewhere | `1841:45171`, `1841:45217` |
| Field label / caption | Open Sans 400 10 / 15 `#808080` | `I443:17975;121:2764` |
| Card description | Open Sans 400 10 / 15 `#304050` | `I1805:24878;716:55163` |
| Hint | Lexend 300 12 / 15.6 / -0.24 `#A1A1A1` (render as Open Sans 400 12, same colour) | `I1807:27183;573:15126` |
| Primary button (full width) | Open Sans 700 12 / 16.3 white ("Next", "Upload"); variant Open Sans 600 14 / 24 ("Submit", "Done") | `I443:17981;121:2673`, `443:17932`, `I1841:45199;188:5731` |
| Card button ("BOOK NOW") | Open Sans 600 14 / 20, uppercase copy | `I1805:24878;716:55166` |
| Tab label | Open Sans 600 12 / 17.3 active `#000000`, 400 12 / 17.3 inactive | `550:7896`, `550:8402` |
| Status pill | Open Sans 700 8 / 10 | `I1807:27155;120:1717;119:1534` |
| Fine print | Open Sans 400 8 / 12 `#039B00` | `522:19570` |
| Calendar month | Open Sans 600 18 / 20 `#181818` | `I1840:42522;88:1769` |
| Auth title / screen name / label | Be Vietnam Pro 500 22 / 32; 500 16 / 26; 500 14 / 24, `#11104A` | `1841:45170`, `1841:45201`, `1841:45180` |
| Front desk page title | Open Sans 700 20 / 20 `#030C09` | `598:23512` |
| Front desk detail heading | Be Vietnam Pro 500 20 / 26 `#11104A` | `593:16045`, `593:15944` |
| Front desk table cells | Open Sans 400 10 / 15 | `598:23546..23562` |
| Front desk tab / group | Open Sans 600 14 / 22.4 `#808080` | `598:23541` |
| Front desk button | Open Sans 600 14 / 20 (ls 0 or .56) | `I593:16049;613:20421;188:5752`, `I593:16048;418:7514` |
| Front desk labels / body | Open Sans 400 14 / 21 `#030C09` / `#292929`; Open Sans 400 14 / 24.5 `#7C7E93` | `I593:16049;421:10130`, `593:15948` |

The 12 px floor (D-175) stays: the Figma 8 px and 10 px roles render at 12 px (`--fs-xs`) with the Figma colour and weight; note this in the page docs.

### 1.4 Radii

| Component | Figma | Evidence |
|---|---|---|
| Buttons (primary / secondary), payment option card, auth input, top-bar search, sidebar logout | 8 | `626:12758`, `1841:45160`, `I593:16049;421:9933`, `I593:16048;418:7513`; px home tiles |
| Pet card, room card | 10 | `1807:27155`, `443:17935` |
| Text input block | 4 | `I443:17975;121:2765`, home `1824:40239` |
| Table status badge, form table | 4 | `598:23563`, `601:24372` |
| Table checkbox | 3 | `598:23521` |
| Daycare tile | 7 | `736:11146` |
| Status pill / switch | 50 (pill) | `I1807:27155;120:1717` |
| Step pointer, avatar | 100 / circle | `443:17984`, `I593:16049;421:9941` |
| Sidebar nav block | 12 | `I593:16048;418:7408` |

### 1.5 Spacing

| Where | Figma | Evidence |
|---|---|---|
| Mobile screen gutter | 20 (content 350 wide) on booking / form screens; 10 (370 wide) for hotel / room cards; 24 on profile / settings lists; 15 on notification list; 27 on Pet Edit 3 | `1807:27155` x=20, `1805:24878` x=10, `730:56045` x=24, `550:8407` x=15, `443:17975` x=27 |
| Header | back 40x40 at x=10, y=56 (under a 44 px status bar); title baseline y≈58; 1 px `#B6B6B6` rule at y=96..100; content starts y≈110..136 | `1805:24876/24877`, `1807:27182` |
| Bottom nav | 390x71, padding 15 / 27, gap 68, icons 37 (home), 37x27 (ticket), 46x41 (paw group), 34 (settings), no labels | `1824:40233`, `I1805:24880;*` |
| Home blocks (top to bottom) | hero photo 0..142 · Services 144..269 (padding 6 top/bottom, tiles 76 tall at y 178..254, 4 tiles ≈75 wide, gap ≈19) · Pets 284..461 (gap 8) · Bookings 467..729 · "View Past Booking" link y 737 · nav 773 | `1824:40207/40232/40231/40234/40228/40233`; px |
| Pet card | 100x138, padding 7 / 20, gap 5, avatar 60 | `1807:27155` |
| Text Input | label -> field gap 2; field 48 tall, padding 12, gap 10 | `443:17975`, `I443:17975;121:2765` |
| Input Field (select) | label 16 (10 px text + info icon 16), field 28 tall padding 6/12 gap 8, hint 16; total 59 | `1807:27183` |
| Primary button | 339..345 x 48 (padding 12 / 20 or 4 / 8, gap 10); compact 337x40 (padding 12 / 29); card button 106x38 (padding 9 / 13) | `1807:27181`, `657:9332`, `443:17981`, `I1805:24878;716:55827` |
| Stepper | 27 px pointers, 2 px track, pointers 133 apart in a 342 row | `443:17982..17986` |
| Check In/Out card | padding 12, gap 18; row gap 16; input stack gap 12 | `1807:27162..27172` |
| Payment option row | 344x56 padding 16 r8 | `626:12758` |
| Desktop content | sidebar 243, top bar 80, content x=255..271, cards 1159 wide, padding 30; table container padding 10 | `593:15940`, `598:23508` |
| Desktop sidebar | logo block padding 30/75; nav gap 25 between items, group padding-left 27, group gap 35, block padding 25 top/bottom | `I593:16048;418:7406..7473` |

### 1.6 Shadows / effects

| Where | Figma | Evidence |
|---|---|---|
| Mobile pet card (unselected) | drop shadow `0 0 5` `#441D67` | `1807:27156` |
| Desktop cards, table container, top bar | `0 2 4 -2 rgba(0,0,0,.06)` + `0 5 8 -2 rgba(0,0,0,.08)` | `593:15940`, `1813:128559` |
| Everything else | none (borders carry the edge) | |

### 1.7 Icon sizes and stroke

Mobile: header back 40x40 hit area with a 10x20 chevron stroked `#33363F` 2 px (`I1805:24876;58:2821`); nav icons 34..46 px white 1 px outline (`Home_light`, `Setting_line_light`) or white filled shapes; in-field icons 14..24 (Huge-icon outline, 1.5 px `#292929`/`#A1A1A1`); settings rows 20 px two-tone filled (`Setting.svg` etc.); service tiles ≈36..40 px white 1.5 px line art (px). Desktop: 20..24 px Huge-icon outline 1.5 px; sidebar icons ≈22 px line; `Iconly/Two-tone` 12..20 px, stroke 1.3.

### 1.8 Token delta table (Figma vs `src/design/tokens.ts`)

| Token | Figma | Current | Action |
|---|---|---|---|
| `font-sans` | Open Sans 400/600/700 (mobile + front desk) | Inter | Replace with `'Open Sans'`; add `font-display: 'Be Vietnam Pro'` 400/500/600 for auth titles, profile name, front-desk detail headings; load via `@fontsource/open-sans` + `@fontsource/be-vietnam-pro` (5.3.0 reachable), drop the Google Inter link; new metric fallback |
| `fs-*` scale | 8, 10, 12, 14, 16, 18, 20, 22, 24 | 12, 14, 16, 20, 24, 32 | Add `fs-lg-2: 18px`, `fs-xl-2: 22px`; keep 12 px floor for the 8/10 roles |
| `lh-*` | 15 (10 px), 17.3 (12 px), 20/24 (14/16 px), 26 (20 px display), 35.2 (20 px Open Sans title) | 16, 20, 24, 28, 32 | Add `lh-title: 1.35`, set `h1` mobile title to 20/27 (35.2 is Figma auto; use 1.35) |
| `ls-*` | 0.16 px body 16, 0.56 px buttons (front desk), -0.5 px Inter title | `ls-eyebrow` .08em only | Add `ls-body: .01em`, `ls-button: .04em`; remove the -0.01em heading tightening in `global.css` |
| `color-bg` (desktop) | `#F4F0FF` | `#F4F6FA` (`n-75`) | Point `color-bg` at `{primary50}` (`#F4F0FF`); keep `#F4F6FA` as `color-bg-phone-list` |
| `color-bg-phone` | `#FFFFFF` (home) / `#F4F6FA` (lists) / `#EEF2F5` (forms) | `#FFFFFF` | Add `color-bg-phone-list: {n-75}` and `color-bg-phone-form: {n-100}`; PhoneShell takes a `tone` from the route (`spec.layout`) |
| `color-heading` | `#000000` mobile titles; `#11104A` display / front desk | `#11104A` everywhere | Add `color-title: #000000` for the mobile page title; keep `color-heading` for display roles |
| `color-text` | `#181818` | `#0E0C11` | Set `n-950`-role text to `#181818` (add `n-925: #181818`) |
| `color-text-muted` | `#7C7E93` body, `#808080` labels, `#A1A1A1` hints | `#7C7E93` / faint `#93939C` | Add `color-label: #808080`, set `color-text-faint: #A1A1A1` |
| `color-border` | `#DFDFDF` inputs/selects, `#D8DADE` cards, `#F1F1F1` text input, `#E0E0E0` | `#EDEDED` | `color-border: #DFDFDF`, `color-border-card: #D8DADE`, `color-border-input: #F1F1F1`; keep `#EDEDED` for the desktop top bar (`color-border-bar`) |
| `color-border-strong` | `#B6B6B6` (header rule) | `#B6B6B6` | Keep; use it for the mobile header rule |
| `color-border-primary` / selected | `#9D67EF` 2 px | `#DED0E9` (`primary200`) 1.5 px | Set to `{primary400}` and 2 px on selected cards |
| `color-surface-tint-band` | `#DED0E9` | (none) | Add for the Estimate grooming band |
| `color-success` | `#27B14E` (status), `#62BA20` (home "Upcoming"), `#039B00` (note), `#148F00` (desk) | `#039B00` | `color-success: #27B14E`, `color-success-text: #039B00`; desk `#148F00` maps to `color-success-strong` |
| `color-warn` | `#FF7A00` pending, `#FF6868` needs-details, `#FD866E` desk pending / coral icons | `#C77700` | `color-warn: #FF7A00`, add `color-accent-coral: #FD866E` (icons), `color-danger-soft: #FF6868` |
| `color-danger` | `#F04336`; nav badge `#BF0000` | `#F04336` | Keep; add `color-badge: #BF0000` |
| `color-icon-primary` | `#9D67EF` | (uses `color-primary-text`) | Add, used by settings rows and notification icons |
| Table head | `#552583` fill, white 10 px labels | `#EEF2F5` (`surface-3`) grey head | Add `color-table-head: {primary600}` + `color-table-head-text: #FFFFFF`; row rule `#D4D4D4`; zebra `rgba(0,0,0,.06)` |
| Status badge (desk table) | `#E9FBF7` / `#25D9AB` "Completed" | `bookingHues` (green `#E6F6E5`/`#039B00`) | Add `checked_out`/completed hue `#E9FBF7` / `#25D9AB`; keep the lifecycle vocabulary (D-175 badges), only the hues move |
| `r-md` | 8 | 8 | Keep (buttons, cards, inputs on desktop) |
| `r-card` | 10 (pet / room cards), 8 (payment rows) | 10 | Keep; use `r-md` where Figma says 8 |
| `r-input` | 4 (mobile text input) | 8 | Add `r-input: 4px` for the mobile Text Input |
| `r-lg` (used by tiles/cards) | 8 | 12 | Stop using `r-lg` on HomeServiceTile / PetAvatarCard / CustomerBookingCard: tiles 8, pet cards 10 |
| `shadow-sm/md` | none on mobile cards; `0 0 5 #441D67` on unselected pet cards | grey shadows on every card | Add `shadow-pet: 0 0 5px rgba(68,29,103,.35)`; mobile Card default `shadow: none`, border carries the edge |
| `shadow-desk` | `0 2 4 -2 .06` + `0 5 8 -2 .08` black | `shadow-md` (`shadow-color` navy) | Replace `shadow-md` with the Figma pair; `shadow-color` -> `0,0,0` |
| `h-bottomnav` | 71 | 64 | Set 71 (+ safe area) |
| `h-topbar` | 80 | 64 | Set 80 |
| `w-sidebar` | 243 | 244 | 243 |
| `h-control` | 48 (buttons, text input, desktop search); 40 compact; 28 mobile select | 44 | `h-control: 48px`, `h-control-sm: 40px`, `h-control-xs: 28px` |
| `h-row` | 44 (table), 49 (head) | 48 | `h-row: 44px`, `h-thead: 49px` |
| Dark theme | no Figma dark screens | derived from `#0E0C11` neutrals | Re-derive from the new palette: bg `#14131A`, surface `#1C1C24`, text `#F4F6FA`, muted `#A9ABBD`, border `rgba(255,255,255,.12)`, primary on dark `#B18AE0`, table head `{primary700}`, keep the coral / purple icon pair; verify contrast in `npm run qa:responsive` |

---

## 2. Icons

Icon families in the file: **MingCute** (names `Home_light`, `Setting_line_light`, `Expand_left/right/down`, `Sign_out_squre_light`, `Question_light`, `Arrow_drop_down`, `Calendar_duotone_line`), **Hugeicons outline** (`Huge-icon/...`), **Iconly Two-tone**, **Material** (`mdi_check_box*`), the **settings-row filled icons** exported as SVG (`#9D67EF` / `#FD866E`, 20 px, two-tone via a lighter second path), and **custom line art** for the services tiles and the nav paw / ticket.

| Figma name | Where | Size | Style | Export / source | Current | Action |
|---|---|---|---|---|---|---|
| `Home_light` | bottom nav | 37 | MingCute outline, 1 px white | vector in `I1805:24880;88:4127` (rect 22x25 + door 8x9) | `home` (Lucide) | Redraw from the two vector paths; hollow house, no roof overhang |
| `Black` (ticket) | bottom nav "Bookings" | 37x27 | filled white ticket with perforation line | 13 vector paths in `I1805:24880;528:12269..12281` | `calendar` | New `ticket` icon from the paths |
| paw-in-circle `Group` | bottom nav "Pets / notifications" | 46x41 | dark disc `#383430` rings + white paw + `#492678` detail + `#BF0000` dot | `I1805:24880;667:25950..25971`, `522:18009` | `paw` + red count badge | New `nav-paw` icon (multi-colour, keeps the disc); badge is the 8 px dot, not a count |
| `Setting_line_light` | bottom nav | 34 | MingCute outline gear, 1 px white | `I1805:24880;88:4119` (Union 28 + Ellipse 11) | `settings` | Redraw: thicker 8-tooth gear |
| `Expand_left` | every mobile header | 40 hit, 10x20 glyph | 2 px chevron `#33363F` | `I1805:24876;58:2821` | `arrow-left` / `chevron-left` 1.75 | Use `chevron-left` at 2 px, 24 box, colour `#33363F` |
| `Expand_down`, `Expand_right` | select caret, "Next" button | 24 | MingCute chevron | `I443:17975;123:1779`, `I443:17981;121:2674` | `chevron-down/right` | Keep, set stroke 2 |
| `Huge-icon/user/outline/user` | buttons, top bar, help | 14 / 20 / 24 | outline 1.5 | vector in `I1807:27181;188:5730` | `user` | Fine as is (verify head/shoulder proportions) |
| `Huge-icon/arrows/outline/direction-right 01` / `direction-down 01` | buttons, selects | 14 / 20 / 24 | outline 1.5 | `I1807:27181;188:5732` | `chevron-right/down` | Keep |
| `Huge-icon/interface/outline/information-circle` | field label info, control panel | 16 / 18 | outline | `I1807:27183;573:15120`; `Info-Circle.svg` (filled variant) | `info` | Keep outline; add `info-filled` from the export for settings rows |
| `Huge-icon/interface/outline/notification` | desk top bar | 24 | outline bell | `I593:16049;421:10138` | `bell` | Keep |
| `Huge-icon/interface/outline/search 01` | desk search | 24 | outline | `I593:16049;421:9933;19:11462` | `search` | Keep (circle larger, short handle) |
| `Huge-icon/communication/outline/chat-notification` | desk top bar | 24 | outline bubble + dot | `I593:16049;421:9936` | `message` | Add `chat-notification` (bubble with dot) |
| `Question_light` | desk "Help" | 24 | MingCute outline | `I593:16049;421:10131` | `question` | Keep |
| `Sign_out_squre_light` | desk sidebar logout | 20 | MingCute outline | `598:24011;1596:32974` | `logout` | Keep |
| `mdi_check_box` / `mdi_check_box_outline_blank` | option rows | 24 | Material filled | `I443:17967;121:2955` | `Checkbox` atom | Checkbox atom: 24 px Material square, r3, primary fill when checked |
| `Iconly/Two-tone/Category` | control panel sidebar | 20 | 4 rounded squares, stroke 1.3, two-tone | `Iconly/Two-tone/Category*.svg` | `grid` | Import as `category` (keep 2 opacity layers) |
| `Iconly/Two-tone/Arrow - Down 2` | selects (control panel) | 12 | two-tone chevron | `I598:21350;16162:1094` | `chevron-down` | Keep |
| `Calendar.svg` | inputs, pet profile reminder | 16 | filled two-tone `#9D67EF` | export | `calendar` | Import as `calendar-filled` |
| `Message.svg`, `User.svg` | auth inputs | 16 | filled `#999999` | export | `message`, `user` | Import as `message-filled`, `user-filled` |
| `Setting.svg` | profile row "Setting" | 20 | filled two-tone `#9D67EF` | export | `settings` | Import |
| `Shield-Done.svg` | notification "pet added" | 20 | filled `#9D67EF` | export | `shield` | Import |
| `Info-Circle.svg`, `Qustion-Circle.svg` | profile "About App" / "Help" | 20 | filled `#9D67EF` | export | `info`, `question` | Import (filled) |
| `User-1.svg`, `Users.svg`, `User-2.svg` | profile "Edit Profile" / "Invite Friend" | 20 / 16 | filled `#9D67EF` / `#FD866E` | export | `user`, `users` | Import (filled) |
| `Lock.svg`, `Logout.svg`, `Trash Bin.svg`, `Lable.svg` | settings "Change password", "Logout", "Delete account", notification tag | 20 | filled `#FD866E` | export | `lock`, `logout`, `trash`, - | Import (filled); new `tag` |
| `Moon.svg` | settings "Dark mode" | 20 | filled `#552583` | export | `moon` | Import |
| `Arrow-Right.svg` | list row chevron | 18 | filled `#C0C2D4` | export | `chevron-right` | Import as `row-chevron` |
| `animal-rescue*.svg`, `hair-clipper*.svg`, `medal*.svg` | pet profile notes rows (vet / grooming / training) | 20 / 28 | filled | export | - | Import as `vet`, `clipper`, `medal` |
| Services tile icons: Hotel (house + paw), Spa (bubbles), Daycare (person + two dogs), In Home (van + paw) | home services row | ≈36..40 | custom white 1.5 px line art | inside `528:13558` (depth-1 only) | `bed`, `scissors`, `sun` | **missing, needs Design System export**; interim: vectorise from `Services.png` (2x via `Frame 1171276424.png`) as `svc-hotel`, `svc-spa`, `svc-daycare`, `svc-inhome` |
| Booking card icons (house + paw 60, bubbles 60) | home upcoming card | 60 | custom line art | inside `1824:40234` | `bed`, `scissors` 30 in tinted square | same export request; render as 60 px line art, no tinted square |
| Calendar / clock 12 px (booking card times) | home upcoming card | 12 | filled | inside `1824:40234` | `calendar`, `clock` outline | Use `calendar-filled` / `clock-filled` |
| Logo mark (`logo_icon 1`, 42x40) + wordmark (`image 29` 56x36) | home header, sidebar | 42x40 / 145x44 | raster | `logo.png`, `sidebar/logo.png`, `image 28.svg` (pattern) | `brand/petrock-mark.svg` | Use the exported `logo.png` (sidebar 145x44) until an SVG arrives |
| Desk sidebar: Dashboard (4 squares), All Reservations (house), Grooming (clipper), Day Care (bowl), Customer & Pets (person + dog), Walking (leash), Employees (stack), Tasks (people), Reviews (star), Education (target), Finance (pie), Reports (bars), Settings (gear-square) | sidebar | ≈22 | line 1.5, `#552583` active / `#181818` | sidebar instances not expanded (`I593:16048;418:7412`) | Lucide set | **missing, needs Design System export** (depth-4 fetch of `593:16048` after Sep 22); interim keep current outlines at 22 px, stroke 1.5 |

Icon component rule: `Icon.tsx` gains a second registry `ICON_SVGS` for multi-path / two-tone icons (array of `{d, fill?, opacity?}` normalised to a 24 box, `currentColor` unless the layer is a fixed colour such as the nav paw disc). `strokeWidth` default becomes 1.5 (Hugeicons) and nav / header icons pass 2 (MingCute weight at 34..40 px).

---

## 3. Components (Figma spec vs current)

| Component | Figma spec | Current (file) | CSS / TSX changes |
|---|---|---|---|
| Bottom nav | 390x71 `#552583`, 4 icons (home, ticket, paw-disc, gear) white, no labels, no active pill, `#BF0000` dot on the paw; safe-area below | `molecule/BottomNav/*`: white bar, 5 labelled items, tinted active pill, count badge | Background `var(--color-primary)`; hide labels (`sr-only`); icons 34..46 white; `.is-active` = white at 100 % vs 85 % opacity; badge = 8 px dot; height `--h-bottomnav` 71; items: Home, Bookings (ticket), Pets/Notifications (paw disc), Settings; Chat moves under Notification tabs (Figma `549:7669` tab "Front Desk Chat") |
| Mobile header | back 40x40 at x=10, title Open Sans 600 20 `#000000` centred, optional right text action Open Sans 600 14 `#552583`, 1 px `#B6B6B6` rule at 96..100, transparent over the screen bg | `PhonePageHeader` + `CustomerScreenHeader` (two components, Inter 20 `#11104A`, no rule) | Merge into one `CustomerScreenHeader` (kanban already lists the dedupe); title colour `--color-title`; add `.cshead-rule` bottom border `--color-border-strong`; back icon `chevron-left` 2 px `#33363F`; right slot text button |
| Home header | hero photo 390x142 full bleed, logo mark 42x40 centred at y=44 over the photo, wordmark 56x36 under it; no greeting, no location chip, no bell | `HomePage.tsx` `.chp-home-head` + `.chp-hero` (gradient card, greeting, location chip, bell) | New `molecule/HomeHero`: `<img>` (use `docs/figma/exports/petrock-main/Mask group.png` / a photo asset) with the mark overlaid; location + bell move to a small row under the hero or to Settings (needs Justin: Figma has no location switch on home) |
| Services row tile | 4 tiles ≈75x76, `#552583`, r8, white line icon ≈36, label Open Sans 700 12 white, gap ≈19, band `#EEF2F5` with 6 px padding, section label "Services" Open Sans 400 16 grey at x=14 | `HomeServiceTile` (r12, `shadow-md`, 92 tall, 3 tiles, hover lift) | r `--r-md`, no shadow, `min-height: 76px`, padding 8, icon 36 stroke 1.5, label 12/700; grid `repeat(4, 1fr)` gap 19; add In Home (disabled / "coming soon" if no route) |
| Pet card (home) | ≈114x180 white, r10, 2 px `#9D67EF` border when selected else none + `shadow-pet`, avatar 60 circle, name Open Sans 600 14 `#181818`, status line 10 px (`#FF6868` warning with triangle) | `PetAvatarCard` (r12, 1.5 px `#EDEDED` border, `shadow-sm`, 72 avatar, `Badge`) | r `--r-card`, border `2px solid transparent` / `--color-border-primary` when selected, `box-shadow: var(--shadow-pet)`, avatar 60, name 14/600, status text 12 px coloured, no pill |
| Add a Pet card | white card same size, centred 106x38 `#552583` r8 button "Add a Pet" Open Sans 600 14 | `Card` + `Button` sm | Button `size="md"` 38 tall r8, no icon |
| Upcoming booking card | 160x230 white, 2 px `#9D67EF` border r10, 60 px line icon, title Open Sans 600 14 `#000000`, "Pets: Sparky, Boss" 10 px, status text 10 px coloured (`#FF6868` / `#62BA20`), 1 px `#030C09` divider, Check-in / Check-out columns 10 px with filled calendar + clock icons | `CustomerBookingCard` (r12, 1.5 px border, tinted icon square, StatusBadge pill) | Icon 60 no square, border 2 px, divider `--color-text`, status as coloured text (keep `BOOKING_STATUS_CUSTOMER_LABEL`), times 12 px filled icons |
| Section header + "See all" / "View Past Booking" | label Open Sans 400 16 grey, x=14; "View Past Booking" Open Sans 600 14 `#552583` underlined centred | `.chp-section-head` (Inter 16/600 muted) | Weight 400, colour `--color-label`; link underline |
| Primary button | 345x48 `#552583` r8, Open Sans 700 12 or 600 14 white, centred, optional 14..24 px icons gap 4..10 | `Button.css` `.btn` 44 tall r8 Inter 14/600 | `height: var(--h-control)` 48, font 14/600 (12/700 for `btn-sm`), ls 0; `.btn-lg` 52 -> 48 |
| Secondary button | 345x40 white, 1 px `#552583` border r8, text `#552583` Open Sans 700 12 ("Pay In Full", "Add Grooming") | `.btn-secondary` 44 tall | Height 40 (`--h-control-sm`), font 12/700 |
| Ghost / link | Open Sans 600 14 `#552583` underline | `.btn-link` 500 | Weight 600, underline always |
| Text input | label Open Sans 400 10 `#808080` (12 px floor) gap 2, field 48 white r4 1 px `#F1F1F1`, value Open Sans 600 16 `#181818`, caret `Expand_down` 24 | `Input.css` `.field` gap 6, label 14/500 navy, field 44 r8 border `#B6B6B6` | `gap: 2px`, label `--fs-xs` 400 `--color-label`, field 48 r `--r-input` border `--color-border-input`, value 16/600 |
| Select | 320x28 white 1 px `#DFDFDF` r? padding 6/12, chevron 14 | `Select` 44 | Mobile variant `size="xs"` 28 tall |
| Chips / badges | status pill white r50 padding 2/5, dot 10 + Open Sans 700 8 coloured; desk badge `#E9FBF7`/`#25D9AB` r4 padding 8/16 | `Badge` 24 tall r-pill tinted, `StatusBadge` | Add `variant="figma-pill"` (white, dot, text colour) for mobile; desk `StatusBadge` r4 26 tall |
| List row (settings) | 24 px gutter, icon 20 filled (`#9D67EF` / `#FD866E` alternating), label Be Vietnam Pro 500 16 `#11104A`, 1 px `#DFDFDF` rule, row 68 tall | `AccountMenuRow` (Inter, outline icon 20, chevron, sub-label) | Filled icon set, colour prop, 68 tall, hide chevron, `font-display` |
| Notification row | 60 px round icon disc (white 1 px `#DFDFDF` / filled `#9D67EF` when unread), title Be Vietnam Pro 500 16 `#11104A`, time 12 `#7C7E93`, 1 px rule, list gutter 15 | `NotificationRow` (40 px disc, tinted rows, close button) | Disc 44, title 16/500 navy, no row tint, no close |
| Tabs (notification) | 2 equal tabs, Open Sans 12 (600 active / 400), 1 px underline `#000000` active / `#DFDFDF` | `Tabs` underline 14/500 primary | `variant="split"`: equal width, 12 px, black underline |
| Modal / sheet ("Hey! ... Add A Pet") | 270 wide white r10, title Open Sans 600 20, body 14, two 50 % footer buttons (Back white / Add a Pet purple) split by a 1 px rule, scrim `#323232` 80 % | `Modal` r16 `shadow-xl` footer right-aligned | `size="alert"`: r10, full-width split footer, scrim token |
| Stepper | 27 px `#552583` circles, white 14/600 numbers, 2 px track `#552583` done / `#D0D5DD` remaining, no labels | `Stepper` 26 px outline dots, labels | Filled primary for done and current, remaining dot white with `#D0D5DD` border, `is-compact` default on mobile |
| Room / hotel card | 370x345, photo 239 tall, "BOOK NOW" 106x38 purple r8 bottom-right over the photo, title Open Sans 600 20 `#181818`, description 10 `#304050`, price 24/700 `#552583` + "Avg Per Night/Pet" 14 | `HotelRoomTypeCard` (placeholder tint, r12 card, disabled pale button) | Photo (asset), overlay button, typography as spec, no card border |
| Payment option row | 344x56 white r8, brand icon 40, label Open Sans 600 14 `#11104A`, radio right `#9D67EF` | `ServicePayMethod` / `RadioGroup cards` | 56 tall r8 no border, radio purple |
| Desk sidebar | 243 white, no border, logo 145x44 (padding 30/75), "MAIN" / "Other" group labels, items 25 apart, active purple text + icon, `#D8D9D9` divider, Logout button 178x52 purple r8 bottom | `Sidebar.css` (244, right border, uppercase category rows with chevrons, 9 px row padding, codes) | Remove right border; item height 44 with 25 gap; group label `#7C7E93` 12 ls .1em; active `--color-primary` text (no fill); footer Logout `Button` 52 tall; hide route codes unless dev mode |
| Desk top bar | 80 tall white, 1 px `#EDEDED`, search 320x48 left, cluster right (New booking 172x47, chat, help, bell, avatar 32 + name/role + chevron) gap 15 | `TopBar.css` 64 tall, title + location left | `--h-topbar` 80; move the search into the bar; location switcher stays (Figma has none, binding rule) placed after the search |
| Data table | title Open Sans 700 20; head 49 `#552583` white 10 px labels; rows 44 `#D4D4D4` rule; grouped tabs "ARRIVING (34) ▾" 14/600 `#808080`; cell colours per column role; checkbox 10 r3; status badge `#E9FBF7`/`#25D9AB` r4 | `DataTable.css` grey head `#EEF2F5`, 48 rows, sort arrows, group header row | `th` fill `--color-table-head`, colour white, 12 px 400; `td` 44; add `cellTone: 'muted' | 'heading' | 'date' | 'primary'` per column; group row = 14/600 `#808080` with `Arrow_drop_down` |
| KPI / stat tile | Figma (F-01 export `front desk-1.jpg`) shows white cards 1159 wide padding 30 with the two-layer shadow; labels 14 `#7C7E93`, values 18..20 `#11104A` | `StatTile` r10 border `#EDEDED` icon square | Border `#F3F3F3`, `shadow-desk`, label 14/400 muted, value Be Vietnam Pro 500 20 navy, icon optional |

---

## 4. Screens - layout deltas (export vs `docs/screenshots/<CODE>/390.jpg`)

Order of priority: C-10 first.

### C-10 Customer home (`Home Page.png`, `Home Page-2.png` no pets, `Home Page-5.png` "Hey!" gate, `Frame 1171276424.png` two-up, `Services.png`)
Figma: hero photo (0..142) with the logo mark + wordmark centred on it -> "Services" label + 4 purple tiles on an `#EEF2F5` band -> "Pets" label + horizontal cards (selected pet with purple border, others with shadow, "Add a Pet" card) -> "Upcoming Bookings" + 2 cards with 60 px line icons, "Pets:", coloured status text, Check-in / Check-out columns -> centred underlined "View Past Reservations" -> purple nav. No greeting, no location chip, no bell, no vaccine banner, no section counts, everything white with grey section bands. Empty state (`Home Page-2.png`): Pets band with a single centred "Add a Pet" button, Upcoming section hidden, link stays. Gate (`Home Page-5.png`): centred alert "Hey! To Book An Appointment Please 1st Add A Pet" with Back / Add a Pet split footer over an 80 % scrim.
Current: greeting row "LOCATION / Hi Avery" + location chip + bell, gradient hero card, 3 tiles (Hotel, Grooming & Spa, Daycare) with grey shadows, pets as bordered cards with initials and green "Approved" pills, "6" count, tinted icon squares on booking cards, white labelled nav.
Delta: replace header + hero (HomeHero), 4 tiles, band background, pet cards per section 3, booking cards per section 3, remove counts / eyebrow, link underline, purple nav. Empty and gate states per the two exports. Keep the vaccine banner only when a pet is `pending_vaccines` (not in Figma; keep as a business rule, styled as a `#FF6868` text line under the pet card instead of a yellow banner).

### C-11 My pets (`My pets (more than one pet).jpg`)
Figma: `#F4F6FA` screen, header "My Pets", right text action "Add Pet" Open Sans 600 14 purple under the header at x=314; 2-column grid of white r10 cards 166x208 gap 20 (gutter 24), avatar 76, name Be Vietnam Pro 600 18 navy, "Breed: Bulldog" 12 `#7C7E93`; no status pills, no subtitle line, no "2 pets · all approved".
Current: white screen, "+" icon button, summary line, cards with pills, outlined "Add pet" button.
Delta: bg token, text action, card spec, remove summary and pills (status lives on the profile).

### C-13 Pet profile (`Pet Profile (Single Pet).jpg`)
Figma: `#F4F6FA`, header "Pet Profile"; avatar 110 with dashed coral ring (`#FAA18F`) and a purple camera / edit disc 28 bottom-right; name Be Vietnam Pro 600 24 navy, "Breed: Ragdoll" 14 muted; white r8 stats card (Gender / Birthday / Weight, label 12 `#93939C`, value 14/600 navy, vertical rules); "Reminder" section title 16/600 navy -> white card with title 16/600, calendar + person rows 14 with purple / coral icons, pet photo bleeding right; "Notes for brownie" + right text action "Add Note" purple -> white list card, rows 76 tall with 28 px coral / purple filled icons (`hair-clipper`, `medal`, `animal-rescue`), title 16/500, "Last Do In ..." 14 muted, `Arrow-Right` 18 grey.
Current: white bg, edit icon top-right, initials avatar with faint ring, "Approved" pill, stats card 3-up, "Vaccines / Manage" chips, "Care & feeding" kv list.
Delta: bg, dashed avatar ring + camera disc, typography (display family), stats card style, Reminder card, notes list rows with filled icons; Vaccines section stays (business rule) but styled as the notes list (icon `Shield-Done`, status as coloured text).

### C-12 Add pet wizard (`Pet Edit.png`, `Pet Edit 3.png`, `Pet Edit 5/6/7.png`, `Frame 1171276417/18/19.png`)
Figma: `#EEF2F5`, header "Add Pet", stepper of **2** filled purple circles (27) at y=121 with a purple / grey 2 px track; avatar 70 with green camera dot; fields in the 4-px-radius Text Input style (label 10 grey above, 48 tall white `#F1F1F1` border, value 16/600), two-column pairs (Type / Breed, Sex / Neutered, Color / Weight) 165 wide, Date Of Birth full width with a purple filled calendar icon; full-width "Next" 337x40 purple r8 12/700; nav visible. Step 2 (`Pet Edit 3.png`): "Is your dog socialized?" checkbox rows (Material check boxes, labels 16/600 `#3B4256`), personality / food / meds selects, "Next". `Pet Edit 5..7`: vaccine upload rows ("Text Block" 350x51 with ".jpg, .png, .gif, .pdf" and an "Upload" 12/700 purple button).
Current: 5-step outlined stepper with "Basics" heading, 44 px r8 inputs with dark border and 14/500 labels, "Back / Next" pair.
Delta: bg, 2 visible steps (keep the 5 internal steps but render the Figma stepper as 2 groups or 5 filled circles - needs Justin; default: 5 filled circles, no labels), input atom per section 3, single "Next" button 40 tall, avatar camera dot green `#27B14E`.

### C-30 Hotel: choose pets & dates (`Hotel Reservation.png`, `Choose Pets*.png`)
Figma: `#EEF2F5`, header "Hotel Reservation" + rule, "Select Your Pet" 14/500 centred, three 100x138 pet cards (selected = purple fill, white text, white status pill; others white with the purple glow), "Do You Want Your Pets To Share A Room?" label 10 + 350x28 select, white calendar card (month 18/600, arrows in 32 px outlined squares, days 14/600 purple, selected day purple square), white "Check In / Check Out" card (2 columns, 12 px grey inputs 48 tall with filled calendar / alarm icons), full-width purple "Next" 48.
Current: 7-step stepper, Location select, "Select your pets / Manage pets", bordered pet cards with checkboxes and "Vaccines OK" pill, Check in / check out boxes, sticky "Next".
Delta: bg, selected pet = filled purple card, calendar card (DatePicker skin), inputs per spec, drop the stepper on this screen (Figma has none on the hotel flow) or render it compact under the header (needs Justin; default compact).

### C-31 Choose room type (`Choose Your Room.png`)
Figma: `#EEF2F5`, header "Choose Your Room Type", two 370-wide photo cards (photo 239, "BOOK NOW" purple 106x38 r8 overlay bottom-right), title 20/600, description 10 `#304050`, price "$150" 24/700 purple + "Avg Per Night/Pet" 14/600 purple; nav visible; no stepper, no summary chips, no sticky footer.
Current: stepper + summary chip row, placeholder bed icon cards r12, pale disabled "Book now", "$135.00 avg per night / pet", warning line, sticky "Next".
Delta: photos (asset), overlay button, typography, remove card border, keep the 55 lb rule text but as the 10 px description colour. Keep sticky Next only when a room needs confirming (Figma books from the card).

### C-32..C-34 Pet stay details / add grooming / customer details (`Booking Details Add Pets*.png`, `Booking Details Final Customer Details*.png`)
Figma: `#EEF2F5`, stacked Text Inputs 350x65 (label 10 + 48 field r4), "Next" 339x48 purple at the bottom; grooming upsell is the `#DED0E9` band with centred 10 px copy and an outlined "Add Grooming" button (see C-35).
Current: r8 inputs with 14 px labels, Back / Next pair. Delta: input atom, single Next, band.

### C-35 Estimate (`Booking Detail.jpg`)
Figma: `#EEF2F5`, header "Estimate"; "Booking Detail" 16/600 navy; white card r8: 40 px house icon + "Hotel Penthouse" 16/600 purple + "$200" 16/600 green right; lines 10 px (Room, Tax, TOTAL); white Check-in / Check-out card; "Payment Details" 16/600 -> white card with 12 px rows; `#DED0E9` band with 10 px copy + outlined "Add Grooming" 345x48; "Pay Deposit" 345x48 purple; "*pay full upfront to get discount." 8 px green; "Pay In Full" outlined 345x40.
Current: 7-step stepper, Deposit / Pay in full segmented control, radio "How will you pay?", Hotel Suite card with green price, sticky Pay deposit / Pay in full.
Delta: drop segmented control + radios in favour of the two buttons + green note; band; card typography; check-in card; no stepper.

### C-36 Payment (`Payment.png`, `Payment-2..4.png`)
Figma: `#EEF2F5`, header "Choose Payment"; two white r8 option rows 344x56 (Credit card with Mastercard mark, Pay With Cash At Location with cash icon) radio right purple; "Next" purple 48 at the bottom. Card form (`Payment-2..4`): white card with 4 px inputs.
Current: stepper, Deposit summary card, radio cards with helper text, inline card form. Delta: two rows only, then the form on the next step; keep the fee line as 10 px helper under "Credit card".

### C-50 Grooming & Spa (`grooming package` frames, `Frame 1171276435.png`)
Figma: `#F4F6FA`, header "grooming package"; two white cards 350 wide: package list (Gold / Platinum / Diamond rows with price right, radio) and add-ons; "Next" 345x48. No hero banner, no order history on this screen.
Current: "Back" text link, big title + description, gradient hero, "Upcoming / All orders" list. Delta: header per spec, package cards, move orders to Bookings tab.

### C-70 Profile hub (`profile.jpg`) and C-72 App settings (`setting.jpg`)
Figma: `#F4F6FA`; header "Settings"; avatar 110 dashed coral ring + purple camera disc; name Be Vietnam Pro 600 24 navy, email 14 muted; rows 68 tall gutter 24 with 20 px filled icons alternating purple / coral (Edit Profile, My Pets, Add Pets, Address, Setting, Rate App, About App, Invite Friend, Help, Logout), 1 px `#DFDFDF` rules, no chevrons, no sub-labels. C-72: rows Language (translate icon purple), Change password (lock coral), Dark mode (moon purple + toggle right, purple knob), Delete account (trash coral); no header rule.
Current: "Previewing as" pill, ACCOUNT / MORE group labels, rows with sub-labels, counts, chevrons. Delta: rows per spec, drop group labels + sub-labels + chevrons, icon set, dashed avatar ring; keep the preview pill in dev mode only.

### C-80 Notifications (`notification.png`)
Figma: `#F4F6FA`; header "Notification"; two equal tabs "Notification" / "Front Desk Chat" 12 px with black / grey underline; rows: 44 px disc (white with 1 px `#DFDFDF` and a purple outline icon, or filled `#9D67EF` with white icon for highlighted items), title Be Vietnam Pro 500 16 navy two lines, time 12 muted, 1 px rules, gutter 15; no date groups, no filters, no "Mark all read", no close buttons.
Current: gear action, tabs with counts, All / Unread chips, "Mark all read", TODAY / YESTERDAY groups, tinted unread rows with dots and close icons. Delta: strip to the Figma list; keep "Mark all read" as a header text action (business need) in purple 14/600.

### F-01 Front desk today (`front desk-1.jpg` and `front desk.jpg`)
Figma: `#F4F0FF` canvas; white sidebar with logo, MAIN / Other groups, purple Logout button; 80 px top bar with search left, New Booking + icons + avatar right; content: a purple "+ Hotel Reservation" button top-right, then white cards / table container with the two-layer shadow. KPI-style strips are white cards with 14 px muted labels and navy values (no icon squares, no coloured arrows).
Current: dark sidebar header with codes, category chevrons, 64 px top bar with title + location select + theme icons; page code pill, tiles with icon squares. Delta: shell tokens (bg, sidebar, top bar), StatTile skin, hide code pills outside dev mode.

### F-10 Hotel & Daycare reservations (`front desk.jpg`, `Frame 1171276264*.png`)
Figma: white container (padding 10) with "Hotel Reservations" 20/700 + Filters / See All buttons top-right; **one** purple table head (49 px, white 10 px labels) then group rows "ARRIVING (34) ▾", "DEPARTING (18) ▾", "Checking out (18) ▾" each followed by 44 px rows; status badge mint; horizontal scrollbar at the bottom.
Current: three stacked tables each with its own grey two-tier head (STAY group), filters row with 4 controls and a toggle, "By day / All upcoming" tabs, row counts under each. Delta: single head, group rows inside the table, purple head, cell tones, badge skin; keep the filters (business need) but as the Figma "Filters" button opening a popover.

### F-13 Room timeline (`all reservation grooming.jpg`, `front desk-9..11.jpg`)
Figma: same shell; toolbar: date range pill centred "1 June 2024 - 18 June 2024" white r8 border, SORT / FILTER text buttons right with icons, "New Booking" purple top-right; grid: week headers, day columns alternating white / `#EEF2F5`, weekend day labels green, "TODAY" black pill; group rows (Daycare ▾, Penthouses ▾) grey `#D9D9D9`; room rows 54 tall with a 32 px grey disc + room code; booking blocks flat fills (`#7A7CE3`, `#FFF0B3`, `#C9A6E9`, `#D18ACF`, `#B4F0A0`, `#00D8D8`) with time / medical icons, no left status bar.
Current: legend row, view toggle, filters, status left-bars on blocks, tinted today column purple, 45 px rows. Delta: toolbar layout, alternating columns, green weekend labels, black TODAY pill, group rows grey, block fills per status from `bookingHues` (map: confirmed `#B4F0A0`, checked_in `#7A7CE3`, checked_out `#FFF0B3`, pending_vaccines `#C9A6E9`, requested `#D18ACF`, daycare `#00D8D8`) - hues move into `bookingHues`, the vocabulary does not change.

---

## 5. Implementation plan

Acceptance for every item: `npm run build` green; `npm run qa:responsive` clean at 360 / 390 / 768 / 1280 / 1920; dark theme derived from the new palette passes the contrast check in the QA script; `npm run screenshots -- --codes=...` regenerated and compared side by side with the named export; page docs, `_pending` changelog and kanban updated in the same commit (`feat(design): ...` / `feat(customer-home-pets): C-10 ...`).

### (a) Shared: tokens, fonts, icons, core components

1. **Fonts** - add `@fontsource/open-sans` (400, 600, 700) and `@fontsource/be-vietnam-pro` (400, 500, 600) to `package.json`, import them once in `src/main.tsx`, remove the Google Inter link from `index.html`, set `type['font-sans'] = "'Open Sans', 'Open Sans Fallback', system-ui, sans-serif"` and add `font-display: 'Be Vietnam Pro'`; rewrite the `@font-face` metric fallback in `global.css` for Open Sans (ascent 106.9 %, descent 29.3 %, size-adjust ≈ 105 %). Log D-185 (proposed): Open Sans replaces Inter (CLAUDE.md "Inter only" changes). Accept: computed `font-family` on `body` is Open Sans on `/#/app`, no FOUT on Pages (self-hosted woff2), `docs/design/tokens-draft.md` updated. Compare: `Home Page.png` text vs `C-10/390.jpg`.
2. **Tokens** - apply every row of table 1.8 in `src/design/tokens.ts` (new neutrals `#181818`, `#808080`, `#A1A1A1`, `#DFDFDF`, `#D8DADE`, `#F1F1F1`, `#D4D4D4`, `#F4F0FF`; semantic roles `color-title`, `color-label`, `color-bg-phone-list/-form`, `color-border-card/-input/-bar`, `color-table-head(-text)`, `color-icon-primary`, `color-accent-coral`, `color-badge`, `shadow-pet`, `shadow-desk`; sizes `h-bottomnav 71`, `h-topbar 80`, `w-sidebar 243`, `h-control 48/40/28`, `h-row 44`, `h-thead 49`, `r-input 4`); re-derive `semantic.dark` and `status.dark` from the new light values; `npm run tokens`. Accept: `tokens.css` regenerated, no component references a removed token (grep), `/#/dev/tokens` shows the new roles, sunset brand still resolves.
3. **Icons** - extend `Icon.tsx` with `ICON_SVGS` (multi-path, optional fixed-colour and opacity layers, 24 box) and import: the 29 exported SVGs (normalised to 24, `currentColor` unless two-tone), the four nav glyphs redrawn from the Navbar vector paths (`I1805:24880;*`), `chat-notification`, `ticket`, `nav-paw`, `row-chevron`, `calendar-filled`, `clock-filled`, `tag`, `vet`, `clipper`, `medal`, `category`; default `strokeWidth` 1.5; add the four service glyphs vectorised from `Services.png` under `svc-*` marked `provisional` in `Icon.meta.ts`. Accept: `/#/dev/components` Icon gallery shows every name, each renders identically at 16 / 20 / 24 / 36, two-tone layers keep opacity, dark mode swaps `currentColor` only.
4. **Buttons, inputs, selects, checkbox, chips / badges, stepper, tabs, modal** - CSS per section 3 rows (heights 48 / 40 / 28, r8 / r4, Open Sans weights, split-footer alert modal, black split tabs, filled stepper, white dot pill badge, Material checkbox). Accept: `/#/dev/components` states pass the visual check against `Hotel Reservation.png` (inputs, button), `Pet Edit.png` (stepper, selects), `Home Page-5.png` (alert modal), `notification.png` (tabs).
5. **Card, PetAvatarCard, CustomerBookingCard, HomeServiceTile, Section header, list rows (AccountMenuRow, NotificationRow)** - per section 3; mobile cards lose grey shadows, pet cards get `shadow-pet` + 2 px `#9D67EF` selected border, tiles 4-up r8, rows 68 tall with filled coral / purple icons. Accept: component gallery diff vs `Home Page.png`, `profile.jpg`, `notification.png`.
6. **Shells** - `BottomNav` purple 71 tall, 4 unlabelled white icons, dot badge; `CustomerScreenHeader` absorbs `PhonePageHeader` (title black 20/600, 1 px `#B6B6B6` rule, text action); `PhoneShell` applies `color-bg-phone-list/-form` from the route spec (`spec.layout` tone) and the nav on every customer route except auth. Accept: every `C-*` screenshot shows the purple bar at the bottom and the header rule where Figma has one; keyboard focus ring visible on the purple bar.

### (b) Customer screens (after (a) lands)

7. **C-10 Home** - `HomeHero` (photo + mark + wordmark), Services band with 4 tiles (In Home disabled until a route exists), Pets strip per spec incl. empty state (`Home Page-2.png`) and the "Hey!" gate modal (`Home Page-5.png`), Upcoming cards, underlined "View Past Reservations", no greeting / chip / bell / counts (location + bell move under the hero as a 32 px row - flag for Justin). Accept: `C-10/390.jpg` block order and y-positions within ±8 px of `Home Page.png` (hero 142, services 144..269, pets 284..461, bookings 467..729, link 737, nav 773); 360 and 430 widths keep 4 tiles without overflow.
8. **C-11 My pets, C-13 Pet profile, C-12 Add pet** - per section 4 against `My pets (more than one pet).jpg`, `Pet Profile (Single Pet).jpg`, `Pet Edit.png` + `Pet Edit 3.png`. Accept: grid 2-up gap 20 gutter 24; dashed coral avatar ring + camera disc; notes / vaccine rows with filled icons; wizard uses the 4-px inputs and filled stepper.
9. **C-30..C-36 Hotel flow** - per section 4 against `Hotel Reservation.png`, `Choose Your Room.png`, `Booking Details Add Pets.png`, `Booking Details Final Customer Details.png`, `Booking Detail.jpg`, `Payment.png` (+ `Payment-2.png` card form). Accept: filled selected pet card, calendar card skin, photo room cards with overlay "BOOK NOW", Estimate with the `#DED0E9` band and the Pay Deposit / Pay In Full pair + green note, two payment rows; pricing still from `engine.ts`.
10. **C-50 Grooming, C-60 Daycare** - package / add-on cards per `grooming package` frames and `Day care.png` (253x238 r7 tiles with 24/700 titles). Accept: matches `Frame 1171276435.png` left side.
11. **C-70 / C-72 Settings, C-80 Notifications, C-40 chat header** - per section 4 against `profile.jpg`, `setting.jpg`, `notification.png`, `Message Support.png`. Accept: 68 px rows, alternating icon colours, split tabs, 44 px discs.

### (c) Front desk shell

12. **DesktopShell / Sidebar / TopBar tokens** - canvas `#F4F0FF`, sidebar 243 white without border, logo 145x44, "MAIN" / "Other" groups, 25 px item rhythm, purple text active state, Logout button; top bar 80 with the search field left and New booking / chat / help / bell / avatar cluster right (location switcher kept after the search); route-code pills only in dev mode. Compare: `front desk.jpg`, `sidebar/logo.png`. Accept: 1280 and 1920 screenshots of F-01 match the export shell; 768 collapses to the rail with the same colours; dark mode derived.
13. **DataTable + StatusBadge + StatTile** - purple 49 px head with white 12 px labels, 44 px rows with `#D4D4D4` rules, per-column cell tones, group rows "ARRIVING (34) ▾" inside one table, mint status badge r4, white content cards with `shadow-desk`, StatTile skin. Compare: `front desk.jpg`, `Frame 1171276264.png`. Accept: F-10 renders one head + three group rows; sort / filter still work; F-01 tiles show 14 px muted labels and navy values.
14. **RoomTimeline (F-13)** - toolbar (range pill, SORT / FILTER, New Booking), alternating day columns, green weekend labels, black TODAY pill, grey group rows, 54 px room rows with the disc, flat status fills from `bookingHues` (new hues, same vocabulary). Compare: `all reservation grooming.jpg`, `front desk-9.jpg`. Accept: 1280 screenshot matches; phone fallback (D-016) still scrolls horizontally.
15. **Close-out** - regenerate `docs/screenshots/**` for every touched code, update `docs/design/tokens-draft.md` (mark Inter -> Open Sans), `docs/decisions.md` (D-185 fonts, D-186 home header without location chip / bell, D-187 wizard stepper count, D-188 hotel flow without stepper - all proposed), merge `_pending` changelog, refresh kanban.

Open questions for Justin (block nothing, defaults stated above): home header without location switch / bell; 2 vs 5 wizard steps; hotel flow stepper; Chat as a Notifications tab vs its own nav item; service icons and sidebar icons need a Design System export (or the depth-4 fetch after Sep 22).
