import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { StaffNotificationItem } from './StaffNotificationItem';

export default defineMeta({
  tier: 'molecule', name: 'StaffNotificationItem', description: 'Notification row for staff: icon by kind (message, booking, vaccine, approval, payment...), title, body, relative time (R-M08) and an unread dot that toggles read state.',
  props: [{ name: 'kind', type: 'string', required: true, description: 'notifications.kind -> icon' }, { name: 'title', type: 'string', required: true, description: 'Headline' }, { name: 'body', type: 'string', description: 'Detail line' }, { name: 'when', type: 'string', required: true, description: 'Relative time text' }, { name: 'read', type: 'boolean', required: true, description: 'Read state' }, { name: 'onOpen', type: '() => void', description: 'Follow the link' }, { name: 'onToggleRead', type: '() => void', description: 'Dot click' }],
  states: ['unread', 'read'],
  usages: [{ title: 'List', render: () => h('div', { style: { maxWidth: 520 } }, h(StaffNotificationItem, { kind: 'vaccine_submitted', title: 'Vaccine proof submitted', body: 'Daisy (Nakamura) uploaded Rabies and DHPP', when: '2 hours ago', read: false, onToggleRead: () => {} }), h(StaffNotificationItem, { kind: 'message', title: 'New message from Sofia Marchetti', body: 'Can Nala get a nail trim tomorrow?', when: 'Yesterday', read: true, onToggleRead: () => {} })) }],
  a11y: ['Row is a button with the title as label; the dot has an explicit mark-read label.'],
  usedBy: ['F-58'], figma: ['notification.png'],
});
