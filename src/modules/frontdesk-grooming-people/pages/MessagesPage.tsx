import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../../components/molecule/Tabs/Tabs';
import { Card } from '../../../components/molecule/Card/Card';
import { Button } from '../../../components/atom/Button/Button';
import { Select } from '../../../components/atom/Select/Select';
import { Badge } from '../../../components/atom/Badge/Badge';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { DeskChatThreadList, type DeskChatThreadItem } from '../../../components/organism/DeskChatThreadList/DeskChatThreadList';
import { DeskChatThread, type DeskChatMessage } from '../../../components/organism/DeskChatThread/DeskChatThread';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { useData, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import type { ConversationRow, LocationRow, MessageRow, UserRow } from '../../../data/schema/core';
import type { ConversationAssignmentRow } from '../../../data/schema/frontdesk-grooming-people';
import { usePeople } from '../hooks';
import { fullName, notify, relativeTime } from '../lib';
import '../module.css';

type Filter = 'mine' | 'unassigned' | 'all' | 'closed';

/** F-57 Staff messages inbox. */
export function MessagesPage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user, can } = useSession();
  const { scope, locationId, allLocations } = useLocation();
  const { search } = useRouterLocation();
  const q = useMemo(() => new URLSearchParams(search), [search]);
  const { customers, customerById, pets } = usePeople();
  const { rows: conversations } = useTable<ConversationRow>('conversations', { where: scope, orderBy: { column: 'last_message_at', dir: 'desc' } });
  const { rows: assignments } = useTable<ConversationAssignmentRow>('conversation_assignments');
  const { rows: users } = useTable<UserRow>('users');
  const { rows: locations } = useTable<LocationRow>('locations');
  const [selected, setSelected] = useState<string | null>(q.get('conversation'));
  const [filter, setFilter] = useState<Filter>('all');
  const [searchText, setSearchText] = useState('');
  const { rows: messages } = useTable<MessageRow>('messages', { where: { conversation_id: selected ?? '__none__' }, orderBy: { column: 'sent_at' } });
  const staff = useMemo(() => users.filter((u) => ['front_desk', 'manager', 'groomer', 'owner', 'super_admin'].includes(u.role) && (allLocations || !u.location_id || u.location_id === locationId)), [users, allLocations, locationId]);
  const assignmentOf = (cid: string) => assignments.filter((a) => a.conversation_id === cid).sort((a, b) => b.assigned_at.localeCompare(a.assigned_at))[0];

  // ?customer= opens (or creates) that customer's thread
  useEffect(() => {
    const cid = q.get('customer'); if (!cid || selected) return;
    const existing = conversations.find((c) => c.customer_id === cid);
    if (existing) { setSelected(existing.id); return; }
    const c = customerById.get(cid); if (!c) return;
    data.insert<ConversationRow>('conversations', { location_id: c.home_location_id ?? locationId, customer_id: cid, last_message_at: new Date().toISOString(), last_preview: null, unread_staff: 0, unread_customer: 0, status: 'open' }).then(async (row) => { await data.insert<MessageRow>('messages', { conversation_id: row.id, sender: 'system', sender_user_id: null, text: `Session start · opened by ${user.name}`, image_url: null, sent_at: new Date().toISOString(), read: true }); setSelected(row.id); });
  }, [q, conversations, customerById, selected, data, locationId, user.name]);
  // mark read on open
  useEffect(() => {
    if (!selected) return;
    const conv = conversations.find((c) => c.id === selected);
    const unread = messages.filter((m) => m.sender === 'customer' && !m.read);
    if (!conv || (!unread.length && !conv.unread_staff)) return;
    Promise.all(unread.map((m) => data.update<MessageRow>('messages', m.id, { read: true }))).then(() => data.update<ConversationRow>('conversations', conv.id, { unread_staff: 0 }));
  }, [selected, messages, conversations, data]);

  const items = useMemo<DeskChatThreadItem[]>(() => conversations.map((c) => { const cust = customerById.get(c.customer_id); const a = assignmentOf(c.id); return { id: c.id, name: fullName(cust), preview: c.last_preview, when: relativeTime(c.last_message_at), unread: c.unread_staff, assignee: a?.assignee_name ?? null, assigneeId: a?.assignee_user_id ?? null, status: c.status, location: allLocations ? locations.find((l) => l.id === c.location_id)?.short_name ?? null : null, online: !!cust?.user_id && c.unread_staff > 0 }; })
    .filter((it) => { const a = it as DeskChatThreadItem & { assigneeId: string | null }; if (filter === 'closed') return it.status === 'closed'; if (it.status === 'closed') return false; if (filter === 'mine') return a.assigneeId === user.id; if (filter === 'unassigned') return !a.assigneeId; return true; })
    .filter((it) => !searchText || it.name.toLowerCase().includes(searchText.toLowerCase()) || (it.preview ?? '').toLowerCase().includes(searchText.toLowerCase())), [conversations, customerById, assignments, filter, searchText, user.id, allLocations, locations]);
  const conv = conversations.find((c) => c.id === selected);
  const cust = conv ? customerById.get(conv.customer_id) : undefined;
  const custPets = cust ? pets.filter((p) => p.customer_id === cust.id && p.status === 'active') : [];
  const assignment = conv ? assignmentOf(conv.id) : undefined;
  const msgs: DeskChatMessage[] = messages.map((m) => ({ id: m.id, sender: m.sender, text: m.text, at: m.sent_at, senderName: m.sender === 'staff' ? users.find((u) => u.id === m.sender_user_id)?.name?.split(' ')[0] ?? 'Staff' : null, imageUrl: m.image_url }));
  const send = async (text: string) => {
    if (!conv) return;
    const now = new Date().toISOString();
    await data.insert<MessageRow>('messages', { conversation_id: conv.id, sender: 'staff', sender_user_id: user.id, text, image_url: null, sent_at: now, read: true });
    await data.update<ConversationRow>('conversations', conv.id, { last_message_at: now, last_preview: text.slice(0, 80), unread_customer: conv.unread_customer + 1, status: 'open' });
    await notify(data, cust?.user_id, 'message', 'New message from the Front Desk', text.slice(0, 120), '/app/chat');
  };
  const assign = async (userId: string) => {
    if (!conv) return;
    const u = users.find((x) => x.id === userId);
    await data.insert<ConversationAssignmentRow>('conversation_assignments', { location_id: conv.location_id ?? locationId, conversation_id: conv.id, assignee_user_id: userId || null, assignee_name: u?.name ?? null, assigned_by: user.id, assigned_at: new Date().toISOString() });
    await data.insert<MessageRow>('messages', { conversation_id: conv.id, sender: 'system', sender_user_id: null, text: userId ? `Assigned to ${u?.name} by ${user.name}` : `Unassigned by ${user.name}`, image_url: null, sent_at: new Date().toISOString(), read: true });
    if (userId && userId !== user.id) await notify(data, userId, 'message', `Conversation assigned to you`, `${fullName(cust)} · by ${user.name}`, `/desk/messages?conversation=${conv.id}`);
    toast({ tone: 'success', title: userId ? `Assigned to ${u?.name}` : 'Unassigned' });
  };
  const toggleClose = async () => {
    if (!conv) return; const to = conv.status === 'open' ? 'closed' : 'open';
    await data.update<ConversationRow>('conversations', conv.id, { status: to });
    await data.insert<MessageRow>('messages', { conversation_id: conv.id, sender: 'system', sender_user_id: null, text: `Conversation ${to} by ${user.name}`, image_url: null, sent_at: new Date().toISOString(), read: true });
  };
  const unreadTotal = conversations.reduce((s, c) => s + c.unread_staff, 0);
  const tabs = [{ key: 'all' as Filter, label: 'Open', count: conversations.filter((c) => c.status === 'open').length }, { key: 'mine' as Filter, label: 'Mine', count: conversations.filter((c) => c.status === 'open' && assignmentOf(c.id)?.assignee_user_id === user.id).length }, { key: 'unassigned' as Filter, label: 'Unassigned', count: conversations.filter((c) => c.status === 'open' && !assignmentOf(c.id)?.assignee_user_id).length }, { key: 'closed' as Filter, label: 'Closed', count: conversations.filter((c) => c.status === 'closed').length }];
  return (
    <div className="page stack">
      <PageHeader code="F-57" title="Messages" subtitle={`Front Desk chat with pet parents · ${unreadTotal} unread`} actions={<Tabs items={tabs} value={filter} onChange={setFilter} variant="pills" size="sm" ariaLabel="Filter conversations" />} />
      <div className={`fgp-inbox ${selected ? 'show-thread' : ''}`}>
        <Card className="fgp-inbox-list" padding="md"><DeskChatThreadList items={items} selectedId={selected} onSelect={(id) => { setSelected(id); nav(`/desk/messages?conversation=${id}`, { replace: true }); }} search={searchText} onSearch={setSearchText} title="Message" emptyText={filter === 'mine' ? 'Nothing assigned to you' : 'No conversations'} /></Card>
        <Card className="fgp-inbox-thread" padding="md">
          {!conv ? <EmptyState icon="message" title="Pick a conversation" body="Threads are one per customer per location (R-M09). Open a customer page and press Message to start one." /> : (
            <DeskChatThread contactName={fullName(cust)} online={!!cust?.user_id} contactSub={<span>{cust?.mobile}{custPets.length ? ` · ${custPets.map((p) => p.name).join(', ')}` : ''}{conv.status === 'closed' ? ' · closed' : ''}</span>} messages={msgs} onBack={() => { setSelected(null); nav('/desk/messages', { replace: true }); }}
              onSend={can('messages.write') ? send : undefined} disabled={conv.status === 'closed'} onAttach={() => toast({ tone: 'info', title: 'Attachments arrive with file storage', body: 'Mock only for now.' })}
              actions={<>
                <Select size="sm" aria-label="Assign to" placeholder="Unassigned" value={assignment?.assignee_user_id ?? ''} onChange={(e) => assign(e.target.value)} options={staff.map((s) => ({ value: s.id, label: s.name }))} />
                {cust && <Button size="sm" variant="ghost" icon="user" onClick={() => nav(`/desk/customers/${cust.id}`)}>Customer</Button>}
                <Button size="sm" variant={conv.status === 'open' ? 'secondary' : 'primary'} icon={conv.status === 'open' ? 'check' : 'refresh'} onClick={toggleClose}>{conv.status === 'open' ? 'Close' : 'Reopen'}</Button>
                {assignment?.assignee_name && <Badge size="sm" tone="primary">{assignment.assignee_name}</Badge>}
              </>} />
          )}
        </Card>
      </div>
      {customers.length === 0 && <EmptyState compact icon="users" title="No customers yet" />}
    </div>
  );
}
