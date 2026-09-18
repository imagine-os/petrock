import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { InlineCell } from './InlineCell';

function Demo() {
  const [row, setRow] = useState<Record<string, unknown>>({ name: 'Biscuit', weight: 68, size: 'L', active: true });
  const set = (k: string) => (v: unknown) => setRow((r) => ({ ...r, [k]: v }));
  return h('table', { className: 'comp-props' }, h('tbody', null, h('tr', null, h('td', null, h(InlineCell, { value: row.name, type: 'text', onCommit: set('name'), label: 'name' })), h('td', null, h(InlineCell, { value: row.weight, type: 'number', onCommit: set('weight'), label: 'weight' })), h('td', null, h(InlineCell, { value: row.size, type: 'enum', options: ['S', 'M', 'L', 'XL', 'Giant'], onCommit: set('size'), label: 'size' })), h('td', null, h(InlineCell, { value: row.active, type: 'bool', onCommit: set('active'), label: 'active' })), h('td', null, h(InlineCell, { value: 'pet_1', type: 'readonly', onCommit: () => undefined, label: 'id' })))));
}

export default defineMeta({
  tier: 'molecule', name: 'InlineCell', description: 'Editable table cell: click or Enter to edit, Enter / blur commits, Escape cancels. Text, number, enum (select), bool (checkbox), date, JSON and read-only variants. The data workbench (D-10) renders every editable column with it.',
  props: [{ name: 'value', type: 'unknown', required: true, description: 'Current value' }, { name: 'type', type: 'InlineCellType', required: true, description: 'Editor kind' }, { name: 'options', type: 'string[]', description: 'Enum values' }, { name: 'nullable', type: 'boolean', description: 'Empty commits null' }, { name: 'onCommit', type: '(v) => void', required: true, description: 'Called once per change' }, { name: 'label', type: 'string', required: true, description: 'Accessible name' }],
  states: ['display', 'editing', 'bool', 'read-only'],
  usages: [{ title: 'One editable row', render: () => h(Demo) }],
  a11y: ['Display state is a button labelled "Edit <column>"; editors carry aria-label with the column name.', 'Keyboard: Enter opens and commits, Escape cancels, Tab commits on blur.'],
  usedBy: ['D-10'],
});
