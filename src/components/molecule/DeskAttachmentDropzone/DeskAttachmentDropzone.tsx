import { useRef, useState, type DragEvent } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import { IconButton } from '../../atom/IconButton/IconButton';
import './DeskAttachmentDropzone.css';

export interface DeskAttachmentFile { name: string; size_bytes: number; mime: string | null; url: string }
export interface DeskAttachmentDropzoneProps { files: DeskAttachmentFile[]; onChange: (files: DeskAttachmentFile[]) => void; label?: string; accept?: string; multiple?: boolean; hint?: string; disabled?: boolean }

export const fmtBytes = (n: number) => (n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);

/** Mock upload dropzone (Figma "Click to upload or drag and drop"). Files become mock:// URLs until storage lands (R-J11 copy fixed). */
export function DeskAttachmentDropzone({ files, onChange, label = 'Attachment', accept = '.jpg,.jpeg,.png,.pdf', multiple = true, hint = 'JPG, PNG or PDF', disabled = false }: DeskAttachmentDropzoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const addFiles = (list: FileList | null) => {
    if (!list || disabled) return;
    const next = Array.from(list).map((f) => ({ name: f.name, size_bytes: f.size, mime: f.type || null, url: `mock://uploads/${Date.now()}-${f.name.replace(/\s+/g, '-').toLowerCase()}` }));
    onChange(multiple ? [...files, ...next] : next.slice(0, 1));
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); };
  return (
    <div className="dropzone-wrap">
      <span className="dropzone-label"><Icon name="upload" size={14} /> {label}</span>
      <div className={`dropzone ${over ? 'is-over' : ''} ${disabled ? 'is-disabled' : ''}`} role="button" tabIndex={disabled ? -1 : 0} aria-label={`${label}: click to upload or drag and drop`}
        onClick={() => !disabled && input.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={onDrop}>
        <Icon name="upload" size={22} className="dropzone-icon" />
        <span><strong>Click to upload</strong> or drag and drop</span>
        <span className="xs muted">{hint}{multiple ? ' · multiple files' : ''}</span>
        <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      </div>
      {files.length > 0 && (
        <ul className="dropzone-files">
          {files.map((f, i) => (
            <li key={`${f.url}-${i}`}><Icon name={f.mime?.startsWith('image/') ? 'image' : 'book'} size={14} /><span className="grow dropzone-name">{f.name}</span><span className="xs muted">{fmtBytes(f.size_bytes)}</span><span className="xs tone-success">100%</span>{!disabled && <IconButton icon="close" label={`Remove ${f.name}`} size="sm" onClick={() => onChange(files.filter((_, j) => j !== i))} />}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
