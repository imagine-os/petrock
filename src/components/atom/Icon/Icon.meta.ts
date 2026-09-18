import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Icon, ICONS, FIGMA_ICON_NAMES, type IconName } from './Icon';

const gallery = (names: IconName[], size = 20, bg?: string) => h('div', { className: 'row wrap', style: { gap: 12, padding: bg ? 12 : 0, background: bg, borderRadius: 8, color: bg ? '#fff' : undefined } }, ...names.map((n) => h('span', { key: n, className: 'row', style: { gap: 6, fontSize: 12 } }, h(Icon, { name: n, size }), n)));

export default defineMeta({
  tier: 'atom', name: 'Icon', description: 'One <Icon name> over two registries: 24-box outlines (1.5 px) for generic glyphs and the Figma exports / redrawn vectors (filled two-tone settings-row icons, Iconly Category, notes icons, bottom nav home / ticket / paw disc / gear, services tiles, chat-notification, filled calendar and clock). Multi-path icons keep their own viewBox and use currentColor unless a layer is fixed (the nav paw disc).',
  props: [{ name: 'name', type: 'IconName', required: true, description: 'Icon key (outline set or Figma set)' }, { name: 'size', type: 'number', default: '20', description: 'Pixel size' }, { name: 'strokeWidth', type: 'number', default: '1.5', description: 'Outline weight (nav / header glyphs use 2)' }, { name: 'title', type: 'string', description: 'Accessible title (otherwise decorative)' }],
  states: ['default'],
  usages: [
    { title: 'Bottom nav glyphs (white on primary, 34..46 px)', render: () => gallery(['nav-home', 'nav-ticket', 'nav-paw', 'nav-settings'], 36, 'var(--color-primary)') },
    { title: 'Services tiles (provisional line art from Services.png)', render: () => gallery(['svc-hotel', 'svc-spa', 'svc-daycare', 'svc-inhome'], 36, 'var(--color-primary)') },
    { title: 'Figma filled icons (settings rows, notifications, notes)', render: () => h('div', { style: { color: 'var(--color-icon-primary)' } }, gallery(FIGMA_ICON_NAMES.filter((n) => !n.startsWith('nav-') && !n.startsWith('svc-')), 20)) },
    { title: 'Coral variant (alternating rows: Lock, Logout, Trash Bin, Users, medal)', render: () => h('div', { style: { color: 'var(--color-accent-coral)' } }, gallery(['lock-filled', 'logout-filled', 'trash-filled', 'users-filled', 'user-filled-2', 'medal', 'tag'], 20)) },
    { title: 'Outline set (1.5 px)', render: () => gallery(Object.keys(ICONS) as IconName[]) },
  ],
  a11y: ['Decorative by default (aria-hidden); pass title for meaningful icons.'],
  usedBy: ['HUB-01', 'D-02', 'C-10', 'C-70', 'C-80', 'F-01'],
  figma: ['Calendar.svg', 'Message.svg', 'Moon.svg', 'Setting.svg', 'Shield-Done.svg', 'Lock.svg', 'Logout.svg', 'User.svg', 'User-1.svg', 'User-2.svg', 'Users.svg', 'Trash Bin.svg', 'Arrow-Right.svg', 'Info-Circle.svg', 'Qustion-Circle.svg', 'Lable.svg', 'animal-rescue_1796941.svg', 'hair-clipper_6644387 1.svg', 'medal_1380490 1.svg', 'Iconly/Two-tone/Category.svg', 'Home Page.png', 'Services.png'],
});
