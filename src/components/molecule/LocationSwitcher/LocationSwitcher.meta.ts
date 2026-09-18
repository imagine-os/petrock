import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { LocationSwitcher } from './LocationSwitcher';

export default defineMeta({
  tier: 'molecule', name: 'LocationSwitcher', description: 'The current location, always visible. Front desk / groomer / manager see their pinned store; owner and super admin switch between Encino, Westwood and "All locations".',
  props: [{ name: 'allowAll', type: 'boolean', default: 'true', description: 'Offer the all-locations option' }, { name: 'compact', type: 'boolean', description: 'Short names' }],
  states: ['pinned label', 'select', 'all locations'],
  usages: [{ title: 'Live (depends on the current role)', render: () => h(LocationSwitcher) }],
  a11y: ['Select has aria-label; pinned label carries the address as title.'],
  usedBy: ['HUB-01'], figma: ['front desk.jpg (Encino, Los Angeles)', '1.pdf'],
});
