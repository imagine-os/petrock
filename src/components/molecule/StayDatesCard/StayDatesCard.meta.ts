import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { StayDatesCard, type StayDatesValue } from './StayDatesCard';

function Demo({ readOnly = false }: { readOnly?: boolean }) {
  const [v, setV] = useState<StayDatesValue>({ checkIn: null, checkInTime: '10:00', checkOut: null, checkOutTime: '11:00' });
  return h('div', { style: { maxWidth: 400 } }, h(StayDatesCard, { value: readOnly ? { checkIn: '2026-10-02', checkInTime: '10:00', checkOut: '2026-10-05', checkOutTime: '11:00' } : v, onChange: setV, readOnly, nights: readOnly ? 3 : undefined, hoursFor: (iso) => (new Date(iso + 'T00:00:00').getDay() === 0 ? null : { open: '07:00', close: '19:00' }) }));
}

export default defineMeta({
  tier: 'molecule', name: 'StayDatesCard', description: 'Check-in / check-out card for hotel stays (Figma Choose Pets): two columns with date and time, an inline range calendar that fills check-in then check-out, opening-hours bounds on the time pickers, closed days disabled, nights count and validation error.',
  props: [{ name: 'value', type: 'StayDatesValue', required: true, description: '{ checkIn, checkInTime, checkOut, checkOutTime } (ISO day + HH:MM)' }, { name: 'onChange', type: '(v) => void', description: 'Controlled' }, { name: 'hoursFor', type: '(iso) => {open, close} | null', description: 'Location hours per day; null = closed' }, { name: 'minDate', type: 'string', default: 'today', description: 'Earliest check-in' }, { name: 'nights', type: 'number', description: 'Shown under the columns' }, { name: 'error', type: 'string | null', description: 'Validation message (R-X54)' }, { name: 'readOnly', type: 'boolean', description: 'Summary for estimate / detail' }],
  states: ['picking check-in', 'picking check-out', 'error', 'read only'],
  usages: [{ title: 'Interactive', render: () => h(Demo) }, { title: 'Read only summary', render: () => h(Demo, { readOnly: true }) }],
  a11y: ['Date fields are buttons with aria-labels; the calendar is the library DatePicker grid.', 'Closed days are disabled and flagged in text.'],
  usedBy: ['C-30', 'C-35', 'C-39'], figma: ['Choose Pets-3.png', 'Booking Detail.jpg'],
});
