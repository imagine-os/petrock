import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { PinPad } from './PinPad';
import { findByPin } from '../../../auth/pin';

function Demo() { const [err, setErr] = useState<string | null>(null); const [ok, setOk] = useState(''); return h('div', { className: 'stack-sm' }, h(PinPad, { onSubmit: (p) => { const u = findByPin(p); if (u) { setOk(`Hello ${u.name}`); setErr(null); } else { setOk(''); setErr('PIN not recognised'); } }, error: err }), ok && h('p', { className: 'small tone-success', style: { textAlign: 'center' } }, ok)); }

export default defineMeta({
  tier: 'molecule', name: 'PinPad', description: '4-6 digit PIN entry with masked dots and a keypad; keyboard digits, Backspace and Enter work too. Used by A-00 login and the PinApprovalModal.',
  props: [{ name: 'onSubmit', type: '(pin) => void', required: true, description: 'Called with the PIN' }, { name: 'error', type: 'string', description: 'Clears the entry and shows the message' }, { name: 'busy', type: 'boolean', description: 'Disables keys' }, { name: 'autoSubmitAt', type: 'number', description: 'Submit automatically at N digits' }],
  states: ['empty', 'partial', 'error', 'busy'],
  usages: [{ title: 'Try demo PINs (3333 front desk, 2222 manager)', render: () => h(Demo) }],
  a11y: ['Dots region is aria-live; error is role="alert"; keypad buttons are labelled.'],
  usedBy: ['A-00'], figma: ['all reservation grooming-2.pdf (PIN Verification)'],
});
