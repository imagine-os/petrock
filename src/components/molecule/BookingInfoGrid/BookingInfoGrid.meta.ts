import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { BookingInfoGrid } from './BookingInfoGrid';
import { StatusBadge } from '../../atom/Badge/Badge';

export default defineMeta({
  tier: 'molecule', name: 'BookingInfoGrid', description: 'Label-over-value grid used by the booking detail cards (dates, room, handler, payment status, contact). Two rows of three in the Figma detail; collapses to two then one column.',
  props: [{ name: 'items', type: '{ label, value, tone?, span? }[]', required: true, description: 'Cells in order' }, { name: 'columns', type: '2|3|4', default: '3', description: 'Desktop columns' }, { name: 'dense', type: 'boolean', description: 'Smaller values' }],
  states: ['default', 'dense', 'toned values', 'empty value (—)'],
  usages: [{ title: 'Stay card', render: () => h(BookingInfoGrid, { items: [{ label: 'Check-in', value: 'Sep 18, 2026 · 10:00 AM' }, { label: 'Check-out', value: 'Sep 21, 2026 · 11:00 AM' }, { label: 'Nights', value: '3' }, { label: 'Room', value: 'PH(B) 103' }, { label: 'Status', value: h(StatusBadge, { status: 'checked_in' }) }, { label: 'Payment', value: 'Authorized', tone: 'warn' }] }) }],
  a11y: ['Definition list: each label is a dt and its value a dd.'],
  usedBy: ['F-12', 'F-15'], figma: ['front desk-5.jpg'],
});
