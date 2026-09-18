import { useMemo, useState } from 'react';
import type { TableDef, ColumnDef } from '../../../data/schema/types';
import { allColumns } from '../../../data/schema/types';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atom/Button/Button';
import { Textarea } from '../../atom/Textarea/Textarea';
import { Select } from '../../atom/Select/Select';
import { Badge } from '../../atom/Badge/Badge';
import './CsvImportModal.css';

export interface CsvImportModalProps { open: boolean; table: TableDef; onClose: () => void; onImport: (rows: Record<string, unknown>[], mode: 'insert' | 'upsert') => void | Promise<void> }

/** RFC 4180-ish CSV parser: quotes, escaped quotes, CRLF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; continue; }
    if (ch === '"') q = true; else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c !== ''));
}
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => { const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [columns.join(','), ...rows.map((r) => columns.map((c) => esc(r[c])).join(','))].join('\n');
}
export function coerce(col: ColumnDef, raw: string): unknown {
  if (raw === '' || raw.toLowerCase() === 'null') return col.type === 'bool' ? false : null;
  switch (col.type) {
    case 'int': return parseInt(raw, 10);
    case 'numeric': case 'money': return Number(raw);
    case 'bool': return /^(true|1|yes|y)$/i.test(raw);
    case 'json': try { return JSON.parse(raw); } catch { return raw; }
    default: return raw;
  }
}

/** D-10: paste or pick a CSV, map its headers to columns (auto-matched by name), preview, then insert or upsert (rows with an id). */
export function CsvImportModal({ open, table, onClose, onImport }: CsvImportModalProps) {
  const [text, setText] = useState('');
  const [map, setMap] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'insert' | 'upsert'>('insert');
  const [busy, setBusy] = useState(false);
  const cols = allColumns(table);
  const parsed = useMemo(() => parseCsv(text), [text]);
  const headers = parsed[0] ?? [];
  const body = parsed.slice(1);
  const mapping = useMemo(() => Object.fromEntries(headers.map((hdr) => [hdr, map[hdr] ?? (cols.find((c) => c.name === hdr.trim().toLowerCase())?.name ?? '')])), [headers, map, cols]);
  const rows = useMemo(() => body.map((r) => { const out: Record<string, unknown> = {}; headers.forEach((hdr, i) => { const target = mapping[hdr]; const col = cols.find((c) => c.name === target); if (col) out[target] = coerce(col, r[i] ?? ''); }); return out; }), [body, headers, mapping, cols]);
  const missingRequired = table.columns.filter((c) => !c.nullable && c.type !== 'bool' && !Object.values(mapping).includes(c.name)).map((c) => c.name);
  const pickFile = (f: File | undefined) => { if (!f) return; f.text().then(setText); };
  const run = async () => { setBusy(true); try { await onImport(rows, mode); setText(''); onClose(); } finally { setBusy(false); } };
  return (
    <Modal open={open} onClose={onClose} size="lg" title={<h3>Import CSV into <code>{table.name}</code></h3>}
      footer={<><span className="xs muted grow">{rows.length} rows · {Object.values(mapping).filter(Boolean).length}/{headers.length} columns mapped{missingRequired.length ? ` · unmapped required: ${missingRequired.join(', ')}` : ''}</span><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={run} disabled={!rows.length} loading={busy} icon="upload">{mode === 'insert' ? `Insert ${rows.length}` : `Upsert ${rows.length}`}</Button></>}>
      <div className="csvm stack">
        <div className="row wrap"><label className="csvm-file"><input type="file" accept=".csv,text/csv" onChange={(e) => pickFile(e.target.files?.[0])} /><span>Choose a .csv file</span></label><span className="xs muted">or paste below. First row = headers. Columns: {cols.map((c) => c.name).join(', ')}</span></div>
        <Textarea label="CSV" value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={`${table.columns.slice(0, 3).map((c) => c.name).join(',')}\n...`} />
        {headers.length > 0 && (
          <div className="csvm-map">
            {headers.map((hdr) => <Select key={hdr} size="sm" label={hdr} value={mapping[hdr]} placeholder="skip" onChange={(e) => setMap((m) => ({ ...m, [hdr]: e.target.value }))} options={cols.map((c) => ({ value: c.name, label: c.name }))} />)}
          </div>
        )}
        {rows.length > 0 && (
          <div className="csvm-preview"><table><thead><tr>{Object.keys(rows[0]).map((k) => <th key={k}>{k}</th>)}</tr></thead><tbody>{rows.slice(0, 5).map((r, i) => <tr key={i}>{Object.keys(rows[0]).map((k) => <td key={k}>{r[k] == null ? <span className="faint">null</span> : typeof r[k] === 'object' ? JSON.stringify(r[k]) : String(r[k])}</td>)}</tr>)}</tbody></table>{rows.length > 5 && <div className="xs faint">+ {rows.length - 5} more</div>}</div>
        )}
        <div className="row wrap"><Select size="sm" label="Mode" value={mode} onChange={(e) => setMode(e.target.value as 'insert' | 'upsert')} options={[{ value: 'insert', label: 'Insert as new rows (ids regenerated)' }, { value: 'upsert', label: 'Upsert: update rows whose id exists, insert the rest' }]} /><Badge size="sm" tone="warn">Needs a manager PIN (R-X84)</Badge></div>
      </div>
    </Modal>
  );
}
