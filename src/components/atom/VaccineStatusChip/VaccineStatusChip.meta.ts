import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { VaccineStatusChip } from './VaccineStatusChip';

export default defineMeta({
  tier: 'atom', name: 'VaccineStatusChip', description: 'Status pill for a vaccine record or a pet\'s overall vaccine state: verified, pending (submitted, awaiting the front desk), expired, missing, rejected (R-X20).',
  props: [{ name: 'status', type: "'verified'|'pending'|'expired'|'missing'|'rejected'", required: true, description: 'Derived state' }, { name: 'size', type: "'sm'|'md'", default: 'md', description: 'Height 20 / 24 px' }, { name: 'label', type: 'string', description: 'Override the default label (e.g. "Expires in 14 days")' }],
  states: ['verified', 'pending', 'expired', 'missing', 'rejected'],
  usages: [{ title: 'All states', render: () => h('div', { className: 'row wrap' }, h(VaccineStatusChip, { status: 'verified' }), h(VaccineStatusChip, { status: 'pending' }), h(VaccineStatusChip, { status: 'expired' }), h(VaccineStatusChip, { status: 'missing' }), h(VaccineStatusChip, { status: 'rejected' }), h(VaccineStatusChip, { status: 'verified', size: 'sm', label: 'Expires 12 Mar 2027' })) }],
  a11y: ['Colour is never the only signal: each state has an icon and a text label; title repeats the state.'],
  usedBy: ['C-10', 'C-11', 'C-13', 'C-20', 'C-21'], figma: ['Choose Vaccine.png', 'Home Page-1.png'],
});
