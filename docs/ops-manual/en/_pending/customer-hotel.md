# Hotel stays booked in the app (what the desk sees)

Chapter draft for the ops manual (module customer-hotel). Audience: front desk and managers.

## How a stay arrives from the app

1. The pet parent books in the Petrock app: pets and dates (C-30), room type (C-31: the app already blocks a Penthouse for dogs of 55 lb or more and checks capacity and bottom rooms), stay details per pet (C-32), optional Grooming & Spa at the end of the stay (C-33), their contact details (C-34), the estimate (C-35) and payment (C-36).
2. The booking appears in the reservations table with `source = app` and status **Requested**, or **Pending vaccines** when any pet has a required vaccine missing, expired or not yet verified. Confirm it once you have checked the vaccines and the room plan; the customer then sees **Upcoming**.
3. Payment: card payments are taken in the app (deposit 30 % or in full, card fee 3.89 % on the amount charged). "Cash at location" bookings arrive unpaid: collect at check-in. The invoice is issued by the app for card payments; cash bookings are invoiced at the desk.
4. Grooming added to a stay is a normal appointment linked to the booking (`booking_id`), scheduled 09:00 on the check-out day, status Requested. Assign a groomer and adjust the time in the grooming day view.

## Stay care notes

C-32 stores per pet: feeding instructions and meals per day, own food, medication (name, count, dosing), vet-recommended flea medication (brand, last dose), belongings, medical alert and free notes. Read them at check-in (booking detail → Pets) and print the run card as usual.

## Change and cancellation requests

- Customers can change a stay only while it is Requested, Pending vaccines or Confirmed. They file a **change request** (dates, add / remove a pet, add grooming, other) that notifies the desk of that location. Handle it from the booking: adjust the booking, then set the request to approved or declined with a short note (the customer sees the note).
- Cancellation: a stay that is not yet confirmed cancels immediately in the app (deposit to be refunded). A **confirmed** stay produces a cancellation request; approving it changes the status to Cancelled, which needs a manager PIN (R-I06). The free-cancellation window is 48 h before check-in (settings › hotel booking); outside it the deposit may be kept.

## Settings that drive the app flow

`Settings › hotel booking`: deposit percent, default check-in / check-out times, minimum nights, free-cancellation hours, maximum pets per room. Prices, discounts, card fee and tax come from the pricing setup; the app never has its own numbers.
