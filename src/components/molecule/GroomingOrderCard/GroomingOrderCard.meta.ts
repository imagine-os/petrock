import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomingOrderCard } from './GroomingOrderCard';
import { Button } from '../../atom/Button/Button';

export default defineMeta({
  tier: 'molecule', name: 'GroomingOrderCard', description: 'Card for one Grooming & Spa order in the customer history and on the order detail (Figma "Your Past Spa/Grooming"): date and time, StatusBadge (one lifecycle), location, groomer, paid state, one line per pet with package, size and add-ons, total and an actions slot (Re-create, Cancel).',
  props: [{ name: 'code', type: 'string', required: true, description: 'GS-1042' }, { name: 'startsAt', type: 'string', required: true, description: 'ISO' }, { name: 'locationName', type: 'string', description: '' }, { name: 'groomerName', type: 'string', description: '' }, { name: 'status', type: 'BookingStatus', required: true, description: '' }, { name: 'paymentStatus', type: 'string', description: 'paid | pending' }, { name: 'pets', type: 'GroomingOrderPetLine[]', required: true, description: 'petName, packageName, size, addons, amount' }, { name: 'total', type: 'number', required: true, description: '' }, { name: 'actions', type: 'ReactNode', description: 'Buttons' }, { name: 'onOpen', type: '() => void', description: 'Card click' }, { name: 'highlight', type: 'boolean', description: 'Tinted (just booked)' }],
  states: ['upcoming', 'completed', 'pending vaccines', 'cancelled', 'highlight'],
  usages: [
    { title: 'Completed order with re-create', render: () => h(GroomingOrderCard, { code: 'GS-1001', startsAt: new Date(Date.now() - 7 * 864e5).toISOString(), locationName: 'Encino', groomerName: 'Renee', status: 'checked_out', paymentStatus: 'paid', total: 108.9, pets: [{ petName: 'Biscuit', packageName: 'Gold Groom', size: 'L', addons: ['Furminator'], amount: 105 }], actions: h(Button, { size: 'sm', variant: 'secondary', icon: 'refresh' }, 'Re-create') }) },
    { title: 'Upcoming, pending vaccines, two pets', render: () => h(GroomingOrderCard, { highlight: true, code: 'GS-1042', startsAt: new Date(Date.now() + 3 * 864e5).toISOString(), locationName: 'Westwood', status: 'pending_vaccines', paymentStatus: 'pending', total: 158.1, pets: [{ petName: 'Mochi', packageName: 'Platinum Groom', size: 'M', addons: [], amount: 80 }, { petName: 'Biscuit', packageName: 'Gold Groom', size: 'L', addons: [], amount: 75 }] }) },
  ],
  a11y: ['Whole card is clickable when onOpen is set; the actions row stops propagation.'],
  usedBy: ['C-55', 'C-56'], figma: ['Frame 1171276434.png'],
});
