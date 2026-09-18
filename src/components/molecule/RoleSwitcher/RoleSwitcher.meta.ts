import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { RoleSwitcher } from './RoleSwitcher';

export default defineMeta({
  tier: 'molecule', name: 'RoleSwitcher', description: 'Switch the demo user (one per role) and, as super admin, "view as" another role without changing who you are. Powers the testing hub.',
  props: [{ name: 'compact', type: 'boolean', description: 'Narrower selects for top bars' }],
  states: ['super admin (two selects)', 'other roles (one select)'],
  usages: [{ title: 'Live', render: () => h(RoleSwitcher) }],
  a11y: ['Both selects have aria-labels.'],
  usedBy: ['HUB-01'],
});
