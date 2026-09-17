# Component inventory from the designs

De-duplicated list of UI components seen across the Figma export drop 1 (`docs/figma/screen-catalog.md`, 2026-09-17). Input to the rebuilt design system and component library (D-007, D-015, kanban "Rebuild design system"). Each row: component, where it is used (catalog file names), variants and states actually drawn. States not drawn (hover, focus, error, loading, empty) must be designed in code; they are listed under "Gaps" at the end.

Naming is ours (design-system names), not Figma layer names. Mobile = customer app (390 px frames); web = front desk / owner shell (1440 px frames). Colour references come from `docs/design/tokens-draft.md` and the svg icon fills (#552583 primary purple, #9D67EF secondary purple, #FD866E coral, #999999 / #C0C2D4 greys).

## 1. Shell and navigation

| Component | Where used | Variants / states seen |
|---|---|---|
| Web sidebar navigation | every front desk / owner page | v1: flat list (Dashboard, All Reservations, Grooming, Day Care, Customer & Pets, Walking / Employees, Tasks, Reviews, Education, Finance, Reports, Settings) + filled purple Logout button. v2: 'All Booking' expandable group with sub-items (Groom, Broad, Day Care), 'Log Out' text link; Employees expandable (Check List); dashboard variant with chevrons and an extra 'Hotel' item. Active item highlighted (sometimes two at once - bug). Logo header 145x44. To be rebuilt with collapsible categories + expand/collapse all (D-014). |
| Web top app bar | every web page | logo, global search input, primary 'New Booking' button, icon buttons (chat, help, notifications bell), avatar + name/role dropdown ('Wade Warren / Admin'). Dashboard variant: 'Message' and 'Help' text buttons. |
| Page action band | front desk.jpg, front desk-12 | lavender band with right-aligned '+ Hotel Reservation' button above the content card |
| Mobile bottom tab bar | almost every mobile screen | 4 tabs: Home, Bookings (ticket), Pets (paw), Settings (gear); paw tab as centre FAB on Estimate; badge variants: red dot, numeric '1'; active tab highlighted (inconsistently Pets on Home screens). Absent on chat full-screen variant and setting.jpg. |
| Mobile app header | all mobile screens | back chevron + centered title; variant with left-aligned title (Language); variant with right-aligned text action ('Add Pet'); variant with logo header (auth) |
| iOS status bar | most mobile frames | 9:41, decorative |
| Segmented top tabs | notification.png (Notification / Front Desk Chat), notification-1 (Notification / Inbox), reviews.jpg (All Reviews / Publish / Deleted), Control Panel tab strip (Basic Details / Spa Setup / ...), employees-2 tabs | underline indicator (mobile), pill/segment (web), active state |
| Section header / label | Home ('Services', 'Pets', 'Upcoming Bookings'), Estimate ('Booking Detail', 'Payment Details') | plain label; with trailing link ('Add Note') |
| Stepper / progress indicator | Pet Edit, Pet Edit 3, Pet Edit 5, Frame 1171276417 | 2 steps: step active, step done |
| Figma section cover | Section 10.png ('Groom') | not a product component |

## 2. Buttons and actions

| Component | Where used | Variants / states seen |
|---|---|---|
| Primary button (filled purple, full width on mobile) | Next, Submit, Sign Up, Sign in, Save, Update Profile, Pay Deposit, Add a Pet, Chat Now, Payment Method, Create Account, BOOK NOW (overlay on image), Add / Add Customer / Add Pet / Submit (web), New Booking, New Employee, Approve | default; lighter purple variant ('+ Hotel Reservation'); overlay-on-image variant; with leading icon (Submit + upload icon, '+ Hotel Reservation'); white-on-purple variant (Confirm in purple footer); blue variant (PIN Submit) |
| Secondary / outlined button | Pay In Full, Add Grooming, Back (Forgot password), Groom another pet, Cancel (web modals), Archive, Filters, Timesheet View, Agenda View, Open (Control Panel rows), Send Test Email/SMS | outlined purple; with leading icon (Filters sliders, Agenda View) |
| Text link / text button | Sign in, Forgot Password? (red/orange), View Past Reservations (underlined), Add Pet, Add Note, Skip, Change Email, Change Password, Edit (employee sections), Cancel (orange, PIN modal), Log Out | purple; red/orange for destructive or attention |
| Split two-button modal footer | Home Page-4/-5 (Back | Add a Pet / Chat Now) | secondary left, primary right |
| Sticky action footer | image 177, Frame 1171276433 (Cancel text | Confirm white button on purple bar) | replaces tab bar while editing |
| Icon button | back chevron, calendar, clock, upload arrow, attach (+), send, edit pencil, camera badge, delete trash, close X, prev/next arrows, voice call, video call, help, bell, chat | default only |
| Inline '+' add button (extend lookup list) | Customer Details.pdf (Town/City, Reference, Attributes), Pet Details .pdf (Breed, Color, Vet), Board Booking.pdf (customer, pet row, service row, deposit), legacy | adjacent to a dropdown or table |
| Remove-row icon button (red circle X) | Groom Booking .pdf services table, Pet Edit 7 upload card | |
| Floating 'Create A New Spa' button | Frame 1171276434 | top-right primary |

## 3. Inputs and forms

| Component | Where used | Variants / states seen |
|---|---|---|
| Text input (labelled) | all forms | empty with placeholder; filled; with trailing icon (person, envelope, phone); with required asterisk (red); read-only / disabled (Id '0012', Password '********' with Figma tag 'Input Disabled Password'); focused (legacy yellow); with unit suffix ('lbs'); percent suffix ('%'); character counter textarea (0/100) |
| Textarea | feeding instructions, Note (0/100), Description, Medical Alert, legacy Notes | placeholder 'Write instructions here'; counter |
| Dropdown / select | Type, Breed, Sex, Color, State, Time, dosing frequency, Yes/No questions, Status, Handler/Groomer 'All', Chargeable Days, Sales Tax, filters ('All Departements') | value shown; placeholder; with inline '+' |
| Date input / date picker | Date of Birth, Date In/Out, Check In/Out, flea date, Pickup/Delivery Required At | with calendar icon; formats vary (see entities doc 28) |
| Time input / time picker | Check In/Out time, Time In/Out, lunch From/To, Has Lunch | clock/alarm icon; dropdown 'Time'; default '07:45 PM' |
| Month calendar (inline) | Choose Pets, Hotel Reservation, DayCare-1, front desk-4 schedule | single day selected; range highlighted (Choose Pets-2/-3); prev/next month; weekday header S M T W T F S; grid errors in mocks |
| Month calendar popover (date picker) | Hotel Reservations v2, Agenda List, timeline date navigator | anchored under a control; adjacent-month days grey; selected day blue |
| Date navigator | Hotel Reservations v2, Agenda List, timelines, Grooming Day View | [calendar icon] [<] 'Today' or 'MMM D, YYYY' [>] |
| Date range dropdown | all reservation grooming.jpg | '1 June 2024 - 18 June 2024' (older variant) |
| Checkbox | Socialized (Humans/Dogs), Select Pet list, Mixed, Approximate Age, Reminder, Book Out Whole Hotel Room, Include Notes On Invoice, working-hours 'Open On', permissions, form settings | checked / unchecked; select-all in table header |
| Radio group | Personality (Shy/Calm/Hyper/Aggressive), payment method cards, package cards, boxed radios in Control Panel (Charge By, Time Format, Prices Are, providers), legacy recurrence | selected / unselected |
| Toggle switch | Remember me, Dark mode, add-on include toggle, 'Yes' label | off drawn; on state not drawn except selected package check |
| Selectable option card | Language (flag + label + check), payment method (icon + label + radio), package card (icon + title + description + price + check) | selected (filled purple / check) vs dimmed |
| Weekly hours grid | 3.pdf, 8.pdf, 15.pdf | 7 rows x (Open On checkbox, Time In, Time Out); 'Match Time To Business' |
| Colour swatch picker | 1.pdf brand colours, 6.pdf field colours, 15.pdf Color In Calendar, column Change Color submenu | swatch; named options Green/Pink/Yellow/Red + 'Color Picker' |
| Avatar uploader | Add Pet (pencil badge / green camera badge), edit profile (camera badge, dashed orange ring), profile.jpg | empty silhouette; photo set |
| Image upload dropzone | 1.pdf 'Add Photo', 3.pdf Location Images, Customer/Pet Details 'Click to replace or drag and drop' | empty only |
| File upload field (dashed) with trailing upload button | Choose Vaccine, Pet Edit 5 | empty; placeholder lists accepted types |
| Dashed drop zone (full width) | Frame 1171276419 | empty |
| Upload progress card | Pet Edit 7 | complete (green check, 100%, size) / in progress (65%, cancel X) |
| Certificate upload button (table cell) | Pet Details .pdf 'Upload Document' | |
| PIN input | PIN Verification modal | empty, lilac field |
| Search input | web top bar, employees, conversations, settings cards | placeholder 'Search' |
| Phone input with country-code prefix | add employees (+62) | |
| Password input with visibility toggle | Sign Up / Sign In | eye-slash icon |
| Two-column form row | Customer Details (mobile), Add Pet (Type | Breed), Frame 1171276431, add employees | |
| Required-field asterisk | Add Pet, edit profile, Customer Details.pdf | red |
| Info tooltip icon (i) | Control Panel card titles | |

## 4. Cards and content blocks

| Component | Where used | Variants / states seen |
|---|---|---|
| Hero image banner | Home (Petrock pool photo with logo) | |
| Service tile | Home, Services.png, Day care.png | purple square, white line icon, label; Hotel / Spa / Daycare / In Home; 2x2 grid vs 1x4 row |
| Pet card (selector) | Home, Choose Pets, Choose Vaccine, DayCare-1, Frame 1171276425/1171276428 | avatar + name (+ breed or date) + status chip; selected (purple border / filled), dimmed, with warning ('Pending & Needs more Details') |
| Pet grid card | My pets | avatar, name, breed; 2-column grid |
| Add-a-Pet card / button | Home | dashed/empty slot with button |
| Booking card (customer) | Home Page-1/-6/Home Page.png, Frame 1171276424 | stay variant (check-in + check-out) and appointment variant (single date/time + location pin); status text red/green; type icon; two-up layout (carousel?) |
| Room type card | Choose Your Room | photo with overlay BOOK NOW, title, description, price line |
| Summary card with line items | Estimate (room card), Frame 1171276427/1171276430 Booking Details, Frame 1171276435 | icon, title, headline price, rows, TOTAL; footnote variant (non-cash fee) |
| Date/time pair card | Estimate, Choose Pets Check In/Out, Frame 1171276427 | two columns, calendar + clock icons |
| Key-value list card | Estimate Payment Details, Frame 1171276427 Payment details, totals cards (Tax, Grooming, Grand Total) | |
| Promo / info band | Estimate grooming band ('We Generally Do Grooms...') with outlined CTA | lavender background |
| Package card / tile | Frame 1171276428 (selectable), Frame 1171276430/1171276434/1171276435 (summary) | paw icon, name, description, price in orange/red |
| Line item row (service) | Products.png, front desk-5/-8 'Your appointment' | icon tile, uppercase name, grey description, price; icons: paw+cross, grooming tools, dog house |
| Order history card | Frame 1171276434 | package + add-on + totals + 'Re-Create Spa' button |
| Stat row card (3 stats) | Pet Profile (Gender / Birthday / Weight) | UI-kit style |
| Reminder card | Pet Profile | image + title + date + vet |
| Customer card with avatar | front desk-5 booking detail | name, email, pet, breed, status |
| Key-value info grid | front desk-5 (Date, Time, Groomer, Payment Status, Contact, Reason), employees-2 sections | web |
| Note panel | front desk-5 'Additional information', popover note box | |
| Profile card (employee) | employees-2 | avatar, name, title, status pill, contact, department, manager |
| Key-value detail card with Edit link | employees-2 (Personal Information, Address, Emergency Contact) | |
| KPI stat card | front desk-4 | icon, label, big number, 'Update:' date |
| Settings card | front desk-6/-7, Control Panel 1/12/13/14.pdf | header + Add/Edit (+ search), table body; half-width and full-width |
| Review row card | reviews.jpg | date/time, avatar + id/name, title, star rating, tag chips, body, Archive / Approve |
| Conversation list item | notification-1 (mobile), message-1 (web) | avatar, name, preview, relative time, unread badge |
| Notification list item | notification.png, Message Support-2 (inline in chat) | icon circle (outlined vs filled purple = unread?), text, relative time |
| Menu list item with icon | profile.jpg, Frame 1171276432, setting.jpg | coloured line icon, label, optional trailing toggle |
| List row with chevron | Pet Profile notes | icon, title, subtitle, chevron |
| Storefront / location image card | Mask group.png, 1.pdf location thumbnail | rounded image |

## 5. Tables and data display

| Component | Where used | Variants / states seen |
|---|---|---|
| Data table with purple header | Hotel Reservations (v1/v2), Dashboard table, Agenda List, Employees, Control Panel tables, booking form sub-tables | sticky header; select-all + row checkboxes; horizontal scrollbar when columns overflow (v1); ellipsis truncation (Booking Notes); zebra hairlines |
| Collapsible group header (with count) | Hotel Reservations (ARRIVING (34) / DEPARTING (18) / Checking out (18)), timeline groups (Daycare, Penthouses, Suites), legacy grid | caret; mixed case styling (bug) |
| Tabbed data table with counts | front desk-4 (All 45 / ARRIVING 34 / ...) | alternative to grouped table |
| Table with grouped column headers | front desk-6 / 12.pdf (Normal Prices S/M/L/XL/Giant; Time Required ...) | |
| Inline editable table with add/remove row | Board Booking.pdf (pets, rooms, discounts, services), Groom Booking .pdf (pets, services; selected row highlighted purple), Pet Details .pdf vaccination table (date inputs + upload per row) | |
| Table action column | employees.jpg (edit pencil, trash), 14.pdf (Open button) | |
| Table toolbar | search + filter dropdowns (employees), Filters + See All / Timesheet View / Agenda View, date navigator | |
| Pagination + page-size select | employees.jpg ('Showing 1 to 10 of 256', pages 1..17, 'Show 10 entries'), reviews.jpg ('Results per page 6', 01..09) | two styles |
| Status chip / pill | reservations (Future green, Checking In blue, Checked Out amber, Completed mint), booking detail (Confirm green, Pending orange), employees (Active green, Inactive red, On Leave amber), pet cards (Active green dot, Pending orange dot), tags (Excellent green, Amazing blue, Normal amber, Not good red), Exp Vaccine chip | dot + text; filled; outlined |
| Status icon cluster | Agenda List (warning triangle, money, medical cross), legacy flag columns (VIP, Warn, Inv, Vacc), timeline bars (clock, red cross) | |
| Star rating | reviews.jpg | numeric + 5 stars (drawn unfilled) |
| Two-column list | Pet Edit 5 (Required / Recommended vaccines) | |
| Pricing info block | DayCare-1 (Half Day / Full Day / Play Hour) | text block |
| Totals block | invoice sections (Sub Total, Total, Deposit, Balance), legacy Charge, grooming totals | read-only computed row |
| Bar chart with tooltip | front desk-4 Revenue Statistics | 'This Month' dropdown, tooltip 'Mar 23, 2024 $2000' |
| Location thumbnail avatar | front desk-7 | |
| Package icon badge | front desk-6, Spa 12.7 (Gold orange paw, Platinum grey paw, Diamond gem) | |
| Audit footer | legacy ('Added ... by Doris, Last Edited ...') | to carry over |

## 6. Calendar / scheduling

| Component | Where used | Variants / states seen |
|---|---|---|
| Resource timeline (weeks x rooms) | all reservation grooming.*, Section 4 | week headers Sunday-Saturday, day columns, weekend shading, TODAY marker (dashed line + badge, older variant), collapsible room groups, booking bars spanning days, '...' chips for short bookings, dark left edge on bars; Boarding / Grooming title variants |
| Booking bar / chip | timelines | colour (status?), clock icon, red-cross vaccine icon, trailing status icon, label 'Customer, Pet;' |
| Booking detail popover (hover card) | all reservation grooming-2 | icon rows (customer, invoice, mobile, dates, times), pets, Exp Vaccine chip, breed, sex, note |
| Booking context menu | all reservation grooming-3 | Open, View/Edit, Set Status To (submenu with colour swatches + checkmark), Create Invoice, Rebook, Delete |
| Day grid by employee (resource day view) | Grooming.png / Grooming-1.png | hourly rows 07:00-16:00, one tinted column per groomer (availability window), appointment cards (green normal / white + red cross vaccine / red text + warning alert) |
| Column header context menu | Grooming.png | Move Left, Move Right, Change Color (submenu Green/Pink/Yellow/Red/Color Picker), Hide Column |
| Mini month calendar (schedule widget) | front desk-4 'Hotel Reservation Schedule', legacy | selected day |
| Agenda list | Frame 1171276264-11 | table projection of the day's appointments |
| View toggle | 'Agenda View', 'Timesheet View', legacy 'Day View / Timeline View' | button in toolbar |
| Today marker | all reservation grooming.jpg | dashed vertical line + 'TODAY' badge |

D-008: Hotel & Daycare get Table + Timeline; Spa/Grooming gets Table + Board (kanban). No board/kanban component exists in this drop; it must be designed.

## 7. Overlays and feedback

| Component | Where used | Variants / states seen |
|---|---|---|
| Modal dialog (web, large form) | Customer Details, Pet Details, Board Bookings, Groom Bookings, Add New Employee, Control Panel modals 2-11, 15 | title + close X (or back arrow), scrollable body, footer Cancel + Submit/Add; dim overlay |
| Modal dialog (mobile, small) | Home Page-4/-5 ('Hey!') | title, body, split two-button footer |
| PIN Verification modal | all reservation grooming-2.pdf/-4/-9, front desk-3 | purple card, copy, PIN input, Cancel (orange text) / Submit (blue); dim overlay |
| Overlay scrim | all modals | dark (web) / grey (mobile) |
| Warning text banner | Pet Edit 7 ('Reservations Will Be Pending Until Vaccines...') | clipped in mock |
| Hint / caption text | Estimate ('*pay full upfront to get discount', non-cash fee footnote), Pet Edit 5 ('Multiple Uploads') | green / grey |
| Badge (count / dot) | tab bar paw (red dot, '1'), conversation unread (3), Pets tab | |
| Toast / snackbar | not designed | gap |
| Empty state | Home Page-2/-3 (no pets, no bookings), DayCare-3 (empty checkout), empty shells, Day care.png / Day care-1.png 'Coming Soon' | text + CTA; 'Service Coming Soon' tile |
| Loading / skeleton | not designed (Choose Vaccine.png faded render may be a disabled state) | gap |
| Session Start divider pill | Message Support | chat |

## 8. Messaging

| Component | Where used | Variants / states seen |
|---|---|---|
| Chat bubble | Message Support (mobile: Front Desk dark navy right, customer light grey left, avatars), message-1 (web: same purple fill both sides, aligned) | text; image bubble; centered timestamp (mobile) / per-bubble timestamp (web) |
| Message composer | Message Support ('Write a reply...', + attach, send), message-1 ('Type Something...') | |
| Conversation header | message-1 (avatar, name, Online dot, call + video icon buttons), Message Support ('Front Desk' title) | |
| Two-pane inbox layout | message-1 | list left, thread right |
| Online status indicator | message-1 | green dot + 'Online' |

## 9. Brand and iconography

| Component | Where used | Notes |
|---|---|---|
| Logo (full) | logo.png 580x176, auth screens, Home hero | record-disc paw mark + 'Petrock' script + purple 'Hotel and Spa' |
| Logo (sidebar) | sidebar/logo.png 145x44 | tagline illegible at this size; paw-only mark needed for collapsed nav |
| Icon set | 29 svg (Iconly two-tone + Flaticon service icons) | fills #552583, #9D67EF, #FD866E, #999999, #C0C2D4; sizes 16/18/20; see tokens-draft.md |
| Service icons | Hotel (house + paw), Spa (bubbles), Daycare (person + two dogs), In Home (van + paw), grooming clipper, medal | white line icons on purple tiles |
| Tier badges | Gold (orange paw), Platinum (grey paw), Diamond (gem, Group 1171275501.png) | |
| Flag icons | language.jpg (UK, DE, FR, NL, BG) | |
| Payment brand icon | Mastercard (Payment-1, Frame 1171276435), cash icon | |

## 10. Gaps (needed but not drawn)

- Dark theme for every component (toggle exists, D-007); only light variants were exported.
- Hover, focus, error/validation, disabled (beyond password/Id), loading, success and toast states for forms and buttons.
- Empty states for tables, agenda, inbox, timeline; error pages.
- Board / kanban view for grooming (D-008); table view for grooming and daycare; daycare front desk screens; daycare checkout (mobile).
- Confirmation dialogs (Delete account, Delete booking, Delete employee, Archive review, Logout).
- Filters panel contents (Filters button everywhere, never opened); Timesheet View; See All.
- Collapsible sidebar categories with expand/collapse all and location switcher (D-014, D-010).
- Phone-width layouts for the web tables and timelines (D-016: responsive everywhere; timelines may degrade gracefully).
- Sign-up / sign-in / forgot-password final layout and OTP (D-010, D-018); email and password change flows; delete-account confirmation.
- Manager PIN issuing UI (only the entry modal is drawn); staff PIN login.
- Notification / email / SMS templates (legacy Template Editors).
- Invoice print layout (9.pdf settings only); receipt; payment processor UI (Stripe).
- Reports, Education, Tasks, Walking, Check List, Finance: empty shells only.
