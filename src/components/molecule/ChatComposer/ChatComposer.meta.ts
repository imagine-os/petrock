import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ChatComposer } from './ChatComposer';

export default defineMeta({
  tier: 'molecule', name: 'ChatComposer', description: 'Chat input row: quick-reply chips (hidden once typing starts), attach-photo button with preview, auto-growing textarea, round send button. Enter sends, Shift+Enter adds a line.',
  props: [{ name: 'onSend', type: '(text, imageDataUrl?) => void | Promise<void>', required: true, description: 'Called with trimmed text and optional image' }, { name: 'quickReplies', type: 'string[]', description: 'Chips above the input' }, { name: 'placeholder', type: 'string', default: 'Write a message…', description: 'Input placeholder' }, { name: 'attachments', type: 'boolean', default: 'true', description: 'Show the attach button' }, { name: 'maxImageBytes', type: 'number', default: '2000000', description: 'Reject bigger images (onImageTooLarge)' }, { name: 'disabled', type: 'boolean', description: 'Thread closed' }, { name: 'hint', type: 'ReactNode', description: 'Line under the composer' }],
  states: ['empty (send disabled)', 'typing', 'with attachment preview', 'sending', 'disabled'],
  usages: [{ title: 'With quick replies', render: () => h('div', { style: { maxWidth: 390, border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' } }, h(ChatComposer, { onSend: () => {}, quickReplies: ['How is Biscuit doing?', 'Could you send a photo?', 'Running 15 min late'], hint: 'Front Desk Encino replies 7:00 AM – 7:00 PM' })) }],
  a11y: ['Textarea labelled "Message"; send and attach are labelled buttons; quick replies sit in a role="group".', 'Send stays disabled while empty so a stray Enter never posts a blank message.'],
  usedBy: ['C-82'], figma: ['Message Support.png'],
});
