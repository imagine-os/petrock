import { Link, useParams } from 'react-router-dom';
import { useRow, useTable } from '../../data/DataContext';
import type { BookingPetRow, BookingRow, CustomerRow, InvoiceRow, LocationRow, PaymentRow, PetRow, RoomTypeRow, SettingRow, TaxRow } from '../../data/schema/core';
import type { QuoteLine } from '../../pricing/engine';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { HotelInvoiceView } from '../../components/organism/HotelInvoiceView/HotelInvoiceView';
import './customer-hotel.css';

/** C-40 · Reservation invoice (printable). Falls back to the booking quote when no invoice row exists yet. */
export function InvoicePage() {
  const { id } = useParams();
  const booking = useRow<BookingRow>('bookings', id);
  const customer = useRow<CustomerRow>('customers', booking?.customer_id);
  const roomType = useRow<RoomTypeRow>('room_types', booking?.room_type_id);
  const location = useRow<LocationRow>('locations', booking?.location_id);
  const { rows: invoices } = useTable<InvoiceRow>('invoices', { where: { source_type: 'booking', source_id: id ?? '__none__' } });
  const { rows: payments } = useTable<PaymentRow>('payments');
  const { rows: bps } = useTable<BookingPetRow>('booking_pets', { where: { booking_id: id ?? '__none__' } });
  const { rows: pets } = useTable<PetRow>('pets');
  const { rows: taxes } = useTable<TaxRow>('taxes');
  const { rows: settings } = useTable<SettingRow>('settings', { where: { key: 'invoice' } });
  if (!booking) return <HotelBookingFrame title="Invoice" backTo="/app/bookings"><EmptyState title="Reservation not found" action={<Link to="/app/bookings"><Button variant="secondary">My reservations</Button></Link>} /></HotelBookingFrame>;
  const inv = invoices[0] ?? null;
  const q = (booking as unknown as { quote?: { hotel?: QuoteLine[]; grooming?: QuoteLine[]; fee?: QuoteLine[]; lines?: QuoteLine[] } }).quote;
  const lines: QuoteLine[] = (inv?.lines as QuoteLine[] | undefined) ?? [...(q?.hotel ?? q?.lines ?? []), ...(q?.grooming ?? []), ...(q?.fee ?? [])];
  const invSet = (settings[0]?.value as { footer?: string; show_tax_number?: boolean } | undefined) ?? {};
  const cust = customer as (CustomerRow & { address?: string | null; apt_suite?: string | null; zip?: string | null }) | null;
  return (
    <HotelBookingFrame title={inv ? inv.number : 'Invoice (draft)'} subtitle={booking.code} backTo={`/app/bookings/${booking.id}`} aside={<IconButton icon="download" label="Print or save as PDF" variant="outline" onClick={() => window.print()} />}>
      {!inv && <p className="xs muted">No invoice has been issued yet (cash bookings are invoiced at the desk). This is the estimate from your booking.</p>}
      <HotelInvoiceView number={inv?.number ?? `${booking.code} (estimate)`} status={inv?.status ?? 'draft'} issuedAt={inv?.issued_at ?? booking.created_at}
        business={{ name: location?.name ?? 'Petrock Hotel', address: location?.address, phone: location?.phone, taxNumber: invSet.show_tax_number === false ? null : ((taxes.find((t) => t.active) as (TaxRow & { tax_number?: string | null }) | undefined)?.tax_number ?? null) }}
        customer={{ name: cust ? `${cust.first_name} ${cust.last_name}` : 'Customer', email: cust?.email, phone: cust?.mobile, address: cust ? [cust.address, cust.apt_suite, [cust.city, cust.state, cust.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ') : null }}
        reference={{ code: booking.code, title: roomType?.name ?? 'Stay', pets: bps.map((bp) => pets.find((p) => p.id === bp.pet_id)?.name ?? 'Pet'), checkIn: booking.check_in, checkOut: booking.check_out, nights: booking.nights }}
        lines={lines} subtotal={inv?.subtotal ?? booking.subtotal} discountTotal={inv?.discount_total ?? booking.discount_total} taxTotal={inv?.tax_total ?? booking.tax_total} feeTotal={inv?.fee_total ?? booking.fee_total} total={inv?.total ?? booking.total} deposit={inv?.deposit ?? booking.deposit} balance={inv?.balance ?? Math.max(0, booking.total - booking.deposit)}
        payments={inv ? payments.filter((p) => p.invoice_id === inv.id).map((p) => ({ date: p.paid_at, method: p.method, amount: p.amount, status: p.status, last4: p.card_last4, brand: p.card_brand, isDeposit: p.is_deposit })) : []}
        footer={(inv?.footer as string | null | undefined) ?? invSet.footer ?? null} />
    </HotelBookingFrame>
  );
}
