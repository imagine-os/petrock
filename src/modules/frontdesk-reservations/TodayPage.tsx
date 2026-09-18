import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../tenant/LocationProvider';
import { useSession } from '../../auth/SessionProvider';
import { useTable } from '../../data/DataContext';
import type { AppointmentRow } from '../../data/schema/core';
import { fmtMoney } from '../../pricing/engine';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { ReservationDayNav } from '../../components/molecule/ReservationDayNav/ReservationDayNav';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Section } from '../../components/molecule/Section/Section';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Icon } from '../../components/atom/Icon/Icon';
import { StatusBadge } from '../../components/atom/Badge/Badge';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useReservationRows, bucketOf, type Bucket, type ReservationRow } from './lib/reservations';
import { TODAY_COLUMNS } from './lib/columns';
import { addDaysIso, fmtDay, todayIso } from './lib/dates';
import { availabilityByType } from './lib/availability';
import { useBookingActions } from './lib/useBookingActions';
import { RoomPickModal } from './lib/RoomPickModal';
import { transitionNeedsPin, type BookingStatus } from '../../domain/booking';
import './frontdesk-reservations.css';

type Tab = 'all' | Bucket;
const QUICK: Partial<Record<BookingStatus, { to: BookingStatus; label: string }>> = { confirmed: { to: 'checked_in', label: 'Check in' }, checked_in: { to: 'checked_out', label: 'Check out' }, requested: { to: 'confirmed', label: 'Confirm' } };

/** F-01 - the desk's home for one location and one day. */
export function TodayPage() {
  const nav = useNavigate();
  const { location, scope } = useLocation();
  const { can } = useSession();
  const [day, setDay] = useState(todayIso());
  const [tab, setTab] = useState<Tab>('all');
  const { rows, bookings, rooms, roomTypes } = useReservationRows();
  const { rows: appts } = useTable<AppointmentRow>('appointments', { where: scope });
  const actions = useBookingActions();
  const [roomFor, setRoomFor] = useState<ReservationRow | null>(null);

  const bucketed = useMemo(() => rows.map((r) => ({ r, b: bucketOf(r, day) })).filter((x) => x.b !== 'other'), [rows, day]);
  const count = (b: Bucket) => bucketed.filter((x) => x.b === b).length;
  const visible = (tab === 'all' ? bucketed : bucketed.filter((x) => x.b === tab)).map((x) => x.r);
  const inHouse = bucketed.filter((x) => (x.b === 'staying' || x.b === 'departing') && x.r.status === 'checked_in').length;
  const avail = useMemo(() => availabilityByType({ rooms, roomTypes, bookings, checkInDay: day, checkOutDay: addDaysIso(day, 1) }), [rooms, roomTypes, bookings, day]);
  const pendingVacc = bookings.filter((b) => b.status === 'pending_vaccines' && b.check_in.slice(0, 10) >= day.slice(0, 10)).length;
  const balanceDue = bucketed.filter((x) => x.b === 'departing' || x.b === 'arriving').reduce((s, x) => s + Math.max(0, x.r.balance), 0);
  const apptsToday = appts.filter((a) => a.starts_at.slice(0, 10) === day && !['cancelled', 'no_show'].includes(a.status));

  const attention = useMemo(() => {
    const items: { key: string; tone: 'danger' | 'warn'; icon: 'warning' | 'bed' | 'dollar'; title: string; body: string; row: ReservationRow }[] = [];
    for (const { r, b } of bucketed) {
      if (r.kind !== 'hotel') continue;
      if (!r.vaccineOk && ['arriving', 'staying'].includes(b) && r.status !== 'checked_out') items.push({ key: `v${r.id}`, tone: 'danger', icon: 'warning', title: `${r.petNames}: vaccine issue`, body: `${r.code} · ${r.customer} · ${Object.values(r.vaccines).flatMap((v) => [...v.expired.map((x) => `${x} expired`), ...v.missing.map((x) => `${x} missing`), ...v.submitted.map((x) => `${x} to verify`)]).join(', ')}`, row: r });
      if (b === 'arriving' && !r.roomId && !['cancelled', 'no_show', 'checked_out'].includes(r.status)) items.push({ key: `r${r.id}`, tone: 'warn', icon: 'bed', title: `${r.code}: no room assigned`, body: `${r.customer} · ${r.petNames} · ${r.roomType}`, row: r });
      if (b === 'departing' && r.balance > 0) items.push({ key: `b${r.id}`, tone: 'warn', icon: 'dollar', title: `${r.code}: ${fmtMoney(r.balance)} due at check-out`, body: `${r.customer} · ${r.petNames}`, row: r });
    }
    return items;
  }, [bucketed]);

  const quick = (r: ReservationRow) => {
    const b = r.booking; if (!b) return null;
    const q = QUICK[r.status]; if (!q) return null;
    const onClick = () => { if (q.to === 'checked_in' && !b.room_id) { setRoomFor(r); return; } actions.changeStatus(b, q.to); };
    return <Button size="sm" variant={q.to === 'checked_in' ? 'primary' : 'secondary'} icon={transitionNeedsPin(r.status, q.to) ? 'lock' : undefined} onClick={onClick} disabled={!can('bookings.write_any')}>{q.label}</Button>;
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: bucketed.length }, { key: 'arriving', label: 'Arriving', count: count('arriving') }, { key: 'departing', label: 'Departing', count: count('departing') },
    { key: 'staying', label: 'Staying', count: count('staying') }, { key: 'daycare', label: 'Daycare', count: count('daycare') }, { key: 'checked_out', label: 'Checked out', count: count('checked_out') },
  ];

  return (
    <div className="fdr-page">
      <PageHeader title={`Front desk · ${location.short_name}`} subtitle={`${fmtDay(day)}${day === todayIso() ? ' · today' : ''}`} code="F-01"
        actions={<div className="fdr-toolbar"><ReservationDayNav value={day} onChange={setDay} /><Button icon="plus" onClick={() => nav('/desk/reservations/new')}>New booking</Button></div>} />

      <div className="fdr-stats">
        <StatTile label="Arriving" value={count('arriving')} icon="arrow-right" hint={`${bucketed.filter((x) => x.b === 'arriving' && x.r.status === 'checked_in').length} checked in`} onClick={() => setTab('arriving')} />
        <StatTile label="Departing" value={count('departing')} icon="arrow-left" hint={`${bucketed.filter((x) => x.b === 'departing' && x.r.status === 'checked_out').length} checked out`} onClick={() => setTab('departing')} />
        <StatTile label="In house" value={inHouse} icon="bed" hint="dogs staying tonight" onClick={() => setTab('staying')} />
        <StatTile label="Daycare" value={count('daycare')} icon="sun" hint="daycare days" onClick={() => setTab('daycare')} />
        {avail.map((a) => <StatTile key={a.roomType.id} label={`${a.roomType.name}s free`} value={`${a.free} / ${a.total}`} icon="grid" hint={a.roomType.key === 'penthouse' ? `${a.bottomFree} bottom rooms` : 'tonight'} onClick={() => nav('/desk/reservations/availability')} />)}
        <StatTile label="Pending vaccines" value={pendingVacc} icon="shield" hint="upcoming stays" />
        <StatTile label="Balance due" value={fmtMoney(balanceDue)} icon="dollar" hint="arrivals + departures" />
        <StatTile label="Grooming & Spa" value={apptsToday.length} icon="scissors" hint="appointments" onClick={() => nav('/desk/reservations/board')} />
      </div>

      {attention.length > 0 && (
        <Section title="Needs attention" description="Blockers for the selected day: missing vaccines, unassigned rooms, balances due.">
          <div className="fdr-attn">
            {attention.slice(0, 9).map((a) => (
              <div key={a.key} className={`fdr-attn-item is-${a.tone}`}>
                <span className="fdr-attn-icon"><Icon name={a.icon} size={16} /></span>
                <div className="grow stack-sm" style={{ gap: 4 }}><strong className="small">{a.title}</strong><span className="xs muted">{a.body}</span></div>
                <IconButton icon="arrow-right" label="Open booking" size="sm" onClick={() => nav(`/desk/reservations/${a.row.id}`)} />
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Reservations" description="Hotel stays and daycare days touching the selected day (R-I05)." actions={<Button variant="secondary" size="sm" icon="table" onClick={() => nav('/desk/reservations')}>Full table</Button>}>
        <Tabs items={tabs} value={tab} onChange={setTab} ariaLabel="Day groups" />
        <div style={{ marginTop: 12 }}>
          {visible.length === 0 ? <EmptyState icon="paw" title="Nothing here for this day" body="No reservations in this group. Try another day or create a booking." action={<Button size="sm" onClick={() => nav('/desk/reservations/new')}>New booking</Button>} /> : (
            <DataTable<ReservationRow> columns={TODAY_COLUMNS} rows={visible} rowKey={(r) => r.id} dense searchable onRowClick={(r) => (r.kind === 'hotel' ? nav(`/desk/reservations/${r.id}`) : nav('/desk/reservations'))}
              rowActions={(r) => <span>{quick(r)}<IconButton icon="eye" label="Open" size="sm" onClick={() => (r.kind === 'hotel' ? nav(`/desk/reservations/${r.id}`) : nav('/desk/reservations'))} /></span>} emptyText="No reservations" />
          )}
        </div>
      </Section>
      <p className="xs faint">Status colours: {(['confirmed', 'checked_in', 'checked_out', 'pending_vaccines'] as const).map((s) => <span key={s} style={{ marginRight: 6 }}><StatusBadge status={s} size="sm" /></span>)}</p>

      {roomFor?.booking && <RoomPickModal booking={roomFor.booking} rooms={rooms} roomTypes={roomTypes} bookings={bookings} heaviestLbs={roomFor.heaviestLbs} title={`Check in ${roomFor.code}: pick a room first`} confirmLabel="Assign & check in" onClose={() => setRoomFor(null)} onPick={(roomId) => { const b = roomFor.booking!; setRoomFor(null); actions.changeStatus(b, 'checked_in', { roomId }); }} />}
      {actions.modal}
    </div>
  );
}
