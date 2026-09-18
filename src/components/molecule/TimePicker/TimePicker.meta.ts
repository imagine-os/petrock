import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { TimePicker } from './TimePicker';

function Demo() { const [a, setA] = useState('10:00'); const [b, setB] = useState('14:00'); return h('div', { className: 'grid grid-2' }, h(TimePicker, { label: 'Check-in time', value: a, onChange: setA, min: '07:00', max: '20:00' }), h(TimePicker, { label: 'Check-out time', value: b, onChange: setB, min: a, max: '20:00', stepMinutes: 30 })); }

export default defineMeta({
  tier: 'molecule', name: 'TimePicker', description: 'Time slot select with 12-hour labels, a min/max window and a step (general settings: slot interval, restricted time range).',
  props: [{ name: 'value', type: 'string', required: true, description: 'HH:MM' }, { name: 'onChange', type: '(hhmm) => void', required: true, description: 'Handler' }, { name: 'min/max', type: 'string', default: '06:00 / 21:00', description: 'Window' }, { name: 'stepMinutes', type: 'number', default: '15', description: 'Slot size' }],
  states: ['default'],
  usages: [{ title: 'Check-in / out', render: () => h(Demo) }],
  a11y: ['Native select.'],
  usedBy: [], figma: ['DayCare-1.png', '7.pdf'],
});
