import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { SearchHitList } from './SearchHitList';

export default defineMeta({
  tier: 'molecule', name: 'SearchHitList', description: 'Search results with highlighted matches: title link, folder tag, match count, path and a three-line snippet. Used by docs search (D-18); fits any in-app search.',
  props: [{ name: 'hits', type: 'SearchHit[]', required: true, description: 'Results in rank order' }, { name: 'query', type: 'string', required: true, description: 'Highlighted in title and snippet' }, { name: 'emptyText', type: 'string', description: 'Shown for zero hits' }],
  states: ['results', 'empty'],
  usages: [{ title: 'Two hits for "vaccine"', render: () => h(SearchHitList, { query: 'vaccine', hits: [{ key: '1', title: 'Business rules from designs', to: '/docs/rules/business-rules-from-designs', path: 'docs/rules/business-rules-from-designs.md', tag: 'rules', matches: 14, snippet: '... bookings stay pending until every required vaccine is verified by staff; expired vaccine records block check-in ...' }, { key: '2', title: 'D-04 · Table library', to: '/docs/pages/D-04', path: 'docs/pages/D-04.md', tag: 'pages', matches: 1, snippet: 'vaccine_records rows are edited through the generic table manager.' }] }) }],
  a11y: ['An ordered list labelled with the result count; matches use <mark>, which screen readers announce as highlighted.'],
  usedBy: ['D-18'],
});
