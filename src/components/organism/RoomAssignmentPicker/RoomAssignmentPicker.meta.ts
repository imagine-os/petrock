import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { RoomAssignmentPicker } from './RoomAssignmentPicker';
import type { BookingRow, RoomRow, RoomTypeRow } from '../../../data/schema/core';
import { toIso } from '../../molecule/DatePicker/DatePicker';

const base = { created_at: '', updated_at: '' };
const rt: RoomTypeRow[] = [{ ...base, id: 'rt_penthouse', name: 'Penthouse', key: 'penthouse', description: null, max_weight_lbs: null, sort_order: 0 }];
const rooms: RoomRow[] = Array.from({ length: 12 }, (_, i) => ({ ...base, id: `r${i}`, location_id: 'loc_encino', code: `PH(${i < 6 ? 'B' : 'T'}) ${101 + i}`, room_type_id: 'rt_penthouse', position: i < 6 ? 'bottom' : 'top', sort_order: i, active: true }));
const today = toIso(new Date()); const shift = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return toIso(d); };
const bookings = [{ ...base, id: 'bk1', code: 'PR-1001', room_id: 'r1', room_type_id: 'rt_penthouse', status: 'checked_in', check_in: `${shift(-1)}T17:00:00Z`, check_out: `${shift(2)}T18:00:00Z` }, { ...base, id: 'bk2', code: 'PR-1002', room_id: 'r7', room_type_id: 'rt_penthouse', status: 'confirmed', check_in: `${today}T17:00:00Z`, check_out: `${shift(1)}T18:00:00Z` }] as unknown as BookingRow[];

function Demo({ lbs }: { lbs: number }) { const [v, setV] = useState<string | null>(null); return h(RoomAssignmentPicker, { rooms, roomTypes: rt, bookings, roomTypeId: 'rt_penthouse', checkInDay: today, checkOutDay: shift(2), heaviestLbs: lbs, value: v, onChange: setV }); }

export default defineMeta({
  tier: 'organism', name: 'RoomAssignmentPicker', description: 'Room chooser for a stay: rooms of the booked type grouped by position, free or busy for the dates (R-X03), disabled when the heaviest dog does not fit the room (R-E09: over 30 lb only bottom penthouse rooms) and a warning when a 55 lb+ dog is booked into a penthouse (R-X01, requested).',
  props: [{ name: 'rooms / roomTypes / bookings', type: 'rows', required: true, description: 'Location rooms and live bookings' }, { name: 'roomTypeId', type: 'string', required: true, description: 'Booked type' }, { name: 'checkInDay / checkOutDay', type: 'YYYY-MM-DD', required: true, description: 'Stay dates' }, { name: 'heaviestLbs', type: 'number', required: true, description: 'Heaviest dog for fit rules' }, { name: 'value / onChange', type: 'string | null', required: true, description: 'Selected room' }, { name: 'excludeBookingId', type: 'string', description: 'Editing this booking: its room is free' }, { name: 'allowNone', type: 'boolean', default: 'true', description: 'Show "Assign later"' }],
  states: ['free', 'busy', 'no fit', 'selected', 'suite warning', 'no rooms'],
  usages: [{ title: '22 lb dog: every free room fits', render: () => h(Demo, { lbs: 22 }) }, { title: '64 lb dog: top rooms disabled, suite warning', render: () => h(Demo, { lbs: 64 }) }],
  a11y: ['Room buttons are toggle buttons (aria-pressed) with the reason in their title when disabled.'],
  usedBy: ['F-11', 'F-12', 'F-13'], figma: ['Board Booking.pdf (Choose Room)', 'front desk-7.jpg (30 lb rule)'],
});
