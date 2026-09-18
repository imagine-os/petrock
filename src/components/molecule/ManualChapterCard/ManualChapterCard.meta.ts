import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ManualChapterCard } from './ManualChapterCard';

export default defineMeta({
  tier: 'molecule', name: 'ManualChapterCard', description: 'Chapter tile for the ops-manual cover: number, page code, title, summary, roles, reading time, capture / placeholder / decision counts, "For you" for the current role and a completion tick from training_completions.',
  props: [{ name: 'to', type: 'string', required: true, description: 'Chapter route' }, { name: 'code', type: 'string', required: true, description: 'M-xx' }, { name: 'number', type: 'string', required: true, description: 'Chapter number' }, { name: 'title', type: 'string', required: true, description: 'Title' }, { name: 'summary', type: 'string', description: 'One line' }, { name: 'roles', type: 'string[]', description: 'Audience' }, { name: 'minutes / figures / placeholders / decisions', type: 'number', description: 'Counts' }, { name: 'completed / recommended', type: 'boolean', description: 'State flags' }],
  states: ['default', 'recommended', 'completed'],
  usages: [{ title: 'Cards', render: () => h('div', { className: 'grid grid-3' }, h(ManualChapterCard, { to: '/manual', code: 'M-11', number: '11', title: 'Front desk daily operations', summary: 'Opening, the arrivals list, the day tabs, closing.', roles: ['front desk'], minutes: 8, figures: 3, recommended: true }), h(ManualChapterCard, { to: '/manual', code: 'M-13', number: '13', title: 'Vaccine verification', summary: 'Why bookings wait, how to verify a proof, what to say.', roles: ['front desk', 'manager'], minutes: 6, placeholders: 2, decisions: 1, completed: true })) }],
  a11y: ['Whole card is one link; counts have titles; completion has a title and is not colour-only.'],
  usedBy: ['M-01'],
});
