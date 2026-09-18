import { Avatar } from '../../atom/Avatar/Avatar';
import { Badge } from '../../atom/Badge/Badge';
import { Input } from '../../atom/Input/Input';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './DeskChatThreadList.css';

export interface DeskChatThreadItem { id: string; name: string; preview: string | null; when: string; unread: number; assignee?: string | null; status?: 'open' | 'closed' | string; location?: string | null; online?: boolean }
export interface DeskChatThreadListProps { items: DeskChatThreadItem[]; selectedId: string | null; onSelect: (id: string) => void; search: string; onSearch: (s: string) => void; title?: string; emptyText?: string }

/** Left pane of the Figma inbox (message-1.jpg): search + conversations with avatar, name, preview, relative time, unread badge; plus assignee / closed chips (D-018). */
export function DeskChatThreadList({ items, selectedId, onSelect, search, onSearch, title = 'Messages', emptyText = 'No conversations' }: DeskChatThreadListProps) {
  return (
    <div className="chatlist">
      <div className="chatlist-head"><h2 className="chatlist-title">{title}</h2><Badge size="sm">{items.length}</Badge></div>
      <Input size="sm" icon="search" placeholder="Search" value={search} onChange={(e) => onSearch(e.target.value)} aria-label="Search conversations" />
      <ul className="chatlist-items" role="listbox" aria-label="Conversations">
        {items.length === 0 && <li><EmptyState compact icon="message" title={emptyText} /></li>}
        {items.map((it) => (
          <li key={it.id}>
            <button type="button" role="option" aria-selected={selectedId === it.id} className={`chatlist-item ${selectedId === it.id ? 'is-selected' : ''} ${it.unread ? 'is-unread' : ''} ${it.status === 'closed' ? 'is-closed' : ''}`} onClick={() => onSelect(it.id)}>
              <span className="chatlist-avatar"><Avatar name={it.name} size={40} />{it.online && <span className="chatlist-online" aria-label="Online" />}</span>
              <span className="chatlist-text">
                <span className="chatlist-row"><span className="chatlist-name">{it.name}</span><span className="chatlist-when">{it.when}</span></span>
                <span className="chatlist-row"><span className="chatlist-preview">{it.preview ?? '—'}</span>{it.unread > 0 && <span className="chatlist-unread" aria-label={`${it.unread} unread`}>{it.unread}</span>}</span>
                {(it.assignee || it.status === 'closed' || it.location) && <span className="chatlist-chips">{it.assignee && <Badge size="sm" tone="primary">{it.assignee}</Badge>}{it.status === 'closed' && <Badge size="sm">closed</Badge>}{it.location && <Badge size="sm" tone="neutral">{it.location}</Badge>}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
