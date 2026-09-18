import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { Button } from '../../atom/Button/Button';
import { OnboardingIntroModal } from './OnboardingIntroModal';

function Demo() {
  const [open, setOpen] = useState(false);
  return h('div', null, h(Button, { variant: 'secondary', icon: 'sparkle', onClick: () => setOpen(true) }, 'How Petrock works'), h(OnboardingIntroModal, { open, onClose: () => setOpen(false) }));
}

export default defineMeta({
  tier: 'organism', name: 'OnboardingIntroModal', description: 'Three-slide first-run intro (add dogs, upload vaccines, book) with dots, Skip / Next and a final Get started action. Shown once on the welcome screen (C-01) and on demand from the account-created screen (C-08).',
  props: [{ name: 'open', type: 'boolean', required: true, description: 'Visible' }, { name: 'onClose', type: '() => void', required: true, description: 'Skip / close' }, { name: 'slides', type: 'OnboardingSlide[]', description: 'icon, title, body (default 3 slides)' }, { name: 'doneLabel', type: 'string', default: 'Get started', description: 'Last button' }, { name: 'onDone', type: '() => void', description: 'After the last slide' }],
  states: ['slide 1', 'slide 2', 'last slide'],
  usages: [{ title: 'Open the intro', render: () => h(Demo) }],
  a11y: ['Dots are a tablist with aria-selected; the slide body is aria-live.', 'Escape closes; the scrim does not (people tap around while reading).'],
  usedBy: ['C-01', 'C-08'],
});
