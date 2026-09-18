/** A-43 Backups & export (JSON download of the mock database) and A-44 General settings (boarding, invoice, general, brand). */
import { useMemo, useState } from 'react';
import { useData, useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import type { SettingRow } from '../../data/schema/core';
import type { BackupRow } from '../../data/schema/admin-control-panel';
import { tables as TABLES } from '../../data/schema';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Input } from '../../components/atom/Input/Input';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Section } from '../../components/molecule/Section/Section';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { useToast } from '../../components/molecule/Toast/Toast';
import { PinApprovalModal, type PinApprovalRequest } from '../../components/organism/PinApprovalModal/PinApprovalModal';
import { AdminRecordDrawer, type AdminField } from '../../components/organism/AdminRecordDrawer/AdminRecordDrawer';
import { useAdminCrud, downloadText, bytes, fmtDateTime } from './lib';
import './admin.css';

/** A-43 */
export function BackupsPage() {
  const data = useData();
  const { user, can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const { rows: log } = useTable<BackupRow>('backups', { orderBy: { column: 'created_at', dir: 'desc' } });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState<PinApprovalRequest | null>(null);
  const counts = useMemo(() => TABLES.map((t) => ({ name: t.name, label: t.label, group: t.group, rows: data.peek?.(t.name)?.length ?? 0 })), [data, log]);
  const totalRows = counts.reduce((s, c) => s + c.rows, 0);
  const exportAll = async () => {
    setBusy(true);
    try {
      const snapshot: Record<string, unknown[]> = {};
      for (const t of TABLES) snapshot[t.name] = await data.list(t.name);
      const payload = { exported_at: new Date().toISOString(), app: 'petrock', provider: data.name, tables: snapshot };
      const text = JSON.stringify(payload, null, 1);
      const file = `petrock-export-${new Date().toISOString().slice(0, 10)}.json`;
      downloadText(file, text, 'application/json');
      await crud.insert('backups', { kind: 'manual', file_name: file, table_count: TABLES.length, row_count: totalRows, size_bytes: new Blob([text]).size, created_by: user.id, created_by_name: user.name, note: note || null });
      setNote('');
      toast({ tone: 'success', title: 'Export downloaded', body: `${TABLES.length} tables · ${totalRows} rows` });
    } finally { setBusy(false); }
  };
  const exportTable = async (name: string) => { const rows = await data.list(name); downloadText(`petrock-${name}-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(rows, null, 1), 'application/json'); };
  return (
    <div className="page stack">
      <PageHeader code="A-43" title="Backups & export" subtitle="Download the whole mock database as JSON (or one table), see what was exported before, and reseed. With Company-OS this becomes a server-side export job." />
      <div className="acp-kpis"><StatTile label="Tables" value={TABLES.length} icon="table" /><StatTile label="Rows" value={totalRows} icon="list" tone="primary" /><StatTile label="Exports logged" value={log.length} icon="download" /><StatTile label="Provider" value={data.name} icon="layers" hint="localStorage today" /></div>
      <Card padding="md" header={<h3>Export everything</h3>}>
        <div className="row wrap" style={{ alignItems: 'flex-end' }}>
          <div className="grow" style={{ maxWidth: 480 }}><Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Before the seasonal rate change" /></div>
          <Button icon="download" onClick={exportAll} loading={busy} disabled={!can('reports.export')}>Download JSON</Button>
          {can('tables.write') && <Button variant="danger" icon="refresh" onClick={() => setPin({ action: 'data.reseed', title: 'Reseed the mock database?', description: 'Every change made in this browser is lost and the seed is rebuilt. Needs a manager or owner PIN.', subjectTable: '*' })}>Reset to seed</Button>}
        </div>
      </Card>
      <Section title="Export history" description="Each export writes a backups row (who, when, size).">
        <DataTable<BackupRow> rows={log} rowKey={(r) => r.id} dense emptyText="No exports yet" columns={[{ key: 'created_at', label: 'When', render: (r) => <span className="acp-mono">{fmtDateTime(r.created_at)}</span> }, { key: 'file_name', label: 'File', mono: true }, { key: 'kind', label: 'Kind', render: (r) => <Badge size="sm">{r.kind}</Badge> }, { key: 'table_count', label: 'Tables', align: 'right' }, { key: 'row_count', label: 'Rows', align: 'right' }, { key: 'size_bytes', label: 'Size', align: 'right', render: (r) => bytes(r.size_bytes) }, { key: 'created_by_name', label: 'By' }, { key: 'note', label: 'Note', hideOnCard: true }]} />
      </Section>
      <Section title="Per table" description="Row counts right now; download any table on its own.">
        <DataTable rows={counts} rowKey={(r) => r.name} dense searchable pageSize={60} columns={[{ key: 'name', label: 'Table', mono: true }, { key: 'label', label: 'Label' }, { key: 'group', label: 'Group', render: (r) => <Badge size="sm">{r.group}</Badge> }, { key: 'rows', label: 'Rows', align: 'right' }]} rowActions={(r) => <Button size="sm" variant="ghost" icon="download" onClick={() => exportTable(r.name)}>JSON</Button>} />
      </Section>
      <PinApprovalModal open={!!pin} request={pin} onClose={() => setPin(null)} onApproved={async () => { setPin(null); await data.reset?.(); toast({ tone: 'warn', title: 'Mock database reseeded' }); }} />
    </div>
  );
}

/** A-44 General settings: settings table key/value groups edited as forms. */
interface SettingGroup { key: string; title: string; description: string; fields: AdminField[]; defaults: Record<string, unknown>; rule: string }
const GROUPS: SettingGroup[] = [
  { key: 'boarding', title: 'Boarding', description: 'How stays are charged and when dogs may arrive (4.pdf).', rule: 'R-K05', defaults: { enclosure_singular: 'Hotel Room', enclosure_plural: 'Hotel Rooms', charge_by: 'day', check_in_window: ['07:00', '20:00'], first_day_multiplier: 1, last_day_multiplier: 1, minimum_charge_days: 1, book_out_whole_room_by_default: false },
    fields: [{ key: 'enclosure_singular', label: 'Name of enclosure (singular)', required: true }, { key: 'enclosure_plural', label: 'Name of enclosure (plural)', required: true }, { key: 'charge_by', label: 'Charge by', type: 'select', required: true, options: [{ value: 'day', label: 'Day' }, { value: 'night', label: 'Night' }, { value: 'hours', label: 'Hours' }] }, { key: 'minimum_charge_days', label: 'Minimum charge (days)', type: 'number', min: 0 }, { key: 'check_in_window', label: 'Check-in / out window', type: 'json', hint: '["07:00", "20:00"]' }, { key: 'first_day_multiplier', label: 'First day charge ×', type: 'number', min: 0, max: 2, step: 0.5 }, { key: 'last_day_multiplier', label: 'Last day charge ×', type: 'number', min: 0, max: 2, step: 0.5 }, { key: 'book_out_whole_room_by_default', label: 'New bookings book out the whole room by default', type: 'toggle', full: true }] },
  { key: 'invoice', title: 'Invoices', description: 'Numbering and printed invoice options (9.pdf).', rule: 'R-H09, R-H10', defaults: { next_number: 1043, title: 'Invoice', footer: 'Rock Out With Your Paws Out!', show_tax_number: true, show_boarding_rates: true, copies: 1, set_completed_on_invoice: false, show_tip: false },
    fields: [{ key: 'next_number', label: 'Next invoice number', type: 'number', min: 1, required: true }, { key: 'title', label: 'Title', required: true }, { key: 'footer', label: 'Footer message', full: true }, { key: 'copies', label: 'Copies to print', type: 'number', min: 1, max: 5 }, { key: 'show_tax_number', label: 'Show tax number', type: 'toggle' }, { key: 'show_boarding_rates', label: 'Show boarding charge rates', type: 'toggle' }, { key: 'show_tip', label: 'Show tip field', type: 'toggle' }, { key: 'set_completed_on_invoice', label: "Invoicing sets the booking to checked out", type: 'toggle' }] },
  { key: 'general', title: 'General', description: 'Formats and defaults every surface reads (7.pdf).', rule: 'R-J10', defaults: { time_format: '12h', slot_minutes: 15, weight_unit: 'lbs', default_pet_type: 'Dog', default_contact: 'mobile', language: 'en' },
    fields: [{ key: 'time_format', label: 'Time format', type: 'select', options: [{ value: '12h', label: '12 hours' }, { value: '24h', label: '24 hours' }] }, { key: 'slot_minutes', label: 'Calendar slot (minutes)', type: 'select', options: ['10', '15', '20', '30', '60'].map((v) => ({ value: v, label: `${v} min` })) }, { key: 'weight_unit', label: 'Weight unit', type: 'select', options: [{ value: 'lbs', label: 'lbs' }, { value: 'kg', label: 'kg' }] }, { key: 'default_pet_type', label: 'Default pet type' }, { key: 'default_contact', label: 'Default contact method', type: 'select', options: [{ value: 'mobile', label: 'Mobile' }, { value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }] }, { key: 'language', label: 'Default language', type: 'select', options: [{ value: 'en', label: 'English' }, { value: 'es', label: 'Español' }] }] },
  { key: 'brand', title: 'Brand', description: 'Logo, font and colours (1.pdf). Tokens stay the source of truth; this records the owner\'s choice until the theme wiring lands.', rule: 'R-K06', defaults: { logo_url: null, font: 'Inter', primary_color: '#552583', background_color: '#FBF8FF', text_color: '#1E1B2E' },
    fields: [{ key: 'logo_url', label: 'Logo (mock upload URL)', type: 'url', full: true, hint: 'Upload arrives with Company-OS storage' }, { key: 'font', label: 'Font', type: 'select', options: [{ value: 'Inter', label: 'Inter' }] }, { key: 'primary_color', label: 'Primary colour', type: 'color' }, { key: 'background_color', label: 'Background colour', type: 'color' }, { key: 'text_color', label: 'Text colour', type: 'color' }] },
  { key: 'security', title: 'Security & prompts', description: 'Confirmation prompts and compulsory-vaccine warnings (6.pdf, 10.pdf).', rule: 'R-J09, R-A12', defaults: { confirm_before_edit: false, prompt_expired_vaccines: true, prompt_past_uncompleted: true, show_outstanding_balances: true, pin_length_min: 4, pin_length_max: 6 },
    fields: [{ key: 'prompt_expired_vaccines', label: 'Warn about expired or missing compulsory vaccines on pet and booking forms', type: 'toggle', full: true }, { key: 'prompt_past_uncompleted', label: 'Prompt about past uncompleted bookings when the calendar opens', type: 'toggle', full: true }, { key: 'show_outstanding_balances', label: 'Show customers with outstanding balances at start', type: 'toggle', full: true }, { key: 'confirm_before_edit', label: 'Confirm before editing a record', type: 'toggle', full: true }, { key: 'pin_length_min', label: 'PIN min digits', type: 'number', min: 4, max: 6, readOnly: true, hint: 'Fixed at 4-6 (D-019)' }, { key: 'pin_length_max', label: 'PIN max digits', type: 'number', min: 4, max: 6, readOnly: true }] },
];

export function SettingsPage() {
  const { rows } = useTable<SettingRow>('settings');
  const { can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const [editing, setEditing] = useState<SettingGroup | null>(null);
  const writable = can('settings.write');
  const rowFor = (key: string) => rows.find((r) => r.key === key);
  const valueFor = (g: SettingGroup) => ({ ...g.defaults, ...((rowFor(g.key)?.value as Record<string, unknown> | undefined) ?? {}) });
  const save = async (g: SettingGroup, values: Record<string, unknown>) => {
    const value = crud.clean(values, g.fields.map((f) => f.key));
    const row = rowFor(g.key);
    if (row) await crud.update('settings', row.id, { value: { ...(row.value as Record<string, unknown>), ...value } }); else await crud.insert('settings', { key: g.key, value, description: `${g.title} settings (A-44)` });
    toast({ tone: 'success', title: `${g.title} saved` });
  };
  const show = (v: unknown) => (typeof v === 'boolean' ? (v ? 'yes' : 'no') : Array.isArray(v) ? v.join(' - ') : v == null || v === '' ? '—' : String(v));
  return (
    <div className="page stack">
      <PageHeader code="A-44" title="General settings" subtitle="Key / value groups in the settings table. Pricing lives under Pricing (A-27), rules under Settings › Rules (A-40), providers under Providers (A-28)." />
      <div className="grid grid-2">
        {GROUPS.map((g) => { const v = valueFor(g); return (
          <Card key={g.key} padding="md" header={<div className="acp-card-title"><div><h3>{g.title}</h3><p className="acp-note">{g.description}</p></div><div className="row" style={{ gap: 6 }}><Badge size="sm">{g.rule}</Badge>{writable && <Button size="sm" variant="secondary" icon="edit" onClick={() => setEditing(g)}>Edit</Button>}</div></div>}>
            <dl className="ahours-ro" style={{ gridTemplateColumns: 'minmax(120px, auto) 1fr' }}>{g.fields.map((f) => <div key={f.key} style={{ display: 'contents' }}><dt>{f.label}</dt><dd>{f.type === 'color' ? <span className="row" style={{ gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: String(v[f.key]), border: '1px solid var(--color-border)' }} />{show(v[f.key])}</span> : show(v[f.key])}</dd></div>)}</dl>
          </Card>
        ); })}
      </div>
      {editing && <AdminRecordDrawer open onClose={() => setEditing(null)} title={`${editing.title} settings`} description={editing.description} fields={editing.fields} initial={{ ...valueFor(editing), id: rowFor(editing.key)?.id ?? editing.key }} onSave={(v) => save(editing, v)} saveLabel="Save settings" />}
    </div>
  );
}
