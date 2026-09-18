import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { OtpVerifyPanel } from './OtpVerifyPanel';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default defineMeta({
  tier: 'molecule', name: 'OtpVerifyPanel', description: '"We sent a code to ..." + OtpCodeInput + Verify button + Resend with a 30 s cooldown (R-X32). Verifies automatically when the sixth digit lands; shows a Verified state on success.',
  props: [{ name: 'destination', type: 'string', required: true, description: 'Masked email / phone' }, { name: 'onVerify', type: '(code) => Promise<string|null>', required: true, description: 'null = ok, string = error' }, { name: 'onResend', type: '() => Promise<void>', required: true, description: 'Send a new code' }, { name: 'onVerified', type: '() => void', description: 'After success' }, { name: 'resendSeconds', type: 'number', default: '30', description: 'Cooldown' }, { name: 'expiresMinutes', type: 'number', default: '10', description: 'Copy only' }],
  states: ['waiting', 'verifying', 'error', 'verified', 'resend cooldown'],
  usages: [{ title: 'Accepts 123456', render: () => h(OtpVerifyPanel, { destination: 'a•••y@demo.petrock.test', autoFocus: false, onVerify: async (c: string) => { await wait(400); return c === '123456' ? null : 'That code is not right. Try 123456 here.'; }, onResend: () => wait(400) }) }],
  a11y: ['Verified state is role=status; the error comes from OtpCodeInput (role=alert).', 'Resend button is disabled during the cooldown and says how long is left.'],
  usedBy: ['C-04'], figma: ['deep-dive 444:19287 (OTP Verify)'],
});
