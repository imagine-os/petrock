import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomDayGrid, type GroomDayGridColumn } from './GroomDayGrid';

const day = new Date().toISOString().slice(0, 10);
const at = (hm: string) => { const [hh, mm] = hm.split(':').map(Number); const d = new Date(`${day}T12:00:00`); d.setHours(hh, mm, 0, 0); return d.toISOString(); };
function Demo() {
  const [cols, setCols] = useState<GroomDayGridColumn[]>([{ id: 'a', name: 'Itzel Diaz', color: '#F4D06F', hours: { open: '08:00', close: '15:00' } }, { id: 'b', name: 'Jessica Guzman', color: '#7B7BE8', hours: { open: '09:00', close: '17:00' } }, { id: 'c', name: 'Nasim', color: '#8A9BB8', hours: null }]);
  const items = [{ id: '1', columnId: 'a', startsAt: at('10:00'), durationMin: 90, label: 'Wong, TEDDY; Cairn Terrier; Diamond Groom Medium', status: 'confirmed' }, { id: '2', columnId: 'b', startsAt: at('12:00'), durationMin: 60, label: 'Ford, WOOKIE; Shih Tzu; Diamond Groom Medium', status: 'confirmed', flags: { vaccine: true } }, { id: '3', columnId: 'a', startsAt: at('12:00'), durationMin: 30, label: 'Kasher, MAX; Poodle (Miniature); Diamond Groom Small', status: 'requested', flags: { warning: true } }];
  return h(GroomDayGrid, { columns: cols, items, startHour: 8, endHour: 16, hourHeight: 52, capacity: 2,
    onMoveColumn: (id, dir) => setCols((c) => { const i = c.findIndex((x) => x.id === id); const j = i + dir; if (j < 0 || j >= c.length) return c; const n = [...c]; [n[i], n[j]] = [n[j], n[i]]; return n; }),
    onColorColumn: (id, color) => setCols((c) => c.map((x) => (x.id === id ? { ...x, color: color ?? '#C9C9D6' } : x))), onHideColumn: (id, hidden) => setCols((c) => c.map((x) => (x.id === id ? { ...x, hidden } : x))) });
}
export default defineMeta({
  tier: 'organism', name: 'GroomDayGrid', description: 'Grooming day view from Grooming.png: hourly rows x groomer columns tinted by working hours, appointment cards placed by start / duration, column menu (move left / right, change colour with swatches + picker, hide), capacity shading (R-G21), now line, drag to reschedule, click an empty slot to book. Horizontal scroll with sticky time column on phones (D-016).',
  props: [{ name: 'columns', type: 'GroomDayGridColumn[]', required: true, description: 'Groomers with colour, hidden flag and working hours' }, { name: 'items', type: 'GroomDayGridItem[]', required: true, description: 'Appointments (label, status, flags)' }, { name: 'startHour / endHour', type: 'number', default: '7 / 18', description: 'Grid range' }, { name: 'capacity', type: 'number', description: 'Shade rows over this many overlaps' }, { name: 'onItemClick', type: '(id) => void', description: 'Open appointment' }, { name: 'onMoveColumn / onColorColumn / onHideColumn', type: 'fn', description: 'Column menu (R-X62)' }, { name: 'onSlotClick', type: '(columnId, HH:MM) => void', description: 'Book into an empty slot' }, { name: 'onItemMove', type: '(id, columnId, HH:MM) => void', description: 'Drag and drop reschedule' }],
  states: ['default', 'column menu open', 'colour submenu', 'groomer off today (hatched)', 'over capacity row', 'unassigned column'],
  usages: [{ title: 'Three groomers', render: () => h(Demo) }],
  a11y: ['Cards are buttons; the column menu uses role=menu and disabled edges.', 'Colour swatches carry their hex as label; now-line and tints are decorative.'],
  usedBy: ['F-30'], figma: ['Grooming.png', 'Grooming-1.png'],
});
