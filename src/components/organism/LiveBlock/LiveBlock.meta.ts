import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { LiveBlock } from './LiveBlock';

export default defineMeta({
  tier: 'organism', name: 'LiveBlock', description: 'Renders an ops-manual directive ({{table:room_types}}, {{pricing:rooms}}, {{locations}}, {{statuses}}, {{rules:vaccines}}, {{roles}}, {{routes:frontdesk}}, {{capacities}}, {{vaccines}}, {{stats}}, {{demo-users}}, {{permissions:manager}}, {{tables}}) with data read from the tables, the rules registry, the route manifest and the domain, so a chapter never types a number the system owns (R-X43). Unknown directives explain themselves instead of breaking the page.',
  props: [{ name: 'kind', type: 'string', required: true, description: 'Directive name' }, { name: 'arg', type: 'string', description: 'Argument after the colon' }],
  states: ['table', 'pricing', 'locations', 'statuses', 'rules', 'unknown directive'],
  usages: [
    { title: '{{pricing:rooms}}', render: () => h(LiveBlock, { kind: 'pricing', arg: 'rooms' }) },
    { title: '{{statuses}}', render: () => h(LiveBlock, { kind: 'statuses' }) },
    { title: '{{table:vaccine_types}}', render: () => h(LiveBlock, { kind: 'table', arg: 'vaccine_types' }) },
    { title: 'Unknown directive', render: () => h(LiveBlock, { kind: 'weather' }) },
  ],
  a11y: ['Each block is a section with aria-label; tables are real tables; the "live" badge is text, not colour alone.'],
  usedBy: ['M-10', 'M-11', 'M-12', 'M-13', 'M-14', 'M-15', 'M-16', 'M-17', 'M-18', 'M-21', 'M-22', 'M-25'],
});
