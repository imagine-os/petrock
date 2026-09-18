import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { StaffNotificationRow } from './StaffNotificationRow';

export default defineMeta({
  tier: 'molecule', name: 'StaffNotificationRow', description: 'One staff notification: kind icon (R-M07 vocabulary), title, body, kind label and relative time (R-M08), unread tint and a dot that toggles read. Links to the notification\'s page.',
  props: [{ name: 'kind', type: 'string', required: true, description: 'booking_confirmed | payment | vaccine_expiring | vaccine_submitted | pet_added | message | review | system' }, { name: 'title', type: 'string', required: true, description: 'Headline' }, { name: 'body', type: 'string', description: 'Detail line' }, { name: 'link', type: 'string', description: 'Route to open' }, { name: 'read', type: 'boolean', required: true, description: 'Read state' }, { name: 'sentAt', type: 'string', required: true, description: 'ISO time' }, { name: 'onOpen / onToggleRead', type: '() => void', description: 'Handlers' }],
  states: ['unread', 'read', 'without link'],
  usages: [{ title: 'Unread and read', render: () => h('div', { style: { maxWidth: 520 } }, h(StaffNotificationRow, { kind: 'vaccine_submitted', title: 'Vaccine proof submitted', body: 'Daisy uploaded Rabies and DHPP; verify to confirm PR-1013', link: '/desk/vaccines', read: false, sentAt: new Date(Date.now() - 25 * 60000).toISOString(), onToggleRead: () => {} }), h(StaffNotificationRow, { kind: 'payment', title: 'Payment received', body: 'Deposit of $95.00 for PR-1009', read: true, sentAt: new Date(Date.now() - 26 * 3600000).toISOString(), onToggleRead: () => {} })) }],
  a11y: ['The row body is a link or button; the read toggle has an aria-label; time uses <time dateTime>.'],
  usedBy: ['F-60'], figma: ['notification.png'],
});
