import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { PetDocumentUpload, type UploadedDocument } from './PetDocumentUpload';

function Demo({ initial }: { initial: UploadedDocument | null }) {
  const [v, setV] = useState<UploadedDocument | null>(initial);
  return h(PetDocumentUpload, { label: 'Rabies certificate', value: v, onChange: setV, hint: 'Pick a file to see the mock progress bar' });
}

export default defineMeta({
  tier: 'molecule', name: 'PetDocumentUpload', description: 'Dashed drop-zone for vaccine invoices / certificates with a mock upload: progress bar, size and percent, cancel mid-way, replace or remove once done (Pet Edit 5-7). Accepts .jpg .png .pdf (R-B06); storage is mocked as mock://uploads/<name>.',
  props: [{ name: 'value', type: 'UploadedDocument | null', required: true, description: '{ name, sizeBytes, type, url }' }, { name: 'onChange', type: '(doc | null) => void', required: true, description: 'Called when the mock upload finishes or the file is removed' }, { name: 'accept', type: 'string[]', default: "['.jpg','.jpeg','.png','.pdf']", description: 'Allowed extensions' }, { name: 'maxMb', type: 'number', default: '20', description: 'Size limit' }, { name: 'label', type: 'string', description: 'Field label' }, { name: 'hint', type: 'string', description: 'Help text' }, { name: 'simulateMs', type: 'number', default: '1400', description: 'Mock upload duration' }, { name: 'disabled', type: 'boolean', description: 'Read-only' }],
  states: ['empty', 'drag over', 'uploading (progress, cancel)', 'done (check, replace / remove)', 'error (wrong type / too big)'],
  usages: [{ title: 'Empty', render: () => h(Demo, { initial: null }) }, { title: 'Done', render: () => h(Demo, { initial: { name: 'biscuit-rabies.pdf', sizeBytes: 2.1 * 1024 * 1024, type: 'application/pdf', url: 'mock://uploads/biscuit-rabies.pdf' } }) }],
  a11y: ['The picker is a button; the hidden file input is triggered from it. Progress uses role="progressbar" with aria-valuenow and a live region.'],
  usedBy: ['C-12', 'C-14', 'C-20', 'C-21'], figma: ['Pet Edit 5.png', 'Pet Edit 7.png', 'Choose Vaccine.png'],
});
