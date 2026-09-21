import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { AppointmentBoard, type BoardCard } from './AppointmentBoard';

const cols = [{ key: 'requested', label: 'Requested', tone: 'info' as const }, { key: 'confirmed', label: 'Confirmed', tone: 'success' as const }, { key: 'in_progress', label: 'In progress', tone: 'warn' as const }, { key: 'done', label: 'Done', tone: 'neutral' as const }, { key: 'cancelled', label: 'Cancelled / no show', tone: 'danger' as const, locked: true, collapsedByDefault: true }];
const initial: BoardCard[] = [
  { id: '1', column: 'requested', status: 'requested', time: '9:00 AM', assignee: 'Tamsin', assigneeColor: 'var(--groomer-4)', title: 'Pepper', titleMeta: 'Border Collie', subtitle: 'Okafor, Maya', chips: [{ label: 'Gold · M' }, { label: '70 min' }] },
  { id: '2', column: 'confirmed', status: 'confirmed', time: '10:30 AM', assignee: 'Renee', assigneeColor: 'var(--groomer-2)', title: 'Biscuit', titleMeta: 'Golden Retriever', subtitle: 'Thompson, Avery', chips: [{ label: 'Platinum · L' }], alerts: [{ key: 'v', label: 'Vaccine issue', tone: 'danger', icon: 'shield' }] },
  { id: '3', column: 'in_progress', status: 'in_progress', time: '11:00 AM', assignee: 'Omar', assigneeColor: 'var(--groomer-6)', title: 'Luna', titleMeta: 'Pomeranian', subtitle: 'Fernandez, Diego', chips: [{ label: 'Diamond · S' }] },
  { id: '4', column: 'done', status: 'done', time: '8:00 AM', assignee: 'Renee', assigneeColor: 'var(--groomer-2)', title: 'Coco', titleMeta: 'Cockapoo', subtitle: 'Patel, Noah', chips: [{ label: 'Gold · S' }] },
];
function Demo() { const [cards, setCards] = useState(initial); return h(AppointmentBoard, { columns: cols, cards, onCardClick: () => {}, onMove: (c, to) => setCards((xs) => xs.map((x) => (x.id === c.id ? { ...x, column: to } : x))) }); }

export default defineMeta({
  tier: 'organism', name: 'AppointmentBoard',
  description: 'The ONE kanban for schedule surfaces (F-14 Grooming & Spa board, F-31 Grooming board; replaces GroomStatusBoard). Column head = status dot + label + count Badge + collapse toggle; cards are ScheduleCards. Move a card by dragging OR from its "more" menu, so nothing is drag-only (D-195). Columns are >= 280 px, scroll-snap horizontally with a visible scrollbar and an edge fade, and stack under 768 px.',
  props: [
    { name: 'columns', type: 'BoardColumn[]', required: true, description: '{ key, label, tone?, locked?, hint?, collapsedByDefault? }' },
    { name: 'cards', type: 'BoardCard[]', required: true, description: 'ScheduleCard props + { id, column, sortKey? }' },
    { name: 'onMove', type: '(card, toColumn) => void', description: 'Enables drag-and-drop and the "Move to" menu entries' },
    { name: 'allowedMoves', type: '(card) => { to, label, locked? }[]', description: 'Restrict the menu to the lifecycle transitions' },
    { name: 'cardActions', type: '(card) => ScheduleCardAction[]', description: 'Extra per-card menu entries (Assign…)' },
    { name: 'onCardClick', type: '(card) => void', description: 'Open the appointment' },
    { name: 'selectedId', type: 'string', description: 'Highlighted card' },
    { name: 'labels', type: '{ open, more, collapse, expand, locked }', description: 'Translated labels from the module (useT)' },
  ],
  states: ['default', 'column drag-over', 'card dragging', 'empty column', 'locked column', 'collapsed column', 'scrolled (edge fade)', 'stacked (phone)'],
  usages: [{ title: 'Five columns, drag or use the card menu', render: () => h(Demo) }],
  a11y: ['Columns are list items labelled "<status> (<count>)"; the head is a real toggle button with aria-expanded.', 'Every card is one button; moves are reachable from the card menu, so dragging is never required.'],
  usedBy: ['F-14', 'F-31'], figma: ['Grooming.png (day view cards)', 'all reservation grooming-3.jpg (status colours)'],
});
