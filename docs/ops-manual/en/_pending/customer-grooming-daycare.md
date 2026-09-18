# What pet parents see: Grooming & Spa and Daycare in the app (draft chapter)

Audience: front desk, groomers, managers. Pages: C-50..C-56 (Grooming & Spa), C-60..C-65 (Daycare). Screenshots: `docs/screenshots/C-5x`, `docs/screenshots/C-6x`.

## Grooming & Spa orders from the app

1. The customer picks a pet and a package. Prices are the ones you maintain in Settings > Packages, for the pet's size tier (S/M/L/XL/Giant from weight). Diamond shows a "prices pending confirmation" note until the owner confirms them.
2. They switch on add-ons. "From" prices (Medicated Shampoo, Nail Polish, Sanitary Trim) are starting prices: confirm the final price at drop-off. Add-ons marked for a special employee (Express Anal Glands internal) tell the customer the desk will assign a qualified groomer.
3. They can add another pet to the same order: one arrival time, pets groomed side by side, one payment. On your day view this is still one appointment per pet with the same start time.
4. They choose a location, a day, optionally a groomer, and a start time. The app only offers times where your two grooming tables are free for the whole order and inside opening hours, so an app request should always fit; if it does not, check for a walk-in you have not entered yet.
5. They pay by card in the app (card fee added) or choose "Pay at location". Card-paid orders with verified vaccines arrive as **Upcoming (confirmed)**; pay-at-location orders arrive as **Requested** and need your confirmation; any pet with an unverified required vaccine makes the order **Pending verification** until you verify the proof in the vaccine queue.
6. Customers can cancel in the app only while the order is Requested or Pending verification. Once confirmed, the app tells them to message the front desk; you cancel through the status change (manager PIN) and refund card payments at the desk.
7. "Re-create" lets them repeat a past order with a new date and time; recurring grooms are not offered in the app yet.

## Daycare days from the app

1. The customer selects one or more pets, the location, the day and drop-off / pick-up times. The price updates as they change the times: Half Day under the threshold hours, Full Day at or above it (threshold in Settings > Daycare pricing), Play Hour at one hour or less, minus the extra-pet discount for additional pets.
2. If the day is long enough for a groom (shortest package for those pets plus a 60-minute handover), the app offers to add Grooming & Spa on the same day; the confirmation page links into the grooming flow. Shorter days explain why grooming cannot be added.
3. Each pet has a per-day questionnaire: vet-recommended flea medication (brand, last application) and medical alerts. Read it on the daycare day view before group play.
4. Payment and statuses work like grooming: card-paid + vaccines verified -> Upcoming; pay at location -> Requested; unverified vaccines -> Pending verification. Cancellation rules are the same.

## Where to look in the system

- Grooming orders: table `grooming_orders` (one per app order) and `appointments` (one per pet). Daycare: `daycare_bookings` and `daycare_booking_pets`.
- Invoices are created at checkout (`invoices`, `payments` for card). Pay-at-location bookings carry an open balance until you take payment.
- Customers receive an in-app notification when they book or cancel.
