import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { AdminPermissionMatrix } from './AdminPermissionMatrix';

function Demo() {
  const [g, setG] = useState<Record<string, boolean>>({ 'bookings.read|owner': true, 'bookings.read|manager': true, 'bookings.read|front_desk': true, 'payments.refund|owner': true, 'payments.refund|manager': true });
  return h(AdminPermissionMatrix, {
    columns: [{ key: 'super_admin', label: 'Super admin', readOnly: true }, { key: 'owner', label: 'Owner' }, { key: 'manager', label: 'Manager' }, { key: 'front_desk', label: 'Front desk' }],
    rows: [{ key: 'bookings.read', label: 'See bookings', group: 'Bookings' }, { key: 'bookings.cancel', label: 'Cancel a booking', group: 'Bookings' }, { key: 'payments.refund', label: 'Create refunds', group: 'Payments' }],
    granted: (r, c) => c === 'super_admin' || !!g[`${r}|${c}`],
    onToggle: (r, c, next) => setG((s) => ({ ...s, [`${r}|${c}`]: next })),
  });
}
export default defineMeta({
  tier: 'organism', name: 'AdminPermissionMatrix', description: 'Roles x permissions grid with sticky header and first column, grouped permission rows, per-column counts and locked columns (super admin). Click a cell to toggle.',
  props: [{ name: 'columns', type: 'AdminPermissionMatrixColumn[]', required: true, description: 'Roles' }, { name: 'rows', type: 'AdminPermissionMatrixRow[]', required: true, description: 'Permissions with optional group' }, { name: 'granted', type: '(row, col) => boolean', required: true, description: 'Cell state' }, { name: 'onToggle', type: '(row, col, next) => void', description: 'Cell click' }],
  states: ['granted', 'not granted', 'locked column', 'read-only'],
  usages: [{ title: 'Three permissions, four roles', render: () => h(Demo) }],
  a11y: ['Cells are buttons with aria-pressed and a full-sentence aria-label; the table scrolls horizontally on phones with the permission column pinned.'],
  usedBy: ['A-31'], figma: ['10.pdf'],
});
