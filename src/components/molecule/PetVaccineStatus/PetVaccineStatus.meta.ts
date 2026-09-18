import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { PetVaccineStatus } from './PetVaccineStatus';
import type { PetVaccineSummary } from '../../../modules/frontdesk-reservations/lib/vaccines';

const ok: PetVaccineSummary = { state: 'verified', ok: true, verified: ['Rabies', 'DHPP', 'Bordetella'], submitted: [], expired: [], missing: [], soon: ['Bordetella'] };
const bad: PetVaccineSummary = { state: 'expired', ok: false, verified: ['DHPP'], submitted: ['Rabies'], expired: ['Bordetella'], missing: [], soon: [] };
const missing: PetVaccineSummary = { state: 'missing', ok: false, verified: [], submitted: [], expired: [], missing: ['Rabies', 'DHPP', 'Bordetella'], soon: [] };

export default defineMeta({
  tier: 'molecule', name: 'PetVaccineStatus', description: 'Vaccine state of one pet as the desk sees it: verified / submitted / expired / missing, with a chip per required vaccine naming the problem (the red-cross flag of the timeline bars).',
  props: [{ name: 'summary', type: 'PetVaccineSummary', required: true, description: 'From petVaccineSummary(petId, records, types)' }, { name: 'compact', type: 'boolean', description: 'One small badge with a tooltip (table cells)' }, { name: 'petName', type: 'string', description: 'Prefix for the tooltip' }],
  states: ['verified', 'expires soon', 'submitted', 'expired', 'missing', 'compact'],
  usages: [{ title: 'Full', render: () => h('div', { className: 'stack-sm' }, h(PetVaccineStatus, { summary: ok }), h(PetVaccineStatus, { summary: bad }), h(PetVaccineStatus, { summary: missing })) }, { title: 'Compact (table cells)', render: () => h('div', { className: 'row wrap' }, h(PetVaccineStatus, { summary: ok, compact: true, petName: 'Biscuit' }), h(PetVaccineStatus, { summary: bad, compact: true, petName: 'Bruno' })) }],
  a11y: ['Badge text carries the state; the compact form exposes the detail as a title attribute.'],
  usedBy: ['F-10', 'F-11', 'F-12', 'F-13'], figma: ['all reservation grooming-2.jpg'],
});
