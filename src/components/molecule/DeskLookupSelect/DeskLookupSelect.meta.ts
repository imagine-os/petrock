import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { DeskLookupSelect } from './DeskLookupSelect';

function Demo() { const [b, setB] = useState(''); const [v, setV] = useState(''); return h('div', { className: 'grid grid-2' }, h(DeskLookupSelect, { kind: 'breed', label: 'Breed', value: b, onChange: setB, required: true }), h(DeskLookupSelect, { kind: 'vet', label: 'Vet', value: v, onChange: setV })); }

export default defineMeta({
  tier: 'molecule', name: 'DeskLookupSelect', description: 'Dropdown backed by the lookup_values table (breed, colour, city, reference, attribute, title, temper) or the vets table, with the Figma "+" that adds a value inline and persists it (R-J04, R-B08).',
  props: [{ name: 'kind', type: "LookupKind | 'vet'", required: true, description: 'Which list' }, { name: 'label', type: 'string', required: true, description: 'Field label' }, { name: 'value', type: 'string', required: true, description: 'Selected value (vet id for vets)' }, { name: 'onChange', type: '(v) => void', required: true, description: 'Selection or new value' }, { name: 'allowAdd', type: 'boolean', default: 'true', description: 'Show the + button' }, { name: 'required', type: 'boolean', description: 'Asterisk' }, { name: 'error', type: 'string', description: 'Validation message' }],
  states: ['select', 'adding (inline input with Add / Cancel)', 'error'],
  usages: [{ title: 'Breed and vet', render: () => h(Demo) }],
  a11y: ['The + is a labelled icon button; Enter adds, Escape cancels.'],
  usedBy: ['F-51', 'F-54'], figma: ['Customer Details.pdf', 'Pet Details .pdf'],
});
