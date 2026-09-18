import { useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Chip } from '../../atom/Chip/Chip';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Icon } from '../../atom/Icon/Icon';
import './ChatComposer.css';

export interface ChatComposerProps {
  onSend: (text: string, imageDataUrl?: string) => void | Promise<void>;
  quickReplies?: string[];
  placeholder?: string;
  disabled?: boolean;
  /** Accept image attachments (mock upload to a data URL). */
  attachments?: boolean;
  maxImageBytes?: number;
  onImageTooLarge?: () => void;
  /** Text under the composer (e.g. "Front Desk replies 7:00 AM - 7:00 PM"). */
  hint?: ReactNode;
  className?: string;
}

const SendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>;

/** Message composer: quick-reply chips, attach photo, auto-growing textarea, send on Enter (Shift+Enter = newline). */
export function ChatComposer({ onSend, quickReplies = [], placeholder = 'Write a message…', disabled = false, attachments = true, maxImageBytes = 2_000_000, onImageTooLarge, hint, className = '' }: ChatComposerProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && !busy && (text.trim().length > 0 || !!image);

  const grow = () => { const el = areaRef.current; if (!el) return; el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 132)}px`; };
  const send = async () => {
    if (!canSend) return;
    setBusy(true);
    try { await onSend(text.trim(), image ?? undefined); setText(''); setImage(null); requestAnimationFrame(grow); } finally { setBusy(false); }
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } };
  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    if (f.size > maxImageBytes) { onImageTooLarge?.(); return; }
    const r = new FileReader(); r.onload = () => typeof r.result === 'string' && setImage(r.result); r.readAsDataURL(f);
  };

  return (
    <div className={`chatcomp ${disabled ? 'is-disabled' : ''} ${className}`}>
      {quickReplies.length > 0 && !text && !image && (
        <div className="chatcomp-quick" role="group" aria-label="Quick replies">
          {quickReplies.map((q) => <Chip key={q} size="sm" onClick={() => { setText(q); requestAnimationFrame(() => { grow(); areaRef.current?.focus(); }); }} disabled={disabled}>{q}</Chip>)}
        </div>
      )}
      {image && (
        <div className="chatcomp-preview"><img src={image} alt="Attachment preview" /><IconButton icon="close" label="Remove attachment" size="sm" variant="primary" onClick={() => setImage(null)} /></div>
      )}
      <div className="chatcomp-row">
        {attachments && (
          <>
            <IconButton icon="plus" label="Attach a photo" variant="outline" onClick={() => fileRef.current?.click()} disabled={disabled} />
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={pick} />
          </>
        )}
        <textarea ref={areaRef} className="chatcomp-input" rows={1} value={text} placeholder={placeholder} disabled={disabled} aria-label="Message" onChange={(e) => { setText(e.target.value); grow(); }} onKeyDown={onKey} />
        <button type="button" className="chatcomp-send" onClick={() => void send()} disabled={!canSend} aria-label="Send">{busy ? <Icon name="clock" size={18} /> : <SendIcon />}</button>
      </div>
      {hint && <p className="chatcomp-hint">{hint}</p>}
    </div>
  );
}
