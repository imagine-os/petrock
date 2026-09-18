import { createElement as h } from 'react';
import { defineMeta } from '../../../design/meta';
import { ChatTimelineMarker } from './ChatTimelineMarker';

export default defineMeta({
  tier: 'atom', name: 'ChatTimelineMarker', description: 'Centered pill in a chat timeline for session starts, day dividers and system notes.',
  props: [{ name: 'children', type: 'ReactNode', required: true, description: 'Pill text' }, { name: 'tone', type: "'neutral'|'primary'|'system'", default: 'neutral', description: 'Neutral day divider, primary session start, warn system note' }],
  states: ['neutral', 'primary', 'system'],
  usages: [{ title: 'Three tones', render: () => h('div', { style: { maxWidth: 360 } }, h(ChatTimelineMarker, { tone: 'primary' }, 'Session start'), h(ChatTimelineMarker, null, 'Today'), h(ChatTimelineMarker, { tone: 'system' }, 'Front Desk is closed · replies from 7:00 AM')) }],
  a11y: ['role="separator" with the text as aria-label so screen readers announce the boundary.'],
  usedBy: ['C-82'], figma: ['Message Support.png'],
});
