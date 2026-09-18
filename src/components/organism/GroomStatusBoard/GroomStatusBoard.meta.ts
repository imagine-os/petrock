import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomStatusBoard, type GroomBoardItem } from './GroomStatusBoard';
import { GroomAppointmentCard } from '../../molecule/GroomAppointmentCard/GroomAppointmentCard';

function Demo() {
  const [items, setItems] = useState<GroomBoardItem[]>([
    { id: '1', status: 'requested', node: h(GroomAppointmentCard, { label: 'Alkoby, LOUIE; Poodle mix; Gold Groom Medium', status: 'requested', timeLabel: '9:00 AM', flags: { warning: true } }) },
    { id: '2', status: 'confirmed', node: h(GroomAppointmentCard, { label: 'Wong, TEDDY; Cairn Terrier; Diamond Groom Medium', status: 'confirmed', timeLabel: '10:00 AM' }) },
    { id: '3', status: 'in_progress', node: h(GroomAppointmentCard, { label: 'Howe, OZZIE; Mini Aussie; Platinum Groom Medium', status: 'in_progress', timeLabel: '12:00 PM' }) },
  ]);
  const cols = [{ key: 'requested', label: 'Requested' }, { key: 'confirmed', label: 'Confirmed' }, { key: 'in_progress', label: 'In progress' }, { key: 'done', label: 'Done' }];
  const next: Record<string, string[]> = { requested: ['confirmed'], confirmed: ['in_progress'], in_progress: ['done'], done: [] };
  return h(GroomStatusBoard, { columns: cols, items, allowedMoves: (it) => (next[it.status] ?? []).map((to) => ({ to, label: to })), onMove: (it, to) => setItems((l) => l.map((x) => (x.id === it.id ? { ...x, status: to, node: h(GroomAppointmentCard, { label: 'Moved card', status: to }) } : x))) });
}
export default defineMeta({
  tier: 'organism', name: 'GroomStatusBoard', description: 'Kanban board by appointment status (D-008). Columns collapse, cards drag between allowed columns or move through a "Move to" menu; PIN-gated moves show a lock. Stacks vertically on phones.',
  props: [{ name: 'columns', type: 'GroomBoardColumn[]', required: true, description: 'Status columns' }, { name: 'items', type: 'GroomBoardItem[]', required: true, description: 'Cards with status and rendered node' }, { name: 'allowedMoves', type: '(item) => {to,label,pin?}[]', required: true, description: 'Lifecycle rules' }, { name: 'onMove', type: '(item, to) => void', required: true, description: 'Status change requested' }],
  states: ['default', 'drag over column', 'collapsed column', 'empty column (drop target)'],
  usages: [{ title: 'Four columns', render: () => h(Demo) }],
  a11y: ['Column headers are buttons with aria-expanded.', 'Move menu is keyboard reachable as an alternative to drag and drop.'],
  usedBy: ['F-31'],
});
