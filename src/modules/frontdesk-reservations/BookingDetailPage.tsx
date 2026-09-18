import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocation } from '../../tenant/LocationProvider';
import { useSession } from '../../auth/SessionProvider';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { ApprovalRow, BookingPetRow, BookingRow, CustomerRow, EmployeeRow, InvoiceRow, PaymentRow, PetRow, RoomRow, RoomTypeRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import type { BookingEventRow, BookingServiceRow } from '../../data/schema/frontdesk-reservations';
import { usePayments } from '../../payments';
import { fmtMoney, type Quote } from '../../pricing/engine';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Badge, StatusBadge, toneFor } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Modal } from '../../components/organism/Modal/Modal';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { BookingInfoGrid } from '../../components/molecule/BookingInfoGrid/BookingInfoGrid';
import { PetVaccineStatus } from '../../components/molecule/PetVaccineStatus/PetVaccineStatus';
import { BookingChargeSummary } from '../../components/molecule/BookingChargeSummary/BookingChargeSummary';
import { BookingStatusMenu } from '../../components/molecule/BookingStatusMenu/BookingStatusMenu';
import { useToast } from '../../components/molecule/Toast/Toast';
import { BOOKING_STATUS_LABEL, type BookingStatus } from '../../domain/booking';
import { petVaccineSummary } from './lib/vaccines';
import { fmtDate, fmtDateTime, fmtTime } from './lib/dates';
import { useBookingActions } from './lib/useBookingActions';
import { RoomPickModal } from './lib/RoomPickModal';
import './frontdesk-reservations.css';

/** F-12 - one stay, everything the desk needs, with the PIN-gated actions and the activity trail. */
export function BookingDetailPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const data = useData();
  const payments = usePayments();
  const { toast } = useToast();
  const { can, user } = useSession();
  const { scope, locationId } = useLocation();
  const actions = useBookingActions();
  const booking = useRow<BookingRow>('bookings', id ?? null);
  const { rows: bookingPets } = useTable<BookingPetRow>('booking_pets', { where: { booking_id: id ?? '__none__' } });
  const { rows: services } = useTable<BookingServiceRow>('booking_services', { where: { booking_id: id ?? '__none__' } });
  const { rows: events } = useTable<BookingEventRow>('booking_events', { where: { booking_id: id ?? '__none__' }, orderBy: { column: 'at', dir: 'desc' } });
  const { rows: approvals } = useTable<ApprovalRow>('approvals', { where: { subject_id: id ?? '__none__' } });
  const { rows: invoices } = useTable<InvoiceRow>('invoices', { where: { source_id: id ?? '__none__' } });
  const { rows: allPayments } = useTable<PaymentRow>('payments', { where: { customer_id: booking?.customer_id ?? '__none__' } });
  const customer = useRow<CustomerRow>('customers', booking?.customer_id);
  const { rows: pets } = useTable<PetRow>('pets', { where: { customer_id: booking?.customer_id ?? '__none__' } });
  const { rows: rooms } = useTable<RoomRow>('rooms', { where: scope });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types');
  const { rows: employees } = useTable<EmployeeRow>('employees');
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: scope });
  const { rows: records } = useTable<VaccineRecordRow>('vaccine_records');
  const { rows: vtypes } = useTable<VaccineTypeRow>('vaccine_types');
  const [roomOpen, setRoomOpen] = useState<'assign' | 'checkin' | null>(null);
  const [pay, setPay] = useState<{ amount: string; method: 'card' | 'cash' } | null>(null);
  const [notes, setNotes] = useState<string | null>(null);

  const stayPets = bookingPets.map((bp) => ({ bp, pet: pets.find((p) => p.id === bp.pet_id) })).filter((x) => x.pet) as { bp: BookingPetRow; pet: PetRow }[];
  const vacc = useMemo(() => Object.fromEntries(stayPets.map(({ pet }) => [pet.id, petVaccineSummary(pet.id, records, vtypes)])), [stayPets, records, vtypes]);
  const heaviest = Math.max(0, ...stayPets.map((x) => x.pet.weight_lbs ?? 0));
  const room = rooms.find((r) => r.id === booking?.room_id);
  const roomType = roomTypes.find((r) => r.id === booking?.room_type_id);
  const handler = employees.find((e) => e.id === (booking as unknown as { handler_id?: string | null })?.handler_id);
  const quote = (booking?.quote ?? null) as Quote | null;
  const invoiceIds = new Set(invoices.map((i) => i.id));
  const bookingPayments = allPayments.filter((p) => (p.invoice_id && invoiceIds.has(p.invoice_id)) || (p as unknown as { booking_id?: string }).booking_id === id).sort((a, b) => (b.paid_at ?? '').localeCompare(a.paid_at ?? ''));
  const balance = booking ? Math.round((booking.total - booking.deposit) * 100) / 100 : 0;

  if (!booking) return <div className="fdr-page"><PageHeader title="Booking not found" backTo="/desk/reservations" code="F-12" /><Card className="fdr-empty-card"><EmptyState icon="search" title="No booking with this id at this location" body="It may belong to the other location or have been deleted." action={<Button onClick={() => nav('/desk/reservations')}>Back to reservations</Button>} /></Card></div>;

  const onStatus = (to: BookingStatus) => { if (to === 'checked_in' && !booking.room_id) { setRoomOpen('checkin'); return; } actions.changeStatus(booking, to); };
  const remove = () => actions.withApproval({ action: 'record.delete', title: `Delete ${booking.code}`, description: 'Deleting a booking removes its pets and services. Needs a manager PIN (R-P01).', subjectTable: 'bookings', subjectId: booking.id }, async () => {
    for (const bp of bookingPets) await data.remove('booking_pets', bp.id);
    for (const s of services) await data.remove('booking_services', s.id);
    await data.remove('bookings', booking.id);
    await data.insert('audit_log', { location_id: locationId, user_id: user.id, user_name: user.name, action: 'booking.delete', table_name: 'bookings', row_id: booking.id, diff: { code: booking.code } });
    toast({ tone: 'warn', title: `${booking.code} deleted` }); nav('/desk/reservations');
  });
  const saveNotes = async () => { await data.update<BookingRow>('bookings', booking.id, { notes: notes || null }); await actions.logEvent(booking, 'note', notes ? `Notes updated: “${notes.slice(0, 60)}${notes.length > 60 ? '…' : ''}”` : 'Notes cleared'); setNotes(null); toast('Notes saved'); };
  const recordPayment = async () => {
    if (!pay) return;
    const amount = Math.round((Number(pay.amount) || 0) * 100) / 100;
    if (amount <= 0) { toast({ tone: 'danger', title: 'Enter an amount' }); return; }
    const res = await payments.createPaymentIntent({ amountCents: Math.round(amount * 100), currency: 'USD', customerId: booking.customer_id, description: `${booking.code} at the desk`, method: { type: pay.method, brand: pay.method === 'card' ? 'visa' : undefined, last4: pay.method === 'card' ? '4242' : undefined }, metadata: { booking_id: booking.id } });
    if (res.status === 'failed') { toast({ tone: 'danger', title: 'Payment failed', body: res.error }); return; }
    const inv = invoices[0];
    await data.insert<PaymentRow>('payments', { location_id: booking.location_id ?? locationId, invoice_id: inv?.id ?? null, customer_id: booking.customer_id, amount, method: pay.method, status: 'paid', provider: payments.name, provider_ref: res.providerRef, card_brand: pay.method === 'card' ? 'visa' : null, card_last4: pay.method === 'card' ? '4242' : null, is_deposit: amount < balance, paid_at: new Date().toISOString(), refund_of: null, note: null, booking_id: booking.id } as unknown as Partial<PaymentRow>);
    const deposit = Math.round((booking.deposit + amount) * 100) / 100;
    await data.update<BookingRow>('bookings', booking.id, { deposit, payment_status: deposit >= booking.total ? 'paid' : 'authorized', paid_in_full: deposit >= booking.total ? booking.paid_in_full : booking.paid_in_full });
    if (inv) await data.update<InvoiceRow>('invoices', inv.id, { deposit, balance: Math.round((inv.total - deposit) * 100) / 100, status: deposit >= inv.total ? 'paid' : 'issued' });
    await actions.logEvent(booking, 'payment', `${fmtMoney(amount)} ${pay.method} payment recorded (${res.providerRef})`, { details: { amount, method: pay.method } });
    setPay(null); toast({ tone: 'success', title: `${fmtMoney(amount)} recorded`, body: deposit >= booking.total ? 'Paid in full' : `Balance ${fmtMoney(booking.total - deposit)}` });
  };
  const refund = () => actions.withApproval({ action: 'payment.refund', title: `Refund ${booking.code}`, description: `Refund the ${fmtMoney(booking.deposit)} on this booking. Needs a manager PIN (R-P01).`, subjectTable: 'bookings', subjectId: booking.id, details: { amount: booking.deposit } }, async (approval) => {
    const last = bookingPayments.find((p) => p.status === 'paid' || p.status === 'authorized');
    if (last?.provider_ref) await payments.refund(last.provider_ref, Math.round(booking.deposit * 100), 'desk refund');
    await data.insert<PaymentRow>('payments', { location_id: booking.location_id ?? locationId, invoice_id: last?.invoice_id ?? null, customer_id: booking.customer_id, amount: -booking.deposit, method: last?.method ?? 'card', status: 'refunded', provider: payments.name, provider_ref: `refund_${Date.now().toString(36)}`, card_brand: last?.card_brand ?? null, card_last4: last?.card_last4 ?? null, is_deposit: false, paid_at: new Date().toISOString(), refund_of: last?.id ?? null, note: `Approved by ${approval?.approved_by_name ?? 'manager'}`, booking_id: booking.id } as unknown as Partial<PaymentRow>);
    await data.update<BookingRow>('bookings', booking.id, { deposit: 0, payment_status: 'refunded' });
    await actions.logEvent(booking, 'payment', `${fmtMoney(booking.deposit)} refunded (approved by ${approval?.approved_by_name ?? 'manager'})`, { approval_id: approval?.id ?? null });
    toast({ tone: 'warn', title: `${fmtMoney(booking.deposit)} refunded` });
  });

  const activity = [...events.map((e) => ({ id: e.id, at: e.at, kind: e.kind, text: e.summary, who: e.user_name, approved: !!e.approval_id })), ...approvals.filter((a) => !events.some((e) => e.approval_id === a.id)).map((a) => ({ id: a.id, at: a.approved_at, kind: 'approval', text: `${a.action} approved by ${a.approved_by_name} (${a.approver_role})`, who: a.requested_by_name, approved: true }))].sort((a, b) => b.at.localeCompare(a.at));
  const custName = customer ? `${customer.first_name} ${customer.last_name}` : 'Customer';

  return (
    <div className="fdr-page">
      <PageHeader title={booking.code} eyebrow={<span className="row" style={{ gap: 8 }}><StatusBadge status={booking.status} />{roomType?.name} · {booking.nights} night{booking.nights === 1 ? '' : 's'}{booking.source === 'app' && <Badge size="sm" tone="info">from the app</Badge>}</span>} subtitle={`${custName} · ${stayPets.map((x) => x.pet.name).join(', ') || 'no pets'} · ${fmtDate(booking.check_in)} → ${fmtDate(booking.check_out)}`} backTo="/desk/reservations" code="F-12"
        actions={<div className="fdr-toolbar">
          <BookingStatusMenu status={booking.status as BookingStatus} onSelect={onStatus} quick size="md" disabled={!can('bookings.write_any')} />
          <Button variant="secondary" icon="edit" onClick={() => nav(`/desk/reservations/${booking.id}/edit`)}>Edit</Button>
          <Button variant="secondary" icon="refresh" onClick={() => nav(`/desk/reservations/new?rebook=${booking.id}`)}>Rebook</Button>
          <IconButton icon="trash" label="Delete booking (manager PIN)" variant="outline" onClick={remove} />
        </div>} />

      <div className="fdr-detail">
        <div className="fdr-detail-col">
          <Card>
            <div className="fdr-customer">
              <Avatar name={custName} size={56} />
              <div className="fdr-customer-text"><span className="fdr-customer-name">{custName}</span><span className="small muted">{customer?.email}</span><span className="small muted">{customer?.mobile}{customer?.city ? ` · ${customer.city}, ${customer.state}` : ''}</span></div>
              <div className="fdr-inline-actions"><Button size="sm" variant="secondary" icon="message" onClick={() => nav('/desk/messages')}>Message</Button><Button size="sm" variant="secondary" icon="users" onClick={() => nav('/desk/customers')}>Profile</Button></div>
            </div>
          </Card>

          <Card header={<><strong>Stay</strong>{!booking.room_id && !['checked_out', 'cancelled', 'no_show'].includes(booking.status) && <Badge tone="warn" size="sm">no room</Badge>}</>}>
            <BookingInfoGrid items={[
              { label: 'Check-in', value: `${fmtDate(booking.check_in)} · ${fmtTime(booking.check_in)}` }, { label: 'Check-out', value: `${fmtDate(booking.check_out)} · ${fmtTime(booking.check_out)}` }, { label: 'Nights', value: booking.nights },
              { label: 'Room type', value: roomType?.name }, { label: 'Room', value: <span className="row" style={{ gap: 8 }}>{room ? room.code : <span className="tone-warn">Unassigned</span>}{booking.status !== 'checked_out' && booking.status !== 'cancelled' && <Button size="sm" variant="ghost" icon="bed" onClick={() => setRoomOpen('assign')}>{room ? 'Change' : 'Assign'}</Button>}</span> },
              { label: 'Handler', value: handler?.display_name ?? handler?.name ?? 'Any', tone: handler ? 'default' : 'muted' }, { label: 'Share room', value: booking.share_room ? 'Yes' : 'No' }, { label: 'Payment', value: booking.payment_status, tone: booking.payment_status === 'paid' ? 'success' : booking.payment_status === 'refunded' ? 'danger' : 'warn' }, { label: 'Created', value: fmtDateTime(booking.created_at), tone: 'muted' },
            ]} />
          </Card>

          <Card header={<><strong>Pets</strong><span className="xs muted">{stayPets.length} on this stay</span></>}>
            {stayPets.length === 0 ? <EmptyState compact icon="dog" title="No pets on this booking" /> : (
              <div className="fdr-pets">
                {stayPets.map(({ bp, pet }) => (
                  <div key={pet.id} className="fdr-pet">
                    <Avatar name={pet.name} kind="pet" shape="rounded" size={44} />
                    <div className="stack-sm" style={{ gap: 6 }}>
                      <div className="fdr-pet-name">{pet.name} <span className="fdr-pet-meta">· {pet.breed} · {pet.sex} · {pet.weight_lbs} lb ({pet.size})</span></div>
                      <PetVaccineStatus summary={vacc[pet.id]} />
                      <div className="row wrap" style={{ gap: 4 }}>
                        {bp.takes_medication && <Badge tone="warn" size="sm">Medication: {bp.medication}</Badge>}
                        {bp.medical_alert && <Badge tone="danger" size="sm">Alert: {bp.medical_alert}</Badge>}
                        {(pet.attributes ?? []).map((a) => <Badge key={a} size="sm">{a}</Badge>)}
                        {pet.personality && <Badge size="sm" tone="neutral">{pet.personality}</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {booking.status === 'pending_vaccines' && <p className="small tone-warn" style={{ marginTop: 12 }}>Waiting for vaccine verification (R-A05). Verify the proofs under Vaccines, or confirm with a manager PIN.</p>}
          </Card>

          <Card header={<><strong>Notes</strong><Toggle size="sm" checked={(booking as unknown as { include_notes_on_invoice: boolean }).include_notes_on_invoice} onChange={async (v) => { await data.update('bookings', booking.id, { include_notes_on_invoice: v }); }} label="Print on invoice" /></>}>
            <Textarea value={notes ?? booking.notes ?? ''} onChange={(e) => setNotes(e.target.value.slice(0, 100))} maxLength={100} showCount rows={3} placeholder="Feeding, pickup, anything the team should know" aria-label="Booking notes" />
            {notes !== null && notes !== (booking.notes ?? '') && <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}><Button size="sm" variant="secondary" onClick={() => setNotes(null)}>Discard</Button><Button size="sm" onClick={saveNotes}>Save notes</Button></div>}
          </Card>
        </div>

        <div className="fdr-detail-col">
          <Card header={<><strong>Charges</strong><span className="xs muted">quote at booking time</span></>}>
            {quote ? <BookingChargeSummary lines={[...quote.lines, ...services.filter((s) => !quote.lines.some((l) => l.label.startsWith(s.label))).map((s) => ({ label: s.label, qty: s.qty, unit: s.rate, amount: s.total, kind: 'service' as const }))]} subtotal={booking.subtotal} discountTotal={booking.discount_total} feeTotal={booking.fee_total} taxTotal={booking.tax_total} total={booking.total} deposit={booking.deposit} notes={quote.notes}
              footer={<div className="fdr-inline-actions">{balance > 0 && booking.status !== 'cancelled' && <Button size="sm" icon="card" onClick={() => setPay({ amount: String(balance), method: booking.payment_method ?? 'card' })} disabled={!can('payments.write')}>Record payment</Button>}{booking.deposit > 0 && <Button size="sm" variant="secondary" icon="lock" onClick={refund}>Refund</Button>}<Button size="sm" variant="ghost" icon="download" onClick={() => toast({ tone: 'info', title: 'Invoice PDF', body: 'Printing lands with the invoices module (F-20s).' })}>Invoice</Button></div>} />
              : <EmptyState compact icon="dollar" title="No quote stored" body={`Total ${fmtMoney(booking.total)}, deposit ${fmtMoney(booking.deposit)}`} />}
          </Card>

          <Card header={<><strong>Payments</strong><span className="xs muted">{invoices[0] ? <span className="mono">{invoices[0].number}</span> : 'no invoice yet'}</span></>}>
            {bookingPayments.length === 0 ? <p className="muted small">No payments recorded.</p> : (
              <DataTable<PaymentRow> dense columns={[{ key: 'paid_at', label: 'When', render: (p) => fmtDateTime(p.paid_at) }, { key: 'method', label: 'Method', render: (p) => `${p.method}${p.card_last4 ? ` ·· ${p.card_last4}` : ''}` }, { key: 'amount', label: 'Amount', align: 'right', render: (p) => <span className="mono">{fmtMoney(p.amount)}</span> }, { key: 'status', label: 'Status', render: (p) => <Badge size="sm" tone={toneFor(p.status)}>{p.status}</Badge> }]} rows={bookingPayments} rowKey={(p) => p.id} stickyHeader={false} cardBreakpoint={480} />
            )}
          </Card>

          <Card header={<><strong>Activity</strong><span className="xs muted">{activity.length} events</span></>}>
            {activity.length === 0 ? <p className="muted small">No activity yet.</p> : (
              <ul className="fdr-activity">
                {activity.map((a) => <li key={a.id} className={`${a.kind === 'status' ? 'is-status' : ''} ${a.approved ? 'is-approved' : ''}`}><span className="fdr-activity-dot" /><div><div>{a.text}</div><div className="xs muted">{fmtDateTime(a.at)} · {a.who}{a.approved && a.kind !== 'approval' ? ' · manager approved' : ''}</div></div></li>)}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {roomOpen && <RoomPickModal booking={booking} rooms={rooms} roomTypes={roomTypes} bookings={bookings} heaviestLbs={heaviest} title={roomOpen === 'checkin' ? `Check in ${booking.code}: pick a room first` : `Room for ${booking.code}`} confirmLabel={roomOpen === 'checkin' ? 'Assign & check in' : 'Assign room'} onClose={() => setRoomOpen(null)}
        onPick={(roomId, code) => { const mode = roomOpen; setRoomOpen(null); if (mode === 'checkin') actions.changeStatus(booking, 'checked_in', { roomId }); else void actions.assignRoom(booking, roomId, code); }} />}
      <Modal open={!!pay} onClose={() => setPay(null)} title={`Record payment · ${booking.code}`} size="sm" footer={<><Button variant="secondary" onClick={() => setPay(null)}>Cancel</Button><Button icon="check" onClick={recordPayment}>Record {pay ? fmtMoney(Number(pay.amount) || 0) : ''}</Button></>}>
        {pay && <div className="stack-sm">
          <Input type="number" min={0} step="0.01" label="Amount" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} suffix="USD" hint={`Balance ${fmtMoney(balance)}`} />
          <Select label="Method" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value as 'card' | 'cash' })} options={[{ value: 'card', label: 'Card (mock terminal)' }, { value: 'cash', label: 'Cash' }]} />
          <p className="xs muted">Goes through the PaymentProvider ({payments.name}); Stripe replaces it later without changing this page.</p>
        </div>}
      </Modal>
      {actions.modal}
      <p className="xs faint">Lifecycle: {(['requested', 'pending_vaccines', 'confirmed', 'checked_in', 'checked_out'] as const).map((s) => BOOKING_STATUS_LABEL[s]).join(' → ')} (+ cancelled, no show). PIN-gated changes are marked with a lock.</p>
    </div>
  );
}
