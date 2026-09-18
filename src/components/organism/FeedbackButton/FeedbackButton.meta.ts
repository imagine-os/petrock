import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { FeedbackButton } from './FeedbackButton';

export default defineMeta({
  tier: 'organism', name: 'FeedbackButton', description: 'Floating feedback button on every staff page (DesktopShell mounts it). Category + text, written to the `feedback` table with page code, route, user and role; the owner reads the inbox (A-36).',
  props: [{ name: 'pageCode', type: 'string', required: true, description: 'Spec code of the page' }, { name: 'route', type: 'string', required: true, description: 'Route path' }],
  states: ['button', 'modal open', 'sent (toast)'],
  usages: [{ title: 'Static (normally fixed bottom-left)', render: () => h('div', { style: { position: 'relative', height: 56 } }, h('div', { style: { position: 'absolute', inset: 0, transform: 'translateZ(0)' } }, h(FeedbackButton, { pageCode: 'D-02', route: '/dev/components' }))) }],
  a11y: ['Button has aria-label; modal inherits dialog semantics.'],
  usedBy: ['D-01', 'D-02', 'D-03', 'D-04', 'D-05'],
});
