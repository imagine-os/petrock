import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { NotificationRow } from './NotificationRow';
import { Card } from '../Card/Card';

export default defineMeta({
  tier: 'molecule', name: 'NotificationRow', description: 'Notification centre row: kind-mapped icon in a circle (filled while unread), title, body, relative time, unread dot and optional dismiss. NOTIFICATION_KIND_ICON maps every notification kind (R-M07).',
  props: [{ name: 'kind', type: 'string', required: true, description: 'notifications.kind (booking_confirmed, payment, vaccine_expiring, chat, photo, promo...)' }, { name: 'title', type: 'ReactNode', required: true, description: 'Headline' }, { name: 'body', type: 'ReactNode', description: 'Second line' }, { name: 'time', type: 'ReactNode', required: true, description: 'Relative time' }, { name: 'read', type: 'boolean', default: 'true', description: 'Unread rows are tinted and bold' }, { name: 'onClick', type: '() => void', description: 'Open the linked screen' }, { name: 'onDismiss', type: '() => void', description: 'Shows the x' }],
  states: ['unread', 'read', 'no link'],
  usages: [{ title: 'Kinds', render: () => h(Card, { padding: 'none', style: { maxWidth: 390 } }, h(NotificationRow, { kind: 'chat', title: 'New message from Front Desk Encino', body: 'He made a new friend, a Labradoodle called Nala.', time: '5 min ago', read: false, onClick: () => {} }), h(NotificationRow, { kind: 'photo', title: 'New photo of Biscuit', time: '9 min ago', read: false, onClick: () => {} }), h(NotificationRow, { kind: 'vaccine_expiring', title: 'Bordetella expires soon', body: "Bruno's Bordetella expires in 14 days", time: 'Yesterday', onClick: () => {}, onDismiss: () => {} }), h(NotificationRow, { kind: 'payment', title: 'Payment received', body: 'Deposit of $95.00 for PR-1009', time: 'Mon', onClick: () => {} }), h(NotificationRow, { kind: 'promo', title: 'App-user offer: 10% off a Gold Groom', time: 'Sep 12' })) }],
  a11y: ['Main area is a button (disabled when there is nothing to open); the unread dot has aria-label "Unread"; dismiss is a labelled button.'],
  usedBy: ['C-80', 'F-60'], figma: ['notification.png'],
});
