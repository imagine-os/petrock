import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../tenant/LocationProvider';
import { ReservationDayNav } from '../../components/molecule/ReservationDayNav/ReservationDayNav';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { FilterPopover } from '../../components/molecule/FilterPopover/FilterPopover';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { Select } from '../../components/atom/Select/Select';
import { Input } from '../../components/atom/Input/Input';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Button } from '../../components/atom/Button/Button';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { StatusBadge } from '../../components/atom/Badge/Badge';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { BookingInfoGrid } from '../../components/molecule/BookingInfoGrid/BookingInfoGrid';
import { PetVaccineStatus } from '../../components/molecule/PetVaccineStatus/PetVaccineStatus';
import { BOOKING_STATUSES, BOOKING_STATUS_LABEL } from '../../domain/booking';
import { fmtMoney } from '../../pricing/engine';
import { useReservationRows, bucketOf, BUCKET_LABEL, type Bucket, type ReservationRow } from './lib/reservations';
import { RESERVATION_COLUMNS_FLAT } from './lib/columns';
import { fmtDate, todayIso } from './lib/dates';
import './frontdesk-reservations.css';

export type ViewKey = 'table' | 'timeline' | 'board';
export const VIEW_PATH: Record<ViewKey, string> = { table: '/desk/reservations', timeline: '/desk/reservations/timeline', board: '/desk/reservations/board' };
/** Table / Timeline / Board switch shared by F-10, F-13, F-14 (D-008). */
export function ViewSwitch({ value }: { value: ViewKey }) {
  const nav = useNavigate();
  return <SegmentedControl size="sm" ariaLabel="View" value={value} onChange={(v) => nav(VIEW_PATH[v])} options={[{ value: 'table', label: 'Table', icon: 'table' }, { value: 'timeline', label: 'Timeline', icon: 'calendar' }, { value: 'board', label: 'Board', icon: 'grid' }]} />;
}

const GROUPS: Bucket[] = ['arriving', 'departing', 'staying', 'daycare', 'checked_out'];

/**
 * F-10 - the reservations table of the design (front desk.jpg, front desk-9.jpg): "+ Hotel Reservation" top-right, then one white
 * container with the "Hotel Reservations" title, day navigator, Filters popover and "See All" toggle, ONE purple head and the
 * Arriving / Departing / Staying / Daycare / Checked out group rows inside the same table (R-I05), 18 columns, mint status badges.
 */
export function ReservationsTablePage() {
  const nav = useNavigate();
  const { location } = useLocation();
  const { rows, roomTypes, loading } = useReservationRows();
  const [day, setDay] = useState(todayIso());
  const [mode, setMode] = useState<'day' | 'all'>('day');
  const [status, setStatus] = useState('');
  const [kind, setKind] = useState('');
  const [roomType, setRoomType] = useState('');
  const [q, setQ] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const [daycare, setDaycare] = useState<ReservationRow | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => (!status || r.status === status) && (!kind || r.kind === kind) && (!roomType || r.roomTypeId === roomType) && (showClosed || !['cancelled', 'no_show'].includes(r.status))
      && (!needle || [r.code, r.customer, r.petNames, r.breeds, r.room, r.mobile, r.notes].some((s) => s.toLowerCase().includes(needle))));
  }, [rows, status, kind, roomType, showClosed, q]);
  const dayRows = useMemo(() => filtered.filter((r) => bucketOf(r, day) !== 'other'), [filtered, day]);
  const upcoming = useMemo(() => filtered.filter((r) => r.dayOut >= day || showClosed).sort((a, b) => a.checkIn.localeCompare(b.checkIn)), [filtered, day, showClosed]);
  const open = (r: ReservationRow) => (r.kind === 'hotel' ? nav(`/desk/reservations/${r.id}`) : setDaycare(r));
  const activeFilters = (status ? 1 : 0) + (kind ? 1 : 0) + (roomType ? 1 : 0) + (showClosed ? 1 : 0) + (q.trim() ? 1 : 0);
  const clearFilters = () => { setStatus(''); setKind(''); setRoomType(''); setShowClosed(false); setQ(''); };

  return (
    <div className="fdr-page">
      <h1 className="sr-only">Hotel & Daycare reservations · {location.name}</h1>
      <div className="fdr-topline">
        <ViewSwitch value="table" />
        <Button icon="plus" onClick={() => nav('/desk/reservations/new')} className="fdr-cta">Hotel Reservation</Button>
      </div>

      {loading && rows.length === 0 && <EmptyState title="Loading reservations" compact />}
      <DataTable<ReservationRow> framed selectable title={mode === 'day' ? 'Hotel Reservations' : 'All upcoming reservations'} columns={RESERVATION_COLUMNS_FLAT} rows={mode === 'day' ? dayRows : upcoming} rowKey={(r) => r.id} onRowClick={open} pageSize={100}
        emptyText={mode === 'day' ? `No reservations on ${fmtDate(day)}` : 'No upcoming reservations'}
        groupBy={mode === 'day' ? { key: (r) => bucketOf(r, day), label: (k) => BUCKET_LABEL[k as Bucket] ?? k, order: GROUPS, showEmpty: true, emptyText: (k) => `Nobody ${(BUCKET_LABEL[k as Bucket] ?? k).toLowerCase()} on ${fmtDate(day)}.`, defaultCollapsed: ['checked_out'] } : undefined}
        toolbar={<>
          <ReservationDayNav size="sm" value={day} onChange={(d) => { setDay(d); setMode('day'); }} />
          <FilterPopover count={activeFilters} onClear={clearFilters}>
            <Input size="sm" icon="search" label="Search" placeholder="Customer, pet, room, phone, notes" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select size="sm" label="Status" placeholder="Any status" value={status} onChange={(e) => setStatus(e.target.value)} options={BOOKING_STATUSES.map((s) => ({ value: s, label: BOOKING_STATUS_LABEL[s] }))} />
            <Select size="sm" label="Kind" placeholder="Hotel + daycare" value={kind} onChange={(e) => setKind(e.target.value)} options={[{ value: 'hotel', label: 'Hotel only' }, { value: 'daycare', label: 'Daycare only' }]} />
            <Select size="sm" label="Room type" placeholder="Any room type" value={roomType} onChange={(e) => setRoomType(e.target.value)} options={roomTypes.map((t) => ({ value: t.id, label: t.name }))} />
            <Toggle size="sm" checked={showClosed} onChange={setShowClosed} label="Show cancelled / no show" />
          </FilterPopover>
          <Button variant="outline" size="sm" onClick={() => setMode((m) => (m === 'day' ? 'all' : 'day'))} aria-pressed={mode === 'all'}>{mode === 'day' ? 'See All' : 'By day'}</Button>
        </>}
        rowActions={(r) => <span><IconButton icon="eye" label="Open" size="sm" onClick={() => open(r)} />{r.kind === 'hotel' && <IconButton icon="edit" label="Edit" size="sm" onClick={() => nav(`/desk/reservations/${r.id}/edit`)} />}</span>} />

      <Drawer open={!!daycare} onClose={() => setDaycare(null)} title={daycare ? `${daycare.code} · Daycare` : ''} footer={<Button variant="secondary" onClick={() => setDaycare(null)}>Close</Button>}>
        {daycare && (
          <div className="stack">
            <div className="row wrap"><StatusBadge status={daycare.status} /><span className="muted small">{daycare.room}</span></div>
            <BookingInfoGrid columns={2} items={[{ label: 'Customer', value: daycare.customer }, { label: 'Mobile', value: daycare.mobile }, { label: 'Date', value: fmtDate(daycare.dayIn) }, { label: 'Time', value: `${daycare.timeIn} – ${daycare.timeOut}` }, { label: 'Total', value: fmtMoney(daycare.total) }, { label: 'Payment', value: daycare.paymentStatus, tone: daycare.paymentStatus === 'paid' ? 'success' : 'warn' }]} />
            <div className="stack-sm">{daycare.pets.map((p) => <div key={p.id} className="fdr-pet"><div /><div><div className="fdr-pet-name">{p.name}</div><div className="fdr-pet-meta">{p.breed} · {p.weight_lbs} lb</div><PetVaccineStatus summary={daycare.vaccines[p.id]} /></div></div>)}</div>
            <p className="xs muted">Daycare check-in / check-out and pricing live in the Daycare module (F-40s).</p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
