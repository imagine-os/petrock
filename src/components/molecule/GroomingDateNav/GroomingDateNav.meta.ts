import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomingDateNav } from './GroomingDateNav';

function Demo() { const [d, setD] = useState(new Date().toISOString().slice(0, 10)); return h(GroomingDateNav, { value: d, onChange: setD }); }

export default defineMeta({
  tier: 'molecule', name: 'GroomingDateNav', description: 'Day navigator from the Figma agenda card: calendar (month popover), previous, "Today" / "Mar 21, 2024" label, next. Children slot for filters and view toggles.',
  props: [{ name: 'value', type: 'string (YYYY-MM-DD)', required: true, description: 'Selected day' }, { name: 'onChange', type: '(isoDay) => void', required: true, description: 'Day changed' }, { name: 'children', type: 'ReactNode', description: 'Extra controls on the right' }, { name: 'size', type: "'sm'|'md'", default: 'md', description: 'Control height' }],
  states: ['today', 'other day (label turns primary, click returns to today)', 'picker open'],
  usages: [{ title: 'Interactive', render: () => h(Demo) }],
  a11y: ['Arrow buttons are labelled icon buttons.', 'Popover closes on Escape and outside click.'],
  usedBy: ['F-30', 'F-31', 'F-32'], figma: ['Frame 1171276264-11.png', 'front desk-12.jpg', 'Grooming.png'],
});
