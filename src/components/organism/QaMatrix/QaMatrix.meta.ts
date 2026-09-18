import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { QaMatrix, type QaCellStatus } from './QaMatrix';

export default defineMeta({
  tier: 'organism', name: 'QaMatrix', description: 'Grid of routes by widths (or any rows by columns) where each cell is pass / warn / fail with an optional issue count. Sticky row header, scrolls horizontally on phones.',
  props: [{ name: 'rows', type: 'QaMatrixRow[]', required: true, description: 'Row keys with label and sub-label' }, { name: 'cols', type: 'QaMatrixCol[]', required: true, description: 'Column keys with label' }, { name: 'cell', type: '(row, col) => QaCell', required: true, description: 'Status + count per cell' }, { name: 'onCell', type: '(row, col) => void', description: 'Makes cells clickable' }, { name: 'dense', type: 'boolean', default: 'false', description: 'Tighter cells' }],
  states: ['pass', 'warn', 'fail', 'none', 'clickable'],
  usages: [{ title: 'Three routes at five widths', render: () => { const s: QaCellStatus[] = ['pass', 'pass', 'warn', 'pass', 'fail']; return h(QaMatrix, { rows: [{ key: 'a', label: 'Hub', sub: '/' }, { key: 'b', label: 'Table library', sub: '/dev/tables' }, { key: 'c', label: 'Reservations', sub: '/desk/reservations' }], cols: [360, 390, 768, 1280, 1920].map((w) => ({ key: String(w), label: `${w}` })), cell: (r, c) => { const i = [360, 390, 768, 1280, 1920].indexOf(Number(c)); const st = r === 'c' ? s[i] : 'pass'; return { status: st, count: st === 'pass' ? 0 : i, title: `${r} at ${c}` }; }, onCell: () => undefined }); } }],
  a11y: ['Rendered as a real table with row and column headers.', 'Clickable cells are buttons with a full-sentence aria-label (route, width, status, count).', 'Status is icon + color, never color alone; the legend spells it out.'],
  usedBy: ['D-12', 'D-15'],
});
