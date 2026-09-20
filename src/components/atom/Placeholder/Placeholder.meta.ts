import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { Button } from '../Button/Button';
import { Placeholder } from './Placeholder';

export default defineMeta({
  tier: 'atom', name: 'Placeholder',
  description: 'Wraps UI that is designed but not wired yet (D-201, D-202): "Not wired yet" tooltip on hover and on focus, an info toast instead of the action, and a dashed outline plus a badge whenever the builder tool is on. Sets data-placeholder so unwired controls can be counted.',
  props: [
    { name: 'children', type: 'ReactNode', required: true, description: 'The control that is not wired' },
    { name: 'what', type: 'string', default: 'This control', description: 'Named in the toast body; keep it translated' },
    { name: 'className', type: 'string', description: 'Extra classes on the wrapper' },
  ],
  states: ['default', 'hover / focus (tooltip)', 'activated (toast)', 'builder tool on (dashed outline + badge)'],
  usages: [
    { title: 'Around a button that is not wired', render: () => h(Placeholder, { what: 'Canvas' }, h(Button, { variant: 'outline', icon: 'grid', iconRight: 'arrow-right' }, 'Canvas')) },
    { title: 'Around a primary action', render: () => h(Placeholder, { what: 'Demo simulator' }, h(Button, { icon: 'expand' }, 'Demo simulator')) },
  ],
  a11y: ['The tooltip opens on focus as well as hover, so keyboard and pen users get the same warning.', 'Activation is swallowed on capture (click, Enter, Space) and answered with an aria-live toast, so nothing silently does nothing.', 'title carries the same message for screen readers and for pointer users who hover the wrapper.'],
  usedBy: ['HUB-01'],
});
