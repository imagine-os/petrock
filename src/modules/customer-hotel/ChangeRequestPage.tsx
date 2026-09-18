import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { BookingPetRow, BookingRow, LocationRow, NotificationRow, PetRow, UserRow } from '../../data/schema/core';
import type { BookingChangeRequestRow, CHANGE_REQUEST_KINDS } from '../../data/schema/customer-hotel';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { RadioGroup } from '../../components/atom/RadioGroup/RadioGroup';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { StayDatesCard, type StayDatesValue } from '../../components/molecule/StayDatesCard/StayDatesCard';
import { useToast } from '../../components/molecule/Toast/Toast';
import { combineDateTime, hoursForLocation, useCustomerAccount, useHotelSettings, validateStay } from './lib';
import './customer-hotel.css';

type Kind = (typeof CHANGE_REQUEST_KINDS)[number];
const hhmm = (iso: string) => `${String(new Date(iso).getHours()).padStart(2, '0')}:${String(new Date(iso).getMinutes()).padStart(2, '0')}`;

/** C-41 · Request a change to a stay (dates, pets, grooming, other) -> booking_change_requests + desk notification. */
export function ChangeRequestPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const settings = useHotelSettings();
  const { customer, pets } = useCustomerAccount();
  const booking = useRow<BookingRow>('bookings', id);
  const location = useRow<LocationRow>('locations', booking?.location_id);
  const { rows: bps } = useTable<BookingPetRow>('booking_pets', { where: { booking_id: id ?? '__none__' } });
  const { rows: users } = useTable<UserRow>('users');
  const [kind, setKind] = useState<Kind>('modify_dates');
  const [dates, setDates] = useState<StayDatesValue | null>(null);
  const [petIds, setPetIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const hoursFor = useMemo(() => hoursForLocation(location), [location]);
  if (!booking) return <HotelBookingFrame title="Request a change" backTo="/app/bookings"><EmptyState title="Reservation not found" /></HotelBookingFrame>;
  if (!['requested', 'pending_vaccines', 'confirmed'].includes(booking.status)) return <HotelBookingFrame title="Request a change" backTo={`/app/bookings/${booking.id}`}><EmptyState icon="lock" title="This stay can no longer be changed" body="Once a stay has started, talk to the front desk." action={<Link to={`/app/bookings/${booking.id}`}><Button variant="secondary">Back to the reservation</Button></Link>} /></HotelBookingFrame>;
  const current: StayDatesValue = dates ?? { checkIn: booking.check_in.slice(0, 10), checkInTime: hhmm(booking.check_in), checkOut: booking.check_out.slice(0, 10), checkOutTime: hhmm(booking.check_out) };
  const onStay = bps.map((bp) => bp.pet_id);
  const petChoices = kind === 'add_pet' ? pets.filter((p) => !onStay.includes(p.id)) : kind === 'remove_pet' ? pets.filter((p) => onStay.includes(p.id)) : [];
  const dateErr = kind === 'modify_dates' ? validateStay(current, settings, hoursFor) : null;
  const unchanged = kind === 'modify_dates' && !dates;
  const valid = kind === 'modify_dates' ? !dateErr && !unchanged : kind === 'add_pet' || kind === 'remove_pet' ? petIds.length > 0 : message.trim().length > 0;

  const submit = async () => {
    if (!valid || !customer) return;
    setBusy(true);
    const now = new Date().toISOString();
    const req = await data.insert<BookingChangeRequestRow>('booking_change_requests', { location_id: booking.location_id, booking_id: booking.id, customer_id: customer.id, kind, requested_check_in: kind === 'modify_dates' && current.checkIn ? combineDateTime(current.checkIn, current.checkInTime) : null, requested_check_out: kind === 'modify_dates' && current.checkOut ? combineDateTime(current.checkOut, current.checkOutTime) : null, pet_ids: petIds.length ? petIds : null, message: message.trim() || null, status: 'open', handled_by: null, handled_at: null, staff_note: null });
    for (const u of users.filter((u) => u.role === 'front_desk' && u.location_id === booking.location_id)) await data.insert<NotificationRow>('notifications', { user_id: u.id, kind: 'change_request', title: `Change request on ${booking.code}`, body: `${customer.first_name} ${customer.last_name}: ${kind.replace('_', ' ')}${message ? ` - ${message.slice(0, 80)}` : ''}`, link: `/desk/reservations/${booking.id}`, read: false, sent_at: now });
    toast({ tone: 'success', title: 'Request sent', body: `The ${location?.short_name ?? ''} front desk will get back to you (${req.id.slice(-6)})` });
    nav(`/app/bookings/${booking.id}`, { replace: true });
  };

  return (
    <HotelBookingFrame title="Request a change" subtitle={booking.code} backTo={`/app/bookings/${booking.id}`} footer={<Button block loading={busy} disabled={!valid} onClick={submit} icon="message">Send request</Button>} footerNote="The front desk reviews every change; you get a notification when it is handled.">
      <RadioGroup cards name="kind" label="What would you like to change?" value={kind} onChange={(v) => { setKind(v as Kind); setPetIds([]); }} options={[{ value: 'modify_dates', label: 'Change the dates or times' }, { value: 'add_pet', label: 'Add a pet to the stay', disabled: pets.filter((p) => !onStay.includes(p.id)).length === 0 }, { value: 'remove_pet', label: 'Remove a pet', disabled: onStay.length < 2 }, { value: 'add_grooming', label: 'Add Grooming & Spa at the end of the stay' }, { value: 'other', label: 'Something else' }]} />
      {kind === 'modify_dates' && <Card><StayDatesCard value={current} onChange={setDates} hoursFor={hoursFor} error={dates ? dateErr : null} /></Card>}
      {(kind === 'add_pet' || kind === 'remove_pet') && <Card><div className="stack-sm">{petChoices.map((p: PetRow) => <Checkbox key={p.id} label={p.name} description={`${p.breed ?? ''}${p.weight_lbs ? ` · ${p.weight_lbs} lb` : ''}`} checked={petIds.includes(p.id)} onChange={(e) => setPetIds((s) => (e.target.checked ? [...s, p.id] : s.filter((x) => x !== p.id)))} />)}</div></Card>}
      <Textarea label={kind === 'other' || kind === 'add_grooming' ? 'Tell us more' : 'Message (optional)'} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={kind === 'add_grooming' ? 'Which pet and which package? Gold, Platinum or Diamond' : 'Anything the front desk should know'} maxLength={300} showCount />
    </HotelBookingFrame>
  );
}
