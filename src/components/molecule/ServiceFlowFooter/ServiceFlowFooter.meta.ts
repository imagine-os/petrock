import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ServiceFlowFooter } from './ServiceFlowFooter';

export default defineMeta({
  tier: 'molecule', name: 'ServiceFlowFooter', description: 'Action bar at the end of a booking step (Next / Pay, optional outlined secondary such as "Groom another pet", running total on the left, hint line). Sticky above the customer BottomNav; stacks buttons on very narrow phones.',
  props: [{ name: 'primaryLabel', type: 'string', required: true, description: '' }, { name: 'onPrimary', type: '() => void', required: true, description: '' }, { name: 'primaryDisabled', type: 'boolean', description: '' }, { name: 'primaryLoading', type: 'boolean', description: 'Paying...' }, { name: 'secondaryLabel', type: 'string', description: '' }, { name: 'onSecondary', type: '() => void', description: '' }, { name: 'summary', type: 'ReactNode', description: 'Running total row' }, { name: 'hint', type: 'ReactNode', description: 'Small line under the buttons' }, { name: 'sticky', type: 'boolean', default: 'true', description: '' }],
  states: ['default', 'with secondary', 'disabled', 'loading'],
  usages: [
    { title: 'Next', render: () => h(ServiceFlowFooter, { sticky: false, primaryLabel: 'Next', onPrimary: () => {}, summary: h('span', null, '1 pet · Gold Groom ', h('strong', null, '$80.00')) }) },
    { title: 'Groom another pet | Next', render: () => h(ServiceFlowFooter, { sticky: false, primaryLabel: 'Next', onPrimary: () => {}, secondaryLabel: 'Groom another pet', onSecondary: () => {}, hint: 'Prices before tax' }) },
    { title: 'Pay (loading)', render: () => h(ServiceFlowFooter, { sticky: false, primaryLabel: 'Pay $132.46', onPrimary: () => {}, primaryLoading: true }) },
  ],
  a11y: ['Uses the library Button; sticky bar never covers content thanks to the shell padding.'],
  usedBy: ['C-51', 'C-52', 'C-53', 'C-54', 'C-61', 'C-62', 'C-63'], figma: ['Frame 1171276429.png', 'DayCare-1.png'],
});
