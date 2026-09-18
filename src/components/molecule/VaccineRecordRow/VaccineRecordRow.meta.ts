import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { VaccineRecordRow } from './VaccineRecordRow';
import { Button } from '../../atom/Button/Button';

export default defineMeta({
  tier: 'molecule', name: 'VaccineRecordRow', description: 'One vaccine of a pet: name with Required / Recommended tag, status chip (R-X20), given / expires dates, proof file name and an action slot (Upload / Update).',
  props: [{ name: 'name', type: 'string', required: true, description: 'Vaccine type name' }, { name: 'required', type: 'boolean', required: true, description: 'Required vs recommended (R-B01 / R-B02)' }, { name: 'status', type: 'VaccineChipStatus', required: true, description: 'Derived status' }, { name: 'vaccinatedOn', type: 'string', description: 'Preformatted date' }, { name: 'expiresOn', type: 'string', description: 'Preformatted date' }, { name: 'proofName', type: 'string', description: 'Uploaded file name' }, { name: 'note', type: 'string', description: 'Staff note (e.g. rejection reason)' }, { name: 'action', type: 'ReactNode', description: 'Button on the right' }],
  states: ['verified', 'pending', 'expired', 'missing', 'rejected'],
  usages: [{ title: 'Mixed', render: () => h('div', { className: 'stack-sm', style: { maxWidth: 480 } }, h(VaccineRecordRow, { name: 'Rabies', required: true, status: 'verified', vaccinatedOn: '3 Mar 2026', expiresOn: '3 Mar 2027', proofName: 'Biscuit-Rabies.pdf', action: h(Button, { size: 'sm', variant: 'secondary' }, 'Update') }), h(VaccineRecordRow, { name: 'Bordetella', required: true, status: 'expired', vaccinatedOn: '1 Jun 2025', expiresOn: '1 Jun 2026', action: h(Button, { size: 'sm' }, 'Upload') }), h(VaccineRecordRow, { name: 'Leptospirosis', required: false, status: 'missing', action: h(Button, { size: 'sm', variant: 'secondary' }, 'Upload') })) }],
  a11y: ['Status has icon + text; the action is a real button supplied by the page.'],
  usedBy: ['C-12', 'C-13', 'C-20', 'C-21'], figma: ['Pet Edit 5.png', 'Choose Vaccine.png'],
});
