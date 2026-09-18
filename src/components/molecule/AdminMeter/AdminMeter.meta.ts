import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { AdminMeter } from './AdminMeter';

export default defineMeta({
  tier: 'molecule', name: 'AdminMeter', description: 'Occupancy / capacity meter (rooms in use of total, daycare spots, groomer slots) with warn and danger thresholds.',
  props: [{ name: 'label', type: 'string', required: true, description: 'What is measured' }, { name: 'value', type: 'number', required: true, description: 'Current' }, { name: 'max', type: 'number', required: true, description: 'Capacity' }, { name: 'warnAt', type: 'number', default: '80', description: 'Percent for warn tone' }, { name: 'dangerAt', type: 'number', default: '95', description: 'Percent for danger tone' }],
  states: ['normal', 'warn', 'danger', 'empty capacity'],
  usages: [{ title: 'Occupancy today', render: () => h('div', { className: 'stack-sm', style: { maxWidth: 360 } }, h(AdminMeter, { label: 'Penthouse (Encino)', value: 9, max: 12, hint: 'tonight' }), h(AdminMeter, { label: 'Suite (Encino)', value: 41, max: 42 }), h(AdminMeter, { label: 'Daycare', value: 11, max: 20 })) }],
  a11y: ['role="meter" with min / max / now and label.'],
  usedBy: ['A-01', 'A-11', 'A-42'],
});
