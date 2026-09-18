import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { DatePicker, toIso } from './DatePicker';

function Demo() { const t = new Date(); const [v, setV] = useState<string | null>(toIso(t)); const end = toIso(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 3)); return h(DatePicker, { label: 'Check-in', value: v, onChange: setV, rangeEnd: end, min: toIso(t) }); }

export default defineMeta({
  tier: 'molecule', name: 'DatePicker', description: 'Month-grid date picker with min/max, disabled dates and a range highlight (check-in to check-out). No external library.',
  props: [{ name: 'value', type: 'string | null', required: true, description: 'ISO date' }, { name: 'onChange', type: '(iso) => void', required: true, description: 'Handler' }, { name: 'min/max', type: 'string', description: 'ISO bounds' }, { name: 'rangeEnd', type: 'string', description: 'Second date to highlight the range' }, { name: 'disabledDates', type: '(iso) => boolean', description: 'e.g. boarding closed days' }],
  states: ['today', 'selected', 'in range', 'disabled'],
  usages: [{ title: 'Range', render: () => h(Demo) }],
  a11y: ['role=grid; each day is a button with an ISO aria-label and aria-selected.'],
  usedBy: [], figma: ['Choose Your Room-2.png', 'DayCare.png'],
});
