import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { ReservationDayNav } from './ReservationDayNav';
import { toIso } from '../DatePicker/DatePicker';

function Demo({ rangeDays, step }: { rangeDays?: number; step?: number }) {
  const [day, setDay] = useState(toIso(new Date()));
  return h(ReservationDayNav, { value: day, onChange: setDay, rangeDays, step });
}

export default defineMeta({
  tier: 'molecule', name: 'ReservationDayNav', description: 'The Figma date navigator for reservation views: calendar icon opens a month picker popover, arrows move by a day (or a week), the label reads "Today" or "Feb 22, 2024" and jumps back to today.',
  props: [{ name: 'value', type: 'string (YYYY-MM-DD)', required: true, description: 'Selected day' }, { name: 'onChange', type: '(day) => void', required: true, description: 'Day picked' }, { name: 'step', type: 'number', default: '1', description: 'Days per arrow' }, { name: 'rangeDays', type: 'number', description: 'Show a range label of this many days (timeline week view)' }, { name: 'size', type: "'sm'|'md'", default: 'md', description: 'Compact variant' }],
  states: ['today', 'specific date', 'picker open', 'range (week)'],
  usages: [{ title: 'Day', render: () => h(Demo, {}) }, { title: 'Week range', render: () => h(Demo, { rangeDays: 7, step: 7 }) }],
  a11y: ['Arrows are labelled icon buttons; the popover closes on Escape and outside click; picker days are gridcells.'],
  usedBy: ['F-01', 'F-10', 'F-13', 'F-14'], figma: ['Frame 1171276264-10.png', 'Frame 1171276264-2.png'],
});
