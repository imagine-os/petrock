import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { Modal } from './Modal';
import { Button } from '../../atom/Button/Button';

function Demo() { const [o, setO] = useState(false); return h('div', null, h(Button, { variant: 'secondary', onClick: () => setO(true) }, 'Open modal'), h(Modal, { open: o, onClose: () => setO(false), title: 'Hey! To book, please add a pet first', size: 'sm', footer: h('div', { className: 'row' }, h(Button, { variant: 'ghost', onClick: () => setO(false) }, 'Back'), h(Button, { onClick: () => setO(false) }, 'Add a pet')) }, h('p', { className: 'muted' }, 'A booking needs at least one approved pet on your account.'))); }

export default defineMeta({
  tier: 'organism', name: 'Modal', description: 'Centered dialog on a scrim; bottom sheet under 600 px. Escape / scrim close, focus is moved inside, body scroll locked. Every confirm / prompt / PIN dialog uses it.',
  props: [{ name: 'open', type: 'boolean', required: true, description: 'Visible' }, { name: 'onClose', type: '() => void', required: true, description: 'Close handler' }, { name: 'title', type: 'ReactNode', description: 'Header' }, { name: 'footer', type: 'ReactNode', description: 'Actions' }, { name: 'size', type: "'sm'|'md'|'lg'", default: 'md', description: '400 / 560 / 820 px' }],
  states: ['closed', 'open', 'bottom sheet (phone)'],
  usages: [{ title: 'Confirm', render: () => h(Demo) }],
  a11y: ['role=dialog aria-modal; Escape closes; focus restored on close.'],
  usedBy: ['A-00', 'D-04', 'D-05'], figma: ['Home Page-4.png', 'Home Page-5.png'],
});
