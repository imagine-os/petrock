import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { Button } from '../../atom/Button/Button';
import { OtpVerifyModal } from './OtpVerifyModal';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
function Demo() {
  const [open, setOpen] = useState(false);
  return h('div', null, h(Button, { variant: 'secondary', onClick: () => setOpen(true) }, 'Open verify modal'),
    h(OtpVerifyModal, { open, onClose: () => setOpen(false), destination: 'r•••y@demo.petrock.test', onVerify: async (c: string) => { await wait(300); return c === '123456' ? null : 'Not right; try 123456.'; }, onResend: () => wait(300), onVerified: () => setTimeout(() => setOpen(false), 600) }));
}

export default defineMeta({
  tier: 'organism', name: 'OtpVerifyModal', description: 'OtpVerifyPanel inside a small Modal (bottom sheet on phones). The D-010 "OTP Verify" artefact; sign-in opens it when the account email is not verified yet.',
  props: [{ name: 'open', type: 'boolean', required: true, description: 'Visible' }, { name: 'onClose', type: '() => void', required: true, description: 'Close / later' }, { name: 'title', type: 'ReactNode', default: 'Verify your email', description: 'Header' }, { name: '...panel', type: 'OtpVerifyPanelProps', description: 'destination, onVerify, onResend, onVerified' }],
  states: ['closed', 'open', 'verified'],
  usages: [{ title: 'Open from a button', render: () => h(Demo) }],
  a11y: ['Inherits Modal: role=dialog, focus moves to the first digit box, Escape closes.', 'Scrim click does not close it (a half-typed code is easy to lose).'],
  usedBy: ['C-02'], figma: ['deep-dive 444:19287 (OTP Verify)'],
});
