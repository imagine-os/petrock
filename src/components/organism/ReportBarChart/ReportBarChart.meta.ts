import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ReportBarChart } from './ReportBarChart';
import { fmtMoney } from '../../../pricing/engine';

export default defineMeta({
  tier: 'organism', name: 'ReportBarChart', description: 'Single-series bar chart for the reports pages: one brand hue, thin rounded bars on a baseline, recessive dashed grid, direct labels on the max and last bars, per-bar hover tooltip, keyboard focus per bar and a Table toggle for the same data. One axis, no legend (one series).',
  props: [{ name: 'data', type: '{ label, value, hint? }[]', required: true, description: 'Ordered periods' }, { name: 'title', type: 'string', required: true, description: 'Names the series' }, { name: 'format', type: '(v) => string', description: 'Value formatter (money, counts)' }, { name: 'height', type: 'number', default: '180', description: 'SVG height' }, { name: 'labelEvery', type: 'number', description: 'x-axis label cadence' }],
  states: ['chart', 'hover', 'table view', 'empty'],
  usages: [{ title: 'Revenue by day', render: () => h('div', { style: { maxWidth: 640 } }, h(ReportBarChart, { title: 'Revenue per day (last 14 days)', format: (v: number) => fmtMoney(v), data: Array.from({ length: 14 }, (_, i) => ({ label: `${i + 1} Sep`, value: [420, 380, 610, 720, 950, 1240, 1180, 400, 350, 590, 700, 990, 1300, 1120][i] })) })) }],
  a11y: ['role="img" with a full aria-label of the series; a table view carries the same numbers; bars are focusable; text uses text tokens, never the series colour.'],
  usedBy: ['F-62', 'F-63', 'F-64'],
});
