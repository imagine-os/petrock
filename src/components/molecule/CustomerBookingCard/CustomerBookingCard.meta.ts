import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { CustomerBookingCard } from './CustomerBookingCard';

export default defineMeta({
  tier: 'molecule', name: 'CustomerBookingCard', description: 'Upcoming booking card for the customer app: type icon, title, pets, the customer-worded status (StatusBadge, one lifecycle) and either check-in / check-out (stay) or one appointment slot.',
  props: [{ name: 'kind', type: "'hotel'|'grooming'|'daycare'", required: true, description: 'Picks the icon' }, { name: 'title', type: 'string', required: true, description: 'e.g. Hotel Suite, Gold Groom, Daycare full day' }, { name: 'pets', type: 'string', required: true, description: 'Comma list of pet names' }, { name: 'status', type: 'BookingStatus', required: true, description: 'Lifecycle status; rendered with StatusBadge' }, { name: 'start', type: '{date,time}', required: true, description: 'Check-in or appointment' }, { name: 'end', type: '{date,time}', description: 'Check-out (stay variant)' }, { name: 'location', type: 'string', description: 'Location short name' }, { name: 'onClick', type: '() => void', description: 'Open the booking' }],
  states: ['stay (two columns)', 'appointment (one slot)', 'each booking status'],
  usages: [{ title: 'Stay and appointment', render: () => h('div', { className: 'grid grid-2', style: { maxWidth: 420 } }, h(CustomerBookingCard, { kind: 'hotel', title: 'Hotel Suite', pets: 'Sparky, Boss', status: 'pending_vaccines', start: { date: '16 Nov 2026', time: '10:00 AM' }, end: { date: '18 Nov 2026', time: '2:00 PM' }, onClick: () => {} }), h(CustomerBookingCard, { kind: 'grooming', title: 'Gold Groom', pets: 'Boss', status: 'confirmed', location: 'Encino', start: { date: '16 Nov 2026', time: '10:00 AM' }, onClick: () => {} })) }],
  a11y: ['Clickable cards are buttons; the status has a visually hidden customer label beside the badge.'],
  usedBy: ['C-10', 'C-13'], figma: ['Home Page-1.png', 'Home Page.png'],
});
