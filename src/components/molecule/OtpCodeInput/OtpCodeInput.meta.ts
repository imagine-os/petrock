import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { OtpCodeInput } from './OtpCodeInput';

function Demo({ error }: { error?: string }) {
  const [v, setV] = useState(error ? '' : '4821');
  return h(OtpCodeInput, { value: v, onChange: setV, error: error ?? null });
}

export default defineMeta({
  tier: 'molecule', name: 'OtpCodeInput', description: 'Six single-digit boxes for one-time codes: auto-advance, Backspace walks back, arrows move, pasting fills the whole code, numeric keyboard and one-time-code autofill on phones.',
  props: [{ name: 'length', type: 'number', default: '6', description: 'Digits' }, { name: 'value', type: 'string', required: true, description: 'Digits typed so far' }, { name: 'onChange', type: '(code) => void', required: true, description: 'Change handler' }, { name: 'onComplete', type: '(code) => void', description: 'Fires once when full' }, { name: 'error', type: 'string', description: 'Clears the boxes and shows the message' }, { name: 'disabled', type: 'boolean', description: 'While verifying' }],
  states: ['empty', 'partial', 'complete', 'error', 'disabled'],
  usages: [{ title: 'Partially filled', render: () => h(Demo, {}) }, { title: 'Error', render: () => h(Demo, { error: 'That code is not right. 3 attempts left.' }) }],
  a11y: ['Each box has aria-label "Digit n of 6"; the group is labelled; the error is role=alert.', 'inputMode numeric and autocomplete one-time-code let iOS / Android offer the SMS code.'],
  usedBy: ['C-04', 'C-06'], figma: ['deep-dive 444:19287 (OTP Verify)'],
});
