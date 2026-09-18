import { createElement as h } from 'react';
import { Fragment } from 'react';
import { defineMeta } from '../../../design/meta';
import { ChatConversationRow } from './ChatConversationRow';
import { Card } from '../Card/Card';

export default defineMeta({
  tier: 'molecule', name: 'ChatConversationRow', description: 'Inbox list row with a location mark or person avatar, title, last-message preview ("You:" prefix for own messages), relative time and an unread counter.',
  props: [{ name: 'title', type: 'ReactNode', required: true, description: 'Thread title (Front Desk · Encino)' }, { name: 'preview', type: 'ReactNode', description: 'Last message' }, { name: 'time', type: 'ReactNode', description: 'Relative time' }, { name: 'unread', type: 'number', description: 'Unread count; bolds the row' }, { name: 'personName', type: 'string', description: 'Use a person avatar (staff inbox)' }, { name: 'to', type: 'string', description: 'Route (Link) or use onClick' }, { name: 'previewPrefix', type: 'string', description: '"You: "' }],
  states: ['read', 'unread', 'empty thread', 'person avatar'],
  usages: [{ title: 'Customer inbox', render: () => h(Fragment, null, h(Card, { padding: 'none', style: { maxWidth: 390 } }, h(ChatConversationRow, { title: 'Front Desk · Encino', preview: 'He made a new friend, a Labradoodle called Nala.', time: '9:24 AM', unread: 2, to: '/x' }), h(ChatConversationRow, { title: 'Front Desk · Westwood', preview: 'Thanks, we will see you at 7:00 AM.', previewPrefix: 'You: ', time: 'Sep 9', to: '/x' }), h(ChatConversationRow, { title: 'Avery Thompson', personName: 'Avery Thompson', preview: 'Could you send a photo?', time: '2 min ago', unread: 1, onClick: () => {} }))) }],
  a11y: ['Whole row is one link or button; the unread counter has an aria-label.'],
  usedBy: ['C-80', 'C-81'], figma: ['notification-1.png', 'message-1.jpg'],
});
