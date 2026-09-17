# Open questions from the Figma export (drop 1)

Merged and de-duplicated from the readers' notes on every export (`docs/figma/screen-catalog.md`, 2026-09-17). Grouped by flow. Each question names the screens that raise it. Questions already answered by a decision are marked with the D-number. Answers go into `docs/decisions.md` (new rows) and the rules registry (`docs/rules/business-rules-from-designs.md`); this file is then updated, not deleted.

Priority markers: **[build-blocking]** = must be answered before that flow can be built; **[design]** = designer / copy fix; **[data]** = affects the data model.

## 1. Cross-cutting

1. **[build-blocking] Which side of each two-up `Frame 11712764xx` composite is the approved layout?** All pairs are two light variants (design vs build, or two layouts), not light/dark. (Frame 1171276417-1171276435)
2. **[build-blocking] Dark mode**: a Dark mode toggle exists (setting.jpg) but no dark screen was exported. Confirm dark theme is required for every screen (D-007 says yes) and whether any dark frames exist in Figma.
3. **[data] One display date format.** Seen: 9-23-2024, 4/05/2025, 16 Nov 2024, 24/12/24, June 20, 2022, 06-29-2024, Mar 21, 2024, Feb 22, 2024, 06/29/2024, 14/24/2025 (invalid). Also time formats 09:00, 10:00 AM, 8:00 pm, 8:00AM, 07:45 PM.
4. **[data] Weight unit and control**: lbs (Add Pet, room rules) vs Kg (Pet Profile); numeric input with suffix vs dropdown '9 lbs'. (Pet Edit.png, Frame 1171276417, Pet Profile)
5. **[design] Sidebar naming**: 'All Reservations' (v1) vs 'All Booking' with sub-items Groom / Broad / Day Care (v2); extra 'Hotel' item in front desk-3; 'Broad' is presumably 'Board(ing)'. Which is canonical? Also two items highlighted at once (All Booking + Tasks) and Dashboard highlighted on the reservations page. (front desk.jpg, front desk-1/-2/-3, all timeline pages) - D-014 rebuilds the menu anyway.
6. **[design] Placeholder / UI-kit leftovers to confirm as non-features**: orders and deliveries in notifications, vet appointment reminders, 'Rate App', 'Invite Friend', voice/video calls, property-moving review copy, HR fields on employees (payroll, insurance), multi-species sample pets, Japanese addresses, +62 phone code, 'Parent group's ...' bindings.
7. **[data] Real customer PII appears in the legacy screenshots** (cloud1-*.png, image 114/115/165/169). Confirm they are internal reference only and will never be shipped as sample data.
8. **[design] Copy and typo list** in `business-rules-from-designs.md` section N - who owns copy fixes, designer or build?
9. **Legacy features dropped in the redesign**: groom recurrence, newsletter / marketing opt-in, Referred By, Customer Since, Initials, Documents table with 'Email Me', Photos gallery, Canine Influenza vaccine, audit trail (added/edited by), Ext., '$ or %' discount unit, Add Deposit action, Day's Notes, holiday / boarding-closed days. Intentional? (Customer Details.pdf, Pet Details .pdf, Board/Groom Booking .pdf vs legacy screenshots)
10. **Which PetLinx-style settings are in scope for a web app**: skins, single copy of each form, refresh database, Dropbox uploads, cash drawer, retail products. (6.pdf, 7.pdf, 10.pdf)
11. **[build-blocking] Node-id mapping**: every export must be mapped to its Figma node on the second pass (after ~2026-09-22, D-012) or from the pending .fig; the numbered PDFs 1-15 were mapped to the Control Panel by content only.

## 2. Onboarding and auth (customer app)

12. Which onboarding entry layout is intended: headline 'Create your Account' with Sign in link, or 'New To Petrock?' with Create Account button? (Frame 1171276420) - D-018 allows improving auth beyond the screens.
13. Sign In and Forgot Password reuse the 'Create your Account / New To Petrock?' header and Sign In has an 'Already have an account? Sign in' footer - copy errors? 'Forget password' should be 'Forgot password'. (Frame 1171276422, Frame 1171276423)
14. Is 'Remember me' required; is an OTP step designed (D-010 lists an OTP modal from older sections)? Password rules (placeholder '#123@156')?
15. Where do 'Change Email' and 'Change Password' lead, and is Delete account confirmed / re-authenticated? (image 175, setting.jpg, Frame 1171276432)

## 3. Home (customer app)

16. Should the empty Home hide the 'Upcoming Bookings' header (Home Page-2) or show it over an empty area (Home Page-3)?
17. Bottom CTA: underlined link 'View Past Reservations' (Figma) vs filled button 'View Past Bookings' (build); Home tab bar highlights Pets rather than Home. Confirm active tab and CTA style. (Home Page-1, Frame 1171276424)
18. Spa booking naming on cards: 'Spa Grooming' vs 'Hotel Spa' vs 'Spa'; and a spa icon on a card titled 'Hotel Suite'. What are the canonical booking types and card layouts (stay vs appointment)? (Home Page-1/-6/Home Page.png) - D-011 proposes 'Grooming' with Spa as a package category.
19. Booking cards are two-up: horizontal carousel or wrap? (Home Page.png)
20. Services tiles: 2x2 grid or one row of four? (Frame 1171276424)
21. Where does 'Chat Now' lead (in-app chat, WhatsApp, SMS)? (Home Page-5)
22. What does the red '1' badge on the Pets (paw) tab count: pending pet, missing vaccine, unread notification or chat? (many screens)

## 4. Add pet and pet management (customer app)

23. **[build-blocking] Add Pet wizard structure**: a 2-step stepper but at least three step screens exist (Add Pet basics, Pet Details behaviour/feeding, Medical Details/vaccines). Which questions belong to which step, and how many steps? Socialisation, personality and treats appear on both step 1 (Pet Edit-1) and step 2 (Pet Edit 3, Frame 1171276418).
24. Personality: radio buttons (Figma) vs dropdown (build). Meals per day: 'AM & PM' (Figma) vs numeric count '1' (build). Which control and option set? (Pet Edit 3, Frame 1171276418)
25. Does the app support species other than dogs? The Type field and My pets sample (cats, rabbit, birds) suggest yes; all copy says 'your dog'. (Pet Edit.png, My pets, Booking Details Add Pets)
26. Are My Pets grid and Pet Profile (Reminder, Notes with 'Last Do In' dates, Kg, dashed orange ring) in scope, or UI-kit concepts? They use a different visual style. (My pets (more than one pet).jpg, Pet Profile (Single Pet).jpg, edit profile.jpg)
27. The 'Pet Profile' edit form mixes pet fields (First Name, Breed) with owner fields (E-mail, Contact Number). Should it be pet-only with the full pet schema? (edit profile.jpg)
28. [data] Is 'temper' (front desk) the same field as 'personality' (mobile)? Is the pet 'size' (Large / Medium) the same scale as spa sizes S/M/L/XL/Giant, and what weight bands define them?
29. Pet Details (front desk) has no owner/customer selector - is a pet always created from within a customer context? (Pet Details .pdf)
30. Pet 'Status' and Customer 'Status' show only 'Active'; what other values exist (Inactive, Blocked, Non-Active)? (Customer/Pet Details .pdf, legacy)

## 5. Vaccines

31. **[build-blocking] Canonical vaccine list and which are compulsory**: customer app requires Distemper/Parvo, Bordetella, Rabies (+ recommended Lepto, Influenza); front desk tracks DHPP, Leptospirosis, Bordetella, Rabies; legacy Bordetella, Canine Influenza, DHPP. (Choose Vaccine, Pet Edit 5, Pet Details .pdf, image 114) - D-003 vaccine flow.
32. Per-vaccine uploads (Choose Vaccine, Frame 1171276419) or one multi-file 'invoices or certificates' upload (Pet Edit 5)? Both patterns exist.
33. Is .gif an accepted document type? Listed on some upload screens, not on Medical Details.
34. Does a missing / expired vaccine block booking or only warn (pet 'Pending', reservation 'Pending Verification', red-cross flags)? Who verifies (front desk) and what are the exact pet approval states: Approved, Active, Pending, 'Pending & Needs more Details'?
35. Choose Vaccine.png is rendered faded: disabled / loading state or export artefact? What do the pet-card dates (3-03-2024) and Active / Pending chips represent (vaccine expiry, approval date, birth date)?
36. Full text of the clipped warning 'Reservations Will Be Pending Until Vaccine...' and does it also apply when the customer taps Skip? (Pet Edit 7, Pet Edit 5)
37. Can staff add vaccine types beyond the defaults, and what does the vaccination 'Reference' column hold? (Pet Details .pdf)

## 6. Hotel booking (customer app)

38. **[build-blocking] Step order**: does BOOK NOW on a room card go straight to Estimate, or to the pet medical / customer / billing details forms first? The exports do not show the sequence. (Choose Pets -> Choose Your Room -> Booking Details Add Pets -> Customer Details -> Billing Details -> Estimate -> Payment?)
39. Room-share question: text input with placeholder 'A Complex Form Might...' vs Yes/No dropdown - which is intended, and does sharing a room change pricing (per-room vs per-pet)? (Choose Pets.png vs Choose Pets-3)
40. Calendar above or below the Check In / Check Out card; does the calendar drive the date fields (range selection) or are they independent? The mock calendar shows 31 days in February. (Choose Pets*, Hotel Reservation.png)
41. 'Hotel Reservation' vs 'Choose Pets' title for the same step; is Hotel Reservation.png deprecated?
42. Pet details form has three titles (Add / Confirm / Additional Pet Details): when does each appear, and is the form per pet or shared across selected pets? What is the unlabeled date field (last flea dose? next due?) (Booking Details Add Pets*)
43. Medication section allows one medication despite 'How many?' - should it support multiple entries? (Booking Details Add Pets, Frame 1171276426)
44. Customer Details vs Billing Details: are both required, is billing prefillable, and why do phone labels differ (Phone/Alt Phone vs Cell Phone/Home Phone)? Is a separate billing address stored? (Booking Details Final Customer Details*)
45. **[build-blocking] Estimate maths**: '2 Nights X $15.50 = $31.00' + tax $1.09 = TOTAL $232.09 vs headline $200 and Payment Details total $232.90. What are the real line items; is the room rate per night per pet; how are nights counted when check-in and check-out are the same date; are late check-out fees applied? (Booking Detail.jpg)
46. Which Estimate variant is final: Payment Details card + deposit-discount hint, or credit-card fee footnote without Payment Details? (Booking Detail.jpg vs -3)
47. Deposit amount / percentage and the pay-in-full discount value? Does the 3.8% / 3.89% card fee apply to deposits too, and is it configurable? (Booking Detail, front desk-7)
48. Room prices differ: $150 / $105 ('$105vv') vs $115 / $115 'Avg Per Night/Pet' (customer app) vs $120-$155 / $85-$110 per 24 h weekday/weekend/seasonal (settings). Which is shown to customers, and what are the Suite inclusions (description is copy-pasted from Penthouse)? (Choose Your Room*, front desk-7)
49. Grooming add-on from the Estimate: what services / prices are offered and how do they appear in the estimate? (Booking Detail 'Add Grooming', Frame 1171276430)
50. Tax: flat 2% on customer summaries vs a single named tax with service / product / boarding rates (11.pdf) vs five tax lines on booking detail (front desk-5). Does tax apply to cash payments too? Prices tax-inclusive or exclusive?

## 7. Grooming booking (customer app)

51. Grooming checkout header reads 'Choose Time' on the payment summary and past-orders screens; package title placeholder is 'Choose Time' - real names? (Frame 1171276435, 1171276434, 1171276428)
52. **[build-blocking] Grooming totals**: $50 package + $200 add-ons -> 'Grooming $500', 'Tax (2%) $64', 'Grand Total $565'. Placeholder numbers or a formula (per pet? per size?)? (Frame 1171276434/1171276435)
53. Second summary card labelled 'Booking Details' should be 'Grooming Details'? (Frame 1171276430)
54. Is there a grooming date/time (appointment slot) picker screen? None exported; the day view implies slots per groomer.
55. Are Apple Pay / PayPal / saved cards supported beyond credit card (Mastercard) and cash at location? Is card payment processed in-app (which provider) or just recorded? (Payment-1, Frame 1171276435) - Stripe on kanban.
56. Payment screen title: 'Choose Payment' vs 'Choose Payment Method'. (Payment.png vs Payment-1)

## 8. Daycare (customer app and front desk)

57. **[build-blocking] Is Daycare in scope for launch?** 'Daycare Service Coming Soon' (Day care.png) vs full reservation screens (DayCare*.png); front desk has only an empty shell; D-003 says not designed yet.
58. Half / full day threshold: 5 hours (mobile) vs 6 hours (settings); 10:00-14:00 (4 h) is priced '$45 for Half Day'. Boundary inclusive? (DayCare-1, front desk-7)
59. Daycare Checkout (DayCare-3) is empty - what summary / payment content should it contain? Same medical questionnaire as hotel?
60. Designer's own note: 'Do we deduct hotel guests from day care capacity?' (front desk-7, 13.pdf)
61. Is 'Walk $12' a daycare item or the separate Walking module (empty shell)? (front desk-7, employees-3.jpg)

## 9. Account, settings, notifications and chat (customer app)

62. Profile hub menu: full Figma list (Edit Profile, My Pets, Add Pets, Address, Setting, Rate App, About App, Invite Friend, Help, Logout) vs build (Edit profile, My pets, Address, Delete account, Logout). Which items ship? Two screens titled 'Settings' plus a 'Setting' item - rename? (profile.jpg, Frame 1171276432, setting.jpg)
63. Language screen: cards overflow the right edge in both exports - layout bug? Native names (Deutsch, Francais) or English exonyms consistently? Are five languages really required? (language.jpg)
64. Notification centre tab naming: 'Front Desk Chat' vs 'Inbox'; page title 'Notification' vs 'Inbox'. (notification.png, notification-1)
65. Should system notifications appear inline inside the Front Desk chat (Message Support-2) or only in the Notification tab?
66. Chat bubble alignment is inverted from convention (Front Desk right/dark, customer left/light) - intentional? Full-screen (no tab bar) or inside the tab shell? (Message Support, -1) - D-018 allows redesign.
67. What does 'Session Start' mean - is a chat session tied to a stay / booking, and can customers start one? (Message Support)
68. Are sample-data mismatches just placeholders (Brenda Mosciski / john@gmail.com; chat addresses 'Marian'; jennywilson@demo.com)?

## 10. Front desk: reservations table, booking detail, dashboard

69. What distinguishes DEPARTING from 'Checking out', and why does DEPARTING contain both Checking In and Checked Out rows? (Frame 1171276264-10)
70. **[build-blocking] Full booking status lifecycle and one vocabulary**: timeline Future / Checked In / Checked out and Complete / Canceled / No Show; tables Future / Checking In / Checked Out / Completed; detail 'Confirm'; legacy 'Checked Out & ...'; customer 'Pending Verification' / 'Upcoming'. Which statuses appear in which day bucket (Arriving / Departing / Staying / Checking out)?
71. Is the v1 table (Filters + See All, truncated columns) superseded by v2 (date navigator + Timesheet View, full columns)? What do 'Timesheet View' and 'See All' show, and what filters sit behind 'Filters'? (Frame 1171276264*, front desk*.jpg)
72. Table row actions: click opens Booking detail? Bulk actions on selected rows (check in, check out, cancel, delete)? Does EDIT open the booking form modal? (front desk-5)
73. How is Nbr Days computed when Date In equals Date Out (shown 02)? How are multiple pets displayed when Pet(S) shows one name but Pet Count is 02?
74. Booking detail is a grooming appointment (Groomer, Reason: Grooming, tax lines, total equals service price) - is there a hotel-specific detail (room, check-in/out, deposits, balance) or is this generic across services? Should taxes be added to the total? (front desk-5, -8)
75. Dashboard KPI set: 'Today's Hotel Revenue $3,600' vs older 'Total Revenue $10,29,478' (Indian grouping). Which KPIs, and why do tab counts (34+18+5+2=59) not equal All (45)? (front desk-4, front desk-3)
76. Date picker component shows February 2022 with 29 and 31 - confirm a standard month grid with range selection for all calendars.

## 11. Front desk: timelines, day view, agenda

77. What do the booking bar colours mean (status vs per-booking colour vs service type)? They do not match the five status swatches. What do the two clock icons on each bar mean (time in/out, late, unpaid)? What are the '...' chips? (all reservation grooming.jpg / .pdf)
78. Is the older SORT / FILTER / date-range variant (all reservation grooming.jpg) deprecated in favour of Today / Filters / Agenda View?
79. Is the day grid titled 'Grooming Day View' or 'Grooming Timeline View'? Its time axis ends with 01:30 PM after 04:00 PM; what are start / end hours and slot granularity (7.pdf Time Interval)? (Grooming.png, Grooming.pdf)
80. Warning triangle + red text on 'Alkoby, Louie' means what (unconfirmed, conflict, unpaid, expired vaccine)? (Grooming.png)
81. Popover dates (2/14/2025 - 2/26/2025) do not match the bar position (June 2024); is the Suites group intentionally empty; are room names like 'PH(B) COUN' truncated codes? (all reservation grooming-2)
82. Are groomer column colours / order / hidden state saved per user or globally? (Grooming.png, 15.pdf Color In Calendar)
83. Does the Agenda View exist as its own design, and is the Agenda List grooming-specific or shared across booking types? What do its three status icons (warning, money, medical) mean, and what does a row open? Why does a grooming agenda page carry a '+ Hotel Reservation' button? (Frame 1171276264-11, front desk-12)
84. D-008 says Spa/Grooming gets Table + Board (kanban): no board view exists in the export - to be designed fresh; confirm.
85. Timeline / kanban behaviour on phones (D-016: may degrade gracefully) - acceptable minimum?

## 12. Front desk: add forms (customer, pet, boarding, grooming)

86. Placeholder / copy errors to confirm: 'Addreess'; Work Phone placeholder 'Email Address'; Registration Number 'Mobile Number'; Microchip Number 'Email Address'; 'Shepperd'; 'Click to replace' on new records. Are Registration / Microchip free text or dropdowns; Town/City and State free text or dropdowns; is Country needed? (Customer/Pet Details .pdf, 2.pdf, 15.pdf)
87. Board booking shows 'Boarding Total' twice (Rooms and Discount Surcharge sections) - same value or pre/post discount and tax? How are Sub Total, Total, Deposit and Balance calculated (sample 1454 / 45725)? (Board Booking.pdf)
88. Chargeable Days is a dropdown - computed from Date In/Out (per 4.pdf rules) or chosen manually? What are the First / Last Day Charge options (0.5, 1.0, ...)? (Board Booking.pdf)
89. What do the Type ('All') dropdowns in Rooms and Handler / Groomer ('All') mean on a create form - filters or values? How are Sales Tax options defined? (Board/Groom Booking .pdf)
90. Additional services: what are the Occurs options, are M / A / E checkboxes, and where is the service catalogue maintained (legacy Services / Products)? (Board Booking.pdf)
91. Should the redesigned Groom Booking keep recurrence (legacy) and 'Groom Style'? What is Groom Style? (Groom Booking .pdf, 8.pdf)
92. Attachment: single or multi-file; are validation / error, loading and success states designed for these forms? None exported.
93. Are Amenities*.png and Frame*.png misnamed exports of Customer / Pet Details, and which of the many duplicates is canonical?

## 13. Owner: Control Panel and settings

94. Tab naming: Pricing Setup / Appointment / Employee Schedule (1.pdf) vs Spa Setup / Hotel & Daycare Setup / Employee Setup (12-14.pdf) - which is final? Settings content also appears in the front desk shell (front desk-6/-7): one Settings area or two (front desk vs owner, D-002)?
95. Several modals reuse the title 'Name And Contact Details' (company, location, employee) - give each its own title? (2.pdf, 3.pdf, 15.pdf)
96. Boarding modal lists 'New Bookings Book Out Whole Hotel Room By Default' twice - what is the second option? (4.pdf)
97. Invoice modal has a section mislabelled 'Boarding Hours'; what are Payment Processing Option 1-3? (9.pdf)
98. 'Time Required on Calendar' cells contain dollar amounts and the header uses 'A' for L; what are the real times and units? Are all three packages really the same price (spa card says Platinum $65-$150)? Diamond prices and inclusions? (front desk-6, 12.pdf, Spa 12.7 2.png)
99. Add-ons: Color/Highlights listed twice ($15 and $16); what does '+' mean on Medicated Shampoo $20+ and Nail Polish $30+? Is there an employee type / skill taxonomy behind 'special employee'? (front desk-6)
100. Capacity table has two 'LOS ANGELES' columns - third location or typo? (front desk-7, 13.pdf)
101. Suite Mon-Thurs price '85' lacks a $ sign; are seasonal rates date-range configurable; are holiday dates configurable (used by long-stay exclusion and recurrence shift)? (front desk-7, 8.pdf)
102. Are 'Add' / 'Edit' on settings cards inline table editing or modals; is there delete? (front desk-6/-7, 1.pdf)
103. 'General User Security Setting': per-role, per-user or global default? How does it relate to the manager PIN? (10.pdf)
104. **[build-blocking] Manager PIN**: PIN length / format, expiry, single-use; who issues it and where; which roles bypass it (Admin shown); which status transitions require it (all, or only Canceled / No Show / Checked out / Delete)? (all reservation grooming-2.pdf, front desk-3)
105. Time in/out dropdowns default to 07:45 PM everywhere - intended default or placeholder? (3.pdf, 8.pdf, 15.pdf, Board/Groom Booking)
106. Email / SMS providers: keep Gmail / SMTP / Petlinx options or replace with the platform's integrations? (5.pdf)
107. Is there a completed Control Panel design beyond the 'Control Panel (Draft)' header (Frame 1171276472.png)?

## 14. Owner: employees and reviews

108. Employees has a 'Check List' sub-page and Details tabs Job / Payroll / Performance / Documents / Account Settings, none designed - in scope? (employees-1, employees-2) - D-005: Employees required as user management.
109. Employee record: HR-style Details (employees-2, with conflicting emails and IT Helpdesk under department Groom) vs operational Control Panel modal (15.pdf: calendar colour, hours, commissions). One record, which fields?
110. Phone country code default +62 - should be +1? Is Department a fixed list (Groom, Sales, Operations, IT, Receptionist, Room Service, Take Care - some look like job titles)? Is 'On Leave' manual or derived? (add employees, employees.jpg)
111. Review moderation: does Approve = Publish and Archive = Deleted; can a published review be unpublished; what are the two tag chips (customer-selected vs sentiment); stars drawn unfilled despite a rating? Where do reviews come from ('Rate App')? (reviews.jpg)

## 15. Shared and reference

112. Spa 12.7 2.png is cropped: Diamond Groom inclusions and prices, Sanitary Trim add-on price; is there a newer price list than '12.7'?
113. Is the diamond icon (Group 1171275501.png) the Diamond Groom badge or a VIP / loyalty marker?
114. Which legacy PetLinx fields must carry over (Temper, Registration #, Handler, First/Last Day Charge, M/A/E flags, Book Out Whole Run, VIP / Warn / Inv / Vacc flags, Day's Notes) and which can be dropped? (cloud1-*.png, image 114/115/165/169)
115. What does legacy 'Checked Out & ...' expand to (e.g. '& Invoiced')?
116. Storefront photo (Mask group.png) is a low-res street-view capture - will a licensed photo be supplied, and where is it used (About / Location / hero)?
117. Should the sidebar logo drop the 'Hotel and Spa' tagline at small sizes; is there a paw-only mark / favicon? (sidebar/logo.png)
118. Icons not viewed on this pass (Lable.svg, Qustion-Circle.svg, User-1/-2.svg, image 28.svg, animal-rescue*, hair-clipper*, medal*) - confirm usage on the second pass.
