import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { GroomingAddonRow } from './GroomingAddonRow';

function Demo() {
  const [on, setOn] = useState<Record<string, boolean>>({ f: true });
  const row = (k: string, p: Parameters<typeof GroomingAddonRow>[0]) => h(GroomingAddonRow, { ...p, checked: !!on[k], onChange: (v: boolean) => setOn((s) => ({ ...s, [k]: v })) });
  return h('div', { className: 'stack-sm' },
    row('f', { name: 'Furminator', price: 25, addedMinutes: 20, checked: false, onChange: () => {} }),
    row('m', { name: 'Medicated Shampoo', price: 20, startingAt: true, addedMinutes: 10, checked: false, onChange: () => {} }),
    row('g', { name: 'Express Anal Glands (Internal)', price: 25, restricted: 'special employee', checked: false, onChange: () => {} }),
    row('s', { name: 'Sanitary Trim', price: 10, startingAt: true, description: 'Trim under paws, private areas, between eyes', checked: false, onChange: () => {} }));
}

export default defineMeta({
  tier: 'molecule', name: 'GroomingAddonRow', description: 'Add-on toggle row for the Grooming & Spa flow (Figma add-ons list): name, description / added minutes / employee restriction, green price with "from" for starting prices, and a Yes / No switch.',
  props: [{ name: 'name', type: 'string', required: true, description: '' }, { name: 'price', type: 'number', required: true, description: 'From addons table' }, { name: 'startingAt', type: 'boolean', description: '"from" prefix (R-G08, R-G11 "+")' }, { name: 'addedMinutes', type: 'number', description: 'Calendar minutes for the pet\'s size (R-G13)' }, { name: 'description', type: 'string', description: '' }, { name: 'restricted', type: 'string', description: 'employee_type restriction (R-G12)' }, { name: 'checked', type: 'boolean', required: true, description: '' }, { name: 'onChange', type: '(v: boolean) => void', required: true, description: '' }],
  states: ['off (dimmed)', 'on', 'disabled', 'starting price', 'restricted'],
  usages: [{ title: 'Add-ons list', render: () => h(Demo) }],
  a11y: ['Toggle is a role="switch" checkbox with a visible Yes / No label.'],
  usedBy: ['C-52'], figma: ['Frame 1171276429.png'],
});
