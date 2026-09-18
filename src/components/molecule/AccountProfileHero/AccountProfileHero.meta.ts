import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { AccountProfileHero } from './AccountProfileHero';

export default defineMeta({
  tier: 'molecule', name: 'AccountProfileHero', description: 'Profile header with a large avatar in a dashed accent ring, a camera badge that opens a photo picker (mock upload to a data URL), the name and the email.',
  props: [{ name: 'name', type: 'string', required: true, description: 'Display name (initials fallback)' }, { name: 'email', type: 'string | null', description: 'Shown under the name' }, { name: 'avatarUrl', type: 'string | null', description: 'Photo' }, { name: 'onPhoto', type: '(dataUrl: string) => void', description: 'Enables the camera badge' }, { name: 'maxBytes', type: 'number', default: '1500000', description: 'Reject bigger files (onTooLarge)' }, { name: 'size', type: 'number', default: '104', description: 'Avatar diameter' }],
  states: ['with photo', 'initials', 'read-only (no camera)'],
  usages: [
    { title: 'Editable', render: () => h(AccountProfileHero, { name: 'Avery Thompson', email: 'avery@demo.petrock.test', onPhoto: () => {} }) },
    { title: 'Read-only, smaller', render: () => h(AccountProfileHero, { name: 'Maya Okafor', size: 72 }) },
  ],
  a11y: ['Camera badge is a button labelled "Change photo"; the file input is visually hidden.', 'Avatar exposes the name through role="img".'],
  usedBy: ['C-70', 'C-71'], figma: ['profile.jpg', 'Frame 1171276432.png'],
});
