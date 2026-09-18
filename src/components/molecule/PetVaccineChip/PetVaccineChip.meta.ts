import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PetVaccineChip } from './PetVaccineChip';

export default defineMeta({
  tier: 'molecule', name: 'PetVaccineChip', description: 'Vaccine standing of a pet computed from vaccine_records against the required vaccine_types: OK, proof to verify, expired, missing, rejected.',
  props: [{ name: 'overall', type: "'ok'|'pending'|'expired'|'missing'|'rejected'", required: true, description: 'Worst state among required vaccines' }, { name: 'detail', type: 'string', description: 'e.g. "2/3"' }, { name: 'size', type: "'sm'|'md'", default: 'sm', description: 'Badge size' }],
  states: ['ok', 'pending', 'expired', 'missing', 'rejected'],
  usages: [{ title: 'States', render: () => h('div', { className: 'row wrap' }, h(PetVaccineChip, { overall: 'ok', detail: '3/3' }), h(PetVaccineChip, { overall: 'pending', detail: '2/3' }), h(PetVaccineChip, { overall: 'expired', detail: 'Bordetella' }), h(PetVaccineChip, { overall: 'missing', detail: 'Rabies' }), h(PetVaccineChip, { overall: 'rejected' })) }],
  a11y: ['Icon plus text; title attribute repeats the label.'],
  usedBy: ['F-30', 'F-32', 'F-33', 'F-53', 'F-55', 'F-56'], figma: ['Grooming.png (red cross flag)', 'Board Booking.pdf (Vaccination column)'],
});
