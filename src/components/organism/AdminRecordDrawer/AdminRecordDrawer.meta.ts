import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { AdminRecordDrawer } from './AdminRecordDrawer';
import { Button } from '../../atom/Button/Button';

function Demo() {
  const [open, setOpen] = useState(false);
  return h('div', null, h(Button, { onClick: () => setOpen(true), icon: 'plus' }, 'Add room rate'), h(AdminRecordDrawer, {
    open, onClose: () => setOpen(false), title: 'Room rate', initial: null,
    fields: [{ key: 'room_type_id', label: 'Room type', type: 'select', required: true, options: [{ value: 'rt_penthouse', label: 'Penthouse' }, { value: 'rt_suite', label: 'Suite' }] }, { key: 'day_kind', label: 'Days', type: 'select', required: true, options: [{ value: 'weekday', label: 'Mon-Thu' }, { value: 'weekend', label: 'Fri-Sun' }] }, { key: 'price_per_night', label: 'Price per night', type: 'money', required: true, min: 0 }, { key: 'active', label: 'Active', type: 'toggle' }],
    onSave: async () => undefined,
  }));
}
export default defineMeta({
  tier: 'organism', name: 'AdminRecordDrawer', description: 'Generic add / edit drawer for settings, pricing and staff rows driven by a field list (text, number, money, percent, select, bool, toggle, textarea, date, time, json, color). Required and custom validation; Delete is PIN-gated through PinApprovalModal (R-X42).',
  props: [{ name: 'fields', type: 'AdminField[]', required: true, description: 'Field definitions' }, { name: 'initial', type: 'Record<string, unknown> | null', required: true, description: 'Row being edited; null or no id = new' }, { name: 'onSave', type: '(values) => Promise<void>', required: true, description: 'Called with parsed values' }, { name: 'onDelete', type: '(values, approval) => Promise<void>', description: 'Enables the PIN-gated Delete button' }, { name: 'children', type: 'ReactNode | (values) => ReactNode', description: 'Preview under the fields' }],
  states: ['new', 'editing', 'validation errors', 'saving', 'delete approval'],
  usages: [{ title: 'Add a room rate', render: () => h(Demo) }],
  a11y: ['Inherits Drawer focus handling; every field is a labelled library control; errors render inline.'],
  usedBy: ['A-10', 'A-11', 'A-12', 'A-20', 'A-21', 'A-22', 'A-23', 'A-24', 'A-25', 'A-26', 'A-28', 'A-30'],
});
