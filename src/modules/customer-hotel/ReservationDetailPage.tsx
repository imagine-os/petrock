import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { AppointmentRow, BookingPetRow, BookingRow, InvoiceRow, LocationRow, PackageRow, PaymentRow, PetRow, RoomTypeRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import type { BookingChangeRequestRow, BookingPetCareRow } from '../../data/schema/customer-hotel';
import { BOOKING_STATUS_CUSTOMER_LABEL, type BookingStatus, quoteLinesOf } from '../../domain/booking';
import { fmtMoney, type QuoteLine } from '../../pricing/engine';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Badge, StatusBadge, toneFor } from '../../components/atom/Badge/Badge';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Icon } from '../../components/atom/Icon/Icon';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import { Modal } from '../../components/organism/Modal/Modal';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { StayDatesCard } from '../../components/molecule/StayDatesCard/StayDatesCard';
import { BookingStatusTimeline } from '../../components/molecule/BookingStatusTimeline/BookingStatusTimeline';
import { HotelEstimateCard } from '../../components/molecule/HotelEstimateCard/HotelEstimateCard';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useSession } from '../../auth/SessionProvider';
import { fmtDateTime, fmtTime, petVaccineState, useCustomerAccount, useHotelSettings } from './lib';
import './customer-hotel.css';

const CHANGEABLE: string[] = ['requested', 'pending_vaccines', 'confirmed'];
const KIND_LABEL: Record<string, string> = { modify_dates: 'Change dates', add_pet: 'Add a pet', remove_pet: 'Remove a pet', add_grooming: 'Add grooming', cancel: 'Cancellation', other: 'Other request' };

/** C-39 · Reservation detail: timeline, pets & care, grooming, payment, change requests, cancel. */
export function ReservationDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user } = useSession();
  const { customer } = useCustomerAccount();
  const settings = useHotelSettings();
  const booking = useRow<BookingRow>('bookings', id);
  const roomType = useRow<RoomTypeRow>('room_types', booking?.room_type_id);
  const location = useRow<LocationRow>('locations', booking?.location_id);
  const { rows: bps } = useTable<BookingPetRow>('booking_pets', { where: { booking_id: id ?? '__none__' } });
  const { rows: care } = useTable<BookingPetCareRow>('booking_pet_care', { where: { booking_id: id ?? '__none__' } });
  const { rows: pets } = useTable<PetRow>('pets');
  const { rows: records } = useTable<VaccineRecordRow>('vaccine_records');
  const { rows: vtypes } = useTable<VaccineTypeRow>('vaccine_types');
  const { rows: appointments } = useTable<AppointmentRow>('appointments', { where: { booking_id: id ?? '__none__' } });
  const { rows: packages } = useTable<PackageRow>('packages');
  const { rows: invoices } = useTable<InvoiceRow>('invoices', { where: { source_type: 'booking', source_id: id ?? '__none__' } });
  const { rows: payments } = useTable<PaymentRow>('payments');
  const { rows: requests } = useTable<BookingChangeRequestRow>('booking_change_requests', { where: { booking_id: id ?? '__none__' } });
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!booking) return <HotelBookingFrame title="Reservation" backTo="/app/bookings"><EmptyState title="Reservation not found" action={<Link to="/app/bookings"><Button variant="secondary">My reservations</Button></Link>} /></HotelBookingFrame>;
  if (customer && booking.customer_id !== customer.id) return <HotelBookingFrame title="Reservation" backTo="/app/bookings"><EmptyState icon="lock" title="Not your reservation" /></HotelBookingFrame>;

  const invoice = invoices[0] ?? null;
  const invPayments = invoice ? payments.filter((p) => p.invoice_id === invoice.id) : [];
  const paid = invoice ? invoice.deposit : booking.deposit;
  const balance = invoice ? invoice.balance : Math.max(0, booking.total - booking.deposit);
  const lines = (invoice?.lines as QuoteLine[] | undefined) ?? (quoteLinesOf(booking.quote) as QuoteLine[]);
  const status = booking.status as BookingStatus;
  const canChange = CHANGEABLE.includes(status);
  const directCancel = status === 'requested' || status === 'pending_vaccines';
  const openRequests = requests.filter((r) => r.status === 'open');
  const hoursToCheckIn = (new Date(booking.check_in).getTime() - Date.now()) / 36e5;
  const reachedAt: Partial<Record<BookingStatus, string>> = { requested: booking.created_at, ...(status === 'pending_vaccines' ? { pending_vaccines: booking.created_at } : {}), ...(['confirmed', 'checked_in', 'checked_out'].includes(status) ? { confirmed: booking.updated_at } : {}), ...(['checked_in', 'checked_out'].includes(status) ? { checked_in: booking.check_in } : {}), ...(status === 'checked_out' ? { checked_out: booking.check_out } : {}), ...(status === 'cancelled' || status === 'no_show' ? { [status]: booking.updated_at } : {}) };

  const cancel = async () => {
    setBusy(true);
    const now = new Date().toISOString();
    if (directCancel) {
      await data.update<BookingRow>('bookings', booking.id, { status: 'cancelled', payment_status: booking.payment_status === 'paid' || booking.payment_status === 'authorized' ? 'refunded' : booking.payment_status } as Partial<BookingRow>);
      for (const a of appointments) await data.update('appointments', a.id, { status: 'cancelled' });
      await data.insert<BookingChangeRequestRow>('booking_change_requests', { location_id: booking.location_id, booking_id: booking.id, customer_id: booking.customer_id, kind: 'cancel', requested_check_in: null, requested_check_out: null, pet_ids: null, message: 'Cancelled by the customer in the app', status: 'approved', handled_by: user.id, handled_at: now, staff_note: 'Self-service: stay was not yet confirmed' });
      toast({ tone: 'success', title: 'Stay cancelled', body: booking.deposit ? `Refund of ${fmtMoney(booking.deposit)} on its way` : undefined });
    } else {
      await data.insert<BookingChangeRequestRow>('booking_change_requests', { location_id: booking.location_id, booking_id: booking.id, customer_id: booking.customer_id, kind: 'cancel', requested_check_in: null, requested_check_out: null, pet_ids: null, message: hoursToCheckIn >= settings.free_cancellation_hours ? 'Within the free-cancellation window' : `Less than ${settings.free_cancellation_hours} h before check-in`, status: 'open', handled_by: null, handled_at: null, staff_note: null });
      toast({ tone: 'info', title: 'Cancellation requested', body: 'The front desk will confirm and handle any refund.' });
    }
    setBusy(false); setCancelOpen(false);
  };

  return (
    <HotelBookingFrame title={booking.code} subtitle={`${roomType?.name ?? 'Stay'} · ${location?.name ?? ''}`} backTo="/app/bookings" aside={<Link to={`/app/bookings/${booking.id}/invoice`}><IconButton icon="download" label="Invoice" variant="outline" /></Link>}
      footer={canChange ? <><Button variant="secondary" icon="edit" onClick={() => nav(`/app/bookings/${booking.id}/change`)}>Request a change</Button><Button variant="danger" icon="close" onClick={() => setCancelOpen(true)}>Cancel stay</Button></> : status === 'checked_out' || status === 'cancelled' || status === 'no_show' ? <Link to="/app/hotel" style={{ flex: 1 }}><Button block icon="refresh">Book again</Button></Link> : undefined}
      footerNote={canChange && openRequests.length ? `${openRequests.length} open request${openRequests.length === 1 ? '' : 's'} with the front desk` : undefined}>
      <div className="row-between wrap"><StatusBadge status={status} customer /><span className="xs muted">{BOOKING_STATUS_CUSTOMER_LABEL[status]} · booked {fmtDateTime(booking.created_at)}</span></div>
      <StayDatesCard readOnly value={{ checkIn: booking.check_in.slice(0, 10), checkInTime: fmtTime(booking.check_in) === '—' ? '10:00' : `${String(new Date(booking.check_in).getHours()).padStart(2, '0')}:${String(new Date(booking.check_in).getMinutes()).padStart(2, '0')}`, checkOut: booking.check_out.slice(0, 10), checkOutTime: `${String(new Date(booking.check_out).getHours()).padStart(2, '0')}:${String(new Date(booking.check_out).getMinutes()).padStart(2, '0')}` }} nights={booking.nights} />
      {location && <div className="ch-summary"><Icon name="location" size={14} /> {location.name} · {location.address}{location.phone ? ` · ${location.phone}` : ''}</div>}
      <Card><BookingStatusTimeline status={status} reachedAt={reachedAt} hint={status === 'pending_vaccines' ? 'Upload vaccine proofs so the desk can verify them' : status === 'requested' ? 'The front desk confirms shortly' : undefined} /></Card>
      <Section title="Pets on this stay" description={status === 'pending_vaccines' ? <span>Some vaccines need verification. <Link to="/app/pets">Upload proofs</Link></span> : undefined}>
        <div className="stack-sm">
          {bps.map((bp) => { const p = pets.find((x) => x.id === bp.pet_id); const c = care.find((x) => x.booking_pet_id === bp.id || x.pet_id === bp.pet_id); const vs = p ? petVaccineState(p.id, records, vtypes) : 'missing'; return (
            <Card key={bp.id} padding="sm">
              <div className="ch-pet-row"><Avatar name={p?.name ?? 'Pet'} kind="pet" size={36} /><div className="grow"><strong>{p?.name ?? 'Pet'}</strong><span className="xs muted">{p?.breed}{p?.weight_lbs ? ` · ${p.weight_lbs} lb` : ''}</span></div><Badge size="sm" tone={vs === 'ok' ? 'success' : vs === 'pending' ? 'warn' : 'danger'} dot>{vs === 'ok' ? 'Vaccines OK' : vs === 'pending' ? 'Vaccines pending' : vs === 'expired' ? 'Vaccine expired' : 'Vaccines missing'}</Badge></div>
              <dl className="ch-kv" style={{ marginTop: 6 }}>
                {c?.feeding_instructions && <><dt>Feeding</dt><dd>{c.feeding_instructions}{c.meals_per_day ? ` (${c.meals_per_day})` : ''}{c.own_food ? ' · own food' : ''}</dd></>}
                {bp.takes_medication && <><dt>Medication</dt><dd>{bp.medication ?? '—'}{(bp as unknown as { dosing?: string | null }).dosing ? ` · ${(bp as unknown as { dosing?: string | null }).dosing}` : ''}</dd></>}
                {(bp as unknown as { flea_medication?: boolean }).flea_medication && <><dt>Flea meds</dt><dd>{c?.flea_brand ?? 'Yes'}{c?.flea_last_dose_on ? ` · last ${c.flea_last_dose_on}` : ''}</dd></>}
                {c?.belongings && <><dt>Belongings</dt><dd>{c.belongings}</dd></>}
                {bp.medical_alert && <><dt>Medical alert</dt><dd className="tone-danger">{bp.medical_alert}</dd></>}
                {c?.notes && <><dt>Notes</dt><dd>{c.notes}</dd></>}
              </dl>
            </Card>); })}
        </div>
      </Section>
      {appointments.length > 0 && <Section title="Grooming & Spa during the stay"><div className="stack-sm">{appointments.map((a) => <Card key={a.id} padding="sm"><div className="ch-pet-row"><Icon name="scissors" size={18} /><div className="grow"><strong>{packages.find((p) => p.id === a.package_id)?.name ?? 'Groom'} · {pets.find((p) => p.id === a.pet_id)?.name}</strong><span className="xs muted">{fmtDateTime(a.starts_at)} · {a.duration_min} min · {a.code}</span></div><Badge size="sm" tone={toneFor(a.status)}>{a.status.replace('_', ' ')}</Badge><strong className="small">{fmtMoney(a.total)}</strong></div></Card>)}</div></Section>}
      <Section title="Payment" actions={<Link to={`/app/bookings/${booking.id}/invoice`} className="xs">Invoice</Link>}>
        <HotelEstimateCard compact icon="dollar" lines={lines} total={booking.total} extras={[{ label: booking.paid_in_full ? 'Paid in full' : 'Paid (deposit)', value: fmtMoney(paid), tone: 'success' }, { label: 'Balance due at check-in', value: fmtMoney(balance), strong: balance > 0, tone: balance > 0 ? undefined : 'muted' }, { label: 'Method', value: booking.payment_method === 'card' ? `Card${invPayments[0]?.card_last4 ? ` •••• ${invPayments[0].card_last4}` : ''}` : 'Cash at location', tone: 'muted' }]} />
      </Section>
      {requests.length > 0 && <Section title="Change requests"><Card padding="sm">{requests.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).map((r) => <div key={r.id} className="ch-req"><div className="row-between"><strong>{KIND_LABEL[r.kind] ?? r.kind}</strong><Badge size="sm" tone={r.status === 'open' ? 'info' : r.status === 'approved' ? 'success' : 'neutral'}>{r.status}</Badge></div>{r.requested_check_in && <span className="muted">New check-in {fmtDateTime(r.requested_check_in)}{r.requested_check_out ? ` → ${fmtDateTime(r.requested_check_out)}` : ''}</span>}{r.message && <span>{r.message}</span>}{r.staff_note && <span className="muted">Desk: {r.staff_note}</span>}<span className="faint">{fmtDateTime(r.created_at)}</span></div>)}</Card></Section>}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title={directCancel ? 'Cancel this stay?' : 'Request cancellation'} size="sm"
        footer={<><Button variant="secondary" onClick={() => setCancelOpen(false)}>Keep it</Button><Button variant="danger" loading={busy} onClick={cancel}>{directCancel ? 'Cancel stay' : 'Send request'}</Button></>}>
        <div className="stack-sm small">
          {directCancel ? <p>Your stay is not confirmed yet, so it cancels right away.{booking.deposit ? ` The ${fmtMoney(booking.deposit)} you paid is refunded to your card.` : ''}</p> : <p>This stay is confirmed, so the front desk needs to approve the cancellation (a manager signs off).</p>}
          <p className="muted">{hoursToCheckIn >= settings.free_cancellation_hours ? `You are inside the free-cancellation window (${settings.free_cancellation_hours} h before check-in).` : `Less than ${settings.free_cancellation_hours} h before check-in: the deposit may be kept.`}</p>
        </div>
      </Modal>
    </HotelBookingFrame>
  );
}
