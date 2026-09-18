import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomingSlotPicker } from './GroomingSlotPicker';

function Demo() {
  const [v, setV] = useState<string | null>('10:00');
  const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00'].map((time, i) => ({ time, available: i !== 1 && i !== 6, reason: 'Both grooming tables are booked' }));
  return h(GroomingSlotPicker, { slots, value: v, onChange: setV, label: 'Start time' });
}

export default defineMeta({
  tier: 'molecule', name: 'GroomingSlotPicker', description: 'Start-time chips grouped Morning / Afternoon for a grooming appointment. Slots come from src/modules/customer-grooming-daycare/slots.ts (location hours, capacity, groomer availability, order duration); unavailable ones are shown struck through with a reason tooltip.',
  props: [{ name: 'slots', type: 'GroomingSlot[]', required: true, description: '{ time HH:MM, available, reason }' }, { name: 'value', type: 'string | null', required: true, description: 'Selected HH:MM' }, { name: 'onChange', type: '(hhmm) => void', required: true, description: '' }, { name: 'label', type: 'string', description: '' }, { name: 'emptyText', type: 'string', description: 'When nothing is available' }],
  states: ['default', 'selected', 'unavailable', 'closed day (empty)'],
  usages: [{ title: 'Slots for a day', render: () => h(Demo) }, { title: 'Closed day', render: () => h(GroomingSlotPicker, { slots: [], value: null, onChange: () => {} }) }],
  a11y: ['radiogroup of role=radio buttons with aria-checked; disabled slots keep their label and a title reason.'],
  usedBy: ['C-53'],
});
