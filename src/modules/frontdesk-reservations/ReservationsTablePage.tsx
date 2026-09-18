import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../tenant/LocationProvider';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { ReservationDayNav } from '../../components/molecule/ReservationDayNav/ReservationDayNav';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { Section } from '../../components/molecule/Section/Section';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
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
import { RESERVATION_COLUMNS } from './lib/columns';
import { fmtDate, fmtDay, todayIso } from './lib/dates';
import './frontdesk-reservations.css';

export type ViewKey = 'table' | 'timeline' | 'board';
export const VIEW_PATH: Record<ViewKey, string> = { table: '/desk/reservations', timeline: '/desk/reservations/timeline', board: '/desk/reservations/board' };
/** Table / Timeline / Board switch shared by F-10, F-13, F-14 (D-008). */
export function ViewSwitch({ value }: { value: ViewKey }) {
  const nav = useNavigate();
  return <SegmentedControl size="sm" ariaLabel="View" value={value} onChange={(v) => nav(VIEW_PATH[v])} options={[{ value: 'table', label: 'Table', icon: 'table' }, { value: 'timeline', label: 'Timeline', icon: 'calendar' }, { value: 'board', label: 'Board', icon: 'grid' }]} />;
}

const GROUPS: Bucket[] = ['arriving', 'departing', 'staying', 'daycare', 'checked_out'];

/** F-10 - the reservations table of the design, grouped by day bucket, 18 columns. */
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
  const grouped = useMemo(() => GROUPS.map((b) => ({ b, rows: filtered.filter((r) => bucketOf(r, day) === b) })), [filtered, day]);
  const upcoming = useMemo(() => filtered.filter((r) => r.dayOut >= day || showClosed).sort((a, b) => a.checkIn.localeCompare(b.checkIn)), [filtered, day, showClosed]);
  const open = (r: ReservationRow) => (r.kind === 'hotel' ? nav(`/desk/reservations/${r.id}`) : setDaycare(r));
  const table = (list: ReservationRow[], empty: string) => (
    <DataTable<ReservationRow> columns={RESERVATION_COLUMNS} rows={list} rowKey={(r) => r.id} dense onRowClick={open} emptyText={empty} pageSize={100}
      rowActions={(r) => <span><IconButton icon="eye" label="Open" size="sm" onClick={() => open(r)} />{r.kind === 'hotel' && <IconButton icon="edit" label="Edit" size="sm" onClick={() => nav(`/desk/reservations/${r.id}/edit`)} />}</span>} />
  );

  return (
    <div className="fdr-page">
      <PageHeader title="Hotel & Daycare reservations" subtitle={`${location.name} · ${mode === 'day' ? fmtDay(day) : 'all upcoming'} · ${filtered.length} of ${rows.length} reservations`} code="F-10"
        actions={<div className="fdr-toolbar"><ViewSwitch value="table" /><ReservationDayNav value={day} onChange={(d) => { setDay(d); setMode('day'); }} /><Button icon="plus" onClick={() => nav('/desk/reservations/new')}>Hotel reservation</Button></div>}>
        <div className="fdr-toolbar">
          <Input size="sm" icon="search" placeholder="Search customer, pet, room, phone, notes" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search reservations" className="grow" />
          <Select size="sm" aria-label="Status" placeholder="Any status" value={status} onChange={(e) => setStatus(e.target.value)} options={BOOKING_STATUSES.map((s) => ({ value: s, label: BOOKING_STATUS_LABEL[s] }))} />
          <Select size="sm" aria-label="Kind" placeholder="Hotel + daycare" value={kind} onChange={(e) => setKind(e.target.value)} options={[{ value: 'hotel', label: 'Hotel only' }, { value: 'daycare', label: 'Daycare only' }]} />
          <Select size="sm" aria-label="Room type" placeholder="Any room type" value={roomType} onChange={(e) => setRoomType(e.target.value)} options={roomTypes.map((t) => ({ value: t.id, label: t.name }))} />
          <Toggle size="sm" checked={showClosed} onChange={setShowClosed} label="Cancelled / no show" />
        </div>
      </PageHeader>

      <Tabs items={[{ key: 'day', label: 'By day', count: grouped.reduce((s, g) => s + g.rows.length, 0) }, { key: 'all', label: 'All upcoming', count: upcoming.length }]} value={mode} onChange={setMode} ariaLabel="Mode" />

      {loading && rows.length === 0 && <EmptyState title="Loading reservations" compact />}
      {mode === 'day' ? grouped.map((g) => (
        <Section key={g.b} title={`${BUCKET_LABEL[g.b]} (${g.rows.length})`} collapsible defaultOpen={g.rows.length > 0 || g.b === 'arriving'} className={g.rows.length === 0 ? 'is-empty' : ''}
          description={g.b === 'arriving' ? 'Check-in on the selected day' : g.b === 'departing' ? 'Check-out on the selected day' : g.b === 'staying' ? 'In house, arrived before and leaving after' : g.b === 'daycare' ? 'Daycare days on the selected day' : 'Checked out on the selected day'}>
          {g.rows.length ? table(g.rows, 'No rows') : <p className="muted small fdr-group-empty">Nobody {BUCKET_LABEL[g.b].toLowerCase()} on {fmtDate(day)}.</p>}
        </Section>
      )) : (
        <Section title={`All upcoming (${upcoming.length})`} description="Every reservation ending on or after the selected day, sorted by check-in.">{table(upcoming, 'No upcoming reservations')}</Section>
      )}

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
