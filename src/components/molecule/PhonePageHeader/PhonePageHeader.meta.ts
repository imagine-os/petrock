import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PhonePageHeader } from './PhonePageHeader';
import { IconButton } from '../../atom/IconButton/IconButton';

export default defineMeta({
  tier: 'molecule', name: 'PhonePageHeader', description: 'Customer-app page header: back chevron on the left, centred title, optional actions on the right and a one-line subtitle; sticks to the top of the phone column.',
  props: [{ name: 'title', type: 'string', required: true, description: 'Centred title' }, { name: 'backTo', type: 'string | -1', description: 'Route to go back to, or -1 for history back; omit to hide the chevron' }, { name: 'actions', type: 'ReactNode', description: 'Right-side icon buttons' }, { name: 'subtitle', type: 'ReactNode', description: 'Line under the title' }, { name: 'sticky', type: 'boolean', default: 'true', description: 'position: sticky' }],
  states: ['with back', 'without back', 'with actions'],
  usages: [{ title: 'Variants', render: () => h('div', { className: 'stack', style: { maxWidth: 390, border: '1px solid var(--color-border)', borderRadius: 10 } }, h(PhonePageHeader, { title: 'My pets', backTo: '/app', sticky: false, actions: h(IconButton, { icon: 'plus', label: 'Add pet' }) }), h(PhonePageHeader, { title: 'Notifications', backTo: -1, sticky: false, subtitle: '2 unread' })) }],
  a11y: ['Back is an icon button labelled "Back"; the title is the page h1.'],
  usedBy: ['C-11', 'C-12', 'C-13', 'C-14', 'C-15', 'C-20', 'C-21'], figma: ['Pet Edit.png', 'notification.png', 'My pets (more than one pet).jpg'],
});
