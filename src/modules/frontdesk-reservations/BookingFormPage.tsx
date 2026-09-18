import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLocation } from '../../tenant/LocationProvider';
import { useSession } from '../../auth/SessionProvider';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { BookingPetRow, BookingRow, CustomerRow, DiscountRow, EmployeeRow, FeeRow, PetRow, RateRow, RoomRow, RoomTypeRow, SeasonRow, ServiceRow, TaxRow, VaccineRecordRow, VaccineTypeRow } from '../../data/schema/core';
import type { BookingServiceRow } from '../../data/schema/frontdesk-reservations';
import { nightsBetween, fmtMoney } from '../../pricing/engine';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Section } from '../../components/molecule/Section/Section';
import { Card } from '../../components/molecule/Card/Card';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { TimePicker } from '../../components/molecule/TimePicker/TimePicker';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { RadioGroup } from '../../components/atom/Radio/Radio';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Modal } from '../../components/organism/Modal/Modal';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Badge, StatusBadge } from '../../components/atom/Badge/Badge';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PetVaccineStatus } from '../../components/molecule/PetVaccineStatus/PetVaccineStatus';
import { RoomAssignmentPicker } from '../../components/organism/RoomAssignmentPicker/RoomAssignmentPicker';
import { BookingChargeSummary } from '../../components/molecule/BookingChargeSummary/BookingChargeSummary';
import { useToast } from '../../components/molecule/Toast/Toast';
import { petVaccineSummary } from './lib/vaccines';
import { addDaysIso, combine, dayOf, hhmmOf, todayIso } from './lib/dates';
import { quoteDeskStay, type ServiceLineInput } from './lib/quote';
import { suiteRuleWarning } from './lib/availability';
import { useBookingActions } from './lib/useBookingActions';
import type { BookingStatus } from '../../domain/booking';
import './frontdesk-reservations.css';

interface SvcRow extends ServiceLineInput { key: string; service_id: string; morning: boolean; afternoon: boolean; evening: boolean }
interface Form { dayIn: string; timeIn: string; dayOut: string; timeOut: string; customerId: string; petIds: string[]; handlerId: string; roomTypeId: string; roomId: string | null; shareRoom: boolean; paidInFull: boolean; method: 'card' | 'cash'; deposit: string; notes: string; includeNotes: boolean; reminder: boolean; services: SvcRow[] }
const NEW_CUSTOMER = { first_name: '', last_name: '', email: '', mobile: '', city: '', state: 'CA', zip: '' };

/** F-11 - the Board Bookings form of the design, rebuilt around the pricing engine and the vaccine gate. New at /desk/reservations/new, edit at /desk/reservations/:id/edit. */
export function BookingFormPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();
  const data = useData();
  const { toast } = useToast();
  const { user } = useSession();
  const { location, locationId, scope } = useLocation();
  const actions = useBookingActions();
  const editing = useRow<BookingRow>('bookings', id ?? null);
  const { rows: allBookings } = useTable<BookingRow>('bookings');
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: scope });
  const { rows: bookingPets } = useTable<BookingPetRow>('booking_pets', id ? { where: { booking_id: id } } : { where: { booking_id: '__none__' } });
  const { rows: bookingServices } = useTable<BookingServiceRow>('booking_services', id ? { where: { booking_id: id } } : { where: { booking_id: '__none__' } });
  const { rows: customers } = useTable<CustomerRow>('customers', { orderBy: { column: 'last_name' } });
  const { rows: pets } = useTable<PetRow>('pets');
  const { rows: employees } = useTable<EmployeeRow>('employees', { where: { ...scope, is_handler: true } });
  const { rows: rooms } = useTable<RoomRow>('rooms', { where: scope });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: rates } = useTable<RateRow>('rates');
  const { rows: seasons } = useTable<SeasonRow>('seasons');
  const { rows: discounts } = useTable<DiscountRow>('discounts');
  const { rows: fees } = useTable<FeeRow>('fees');
  const { rows: taxes } = useTable<TaxRow>('taxes');
  const { rows: services } = useTable<ServiceRow>('services', { where: { category: 'extra', active: true } });
  const { rows: records } = useTable<VaccineRecordRow>('vaccine_records');
  const { rows: vtypes } = useTable<VaccineTypeRow>('vaccine_types');

  const rebook = useRow<BookingRow>('bookings', sp.get('rebook'));
  const [f, setF] = useState<Form>(() => ({ dayIn: sp.get('checkIn') ?? todayIso(), timeIn: '10:00', dayOut: sp.get('checkOut') ?? addDaysIso(sp.get('checkIn') ?? todayIso(), 2), timeOut: '11:00', customerId: sp.get('customer') ?? '', petIds: (sp.get('pets') ?? '').split(',').filter(Boolean), handlerId: '', roomTypeId: sp.get('roomType') ?? '', roomId: sp.get('room'), shareRoom: true, paidInFull: false, method: 'card', deposit: '0', notes: '', includeNotes: false, reminder: true, services: [] }));
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCust, setNewCust] = useState<typeof NEW_CUSTOMER | null>(null);
  const [custQuery, setCustQuery] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // prefill: edit mode or rebook
  useEffect(() => {
    if (loaded) return;
    if (id && editing) {
      setF({ dayIn: dayOf(editing.check_in), timeIn: hhmmOf(editing.check_in), dayOut: dayOf(editing.check_out), timeOut: hhmmOf(editing.check_out), customerId: editing.customer_id, petIds: bookingPets.map((p) => p.pet_id), handlerId: (editing as unknown as { handler_id: string | null }).handler_id ?? '', roomTypeId: editing.room_type_id, roomId: editing.room_id, shareRoom: editing.share_room, paidInFull: editing.paid_in_full, method: editing.payment_method ?? 'card', deposit: String(editing.deposit), notes: editing.notes ?? '', includeNotes: (editing as unknown as { include_notes_on_invoice: boolean }).include_notes_on_invoice, reminder: true,
        services: bookingServices.map((s) => ({ key: s.id, service_id: s.service_id, label: s.label, rate: s.rate, qty: s.qty, occurs: s.occurs, morning: s.morning, afternoon: s.afternoon, evening: s.evening })) });
      if (bookingPets.length || !editing) setLoaded(true);
    } else if (!id && rebook) { setF((s) => ({ ...s, customerId: rebook.customer_id, roomTypeId: rebook.room_type_id, shareRoom: rebook.share_room, notes: rebook.notes ?? '' })); setLoaded(true); }
    else if (!id) setLoaded(true);
  }, [id, editing, bookingPets, bookingServices, rebook, loaded]);
  useEffect(() => { if (!f.roomTypeId && roomTypes[0]) set('roomTypeId', roomTypes[0].id); }, [roomTypes, f.roomTypeId]);

  const customer = customers.find((c) => c.id === f.customerId);
  const custPets = useMemo(() => pets.filter((p) => p.customer_id === f.customerId && p.status !== 'inactive'), [pets, f.customerId]);
  const chosenPets = custPets.filter((p) => f.petIds.includes(p.id));
  const vacc = useMemo(() => Object.fromEntries(custPets.map((p) => [p.id, petVaccineSummary(p.id, records, vtypes)])), [custPets, records, vtypes]);
  const allVerified = chosenPets.length > 0 && chosenPets.every((p) => vacc[p.id]?.ok);
  const heaviest = Math.max(0, ...chosenPets.map((p) => p.weight_lbs ?? 0));
  const roomType = roomTypes.find((r) => r.id === f.roomTypeId);
  const checkIn = new Date(combine(f.dayIn, f.timeIn)), checkOut = new Date(combine(f.dayOut, f.timeOut));
  const nights = nightsBetween(checkIn, checkOut);
  const quote = useMemo(() => (roomType && nights > 0 ? quoteDeskStay({ roomTypeId: roomType.id, roomTypeName: roomType.name, checkIn, checkOut, dogs: Math.max(1, f.shareRoom ? chosenPets.length : 1), paidInFull: f.paidInFull, payWithCard: f.method === 'card', locationId, rates, seasons, discounts, fees, taxes, services: f.services }) : null), [roomType, nights, f.dayIn, f.timeIn, f.dayOut, f.timeOut, f.shareRoom, chosenPets.length, f.paidInFull, f.method, f.services, rates, seasons, discounts, fees, taxes, locationId]); // eslint-disable-line react-hooks/exhaustive-deps
  const deposit = f.paidInFull && quote ? quote.total : Math.max(0, Number(f.deposit) || 0);
  const locked = !!editing && editing.status === 'checked_in';
  const filteredCustomers = customers.filter((c) => !custQuery || `${c.first_name} ${c.last_name} ${c.email} ${c.mobile}`.toLowerCase().includes(custQuery.toLowerCase()));

  const validate = () => {
    const e: string[] = [];
    if (!f.customerId) e.push('Pick a customer.');
    if (!f.petIds.length) e.push('Pick at least one pet.');
    if (nights <= 0) e.push('Check-out must be after check-in (at least one night).');
    if (!roomType) e.push('Pick a room type.');
    if (!quote || quote.lines.filter((l) => l.kind === 'room').length === 0) e.push('No rate found for these dates - check the pricing tables.');
    setErrors(e); return e.length === 0;
  };

  const save = async () => {
    if (!validate() || !quote || !roomType) return;
    setSaving(true);
    try {
      const status: BookingStatus = editing ? (editing.status as BookingStatus) : allVerified ? 'confirmed' : 'pending_vaccines';
      const base: Partial<BookingRow> & Record<string, unknown> = {
        location_id: locationId, customer_id: f.customerId, room_type_id: roomType.id, room_id: f.roomId, check_in: checkIn.toISOString(), check_out: checkOut.toISOString(), nights, status, share_room: f.shareRoom && chosenPets.length > 1, add_grooming: editing?.add_grooming ?? false,
        handler_id: f.handlerId || null, paid_in_full: f.paidInFull, payment_method: f.method, payment_status: editing?.payment_status ?? (deposit >= quote.total ? 'paid' : deposit > 0 ? 'authorized' : 'pending'),
        subtotal: quote.subtotal, discount_total: quote.discountTotal, fee_total: quote.feeTotal, tax_total: quote.taxTotal, total: quote.total, deposit, quote: { ...quote, reminder: f.reminder }, notes: f.notes || null, include_notes_on_invoice: f.includeNotes, source: editing?.source ?? 'desk',
      };
      let booking: BookingRow;
      if (editing) {
        booking = await data.update<BookingRow>('bookings', editing.id, base);
        const keep = new Set(f.petIds);
        for (const bp of bookingPets) if (!keep.has(bp.pet_id)) await data.remove('booking_pets', bp.id); else if (bp.room_id !== f.roomId) await data.update('booking_pets', bp.id, { room_id: f.roomId });
        for (const pid of f.petIds) if (!bookingPets.some((bp) => bp.pet_id === pid)) await data.insert('booking_pets', petRow(booking.id, pid));
        for (const s of bookingServices) await data.remove('booking_services', s.id);
        await actions.logEvent(booking, 'edited', `Edited at the desk: ${nights} nights, ${roomType.name}, ${chosenPets.map((p) => p.name).join(', ')}`);
      } else {
        const next = Math.max(1000, ...allBookings.map((b) => Number(b.code.replace(/\D/g, '')) || 0)) + 1;
        booking = await data.insert<BookingRow>('bookings', { ...base, code: `PR-${next}` } as Partial<BookingRow>);
        for (const pid of f.petIds) await data.insert('booking_pets', petRow(booking.id, pid));
        await actions.logEvent(booking, 'created', `Created at the front desk by ${user.name}${status === 'pending_vaccines' ? ' - pending vaccines (R-X04)' : ''}`, { to_status: status });
      }
      for (const s of f.services) await data.insert<BookingServiceRow>('booking_services', { booking_id: booking.id, service_id: s.service_id, label: s.label, pet_id: null, rate: s.rate, qty: s.qty, total: Math.round(s.rate * s.qty * 100) / 100, occurs: s.occurs, morning: s.morning, afternoon: s.afternoon, evening: s.evening, note: null });
      toast({ tone: 'success', title: editing ? `${booking.code} updated` : `${booking.code} created`, body: editing ? undefined : `Status: ${status.replace('_', ' ')}` });
      nav(`/desk/reservations/${booking.id}`);
    } finally { setSaving(false); }
  };
  const petRow = (bookingId: string, petId: string): Partial<BookingPetRow> & Record<string, unknown> => { const p = pets.find((x) => x.id === petId); return { booking_id: bookingId, pet_id: petId, room_id: f.roomId, takes_medication: false, medication: null, dosing: null, flea_medication: false, medical_alert: (p as unknown as { medical_conditions?: string | null })?.medical_conditions ?? null }; };

  const createCustomer = async () => {
    if (!newCust) return;
    const missing = (['first_name', 'last_name', 'email', 'mobile', 'city', 'state'] as const).filter((k) => !newCust[k].trim());
    if (missing.length) { toast({ tone: 'danger', title: `Required: ${missing.join(', ').replace(/_/g, ' ')}` }); return; }
    const c = await data.insert<CustomerRow>('customers', { ...newCust, alt_phone: null, address: null, apt_suite: null, status: 'active', preferred_contact: 'mobile', home_location_id: locationId, marketing_opt_in: false, note: null, balance: 0, user_id: null } as Partial<CustomerRow>);
    setF((s) => ({ ...s, customerId: c.id, petIds: [] })); setNewCust(null); toast(`${c.first_name} ${c.last_name} added`);
  };

  const addService = (svc: ServiceRow) => setF((s) => ({ ...s, services: [...s.services, { key: `${svc.id}_${Date.now()}`, service_id: svc.id, label: svc.name, rate: svc.price, qty: 1, occurs: 'once', morning: true, afternoon: false, evening: false }] }));
  const patchService = (key: string, patch: Partial<SvcRow>) => setF((s) => ({ ...s, services: s.services.map((x) => (x.key === key ? { ...x, ...patch } : x)) }));

  if (id && !editing) return <div className="fdr-page"><PageHeader title="Booking not found" backTo="/desk/reservations" code="F-11" /><Card className="fdr-empty-card"><EmptyState icon="search" title="No booking with this id" action={<Button onClick={() => nav('/desk/reservations')}>Back to reservations</Button>} /></Card></div>;

  return (
    <div className="fdr-page">
      <PageHeader title={editing ? `Edit ${editing.code}` : 'New hotel booking'} subtitle={editing ? <span className="row" style={{ gap: 8 }}><StatusBadge status={editing.status} size="sm" /> {location.name}</span> : `${location.name} · Board booking at the desk`} backTo={editing ? `/desk/reservations/${editing.id}` : '/desk/reservations'} code="F-11" />
      <div className="fdr-form">
        <div className="fdr-form-main">
          <Section title="Stay" description={locked ? 'Checked-in stay: dates are locked (R-X05). Use the detail page to check out.' : 'Check-in and check-out; nights drive the rate.'}>
            <div className="fdr-fields">
              <Input type="date" label="Date in" value={f.dayIn} onChange={(e) => { set('dayIn', e.target.value); if (f.dayOut <= e.target.value) set('dayOut', addDaysIso(e.target.value, 1)); }} disabled={locked} required />
              <TimePicker label="Time in" value={f.timeIn} onChange={(v) => set('timeIn', v)} />
              <Input type="date" label="Date out" value={f.dayOut} min={addDaysIso(f.dayIn, 1)} onChange={(e) => set('dayOut', e.target.value)} disabled={locked} required />
              <TimePicker label="Time out" value={f.timeOut} onChange={(v) => set('timeOut', v)} />
              <div className="stack-sm"><span className="field-label">Nights</span><strong className="md">{nights}</strong></div>
              <Toggle checked={f.reminder} onChange={(v) => set('reminder', v)} label="Reminder" description="R-I11" size="sm" />
            </div>
          </Section>

          <Section title="Customer & pets" actions={<Button size="sm" variant="secondary" icon="plus" onClick={() => setNewCust({ ...NEW_CUSTOMER })}>New customer</Button>}>
            <div className="fdr-fields">
              <Input size="sm" icon="search" label="Find customer" placeholder="Name, email or phone" value={custQuery} onChange={(e) => setCustQuery(e.target.value)} />
              <Select label="Customer" required value={f.customerId} onChange={(e) => setF((s) => ({ ...s, customerId: e.target.value, petIds: [] }))} placeholder={`Choose (${filteredCustomers.length})`} options={filteredCustomers.map((c) => ({ value: c.id, label: `${c.last_name}, ${c.first_name} · ${c.mobile}` }))} />
              <Select label="Handler" value={f.handlerId} onChange={(e) => set('handlerId', e.target.value)} placeholder="Any" options={employees.map((e) => ({ value: e.id, label: e.display_name ?? e.name }))} />
            </div>
            {customer && (
              <div className="stack" style={{ marginTop: 12 }}>
                <div className="fdr-customer"><Avatar name={`${customer.first_name} ${customer.last_name}`} /><div className="fdr-customer-text"><span className="small"><strong>{customer.first_name} {customer.last_name}</strong> · {customer.email}</span><span className="xs muted">{customer.mobile} · {customer.city ?? ''} {customer.state ?? ''}</span></div></div>
                {custPets.length === 0 ? <EmptyState compact icon="dog" title="No pets on this account" body="Add the pet under Customers & pets first (R-A01)." /> : (
                  <div className="fdr-pets">
                    {custPets.map((p) => { const on = f.petIds.includes(p.id); return (
                      <div key={p.id} className={`fdr-pet is-selectable ${on ? 'is-selected' : ''}`} role="checkbox" aria-checked={on} tabIndex={0} onClick={() => set('petIds', on ? f.petIds.filter((x) => x !== p.id) : [...f.petIds, p.id])} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); set('petIds', on ? f.petIds.filter((x) => x !== p.id) : [...f.petIds, p.id]); } }}>
                        <Avatar name={p.name} kind="pet" shape="rounded" />
                        <div className="stack-sm" style={{ gap: 4 }}><div className="fdr-pet-name">{p.name} <span className="fdr-pet-meta">· {p.breed} · {p.weight_lbs} lb · {p.size}</span></div><PetVaccineStatus summary={vacc[p.id]} />{p.approval_status !== 'approved' && <Badge tone="warn" size="sm">Pet {p.approval_status.replace('_', ' ')}</Badge>}</div>
                      </div>
                    ); })}
                  </div>
                )}
                {chosenPets.length > 1 && <Toggle checked={f.shareRoom} onChange={(v) => set('shareRoom', v)} label="Pets share one room" description="Multi-dog discount applies to shared rooms (R-A07, R-E01)" size="sm" />}
                {chosenPets.length > 0 && !allVerified && !editing && <p className="small tone-warn row" style={{ gap: 6 }}><Badge tone="warn">pending vaccines</Badge> This booking will start as Pending vaccines until staff verify every required vaccine (R-X04).</p>}
              </div>
            )}
          </Section>

          <Section title="Room" description="Room type sets the rate; the room can be assigned now or at check-in.">
            <RadioGroup cards name="roomType" value={f.roomTypeId || null} onChange={(v) => setF((s) => ({ ...s, roomTypeId: v, roomId: null }))} options={roomTypes.map((rt) => ({ value: rt.id, label: rt.name, description: <span className="xs">{rt.description}{suiteRuleWarning(rt, heaviest) && <><br /><span className="tone-warn">{suiteRuleWarning(rt, heaviest)}</span></>}</span> }))} />
            {roomType && <div style={{ marginTop: 12 }}><RoomAssignmentPicker rooms={rooms} roomTypes={roomTypes} bookings={bookings} roomTypeId={roomType.id} checkInDay={f.dayIn} checkOutDay={f.dayOut} heaviestLbs={heaviest} value={f.roomId} onChange={(v) => set('roomId', v)} excludeBookingId={editing?.id ?? null} /></div>}
          </Section>

          <Section title="Additional services" description="Extras from the service catalog with occurrence and Morning / Afternoon / Evening flags (R-D16)." actions={<Select size="sm" aria-label="Add service" placeholder="Add service…" value="" onChange={(e) => { const s = services.find((x) => x.id === e.target.value); if (s) addService(s); }} options={services.map((s) => ({ value: s.id, label: `${s.name} · ${fmtMoney(s.price)}` }))} />}>
            {f.services.length === 0 ? <p className="muted small">No additional services.</p> : (
              <div className="fdr-services">
                {f.services.map((s) => (
                  <div key={s.key} className="fdr-service">
                    <div><strong className="small">{s.label}</strong><div className="xs muted">{fmtMoney(s.rate)} each</div></div>
                    <Input size="sm" type="number" min={1} aria-label="Quantity" value={String(s.qty)} onChange={(e) => patchService(s.key, { qty: Math.max(1, Number(e.target.value) || 1) })} />
                    <Select size="sm" aria-label="Occurs" value={s.occurs} onChange={(e) => patchService(s.key, { occurs: e.target.value as SvcRow['occurs'] })} options={[{ value: 'once', label: 'Once' }, { value: 'daily', label: 'Daily' }, { value: 'per_night', label: 'Per night' }]} />
                    <span className="fdr-mae" role="group" aria-label="Time of day">{(['morning', 'afternoon', 'evening'] as const).map((k) => <button key={k} type="button" aria-pressed={s[k]} title={k} onClick={() => patchService(s.key, { [k]: !s[k] })}>{k[0].toUpperCase()}</button>)}</span>
                    <IconButton icon="trash" label="Remove service" size="sm" onClick={() => setF((st) => ({ ...st, services: st.services.filter((x) => x.key !== s.key) }))} />
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Payment" description="Paying in full unlocks long-stay discounts (R-E04); card payments carry the card fee (R-H03).">
            <div className="fdr-fields">
              <RadioGroup inline name="method" label="Method" value={f.method} onChange={(v) => set('method', v as 'card' | 'cash')} options={[{ value: 'card', label: 'Card' }, { value: 'cash', label: 'Cash at location' }]} />
              <Toggle checked={f.paidInFull} onChange={(v) => set('paidInFull', v)} label="Paid in full" size="sm" />
              <Input type="number" min={0} step="0.01" label="Deposit" value={f.paidInFull && quote ? String(quote.total) : f.deposit} onChange={(e) => set('deposit', e.target.value)} disabled={f.paidInFull} suffix="USD" hint="Deposit amount is a working default (needs Justin)" />
            </div>
          </Section>

          <Section title="Notes">
            <Textarea label="Booking notes" value={f.notes} onChange={(e) => set('notes', e.target.value.slice(0, 100))} maxLength={100} showCount rows={3} placeholder="Feeding, pickup, anything the team should know" />
            <Checkbox checked={f.includeNotes} onChange={(e) => set('includeNotes', e.target.checked)} label="Include notes on invoice (R-J06)" />
          </Section>
        </div>

        <aside className="fdr-form-side">
          <Card header={<><strong>Quote</strong><span className="xs muted">{roomType?.name ?? '—'} · {nights} night{nights === 1 ? '' : 's'} · {chosenPets.length || 0} pet{chosenPets.length === 1 ? '' : 's'}</span></>}>
            {quote ? <BookingChargeSummary compact lines={quote.lines} subtotal={quote.subtotal} discountTotal={quote.discountTotal} feeTotal={quote.feeTotal} taxTotal={quote.taxTotal} total={quote.total} deposit={deposit} notes={quote.notes} /> : <p className="muted small">Pick dates and a room type to see the quote.</p>}
          </Card>
          {errors.length > 0 && <Card tint><ul className="small tone-danger" style={{ margin: 0, paddingLeft: 18 }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul></Card>}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => nav(editing ? `/desk/reservations/${editing.id}` : '/desk/reservations')}>Cancel</Button>
            <Button onClick={save} loading={saving} icon="check">{editing ? 'Save changes' : 'Create booking'}</Button>
          </div>
          {!editing && <p className="xs faint">Creates the booking as {allVerified ? 'Confirmed' : 'Pending vaccines'} and logs it in the activity trail. Source: desk.</p>}
        </aside>
      </div>

      <Modal open={!!newCust} onClose={() => setNewCust(null)} title="New customer" size="md" footer={<><Button variant="secondary" onClick={() => setNewCust(null)}>Cancel</Button><Button onClick={createCustomer} icon="plus">Add customer</Button></>}>
        {newCust && (
          <div className="fdr-fields">
            <Input label="First name" required value={newCust.first_name} onChange={(e) => setNewCust({ ...newCust, first_name: e.target.value })} />
            <Input label="Last name" required value={newCust.last_name} onChange={(e) => setNewCust({ ...newCust, last_name: e.target.value })} />
            <Input label="Email" type="email" required value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} />
            <Input label="Mobile" type="tel" required value={newCust.mobile} onChange={(e) => setNewCust({ ...newCust, mobile: e.target.value })} />
            <Input label="Town / city" required value={newCust.city} onChange={(e) => setNewCust({ ...newCust, city: e.target.value })} />
            <Input label="State" required value={newCust.state} onChange={(e) => setNewCust({ ...newCust, state: e.target.value })} />
            <Input label="Zip" value={newCust.zip} onChange={(e) => setNewCust({ ...newCust, zip: e.target.value })} />
            <p className="xs muted" style={{ gridColumn: '1 / -1' }}>Required per R-J01: city, state, mobile, email. Pets are added from Customers & pets afterwards.</p>
          </div>
        )}
      </Modal>
      {actions.modal}
    </div>
  );
}
