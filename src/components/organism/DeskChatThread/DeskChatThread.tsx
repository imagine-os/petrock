import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Button } from '../../atom/Button/Button';
import { Textarea } from '../../atom/Textarea/Textarea';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import { relativeTime } from '../../molecule/StaffNotificationRow/StaffNotificationRow';
import './DeskChatThread.css';

export interface DeskChatMessage { id: string; sender: 'customer' | 'staff' | 'system'; text: string; sentAt: string; imageUrl?: string | null; senderName?: string }
export interface DeskChatThreadProps { messages: DeskChatMessage[]; customerName: string; staffName?: string; onSend?: (text: string) => Promise<void> | void; disabled?: boolean; placeholder?: string; emptyText?: string }

/** Front-desk side of the one chat thread per customer (R-M09): bubbles by sender, day separators, session markers, composer. Staff bubbles are brand-tinted on the right. */
export function DeskChatThread({ messages, customerName, staffName = 'Front desk', onSend, disabled, placeholder = 'Reply to the customer…', emptyText = 'No messages yet. Say hello.' }: DeskChatThreadProps) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);
  const send = async () => { const t = text.trim(); if (!t || !onSend) return; setBusy(true); await onSend(t); setBusy(false); setText(''); };
  let lastDay = '';
  return (
    <div className="chat">
      <div className="chat-scroll" role="log" aria-live="polite" aria-label={`Conversation with ${customerName}`}>
        {messages.length === 0 && <EmptyState compact icon="message" title={emptyText} />}
        {messages.map((m) => {
          const day = new Date(m.sentAt).toDateString();
          const sep = day !== lastDay; lastDay = day;
          return (
            <div key={m.id} className="chat-item">
              {sep && <div className="chat-day"><span>{new Date(m.sentAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>}
              {m.sender === 'system' ? <div className="chat-system">{m.text}</div> : (
                <div className={`chat-row is-${m.sender}`}>
                  {m.sender === 'customer' && <Avatar name={m.senderName ?? customerName} size={28} />}
                  <div className="chat-bubble"><div className="chat-text">{m.text}</div>{m.imageUrl && <img src={m.imageUrl} alt="" className="chat-img" />}<div className="chat-meta"><span>{m.sender === 'staff' ? (m.senderName ?? staffName) : (m.senderName ?? customerName)}</span><time dateTime={m.sentAt}>{relativeTime(m.sentAt)}</time></div></div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {onSend && (
        <div className="chat-compose">
          <Textarea aria-label="Message" rows={2} value={text} placeholder={placeholder} disabled={disabled || busy} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} />
          <Button icon="arrow-right" onClick={() => void send()} loading={busy} disabled={disabled || !text.trim()}>Send</Button>
        </div>
      )}
    </div>
  );
}
