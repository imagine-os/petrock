import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { tableRegistry } from '../../../data/schema';
import { Button } from '../../atom/Button/Button';
import { CsvImportModal } from './CsvImportModal';

function Demo() { const [open, setOpen] = useState(false); return h('div', null, h(Button, { variant: 'secondary', icon: 'upload', onClick: () => setOpen(true) }, 'Import CSV into rooms'), h(CsvImportModal, { open, table: tableRegistry.rooms, onClose: () => setOpen(false), onImport: () => undefined })); }

export default defineMeta({
  tier: 'organism', name: 'CsvImportModal', description: 'CSV import for any table: file or paste, header-to-column mapping (auto by name), type coercion from ColumnDef, five-row preview, insert or upsert. Exposes parseCsv / toCsv / coerce for the export button too.',
  props: [{ name: 'table', type: 'TableDef', required: true, description: 'Target table' }, { name: 'open / onClose', type: 'boolean / () => void', required: true, description: 'Modal state' }, { name: 'onImport', type: '(rows, mode) => Promise<void>', required: true, description: 'Receives coerced rows' }],
  states: ['empty', 'parsed with mapping', 'preview', 'importing'],
  usages: [{ title: 'Open the importer', render: () => h(Demo) }],
  a11y: ['File input is keyboard reachable through its label; the textarea and every mapping select are labelled.', 'The footer states rows, mapped columns and unmapped required columns as text before you commit.'],
  usedBy: ['D-10'],
});
