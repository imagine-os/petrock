import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { DeskAttachmentDropzone, type DeskAttachmentFile } from './DeskAttachmentDropzone';

function Demo() { const [files, setFiles] = useState<DeskAttachmentFile[]>([{ name: 'rabies-certificate.pdf', size_bytes: 184_320, mime: 'application/pdf', url: 'mock://uploads/rabies.pdf' }]); return h(DeskAttachmentDropzone, { files, onChange: setFiles }); }

export default defineMeta({
  tier: 'molecule', name: 'DeskAttachmentDropzone', description: 'Attachment dropzone from the Customer / Pet Details forms. Mock upload: files become mock:// URLs with name, size and mime; the list shows 100% with remove. Copy fixed from "Click to replace" to "Click to upload" (R-J11).',
  props: [{ name: 'files', type: 'DeskAttachmentFile[]', required: true, description: 'Current files' }, { name: 'onChange', type: '(files) => void', required: true, description: 'Add / remove' }, { name: 'label', type: 'string', default: 'Attachment', description: 'Heading' }, { name: 'accept', type: 'string', default: '.jpg,.jpeg,.png,.pdf', description: 'Accepted types (R-B06)' }, { name: 'multiple', type: 'boolean', default: 'true', description: 'Several files' }],
  states: ['empty', 'drag over', 'with files', 'disabled'],
  usages: [{ title: 'With one file', render: () => h(Demo) }],
  a11y: ['Dropzone is a focusable role=button; Enter / Space opens the picker.', 'Each file has a labelled remove button.'],
  usedBy: ['F-51', 'F-54', 'F-55'], figma: ['Customer Details.pdf', 'Pet Details .pdf', 'Pet Edit 7.png'],
});
