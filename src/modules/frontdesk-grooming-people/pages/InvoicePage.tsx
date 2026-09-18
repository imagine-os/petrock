import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Button } from '../../../components/atom/Button/Button';
import { Badge, toneFor } from '../../../components/atom/Badge/Badge';
import { Select } from '../../../components/atom/Select/Select';
import { Card } from '../../../components/molecule/Card/Card';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import { DeskInvoiceSheet, type DeskInvoiceLine } from '../../../components/organism/DeskInvoiceSheet/DeskInvoiceSheet';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useRow, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { quoteLinesOf, quoteNotesOf } from '../../../domain/booking';
import type { AppointmentRow, BookingRow, BookingPetRow, DaycareBookingRow, InvoiceRow, LocationRow, PaymentRow, RoomTypeRow, TaxRow } from '../../../data/schema/core';
import type { AppointmentExtrasRow } from '../../../data/schema/frontdesk-grooming-people';
import type { Quote } from '../../../pricing/engine';
import { usePayments } from '../../../payments';
import { useAppointments } from '../hooks';
import { createInvoiceFor, fmtDate, fmtDateTime, fmtMoney, fmtTime, fullName, quoteForAppointment, writeAudit, type CustomerFull } from '../lib';
import '../module.css';

/** F-59 Invoice view & print. :id is an invoice id or a booking / appointment / daycare id (preview). */
export function InvoicePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { locationId } = useLocation();
  const direct = useRow<InvoiceRow>('invoices', id);
  const { rows: bySource } = useTable<InvoiceRow>('invoices', { where: { source_id: id ?? '__none__' } });
  const invoice = direct ?? bySource[0] ?? null;
  const booking = useRow<BookingRow>('bookings', invoice?.source_type === 'booking' ? invoice.source_id : id);
  const daycareRow = useRow<DaycareBookingRow>('daycare_bookings', invoice?.source_type === 'daycare' ? invoice.source_id : id);
  const { views, packages, addons, fees, taxes, customerById, petById } = useAppointments();
  const apView = views.find((v) => v.ap.id === (invoice?.source_type === 'appointment' ? invoice.source_id : id));
  const { rows: payments } = useTable<PaymentRow>('payments', { where: { invoice_id: invoice?.id ?? '__none__' } });
  const { rows: bookingPets } = useTable<BookingPetRow>('booking_pets', { where: { booking_id: booking?.id ?? '__none__' } });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types');
  const { rows: locations } = useTable<LocationRow>('locations');
  const [method, setMethod] = useState<'card' | 'cash'>('card');
  const [busy, setBusy] = useState(false);
  const provider = usePayments();

  const source = useMemo(() => {
    if (apView) { const q = quoteForAppointment(apView.ap, packages, addons, fees, taxes, apView.extras); return { type: 'appointment' as const, id: apView.ap.id, code: apView.ap.code, customerId: apView.ap.customer_id, locationId: apView.ap.location_id ?? null, quote: q as Quote, deposit: apView.ap.payment_status === 'paid' ? q.total : 0, paid: apView.ap.payment_status === 'paid', note: apView.extras?.include_notes_on_invoice ? apView.ap.notes : null, meta: [{ label: 'Appointment', value: apView.ap.code }, { label: 'Pet', value: `${apView.pet?.name ?? '—'} (${apView.pet?.breed ?? 'Mixed'})` }, { label: 'When', value: fmtDateTime(apView.ap.starts_at) }, { label: 'Groomer', value: apView.groomer?.name ?? 'Unassigned' }] }; }
    if (booking) { const q: Quote = { lines: quoteLinesOf(booking.quote) as Quote['lines'], subtotal: booking.subtotal, discountTotal: booking.discount_total, feeTotal: booking.fee_total, taxTotal: booking.tax_total, total: booking.total, notes: quoteNotesOf(booking.quote) }; const petNames = bookingPets.map((bp) => petById.get(bp.pet_id)?.name ?? '?').join(', '); return { type: 'booking' as const, id: booking.id, code: booking.code, customerId: booking.customer_id, locationId: booking.location_id ?? null, quote: q, deposit: booking.deposit, paid: booking.payment_status === 'paid', note: (booking as BookingRow & { include_notes_on_invoice?: boolean }).include_notes_on_invoice ? booking.notes : null, meta: [{ label: 'Booking', value: booking.code }, { label: 'Pets', value: petNames || '—' }, { label: 'Check-in', value: fmtDateTime(booking.check_in) }, { label: 'Check-out', value: fmtDateTime(booking.check_out) }, { label: 'Room type', value: roomTypes.find((r) => r.id === booking.room_type_id)?.name ?? '—' }, { label: 'Nights', value: String(booking.nights) }] }; }
    if (daycareRow) { const q: Quote = { lines: [{ label: `Daycare ${daycareRow.item.replace('_', ' ')} × ${daycareRow.pet_ids.length}`, qty: daycareRow.pet_ids.length, unit: daycareRow.subtotal / Math.max(1, daycareRow.pet_ids.length), amount: daycareRow.subtotal, kind: 'service' }, ...(daycareRow.discount_total ? [{ label: 'Extra pet discount', qty: 1, unit: -daycareRow.discount_total, amount: -daycareRow.discount_total, kind: 'discount' as const }] : []), ...(daycareRow.tax_total ? [{ label: 'Tax', qty: 1, unit: daycareRow.tax_total, amount: daycareRow.tax_total, kind: 'tax' as const }] : [])], subtotal: daycareRow.subtotal, discountTotal: daycareRow.discount_total, feeTotal: 0, taxTotal: daycareRow.tax_total, total: daycareRow.total, notes: [] }; return { type: 'daycare' as const, id: daycareRow.id, code: daycareRow.code, customerId: daycareRow.customer_id, locationId: daycareRow.location_id ?? null, quote: q, deposit: daycareRow.payment_status === 'paid' ? daycareRow.total : 0, paid: daycareRow.payment_status === 'paid', note: null, meta: [{ label: 'Daycare', value: daycareRow.code }, { label: 'Date', value: fmtDate(daycareRow.date) }, { label: 'Times', value: `${daycareRow.check_in_time} – ${daycareRow.check_out_time}` }, { label: 'Pets', value: daycareRow.pet_ids.map((p) => petById.get(p)?.name ?? '?').join(', ') }] }; }
    return null;
  }, [apView, booking, daycareRow, packages, addons, fees, taxes, bookingPets, petById, roomTypes]);

  const customer = customerById.get(invoice?.customer_id ?? source?.customerId ?? '') as CustomerFull | undefined;
  const loc = locations.find((l) => l.id === (invoice?.location_id ?? source?.locationId ?? locationId));
  const tax = taxes.find((t: TaxRow) => t.active);
  if (!invoice && !source) return <div className="page"><PageHeader code="F-59" title="Invoice" backTo="/desk/grooming" /><EmptyState icon="book" title="Nothing to invoice" body="Open an appointment or booking and press Invoice." action={<Button onClick={() => nav(-1)}>Go back</Button>} /></div>;
  const lines: DeskInvoiceLine[] = invoice ? invoice.lines.map((l) => ({ ...l, kind: (l as DeskInvoiceLine).kind ?? (/tax/i.test(l.label) ? 'tax' : /fee/i.test(l.label) ? 'fee' : /discount|off/i.test(l.label) ? 'discount' : 'service') })) : source!.quote.lines;
  const totals = invoice ? { subtotal: invoice.subtotal, discountTotal: invoice.discount_total, feeTotal: invoice.fee_total, taxTotal: invoice.tax_total, total: invoice.total, deposit: invoice.deposit, balance: invoice.balance } : { subtotal: source!.quote.subtotal, discountTotal: source!.quote.discountTotal, feeTotal: source!.quote.feeTotal, taxTotal: source!.quote.taxTotal, total: source!.quote.total, deposit: source!.deposit, balance: Math.round((source!.quote.total - source!.deposit) * 100) / 100 };
  const status = invoice ? invoice.status : source!.paid ? 'paid' : 'draft';

  const create = async () => {
    if (!source) return; setBusy(true);
    try {
      const inv = await createInvoiceFor(data, { type: source.type, id: source.id, customerId: source.customerId, locationId: source.locationId ?? locationId, quote: source.quote, deposit: source.deposit, note: source.note });
      if (source.type === 'appointment' && apView?.extras) await data.update<AppointmentExtrasRow>('appointment_extras', apView.extras.id, { invoice_id: inv.id });
      await writeAudit(data, user, 'invoice.create', 'invoices', inv.id, { number: inv.number, source: source.code }, locationId);
      toast({ tone: 'success', title: `${inv.number} created` }); nav(`/desk/invoices/${inv.id}`, { replace: true });
    } catch (e) { toast({ tone: 'danger', title: 'Could not create the invoice', body: String(e) }); }
    setBusy(false);
  };
  const markPaid = async () => {
    if (!invoice) return; setBusy(true);
    try {
      const amount = invoice.balance;
      const result = await provider.createPaymentIntent({ amountCents: Math.round(amount * 100), currency: 'USD', customerId: invoice.customer_id, description: invoice.number, method: { type: method, brand: method === 'card' ? 'visa' : undefined, last4: method === 'card' ? '4242' : undefined }, metadata: { invoice_id: invoice.id } });
      await data.insert<PaymentRow>('payments', { location_id: invoice.location_id ?? locationId, invoice_id: invoice.id, customer_id: invoice.customer_id, amount, method, status: result.status === 'succeeded' ? 'paid' : 'failed', provider: provider.name, provider_ref: result.providerRef, card_brand: method === 'card' ? 'visa' : null, card_last4: method === 'card' ? '4242' : null, is_deposit: false, paid_at: new Date().toISOString(), refund_of: null, note: `Taken at the desk by ${user.name}` } as Partial<PaymentRow>);
      if (result.status !== 'succeeded') { toast({ tone: 'danger', title: 'Payment failed', body: result.error ?? '' }); setBusy(false); return; }
      await data.update<InvoiceRow>('invoices', invoice.id, { status: 'paid', deposit: invoice.total, balance: 0 });
      if (invoice.source_type === 'appointment') await data.update<AppointmentRow>('appointments', invoice.source_id, { payment_status: 'paid' });
      if (invoice.source_type === 'booking') await data.update<BookingRow>('bookings', invoice.source_id, { payment_status: 'paid', paid_in_full: true, deposit: invoice.total });
      if (invoice.source_type === 'daycare') await data.update<DaycareBookingRow>('daycare_bookings', invoice.source_id, { payment_status: 'paid' });
      await writeAudit(data, user, 'payment.take', 'payments', invoice.id, { amount, method }, locationId);
      toast({ tone: 'success', title: `${fmtMoney(amount)} received`, body: `${invoice.number} is paid` });
    } catch (e) { toast({ tone: 'danger', title: 'Payment error', body: String(e) }); }
    setBusy(false);
  };
  const backTo = source?.type === 'appointment' || invoice?.source_type === 'appointment' ? `/desk/grooming/${invoice?.source_id ?? source?.id}` : customer ? `/desk/customers/${customer.id}` : '/desk';
  return (
    <div className="page stack">
      <PageHeader code="F-59" title={invoice ? invoice.number : `Invoice preview · ${source!.code}`} backTo={backTo} eyebrow={<Badge size="sm" tone={toneFor(status)}>{status}</Badge>} subtitle={invoice ? `Issued ${fmtDate(invoice.issued_at)} · balance ${fmtMoney(invoice.balance)}` : 'Not issued yet: numbers come from Settings › Invoice when you create it (R-X67).'}
        actions={<div className="fgp-actions invpage-actions">
          {!invoice && can('invoices.write') && <Button icon="plus" onClick={create} loading={busy}>Create invoice</Button>}
          {invoice && invoice.status === 'issued' && invoice.balance > 0 && can('payments.write') && <><Select size="sm" aria-label="Payment method" value={method} onChange={(e) => setMethod(e.target.value as 'card' | 'cash')} options={[{ value: 'card', label: 'Card' }, { value: 'cash', label: 'Cash' }]} /><Button icon="dollar" onClick={markPaid} loading={busy}>Take {fmtMoney(invoice.balance)}</Button></>}
          <Button variant="secondary" icon="download" onClick={() => window.print()}>Print</Button>
        </div>} />
      <DeskInvoiceSheet number={invoice?.number ?? 'PREVIEW'} status={status} issuedAt={invoice?.issued_at ?? null} preview={!invoice}
        business={{ name: loc?.name ?? 'Petrock Hotel', address: loc?.address, phone: loc?.phone, taxNumber: (tax as TaxRow & { tax_number?: string | null } | undefined)?.tax_number ?? null }}
        customer={{ name: fullName(customer), email: customer?.email, mobile: customer?.mobile, address: customer ? [customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(', ') || null : null }}
        meta={source?.meta ?? [{ label: 'For', value: `${invoice!.source_type} ${invoice!.source_id}` }]} lines={lines} {...totals} note={invoice ? null : source?.note} footer={((invoice as (InvoiceRow & { footer?: string | null }) | null)?.footer) ?? 'Rock Out With Your Paws Out!'} />
      {invoice && (
        <Card header={<h3>Payments</h3>} padding="sm">
          <DataTable<PaymentRow> rows={payments} rowKey={(p) => p.id} dense stickyHeader={false} emptyText="No payments recorded on this invoice" columns={[
            { key: 'paid_at', label: 'When', render: (p) => (p.paid_at ? `${fmtDate(p.paid_at)} ${fmtTime(p.paid_at)}` : '—') }, { key: 'amount', label: 'Amount', align: 'right', render: (p) => fmtMoney(p.amount) }, { key: 'method', label: 'Method', render: (p) => `${p.method}${p.card_brand ? ` · ${p.card_brand} ····${p.card_last4}` : ''}` },
            { key: 'status', label: 'Status', render: (p) => <Badge size="sm" tone={toneFor(p.status)}>{p.status}</Badge> }, { key: 'provider', label: 'Provider', render: (p) => <span className="xs mono">{p.provider}{p.provider_ref ? ` ${p.provider_ref}` : ''}</span> }, { key: 'is_deposit', label: 'Deposit', render: (p) => (p.is_deposit ? 'yes' : '—') }]} />
        </Card>
      )}
    </div>
  );
}
