---
title: Hotel reservations at the desk
code: M-28
roles: front desk, manager
part: II
version: 0.2.0
updated: 2026-09-18
summary: For front desk and managers. Screens: F-01 Today, F-10 Reservations table, F-11 New booking, F-12 Booking detail, F-13 Room timeline, F-14 Grooming & Spa board, F-15 Availability. Screenshots in docs/screenshots/F-/.
rules: 
---

# Hotel reservations at the desk

> NOTE: Folded from the module draft `frontdesk-reservations` at integration (2026-09-18).

_For front desk and managers. Screens: F-01 Today, F-10 Reservations table, F-11 New booking, F-12 Booking detail, F-13 Room timeline, F-14 Grooming & Spa board, F-15 Availability. Screenshots in `docs/screenshots/F-*/`._

## 1. Start of shift - Today (F-01)

1. Open **Today** from the side menu. The top bar shows your location; front desk users are pinned to it.
2. Read the tiles: **Arriving**, **Departing**, **In house**, **Daycare**, rooms free tonight per type, **Pending vaccines**, **Balance due**, **Grooming & Spa**.
3. Work the **Needs attention** list first: dogs arriving with vaccine issues, arrivals without a room, departures with a balance due. Each card opens the booking.
4. Use the tabs (All / Arriving / Departing / Staying / Daycare / Checked out) and the search to find a reservation. The arrows and calendar move to another day.

## 2. Check a dog in

1. On Today (or the booking detail) press **Check in** on the arriving stay.
2. If no room is assigned yet, the room picker opens: free rooms are green, busy rooms show the booking that holds them, rooms the dog does not fit are greyed out (dogs over 30 lb only fit the bottom penthouse rooms). Pick a room and press **Assign & check in**.
3. The status turns **Checked in** (pink) and the change is logged in the booking's Activity.

## 3. Check a dog out

1. Press **Check out** on the departing stay. If a balance is due, record the payment first (booking detail > Charges > **Record payment**).
2. The status turns **Checked out** (yellow) and the room becomes free for tonight.

## 4. Cancel, no-show, reopen - manager PIN

Cancelling or marking a confirmed stay as no-show, reopening a cancelled stay, confirming a stay whose vaccines are not verified, deleting a booking and refunding a deposit all need a **manager PIN**. Choose the action (a lock icon marks it); the PIN modal opens; a manager types their PIN; the approval is recorded and the action runs.

## 5. Take a new booking (F-11)

1. **New booking** (top right on any reservations page) or **Availability** first to check rooms and quote the price.
2. Enter **Date in / Time in / Date out / Time out**. Nights are computed.
3. Find the **customer** (name, email or phone) or press **New customer** (needs name, email, mobile, city, state). Tick the **pets**. Each pet shows its vaccine state; a stay with unverified vaccines is created as **Pending vaccines** until the proofs are verified.
4. Pick the **room type** (the rate) and, if you want, the **room** now. Warnings appear for weight rules.
5. Add **Additional services** (Veterinary travel, Vaccination fee...) with how often they occur and morning / afternoon / evening.
6. Set **Payment**: card or cash, paid in full (unlocks long-stay discounts), deposit.
7. Add **notes** (100 characters, optionally printed on the invoice) and press **Create booking**. The quote on the right updates live; every price comes from the pricing settings.

## 6. The reservations table (F-10)

The full table for a day: ID, Status, Customer, Hotel room, Date in, Time in, Date out, Time out, Nbr days, Pet(s), Breed, Pet count, Mobile, Home, Total charge, Deposits, Balance, Booking notes. Groups: Arriving, Departing, Staying, Daycare, Checked out. Use **All upcoming** to see everything from the selected day on. Switch to **Timeline** or **Board** with the buttons in the header.

## 7. The room timeline (F-13)

Rooms are rows, days are columns, each stay is a bar in its status colour. **Drag** a bar to another room or start day to move the stay (the app refuses wrong room types, rooms that do not fit the dog and rooms already taken). **Click** a bar for the summary and the actions; click an empty cell to book that room for that day. The **Unassigned** row shows stays that still need a room.

## 8. The Grooming & Spa board (F-14)

Cards are the day's appointments by status. Drag a card from **Confirmed** to **In progress** when the groom starts and to **Done** when it ends. Dropping on **Cancelled / no show** asks for a manager PIN. Click a card for the details.

## 9. Availability (F-15)

Enter the dates, the number of dogs and the heaviest weight (or pick the customer's pets). Each room type shows how many rooms are free for every night, the fit rules and the price; **Book this** opens the booking form prefilled. The table below shows the next 14 days.

## In-person lesson

Walk through the screens above with a colleague on a demo account: open each page named in this chapter, perform one real action (create, change a status, verify, record) and show where the result appears for the customer or the next shift. Record the completion with the button in the chapter header.

## Online lesson

Read the chapter, then open the linked pages yourself (the code chips open the live page) and repeat the steps on the demo data. Check the rules listed in the header in Settings > Rules and tell your manager if a rule is not doing what the chapter says. Record the completion with the button in the chapter header.
