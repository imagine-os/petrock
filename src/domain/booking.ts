/**
 * The ONE booking lifecycle every surface uses (customer app, front desk, admin, timeline, board):
 * requested -> pending_vaccines -> confirmed -> checked_in -> checked_out (+ cancelled, no_show).
 * Customer-facing labels map onto it (R-I04: "Pending Verification" = pending_vaccines, "Upcoming" = confirmed).
 */
export const BOOKING_STATUSES = ['requested', 'pending_vaccines', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  requested: 'Requested', pending_vaccines: 'Pending vaccines', confirmed: 'Confirmed', checked_in: 'Checked in', checked_out: 'Checked out', cancelled: 'Cancelled', no_show: 'No show',
};
/** What the pet parent sees (R-I04). */
export const BOOKING_STATUS_CUSTOMER_LABEL: Record<BookingStatus, string> = {
  requested: 'Requested', pending_vaccines: 'Pending verification', confirmed: 'Upcoming', checked_in: 'Staying now', checked_out: 'Completed', cancelled: 'Cancelled', no_show: 'No show',
};

/** Allowed forward transitions. Anything else is rejected by the UI. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  requested: ['pending_vaccines', 'confirmed', 'cancelled'],
  pending_vaccines: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['checked_out'],
  checked_out: [],
  cancelled: ['requested'],
  no_show: ['requested'],
};

/** Transitions that need a manager PIN (R-I06). Check-in/out by the desk do not. */
export const PIN_GATED_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  confirmed: ['cancelled', 'no_show'],
  checked_in: [],
  checked_out: [],
  cancelled: ['requested'],
  no_show: ['requested'],
  pending_vaccines: ['confirmed'], // confirming without verified vaccines needs a manager
};

export const canTransition = (from: BookingStatus, to: BookingStatus) => BOOKING_TRANSITIONS[from].includes(to);
export const transitionNeedsPin = (from: BookingStatus, to: BookingStatus) => (PIN_GATED_TRANSITIONS[from] ?? []).includes(to);

/** Day bucket relative to a date (R-I05): arriving / departing / staying / checked out. */
export function dayBucket(b: { check_in: string; check_out: string; status: BookingStatus }, day: string): 'arriving' | 'departing' | 'staying' | 'checked_out' | 'other' {
  const ci = b.check_in.slice(0, 10), co = b.check_out.slice(0, 10);
  if (b.status === 'checked_out') return co === day ? 'checked_out' : 'other';
  if (ci === day) return 'arriving';
  if (co === day) return 'departing';
  if (ci < day && co > day) return 'staying';
  return 'other';
}

/** Pet size tiers used by grooming prices (R-G01). Weight bands are a working assumption (open question). */
export const PET_SIZES = ['S', 'M', 'L', 'XL', 'Giant'] as const;
export type PetSize = (typeof PET_SIZES)[number];
export function sizeFromWeightLbs(lbs: number): PetSize {
  if (lbs < 20) return 'S';
  if (lbs < 40) return 'M';
  if (lbs < 70) return 'L';
  if (lbs < 100) return 'XL';
  return 'Giant';
}

/** Minimal shape of a priced line; mirrors QuoteLine in src/pricing/engine.ts without importing it (domain stays dependency-free). */
export interface StoredQuoteLine { label: string; qty: number; unit: number; amount: number; kind: 'room' | 'discount' | 'fee' | 'tax' | 'service' | 'addon' }
/** bookings.quote may be a full Quote (desk / seed) or the app's { hotel, grooming, fee, plan, method } bundle (C-36). One reader for every surface (F-12, F-59, C-39). */
export function quoteLinesOf(quote: unknown): StoredQuoteLine[] {
  if (!quote || typeof quote !== 'object') return [];
  const q = quote as { lines?: unknown; hotel?: unknown; grooming?: unknown; fee?: unknown };
  const arr = (x: unknown): StoredQuoteLine[] => (Array.isArray(x) ? (x as StoredQuoteLine[]) : []);
  if (Array.isArray(q.lines)) return arr(q.lines);
  return [...arr(q.hotel), ...arr(q.grooming), ...arr(q.fee)];
}
/** Notes stored with a quote, if any. */
export function quoteNotesOf(quote: unknown): string[] {
  const n = (quote as { notes?: unknown } | null)?.notes;
  return Array.isArray(n) ? (n as string[]) : [];
}
