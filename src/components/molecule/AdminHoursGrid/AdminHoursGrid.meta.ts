import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { AdminHoursGrid, summarizeHours, type WeekHours } from './AdminHoursGrid';

const WEEK: WeekHours = { 0: { open: '09:00', close: '17:30' }, 1: { open: '07:00', close: '19:00' }, 2: { open: '07:00', close: '19:00' }, 3: { open: '07:00', close: '19:00' }, 4: { open: '07:00', close: '19:00' }, 5: { open: '07:00', close: '19:00' }, 6: { open: '09:00', close: '17:30' } };
function Demo() { const [v, setV] = useState<WeekHours>(WEEK); return h('div', { className: 'stack-sm', style: { maxWidth: 520 } }, h(AdminHoursGrid, { value: v, onChange: setV }), h('p', { className: 'xs muted' }, summarizeHours(v))); }
export default defineMeta({
  tier: 'molecule', name: 'AdminHoursGrid', description: 'Weekly opening-hours editor for a location or a groomer (R-K04): per weekday an open checkbox with open / close TimePickers, shortcuts to copy Monday or open every day, plus a read-only list and a summarizeHours() helper.',
  props: [{ name: 'value', type: 'WeekHours', required: true, description: 'weekday (0 = Sunday) -> { open, close } | null' }, { name: 'onChange', type: '(v: WeekHours) => void', description: 'Change handler' }, { name: 'readOnly', type: 'boolean', default: 'false', description: 'Render as a definition list' }],
  states: ['editing', 'closed day', 'read-only'],
  usages: [{ title: 'Location hours', render: () => h(Demo) }, { title: 'Read-only', render: () => h(AdminHoursGrid, { value: WEEK, readOnly: true }) }],
  a11y: ['Each day is a labelled checkbox; times are native selects (TimePicker).'],
  usedBy: ['A-10', 'A-11', 'A-41'], figma: ['3.pdf', 'front desk-7.jpg'],
});
