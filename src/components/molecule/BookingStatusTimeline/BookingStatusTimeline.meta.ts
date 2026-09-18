import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { BookingStatusTimeline } from './BookingStatusTimeline';

export default defineMeta({
  tier: 'molecule', name: 'BookingStatusTimeline', description: 'The one booking lifecycle (src/domain/booking.ts) drawn as a vertical timeline for a stay: requested -> pending vaccines -> confirmed (Upcoming) -> checked in (Staying now) -> checked out (Completed); cancelled / no show end the line in red. Customer or staff wording.',
  props: [{ name: 'status', type: 'BookingStatus', required: true, description: 'Current status' }, { name: 'customer', type: 'boolean', default: 'true', description: 'BOOKING_STATUS_CUSTOMER_LABEL vs staff labels' }, { name: 'reachedAt', type: 'Partial<Record<BookingStatus, string>>', description: 'Dates under done steps' }, { name: 'hint', type: 'string', description: 'Caption under the current step' }, { name: 'compact', type: 'boolean', description: 'Tighter spacing' }],
  states: ['requested', 'pending_vaccines', 'confirmed', 'checked_in', 'checked_out', 'cancelled / no_show'],
  usages: [{ title: 'States', render: () => h('div', { className: 'grid grid-3' },
    h(BookingStatusTimeline, { status: 'pending_vaccines', reachedAt: { requested: '2026-09-10T10:00:00Z' }, hint: 'Upload Mochi\'s Bordetella proof' }),
    h(BookingStatusTimeline, { status: 'checked_in', reachedAt: { requested: '2026-09-01T10:00:00Z', confirmed: '2026-09-02T10:00:00Z', checked_in: '2026-09-17T17:00:00Z' } }),
    h(BookingStatusTimeline, { status: 'cancelled', reachedAt: { requested: '2026-09-01T10:00:00Z', confirmed: '2026-09-02T10:00:00Z', cancelled: '2026-09-05T10:00:00Z' }, customer: false })) }],
  a11y: ['Ordered list with aria-current="step" on the active status.'],
  usedBy: ['C-37', 'C-39'], figma: ['Home Page-1.png (Pending Verification / Upcoming)'],
});
