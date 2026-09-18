import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { StatusBadge } from './StatusBadge';
import { BOOKING_STATUSES } from '../../../domain/booking';

export default defineMeta({
  tier: 'atom', name: 'StatusBadge', description: 'The one booking-lifecycle badge (requested, pending_vaccines, confirmed, checked_in, checked_out, cancelled, no_show) with the R-I01 colours; `customer` swaps in the R-I04 customer-facing labels.',
  props: [{ name: 'status', type: 'BookingStatus', required: true, description: 'Lifecycle status' }, { name: 'customer', type: 'boolean', default: 'false', description: 'Use BOOKING_STATUS_CUSTOMER_LABEL' }, { name: 'variant', type: "'fill'|'pill'|'text'", default: 'fill', description: 'fill = desk table badge r4; pill = Figma white pill with dot (pet cards); text = coloured text (home booking cards)' }, { name: 'size', type: "'sm'|'md'", default: 'md', description: 'Height 20 / 24' }],
  states: ['each of the 7 statuses', 'staff labels', 'customer labels'],
  usages: [
    { title: 'Mobile pill and text variants', render: () => h('div', { className: 'row wrap' }, h(StatusBadge, { status: 'confirmed', variant: 'pill', customer: true }), h(StatusBadge, { status: 'pending_vaccines', variant: 'pill', customer: true }), h(StatusBadge, { status: 'pending_vaccines', variant: 'text', customer: true }), h(StatusBadge, { status: 'confirmed', variant: 'text', customer: true })) },
    { title: 'Staff labels (all statuses)', render: () => h('div', { className: 'row wrap' }, ...BOOKING_STATUSES.map((s) => h(StatusBadge, { key: s, status: s }))) },
    { title: 'Customer labels', render: () => h('div', { className: 'row wrap' }, ...BOOKING_STATUSES.map((s) => h(StatusBadge, { key: s, status: s, customer: true }))) },
    { title: 'Small', render: () => h('div', { className: 'row wrap' }, ...BOOKING_STATUSES.map((s) => h(StatusBadge, { key: s, status: s, size: 'sm' }))) },
  ],
  a11y: ['Colour is never the only signal: the label text is always present; customer badges carry the staff label as title.'],
  usedBy: ['A-01', 'C-10', 'C-39', 'F-01', 'F-10', 'F-12', 'F-13', 'F-52', 'F-55', 'P-08'], figma: ['all reservation grooming-3.jpg', 'Booking Detail.jpg'],
});
