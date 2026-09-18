import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { VaccineRecordForm } from './VaccineRecordForm';
import { Button } from '../../atom/Button/Button';

function Demo() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  return h('div', { className: 'row wrap' }, h(Button, { onClick: () => setOpen(true), variant: 'secondary' }, 'Open form'), saved && h('span', { className: 'small muted' }, saved), h(VaccineRecordForm, { open, onClose: () => setOpen(false), petName: 'Biscuit', vaccineName: 'Rabies', required: true, onSave: (d) => { setSaved(`Saved: given ${d.vaccinatedOn}, expires ${d.expiresOn}, ${d.proof?.name}`); setOpen(false); } }));
}

export default defineMeta({
  tier: 'organism', name: 'VaccineRecordForm', description: 'Modal form for one vaccine record: date given (not in the future), expiry prefilled from a default validity, and a proof upload that is required before the record can be submitted for verification (R-B03, R-B06, R-B09).',
  props: [{ name: 'open', type: 'boolean', required: true, description: 'Visible' }, { name: 'onClose', type: '() => void', required: true, description: 'Cancel / close' }, { name: 'petName', type: 'string', required: true, description: 'Shown in the intro line' }, { name: 'vaccineName', type: 'string', required: true, description: 'Modal title' }, { name: 'required', type: 'boolean', required: true, description: 'Required / Recommended tag' }, { name: 'initial', type: 'Partial<VaccineRecordDraft>', description: 'Existing record to edit' }, { name: 'defaultMonths', type: 'number', default: '12', description: 'Expiry = given + months when not typed' }, { name: 'onSave', type: '(draft) => void', required: true, description: 'Validated draft' }, { name: 'onRemove', type: '() => void', description: 'Shows a Remove button' }],
  states: ['empty', 'invalid (future date, missing proof)', 'uploading', 'valid', 'editing an existing record'],
  usages: [{ title: 'Open the form', render: () => h(Demo) }],
  a11y: ['Inherits the Modal contract (dialog, Escape, focus). Errors are attached to their fields; the proof requirement is repeated as text.'],
  usedBy: ['C-12', 'C-14', 'C-20', 'C-21'], figma: ['Pet Edit 5.png', 'Pet Edit 7.png', 'Choose Vaccine.png'],
});
