import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomStatusBadge } from './GroomStatusBadge';

export default defineMeta({
  tier: 'molecule', name: 'GroomStatusBadge', description: 'Status badge for Grooming & Spa appointments (requested, confirmed, in progress, done, cancelled, no show) using the shared Badge tones.',
  props: [{ name: 'status', type: 'GroomStatus', required: true, description: 'appointments.status' }, { name: 'size', type: "'sm'|'md'", default: 'md', description: 'Badge size' }],
  states: ['requested', 'confirmed', 'in_progress', 'done', 'cancelled', 'no_show'],
  usages: [{ title: 'All statuses', render: () => h('div', { className: 'row wrap' }, ...['requested', 'confirmed', 'in_progress', 'done', 'cancelled', 'no_show'].map((s) => h(GroomStatusBadge, { key: s, status: s }))) }],
  a11y: ['Text label always present; colour is secondary.'],
  usedBy: ['F-30', 'F-31', 'F-32', 'F-34', 'F-52', 'F-55'],
});
