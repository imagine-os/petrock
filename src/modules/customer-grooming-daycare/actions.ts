/**
 * Writes for the module: create a Grooming & Spa order (grooming_orders + per-pet appointments + invoice + payment +
 * notification), create a daycare day (daycare_bookings + daycare_booking_pets + invoice + payment + notification),
 * cancel before confirmation (R-X14). Status follows the one lifecycle: paid + vaccines verified -> confirmed;
 * vaccines missing -> pending_vaccines (R-A05); pay at location -> requested.
 */
import type { DataProvider } from '../../data/provider';
import type { PaymentIntentResult, PaymentProvider } from '../../payments';
import type { AppointmentRow, DaycareBookingRow, InvoiceRow, NotificationRow, PaymentRow } from '../../data/schema/core';
import type { GroomingOrderRow, DaycareBookingPetRow } from '../../data/schema/customer-grooming-daycare';
import type { BookingStatus } from '../../domain/booking';
import type { Quote } from '../../pricing/engine';
import type { OrderQuote } from './pricing';
import type { CustomerPet } from './useCustomer';
import type { DaycareDraft, GroomingDraft } from './draft';
import type { MockCard } from '../../components/molecule/ServicePayMethod/ServicePayMethod';
import { cardBrand, cardLast4 } from '../../components/molecule/ServicePayMethod/ServicePayMethod';
import { atLocal, newCode } from './format';

export interface PayInput { method: 'card' | 'cash'; card: MockCard }
export type CreateResult = { ok: true; id: string; status: BookingStatus } | { ok: false; error: string };

export function statusFor(paid: boolean, vaccinesOk: boolean): BookingStatus { if (!vaccinesOk) return 'pending_vaccines'; return paid ? 'confirmed' : 'requested'; }

async function charge(payments: PaymentProvider, pay: PayInput, amount: number, customerId: string, description: string): Promise<PaymentIntentResult | null> {
  if (pay.method !== 'card') return null;
  return payments.createPaymentIntent({ amountCents: Math.round(amount * 100), currency: 'USD', customerId, description, method: { type: 'card', brand: cardBrand(pay.card), last4: cardLast4(pay.card) } });
}

async function writeInvoiceAndPayment(data: DataProvider, opts: { locationId: string; customerId: string; sourceType: 'appointment' | 'daycare'; sourceId: string; quote: Pick<Quote, 'lines' | 'subtotal' | 'discountTotal' | 'feeTotal' | 'taxTotal' | 'total'>; pay: PayInput; intent: PaymentIntentResult | null }) {
  const paid = opts.intent?.status === 'succeeded';
  const invoice = await data.insert<InvoiceRow & { location_id: string; footer: string | null }>('invoices', {
    location_id: opts.locationId, number: `INV-${Date.now().toString(36).toUpperCase()}`, customer_id: opts.customerId, source_type: opts.sourceType, source_id: opts.sourceId,
    lines: opts.quote.lines.map((l) => ({ label: l.label, qty: l.qty, unit: l.unit, amount: l.amount })), subtotal: opts.quote.subtotal, discount_total: opts.quote.discountTotal, fee_total: opts.quote.feeTotal, tax_total: opts.quote.taxTotal, total: opts.quote.total,
    deposit: 0, balance: paid ? 0 : opts.quote.total, status: paid ? 'paid' : 'issued', issued_at: new Date().toISOString(), footer: 'Rock Out With Your Paws Out!',
  });
  if (opts.intent) {
    await data.insert<PaymentRow & { location_id: string; refund_of: string | null; note: string | null }>('payments', {
      location_id: opts.locationId, invoice_id: invoice.id, customer_id: opts.customerId, amount: opts.quote.total, method: 'card', status: paid ? 'paid' : 'failed', provider: 'mock', provider_ref: opts.intent.providerRef,
      card_brand: cardBrand(opts.pay.card), card_last4: cardLast4(opts.pay.card), is_deposit: false, paid_at: paid ? new Date().toISOString() : null, refund_of: null, note: opts.intent.error ?? null,
    });
  }
  return invoice;
}

const notify = (data: DataProvider, userId: string, kind: string, title: string, body: string, link: string) =>
  data.insert<NotificationRow>('notifications', { user_id: userId, kind, title, body, link, read: false, sent_at: new Date().toISOString() });

export async function createGroomingOrder(data: DataProvider, payments: PaymentProvider, i: { draft: GroomingDraft; quote: OrderQuote; pets: CustomerPet[]; customerId: string; userId: string; pay: PayInput; locationName: string }): Promise<CreateResult> {
  const { draft, quote } = i;
  if (!draft.locationId || !draft.date || !draft.time || !quote.perPet.length) return { ok: false, error: 'The order is incomplete.' };
  const startsAt = atLocal(draft.date, draft.time);
  const intent = await charge(payments, i.pay, quote.total, i.customerId, `Grooming & Spa ${draft.date} ${draft.time}`);
  if (intent && intent.status !== 'succeeded') return { ok: false, error: intent.error ?? 'Payment failed' };
  const paid = intent?.status === 'succeeded';
  const vaccinesOk = quote.perPet.every((p) => p.pet?.vaccinesOk);
  const status = statusFor(paid, vaccinesOk);
  const apStatus = status === 'confirmed' ? 'confirmed' : 'requested'; // appointments enum has no pending_vaccines; the order carries it
  const appointmentIds: string[] = [];
  for (const p of quote.perPet) {
    const ap = await data.insert<AppointmentRow & { location_id: string; notes: string | null }>('appointments', {
      location_id: draft.locationId, code: newCode('GR'), customer_id: i.customerId, pet_id: p.item.petId, package_id: p.pkg?.id ?? null, addon_ids: p.addons.map((a) => a.id), groomer_id: draft.groomerId, starts_at: startsAt, duration_min: p.minutes,
      status: apStatus, booking_id: null, size: p.pet?.sizeTier ?? null, subtotal: p.quote.subtotal, tax_total: p.quote.taxTotal, total: p.quote.total, payment_status: paid ? 'paid' : 'pending', notes: draft.notes || null,
    });
    appointmentIds.push(ap.id);
  }
  const order = await data.insert<GroomingOrderRow>('grooming_orders', {
    location_id: draft.locationId, code: newCode('GS'), customer_id: i.customerId, appointment_ids: appointmentIds, pet_ids: quote.perPet.map((p) => p.item.petId), starts_at: startsAt, duration_min: quote.longestMinutes, groomer_id: draft.groomerId,
    status, payment_method: i.pay.method, payment_status: paid ? 'paid' : 'pending', subtotal: quote.subtotal, tax_total: quote.taxTotal, fee_total: quote.feeTotal, total: quote.total, invoice_id: null, notes: draft.notes || null, source: draft.source,
  });
  const invoice = await writeInvoiceAndPayment(data, { locationId: draft.locationId, customerId: i.customerId, sourceType: 'appointment', sourceId: order.id, quote: { lines: quote.lines, subtotal: quote.subtotal, discountTotal: 0, feeTotal: quote.feeTotal, taxTotal: quote.taxTotal, total: quote.total }, pay: i.pay, intent });
  await data.update<GroomingOrderRow>('grooming_orders', order.id, { invoice_id: invoice.id });
  const petNames = quote.perPet.map((p) => p.pet?.name ?? 'your pet').join(' & ');
  await notify(data, i.userId, 'grooming_booked', status === 'pending_vaccines' ? 'Grooming & Spa requested - vaccines pending' : 'Grooming & Spa booked', `${petNames} at ${i.locationName} on ${new Date(startsAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}.`, `/app/grooming/orders/${order.id}`);
  return { ok: true, id: order.id, status };
}

export async function cancelGroomingOrder(data: DataProvider, order: GroomingOrderRow, userId: string) {
  await data.update<GroomingOrderRow>('grooming_orders', order.id, { status: 'cancelled' });
  for (const id of order.appointment_ids) await data.update<AppointmentRow>('appointments', id, { status: 'cancelled' });
  await notify(data, userId, 'grooming_cancelled', 'Grooming & Spa cancelled', `Order ${order.code} was cancelled.`, `/app/grooming/orders/${order.id}`);
}

export async function createDaycareBooking(data: DataProvider, payments: PaymentProvider, i: { draft: DaycareDraft; quote: Quote & { item: 'full_day' | 'half_day' | 'hour' }; pets: CustomerPet[]; customerId: string; userId: string; pay: PayInput; locationName: string }): Promise<CreateResult> {
  const { draft, quote } = i;
  if (!draft.locationId || !draft.date || !draft.petIds.length) return { ok: false, error: 'The booking is incomplete.' };
  const intent = await charge(payments, i.pay, quote.total, i.customerId, `Daycare ${draft.date}`);
  if (intent && intent.status !== 'succeeded') return { ok: false, error: intent.error ?? 'Payment failed' };
  const paid = intent?.status === 'succeeded';
  const chosen = i.pets.filter((p) => draft.petIds.includes(p.id));
  const status = statusFor(paid, chosen.every((p) => p.vaccinesOk));
  const booking = await data.insert<DaycareBookingRow & { location_id: string; notes: string | null }>('daycare_bookings', {
    location_id: draft.locationId, code: newCode('DC'), customer_id: i.customerId, pet_ids: draft.petIds, date: draft.date, check_in_time: draft.checkIn, check_out_time: draft.checkOut, item: quote.item, status,
    subtotal: quote.subtotal, discount_total: quote.discountTotal, tax_total: quote.taxTotal, total: quote.total, payment_status: paid ? 'paid' : 'pending', notes: [draft.notes, draft.addGrooming ? 'Would like a groom during daycare' : ''].filter(Boolean).join(' · ') || null,
  });
  for (const petId of draft.petIds) {
    const d = draft.details[petId];
    await data.insert<DaycareBookingPetRow>('daycare_booking_pets', { daycare_booking_id: booking.id, pet_id: petId, flea_medication: !!d?.fleaMedication, flea_brand: d?.fleaMedication ? d.fleaBrand || null : null, flea_date: d?.fleaMedication ? d.fleaDate || null : null, medical_alert: d?.medicalAlert || null });
  }
  await writeInvoiceAndPayment(data, { locationId: draft.locationId, customerId: i.customerId, sourceType: 'daycare', sourceId: booking.id, quote, pay: i.pay, intent });
  await notify(data, i.userId, 'daycare_booked', status === 'pending_vaccines' ? 'Daycare requested - vaccines pending' : 'Daycare booked', `${chosen.map((p) => p.name).join(' & ')} at ${i.locationName} on ${new Date(draft.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${draft.checkIn}–${draft.checkOut}.`, `/app/daycare/bookings/${booking.id}`);
  return { ok: true, id: booking.id, status };
}

export async function cancelDaycareBooking(data: DataProvider, booking: DaycareBookingRow, userId: string) {
  await data.update<DaycareBookingRow>('daycare_bookings', booking.id, { status: 'cancelled' });
  await notify(data, userId, 'daycare_cancelled', 'Daycare cancelled', `Daycare ${booking.code} was cancelled.`, `/app/daycare/bookings/${booking.id}`);
}

export const CUSTOMER_CANCELLABLE: BookingStatus[] = ['requested', 'pending_vaccines'];
