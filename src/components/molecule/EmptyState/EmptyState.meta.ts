import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { EmptyState } from './EmptyState';
import { Button } from '../../atom/Button/Button';

export default defineMeta({
  tier: 'molecule', name: 'EmptyState', description: 'Zero-data block with icon, title, body and a call to action. Covers the "Hey! To Book An Appointment Please 1st Add A Pet" case.',
  props: [{ name: 'title', type: 'string', required: true, description: 'Headline' }, { name: 'body', type: 'ReactNode', description: 'Explanation' }, { name: 'action', type: 'ReactNode', description: 'CTA' }, { name: 'icon', type: 'IconName', default: 'paw', description: 'Icon' }, { name: 'compact', type: 'boolean', description: 'Less padding (inside tables)' }],
  states: ['default', 'compact'],
  usages: [{ title: 'With action', render: () => h(EmptyState, { title: 'No pets yet', body: 'To book an appointment, please add a pet first.', action: h(Button, { icon: 'plus' }, 'Add a pet') }) }, { title: 'Compact', render: () => h(EmptyState, { compact: true, icon: 'search', title: 'No results', body: 'Try another name or date.' }) }],
  a11y: ['role="status" so screen readers announce the empty result.'],
  usedBy: ['D-04', 'D-06'], figma: ['Home Page-4.png'],
});
