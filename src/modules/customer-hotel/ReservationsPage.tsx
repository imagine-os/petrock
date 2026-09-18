import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { AppointmentRow, BookingPetRow, BookingRow, DaycareBookingRow, InvoiceRow, LocationRow, PackageRow, PetRow, RoomTypeRow } from '../../data/schema/core';
import { fmtMoney } from '../../pricing/engine';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Chip } from '../../components/atom/Chip/Chip';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { CustomerReservationCard, type ReservationKind } from '../../components/molecule/CustomerReservationCard/CustomerReservationCard';
import { useT } from '../../i18n';
import { useCustomerAccount } from './lib';
import './customer-hotel.css';

interface Item { key: string; kind: ReservationKind; title: string; code: string; pets: string[]; status: string; start: string; end: string | null; locationName?: string; amount?: string; to?: string; note?: string; sortEnd: string }
const DONE = ['checked_out', 'cancelled', 'no_show', 'done'];

/** C-38 · My reservations: hotel stays, grooming appointments and daycare days, upcoming / previous. */
export function ReservationsPage() {
  const t = useT();
  const { customer } = useCustomerAccount();
  const cid = customer?.id ?? '__none__';
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: { customer_id: cid } });
  const { rows: appointments } = useTable<AppointmentRow>('appointments', { where: { customer_id: cid } });
  const { rows: daycare } = useTable<DaycareBookingRow>('daycare_bookings', { where: { customer_id: cid } });
  const { rows: bps } = useTable<BookingPetRow>('booking_pets');
  const { rows: pets } = useTable<PetRow>('pets', { where: { customer_id: cid } });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types');
  const { rows: packages } = useTable<PackageRow>('packages');
  const { rows: locations } = useTable<LocationRow>('locations');
  const { rows: invoices } = useTable<InvoiceRow>('invoices', { where: { customer_id: cid } });
  const [tab, setTab] = useState<'upcoming' | 'previous'>('upcoming');
  const [kind, setKind] = useState<'all' | ReservationKind>('all');

  const items = useMemo<Item[]>(() => {
    const petName = (id: string) => pets.find((p) => p.id === id)?.name ?? 'Pet';
    const loc = (id: string | null | undefined) => locations.find((l) => l.id === id)?.short_name;
    const hotel: Item[] = bookings.map((b) => { const inv = invoices.find((i) => i.source_type === 'booking' && i.source_id === b.id); const bal = inv ? inv.balance : Math.max(0, b.total - b.deposit); return { key: b.id, kind: 'hotel', title: roomTypes.find((r) => r.id === b.room_type_id)?.name ?? 'Stay', code: b.code, pets: bps.filter((x) => x.booking_id === b.id).map((x) => petName(x.pet_id)), status: b.status, start: b.check_in, end: b.check_out, locationName: loc(b.location_id), amount: fmtMoney(b.total), to: `/app/bookings/${b.id}`, note: bal > 0 && !DONE.includes(b.status) ? `Balance ${fmtMoney(bal)}` : undefined, sortEnd: b.check_out }; });
    const groom: Item[] = appointments.map((a) => ({ key: a.id, kind: 'grooming', title: packages.find((p) => p.id === a.package_id)?.name ?? 'Grooming & Spa', code: a.code, pets: [petName(a.pet_id)], status: a.status === 'done' ? 'checked_out' : a.status === 'in_progress' ? 'checked_in' : a.status, start: a.starts_at, end: null, locationName: loc(a.location_id), amount: fmtMoney(a.total), sortEnd: new Date(new Date(a.starts_at).getTime() + a.duration_min * 60000).toISOString() }));
    const dc: Item[] = daycare.map((d) => ({ key: d.id, kind: 'daycare', title: d.item === 'full_day' ? 'Full day' : d.item === 'half_day' ? 'Half day' : 'Play hour', code: d.code, pets: d.pet_ids.map(petName), status: d.status, start: `${d.date}T${d.check_in_time}:00`, end: null, locationName: loc(d.location_id), amount: fmtMoney(d.total), sortEnd: `${d.date}T${d.check_out_time}:00` }));
    return [...hotel, ...groom, ...dc];
  }, [bookings, appointments, daycare, bps, pets, roomTypes, packages, locations, invoices]);
  const now = new Date().toISOString();
  const upcoming = items.filter((i) => !DONE.includes(i.status) && i.sortEnd >= now).sort((a, b) => a.start.localeCompare(b.start));
  const previous = items.filter((i) => DONE.includes(i.status) || i.sortEnd < now).sort((a, b) => b.start.localeCompare(a.start));
  const list = (tab === 'upcoming' ? upcoming : previous).filter((i) => kind === 'all' || i.kind === kind);
  const counts = (xs: Item[]) => ({ hotel: xs.filter((i) => i.kind === 'hotel').length, grooming: xs.filter((i) => i.kind === 'grooming').length, daycare: xs.filter((i) => i.kind === 'daycare').length });
  const c = counts(tab === 'upcoming' ? upcoming : previous);

  return (
    <HotelBookingFrame title={t('customer-hotel.myReservations')} backTo="/app" aside={<Link to="/app/hotel"><Button size="sm" icon="plus">Stay</Button></Link>}>
      <Tabs ariaLabel="Reservations" value={tab} onChange={setTab} items={[{ key: 'upcoming', label: t('customer-hotel.upcoming'), count: upcoming.length }, { key: 'previous', label: t('customer-hotel.previous'), count: previous.length }]} />
      <div className="ch-filters">
        <Chip size="sm" selected={kind === 'all'} onClick={() => setKind('all')}>All</Chip>
        <Chip size="sm" icon="bed" selected={kind === 'hotel'} onClick={() => setKind('hotel')}>Hotel {c.hotel}</Chip>
        <Chip size="sm" icon="scissors" selected={kind === 'grooming'} onClick={() => setKind('grooming')}>Grooming {c.grooming}</Chip>
        <Chip size="sm" icon="sun" selected={kind === 'daycare'} onClick={() => setKind('daycare')}>Daycare {c.daycare}</Chip>
      </div>
      {list.length === 0 ? <EmptyState icon="calendar" title={tab === 'upcoming' ? 'No upcoming reservations' : 'No previous reservations'} body={tab === 'upcoming' ? 'Book a hotel stay, a groom or a daycare day and it shows up here.' : 'Completed and cancelled reservations appear here.'} action={tab === 'upcoming' ? <Link to="/app/hotel"><Button icon="bed">Book a stay</Button></Link> : undefined} />
        : <div className="ch-list">{list.map((i) => <CustomerReservationCard key={i.key} kind={i.kind} title={i.title} code={i.code} pets={i.pets} status={i.status} start={i.start} end={i.end} locationName={i.locationName} amount={i.amount} to={i.to} note={i.note} />)}</div>}
    </HotelBookingFrame>
  );
}
