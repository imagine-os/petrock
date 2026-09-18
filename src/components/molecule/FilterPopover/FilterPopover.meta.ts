import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { FilterPopover } from './FilterPopover';
import { Select } from '../../atom/Select/Select';
import { Toggle } from '../../atom/Toggle/Toggle';

function Demo() {
  const [status, setStatus] = useState(''); const [closed, setClosed] = useState(false);
  const count = (status ? 1 : 0) + (closed ? 1 : 0);
  return h('div', { style: { display: 'flex', justifyContent: 'flex-end', minHeight: 240 } }, h(FilterPopover, { count, onClear: () => { setStatus(''); setClosed(false); } },
    h(Select, { label: 'Status', placeholder: 'Any status', value: status, onChange: (e: { target: { value: string } }) => setStatus(e.target.value), options: [{ value: 'confirmed', label: 'Confirmed' }, { value: 'checked_in', label: 'Checked in' }] }),
    h(Toggle, { size: 'sm', checked: closed, onChange: setClosed, label: 'Cancelled / no show' })));
}

export default defineMeta({
  tier: 'molecule', name: 'FilterPopover', description: 'Figma desk "Filters" tool button (white outline, filter glyph) that opens the filter controls in a popover so the table toolbar stays a single row. Shows the active-filter count and a Clear link.',
  props: [{ name: 'children', type: 'ReactNode', required: true, description: 'Select / Toggle / Input controls' }, { name: 'count', type: 'number', description: 'Active filters (badge)' }, { name: 'onClear', type: '() => void', description: 'Clear link in the panel head' }, { name: 'label', type: 'string', default: "'Filters'", description: 'Button text' }, { name: 'align', type: "'left' | 'right'", default: "'right'", description: 'Panel edge' }],
  states: ['closed', 'open', 'with active count'],
  usages: [{ title: 'Reservations filters', render: () => h(Demo) }],
  a11y: ['Button carries aria-expanded / aria-haspopup="dialog"; the panel is role="dialog"; Escape and outside click close it.'],
  usedBy: ['F-10', 'F-13'], figma: ['front desk.jpg (Filters)', 'all reservation grooming-2.jpg (Filters)'],
});
