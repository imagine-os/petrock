import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { PetChoiceStrip } from './PetChoiceStrip';

const PETS = [
  { id: 'a', name: 'Biscuit', breed: 'Golden Retriever', size: 'L', approval: 'approved', vaccinesOk: true },
  { id: 'b', name: 'Mochi', breed: 'Shiba Inu', size: 'M', approval: 'approved', vaccinesOk: false },
  { id: 'c', name: 'Daisy', breed: 'Beagle', size: 'M', approval: 'pending', vaccinesOk: false },
];
function Demo({ multiple }: { multiple: boolean }) {
  const [v, setV] = useState<string[]>(['a']);
  return h(PetChoiceStrip, { pets: PETS, value: v, onChange: setV, multiple, label: multiple ? 'Select your pets' : 'Choose pet', onAddPet: () => {} });
}

export default defineMeta({
  tier: 'molecule', name: 'PetChoiceStrip', description: 'Horizontal row of selectable pet cards for booking flows (Figma "Choose Pet" / "Select Your Pet"): avatar, name, breed and size, approval and vaccine badges, filled purple when selected. Single or multi select, optional "Add a pet" card. Scrolls on phones, wraps on desktop.',
  props: [{ name: 'pets', type: 'PetChoice[]', required: true, description: 'id, name, breed, size, photoUrl, approval, vaccinesOk' }, { name: 'value', type: 'string[]', required: true, description: 'Selected ids' }, { name: 'onChange', type: '(ids: string[]) => void', required: true, description: '' }, { name: 'multiple', type: 'boolean', default: 'false', description: 'Multi select (daycare)' }, { name: 'label', type: 'string', description: 'Group label' }, { name: 'onAddPet', type: '() => void', description: 'Shows the dashed Add a pet card' }, { name: 'disabledIds', type: 'string[]', description: 'Pets that cannot be picked' }],
  states: ['default', 'selected', 'pending approval', 'vaccines pending', 'disabled'],
  usages: [{ title: 'Single select (grooming)', render: () => h(Demo, { multiple: false }) }, { title: 'Multi select (daycare)', render: () => h(Demo, { multiple: true }) }],
  a11y: ['Each card is a button with aria-pressed.', 'Group labelled by the label prop.'],
  usedBy: ['C-51', 'C-61'], figma: ['Frame 1171276428.png', 'DayCare-1.png'],
});
