import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PasswordStrengthBar } from './PasswordStrengthBar';

export default defineMeta({
  tier: 'atom', name: 'PasswordStrengthBar', description: 'Password strength meter: four segments coloured danger -> success, a Weak / Fair / Good / Strong label and the rule checklist. Exports passwordChecks() / passwordScore() for form validation.',
  props: [{ name: 'password', type: 'string', required: true, description: 'Current value' }, { name: 'showChecks', type: 'boolean', default: 'true', description: 'Show the rule list' }],
  states: ['empty', 'weak', 'fair', 'good', 'strong'],
  usages: [{ title: 'Levels', render: () => h('div', { className: 'stack', style: { maxWidth: 360 } }, h(PasswordStrengthBar, { password: 'biscuit' }), h(PasswordStrengthBar, { password: 'biscuit12' }), h(PasswordStrengthBar, { password: 'Biscuit12', showChecks: false }), h(PasswordStrengthBar, { password: 'Biscuit12!' })) }],
  a11y: ['role="meter" with min/max/now; label text is not colour-only; aria-live announces changes.'],
  usedBy: ['C-84', 'C-03'],
});
