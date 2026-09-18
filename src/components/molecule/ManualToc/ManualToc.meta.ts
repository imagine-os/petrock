import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ManualToc } from './ManualToc';

export default defineMeta({
  tier: 'molecule', name: 'ManualToc', description: 'In-page table of contents for an ops-manual chapter (anchors to its ## headings), with an active marker while scrolling.',
  props: [{ name: 'headings', type: '{ id, text, level? }[]', required: true, description: 'Headings in order' }, { name: 'active', type: 'string', description: 'Active heading id' }, { name: 'title', type: 'string', default: 'On this page', description: 'Label' }],
  states: ['default', 'active heading'],
  usages: [{ title: 'Chapter TOC', render: () => h('div', { style: { maxWidth: 240 } }, h(ManualToc, { active: 'check-in', headings: [{ id: 'opening', text: '1. Opening the desk' }, { id: 'check-in', text: '2. Check-in' }, { id: 'check-out', text: '3. Check-out' }, { id: 'online', text: 'Online lesson', level: 3 }] })) }],
  a11y: ['nav landmark with aria-label; smooth scroll keeps the hash in the URL.'],
  usedBy: ['M-10', 'M-11'],
});
