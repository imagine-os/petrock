import { useMemo } from 'react';
import type { BookingRow, RoomRow, RoomTypeRow } from '../../../data/schema/core';
import { availabilityByType, roomFits, staysOverlap, suiteRuleWarning, ACTIVE_STATUSES } from '../../../modules/frontdesk-reservations/lib/availability';
import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import './RoomAssignmentPicker.css';

export interface RoomAssignmentPickerProps {
  rooms: RoomRow[]; roomTypes: RoomTypeRow[]; bookings: BookingRow[];
  roomTypeId: string; checkInDay: string; checkOutDay: string;
  /** Heaviest dog on the stay, lbs (room fit rules). */
  heaviestLbs: number;
  value: string | null; onChange: (roomId: string | null) => void;
  /** The booking being edited (its own room counts as free). */
  excludeBookingId?: string | null;
  allowNone?: boolean;
}

/** Pick a physical room for a stay: rooms of the booked type grouped by position, free / busy for the dates (R-X03), disabled when the heaviest dog does not fit (R-E09), suite warning (R-X01). */
export function RoomAssignmentPicker({ rooms, roomTypes, bookings, roomTypeId, checkInDay, checkOutDay, heaviestLbs, value, onChange, excludeBookingId, allowNone = true }: RoomAssignmentPickerProps) {
  const rt = roomTypes.find((r) => r.id === roomTypeId);
  const avail = useMemo(() => availabilityByType({ rooms, roomTypes, bookings, checkInDay, checkOutDay, excludeBookingId }).find((a) => a.roomType.id === roomTypeId), [rooms, roomTypes, bookings, checkInDay, checkOutDay, excludeBookingId, roomTypeId]);
  const typeRooms = rooms.filter((r) => r.room_type_id === roomTypeId && r.active !== false).sort((a, b) => a.sort_order - b.sort_order);
  const busyBy = (roomId: string) => bookings.find((b) => b.room_id === roomId && b.id !== excludeBookingId && ACTIVE_STATUSES.includes(b.status) && staysOverlap(b, checkInDay, checkOutDay));
  const groups = [...new Set(typeRooms.map((r) => r.position ?? 'all'))].map((pos) => ({ pos, rooms: typeRooms.filter((r) => (r.position ?? 'all') === pos) }));
  const warn = suiteRuleWarning(rt, heaviestLbs);
  return (
    <div className="roompick">
      <div className="roompick-summary row wrap">
        <Badge tone={avail && avail.free > 0 ? 'success' : 'danger'}>{avail?.free ?? 0} of {avail?.total ?? 0} {rt?.name ?? 'rooms'} free</Badge>
        {avail && avail.unassigned > 0 && <span className="xs muted">{avail.unassigned} booked without a room yet</span>}
        {heaviestLbs > 0 && <span className="xs muted">Heaviest dog {heaviestLbs} lb</span>}
        {warn && <span className="xs tone-warn row" style={{ gap: 4 }}><Icon name="warning" size={13} />{warn}</span>}
      </div>
      {groups.map((g) => (
        <div key={g.pos} className="roompick-group">
          {g.pos !== 'all' && <div className="roompick-grouplabel eyebrow">{g.pos === 'bottom' ? 'Bottom rooms · fit dogs over 30 lb' : 'Top rooms · up to 30 lb'}</div>}
          <div className="roompick-grid">
            {g.rooms.map((r) => {
              const busy = busyBy(r.id); const fit = roomFits(r, rt, heaviestLbs); const selected = value === r.id;
              const disabled = !fit.ok || (!!busy && !selected);
              return (
                <button key={r.id} type="button" className={`roompick-room ${selected ? 'is-selected' : ''} ${busy ? 'is-busy' : ''} ${!fit.ok ? 'is-nofit' : ''}`} disabled={disabled} onClick={() => onChange(selected ? null : r.id)} title={!fit.ok ? fit.reason : busy ? `Busy: ${busy.code}` : 'Free'} aria-pressed={selected}>
                  <span className="roompick-code">{r.code}</span>
                  <span className="roompick-state xs">{!fit.ok ? 'No fit' : busy ? busy.code : 'Free'}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {typeRooms.length === 0 && <p className="muted small">No rooms of this type at this location.</p>}
      {allowNone && <button type="button" className={`roompick-none ${value == null ? 'is-selected' : ''}`} onClick={() => onChange(null)}>Assign later</button>}
    </div>
  );
}
