import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { PasswordField } from './PasswordField';

function Demo({ strength, initial = '' }: { strength: boolean; initial?: string }) {
  const [v, setV] = useState(initial);
  return h(PasswordField, { value: v, onChange: setV, showStrength: strength, label: strength ? 'New password' : 'Password', autoComplete: strength ? 'new-password' : 'current-password', placeholder: strength ? 'At least 8 characters' : 'Your password' });
}

export default defineMeta({
  tier: 'molecule', name: 'PasswordField', description: 'Password input with show / hide toggle; optional live strength meter (4 bars) and policy checklist: 8+ characters, a letter, a number, not a common password (R-X30).',
  props: [{ name: 'value', type: 'string', required: true, description: 'Controlled value' }, { name: 'onChange', type: '(v: string) => void', required: true, description: 'Change handler' }, { name: 'showStrength', type: 'boolean', default: 'false', description: 'Meter + checklist' }, { name: 'minLength', type: 'number', default: '8', description: 'From settings.auth.policy' }, { name: 'label', type: 'ReactNode', default: 'Password', description: 'Label' }, { name: 'error', type: 'ReactNode', description: 'Error text (Input)' }],
  states: ['hidden', 'visible', 'too weak', 'okay', 'strong', 'error'],
  usages: [
    { title: 'Sign in (hide / show)', render: () => h(Demo, { strength: false, initial: 'Biscuit!23' }) },
    { title: 'Sign up with strength meter', render: () => h(Demo, { strength: true, initial: 'Mochi2026' }) },
  ],
  a11y: ['Toggle button has aria-label and aria-pressed.', 'Strength label is aria-live; the checklist is linked with aria-describedby.', 'Never blocks paste; autocomplete hints new-password / current-password for password managers.'],
  usedBy: ['C-02', 'C-03', 'C-06'], figma: ['Frame 1171276421.png', 'Frame 1171276422.png'],
});
