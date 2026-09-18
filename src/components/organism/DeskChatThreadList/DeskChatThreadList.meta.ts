import { createElement as h, useState } from 'react';
import { defineMeta } from '../../../design/meta';
import { DeskChatThreadList } from './DeskChatThreadList';

function Demo() {
  const [sel, setSel] = useState<string | null>('1'); const [q, setQ] = useState('');
  const items = [{ id: '1', name: 'Shane Watson', preview: 'I wanted one extra bed in my room.', when: '5 min ago', unread: 0, online: true, assignee: 'Marcus' }, { id: '2', name: 'Perry Mate', preview: 'I wanted to know about my booking.', when: '20 min ago', unread: 3 }, { id: '3', name: 'Kane Williamson', preview: 'Sure, will share it with you.', when: 'Yesterday', unread: 0, status: 'closed' }];
  return h('div', { style: { maxWidth: 380, height: 320 } }, h(DeskChatThreadList, { items: items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())), selectedId: sel, onSelect: setSel, search: q, onSearch: setQ }));
}
export default defineMeta({
  tier: 'organism', name: 'DeskChatThreadList', description: 'Conversation list from the Figma front desk inbox: search, avatar with online dot, name, preview, relative time, unread count; assignee / closed / location chips added per D-018.',
  props: [{ name: 'items', type: 'DeskChatThreadItem[]', required: true, description: 'Threads' }, { name: 'selectedId', type: 'string | null', required: true, description: 'Open thread' }, { name: 'onSelect', type: '(id) => void', required: true, description: 'Open a thread' }, { name: 'search / onSearch', type: 'string / fn', required: true, description: 'Controlled search' }],
  states: ['selected', 'unread', 'closed', 'empty'],
  usages: [{ title: 'Three threads', render: () => h(Demo) }],
  a11y: ['role=listbox / option with aria-selected.', 'Unread count has an aria-label.'],
  usedBy: ['F-57'], figma: ['message-1.jpg'],
});
