import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { DaycareDayCard } from './DaycareDayCard';
import { Button } from '../../atom/Button/Button';

export default defineMeta({
  tier: 'molecule', name: 'DaycareDayCard', description: 'Card for one daycare day in the customer history and detail: date, drop-off and pick-up times, computed item (Full day / Half day / Play hour) with hours, pets, location, StatusBadge, paid state, total and an actions slot (Book again, Cancel).',
  props: [{ name: 'code', type: 'string', required: true, description: 'DC-301' }, { name: 'date', type: 'string', required: true, description: 'YYYY-MM-DD' }, { name: 'checkIn', type: 'string', required: true, description: 'HH:MM' }, { name: 'checkOut', type: 'string', required: true, description: 'HH:MM' }, { name: 'itemLabel', type: 'string', required: true, description: 'From daycare_pricing.name' }, { name: 'petNames', type: 'string[]', required: true, description: '' }, { name: 'locationName', type: 'string', description: '' }, { name: 'status', type: 'BookingStatus', required: true, description: '' }, { name: 'paymentStatus', type: 'string', description: '' }, { name: 'total', type: 'number', required: true, description: '' }, { name: 'actions', type: 'ReactNode', description: '' }, { name: 'onOpen', type: '() => void', description: '' }, { name: 'highlight', type: 'boolean', description: '' }],
  states: ['upcoming', 'checked in', 'completed', 'cancelled', 'highlight'],
  usages: [
    { title: 'Upcoming full day, two pets', render: () => h(DaycareDayCard, { code: 'DC-310', date: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10), checkIn: '08:00', checkOut: '16:00', itemLabel: 'Full Day', petNames: ['Biscuit', 'Mochi'], locationName: 'Encino', status: 'confirmed', paymentStatus: 'paid', total: 86.7, actions: h(Button, { size: 'sm', variant: 'secondary', icon: 'refresh' }, 'Book again') }) },
    { title: 'Completed half day', render: () => h(DaycareDayCard, { code: 'DC-301', date: new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10), checkIn: '09:00', checkOut: '13:00', itemLabel: 'Half Day', petNames: ['Biscuit'], status: 'checked_out', paymentStatus: 'paid', total: 35.7 }) },
  ],
  a11y: ['Whole card clickable with onOpen; actions stop propagation.'],
  usedBy: ['C-60', 'C-64', 'C-65'], figma: ['DayCare-1.png'],
});
