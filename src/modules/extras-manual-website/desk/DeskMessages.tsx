import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useData, useTable } from '../../../data/DataContext';
import type { ConversationRow, CustomerRow, MessageRow, PetRow } from '../../../data/schema/core';
import type { SiteInquiryRow } from '../../../data/schema/extras-manual-website';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { Badge, toneFor } from '../../../components/atom/Badge/Badge';
import { Button } from '../../../components/atom/Button/Button';
import { Input } from '../../../components/atom/Input/Input';
import { Tabs } from '../../../components/molecule/Tabs/Tabs';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { DeskChatThread } from '../../../components/organism/DeskChatThread/DeskChatThread';
import { relativeTime } from '../../../components/molecule/StaffNotificationRow/StaffNotificationRow';
import { DataTable } from '../../../components/organism/DataTable/DataTable';
import './extras.css';

/** F-61 Messages inbox: conversations at the location (one per customer, R-M09), thread with composer, plus website inquiries (R-X42). */
export function DeskMessagesPage() {
  const data = useData();
  const { user, can } = useSession();
  const { scope, locations } = useLocation();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<'chat' | 'inquiries'>((params.get('tab') as 'inquiries') === 'inquiries' ? 'inquiries' : 'chat');
  const [q, setQ] = useState('');
  const active = params.get('c');
  const { rows: convs } = useTable<ConversationRow>('conversations', { where: scope, orderBy: { column: 'last_message_at', dir: 'desc' } });
  const { rows: customers } = useTable<CustomerRow>('customers');
  const { rows: pets } = useTable<PetRow>('pets');
  const { rows: msgs } = useTable<MessageRow>('messages', active ? { where: { conversation_id: active }, orderBy: { column: 'sent_at' } } : { where: { conversation_id: '__none__' } });
  const { rows: inquiries } = useTable<SiteInquiryRow>('site_inquiries', { where: scope, orderBy: { column: 'created_at', dir: 'desc' } });
  const cust = (id: string) => customers.find((c) => c.id === id);
  const name = (id: string) => { const c = cust(id); return c ? `${c.first_name} ${c.last_name}` : 'Customer'; };
  const list = useMemo(() => convs.filter((c) => !q.trim() || name(c.customer_id).toLowerCase().includes(q.trim().toLowerCase())), [convs, q, customers]); // eslint-disable-line react-hooks/exhaustive-deps
  const conv = convs.find((c) => c.id === active) ?? null;
  const open = (id: string) => { setParams({ c: id }); const c = convs.find((x) => x.id === id); if (c && c.unread_staff) void data.update('conversations', id, { unread_staff: 0 }); for (const m of msgs) if (!m.read && m.sender === 'customer') void data.update('messages', m.id, { read: true }); };
  const send = async (text: string) => {
    if (!conv) return;
    const now = new Date().toISOString();
    await data.insert('messages', { conversation_id: conv.id, sender: 'staff', sender_user_id: user.id, text, image_url: null, sent_at: now, read: true });
    await data.update('conversations', conv.id, { last_message_at: now, last_preview: text.slice(0, 80), unread_customer: (conv.unread_customer ?? 0) + 1, status: 'open' });
  };
  const unreadTotal = convs.reduce((s, c) => s + (c.unread_staff ?? 0), 0);
  const newInq = inquiries.filter((i) => i.status === 'new').length;
  const setInq = (row: SiteInquiryRow, status: string) => data.update('site_inquiries', row.id, { status, replied_by: status === 'replied' ? user.id : row.replied_by, replied_at: status === 'replied' ? new Date().toISOString() : row.replied_at });
  return (
    <div className="container ex-page">
      <PageHeader code="F-61" title="Messages" subtitle="One Front Desk thread per customer from the app, plus website inquiries for this location.">
        <Tabs size="sm" value={tab} onChange={(t) => { setTab(t); setParams(t === 'inquiries' ? { tab: 'inquiries' } : {}); }} ariaLabel="Inbox" items={[{ key: 'chat', label: 'Chat', count: unreadTotal }, { key: 'inquiries', label: 'Website inquiries', count: newInq }]} />
      </PageHeader>
      {tab === 'chat' ? (
        <div className={`ex-inbox ${conv ? 'has-thread' : ''}`}>
          <Card padding="sm" className="ex-convs">
            <Input size="sm" icon="search" placeholder="Find a customer" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find a customer" />
            {list.length === 0 && <EmptyState compact icon="message" title="No conversations" body="Customers start a thread from the app." />}
            {list.map((c) => <button key={c.id} type="button" className={`ex-conv ${c.id === active ? 'is-active' : ''}`} onClick={() => open(c.id)}><Avatar name={name(c.customer_id)} size={36} /><span className="ex-conv-text"><strong>{name(c.customer_id)}</strong><span>{c.last_preview ?? '…'}</span></span><span className="ex-conv-meta">{c.last_message_at && <span>{relativeTime(c.last_message_at)}</span>}{c.unread_staff > 0 && <Badge size="sm" tone="primary">{c.unread_staff}</Badge>}</span></button>)}
          </Card>
          <Card padding="md" className="ex-thread">
            {conv ? (
              <>
                <div className="ex-thread-head"><Button size="sm" variant="ghost" icon="arrow-left" onClick={() => setParams({})} className="ex-back">Inbox</Button><Avatar name={name(conv.customer_id)} size={36} /><div className="grow"><strong>{name(conv.customer_id)}</strong><div className="xs muted">{cust(conv.customer_id)?.mobile} · {pets.filter((p) => p.customer_id === conv.customer_id).map((p) => p.name).join(', ') || 'no pets'} · {locations.find((l) => l.id === conv.location_id)?.short_name}</div></div><Badge size="sm" tone={toneFor(conv.status)}>{conv.status}</Badge></div>
                <DeskChatThread messages={msgs.map((m) => ({ id: m.id, sender: m.sender, text: m.text, sentAt: m.sent_at, imageUrl: m.image_url, senderName: m.sender === 'staff' ? (m.sender_user_id === user.id ? user.name : 'Front desk') : undefined }))} customerName={name(conv.customer_id)} staffName={user.name} onSend={can('messages.write') ? send : undefined} />
              </>
            ) : <EmptyState icon="message" title="Pick a conversation" body="Unread threads are marked on the left; the oldest wait is the one to answer first." />}
          </Card>
        </div>
      ) : (
        <Card padding="none">
          <DataTable<SiteInquiryRow> rows={inquiries} rowKey={(r) => r.id} searchable pageSize={20} emptyText="No website inquiries for this location"
            filters={[{ key: 'status', label: 'Status', options: ['new', 'seen', 'replied', 'closed'].map((s) => ({ value: s, label: s })), test: (r, v) => r.status === v }]}
            columns={[
              { key: 'created_at', label: 'Received', render: (r) => <span title={r.created_at}>{relativeTime(r.created_at)}</span>, width: 120 },
              { key: 'name', label: 'From', render: (r) => <div className="stack-sm" style={{ gap: 0 }}><strong>{r.name}</strong><span className="xs muted">{r.email}{r.phone ? ` · ${r.phone}` : ''}</span></div> },
              { key: 'topic', label: 'About', render: (r) => <Badge size="sm">{r.topic.replace('_', ' ')}</Badge>, width: 120 },
              { key: 'message', label: 'Message', render: (r) => <span className="small">{r.message}</span> },
              { key: 'status', label: 'Status', render: (r) => <Badge size="sm" tone={toneFor(r.status)}>{r.status}</Badge>, width: 100 },
            ]}
            rowActions={(r) => <div className="row" style={{ gap: 4 }}>{r.status === 'new' && <Button size="sm" variant="ghost" onClick={() => void setInq(r, 'seen')}>Seen</Button>}{r.status !== 'replied' && r.status !== 'closed' && <Button size="sm" variant="secondary" onClick={() => void setInq(r, 'replied')}>Replied</Button>}{r.status !== 'closed' && <Button size="sm" variant="ghost" onClick={() => void setInq(r, 'closed')}>Close</Button>}</div>} />
        </Card>
      )}
    </div>
  );
}
