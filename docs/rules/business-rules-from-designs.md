# Business rules, prices, thresholds and copy seen in the designs

Seed list for the **business rules registry** (D-006): every rule, price, threshold and notable piece of copy found in the Figma export drop 1 (`docs/figma/screen-catalog.md`, 2026-09-17), each with its source screen. **Status of every row: `seen in design`** (not yet confirmed by Justin; the registry statuses requested / in dev / implemented come later). Rule ids `R-xxx` are provisional and grouped by area; renumbering is allowed until the registry is created in code, after which ids are append-only.

Where two screens disagree the conflict is recorded as its own row so the registry carries the decision. Amounts are USD. Copy is quoted verbatim, including the typos, so it can be found in the Figma file.

Also in scope but not in this drop (from prompt 0002, D-006): "Dog 55lb or greater must be a Suite", "Daycare shorter than X leaves no time for spa"; they stay in the registry as `requested`.

## A. Booking eligibility and pets

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-A01 | Booking any service requires at least one pet on the customer account | Modal 'Hey! To Book An Appointment Please 1st Add A Pet' with Back / Add a Pet | Home Page-4.png | seen in design |
| R-A02 | In Home service is inquiry-only via chat, not bookable in-app | Modal 'Hey! Go To Chat To Inquire About In Home Services', button 'Chat Now'; 'In Home Service Coming Soon' | Home Page-5.png, Day care-1.png | seen in design (matches D-003: In Home out of scope) |
| R-A03 | Daycare shown as coming soon in one variant while full daycare screens exist | 'Daycare Service Coming Soon' | Day care.png vs DayCare*.png | seen in design (conflict; D-003) |
| R-A04 | Pets carry an approval status visible to the customer: Approved / Active vs Pending / 'Pending & Needs more Details' (warning icon) | chips green / orange | Home Page-1.png, Choose Pets.png, Choose Vaccine.png, Frame 1171276424.png | seen in design |
| R-A05 | Reservations stay Pending until vaccine documents are provided / verified | 'Reservations Will Be Pending Until Vaccine[s ...]' (clipped) | Pet Edit 7.png | seen in design |
| R-A06 | Booking status 'Pending Verification' is shown to the customer until the front desk verifies | red status on booking card | Home Page-1.png | seen in design |
| R-A07 | Multi-pet bookings ask whether pets share a room | 'Do You Want Your Pets To Share A Room?' (Yes/No) | Choose Pets-3.png, Frame 1171276425.png | seen in design |
| R-A08 | Grooming can be added to a hotel stay at booking or from the estimate | 'Would You Like To Add Grooming?'; 'Add Grooming' | Choose Pets.png, Booking Detail.jpg | seen in design |
| R-A09 | Grooms are generally done at the end of hotel stays; extra or multiple grooms require contacting the business | 'We Generally Do Grooms At The End Of Hotel Stays. If You'd Like An Extra Groom, Please Contact Us. If You'd Like More Than One Groom, Please Contact Us.' | Booking Detail.jpg, Frame 1171276427.png | seen in design |
| R-A10 | Medical questionnaire per boarded pet: medication (count, name, dosing e.g. '1 Daily (AM ONLY)'), vet-recommended flea medication (brand, date), medical alert; can apply to several selected pets | | Booking Details Add Pets*.png, DayCare-2.png, Frame 1171276426.png | seen in design |
| R-A11 | Pet vaccination status is shown at booking time ('Vaccination: OK') and expired vaccines are flagged on the timeline (red cross) and popover ('Exp Vaccine') | | Board/Groom Booking .pdf, all reservation grooming-2.jpg, legacy | seen in design |
| R-A12 | Prompt about expired or missing compulsory vaccinations on pet and booking forms (setting) | 'Prompt About Expired Or Missing Compulsory Vaccinations' | 6.pdf | seen in design |
| R-A13 | Pet attributes can carry staff instructions | legacy attributes 'Aggressive', 'Muzzle', 'Nasim only' | image 114.png, Pet Details .pdf | seen in design (legacy) |

## B. Vaccines

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-B01 | Required vaccines (customer app) | Distemper/Parvo, Bordetella, Rabies | Choose Vaccine.png, Frame 1171276419.png, Pet Edit 5.png | seen in design |
| R-B02 | Recommended vaccines (customer app) | Lepto, Influenza ('Reccomended' typo) | Pet Edit 5.png | seen in design |
| R-B03 | Vaccine types tracked on the front desk pet form | DHPP, Leptospirosis, Bordetella, Rabies; each with Vaccinated, Expires, Reference, Certificate | Pet Details .pdf | seen in design (differs from R-B01/02) |
| R-B04 | Legacy vaccine types | Bordetella, Canine Influenza, DHPP; missing rows shown red | image 114.png | seen in design (legacy) |
| R-B05 | Accepted vaccine document formats | '.jpg, .png, .gif, .pdf' | Choose Vaccine.png, Frame 1171276419.png | seen in design |
| R-B06 | Accepted vaccine document formats (Medical Details) | '.jpg, .png, .pdf'; 'Multiple Uploads' | Pet Edit 5.png | seen in design (conflict with R-B05 on .gif) |
| R-B07 | Vaccine / medical step is skippable at pet creation | 'Skip' link | Pet Edit 5.png | seen in design |
| R-B08 | Vet can be chosen from a list or added | 'See List of Vets or Add a Vet' | Pet Edit 5.png, Pet Details .pdf | seen in design |
| R-B09 | Upload feedback shows size and percent, allows cancel | 'image.jpg 10 MB 100%', 'myresume.pdf 2 MB 65%' | Pet Edit 7.png | seen in design |
| R-B10 | Vaccination Fee is a chargeable boarding service | 'Vaccination Fee' $40.00 (HST) Once | Board Booking.pdf (legacy side), image 165.png | seen in design (legacy) |

## C. Add Pet form

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-C01 | Required pet fields | Name, Type, Sex, Neutered/Spayed (red asterisk); Breed, Color, Weight, Date of Birth optional | Pet Edit.png, Frame 1171276417.png | seen in design |
| R-C02 | Weight unit | lbs (Add Pet); Kg on Pet Profile | Pet Edit.png, Pet Profile (Single Pet).jpg | seen in design (conflict) |
| R-C03 | Socialisation is multi-select (Humans / Dogs); personality is single-select (Shy / Calm / Hyper / Aggressive) | | Pet Edit 3.png, Pet Edit-1.png | seen in design |
| R-C04 | Meals per day options | 'AM & PM' (Figma) vs numeric '1' (build) | Pet Edit 3.png vs Frame 1171276418.png | seen in design (conflict) |
| R-C05 | Feeding instructions captured for AM, Mid Day and PM; own food yes/no; treats yes/no | | Pet Edit 3.png | seen in design |
| R-C06 | Pet Id is system-generated; breed can be flagged Mixed; DOB can be flagged Approximate Age | | Pet Details .pdf | seen in design |
| R-C07 | All Pet Profile edit fields required | First Name, Breed, E-mail, Contact Number (asterisks) | edit profile.jpg | seen in design (UI-kit screen, low confidence) |

## D. Hotel (boarding) pricing and booking maths

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-D01 | Room types | Penthouse, Suite | Choose Your Room.png, front desk-7.jpg | seen in design |
| R-D02 | Penthouse inclusions | 'Petrock Penthouses Offer A TV, Premium Bed, Toys, Potty Pads, Room Service, Playtime, 2 Walks Per Day, Photos And Videos Every Night, A Bedtime Tuck In And Tummy Rub.' | Choose Your Room.png | seen in design |
| R-D03 | Suite inclusions | copy-pasted from Penthouse (placeholder) | Choose Your Room.png | seen in design (needs real copy) |
| R-D04 | Customer-app room prices, 'Avg Per Night/Pet' | Penthouse $150, Suite $105 ('$105vv' typo); variant both $115 | Choose Your Room.png, Choose Your Room-1.png | seen in design (conflict with R-D05) |
| R-D05 | Hotel room rates per 24 hr (settings) | Penthouses: Mon-Thurs $120, Fri-Sun $135, Seasonal Mon-Thurs $140, Seasonal Fri-Sun $155. Suite: Mon-Thurs 85 (no $), Fri-Sun $95, Seasonal $100 / $110 | front desk-7.jpg, 13.pdf | seen in design |
| R-D06 | Weekday vs weekend and seasonal pricing exist | Mon-Thurs / Fri-Sun; '(Seasonal)' | front desk-7.jpg | seen in design (season dates not defined) |
| R-D07 | Boarding total = room rate x chargeable days | legacy $131.00 x 10.00 = $1,310.00 | image 165.png, Board Booking.pdf | seen in design (legacy) |
| R-D08 | Chargeable days derive from date + time in/out; fractional | legacy 1.25, 6.50, 7.00, 10.00 | cloud1-*.png | seen in design (legacy) |
| R-D09 | First / last day charge multipliers (default 1.0) control partial-day billing | 'First Day Charge 1.0', 'Last Day Charge 1.0' | Board Booking.pdf, image 165.png | seen in design |
| R-D10 | Boarding charged by Day (options Night, Hours); default check in/out window 07:00 AM - 08:00 PM; extra windows via 'And Also' | | 4.pdf, 1.pdf ('Charge By Day') | seen in design |
| R-D11 | Charge N day(s) on first day if check-in is after [time]; charge N day(s) on last day if check-out is before [time] | configurable | 4.pdf | seen in design |
| R-D12 | Minimum charge N day(s) | configurable | 4.pdf | seen in design |
| R-D13 | New bookings can book out the whole hotel room by default | 'New Bookings Book Out Whole Hotel Room By Default' (listed twice) | 4.pdf, Board Booking.pdf | seen in design |
| R-D14 | Balance = Total Charge - Deposits (may be negative, shown in parentheses) | $150 - $0 = $150; legacy ($3.68) | Frame 1171276264-10.png, cloud1-*.png | seen in design |
| R-D15 | Discount entered as % on booking forms (legacy allowed $ or %) | 'Discount 0012 %'; legacy '655.00 $' | Board/Groom Booking .pdf, image 165.png | seen in design |
| R-D16 | Additional boarding services have an occurrence and Morning / Afternoon / Evening flags | 'Occurs', M / A / E; 'Veterinary Travel $50 Once', 'Vaccination Fee $40 Once' | Board Booking.pdf, image 165.png | seen in design |
| R-D17 | Pickup / delivery (transport) can be required at a time on boarding and grooming bookings | 'Pickup Required At', 'Delivery Required At' | Board/Groom Booking .pdf | seen in design |
| R-D18 | Estimate line items (customer app) | Room (2 Nights X $15.50) $31.00; Tax (2%) $1.09; TOTAL $232.09; headline $200; Payment Details Total $232.90 | Booking Detail.jpg | seen in design (numbers inconsistent, placeholder) |
| R-D19 | Estimate shows check-in and check-out equal while billing 2 nights | 16 Nov 2024 10:00 AM both | Booking Detail.jpg | seen in design (placeholder) |
| R-D20 | Per-pet charge line on hotel summary | 'Pets: Cost' | Frame 1171276427.png | seen in design |

## E. Hotel discounts, capacity and room-fit rules

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-E01 | Two dogs in a penthouse | $15 off each dog per night | front desk-7.jpg, 13.pdf | seen in design |
| R-E02 | Three dogs in a penthouse | $20 off each dog per night | front desk-7.jpg, 13.pdf | seen in design |
| R-E03 | Two dogs in a suite | $10 off each dog per night | front desk-7.jpg, 13.pdf | seen in design |
| R-E04 | Long stay 7 days (not holiday), paid in full | 5% off | front desk-7.jpg, 13.pdf | seen in design |
| R-E05 | Long stay 14 days (not holiday), paid in full | 7.5% off | front desk-7.jpg, 13.pdf | seen in design |
| R-E06 | Long stay 21 days (not holiday), paid in full | 10% off | front desk-7.jpg, 13.pdf | seen in design |
| R-E07 | Legacy practice: prepay discount | '6% off non holiday days PREPAY', '(Pre pay, first time)' | cloud1-*.png booking notes | seen in design (legacy) |
| R-E08 | Paying in full upfront earns a discount (customer copy) | '*pay full upfront to get discount.' | Booking Detail.jpg | seen in design |
| R-E09 | Dogs over 30 lbs can only fit in the bottom 6 penthouse rooms | note on capacity table | front desk-7.jpg, 13.pdf | seen in design (compare D-006 seed: 55 lb -> Suite) |
| R-E10 | Max simultaneous bookings per location: Grooming Package | Encino 2, Los Angeles 2 | front desk-7.jpg, 13.pdf | seen in design |
| R-E11 | Max simultaneous bookings: Penthouses | 12 / 20 / 3 (third column unlabeled) | front desk-7.jpg, 13.pdf | seen in design |
| R-E12 | Max simultaneous bookings: Suites | 42 / 16 / 2 | front desk-7.jpg, 13.pdf | seen in design |
| R-E13 | Max simultaneous bookings: Day Care | 20 / 15 / 15 | front desk-7.jpg, 13.pdf | seen in design |
| R-E14 | Designer question: deduct hotel guests from day care capacity? | 'Question: Do we deduct hotel guests from day care capacity?' | front desk-7.jpg, 13.pdf | open question in design |
| R-E15 | Holidays are excluded from long-stay discounts and shift recurring grooms; a day can be marked holiday / boarding closed | legacy 'Day is Holiday', 'Boarding Closed'; 8.pdf | cloud1-*.png, 8.pdf | seen in design |

## F. Daycare

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-F01 | Full Day | $45, 'More than 6 hours' (settings) / '> 5 Hours' (mobile) | front desk-7.jpg, 13.pdf, DayCare-1.png | seen in design (threshold conflict 5 h vs 6 h) |
| R-F02 | Half Day | $35, 'Less than 6 hours' (settings) / '< 5 Hours' (mobile) | same | seen in design (conflict) |
| R-F03 | Hourly / Play Hour | $15 per 1 hour ('$15/Hr') | same | seen in design |
| R-F04 | Walk | $12 | front desk-7.jpg, 13.pdf | seen in design |
| R-F05 | Each additional pet gets $5 off (daycare items) | | front desk-7.jpg, 13.pdf | seen in design |
| R-F06 | Mobile computed price bug | 10:00 AM - 02:00 PM (4 h) shows '= $45 for Half Day' | DayCare-1.png | seen in design (error) |

## G. Grooming / Spa packages and add-ons

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-G01 | Packages | Gold Groom, Platinum Groom, Diamond Groom; priced by size S / M / L / XL / Giant | front desk-6.jpg, 12.pdf, Spa 12.7 2.png | seen in design |
| R-G02 | Gold Groom prices | S $50, M $65, L $80, XL $95, Giant $135 | front desk-6.jpg, 12.pdf, Spa 12.7 2.png, message-1.jpg ('$50-$135') | seen in design (consistent) |
| R-G03 | Gold Groom inclusions | 'Bath, Blow-Dry, Brush Teeth, Four Paw Massage and Scented Spray' | same | seen in design |
| R-G04 | Platinum Groom prices | Spa card: S $65, M $80, L $95, XL $115, Giant $150; settings tables repeat Gold prices | Spa 12.7 2.png vs front desk-6.jpg | seen in design (conflict; spa card likely right) |
| R-G05 | Platinum Groom inclusions | 'Gold Package + Nail Trim, Ear Cleanse and Gland Expression' | same | seen in design |
| R-G06 | Diamond Groom inclusions | 'Platinum Package + Shave or Clip'; prices unknown (cropped / copied) | front desk-6.jpg, Spa 12.7 2.png | seen in design (prices missing) |
| R-G07 | Diamond notes | '* Specialty Breed Cuts & Asian fusion, Please Call' | front desk-6.jpg, 12.pdf | seen in design |
| R-G08 | Sanitary Trim add-on | 'Trim under paws, private areas, between eyes $10-20' | front desk-6.jpg, 12.pdf, Spa 12.7 2.png | seen in design |
| R-G09 | Dematting surcharge | 'Additional charge for dematting depending on coat condition' | same | seen in design |
| R-G10 | Calendar time required per size (Gold) | S 60, M 60, L 60, XL 90, Giant 90 minutes; Platinum / Diamond cells contain $ values (data error) | front desk-6.jpg, 12.pdf | seen in design (partly placeholder) |
| R-G11 | Add-on prices | Furminator $25; Medicated Shampoo $20+; Flea Shampoo $20; Frontline Plus $30; Spa Facial $25; Nail Trim and File $16; Nail Polish $30+; Color/Highlights $15 (and $16); Express Anal Glands (External) $30; Express Anal Glands (Internal) $25 | front desk-6.jpg, 12.pdf | seen in design ('+' = starting at; Color/Highlights duplicated) |
| R-G12 | Some add-ons restricted to an employee type | Express Anal Glands (Internal): 'special employee' | front desk-6.jpg, 12.pdf | seen in design |
| R-G13 | Add-ons may add calendar time by size | 'S-M Added Time', 'L Added Time' (all 0 in sample) | front desk-6.jpg, 12.pdf | seen in design |
| R-G14 | Mobile package example prices | package $65.00 (Choose Package), Gold Groom $50, add-ons $100 / 'Furminator, Medicated Shampoo' $200 | Frame 1171276428/1171276429/1171276435.png | seen in design (placeholders) |
| R-G15 | Grooming totals in the mobile mock do not reconcile | Gold $50 + add-on $200; 'Grooming $500', 'Tax (2%) $64', 'Grand Total $565' | Frame 1171276435.png, Frame 1171276434.png | seen in design (error) |
| R-G16 | Multiple pets per grooming order; past orders can be re-created | 'Groom another pet', 'Re-Create Spa', 'Your Past Spa/Grooming' | Frame 1171276429/1171276434.png | seen in design |
| R-G17 | Default grooming booking length 1 hour; groomer assigned per appointment | 'Default Booking Hours 1:00'; 'Duration 1.0' | 8.pdf, Groom Booking .pdf | seen in design |
| R-G18 | Recurring grooming bookings: generated N months ahead, moved to next working day if on a holiday (legacy: every N weeks or Nth weekday of every N months) | | 8.pdf, image 169.png | seen in design (recurrence not in redesigned form) |
| R-G19 | Grooming service example on front desk | 'Brush Out' applies to 'All Pet', rate $145, duration 1, total $145; legacy 'Brush Out Medium $25.00' | Groom Booking .pdf | seen in design (placeholder) |
| R-G20 | Day-view appointment label format | 'Owner Last, PET; Breed; Package Size' (sizes Small Doodle, Shmedium/Shemudium, Med, Large) | Grooming.png | seen in design |
| R-G21 | Grooming capacity: 2 simultaneous bookings per location | | front desk-7.jpg | seen in design (see R-E10) |
| R-G22 | Spa is a package category of Grooming (one flow, one name) | | all grooming screens; D-004 / D-011 | decided (D-011 proposed) |

## H. Payments, fees and tax

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-H01 | Payment methods | Credit card (Mastercard shown) or 'Pay With Cash At Location' | Payment-1.png, Frame 1171276427.png, Frame 1171276435.png | seen in design |
| R-H02 | Payment paths on estimate | 'Pay Deposit' or 'Pay In Full' | Booking Detail.jpg | seen in design (deposit amount undefined) |
| R-H03 | Credit-card (non-cash) fee | '* There is a [3.8]% non cash fee if paying with credit card' (customer) vs 'Service Fee 3.89% - If Paying by credit card through app' (settings) | Booking Detail-3.jpg, front desk-7.jpg, 13.pdf | seen in design (3.8 vs 3.89) |
| R-H04 | Tax rate shown to customers | 'Tax (2%)' on hotel and grooming summaries | Booking Detail.jpg, Frame 1171276427/1171276430/1171276435.png | seen in design |
| R-H05 | Tax model in settings | Tax Number; prices Exclusive (default) or Inclusive of tax; one named tax with Service / Product / Boarding rates | 11.pdf | seen in design |
| R-H06 | Booking detail tax lines | Sales tax $04.60, Use tax $10.00, Local tax $03.45, Other taxes $02.30, Service tax or gross receipts tax $10.00; Total equals service price (taxes not added) | front desk-5.jpg | seen in design (UI-kit placeholder) |
| R-H07 | Legacy tax flag on a service | 'Vaccination Fee HST' | Board Booking.pdf (legacy) | seen in design (legacy) |
| R-H08 | Deposits tracked per booking; linked payments/deposits option; tip field option | 'Deposit (+)', 'Use Linked Payment/Deposits', 'Show Tip Field' | Board Booking.pdf, 9.pdf | seen in design |
| R-H09 | Invoice numbering continues from a configurable next number; invoicing can set booking status to Completed | 'Next Invoice/Payment Number', "Set Bookings Status To 'Completed'" | 9.pdf | seen in design |
| R-H10 | Printed invoice options | copies to print, show boarding charge rates, title 'Invoice', show tax number, footer 'Rock Out With Your Paws Out!' | 9.pdf | seen in design |
| R-H11 | Customers can have outstanding balances (startup list) | 'Show Customers With Outstanding Balances' | 6.pdf | seen in design |
| R-H12 | Payment processing options undefined | 'Option 1 / 2 / 3' placeholders | 9.pdf | seen in design (Stripe on kanban) |

## I. Booking statuses, day buckets and status changes

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-I01 | Booking status set (timeline) with colours | Future (green), Checked In (pink), Checked out and Complete (yellow), Canceled (red), No Show (dark red) | all reservation grooming-3.jpg, Section 4.png | seen in design |
| R-I02 | Table status chips | Future (green), Checking In (blue), Checked Out (amber), Completed (mint) | Frame 1171276264-10.png | seen in design (vocabulary differs from R-I01) |
| R-I03 | Booking detail statuses | Booking status 'Confirm' (green); Payment Status 'Pending' (orange) | front desk-5.jpg | seen in design |
| R-I04 | Customer-facing booking statuses | 'Pending Verification' (red), 'Upcoming' (green), 'Your Hotel Booking is confirmed' | Home Page-1.png, notification.png | seen in design |
| R-I05 | Reservations grouped by day into ARRIVING / DEPARTING / Checking out (table) or Arriving / Departing / Staying (legacy, dashboard tabs + Checked Out) | | Frame 1171276264.png, front desk-4.jpg, cloud1-*.png | seen in design (bucket names differ) |
| R-I06 | Changing a booking status requires a manager-issued PIN | 'PIN Verification' - 'You Will Get A PIN CODE From Manager To Change The Status' | all reservation grooming-2.pdf, front desk-3.jpg | seen in design (which transitions is open) |
| R-I07 | Booking context actions | Open, View/Edit, Set Status To, Create Invoice, Rebook, Delete (legacy adds Add Deposit, Status, Uncompleted Bookings) | all reservation grooming-3.jpg, cloud1-*.png | seen in design |
| R-I08 | Two entry points to create a booking | global 'New Booking' and page-level '+ Hotel Reservation' | front desk.jpg | seen in design |
| R-I09 | Status colour drives the timeline bar colour (assumed) | | all reservation grooming.jpg | seen in design (assumption) |
| R-I10 | Prompts for past uncompleted / uninvoiced bookings (settings) | 'Prompt About Past Uncompleted Bookings When Opeing', 'Prompt To Include Past Unvoiced Bookings When Invoicing' | 6.pdf | seen in design |
| R-I11 | Booking reminder flag (default checked in legacy) | 'Reminder' | Board/Groom Booking .pdf, image 165.png | seen in design |

## J. Front desk forms and data rules

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-J01 | Customer required fields | Town/City, State, Mobile, Email | Customer Details.pdf | seen in design |
| R-J02 | Notes and descriptions limited to 100 characters | '0/100' | Customer/Pet Details, Board/Groom Booking .pdf, 3.pdf, 15.pdf | seen in design |
| R-J03 | Id, Invoice Number and Balance are system-generated read-only | '0012' greyed | Board/Groom Booking .pdf, Pet Details .pdf, 15.pdf | seen in design |
| R-J04 | Lookup lists extendable inline | Breed, Color, Vet, Town/City, Reference, Attributes via '+' | Customer/Pet Details .pdf, legacy | seen in design |
| R-J05 | New customer can be created inline from a booking form | 'New Customer' button | Board/Groom Booking .pdf | seen in design |
| R-J06 | Notes can be printed on the invoice | 'Include Notes On Invoice' | Board/Groom Booking .pdf, legacy (checked) | seen in design |
| R-J07 | Customer defaults (legacy) | Status Active, Preferred Contact Method Phone, Customer Since = today, Send Reminders & Marketing Messages checked | image 115.png | seen in design (legacy) |
| R-J08 | Audit trail on bookings | 'Added 2/19/2025 3:11:53 PM by Doris, Last Edited 3/1/2025 by Doris' | image 165.png | seen in design (legacy; not in redesign) |
| R-J09 | Confirmation prompts configurable (edit, undo, switch to Find/New) | | 6.pdf | seen in design |
| R-J10 | Time format 12/24 h, calendar slot interval in minutes, restricted time range, default contact method and pet type | | 7.pdf | seen in design |
| R-J11 | Attachment dropzone copy on new records | 'Click to replace or drag and drop' (should be upload) | Customer/Pet Details .pdf | seen in design (copy error) |

## K. Locations, hours and company

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-K01 | Two locations | Encino, Los Angeles ('Log Angeles' typo) | 1.pdf, front desk-7.jpg | seen in design |
| R-K02 | Business hours (both locations) | Mon-Fri 7am-7pm, Sat-Sun 9am-5:30pm | 1.pdf, front desk-7.jpg, 13.pdf | seen in design |
| R-K03 | Company address | 17401 Ventura Blvd, Encino, CA, 91316 (used for both locations in sample) | 1.pdf | seen in design |
| R-K04 | Per-location working hours by weekday with open flag and time in/out | | 3.pdf | seen in design |
| R-K05 | Boarding enclosure naming configurable | 'Name Of Pet Enclosure (Singular / Plural)' = 'Hotel Room(s)' | 4.pdf, 1.pdf | seen in design |
| R-K06 | Brand setup | logo upload, font 'Inter', text colour, background colour | 1.pdf | seen in design |
| R-K07 | Room naming | '105 - Rock' (tables); 'PH(B) COUN', 'PH(T) Keit', 'Suite A7' (timeline / legacy) | Frame 1171276264-10.png, all reservation grooming.pdf, cloud1-*.png | seen in design (two schemes) |
| R-K08 | Legacy check-in count | 'Pets Checked In: 46' (2024-05-19) | cloud1-*.png | seen in design (scale indicator) |

## L. Employees, roles and permissions

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-L01 | Employee statuses | Active, Inactive, On Leave | employees.jpg | seen in design |
| R-L02 | Employees have a calendar colour, display name, per-day working hours (can match business hours), holiday hours, lunch break, service and retail commission rates | | 15.pdf | seen in design |
| R-L03 | Groomer columns can be reordered, recoloured (Green / Pink / Yellow / Red / Color Picker) and hidden | | Grooming.png | seen in design |
| R-L04 | Column tint shows groomer availability window | e.g. Jessica 09:00-04:00 PM, Rene 08:00-02:00 PM, Smile Specialists 08:00-12:00 PM | Grooming.png | seen in design |
| R-L05 | Permission set | Open Cash Drawer; Delete Customers; Use The Reporting Center And Generate Reports; Delete Bookings; Extract Data, Create Modulas, Export To PDF; Cancel Bookings; View Financial Reports; View Employee Reports; Customize Reports; Maintain Services; Maintain Customer Transactions; Maintain Products; Edit Customer Transactions; Delete Customer Transactons; Create Refunds | 10.pdf | seen in design |
| R-L06 | Some services restricted to an employee type | 'special employee' | front desk-6.jpg | seen in design (see R-G12) |
| R-L07 | Employees module has a Check List sub-page and Details tabs Job / Payroll / Performance / Documents / Account Settings (undesigned) | | employees-1.jpg, employees-2.jpg | seen in design |
| R-L08 | Phone country code default | +62 (template leftover; should be +1) | add employees.jpg | seen in design (error) |

## M. Account, settings, notifications, chat, reviews

| Id | Rule | Value / copy | Source | Status |
|---|---|---|---|---|
| R-M01 | Email and password are changed through separate flows; password field disabled and masked on Edit Profile | 'Change Email', 'Change Password' | image 175.png, Frame 1171276433.png | seen in design |
| R-M02 | Editing the account replaces the tab bar with Cancel / Confirm | | image 177.png | seen in design |
| R-M03 | Language is single-select with explicit Save | English, Deutsch, French, Dutch, Bulgarian | language.jpg | seen in design |
| R-M04 | Dark mode is a user toggle (default off) | | setting.jpg | seen in design (D-007) |
| R-M05 | Delete account available from settings (no confirmation drawn) | | setting.jpg, Frame 1171276432.png | seen in design |
| R-M06 | Profile hub menu | Edit Profile, My Pets, Add Pets, Address, Setting, Rate App, About App, Invite Friend, Help, Logout (Figma) vs Edit profile, My pets, Address, Delete account, Logout (build) | profile.jpg, Frame 1171276432.png | seen in design (two menus) |
| R-M07 | Notification types | pet added; payment done; vet appointment reminder ('tomorrow is your Pet appointment for vet'); hotel booking confirmed; new service added; order delivered / delivery date (UI-kit leftovers) | notification.png | seen in design |
| R-M08 | Relative timestamps for notifications and conversations | '25 Min Ago', '3 Hour Ago', 'Yesterday', '2 days ago' | notification.png, message-1.jpg | seen in design (grammar inconsistent) |
| R-M09 | One Front Desk chat thread per customer with 'Session Start' marker; staff can send images | | Message Support.png, notification-1.png | seen in design |
| R-M10 | Chat copy quoting prices | "yeah,it's $50-$135" (gold package), 'there is an offer for our app user' | message-1.jpg | seen in design (implies app-user offer) |
| R-M11 | Front desk chat offers voice and video call icons and attachments | | message-1.jpg | seen in design (scope open) |
| R-M12 | Reviews moderated: Approve (Publish) or Archive (Deleted); tags Excellent / Amazing / Normal / Not good; rating to one decimal | | reviews.jpg | seen in design |
| R-M13 | Email providers None / Gmail / Other (SMTP); SMS provider None / Petlinx; test-send actions | | 5.pdf | seen in design |
| R-M14 | Sign-up placeholder hints | 'e.g. Merry', 'e.g. Jonas', 'e.g. merry_456@gmail.com', 'e.g. #123@156' (password) | Frame 1171276421.png | seen in design (D-018 may redesign) |
| R-M15 | Password reset copy | 'Forget password' - 'To reset your new password please enter your email address' | Frame 1171276423.png | seen in design (copy to fix) |

## N. Copy bank (verbatim strings worth reusing or fixing)

- 'Please Choose Your Pet And Upload The Following Vaccine Information:' (Choose Vaccine.png)
- 'Hey! To Book An Appointment Please 1st Add A Pet' (Home Page-4.png)
- 'Hey! Go To Chat To Inquire About In Home Services' (Home Page-5.png)
- 'Reservations Will Be Pending Until Vaccine[s ...]' (Pet Edit 7.png, clipped)
- 'We Generally Do Grooms At The End Of Hotel Stays. If You'd Like An Extra Groom, Please Contact Us. If You'd Like More Than One Groom, Please Contact Us.' (Booking Detail.jpg)
- '*pay full upfront to get discount.' (Booking Detail.jpg)
- '* There is a [3.8]% non cash fee if paying with credit card' (Booking Detail-3.jpg)
- 'Petrock Penthouses Offer A TV, Premium Bed, Toys, Potty Pads, Room Service, Playtime, 2 Walks Per Day, Photos And Videos Every Night, A Bedtime Tuck In And Tummy Rub.' (Choose Your Room.png)
- 'You Will Get A PIN CODE From Manager To Change The Status' (PIN Verification)
- 'Rock Out With Your Paws Out!' (invoice footer, 9.pdf)
- 'Dogs over 30lbs can only fit in bottom 6 rooms' (front desk-7.jpg)
- 'New To Petrock?', 'Create your Account', 'Already have an account? Sign in' (auth)
- 'Daycare Service Coming Soon', 'In Home Service Coming Soon' (Day care*.png)
- Typos to fix: 'Reccomended', 'Addreess', 'Shepperd', 'Sprayed', 'Endosure', 'Departement', 'Date of Brith', 'Hotel Stuff', 'Tittles', 'Broad' (Board), 'Loss Angeles', 'United State', 'Log Angeles', 'Forget password', 'lettering me', 'Shemudium'/'Shmedium', 'Modulas', 'Transactons', 'Opeing', 'Unvoiced', '$105vv'.
