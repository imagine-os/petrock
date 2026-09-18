import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { RoomTimeline, type TimelineBlock, type TimelineGroup } from './RoomTimeline';
import { toIso } from '../../molecule/DatePicker/DatePicker';

const shift = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return toIso(d); };
const groups: TimelineGroup[] = [
  { key: 'ph', label: 'Penthouses', rows: [{ id: 'ph1', label: 'PH(B) 101', sub: 'bottom' }, { id: 'ph2', label: 'PH(B) 102', sub: 'bottom' }, { id: 'ph7', label: 'PH(T) 107', sub: 'top · ≤30 lb' }] },
  { key: 'su', label: 'Suites', rows: [{ id: 's1', label: 'Suite A1' }, { id: 's2', label: 'Suite A2' }] },
];
const initial: TimelineBlock[] = [
  { id: 'b1', rowId: 'ph1', startDay: shift(-2), endDay: shift(1), label: 'Thompson · Biscuit, Mochi', status: 'checked_in', flags: ['medication'] },
  { id: 'b2', rowId: 'ph2', startDay: shift(1), endDay: shift(4), label: 'Okafor · Pepper', status: 'confirmed', flags: ['unpaid'] },
  { id: 'b3', rowId: 'ph7', startDay: shift(0), endDay: shift(2), label: 'Goldberg · Olive', status: 'pending_vaccines', flags: ['vaccine'] },
  { id: 'b4', rowId: 's1', startDay: shift(-6), endDay: shift(-1), label: 'Kim · Max', status: 'checked_out' },
  { id: 'b5', rowId: 's1', startDay: shift(2), endDay: shift(3), label: 'Patel · Bear', status: 'requested', flags: ['note'] },
  { id: 'b6', rowId: 's2', startDay: shift(3), endDay: shift(9), label: 'Nakamura · Daisy, Apollo', status: 'cancelled' },
];

function Demo() {
  const [blocks, setBlocks] = useState(initial);
  return h(RoomTimeline, { groups, blocks, startDay: shift(-7 + 7 - new Date().getDay() - 7), days: 14, today: toIso(new Date()), dayMinWidth: 48,
    onBlockMove: (b, rowId, day) => { const n = Math.max(1, Math.round((new Date(b.endDay).getTime() - new Date(b.startDay).getTime()) / 86400000)); const end = new Date(day + 'T00:00:00'); end.setDate(end.getDate() + n); setBlocks((xs) => xs.map((x) => (x.id === b.id ? { ...x, rowId, startDay: day, endDay: toIso(end) } : x))); },
    renderDetail: (b) => h('div', { className: 'stack-sm' }, h('strong', null, b.label), h('span', { className: 'xs muted' }, `${b.startDay} → ${b.endDay} · ${b.status}`)) });
}

export default defineMeta({
  tier: 'organism', name: 'RoomTimeline', description: 'Rooms × days Gantt for hotel stays, designed fresh per D-008 around the Figma "Boarding Timeline View": week and day headers (weekends green, TODAY tag and marker line), collapsible room groups, stay blocks from the check-in half-day to the check-out half-day coloured by status (R-I09), red flags for vaccine / balance / notes / medication, lanes for overlaps, drag-and-drop moves and a detail popover. Scrolls horizontally with a sticky room column on phones.',
  props: [{ name: 'groups', type: 'TimelineGroup[]', required: true, description: 'Room groups (Penthouses, Suites, Daycare) with rows' }, { name: 'blocks', type: 'TimelineBlock[]', required: true, description: 'Stays: rowId, startDay, endDay (exclusive), label, status, flags' }, { name: 'startDay / days', type: 'string / number', required: true, description: 'Visible window' }, { name: 'today', type: 'string', description: 'Marker day' }, { name: 'onBlockMove', type: '(block, rowId, day) => void', description: 'Enables drag-and-drop' }, { name: 'onCellClick', type: '(rowId, day) => void', description: 'Empty cell click (new booking)' }, { name: 'renderDetail', type: '(block, close) => ReactNode', description: 'Popover content on block click' }, { name: 'dayMinWidth', type: 'number', default: '56', description: 'Phone column width' }],
  states: ['default', 'today in view', 'block selected / popover', 'dragging over a cell', 'clipped blocks at the window edges', 'group collapsed', 'empty'],
  usages: [{ title: 'Two weeks, drag a block to another room', render: () => h(Demo) }],
  a11y: ['Grid roles (grid, row, rowheader, columnheader, gridcell); blocks are buttons with a full title; popover is a dialog closed by Escape / outside click; drag has a click alternative (Set status / Move in the popover).'],
  usedBy: ['F-13'], figma: ['all reservation grooming-1.jpg', 'all reservation grooming-2.jpg', 'all reservation grooming.jpg'],
});
