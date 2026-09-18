import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { DeskChatThread, type DeskChatMessage } from './DeskChatThread';

const now = Date.now();
function Demo() {
  const [msgs, setMsgs] = useState<DeskChatMessage[]>([{ id: '0', sender: 'system', text: 'Session start', at: new Date(now - 3_600_000).toISOString() }, { id: '1', sender: 'customer', text: 'Hello, good morning', at: new Date(now - 3_500_000).toISOString() }, { id: '2', sender: 'staff', senderName: 'Marcus', text: 'Hi Shane, good morning. How may I help you?', at: new Date(now - 3_400_000).toISOString() }, { id: '3', sender: 'customer', text: 'I want to know about your Gold package price.', at: new Date(now - 3_300_000).toISOString() }]);
  return h('div', { style: { height: 420 } }, h(DeskChatThread, { contactName: 'Shane Watson', online: true, messages: msgs, onAttach: () => {}, onSend: (text) => { setMsgs((m) => [...m, { id: String(m.length), sender: 'staff', senderName: 'You', text, at: new Date().toISOString() }]); } }));
}
export default defineMeta({
  tier: 'organism', name: 'DeskChatThread', description: 'Conversation pane from the Figma inbox: contact header (avatar, name, online), day separators, customer bubbles left / staff bubbles right / system markers centred, composer with attach and send. Enter sends.',
  props: [{ name: 'contactName', type: 'string', required: true, description: 'Customer' }, { name: 'messages', type: 'DeskChatMessage[]', required: true, description: 'Ordered messages' }, { name: 'onSend', type: '(text) => void', description: 'Reply' }, { name: 'onAttach', type: '() => void', description: 'Attach (mock)' }, { name: 'onBack', type: '() => void', description: 'Phone back button' }, { name: 'actions', type: 'ReactNode', description: 'Header actions (assign, close)' }, { name: 'disabled', type: 'boolean', description: 'Closed conversation' }],
  states: ['default', 'empty', 'closed (composer disabled)', 'phone (back button)'],
  usages: [{ title: 'Live', render: () => h(Demo) }],
  a11y: ['Message list is role=log aria-live=polite.', 'Composer has an aria-label; Shift+Enter inserts a line break.'],
  usedBy: ['F-57'], figma: ['message-1.jpg'],
});
