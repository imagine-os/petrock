import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ManualCallout } from './ManualCallout';

export default defineMeta({
  tier: 'molecule', name: 'ManualCallout', description: 'Callout block for ops-manual chapters: note, tip, warning, decision needed, in-person lesson and online lesson tones. Chapters write `> NOTE: ...` lines; the manual renderer maps them here.',
  props: [{ name: 'tone', type: "'note'|'warning'|'decision'|'tip'|'in_person'|'online'", required: true, description: 'Tone' }, { name: 'title', type: 'string', description: 'Override label' }],
  states: ['note', 'tip', 'warning', 'decision', 'in_person', 'online'],
  usages: [{ title: 'Tones', render: () => h('div', null, h(ManualCallout, { tone: 'note' }, 'Prices on this page come from Settings; never type them.'), h(ManualCallout, { tone: 'warning' }, 'Never confirm a booking with missing vaccines without a manager PIN.'), h(ManualCallout, { tone: 'decision' }, 'Daycare full-day threshold: 5 h (app design) or 6 h (settings design)?'), h(ManualCallout, { tone: 'in_person' }, 'Shadow a check-in with the manager before doing one alone.')) }],
  a11y: ['role="note" (alert for warnings); label is visible text, not colour alone.'],
  usedBy: ['M-10', 'M-11', 'M-12', 'M-13', 'M-17'],
});
