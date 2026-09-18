import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { CustomerSummaryCard } from './CustomerSummaryCard';
import { Button } from '../../atom/Button/Button';

export default defineMeta({
  tier: 'molecule', name: 'CustomerSummaryCard', description: 'Customer header (avatar, name, email, phone, home location, since) with pets count, outstanding balance and actions. From the Figma booking detail customer card.',
  props: [{ name: 'name', type: 'string', required: true, description: 'Full name' }, { name: 'email', type: 'string', description: 'mailto link' }, { name: 'mobile', type: 'string', description: 'tel link' }, { name: 'status', type: 'string', description: 'active / inactive badge' }, { name: 'balance', type: 'number', description: 'Outstanding USD; red when > 0' }, { name: 'petsCount', type: 'number', description: 'Pets on the account' }, { name: 'to', type: 'string', description: 'Link the name' }, { name: 'actions', type: 'ReactNode', description: 'Buttons on the right' }, { name: 'compact', type: 'boolean', description: 'Smaller avatar and type' }],
  states: ['default', 'compact', 'with balance due'],
  usages: [{ title: 'Detail header', render: () => h(CustomerSummaryCard, { name: 'Avery Thompson', email: 'avery.thompson@demo.petrock.test', mobile: '+1 (818) 555-0120', status: 'active', balance: 95, petsCount: 2, location: 'Encino', since: 'Mar 2024', actions: h(Button, { size: 'sm', variant: 'secondary', icon: 'edit' }, 'Edit') }) }, { title: 'Compact', render: () => h(CustomerSummaryCard, { name: 'Diego Fernandez', mobile: '+1 (818) 555-0122', petsCount: 2, balance: 0, compact: true }) }],
  a11y: ['Email and phone are real links.', 'Balance colour is paired with the amount text.'],
  usedBy: ['F-34', 'F-52', 'F-55'], figma: ['front desk-5.jpg', 'front desk-8.jpg'],
});
