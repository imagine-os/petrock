import { useNavigate } from 'react-router-dom';
import { useData, useTable } from '../../data/DataContext';
import type { ConversationRow, LocationRow, MessageRow } from '../../data/schema/core';
import { ChatConversationRow } from '../../components/molecule/ChatConversationRow/ChatConversationRow';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useCustomerAccount, k } from './useCustomerAccount';
import { relativeTime } from './time';

/** Threads of the signed-in customer, one per location (R-M20); locations without a thread offer "Message …" which creates it. */
export function ConversationList() {
  const nav = useNavigate();
  const data = useData();
  const acc = useCustomerAccount();
  const { t, customer, lang } = acc;
  const { rows: locations } = useTable<LocationRow>('locations', { where: { active: true }, orderBy: { column: 'sort_order' } });
  const { rows: convs } = useTable<ConversationRow>('conversations', customer ? { where: { customer_id: customer.id } } : undefined);
  const { rows: lastMsgs } = useTable<MessageRow>('messages');
  if (!customer) return <EmptyState icon="message" title="Sign in to chat" body="Front Desk chat is available to pet parents with an account." />;
  const mine = convs.filter((c) => c.customer_id === customer.id);
  const start = async (loc: LocationRow) => {
    const conv = await data.insert<ConversationRow>('conversations', { location_id: loc.id, customer_id: customer.id, last_message_at: null, last_preview: null, unread_staff: 0, unread_customer: 0, status: 'open' });
    await data.insert<MessageRow>('messages', { conversation_id: conv.id, sender: 'system', sender_user_id: null, text: 'Session start', image_url: null, sent_at: new Date().toISOString(), read: true });
    nav(`/app/inbox/${conv.id}`);
  };
  const ordered = [...locations].sort((a, b) => {
    const ca = mine.find((c) => c.location_id === a.id), cb = mine.find((c) => c.location_id === b.id);
    return (cb?.last_message_at ?? '').localeCompare(ca?.last_message_at ?? '');
  });
  return (
    <Card padding="none">
      {ordered.map((loc) => {
        const conv = mine.find((c) => c.location_id === loc.id);
        if (!conv) return <ChatConversationRow key={loc.id} title={`${t(k('inbox.title'))} · ${loc.short_name}`} preview={t(k('inbox.start'), { location: loc.short_name })} onClick={() => start(loc)} />;
        const last = lastMsgs.filter((m) => m.conversation_id === conv.id && m.sender !== 'system').sort((a, b) => a.sent_at.localeCompare(b.sent_at)).slice(-1)[0];
        return <ChatConversationRow key={conv.id} to={`/app/inbox/${conv.id}`} title={`${t(k('inbox.title'))} · ${loc.short_name}`} preview={last ? (last.text || (last.image_url ? '📷 Photo' : '')) : conv.last_preview ?? undefined} previewPrefix={last?.sender === 'customer' ? t(k('inbox.you')) : undefined} time={relativeTime(last?.sent_at ?? conv.last_message_at, new Date(), lang)} unread={conv.unread_customer} />;
      })}
    </Card>
  );
}
