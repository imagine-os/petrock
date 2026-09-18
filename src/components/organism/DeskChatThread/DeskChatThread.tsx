import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Button } from '../../atom/Button/Button';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Textarea } from '../../atom/Textarea/Textarea';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './DeskChatThread.css';

export interface DeskChatMessage { id: string; sender: 'customer' | 'staff' | 'system'; text: string; at: string; senderName?: string | null; imageUrl?: string | null; read?: boolean }
export interface DeskChatThreadProps {
  contactName: string; contactSub?: ReactNode; online?: boolean; messages: DeskChatMessage[];
  onSend?: (text: string) => void | Promise<void>; onAttach?: () => void; onBack?: () => void; actions?: ReactNode; disabled?: boolean; placeholder?: string; emptyText?: string;
}
const t = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const d = (iso: string) => new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

/** Right pane of the inbox: contact header, bubbles (customer left, staff right, system centred), composer with attach + send. Enter sends, Shift+Enter breaks a line. */
export function DeskChatThread({ contactName, contactSub, online, messages, onSend, onAttach, onBack, actions, disabled = false, placeholder = 'Type a reply…', emptyText = 'No messages yet' }: DeskChatThreadProps) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);
  const send = async () => { const text = draft.trim(); if (!text || !onSend || disabled) return; setBusy(true); await onSend(text); setDraft(''); setBusy(false); };
  let lastDay = '';
  return (
    <div className="chatthread">
      <div className="chatthread-head">
        {onBack && <IconButton icon="arrow-left" label="Back to conversations" onClick={onBack} className="chatthread-back" />}
        <Avatar name={contactName} size={40} />
        <div className="chatthread-who"><strong>{contactName}</strong><span className="xs muted chatthread-sub">{online && <span className="chatthread-online" />}{contactSub ?? (online ? 'Online' : 'Offline')}</span></div>
        {actions && <div className="chatthread-actions">{actions}</div>}
      </div>
      <div className="chatthread-scroll" role="log" aria-live="polite">
        {messages.length === 0 && <EmptyState compact icon="message" title={emptyText} />}
        {messages.map((m) => {
          const day = d(m.at); const showDay = day !== lastDay; lastDay = day;
          return (
            <div key={m.id}>
              {showDay && <div className="chatthread-day"><span>{day}</span></div>}
              {m.sender === 'system' ? <div className="chatthread-system"><span>{m.text}</span></div> : (
                <div className={`chatthread-msg is-${m.sender}`}>
                  <div className="chatthread-bubble">
                    {m.imageUrl && <div className="chatthread-img" title={m.imageUrl}>image</div>}
                    <span className="chatthread-text">{m.text}</span>
                    <span className="chatthread-meta">{m.sender === 'staff' && m.senderName ? `${m.senderName} · ` : ''}{t(m.at)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={end} />
      </div>
      {onSend && (
        <div className="chatthread-composer">
          {onAttach && <IconButton icon="plus" label="Attach a file" variant="outline" onClick={onAttach} disabled={disabled} />}
          <Textarea rows={1} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={disabled ? 'Conversation closed' : placeholder} disabled={disabled} aria-label="Reply" className="chatthread-input" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <Button icon="arrow-right" onClick={send} loading={busy} disabled={disabled || !draft.trim()} aria-label="Send">Send</Button>
        </div>
      )}
    </div>
  );
}
