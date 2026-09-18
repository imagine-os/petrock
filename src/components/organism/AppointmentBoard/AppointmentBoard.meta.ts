import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { AppointmentBoard, type BoardCard } from './AppointmentBoard';
import { Badge } from '../../atom/Badge/Badge';

const cols = [{ key: 'requested', label: 'Requested', tone: 'info' as const }, { key: 'confirmed', label: 'Confirmed', tone: 'success' as const }, { key: 'in_progress', label: 'In progress', tone: 'warn' as const }, { key: 'done', label: 'Done', tone: 'neutral' as const }, { key: 'cancelled', label: 'Cancelled / no show', tone: 'danger' as const, locked: true }];
const initial: BoardCard[] = [
  { id: '1', column: 'requested', time: '9:00 AM', title: 'Pepper · Border Collie', subtitle: 'Maya Okafor', meta: h(Badge, { size: 'sm' }, 'Gold · M'), accent: '#F4A261' },
  { id: '2', column: 'confirmed', time: '10:30 AM', title: 'Biscuit · Golden Retriever', subtitle: 'Avery Thompson', meta: h(Badge, { size: 'sm' }, 'Platinum · L'), flags: h(Badge, { size: 'sm', tone: 'danger' }, 'vaccine'), accent: '#552583' },
  { id: '3', column: 'in_progress', time: '11:00 AM', title: 'Luna · Pomeranian', subtitle: 'Diego Fernandez', meta: h(Badge, { size: 'sm' }, 'Diamond · S'), accent: '#2A9D8F' },
  { id: '4', column: 'done', time: '8:00 AM', title: 'Coco · Cockapoo', subtitle: 'Noah Patel', meta: h(Badge, { size: 'sm' }, 'Gold · S'), accent: '#552583' },
];
function Demo() { const [cards, setCards] = useState(initial); return h(AppointmentBoard, { columns: cols, cards, onMove: (c, to) => setCards((xs) => xs.map((x) => (x.id === c.id ? { ...x, column: to } : x))) }); }

export default defineMeta({
  tier: 'organism', name: 'AppointmentBoard', description: 'Kanban board of Grooming & Spa appointments by status (no Figma board exists; designed fresh per D-008). Cards show time, pet · breed, customer, package · size and flags, with the groomer colour as the left accent. Drag between columns to change status; a lock marks columns whose drop needs a manager PIN. Columns stack under 768 px.',
  props: [{ name: 'columns', type: 'BoardColumn[]', required: true, description: '{ key, label, tone?, locked?, hint? }' }, { name: 'cards', type: 'BoardCard[]', required: true, description: '{ id, column, title, subtitle?, time?, meta?, flags?, accent? }' }, { name: 'onMove', type: '(card, toColumn) => void', description: 'Enables drag-and-drop' }, { name: 'onCardClick', type: '(card) => void', description: 'Open the appointment' }, { name: 'selectedId', type: 'string', description: 'Highlighted card' }],
  states: ['default', 'column drag-over', 'card dragging', 'empty column', 'locked column', 'stacked (phone)'],
  usages: [{ title: 'Five columns, drag cards', render: () => h(Demo) }],
  a11y: ['Columns are list items with labels; cards are focusable and respond to Enter; the status menu on the appointment is the keyboard alternative to dragging.'],
  usedBy: ['F-14'], figma: ['Grooming.png (day view cards)', 'all reservation grooming-3.jpg (status colours)'],
});
