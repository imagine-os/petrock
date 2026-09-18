import { createElement as h } from 'react';
import { Fragment } from 'react';
import { defineMeta } from '../../../design/meta';
import { CustomerScreenHeader } from './CustomerScreenHeader';
import { IconButton } from '../../atom/IconButton/IconButton';

export default defineMeta({
  tier: 'molecule', name: 'CustomerScreenHeader', description: 'Customer-app screen header: back chevron on the left, centered (or left-aligned) title with optional subtitle, actions on the right. Sticky by default.',
  props: [{ name: 'title', type: 'ReactNode', required: true, description: 'Screen title' }, { name: 'subtitle', type: 'ReactNode', description: 'Small line under the title' }, { name: 'backTo', type: 'string | null', description: 'Back target; omitted = history back; null = no chevron' }, { name: 'actions', type: 'ReactNode', description: 'Right slot' }, { name: 'sticky', type: 'boolean', default: 'true', description: 'Sticks to the top while scrolling' }, { name: 'align', type: "'center'|'start'", default: 'center', description: 'Title alignment' }],
  states: ['default', 'with subtitle', 'with actions', 'no back chevron'],
  usages: [
    { title: 'Centered with action', render: () => h(Fragment, null, h('div', { style: { maxWidth: 390, border: '1px solid var(--color-border)', borderRadius: 12 } }, h(CustomerScreenHeader, { title: 'Front Desk · Encino', subtitle: 'Usually replies in minutes', actions: h(IconButton, { icon: 'bell', label: 'Notifications', badge: 2 }) }))) },
    { title: 'Left aligned, no back', render: () => h(Fragment, null, h('div', { style: { maxWidth: 390, border: '1px solid var(--color-border)', borderRadius: 12 } }, h(CustomerScreenHeader, { title: 'Settings', align: 'start', backTo: null }))) },
  ],
  a11y: ['<header> landmark with an <h1>; the back control is an IconButton with aria-label "Back".', 'Title truncates with an ellipsis instead of wrapping under the chevron.'],
  usedBy: ['C-70', 'C-71', 'C-72', 'C-73', 'C-74', 'C-75', 'C-76', 'C-77', 'C-78', 'C-79', 'C-80', 'C-81', 'C-82', 'C-83', 'C-84'], figma: ['profile.jpg', 'notification.png', 'Message Support.png', 'language.jpg'],
});
