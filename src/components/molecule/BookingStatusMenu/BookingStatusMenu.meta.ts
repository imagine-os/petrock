import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { BookingStatusMenu } from './BookingStatusMenu';
import { StatusBadge } from '../../atom/Badge/Badge';
import type { BookingStatus } from '../../../domain/booking';

function Demo({ start }: { start: BookingStatus }) {
  const [s, setS] = useState<BookingStatus>(start);
  return h('div', { className: 'row wrap' }, h(StatusBadge, { status: s }), h(BookingStatusMenu, { status: s, onSelect: setS, quick: true, align: 'left' }));
}

export default defineMeta({
  tier: 'molecule', name: 'BookingStatusMenu', description: 'The "Set status to" menu of the timeline context menu, restricted to the transitions the one booking lifecycle allows. A lock marks transitions that need a manager PIN; the optional quick button offers the natural next step (Check in / Check out / Confirm).',
  props: [{ name: 'status', type: 'BookingStatus', required: true, description: 'Current status' }, { name: 'onSelect', type: '(to) => void', required: true, description: 'Chosen transition (the page runs the PIN gate)' }, { name: 'quick', type: 'boolean', description: 'Show the primary next-step button' }, { name: 'size', type: 'ButtonSize', default: 'sm', description: 'Button size' }, { name: 'align', type: "'left'|'right'", default: 'right', description: 'Menu alignment' }],
  states: ['closed', 'open', 'no transitions (checked out)', 'PIN-gated items'],
  usages: [{ title: 'Confirmed booking (menu opens down-left)', render: () => h(Demo, { start: 'confirmed' }) }, { title: 'Pending vaccines', render: () => h(Demo, { start: 'pending_vaccines' }) }],
  a11y: ['Trigger has aria-haspopup / aria-expanded; the list is a menu with menuitems; Escape closes.'],
  usedBy: ['F-01', 'F-10', 'F-12', 'F-13'], figma: ['all reservation grooming-3.jpg'],
});
