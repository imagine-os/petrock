import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { BudgetBar } from './BudgetBar';

export default defineMeta({
  tier: 'molecule', name: 'BudgetBar', description: 'One metric against its budget: label, value / budget, percentage badge and a thin meter with the warning threshold marked. Colors follow status (pass / warn / fail), the number is always text.',
  props: [{ name: 'label', type: 'string', required: true, description: 'Metric name' }, { name: 'value', type: 'number | null', required: true, description: 'Measured value (null = not measured)' }, { name: 'budget', type: 'number', required: true, description: 'Limit' }, { name: 'unit', type: "'kb'|'ms'|'count'|'percent'", required: true, description: 'Formats both numbers' }, { name: 'warnAtPercent', type: 'number', default: '80', description: 'Warning threshold' }],
  states: ['pass', 'warn', 'fail', 'no data'],
  usages: [{ title: 'Bundle budgets', render: () => h('div', { className: 'stack', style: { maxWidth: 520 } }, h(BudgetBar, { label: 'Total JavaScript (gzip)', value: 312, budget: 450, unit: 'kb' }), h(BudgetBar, { label: 'Largest chunk (gzip)', value: 298, budget: 350, unit: 'kb', hint: 'index-*.js' }), h(BudgetBar, { label: 'First render', value: 1720, budget: 1500, unit: 'ms' }), h(BudgetBar, { label: 'Seed build', value: null, budget: 400, unit: 'ms' })) }],
  a11y: ['The track is role="meter" with min / max / now and a spoken value text.', 'Status is badge text plus color, never color alone.'],
  usedBy: ['D-16'],
});
