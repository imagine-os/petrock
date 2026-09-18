import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { AdminLineChart } from './AdminLineChart';

export default defineMeta({
  tier: 'organism', name: 'AdminLineChart', description: 'Line chart with crosshair tooltip, end-point labels, optional area wash and a table view. Used for occupancy over time and bookings funnels on the owner surface.',
  props: [{ name: 'series', type: 'AdminChartSeries[]', required: true, description: 'Series keys and labels' }, { name: 'data', type: 'AdminChartPoint[]', required: true, description: 'Ordered points' }, { name: 'format', type: '(n) => string', description: 'Value formatter' }, { name: 'area', type: 'boolean', default: 'false', description: '10 % area wash under each line' }, { name: 'max', type: 'number', description: 'Fixed y max (100 for percentages)' }],
  states: ['single', 'multi-series with legend', 'crosshair hover', 'table view', 'empty'],
  usages: [{ title: 'Occupancy per day, two locations', render: () => h(AdminLineChart, { series: [{ key: 'enc', label: 'Encino' }, { key: 'ww', label: 'Westwood' }], data: Array.from({ length: 14 }, (_, i) => ({ label: `${i + 1}`, values: { enc: 40 + Math.round(30 * Math.sin(i / 2)), ww: 55 + Math.round(20 * Math.cos(i / 3)) } })), format: (n: number) => `${Math.round(n)}%`, max: 100, area: true }) }],
  a11y: ['role="figure" with aria-label; table view carries every value as text; the tooltip repeats what the crosshair points at.'],
  usedBy: ['A-01', 'A-42'],
});
