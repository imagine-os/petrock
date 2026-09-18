import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { BookingPetCard } from './BookingPetCard';

function Demo() {
  const [sel, setSel] = useState<string[]>(['Biscuit']);
  const toggle = (n: string) => setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  return h('div', { className: 'row wrap', style: { alignItems: 'stretch' } },
    h(BookingPetCard, { name: 'Biscuit', breed: 'Golden Retriever', weightLbs: 68, approval: 'approved', vaccine: 'ok', selected: sel.includes('Biscuit'), onToggle: () => toggle('Biscuit') }),
    h(BookingPetCard, { name: 'Mochi', breed: 'Shiba Inu', weightLbs: 22, approval: 'approved', vaccine: 'pending', selected: sel.includes('Mochi'), onToggle: () => toggle('Mochi') }),
    h(BookingPetCard, { name: 'Daisy', breed: 'Beagle', weightLbs: 26, approval: 'pending', vaccine: 'missing', selected: false, disabled: true, disabledReason: 'Waiting for approval' }),
  );
}

export default defineMeta({
  tier: 'molecule', name: 'BookingPetCard', description: 'Selectable pet card for the hotel / daycare / grooming booking flows: avatar, name, breed and weight, approval and vaccine chips; filled purple when selected (Figma Choose Pets).',
  props: [{ name: 'name', type: 'string', required: true, description: 'Pet name' }, { name: 'breed', type: 'string | null', description: 'Sub line' }, { name: 'weightLbs', type: 'number | null', description: 'Shown as "68 lb"; drives room-fit rules' }, { name: 'approval', type: 'string', description: 'pets.approval_status; non-approved shows a chip' }, { name: 'vaccine', type: "'ok'|'pending'|'missing'|'expired'", description: 'Derived from vaccine_records' }, { name: 'selected', type: 'boolean', required: true, description: 'aria-pressed' }, { name: 'onToggle', type: '() => void', description: 'Click handler' }, { name: 'disabled', type: 'boolean', description: 'With disabledReason shown under the chips' }, { name: 'compact', type: 'boolean', description: 'Row layout for summaries' }],
  states: ['default', 'selected', 'disabled (with reason)', 'compact'],
  usages: [{ title: 'Choose pets', render: () => h(Demo) }, { title: 'Compact', render: () => h('div', { className: 'stack-sm', style: { maxWidth: 320 } }, h(BookingPetCard, { name: 'Biscuit', compact: true, selected: true }), h(BookingPetCard, { name: 'Mochi', compact: true, selected: false })) }],
  a11y: ['Native <button> with aria-pressed.', 'Disabled reason is also the title attribute.'],
  usedBy: ['C-30', 'C-32', 'C-33'], figma: ['Choose Pets-3.png', 'Frame 1171276425.png'],
});
