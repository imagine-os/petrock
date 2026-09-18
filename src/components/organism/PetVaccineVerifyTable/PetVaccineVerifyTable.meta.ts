import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PetVaccineVerifyTable } from './PetVaccineVerifyTable';

const rows = [
  { id: '1', typeName: 'Rabies', required: true, status: 'verified', vaccinatedOn: '2025-11-02', expiresOn: '2026-11-02', proofName: 'biscuit-rabies.pdf', proofUrl: 'mock://x', note: null, verifiedBy: 'Marcus Lee' },
  { id: '2', typeName: 'DHPP', required: true, status: 'submitted', vaccinatedOn: '2026-03-14', expiresOn: '2027-03-14', proofName: 'biscuit-dhpp.jpg', proofUrl: 'mock://y', note: null },
  { id: '3', typeName: 'Bordetella', required: true, status: 'expired', vaccinatedOn: '2025-01-10', expiresOn: '2026-01-10', proofName: 'bord.pdf', proofUrl: 'mock://z', note: null },
  { id: '4', typeName: 'Leptospirosis', required: false, status: 'missing', vaccinatedOn: null, expiresOn: null, proofName: null, proofUrl: null, note: null },
];
export default defineMeta({
  tier: 'organism', name: 'PetVaccineVerifyTable', description: 'Vaccine records table (Pet Details .pdf: Type, Vaccinated, Expires, Certificate, Status) with staff Verify / Reject / Upload / Dates actions. Verify triggers the R-X60 chain in the page. Optional pet + owner column for the F-56 queue.',
  props: [{ name: 'rows', type: 'VaccineVerifyRow[]', required: true, description: 'Records joined with their type' }, { name: 'canVerify', type: 'boolean', required: true, description: "can('vaccines.verify')" }, { name: 'showPet', type: 'boolean', description: 'Queue mode' }, { name: 'onVerify / onReject / onUpload / onEditDates', type: '(row) => void', description: 'Actions' }],
  states: ['verified', 'submitted (Verify / Reject)', 'expired', 'missing (Upload)', 'rejected'],
  usages: [{ title: 'One pet', render: () => h(PetVaccineVerifyTable, { rows, canVerify: true, onVerify: () => {}, onReject: () => {}, onUpload: () => {}, onEditDates: () => {} }) }],
  a11y: ['Built on DataTable (sortable headers, card fallback on phones).', 'Action buttons have text labels.'],
  usedBy: ['F-55', 'F-56'], figma: ['Pet Details .pdf'],
});
