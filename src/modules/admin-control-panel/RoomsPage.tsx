/** A-12 Rooms & room types: physical rooms per location (code, type, position) and the room type catalog with fit rules. */
import { useMemo } from 'react';
import { useTable } from '../../data/DataContext';
import { useLocation } from '../../tenant/LocationProvider';
import type { RoomRow, RoomTypeRow, BookingRow, LocationRow } from '../../data/schema/core';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Badge } from '../../components/atom/Badge/Badge';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { CrudTable } from './CrudTable';
import { isoDay, staysOn } from './lib';
import './admin.css';

export function RoomsPage() {
  const { scope, locationId, allLocations, locations } = useLocation();
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: rooms } = useTable<RoomRow>('rooms', { where: scope });
  const { rows: bookings } = useTable<BookingRow>('bookings', { where: scope });
  const { rows: locs } = useTable<LocationRow>('locations');
  const rt = useMemo(() => Object.fromEntries(roomTypes.map((r) => [r.id, r])), [roomTypes]);
  const locName = useMemo(() => Object.fromEntries(locs.map((l) => [l.id, l.short_name])), [locs]);
  const today = isoDay(new Date());
  const occupiedRoomIds = useMemo(() => new Set(bookings.filter((b) => staysOn(b, today) && b.room_id).map((b) => b.room_id)), [bookings, today]);
  const active = rooms.filter((r) => r.active);
  return (
    <div className="page stack">
      <PageHeader code="A-12" title="Rooms & room types" subtitle={`Physical rooms ${allLocations ? 'across all locations' : `at ${locName[locationId] ?? 'this location'}`} and the room type catalog. Bottom penthouse rooms fit dogs over 30 lb (R-E09); 55 lb+ dogs need a Suite (R-X01, requested).`} />
      <div className="acp-kpis">
        <StatTile label="Rooms" value={active.length} icon="bed" hint={`${rooms.length - active.length} inactive`} />
        {roomTypes.map((t) => <StatTile key={t.id} label={t.name} value={active.filter((r) => r.room_type_id === t.id).length} hint={`${active.filter((r) => r.room_type_id === t.id && occupiedRoomIds.has(r.id)).length} occupied tonight`} />)}
        <StatTile label="Occupied tonight" value={occupiedRoomIds.size} icon="moon" />
      </div>
      <CrudTable<RoomRow> table="rooms" title="Rooms" description="Code as it appears on the timeline and the reservations table (e.g. PH(B) 101, Suite A7)." where={scope} orderBy={{ column: 'sort_order' }} permission="settings.write" rowLabel={(r) => r.code} searchable
        defaults={() => ({ location_id: locationId, active: true, position: null, sort_order: rooms.length } as Partial<RoomRow>)}
        filters={[{ key: 'type', label: 'Room type', options: roomTypes.map((t) => ({ value: t.id, label: t.name })), test: (r, v) => r.room_type_id === v }, { key: 'state', label: 'State', options: [{ value: 'occupied', label: 'Occupied tonight' }, { value: 'free', label: 'Free tonight' }, { value: 'inactive', label: 'Inactive' }], test: (r, v) => (v === 'inactive' ? !r.active : v === 'occupied' ? occupiedRoomIds.has(r.id) : r.active && !occupiedRoomIds.has(r.id)) }]}
        columns={[
          { key: 'code', label: 'Room', render: (r) => <strong>{r.code}</strong> },
          { key: 'room_type_id', label: 'Type', render: (r) => rt[r.room_type_id]?.name ?? r.room_type_id, value: (r) => rt[r.room_type_id]?.name },
          { key: 'position', label: 'Position', render: (r) => (r.position ? <Badge size="sm" tone={r.position === 'bottom' ? 'info' : 'neutral'}>{r.position}{r.position === 'bottom' ? ' · 30 lb+' : ''}</Badge> : <span className="faint">—</span>) },
          ...(allLocations ? [{ key: 'location_id', label: 'Location', render: (r: RoomRow) => locName[r.location_id ?? ''] ?? '—' }] : []),
          { key: 'tonight', label: 'Tonight', sortable: false, render: (r) => (!r.active ? <Badge size="sm">inactive</Badge> : occupiedRoomIds.has(r.id) ? <Badge size="sm" tone="primary">occupied</Badge> : <Badge size="sm" tone="success">free</Badge>) },
          { key: 'note', label: 'Note', hideOnCard: true, render: (r) => <span className="acp-note">{String(r.note ?? '')}</span> },
        ]}
        fields={[
          { key: 'code', label: 'Room code', required: true }, { key: 'room_type_id', label: 'Room type', type: 'select', required: true, options: roomTypes.map((t) => ({ value: t.id, label: t.name })) },
          { key: 'position', label: 'Position (penthouse)', type: 'select', options: [{ value: 'bottom', label: 'Bottom (fits 30 lb+)' }, { value: 'top', label: 'Top' }], placeholder: 'n/a', when: (v) => v.room_type_id === 'rt_penthouse' },
          ...(allLocations ? [{ key: 'location_id', label: 'Location', type: 'select' as const, required: true, options: locations.map((l) => ({ value: l.id, label: l.short_name })) }] : []),
          { key: 'sort_order', label: 'Order', type: 'number', min: 0 }, { key: 'note', label: 'Note', type: 'textarea', maxLength: 100 }, { key: 'active', label: 'Active', type: 'toggle' },
        ]} />
      <CrudTable<RoomTypeRow> table="room_types" title="Room types" description="Inclusions copy shown to customers and the optional max weight fit rule." orderBy={{ column: 'sort_order' }} permission="settings.write" rowLabel={(t) => t.name}
        columns={[{ key: 'name', label: 'Type', render: (t) => <strong>{t.name}</strong> }, { key: 'key', label: 'Key', mono: true }, { key: 'max_weight_lbs', label: 'Max weight', render: (t) => (t.max_weight_lbs ? `${t.max_weight_lbs} lb` : <span className="faint">no limit</span>) }, { key: 'description', label: 'Inclusions', hideOnCard: true, render: (t) => <span className="acp-note">{t.description}</span> }]}
        fields={[{ key: 'name', label: 'Name', required: true }, { key: 'key', label: 'Key', required: true, hint: 'penthouse | suite' }, { key: 'description', label: 'Inclusions', type: 'textarea', maxLength: 400 }, { key: 'max_weight_lbs', label: 'Max weight (lb)', type: 'number', min: 0, hint: 'Empty = any dog' }, { key: 'sort_order', label: 'Order', type: 'number', min: 0 }]}
        defaults={() => ({ sort_order: roomTypes.length, max_weight_lbs: null } as Partial<RoomTypeRow>)} />
    </div>
  );
}
