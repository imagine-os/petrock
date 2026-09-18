import { createElement as h } from 'react';
import { Fragment } from 'react';
import { defineMeta } from '../../../design/meta';
import { AccountMenuRow } from './AccountMenuRow';
import { Toggle } from '../../atom/Toggle/Toggle';
import { Badge } from '../../atom/Badge/Badge';
import { Card } from '../Card/Card';

export default defineMeta({
  tier: 'molecule', name: 'AccountMenuRow', description: 'Menu row for the profile hub and settings screens: tinted line icon, label, optional description, value text, chevron or custom trailing control (Toggle, Badge). Renders a Link, a button or a static row.',
  props: [{ name: 'icon', type: 'IconName', required: true, description: 'Line icon' }, { name: 'label', type: 'ReactNode', required: true, description: 'Row label' }, { name: 'description', type: 'ReactNode', description: 'Second line' }, { name: 'value', type: 'ReactNode', description: 'Value before the chevron' }, { name: 'trailing', type: 'ReactNode', description: 'Replaces the chevron' }, { name: 'to', type: 'string', description: 'Route (renders a Link)' }, { name: 'onClick', type: '() => void', description: 'Action (renders a button)' }, { name: 'tone', type: "'default'|'primary'|'accent'|'danger'", default: 'default', description: 'Icon tint; danger colours the label too' }],
  states: ['link', 'button', 'static with toggle', 'danger', 'disabled'],
  usages: [
    { title: 'Profile hub list', render: () => h(Fragment, null, h(Card, { padding: 'none', style: { maxWidth: 390 } }, h(AccountMenuRow, { icon: 'user', label: 'Edit profile', description: 'Name, phone, address', to: '/x' }), h(AccountMenuRow, { icon: 'card', label: 'Payment methods', value: 'Visa ···· 4242', to: '/x' }), h(AccountMenuRow, { icon: 'bell', label: 'Notifications', trailing: h(Badge, { tone: 'danger', size: 'sm' }, '3'), to: '/x' }), h(AccountMenuRow, { icon: 'moon', label: 'Dark mode', trailing: h(Toggle, { checked: true, onChange: () => {} }) }), h(AccountMenuRow, { icon: 'trash', label: 'Delete account', tone: 'danger', onClick: () => {} }))) },
  ],
  a11y: ['Links and buttons are native elements; static rows carry no role.', 'Trailing toggles keep their own label association.'],
  usedBy: ['C-70', 'C-72', 'C-78'], figma: ['profile.jpg', 'setting.jpg', 'Frame 1171276432.png'],
});
