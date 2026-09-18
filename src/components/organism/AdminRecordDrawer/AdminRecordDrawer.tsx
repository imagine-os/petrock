import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Drawer } from '../Drawer/Drawer';
import { Button } from '../../atom/Button/Button';
import { Input } from '../../atom/Input/Input';
import { Select, type SelectOption } from '../../atom/Select/Select';
import { Textarea } from '../../atom/Textarea/Textarea';
import { Checkbox } from '../../atom/Checkbox/Checkbox';
import { Toggle } from '../../atom/Toggle/Toggle';
import { PinApprovalModal, type PinApprovalRequest } from '../PinApprovalModal/PinApprovalModal';
import type { ApprovalRow } from '../../../data/schema/core';
import './AdminRecordDrawer.css';

export type AdminFieldType = 'text' | 'number' | 'money' | 'percent' | 'select' | 'bool' | 'toggle' | 'textarea' | 'date' | 'time' | 'json' | 'color' | 'email' | 'tel' | 'url';
export interface AdminField {
  key: string;
  label: string;
  type?: AdminFieldType;
  options?: SelectOption[];
  required?: boolean;
  hint?: ReactNode;
  placeholder?: string;
  min?: number; max?: number; step?: number;
  maxLength?: number;
  /** Span both columns. */
  full?: boolean;
  /** Read-only display. */
  readOnly?: boolean;
  /** Hide the field when this returns false. */
  when?: (values: Record<string, unknown>) => boolean;
  /** Return an error message or null. */
  validate?: (value: unknown, values: Record<string, unknown>) => string | null;
}
export interface AdminRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  fields: AdminField[];
  /** Initial values; `id` present = editing. */
  initial: Record<string, unknown> | null;
  onSave: (values: Record<string, unknown>) => Promise<void> | void;
  /** When set, a Delete button appears (PIN-gated via PinApprovalModal, R-X42). */
  onDelete?: (values: Record<string, unknown>, approval: ApprovalRow) => Promise<void> | void;
  deleteAction?: string;
  subjectTable?: string;
  /** Extra content under the fields (previews, computed values). */
  children?: ReactNode | ((values: Record<string, unknown>) => ReactNode);
  saveLabel?: string;
  width?: number;
  description?: ReactNode;
}

const isEmpty = (v: unknown) => v == null || v === '' || (typeof v === 'number' && Number.isNaN(v));

/**
 * The one add / edit form for settings, pricing and staff records: a Drawer with a two-column field grid driven by
 * AdminField[], required / custom validation, JSON fields and a PIN-gated delete (R-X42, R-P01).
 */
export function AdminRecordDrawer({ open, onClose, title, fields, initial, onSave, onDelete, deleteAction = 'record.delete', subjectTable, children, saveLabel, width = 480, description }: AdminRecordDrawerProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState<PinApprovalRequest | null>(null);
  useEffect(() => { if (open) { setValues({ ...(initial ?? {}) }); setTouched(false); } }, [open, initial]);
  const isNew = !initial || !initial.id;
  const visible = useMemo(() => fields.filter((f) => !f.when || f.when(values)), [fields, values]);
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    for (const f of visible) {
      const v = values[f.key];
      if (f.required && (isEmpty(v) || (f.type === 'bool' && v !== true && f.required))) { if (f.type !== 'bool' && f.type !== 'toggle') e[f.key] = 'Required'; continue; }
      if (f.type === 'json' && typeof v === 'string' && v.trim()) { try { JSON.parse(v); } catch { e[f.key] = 'Invalid JSON'; } }
      if ((f.type === 'number' || f.type === 'money' || f.type === 'percent') && typeof v === 'number') { if (f.min != null && v < f.min) e[f.key] = `Min ${f.min}`; if (f.max != null && v > f.max) e[f.key] = `Max ${f.max}`; }
      if (f.validate) { const m = f.validate(v, values); if (m) e[f.key] = m; }
    }
    return e;
  }, [visible, values]);
  const set = (k: string, v: unknown) => setValues((s) => ({ ...s, [k]: v }));
  const save = async () => {
    setTouched(true);
    if (Object.keys(errors).length) return;
    setBusy(true);
    try {
      const out: Record<string, unknown> = { ...values };
      for (const f of fields) if (f.type === 'json' && typeof out[f.key] === 'string') out[f.key] = (out[f.key] as string).trim() ? JSON.parse(out[f.key] as string) : null;
      await onSave(out);
      onClose();
    } finally { setBusy(false); }
  };
  const err = (k: string) => (touched ? errors[k] : undefined);
  const renderField = (f: AdminField) => {
    const v = values[f.key];
    const t = f.type ?? 'text';
    const common = { label: f.label + (f.required ? ' *' : ''), hint: f.hint, error: err(f.key), disabled: f.readOnly, placeholder: f.placeholder };
    switch (t) {
      case 'select': return <Select {...common} value={(v as string) ?? ''} placeholder={f.placeholder ?? 'Choose'} options={f.options ?? []} onChange={(e) => set(f.key, e.target.value || null)} />;
      case 'bool': return <Checkbox label={f.label} description={f.hint} checked={!!v} disabled={f.readOnly} onChange={(e) => set(f.key, e.target.checked)} />;
      case 'toggle': return <Toggle label={f.label} description={f.hint} checked={!!v} disabled={f.readOnly} onChange={(on) => set(f.key, on)} />;
      case 'textarea': return <Textarea {...common} value={(v as string) ?? ''} rows={3} maxLength={f.maxLength} showCount={!!f.maxLength} onChange={(e) => set(f.key, e.target.value || null)} />;
      case 'json': return <Textarea {...common} value={typeof v === 'string' ? v : v == null ? '' : JSON.stringify(v, null, 1)} rows={4} onChange={(e) => set(f.key, e.target.value)} hint={f.hint ?? 'JSON'} className="mono" />;
      case 'number': case 'money': case 'percent': return <Input {...common} type="number" inputMode="decimal" step={f.step ?? (t === 'number' ? 1 : 0.01)} min={f.min} max={f.max} value={v == null ? '' : String(v)} suffix={t === 'money' ? 'USD' : t === 'percent' ? '%' : undefined} onChange={(e) => set(f.key, e.target.value === '' ? null : Number(e.target.value))} />;
      case 'date': return <Input {...common} type="date" value={(v as string) ?? ''} onChange={(e) => set(f.key, e.target.value || null)} />;
      case 'time': return <Input {...common} type="time" value={(v as string) ?? ''} onChange={(e) => set(f.key, e.target.value || null)} />;
      case 'color': return <label className="arecord-color">{f.label}<input type="color" value={(v as string) ?? '#552583'} disabled={f.readOnly} onChange={(e) => set(f.key, e.target.value)} aria-label={f.label} /></label>;
      default: return <Input {...common} type={t === 'text' ? 'text' : t} value={(v as string) ?? ''} maxLength={f.maxLength} showCount={!!f.maxLength} onChange={(e) => set(f.key, e.target.value === '' ? (f.required ? '' : null) : e.target.value)} />;
    }
  };
  const footer = (
    <div className="arecord-foot">
      {onDelete && !isNew && <Button variant="danger" size="sm" icon="trash" onClick={() => setPin({ action: deleteAction, title: 'Delete this record?', description: 'Deleting a record needs a manager or owner PIN. The approval is recorded first.', subjectTable, subjectId: String(initial?.id ?? ''), details: { table: subjectTable } })}>Delete</Button>}
      <span className="grow" />
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button onClick={save} loading={busy} disabled={touched && Object.keys(errors).length > 0}>{saveLabel ?? (isNew ? 'Add' : 'Save changes')}</Button>
    </div>
  );
  return (
    <>
      <Drawer open={open} onClose={onClose} title={<h3>{title}</h3>} footer={footer} width={width}>
        <div className="arecord">
          {description && <p className="muted small">{description}</p>}
          <div className="arecord-grid">{visible.map((f) => <div key={f.key} className={f.full || f.type === 'textarea' || f.type === 'json' ? 'is-full' : ''}>{renderField(f)}</div>)}</div>
          {typeof children === 'function' ? children(values) : children}
          {!isNew && <div className="arecord-meta"><span>id <code>{String(initial?.id)}</code></span>{initial?.updated_at ? <span>updated {String(initial.updated_at).slice(0, 16).replace('T', ' ')}</span> : null}</div>}
        </div>
      </Drawer>
      <PinApprovalModal open={!!pin} request={pin} onClose={() => setPin(null)} onApproved={async (approval) => { setPin(null); setBusy(true); try { await onDelete?.(values, approval); onClose(); } finally { setBusy(false); } }} />
    </>
  );
}
