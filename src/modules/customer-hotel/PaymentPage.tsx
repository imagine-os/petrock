import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useData, useTable } from '../../data/DataContext';
import type { AppointmentRow, BookingPetRow, BookingRow, InvoiceRow, LocationRow, NotificationRow, PaymentRow, SettingRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import type { BookingPetCareRow } from '../../data/schema/customer-hotel';
import { usePayments } from '../../payments';
import { useSession } from '../../auth/SessionProvider';
import { fmtMoney, round2, type QuoteLine } from '../../pricing/engine';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { RadioGroup } from '../../components/atom/Radio/Radio';
import { Card } from '../../components/molecule/Card/Card';
import { Icon } from '../../components/atom/Icon/Icon';
import { HotelEstimateCard } from '../../components/molecule/HotelEstimateCard/HotelEstimateCard';
import { EMPTY_CARD, HotelCardPaymentForm, cardLast4, detectBrand, validateCard, type CardFormValue } from '../../components/organism/HotelCardPaymentForm/HotelCardPaymentForm';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useT } from '../../i18n';
import { STEP_LABELS, STEP_PATHS, draftStage, useHotelDraft } from './draft';
import { combineDateTime, initialStatusFor, nextCode, useCustomerAccount } from './lib';
import { useEstimate } from './EstimatePage';
import './customer-hotel.css';

/** C-36 · Hotel: payment through the PaymentProvider, then the booking and its satellite rows are created. */
export function PaymentPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const payments = usePayments();
  const { toast } = useToast();
  const { user } = useSession();
  const { patch, reset } = useHotelDraft();
  const { customer } = useCustomerAccount();
  const est = useEstimate();
  const { rows: bookings } = useTable<BookingRow>('bookings');
  const { rows: invoices } = useTable<InvoiceRow>('invoices');
  const { rows: appointments } = useTable<AppointmentRow>('appointments');
  const { rows: records } = useTable<VaccineRecordRow>('vaccine_records');
  const { rows: vtypes } = useTable<VaccineTypeRow>('vaccine_types');
  const { rows: settings } = useTable<SettingRow>('settings', { where: { key: 'invoice' } });
  const { rows: locations } = useTable<LocationRow>('locations');
  const [card, setCard] = useState<CardFormValue>({ ...EMPTY_CARD, name: est.draft.customer ? `${est.draft.customer.first_name} ${est.draft.customer.last_name}` : '', zip: est.draft.customer?.zip ?? '' });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finished = useRef(false);
  if (draftStage(est.draft) < 6 && !finished.current) return <Navigate to={STEP_PATHS[draftStage(est.draft)]} replace />;
  const { draft, hotel, roomType, grooming, baseTotal, dueBase, charge, balance, paidInFull, pets } = est;
  const isCard = draft.payMethod === 'card';
  const errs = touched && isCard ? validateCard(card) : {};
  const invSettings = (settings[0]?.value as { next_number?: number; footer?: string } | undefined) ?? {};
  const location = locations.find((l) => l.id === draft.locationId);

  const submit = async () => {
    setTouched(true); setError(null);
    if (!customer || !hotel || !roomType) return;
    if (isCard && Object.keys(validateCard(card)).length) return;
    setBusy(true);
    try {
      let providerRef: string | null = null;
      if (isCard) {
        const res = await payments.createPaymentIntent({ amountCents: Math.round(charge.charged * 100), currency: 'USD', customerId: customer.id, description: `Petrock stay ${roomType.name} ${draft.checkIn} → ${draft.checkOut}`, method: { type: 'card', brand: detectBrand(card.number), last4: cardLast4(card) }, metadata: { plan: draft.payPlan } });
        if (res.status === 'failed') { setError(res.error ?? 'Payment failed'); toast({ tone: 'danger', title: 'Card declined', body: res.error }); setBusy(false); return; }
        providerRef = res.providerRef;
      }
      const now = new Date().toISOString();
      const checkIn = combineDateTime(draft.checkIn!, draft.checkInTime), checkOut = combineDateTime(draft.checkOut!, draft.checkOutTime);
      const status = initialStatusFor(draft.petIds, records, vtypes);
      const groomingLines: QuoteLine[] = grooming.flatMap((g) => g.quote.lines.map((l) => ({ ...l, label: `${g.pet.name} · ${l.label}` })));
      const feeLine: QuoteLine[] = charge.fee ? [{ label: `Card service fee (${charge.feePercent}%)`, qty: 1, unit: charge.fee, amount: charge.fee, kind: 'fee' }] : [];
      const lines = [...hotel.lines, ...groomingLines, ...feeLine];
      const total = round2(baseTotal + charge.fee);
      const paymentStatus = !isCard ? 'pending' : paidInFull ? 'paid' : 'authorized';
      const booking = await data.insert<BookingRow>('bookings', {
        location_id: draft.locationId!, code: nextCode(bookings, 'PR', 1001), customer_id: customer.id, room_type_id: roomType.id, room_id: null, check_in: checkIn, check_out: checkOut, nights: hotel.nights, status,
        share_room: draft.shareRoom, add_grooming: grooming.length > 0, handler_id: null, paid_in_full: paidInFull, payment_method: draft.payMethod, payment_status: paymentStatus,
        subtotal: round2(hotel.subtotal + grooming.reduce((s, g) => s + g.quote.subtotal, 0)), discount_total: hotel.discountTotal, fee_total: charge.fee, tax_total: round2(hotel.taxTotal + grooming.reduce((s, g) => s + g.quote.taxTotal, 0)), total, deposit: isCard ? charge.charged : 0,
        quote: { hotel: hotel.lines, grooming: groomingLines, fee: feeLine, plan: draft.payPlan, method: draft.payMethod } as unknown as undefined, notes: null, include_notes_on_invoice: false, source: 'app',
      } as Partial<BookingRow>);
      for (const p of pets) {
        const d = draft.petDetails[p.id];
        const bp = await data.insert<BookingPetRow>('booking_pets', { booking_id: booking.id, pet_id: p.id, room_id: null, takes_medication: !!d?.takesMedication, medication: d?.takesMedication ? d.medication || null : null, dosing: d?.takesMedication ? d.dosing : null, flea_medication: !!d?.fleaMedication, medical_alert: d?.medicalAlert || null } as Partial<BookingPetRow>);
        await data.insert<BookingPetCareRow>('booking_pet_care', { booking_id: booking.id, booking_pet_id: bp.id, pet_id: p.id, feeding_instructions: d?.feeding || null, meals_per_day: d?.mealsPerDay ?? null, own_food: !!d?.ownFood, belongings: d?.belongings || null, medication_count: d?.takesMedication ? Number(d.medicationCount) || 1 : null, dosing_frequency: d?.takesMedication ? d.dosing : null, flea_brand: d?.fleaMedication ? d.fleaBrand || null : null, flea_last_dose_on: d?.fleaMedication && d.fleaDate ? d.fleaDate : null, emergency_contact: draft.customer?.alt_phone || null, notes: d?.notes || null });
      }
      let apNo = 0;
      for (const g of grooming) {
        await data.insert<AppointmentRow>('appointments', { location_id: draft.locationId!, code: nextCode(appointments, 'GR', 501 + apNo++), customer_id: customer.id, pet_id: g.pet.id, package_id: g.pkg.id, addon_ids: g.addons.map((a) => a.id), groomer_id: null, starts_at: combineDateTime(draft.checkOut!, '09:00'), duration_min: g.quote.minutes ?? 60, status: 'requested', booking_id: booking.id, size: g.size, subtotal: g.quote.subtotal, tax_total: g.quote.taxTotal, total: g.quote.total, payment_status: paymentStatus, notes: 'Groom at the end of the hotel stay (booked in the app)' } as Partial<AppointmentRow>);
      }
      const invNo = Math.max(invSettings.next_number ?? 1001, invoices.reduce((m, r) => Math.max(m, Number(r.number.replace(/\D/g, '')) || 0), 0) + 1);
      const invoice = await data.insert<InvoiceRow>('invoices', { location_id: draft.locationId!, number: `INV-${invNo}`, customer_id: customer.id, source_type: 'booking', source_id: booking.id, lines, subtotal: booking.subtotal, discount_total: booking.discount_total, fee_total: charge.fee, tax_total: booking.tax_total, total, deposit: isCard ? charge.charged : 0, balance: isCard ? balance : total, status: isCard && paidInFull ? 'paid' : 'issued', issued_at: now, footer: invSettings.footer ?? null } as Partial<InvoiceRow>);
      if (isCard) await data.insert<PaymentRow>('payments', { location_id: draft.locationId!, invoice_id: invoice.id, customer_id: customer.id, amount: charge.charged, method: 'card', status: 'paid', provider: payments.name, provider_ref: providerRef, card_brand: detectBrand(card.number), card_last4: cardLast4(card), is_deposit: !paidInFull, paid_at: now, refund_of: null, note: null } as Partial<PaymentRow>);
      if (draft.customer) await data.update('customers', customer.id, { ...draft.customer, alt_phone: draft.customer.alt_phone || null, apt_suite: draft.customer.apt_suite || null });
      await data.insert<NotificationRow>('notifications', { user_id: user.id, kind: status === 'pending_vaccines' ? 'booking_pending_vaccines' : 'booking_requested', title: status === 'pending_vaccines' ? `Stay ${booking.code} is pending vaccine verification` : `Stay ${booking.code} requested`, body: `${pets.map((p) => p.name).join(', ')} · ${roomType.name} · ${location?.short_name ?? ''}`, link: `/app/bookings/${booking.id}`, read: false, sent_at: now });
      finished.current = true;
      toast({ tone: 'success', title: isCard ? `Paid ${fmtMoney(charge.charged)}` : 'Stay requested', body: booking.code });
      nav(`/app/hotel/done/${booking.id}`, { replace: true });
      setTimeout(reset, 0);
    } catch (e) {
      setError((e as Error).message); setBusy(false);
    }
  };

  return (
    <HotelBookingFrame title={t('customer-hotel.payment')} backTo={STEP_PATHS[5]} steps={STEP_LABELS} step={6} onStepClick={(i) => nav(STEP_PATHS[i])}
      footer={<Button size="lg" block loading={busy} onClick={submit} icon={isCard ? 'lock' : 'check'}>{isCard ? `Pay ${fmtMoney(charge.charged)}` : 'Confirm booking'}</Button>}
      footerNote={isCard ? `Charging ${fmtMoney(charge.charged)} now${balance ? ` · ${fmtMoney(balance)} at check-in` : ''}` : `Nothing charged now · ${fmtMoney(baseTotal)} at check-in`}>
      <HotelEstimateCard icon="dollar" title={paidInFull ? 'Pay in full' : `Deposit (${est.settings.deposit_percent}%)`} compact lines={[{ label: `${roomType?.name ?? 'Stay'}${grooming.length ? ' + grooming' : ''}`, qty: 1, unit: baseTotal, amount: baseTotal, kind: 'service' }]}
        extras={[{ label: 'Due now', value: fmtMoney(dueBase), strong: true }, ...(charge.fee ? [{ label: `Card service fee (${charge.feePercent}%)`, value: fmtMoney(charge.fee), tone: 'muted' as const }] : []), { label: isCard ? 'Charged now' : 'Charged now', value: fmtMoney(isCard ? charge.charged : 0), strong: true, tone: 'success' as const }, { label: 'Balance at check-in', value: fmtMoney(isCard ? balance : baseTotal), tone: 'muted' as const }]} />
      <RadioGroup cards name="method" label="Payment method" value={draft.payMethod} onChange={(v) => patch({ payMethod: v })} options={[{ value: 'card', label: <span className="row" style={{ gap: 8 }}><Icon name="card" size={16} /> Credit card</span>, description: charge.feePercent ? `${charge.feePercent}% non-cash fee applies` : undefined }, { value: 'cash', label: <span className="row" style={{ gap: 8 }}><Icon name="dollar" size={16} /> Pay with cash at location</span>, description: 'No fee; pay at the front desk on check-in' }]} />
      {isCard ? <Card><HotelCardPaymentForm value={card} onChange={setCard} errors={errs} disabled={busy} /></Card>
        : <Card tint><p className="small">Your stay is requested without a payment. The front desk confirms it and takes {paidInFull ? 'the full amount' : `the ${est.settings.deposit_percent}% deposit`} in cash when you arrive.</p></Card>}
      {error && <p className="tone-danger small" role="alert">{error}</p>}
      <p className="xs faint">By paying you agree to the Petrock boarding terms. Free cancellation up to {est.settings.free_cancellation_hours} h before check-in; stays stay pending until required vaccines are verified.</p>
    </HotelBookingFrame>
  );
}
