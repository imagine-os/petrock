import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { DeskChatThread } from './DeskChatThread';

const t = (min: number) => new Date(Date.now() - min * 60000).toISOString();
export default defineMeta({
  tier: 'organism', name: 'DeskChatThread', description: 'Front-desk view of the one chat thread per customer (R-M09): customer bubbles left, staff bubbles right in brand purple, system markers ("Session start") centred, day separators, relative times and a composer (Enter sends, Shift+Enter breaks a line).',
  props: [{ name: 'messages', type: 'DeskChatMessage[]', required: true, description: '{ id, sender, text, sentAt, imageUrl?, senderName? }' }, { name: 'customerName', type: 'string', required: true, description: 'For avatar and labels' }, { name: 'staffName', type: 'string', description: 'Label on staff bubbles' }, { name: 'onSend', type: '(text) => Promise<void>', description: 'Composer handler; omit for read-only' }, { name: 'disabled', type: 'boolean', description: 'Disable composer' }],
  states: ['thread', 'empty', 'read-only'],
  usages: [{ title: 'Thread', render: () => h('div', { style: { maxWidth: 560, height: 360 } }, h(DeskChatThread, { customerName: 'Avery Thompson', staffName: 'Marcus', onSend: async () => {}, messages: [{ id: '0', sender: 'system', text: 'Session start', sentAt: t(60 * 26) }, { id: '1', sender: 'customer', text: 'How much is the Gold package for a 30 lb dog?', sentAt: t(60 * 25) }, { id: '2', sender: 'staff', text: 'Hi Avery! Gold for a medium dog is on our price list in the app; want me to book Mochi for Friday?', sentAt: t(60 * 24) }, { id: '3', sender: 'customer', text: 'Yes please, 10am.', sentAt: t(30) }] })) }],
  a11y: ['role="log" with aria-live for new messages; composer has an aria-label; times use <time>.'],
  usedBy: ['F-61'], figma: ['message-1.jpg', 'Message Support.png'],
});
