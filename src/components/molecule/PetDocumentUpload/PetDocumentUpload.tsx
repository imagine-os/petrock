import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import { IconButton } from '../../atom/IconButton/IconButton';
import './PetDocumentUpload.css';

/** What a finished (mock) upload hands back. `url` is a mock:// reference until real storage exists. */
export interface UploadedDocument { name: string; sizeBytes: number; type: string; url: string }
export interface PetDocumentUploadProps {
  label?: string;
  /** Accepted extensions (R-B06: .jpg .png .pdf). */
  accept?: string[];
  value: UploadedDocument | null;
  onChange: (doc: UploadedDocument | null) => void;
  /** Max size in MB; larger files are refused with an inline error. */
  maxMb?: number;
  hint?: string;
  disabled?: boolean;
  /** Simulated upload duration (ms); 0 = instant. */
  simulateMs?: number;
}

export const fmtBytes = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(n >= 10 * 1024 * 1024 ? 0 : 1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);
const extOf = (name: string) => `.${name.split('.').pop()?.toLowerCase() ?? ''}`;

/**
 * Dashed drop-zone for vaccine invoices / certificates (Pet Edit 5-7): pick or drop a file, watch a mock progress bar with size
 * and percent, cancel mid-way, or remove a finished upload. Storage is mocked (mock://uploads/<name>) until Company-OS exists.
 */
export function PetDocumentUpload({ label, accept = ['.jpg', '.jpeg', '.png', '.pdf'], value, onChange, maxMb = 20, hint, disabled = false, simulateMs = 1400 }: PetDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ file: File; pct: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  const start = (file: File) => {
    setError(null);
    if (!accept.includes(extOf(file.name))) { setError(`Only ${accept.filter((a) => a !== '.jpeg').join(', ')} files are accepted.`); return; }
    if (file.size > maxMb * 1024 * 1024) { setError(`Files must be under ${maxMb} MB.`); return; }
    if (timer.current) window.clearInterval(timer.current);
    if (simulateMs <= 0) { onChange({ name: file.name, sizeBytes: file.size, type: file.type, url: `mock://uploads/${Date.now()}-${file.name}` }); return; }
    setPending({ file, pct: 0 });
    const step = Math.max(40, simulateMs / 20);
    timer.current = window.setInterval(() => {
      setPending((p) => {
        if (!p) return p;
        const pct = Math.min(100, p.pct + 100 / (simulateMs / step));
        if (pct >= 100) {
          if (timer.current) window.clearInterval(timer.current);
          timer.current = null;
          onChange({ name: p.file.name, sizeBytes: p.file.size, type: p.file.type, url: `mock://uploads/${Date.now()}-${p.file.name}` });
          return null;
        }
        return { ...p, pct };
      });
    }, step);
  };
  const cancel = () => { if (timer.current) window.clearInterval(timer.current); timer.current = null; setPending(null); };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) start(f); e.target.value = ''; };

  return (
    <div className={`docup ${disabled ? 'is-disabled' : ''}`}>
      {label && <div className="field-label">{label}</div>}
      {!value && !pending && (
        <div className={`docup-zone ${drag ? 'is-drag' : ''} ${error ? 'has-error' : ''}`} onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f && !disabled) start(f); }}>
          <button type="button" className="docup-pick" onClick={() => inputRef.current?.click()} disabled={disabled}>
            <span className="docup-ph">{accept.filter((a) => a !== '.jpeg').join(', ')}</span>
            <span className="docup-cta"><Icon name="upload" size={18} /> Upload</span>
          </button>
          <input ref={inputRef} type="file" className="sr-only" accept={accept.join(',')} onChange={onPick} tabIndex={-1} aria-hidden />
        </div>
      )}
      {pending && (
        <div className="docup-card is-uploading" aria-live="polite">
          <div className="docup-row"><span className="docup-name">{pending.file.name}</span><IconButton icon="close" label="Cancel upload" size="sm" onClick={cancel} className="docup-cancel" /></div>
          <div className="docup-bar" role="progressbar" aria-valuenow={Math.round(pending.pct)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pending.pct}%` }} /></div>
          <div className="docup-meta"><span>{fmtBytes(pending.file.size)}</span><span>{Math.round(pending.pct)}%</span></div>
        </div>
      )}
      {value && !pending && (
        <div className="docup-card is-done">
          <div className="docup-row"><span className="docup-name"><Icon name={extOf(value.name) === '.pdf' ? 'spec' : 'image'} size={16} /> {value.name}</span><span className="docup-ok" aria-label="Uploaded"><Icon name="check" size={14} strokeWidth={3} /></span></div>
          <div className="docup-bar"><span style={{ width: '100%' }} /></div>
          <div className="docup-meta"><span>{fmtBytes(value.sizeBytes)}</span><span>100%</span></div>
          {!disabled && <div className="docup-actions"><button type="button" className="docup-link" onClick={() => inputRef.current?.click()}>Replace</button><button type="button" className="docup-link is-danger" onClick={() => onChange(null)}>Remove</button><input ref={inputRef} type="file" className="sr-only" accept={accept.join(',')} onChange={onPick} tabIndex={-1} aria-hidden /></div>}
        </div>
      )}
      {(error || hint) && <div className="field-help"><span className={error ? 'field-error' : 'field-hint'}>{error ?? hint}</span></div>}
    </div>
  );
}
