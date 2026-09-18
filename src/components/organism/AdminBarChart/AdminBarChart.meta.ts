import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { AdminBarChart } from './AdminBarChart';

const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
export default defineMeta({
  tier: 'organism', name: 'AdminBarChart', description: 'Grouped or stacked bar chart for the owner dashboard and reports: hover tooltip, legend for 2+ series, one direct label on the extreme, table view, validated 4-slot categorical palette with dark-mode steps.',
  props: [{ name: 'series', type: 'AdminChartSeries[]', required: true, description: 'Series keys, labels and colour slot (1-4)' }, { name: 'data', type: 'AdminChartPoint[]', required: true, description: 'Points with label and values per series key' }, { name: 'stacked', type: 'boolean', default: 'false', description: 'Stack series in one column' }, { name: 'format', type: '(n) => string', description: 'Value formatter (axis, label, tooltip)' }, { name: 'height', type: 'number', default: '220', description: 'ViewBox height' }, { name: 'labelMax', type: 'boolean', default: 'true', description: 'Direct-label the tallest bar only' }],
  states: ['single series (no legend)', 'grouped', 'stacked', 'hover tooltip', 'table view', 'empty'],
  usages: [
    { title: 'Revenue by month, one series', render: () => h(AdminBarChart, { series: [{ key: 'rev', label: 'Revenue' }], data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({ label: m, values: { rev: [2300, 800, 1400, 5000, 3300, 2000][i] } })), format: fmt, ariaLabel: 'Revenue by month' }) },
    { title: 'Stacked by service', render: () => h(AdminBarChart, { stacked: true, series: [{ key: 'hotel', label: 'Hotel' }, { key: 'groom', label: 'Grooming & Spa' }, { key: 'dc', label: 'Daycare' }], data: ['Encino', 'Westwood'].map((l, i) => ({ label: l, values: { hotel: [8200, 6100][i], groom: [2100, 1700][i], dc: [900, 600][i] } })), format: fmt, height: 180 }) },
  ],
  a11y: ['role="figure" with aria-label; each band is focusable and announces its values; "Show as table" provides the same numbers as text; text never wears the series colour.'],
  usedBy: ['A-01', 'A-42'], figma: ['front desk-4.jpg'],
});
