import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { PinApprovalModal } from './PinApprovalModal';
import { Button } from '../../atom/Button/Button';

function Demo() { const [o, setO] = useState(false); const [msg, setMsg] = useState(''); return h('div', { className: 'stack-sm' }, h(Button, { variant: 'danger', icon: 'lock', onClick: () => setO(true) }, 'Cancel booking (needs PIN)'), msg && h('p', { className: 'small tone-success' }, msg), h(PinApprovalModal, { open: o, onClose: () => setO(false), request: { action: 'booking.status', title: 'Cancel PR-1002?', description: 'Cancelling a confirmed booking needs a manager PIN (try 2222 or 1111).', subjectTable: 'bookings', subjectId: 'bk_1002', details: { from: 'confirmed', to: 'cancelled' } }, onApproved: (a) => { setO(false); setMsg(`Approved by ${a.approved_by_name} (${a.approver_role})`); } })); }

export default defineMeta({
  tier: 'organism', name: 'PinApprovalModal', description: 'Manager PIN approval in place: any gated action (booking status change, refund, discount, delete) opens it; a manager / owner / super admin PIN approves and an `approvals` row is written before the action runs.',
  props: [{ name: 'request', type: 'PinApprovalRequest', required: true, description: '{ action, title?, description?, subjectTable?, subjectId?, details? }' }, { name: 'onApproved', type: '(approval) => void', required: true, description: 'Called with the written approval row' }, { name: 'open/onClose', type: '', required: true, description: 'Visibility' }],
  states: ['asking', 'wrong PIN', 'not an approver', 'approved'],
  usages: [{ title: 'Live (writes to approvals)', render: () => h(Demo) }],
  a11y: ['Inherits Modal semantics; the PinPad announces digit count and errors.'],
  usedBy: ['D-04'], figma: ['all reservation grooming-2.pdf (PIN Verification)', 'front desk-3.jpg'],
});
