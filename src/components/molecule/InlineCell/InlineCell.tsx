import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { formatCell } from '../../organism/DataTable/DataTable';
import './InlineCell.css';

export type InlineCellType = 'text' | 'number' | 'bool' | 'enum' | 'date' | 'json' | 'readonly';
export interface InlineCellProps { value: unknown; type: InlineCellType; options?: readonly string[]; nullable?: boolean; onCommit: (v: unknown) => void | Promise<void>; label: string; render?: () => React.ReactNode }

/** D-10: a table cell that edits in place on click / Enter, commits on Enter or blur, cancels on Escape. */
export function InlineCell({ value, type, options, nullable, onCommit, label, render }: InlineCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLInputElement & HTMLSelectElement>(null);
  useEffect(() => { if (editing) { ref.current?.focus(); if ('select' in (ref.current ?? {})) (ref.current as HTMLInputElement).select?.(); } }, [editing]);
  if (type === 'readonly') return <span className="icell is-ro">{render ? render() : formatCell(value)}</span>;
  if (type === 'bool') return <label className="icell is-bool"><input type="checkbox" checked={!!value} onChange={(e) => onCommit(e.target.checked)} aria-label={label} /></label>;
  const start = () => { setDraft(type === 'json' ? JSON.stringify(value ?? null) : value == null ? '' : String(value)); setEditing(true); };
  const commit = async () => {
    setEditing(false);
    let v: unknown = draft;
    if (draft === '' && (nullable || type !== 'text')) v = null;
    else if (type === 'number') v = Number(draft);
    else if (type === 'json') { try { v = JSON.parse(draft); } catch { return; } }
    if (v !== value) await onCommit(v);
  };
  const key = (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); void commit(); } if (e.key === 'Escape') setEditing(false); };
  if (!editing) return <button type="button" className="icell is-edit" onClick={start} onKeyDown={(e) => { if (e.key === 'Enter') start(); }} aria-label={`Edit ${label}`} title="Click to edit">{render ? render() : formatCell(value)}</button>;
  if (type === 'enum') return <select ref={ref} className="icell-input" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={key} aria-label={label}>{nullable && <option value="">(none)</option>}{options?.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
  return <input ref={ref} className="icell-input" type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'} step={type === 'number' ? 'any' : undefined} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={key} aria-label={label} />;
}
