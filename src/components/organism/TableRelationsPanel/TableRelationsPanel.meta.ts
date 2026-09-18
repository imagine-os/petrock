import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { tableRegistry } from '../../../data/schema';
import { TableRelationsPanel } from './TableRelationsPanel';

export default defineMeta({
  tier: 'organism', name: 'TableRelationsPanel', description: 'Outgoing and incoming foreign keys of a table, computed from ColumnDef.references across the whole schema. Each relation links to the other table; optional "show rows" callback filters the workbench.',
  props: [{ name: 'table', type: 'TableDef', required: true, description: 'The table' }, { name: 'counts', type: 'Record<string, number>', description: 'Row counts to display' }, { name: 'linkTo', type: '(table) => string', default: '/dev/data/:table', description: 'Link target builder' }, { name: 'onPick', type: '(table, column, dir) => void', description: 'Filter callback' }],
  states: ['with relations', 'isolated table'],
  usages: [{ title: 'bookings', render: () => h(TableRelationsPanel, { table: tableRegistry.bookings }) }],
  a11y: ['Relations are list items with real links; direction is spelled out in the headings, not by arrows alone.'],
  usedBy: ['D-10'],
});
