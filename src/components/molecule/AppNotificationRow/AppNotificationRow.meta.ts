import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { AppNotificationRow } from './AppNotificationRow';

export default defineMeta({
  tier: 'molecule', name: 'AppNotificationRow', description: 'Customer notification list row (notification.png): kind icon in a circle (filled purple when unread), title, optional body, relative time and an unread dot.',
  props: [{ name: 'kind', type: 'string', required: true, description: 'notifications.kind -> icon via NOTIFICATION_KIND_ICON' }, { name: 'title', type: 'string', required: true, description: 'Headline' }, { name: 'body', type: 'string', description: 'Second line' }, { name: 'when', type: 'string', required: true, description: 'Preformatted relative time (R-M08)' }, { name: 'read', type: 'boolean', required: true, description: 'Unread rows are emphasised' }, { name: 'onClick', type: '() => void', description: 'Open the link and mark read' }],
  states: ['unread', 'read', 'hover'],
  usages: [{ title: 'List', render: () => h('div', { style: { maxWidth: 420, border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' } }, h(AppNotificationRow, { kind: 'booking_confirmed', title: 'Your hotel booking is confirmed', body: 'Biscuit and Mochi, Penthouse, check-in Friday 10:00 AM', when: '25 min ago', read: false, onClick: () => {} }), h(AppNotificationRow, { kind: 'vaccine_expiring', title: 'Bordetella expires soon', body: "Bruno's Bordetella expires in 14 days", when: '3 hours ago', read: false, onClick: () => {} }), h(AppNotificationRow, { kind: 'pet_added', title: 'Pet added', body: 'Mochi is waiting for approval', when: 'Yesterday', read: true, onClick: () => {} })) }],
  a11y: ['Rows with onClick are buttons whose label is prefixed with "Unread:" when unread; the dot is decorative.'],
  usedBy: ['C-15'], figma: ['notification.png'],
});
