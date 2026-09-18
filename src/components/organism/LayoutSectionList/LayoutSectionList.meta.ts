import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { LayoutSectionList, type LayoutSectionItem } from './LayoutSectionList';

function Demo() {
  const [items, setItems] = useState<LayoutSectionItem[]>([{ name: 'PageHeader', hidden: false }, { name: 'StatTiles', hidden: false }, { name: 'ArrivalsTable', hidden: false }, { name: 'DeparturesTable', hidden: true }]);
  return h(LayoutSectionList, { items, onChange: setItems });
}

export default defineMeta({
  tier: 'organism', name: 'LayoutSectionList', description: 'Ordered list of a page\'s sections with drag-and-drop reordering, up/down buttons and a visibility toggle per section. The layout editor (D-11) saves the result to page_layouts.',
  props: [{ name: 'items', type: '{ name, hidden }[]', required: true, description: 'Sections in order' }, { name: 'onChange', type: '(items) => void', required: true, description: 'New order / visibility' }, { name: 'disabled', type: 'boolean', default: 'false', description: 'Read-only' }],
  states: ['default', 'dragging', 'drop target', 'hidden section', 'disabled'],
  usages: [{ title: 'Four sections, one hidden', render: () => h(Demo) }],
  a11y: ['Every move is also a button (Move X up / down), so keyboards and screen readers never need drag and drop.', 'Visibility toggle has an sr-only label naming the section.', 'Hidden sections are struck through and dimmed, not only faded.'],
  usedBy: ['D-11'],
});
