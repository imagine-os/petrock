import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ScheduleCard } from './ScheduleCard';

export default defineMeta({
  tier: 'molecule', name: 'ScheduleCard',
  description: 'The ONE appointment / booking card for every schedule surface (F-14 board, F-30 day grid, F-31 board). Anatomy: 3 px lifecycle stripe, time (tabular) + groomer / room chip, pet name + breed, customer, then chips and alert badges. The card is a single button that opens the detail; per-card actions sit behind one 44 px "more" menu so nothing is drag-only. Replaces GroomAppointmentCard.',
  props: [
    { name: 'status', type: 'string', required: true, description: 'Lifecycle status; drives the left stripe hue' },
    { name: 'time', type: 'string', description: 'Time range, rendered in tabular numerals' },
    { name: 'assignee', type: 'string', description: 'Groomer or room, right-aligned chip' },
    { name: 'assigneeColor', type: 'string', description: 'Dot colour for the assignee chip' },
    { name: 'title', type: 'string', required: true, description: 'Pet name (bold)' },
    { name: 'titleMeta', type: 'string', description: 'Breed, muted' },
    { name: 'subtitle', type: 'string', description: 'Customer, muted small' },
    { name: 'chips', type: 'ScheduleCardChip[]', description: 'Package · size, room type, add-on count' },
    { name: 'alerts', type: 'ScheduleCardAlert[]', description: 'Vaccine / unpaid badges with text + aria-label, never a bare icon' },
    { name: 'actions', type: 'ScheduleCardAction[]', description: 'Items of the "more" menu (Open, Move to…, Assign…)' },
    { name: 'tooltip', type: 'string', description: 'Full accessible name (R-G20 label on grooming surfaces)' },
    { name: 'compact', type: 'boolean', description: 'Dense one-line variant for the day grid' },
    { name: 'onOpen', type: '() => void', description: 'Opens the detail' },
  ],
  states: ['confirmed', 'requested', 'in progress', 'done', 'cancelled', 'with alerts', 'menu open', 'compact'],
  usages: [{ title: 'Board and grid cards', render: () => h('div', { className: 'stack-sm', style: { maxWidth: 320 } },
    h(ScheduleCard, { status: 'confirmed', time: '10:00 – 11:45 AM', assignee: 'Itzel', assigneeColor: 'var(--groomer-2)', title: 'Teddy', titleMeta: 'Cairn Terrier', subtitle: 'Wong, Alice', chips: [{ label: 'Diamond · M' }, { label: '105 min' }], onOpen: () => {}, actions: [{ id: 'open', label: 'Open', icon: 'eye', onSelect: () => {} }, { id: 'move', label: 'Move to In progress', icon: 'arrow-right', onSelect: () => {} }] }),
    h(ScheduleCard, { status: 'requested', time: '1:00 PM', assignee: 'Tamsin', title: 'Louie', titleMeta: 'Poodle mix', subtitle: 'Alkoby, Dana', alerts: [{ key: 'v', label: 'Vaccine issue', tone: 'danger', icon: 'shield' }, { key: 'p', label: 'Balance due', tone: 'warn', icon: 'dollar' }], onOpen: () => {} }),
    h(ScheduleCard, { status: 'done', time: '8:00 AM', title: 'Ozzie', titleMeta: 'Mini Aussie', compact: true, onOpen: () => {} }),
  ) }],
  a11y: ['The card is one button with the full label as its accessible name.', 'Alerts are Badges with text and a title, not bare icons.', 'The "more" menu is a 44 px IconButton with aria-haspopup / aria-expanded and closes on Escape.'],
  usedBy: ['F-14', 'F-30', 'F-31'], figma: ['Grooming.png', 'Grooming-1.png'],
});
