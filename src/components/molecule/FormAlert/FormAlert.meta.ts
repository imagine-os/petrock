import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Button } from '../../atom/Button/Button';
import { FormAlert } from './FormAlert';

export default defineMeta({
  tier: 'molecule', name: 'FormAlert', description: 'Inline form message (danger / warn / info / success) with icon, optional title and action. Auth pages use it for friendly errors that do not belong to one field.',
  props: [{ name: 'tone', type: "'danger'|'warn'|'info'|'success'", default: 'info', description: 'Colour + icon' }, { name: 'title', type: 'ReactNode', description: 'Bold first line' }, { name: 'children', type: 'ReactNode', description: 'Body' }, { name: 'action', type: 'ReactNode', description: 'Link / button under the text' }, { name: 'icon', type: 'IconName', description: 'Override icon' }],
  states: ['danger', 'warn', 'info', 'success'],
  usages: [
    { title: 'Danger with action', render: () => h(FormAlert, { tone: 'danger', title: "That email and password don't match.", action: h(Button, { variant: 'link', size: 'sm' }, 'Forgot password?') }, 'Check both and try again.') },
    { title: 'Info and success', render: () => h('div', { className: 'stack-sm' }, h(FormAlert, { tone: 'info' }, 'Demo: the code is 482 913.'), h(FormAlert, { tone: 'success', title: 'Password updated' }, 'Sign in with your new password.')) },
  ],
  a11y: ['Danger uses role=alert (announced immediately); other tones use role=status.'],
  usedBy: ['C-02', 'C-03', 'C-04', 'C-05', 'C-06', 'C-07'],
});
