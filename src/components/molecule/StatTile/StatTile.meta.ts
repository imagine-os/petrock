import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { StatTile } from './StatTile';

export default defineMeta({
  tier: 'molecule', name: 'StatTile', description: "KPI tile for dashboards (Today's revenue, rooms, arrivals). Value, label, optional delta, icon and hint.",
  props: [{ name: 'label', type: 'string', required: true, description: 'Metric name' }, { name: 'value', type: 'ReactNode', required: true, description: 'Big number' }, { name: 'delta', type: '{ value, positive? }', description: 'Change vs previous' }, { name: 'icon', type: 'IconName', description: 'Icon' }, { name: 'tone', type: "'default'|'primary'", default: 'default', description: 'Filled primary variant' }],
  states: ['default', 'primary', 'clickable'],
  usages: [{ title: 'Dashboard strip', render: () => h('div', { className: 'grid grid-4' }, h(StatTile, { label: "Today's hotel revenue", value: '$3,600', delta: { value: '+12%' }, icon: 'dollar', tone: 'primary' }), h(StatTile, { label: 'Arriving', value: 7, icon: 'arrow-right', hint: 'today' }), h(StatTile, { label: 'Available rooms', value: 31, icon: 'bed', delta: { value: '-3', positive: false } }), h(StatTile, { label: 'Pending vaccines', value: 2, icon: 'shield' })) }],
  a11y: ['Clickable tiles render as buttons.'],
  usedBy: ['D-03', 'D-04'], figma: ['front desk-4.jpg'],
});
