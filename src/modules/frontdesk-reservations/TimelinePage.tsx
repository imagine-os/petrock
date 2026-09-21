import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../tenant/LocationProvider';
import { ReservationDayNav } from '../../components/molecule/ReservationDayNav/ReservationDayNav';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { Select } from '../../components/atom/Select/Select';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Button } from '../../components/atom/Button/Button';
import { FilterPopover } from '../../components/molecule/FilterPopover/FilterPopover';
import { Badge, StatusBadge } from '../../components/atom/Badge/Badge';
import { Modal } from '../../components/organism/Modal/Modal';
import { RoomTimeline, type TimelineBlock, type TimelineGroup } from '../../components/organism/RoomTimeline/RoomTimeline';
import { PetVaccineStatus } from '../../components/molecule/PetVaccineStatus/PetVaccineStatus';
import { BookingStatusMenu } from '../../components/molecule/BookingStatusMenu/BookingStatusMenu';
import { useToast } from '../../components/molecule/Toast/Toast';
import { fmtMoney } from '../../pricing/engine';
import { BOOKING_STATUSES, BOOKING_STATUS_LABEL, type BookingStatus } from '../../domain/booking';
import { useReservationRows, type ReservationRow } from './lib/reservations';
import { addDaysIso, combine, diffDays, fmtDate, hhmmOf, todayIso, weekStart } from './lib/dates';
import { roomFits, staysOverlap, ACTIVE_STATUSES } from './lib/availability';
import { useBookingActions } from './lib/useBookingActions';
import { RoomPickModal } from './lib/RoomPickModal';
import { useT } from '../../i18n';
import { ViewSwitch } from './ReservationsTablePage';
import type { RoomRow } from '../../data/schema/core';
import './frontdesk-reservations.css';

const UNASSIGNED = '__unassigned';
const DC_ROWS = [{ id: 'dc_full_day', label: 'Full day' }, { id: 'dc_half_day', label: 'Half day' }, { id: 'dc_hour', label: 'Play hour' }];
/** Two letters so the room code always stays readable in the 132-168 px label column. */
const TYPE_ABBR: Record<string, string> = { penthouse: 'PH', suite: 'ST', daycare: 'DC' };
const abbr = (rt: { key?: string | null; name: string }) => TYPE_ABBR[rt.key ?? ''] ?? rt.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase();

/** F-13 - rooms × days with stays as blocks (D-008), laid out per `all reservation grooming.jpg`: New Booking top-right, range pill centred, span + Filter popover right, then the grid (legend removed; the status is in the block popover). */
export function TimelinePage() {
  const nav = useNavigate();
  const t = useT();
  const { toast } = useToast();
  const { location } = useLocation();
  const { rows, bookings, rooms, roomTypes } = useReservationRows();
  const actions = useBookingActions();
  const today = todayIso();
  const [start, setStart] = useState(weekStart(today));
  const [span, setSpan] = useState<'7' | '14'>('14');
  const [roomType, setRoomType] = useState('');
  const [status, setStatus] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const [showDaycare, setShowDaycare] = useState(true);
  const [showUnassigned, setShowUnassigned] = useState(true);
  const [move, setMove] = useState<{ row: ReservationRow; room: RoomRow | null; dayIn: string; dayOut: string } | null>(null);
  const [roomFor, setRoomFor] = useState<{ row: ReservationRow; checkIn: boolean } | null>(null);
  const days = Number(span);

  const groups = useMemo<TimelineGroup[]>(() => {
    const g: TimelineGroup[] = [];
    if (showUnassigned) g.push({ key: 'unassigned', label: 'Unassigned', countTitle: 'stays in view', rows: [{ id: UNASSIGNED, label: 'No room', sub: 'assign from the popover' }] });
    for (const rt of roomTypes.slice().sort((a, b) => a.sort_order - b.sort_order)) {
      if (roomType && rt.id !== roomType) continue;
      const rs = rooms.filter((r) => r.room_type_id === rt.id && r.active !== false).sort((a, b) => a.sort_order - b.sort_order);
      g.push({ key: rt.id, label: `${rt.name}s (${rs.length})`, countTitle: 'stays in view', rows: rs.map((r) => ({ id: r.id, label: r.code, badge: abbr(rt), sub: [rt.name, r.position === 'bottom' ? 'bottom · any weight' : r.position === 'top' ? 'top · ≤30 lb' : ''].filter(Boolean).join(' · ') })) });
    }
    if (showDaycare && !roomType) g.push({ key: 'daycare', label: 'Daycare', countTitle: 'bookings in view', rows: DC_ROWS.map((r) => ({ ...r, badge: 'DC' })) });
    return g;
  }, [rooms, roomTypes, roomType, showDaycare, showUnassigned]);

  const blocks = useMemo<TimelineBlock[]>(() => rows.filter((r) => (showClosed || !['cancelled', 'no_show'].includes(r.status)) && (!status || r.status === status) && (!roomType || r.roomTypeId === roomType || r.kind === 'daycare')).map((r) => ({
    id: r.id, rowId: r.kind === 'daycare' ? `dc_${r.daycare?.item ?? 'full_day'}` : r.roomId ?? UNASSIGNED, startDay: r.dayIn, endDay: r.dayOut, label: r.petNames || r.customer, sub: r.petNames ? r.customer : undefined, status: r.status, draggable: r.kind === 'hotel',
    flags: [...(!r.vaccineOk ? ['vaccine' as const] : []), ...(r.balance > 0 && r.status !== 'cancelled' ? ['unpaid' as const] : []), ...(r.notes ? ['note' as const] : [])],
  })), [rows, showClosed, status, roomType]);
  const byId = useMemo(() => Object.fromEntries(rows.map((r) => [r.id, r])), [rows]);

  const onMove = (block: TimelineBlock, rowId: string, day: string) => {
    const r = byId[block.id]; const b = r?.booking; if (!b) return;
    const nights = Math.max(1, diffDays(r.dayIn, r.dayOut));
    const dayIn = day, dayOut = addDaysIso(day, nights);
    if (rowId.startsWith('dc_')) { toast({ tone: 'danger', title: 'Hotel stays cannot be dropped on daycare rows' }); return; }
    if (b.status === 'checked_in' && dayIn !== r.dayIn) { toast({ tone: 'danger', title: 'Checked-in stays keep their dates (R-X05)', body: 'Drop on the same day to change the room.' }); return; }
    if (b.status === 'checked_out' || b.status === 'cancelled' || b.status === 'no_show') { toast({ tone: 'danger', title: `${BOOKING_STATUS_LABEL[b.status as BookingStatus]} stays cannot move` }); return; }
    const room = rowId === UNASSIGNED ? null : rooms.find((x) => x.id === rowId) ?? null;
    if (room) {
      if (room.room_type_id !== b.room_type_id) { toast({ tone: 'danger', title: `${room.code} is a ${roomTypes.find((t) => t.id === room.room_type_id)?.name}; ${b.code} is booked as ${r.roomType}` }); return; }
      const fit = roomFits(room, roomTypes.find((t) => t.id === room.room_type_id), r.heaviestLbs); if (!fit.ok) { toast({ tone: 'danger', title: `${room.code}: ${fit.reason}` }); return; }
      const clash = bookings.find((x) => x.id !== b.id && x.room_id === room.id && ACTIVE_STATUSES.includes(x.status) && staysOverlap(x, dayIn, dayOut));
      if (clash) { toast({ tone: 'danger', title: `${room.code} is taken by ${clash.code} on those nights` }); return; }
    }
    if (rowId === (r.roomId ?? UNASSIGNED) && dayIn === r.dayIn) return;
    setMove({ row: r, room, dayIn, dayOut });
  };
  const confirmMove = async () => {
    if (!move?.row.booking) return;
    const b = move.row.booking;
    await actions.moveStay(b, move.room?.id ?? null, move.room?.code ?? 'no room', combine(move.dayIn, hhmmOf(b.check_in)), combine(move.dayOut, hhmmOf(b.check_out)));
    setMove(null);
  };

  return (
    <div className="fdr-page">
      <h1 className="sr-only">Room timeline · {location.name} · {rooms.length} rooms · {blocks.length} stays in the filter</h1>
      <div className="fdr-topline">
        <ViewSwitch value="timeline" />
        <Button icon="plus" onClick={() => nav('/desk/reservations/new')} className="fdr-cta">New Booking</Button>
      </div>
      <div className="fdr-tl-bar">
        <span />
        <ReservationDayNav value={start} onChange={setStart} step={7} rangeDays={days} />
        <div>
          <SegmentedControl size="sm" ariaLabel="Span" value={span} onChange={setSpan} options={[{ value: '7', label: '1 week' }, { value: '14', label: '2 weeks' }]} />
          <FilterPopover label="Filter" count={(roomType ? 1 : 0) + (status ? 1 : 0) + (showClosed ? 1 : 0) + (showDaycare ? 0 : 1) + (showUnassigned ? 0 : 1)} onClear={() => { setRoomType(''); setStatus(''); setShowClosed(false); setShowDaycare(true); setShowUnassigned(true); }}>
            <Select size="sm" label="Room type" placeholder="All room types" value={roomType} onChange={(e) => setRoomType(e.target.value)} options={roomTypes.map((t) => ({ value: t.id, label: t.name }))} />
            <Select size="sm" label="Status" placeholder="Any status" value={status} onChange={(e) => setStatus(e.target.value)} options={BOOKING_STATUSES.map((s) => ({ value: s, label: BOOKING_STATUS_LABEL[s] }))} />
            <Toggle size="sm" checked={showUnassigned} onChange={setShowUnassigned} label="Unassigned row" />
            <Toggle size="sm" checked={showDaycare} onChange={setShowDaycare} label="Daycare rows" />
            <Toggle size="sm" checked={showClosed} onChange={setShowClosed} label="Cancelled / no show" />
            <p className="xs muted" style={{ margin: 0 }}>Bars show pet · customer with flags for vaccine, balance due and notes. Drag a bar or use the popover to move it; click an empty cell to book that room.</p>
          </FilterPopover>
        </div>
      </div>

      <RoomTimeline groups={groups} blocks={blocks} startDay={start} days={days} today={today} onBlockMove={onMove}
        labels={{ corner: t('frontdesk-reservations.allRooms'), today: t('frontdesk-reservations.todayPill'), close: t('frontdesk-reservations.close'), empty: t('frontdesk-reservations.noRooms'), grid: t('frontdesk-reservations.roomTimeline') }}
        onCellClick={(rowId, day) => { if (rowId === UNASSIGNED || rowId.startsWith('dc_')) return; const room = rooms.find((r) => r.id === rowId); if (!room) return; nav(`/desk/reservations/new?checkIn=${day}&checkOut=${addDaysIso(day, 1)}&roomType=${room.room_type_id}&room=${room.id}`); }}
        renderDetail={(block, close) => { const r = byId[block.id]; if (!r) return null; return (
          <div className="fdr-pop-body">
            <div className="row wrap" style={{ gap: 6 }}><strong>{r.code}</strong><StatusBadge status={r.status} size="sm" />{r.kind === 'daycare' && <Badge size="sm" tone="info">daycare</Badge>}</div>
            <dl className="fdr-kv">
              <dt>Customer</dt><dd>{r.customer} · {r.mobile}</dd>
              <dt>Dates</dt><dd>{fmtDate(r.dayIn)} {r.timeIn} → {fmtDate(r.dayOut)} {r.timeOut}{r.kind === 'hotel' ? ` · ${r.nights} night${r.nights === 1 ? '' : 's'}` : ''}</dd>
              <dt>Room</dt><dd>{r.room}{r.kind === 'hotel' ? ` · ${r.roomType}` : ''}</dd>
              <dt>Pets</dt><dd>{r.pets.map((p) => `${p.name} (${p.breed}, ${p.sex === 'male' ? 'M' : 'F'}${p.neutered ? ', fixed' : ''})`).join('; ') || '—'}</dd>
              <dt>Balance</dt><dd className={r.balance > 0 ? 'tone-warn' : 'tone-success'}>{fmtMoney(r.balance)} of {fmtMoney(r.total)}</dd>
            </dl>
            <div className="row wrap" style={{ gap: 4 }}>{r.pets.map((p) => <PetVaccineStatus key={p.id} compact summary={r.vaccines[p.id]} petName={p.name} />)}</div>
            {r.notes && <p className="xs muted" style={{ fontStyle: 'italic' }}>{r.notes}</p>}
            {r.kind === 'hotel' && r.booking && (
              <div className="fdr-inline-actions" style={{ justifyContent: 'flex-start' }}>
                <Button size="sm" onClick={() => nav(`/desk/reservations/${r.id}`)}>Open</Button>
                <Button size="sm" variant="secondary" icon="bed" onClick={() => { close(); setRoomFor({ row: r, checkIn: false }); }}>{r.roomId ? 'Change room' : 'Assign room'}</Button>
                <BookingStatusMenu status={r.status} align="left" onSelect={(to) => { close(); if (to === 'checked_in' && !r.roomId) { setRoomFor({ row: r, checkIn: true }); return; } actions.changeStatus(r.booking!, to); }} />
              </div>
            )}
            {r.kind === 'daycare' && <Button size="sm" variant="secondary" onClick={() => nav('/desk/reservations')}>Open in table</Button>}
          </div>
        ); }} />

      <Modal open={!!move} onClose={() => setMove(null)} title={move ? `Move ${move.row.code}` : ''} size="sm" footer={<><Button variant="secondary" onClick={() => setMove(null)}>Cancel</Button><Button icon="check" onClick={confirmMove}>Move stay</Button></>}>
        {move && <div className="stack-sm small">
          <p><strong>{move.row.customer}</strong> · {move.row.petNames}</p>
          <dl className="fdr-kv"><dt>From</dt><dd>{move.row.room} · {fmtDate(move.row.dayIn)} → {fmtDate(move.row.dayOut)}</dd><dt>To</dt><dd>{move.room?.code ?? 'No room'} · {fmtDate(move.dayIn)} → {fmtDate(move.dayOut)}</dd></dl>
          <p className="xs muted">Nights stay the same (R-X07); the rate is not re-quoted here - edit the booking to re-price a date change.</p>
        </div>}
      </Modal>
      {roomFor?.row.booking && <RoomPickModal booking={roomFor.row.booking} rooms={rooms} roomTypes={roomTypes} bookings={bookings} heaviestLbs={roomFor.row.heaviestLbs} title={roomFor.checkIn ? `Check in ${roomFor.row.code}` : undefined} confirmLabel={roomFor.checkIn ? 'Assign & check in' : 'Assign room'} onClose={() => setRoomFor(null)} onPick={(roomId, code) => { const { row, checkIn } = roomFor; setRoomFor(null); if (checkIn) actions.changeStatus(row.booking!, 'checked_in', { roomId }); else void actions.assignRoom(row.booking!, roomId, code); }} />}
      {actions.modal}
    </div>
  );
}
