import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { CustomerReservationCard } from './CustomerReservationCard';

export default defineMeta({
  tier: 'molecule', name: 'CustomerReservationCard', description: 'Reservation card for the customer app (Figma Upcoming Bookings): kind icon (hotel / grooming / daycare), title, pets, customer-facing status chip, check-in and check-out or a single date-time, location and amount. Links to the detail page when `to` is set.',
  props: [{ name: 'kind', type: "'hotel'|'grooming'|'daycare'", required: true, description: 'Icon and eyebrow' }, { name: 'title', type: 'string', required: true, description: 'Penthouse, Gold Groom...' }, { name: 'code', type: 'string', description: 'PR-1042' }, { name: 'pets', type: 'string[]', required: true, description: 'Pet names' }, { name: 'status', type: 'BookingStatus', required: true, description: 'One lifecycle; customer labels' }, { name: 'start', type: 'string', required: true, description: 'ISO check-in / appointment' }, { name: 'end', type: 'string | null', description: 'ISO check-out (stays)' }, { name: 'locationName', type: 'string', description: 'Encino / Westwood' }, { name: 'amount', type: 'string', description: 'Formatted total' }, { name: 'note', type: 'string', description: 'Warn chip (balance due)' }, { name: 'to', type: 'string', description: 'Detail route' }],
  states: ['upcoming', 'pending verification', 'completed', 'appointment (no end)'],
  usages: [{ title: 'Cards', render: () => h('div', { className: 'stack', style: { maxWidth: 420 } },
    h(CustomerReservationCard, { kind: 'hotel', title: 'Penthouse', code: 'PR-1042', pets: ['Biscuit', 'Mochi'], status: 'pending_vaccines', start: '2026-10-02T17:00:00Z', end: '2026-10-05T18:00:00Z', locationName: 'Encino', amount: '$459.00', note: 'Balance $321.30', to: '#' }),
    h(CustomerReservationCard, { kind: 'grooming', title: 'Gold Groom', code: 'GR-512', pets: ['Mochi'], status: 'confirmed', start: '2026-10-05T16:00:00Z', locationName: 'Encino', amount: '$65.00' }),
    h(CustomerReservationCard, { kind: 'daycare', title: 'Full day', pets: ['Biscuit'], status: 'checked_out', start: '2026-09-10T15:00:00Z', locationName: 'Westwood' })) }],
  a11y: ['The whole card is one link when `to` is set; status chip uses the shared badge-status styles.'],
  usedBy: ['C-38'], figma: ['Home Page-1.png', 'Home Page.png'],
});
