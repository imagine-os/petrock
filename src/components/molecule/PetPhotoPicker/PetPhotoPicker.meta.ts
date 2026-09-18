import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { PetPhotoPicker } from './PetPhotoPicker';

function Demo() { const [v, setV] = useState<string | null>(null); return h(PetPhotoPicker, { name: 'Boss', value: v, onChange: setV }); }

export default defineMeta({
  tier: 'molecule', name: 'PetPhotoPicker', description: 'Round pet photo with a green camera badge (Pet Edit.png). Picks a photo, downsizes it to a 160 px square JPEG data URL (mock storage) and shows initials until one exists.',
  props: [{ name: 'name', type: 'string', required: true, description: 'Pet name for initials and labels' }, { name: 'value', type: 'string | null', required: true, description: 'Photo URL / data URL' }, { name: 'onChange', type: '(dataUrl | null) => void', required: true, description: 'New photo or removal' }, { name: 'size', type: 'number', default: '96', description: 'Diameter in px' }, { name: 'disabled', type: 'boolean', description: 'Read-only' }],
  states: ['empty (initials)', 'with photo', 'disabled'],
  usages: [{ title: 'Pick a photo', render: () => h(Demo) }, { title: 'Read-only', render: () => h(PetPhotoPicker, { name: 'Mochi', value: null, onChange: () => {}, disabled: true }) }],
  a11y: ['The whole avatar is a button labelled "Add photo" / "Change photo"; the file input is hidden and triggered from it.'],
  usedBy: ['C-12', 'C-14'], figma: ['Pet Edit.png', 'Frame 1171276417.png'],
});
