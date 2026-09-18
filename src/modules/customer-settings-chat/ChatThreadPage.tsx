import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, useRow, useTable } from '../../data/DataContext';
import type { ConversationRow, LocationRow, MessageRow, PetRow } from '../../data/schema/core';
import type { ChatQuickReplyRow } from '../../data/schema/customer-settings-chat';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { ChatMessageBubble } from '../../components/molecule/ChatMessageBubble/ChatMessageBubble';
import { ChatTimelineMarker } from '../../components/atom/ChatTimelineMarker/ChatTimelineMarker';
import { ChatComposer } from '../../components/molecule/ChatComposer/ChatComposer';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Modal } from '../../components/organism/Modal/Modal';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Button } from '../../components/atom/Button/Button';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomerAccount, k } from './useCustomerAccount';
import { clockTime, dayLabel, sameDay } from './time';
import { deliverMockReply, mockStaffReply } from './chatMock';
import './customer-settings-chat.css';

const todayHours = (l: LocationRow | null | undefined) => { if (!l) return null; const d = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3); const h = l.hours?.[d]; return h ? `${h.open} – ${h.close}` : null; };

/** C-82 Front Desk chat thread: day markers, bubbles with read receipts (R-M24, R-M25), photo attachments (R-M28), quick replies, mock staff reply. */
export function ChatThreadPage() {
  const { conversationId } = useParams();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const acc = useCustomerAccount();
  const { t, lang, customer } = acc;
  const conv = useRow<ConversationRow>('conversations', conversationId);
  const location = useRow<LocationRow>('locations', conv?.location_id ?? null);
  const { rows: messages } = useTable<MessageRow>('messages', { where: { conversation_id: conversationId ?? '__none__' }, orderBy: { column: 'sent_at' } });
  const { rows: pets } = useTable<PetRow>('pets', customer ? { where: { customer_id: customer.id } } : undefined);
  const { rows: quick } = useTable<ChatQuickReplyRow>('chat_quick_replies', { where: { audience: 'customer', active: true }, orderBy: { column: 'sort_order' } });
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const petName = pets[0]?.name ?? 'your dog';
  const title = `${t(k('inbox.title'))}${location ? ` · ${location.short_name}` : ''}`;
  const hours = todayHours(location);
  const own = !!conv && !!customer && conv.customer_id === customer.id;

  // Opening the thread marks Front Desk messages as read (R-M24).
  useEffect(() => {
    if (!conv || !own) return;
    const unread = messages.filter((m) => m.sender === 'staff' && !m.read);
    if (unread.length) unread.forEach((m) => data.update('messages', m.id, { read: true }));
    if (conv.unread_customer) data.update('conversations', conv.id, { unread_customer: 0 });
  }, [conv, own, messages, data]);
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages.length, typing]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const send = async (text: string, image?: string) => {
    if (!conv || !own) return;
    const now = new Date().toISOString();
    const msg = await data.insert<MessageRow>('messages', { conversation_id: conv.id, sender: 'customer', sender_user_id: acc.accountUserId, text, image_url: image ?? null, sent_at: now, read: false });
    await data.update('conversations', conv.id, { last_message_at: now, last_preview: text || '📷 Photo', unread_staff: (conv.unread_staff ?? 0) + 1 });
    // demo reply from the desk
    timers.current.push(window.setTimeout(() => setTyping(true), 1200));
    timers.current.push(window.setTimeout(async () => {
      setTyping(false);
      const fresh = (await data.get<ConversationRow>('conversations', conv.id)) ?? conv;
      const mine = (await data.list<MessageRow>('messages', { where: { conversation_id: conv.id, sender: 'customer' } })).concat(msg);
      await deliverMockReply(data, fresh, mine, mockStaffReply(text || 'photo', petName, location?.short_name ?? 'Front Desk', hours), location?.id === 'loc_westwood' ? 'usr_desk_ww' : 'usr_desk');
    }, 3200));
  };

  const rendered = useMemo(() => {
    const out: JSX.Element[] = [];
    let prevDay: Date | null = null; let prevSender: string | null = null;
    const now = new Date();
    messages.forEach((m, i) => {
      const d = new Date(m.sent_at);
      if (!prevDay || !sameDay(prevDay, d)) { out.push(<ChatTimelineMarker key={`day-${m.id}`}>{dayLabel(m.sent_at, now, lang)}</ChatTimelineMarker>); prevSender = null; }
      prevDay = d;
      if (m.sender === 'system') { out.push(<ChatTimelineMarker key={m.id} tone="primary">{m.text === 'Session start' ? t(k('chat.session')) : m.text}</ChatTimelineMarker>); prevSender = null; return; }
      const mine = m.sender === 'customer';
      const grouped = prevSender === m.sender && i > 0 && new Date(messages[i - 1].sent_at).getTime() > d.getTime() - 5 * 60000;
      out.push(<ChatMessageBubble key={m.id} mine={mine} text={m.text} imageUrl={m.image_url} time={clockTime(m.sent_at, lang)} senderName={title} grouped={grouped} state={mine ? (m.read ? 'seen' : 'delivered') : undefined} stateLabel={mine ? (m.read ? t(k('chat.seen')) : t(k('chat.delivered'))) : undefined} onImageClick={setLightbox} />);
      prevSender = m.sender;
    });
    return out;
  }, [messages, lang, t, title]);

  if (conversationId && conv === null && messages.length === 0) {
    return (
      <div className="csc-screen">
        <CustomerScreenHeader title={t(k('inbox.title'))} backTo="/app/inbox" />
        <div className="csc-body"><EmptyState icon="message" title="Conversation not found" body="Pick a location from your inbox to start a thread." action={<Button onClick={() => nav('/app/inbox')}>Open inbox</Button>} /></div>
      </div>
    );
  }
  return (
    <div className="csc-chat">
      <CustomerScreenHeader sticky={false} title={title} subtitle={hours ? t(k('chat.hours'), { location: location?.short_name ?? '', open: hours.split(' – ')[0], close: hours.split(' – ')[1] }) : undefined} backTo="/app/inbox" actions={location?.phone ? <IconButton icon="phone" label="Call" onClick={() => { window.location.href = `tel:${location.phone!.replace(/[^\d+]/g, '')}`; }} /> : undefined} />
      <div className="csc-chat-scroll" ref={scrollRef} role="log" aria-live="polite" aria-label="Messages">
        {rendered}
        {typing && <div className="csc-chat-typing" aria-label="Front Desk is typing"><span /><span /><span /></div>}
      </div>
      <div className="csc-chat-composer">
        <ChatComposer onSend={send} disabled={!own} placeholder={t(k('chat.placeholder'))} quickReplies={quick.map((q) => q.text.replace('{pet}', petName))} onImageTooLarge={() => toast({ tone: 'warn', title: t(k('chat.tooLarge')) })} hint={!own ? 'Sign in as this customer to send messages.' : undefined} />
      </div>
      <Modal open={!!lightbox} onClose={() => setLightbox(null)} title="Photo" size="md"><div className="csc-lightbox">{lightbox && <img src={lightbox} alt="Shared photo" />}</div></Modal>
    </div>
  );
}
