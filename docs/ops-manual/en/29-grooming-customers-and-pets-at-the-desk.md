---
title: Grooming & Spa, customers, pets and messages at the desk
code: M-29
roles: front desk, groomer, manager
part: III
version: 0.2.0
updated: 2026-09-18
summary: For: front desk, groomers, managers. Pages: F-30 Day view, F-31 Board, F-32 Agenda list, F-33 New groom booking, F-34 Appointment, F-50 Customers, F-51 Add customer, F-52 Customer, F-53 Pets, F-54 Add pet, F-55 Pet & vac
rules: 
---

# Grooming & Spa, customers, pets and messages at the desk

> NOTE: Folded from the module draft `frontdesk-grooming-people` at integration (2026-09-18).

For: front desk, groomers, managers. Pages: F-30 Day view, F-31 Board, F-32 Agenda list, F-33 New groom booking, F-34 Appointment, F-50 Customers, F-51 Add customer, F-52 Customer, F-53 Pets, F-54 Add pet, F-55 Pet & vaccines, F-56 Verification queue, F-57 Inbox, F-60 Notifications, F-59 Invoice.

## Your grooming day

1. Open **Grooming & Spa › Day view** (F-30). The columns are the groomers working at your location today; tinted cells are their hours, hatched columns are off. Use the date navigator to look ahead; **Today** brings you back.
2. Read a card as *Owner Last, PET; Breed; Package Size*. A **red cross** means a vaccine problem (open the pet before the dog arrives), a **coin** means payment is still pending, a **triangle** means the request is unconfirmed or carries a note.
3. To move an appointment, **drag the card** to another time or groomer. To add one, **click an empty slot** in the groomer's column: the form opens with the day, time and groomer filled in.
4. Right of each groomer name, the **…** menu lets you move the column left / right, change its colour or hide it. This is your own view; colleagues keep theirs. Hidden columns reappear from the chips under the grid.
5. Red hours mean more appointments overlap than the location's grooming capacity. You can still book, but tell the manager.

![Day view](../../../screenshots/F-30/1280.jpg)

## Working the board and the agenda

- **Board** (F-31) shows the same day by status. Drag a card to *Confirmed*, *In progress* or *Done* as the dog moves through. Moves with a **lock** (cancel, no show, re-open) ask for a manager PIN, which is recorded in Approvals.
- **Agenda list** (F-32) is the printable list: time, groomer, flags, package and add-ons with prices, payment, total for the day.

## Booking a groom (F-33)

1. Pick the customer (or **New customer**; you come back with them selected). Tap the pets to include; each gets its own appointment at the same time.
2. Choose a package. Prices show for each chosen pet's size (S / M / L / XL / Giant come from weight). Tick add-ons; the duration updates from the package and add-on minutes, and you can override it.
3. Check the invoice block. A **discount** needs a manager PIN when you save. Choose card or cash: card adds the service fee from settings.
4. **Submit**. If a pet's vaccines are not verified the appointment is saved as *Requested* and the customer is told; verify the vaccines (F-55 / F-56) and confirm it from the board or the detail page.

## Customers and pets

- **Customers** (F-50): search by name, phone or email. Red balance = money owed. Open a customer for pets, hotel stays, grooms, daycare days, invoices and the notes timeline (pin the note the next shift must read).
- **Add customer** (F-51): town / city, state, mobile and email are required. Lists with a **+** (city, reference, attributes, title) accept new values.
- **Pets** (F-53) shows every pet's vaccine standing. **Add pet** (F-54): owner, name, type and sex are required; weight sets the spa size. Enter vaccine dates and upload the certificate: with the paper in hand your entry counts as verified.
- **Deactivate** a customer or pet (manager PIN) instead of deleting; history stays.

## Verifying vaccines (F-55, F-56)

1. Open **Vaccines › Verification queue**. *To verify* lists proofs customers uploaded; *Blocking a booking* lists what stops a pending booking.
2. Open the certificate, compare the dates, press **Verify**. When the last required vaccine (Rabies, DHPP, Bordetella) is verified, the pet becomes **approved** and its bookings waiting on vaccines become **confirmed**; the customer is notified.
3. If the proof is wrong, press **Reject** and say why; the customer is asked to upload again.
4. Expired records are flagged in red everywhere (day view, agenda, lists) even if they were once verified.

## Messages and notifications

- **Inbox** (F-57): one thread per customer. Use *Mine* for threads assigned to you; assign a thread to a colleague from the dropdown; **Close** when done (it can be reopened). Replies notify the customer in the app.
- **Notifications** (F-60): the bell in the top bar. New app bookings, uploaded proofs, messages and approvals; open one to jump to the page.

## Invoices (F-59)

From an appointment or a customer's booking list, open **Invoice**. Until created it is a preview; **Create invoice** assigns the next number from settings. **Take payment** records the card or cash payment and marks the appointment or booking paid. **Print** hides the app around the sheet.

## In-person lesson

Walk through the screens above with a colleague on a demo account: open each page named in this chapter, perform one real action (create, change a status, verify, record) and show where the result appears for the customer or the next shift. Record the completion with the button in the chapter header.

## Online lesson

Read the chapter, then open the linked pages yourself (the code chips open the live page) and repeat the steps on the demo data. Check the rules listed in the header in Settings > Rules and tell your manager if a rule is not doing what the chapter says. Record the completion with the button in the chapter header.
