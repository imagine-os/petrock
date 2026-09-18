import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ChatMessageBubble } from './ChatMessageBubble';

const photo = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" rx="16" fill="#E8DFF5"/><circle cx="160" cy="100" r="50" fill="#552583"/></svg>');

export default defineMeta({
  tier: 'molecule', name: 'ChatMessageBubble', description: 'Chat message bubble. Own messages right-aligned in primary purple with a delivery state (sending / delivered / seen); Front Desk messages left with avatar and sender name; grouped bubbles hide the avatar; optional image attachment.',
  props: [{ name: 'text', type: 'string', description: 'Message text' }, { name: 'imageUrl', type: 'string | null', description: 'Photo attachment' }, { name: 'mine', type: 'boolean', required: true, description: 'Own message (right, purple)' }, { name: 'time', type: 'string', required: true, description: 'Formatted time' }, { name: 'senderName', type: 'string', default: 'Front Desk', description: 'Shown for their messages' }, { name: 'grouped', type: 'boolean', description: 'Same sender as previous: no avatar / name' }, { name: 'state', type: "'sending'|'delivered'|'seen'|'failed'", description: 'Read receipt under own messages' }, { name: 'onImageClick', type: '(url) => void', description: 'Open the photo' }],
  states: ['theirs', 'mine delivered', 'mine seen', 'sending', 'failed', 'image'],
  usages: [{ title: 'Thread', render: () => h('div', { style: { maxWidth: 390, background: 'var(--color-bg-phone)', padding: '8px 0' } },
    h(ChatMessageBubble, { mine: false, senderName: 'Front Desk Encino', text: 'Morning update: Biscuit ate all of his breakfast.', time: '9:12 AM' }),
    h(ChatMessageBubble, { mine: false, senderName: 'Front Desk Encino', grouped: true, imageUrl: photo, text: 'Here he is at playtime.', time: '9:20 AM' }),
    h(ChatMessageBubble, { mine: true, text: 'Love it, thank you!', time: '9:21 AM', state: 'seen' }),
    h(ChatMessageBubble, { mine: true, text: 'Could you send one more?', time: '9:22 AM', state: 'sending' })) }],
  a11y: ['Time uses <time>; the delivery state is text, not only an icon.', 'Image attachments are buttons labelled "Open photo" with the message text as alt.'],
  usedBy: ['C-82'], figma: ['Message Support.png', 'Message Support-1.png'],
});
