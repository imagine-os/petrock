import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PageStub } from './PageStub';

export default defineMeta({
  tier: 'template', name: 'PageStub', description: 'Placeholder for a spec\'d-but-unbuilt route: code, name, purpose, planned layout, tables and rules. A module replaces it by registering a real route at the same path (the registry prefers non-stub routes).',
  props: [{ name: 'spec', type: 'PageSpec', required: true, description: 'The page spec' }],
  states: ['default', 'dev mode (open spec button)'],
  usages: [{ title: 'Sample', render: () => h(PageStub, { spec: { code: 'C-30', name: 'Choose room', purpose: 'Pick Penthouse or Suite for the stay.', layout: ['RoomTypeCards', 'Inclusions', 'BookNow'], data: ['room_types', 'rates'], roles: ['customer'], logic: [], integrations: [], components: ['Card', 'Button'] } }) }],
  a11y: ['Plain document structure with one h1.'],
  usedBy: [],
});
