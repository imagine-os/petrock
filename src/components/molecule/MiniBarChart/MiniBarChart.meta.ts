import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { MiniBarChart } from './MiniBarChart';

export default defineMeta({
  tier: 'molecule', name: 'MiniBarChart', description: 'Single-series bar chart in the primary hue: thin bars, rounded tops, hover / focus tooltip, sparse x labels and a table toggle. For "how much per month" on dashboards and the seed inspector.',
  props: [{ name: 'data', type: '{ label, value, hint? }[]', required: true, description: 'Bars in order' }, { name: 'title', type: 'string', required: true, description: 'Names the series (no legend needed for one series)' }, { name: 'format', type: '(v) => string', description: 'Value formatter' }, { name: 'height', type: 'number', default: '140', description: 'Plot height' }],
  states: ['chart', 'table', 'hover / focus tooltip'],
  usages: [{ title: 'Bookings per month', render: () => h('div', { style: { maxWidth: 560 } }, h(MiniBarChart, { title: 'Hotel stays per month', data: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({ label: m, value: [22, 28, 41, 19, 17, 24, 27, 30, 39, 46, 42, 26][i] })) })) }],
  a11y: ['Plot is role="img" with a full spoken summary; the table toggle gives the exact numbers.', 'Bars are focusable and show the tooltip on focus as well as hover.'],
  usedBy: ['D-14'],
});
