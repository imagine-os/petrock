/** A-35 Reviews moderation (R-M12, R-X47), A-36 Feedback inbox (R-X48), A-37 Approvals log, A-38 Audit log (R-X41). */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import { useLocation } from '../../tenant/LocationProvider';
import type { ReviewRow, FeedbackRow, ApprovalRow, AuditLogRow, CustomerRow, LocationRow } from '../../data/schema/core';
import { getRoutes } from '../../app/registry';
import { ROLE_LABEL, type Role } from '../../auth/roles';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Card } from '../../components/molecule/Card/Card';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Badge, toneFor } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useAdminCrud, fmtDateTime, downloadText, toCsv } from './lib';
import './admin.css';

const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

/** A-35 */
export function ReviewsPage() {
  const { scope } = useLocation();
  const { rows: reviews } = useTable<ReviewRow>('reviews', { where: scope, orderBy: { column: 'created_at', dir: 'desc' } });
  const { rows: customers } = useTable<CustomerRow>('customers');
  const { can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const [tab, setTab] = useState<'pending' | 'published' | 'archived'>('pending');
  const cust = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);
  const writable = can('reviews.moderate');
  const list = reviews.filter((r) => r.status === tab);
  const avg = reviews.filter((r) => r.status === 'published').reduce((s, r, _, a) => s + r.rating / a.length, 0);
  const setStatus = async (r: ReviewRow, status: string) => { await crud.update('reviews', r.id, { status }); toast(`Review ${status}`); };
  return (
    <div className="page stack">
      <PageHeader code="A-35" title="Reviews" subtitle="Moderate customer reviews: publish, archive, or pull a published one back (R-M12, R-X47). Ratings to one decimal; tags come from the app." />
      <div className="acp-kpis">
        <StatTile label="Published rating" value={reviews.some((r) => r.status === 'published') ? avg.toFixed(1) : '—'} icon="star" tone="primary" hint={`${reviews.filter((r) => r.status === 'published').length} published`} />
        <StatTile label="Pending" value={reviews.filter((r) => r.status === 'pending').length} icon="flag" />
        <StatTile label="Archived" value={reviews.filter((r) => r.status === 'archived').length} icon="trash" />
        <StatTile label="5-star share" value={reviews.length ? `${Math.round((reviews.filter((r) => r.rating >= 4.5).length / reviews.length) * 100)}%` : '—'} icon="sparkle" />
      </div>
      <Tabs items={[{ key: 'pending', label: 'Pending', count: reviews.filter((r) => r.status === 'pending').length }, { key: 'published', label: 'Published', count: reviews.filter((r) => r.status === 'published').length }, { key: 'archived', label: 'Archived', count: reviews.filter((r) => r.status === 'archived').length }]} value={tab} onChange={setTab} />
      {list.length === 0 ? <EmptyState icon="star" title={`No ${tab} reviews`} /> : (
        <div className="grid grid-2">
          {list.map((r) => { const c = cust[r.customer_id]; return (
            <Card key={r.id} padding="md" header={<div className="acp-review"><span className="row" style={{ gap: 8 }}><Avatar name={c ? `${c.first_name} ${c.last_name}` : '?'} size={32} /><span><strong>{c ? `${c.first_name} ${c.last_name.slice(0, 1)}.` : 'Customer'}</strong><div className="acp-note">{fmtDateTime(r.created_at)}</div></span></span><span className="acp-stars" title={`${r.rating} / 5`}>{stars(r.rating)} <span className="xs muted">{r.rating.toFixed(1)}</span></span></div>}
              footer={writable ? <>{r.status !== 'published' && <Button size="sm" icon="check" onClick={() => setStatus(r, 'published')}>Publish</Button>}{r.status !== 'archived' && <Button size="sm" variant="secondary" icon="trash" onClick={() => setStatus(r, 'archived')}>Archive</Button>}{r.status !== 'pending' && <Button size="sm" variant="ghost" onClick={() => setStatus(r, 'pending')}>Back to pending</Button>}</> : undefined}>
              <div className="stack-sm"><strong>{r.title}</strong><p className="small">{r.body}</p><div className="acp-badge-row">{(r.tags ?? []).map((t) => <Badge key={t} size="sm" tone={toneFor(t)}>{t}</Badge>)}<Badge size="sm" tone={toneFor(r.status)}>{r.status}</Badge></div></div>
            </Card>
          ); })}
        </div>
      )}
    </div>
  );
}

/** A-36 */
export function FeedbackInboxPage() {
  const { rows: feedback } = useTable<FeedbackRow>('feedback', { orderBy: { column: 'created_at', dir: 'desc' } });
  const { can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const [open, setOpen] = useState<FeedbackRow | null>(null);
  const [reply, setReply] = useState('');
  const routes = getRoutes();
  const writable = can('feedback.read');
  const openItem = async (f: FeedbackRow) => { setOpen(f); setReply(f.owner_reply ?? ''); if (f.status === 'new' && writable) await crud.update('feedback', f.id, { status: 'seen' }); };
  const save = async (status: string) => { if (!open) return; await crud.update('feedback', open.id, { owner_reply: reply || null, status }); toast({ tone: 'success', title: status === 'done' ? 'Closed' : 'Reply saved' }); setOpen(null); };
  const pathOf = (code: string) => routes.find((r) => r.spec.code === code)?.path;
  return (
    <div className="page stack">
      <PageHeader code="A-36" title="Feedback inbox" subtitle="What staff typed into the feedback button, with the page it came from. new -> seen -> done, with an owner reply (R-X48)." />
      <div className="acp-kpis">{(['new', 'seen', 'done'] as const).map((s) => <StatTile key={s} label={s} value={feedback.filter((f) => f.status === s).length} tone={s === 'new' ? 'primary' : 'default'} icon={s === 'new' ? 'bell' : s === 'seen' ? 'eye' : 'check'} />)}<StatTile label="Bugs open" value={feedback.filter((f) => f.category === 'bug' && f.status !== 'done').length} icon="warning" /></div>
      <DataTable<FeedbackRow> rows={feedback} rowKey={(f) => f.id} onRowClick={openItem} searchable dense
        filters={[{ key: 'status', label: 'Status', options: ['new', 'seen', 'done'].map((s) => ({ value: s, label: s })), test: (r, v) => r.status === v }, { key: 'category', label: 'Category', options: ['bug', 'idea', 'question', 'praise'].map((s) => ({ value: s, label: s })), test: (r, v) => r.category === v }]}
        columns={[
          { key: 'created_at', label: 'When', render: (f) => <span className="acp-mono">{fmtDateTime(f.created_at)}</span>, width: 140 },
          { key: 'category', label: 'Type', render: (f) => <Badge size="sm" tone={f.category === 'bug' ? 'danger' : f.category === 'idea' ? 'info' : f.category === 'praise' ? 'success' : 'neutral'}>{f.category}</Badge> },
          { key: 'text', label: 'Feedback', render: (f) => <span>{f.text}{f.owner_reply && <div className="acp-note">↳ {f.owner_reply}</div>}</span> },
          { key: 'user_name', label: 'From', render: (f) => <span>{f.user_name}<div className="acp-note">{ROLE_LABEL[f.role as Role] ?? f.role}</div></span> },
          { key: 'page_code', label: 'Page', render: (f) => (pathOf(f.page_code) ? <Link to={pathOf(f.page_code)!} className="acp-mono" onClick={(e) => e.stopPropagation()}>{f.page_code}</Link> : <span className="acp-mono">{f.page_code}</span>) },
          { key: 'status', label: 'Status', render: (f) => <Badge size="sm" tone={f.status === 'new' ? 'primary' : f.status === 'done' ? 'success' : 'neutral'}>{f.status}</Badge> },
        ]} />
      <Drawer open={!!open} onClose={() => setOpen(null)} title={<h3>Feedback · {open?.page_code}</h3>} footer={writable ? <><Button variant="ghost" onClick={() => setOpen(null)}>Close</Button><Button variant="secondary" onClick={() => save(open?.status === 'done' ? 'done' : 'seen')}>Save reply</Button><Button icon="check" onClick={() => save('done')}>Mark done</Button></> : undefined}>
        {open && <div className="stack">
          <div className="acp-badge-row"><Badge tone={toneFor(open.category)}>{open.category}</Badge><Badge tone={toneFor(open.status)}>{open.status}</Badge><span className="xs muted">{fmtDateTime(open.created_at)}</span></div>
          <p>{open.text}</p>
          <p className="acp-note">From {open.user_name} ({ROLE_LABEL[open.role as Role] ?? open.role}) on {pathOf(open.page_code) ? <Link to={pathOf(open.page_code)!}>{open.page_code} {open.route}</Link> : `${open.page_code} ${open.route}`}</p>
          <Textarea label="Owner reply" rows={4} value={reply} onChange={(e) => setReply(e.target.value)} disabled={!writable} placeholder="Thanks, shipped in the next build…" />
        </div>}
      </Drawer>
    </div>
  );
}

/** A-37 Approvals log */
export function ApprovalsPage() {
  const { scope, allLocations } = useLocation();
  const { rows } = useTable<ApprovalRow>('approvals', { where: scope, orderBy: { column: 'approved_at', dir: 'desc' } });
  const { rows: locs } = useTable<LocationRow>('locations');
  const { can } = useSession();
  const locName = useMemo(() => Object.fromEntries(locs.map((l) => [l.id, l.short_name])), [locs]);
  const actions = useMemo(() => [...new Set(rows.map((r) => r.action))].sort(), [rows]);
  return (
    <div className="page stack">
      <PageHeader code="A-37" title="Approvals log" subtitle="Every manager-PIN approval: who asked, who approved, for which record (R-I06, R-P01). Written by PinApprovalModal before the action runs." actions={can('reports.export') ? <Button variant="secondary" size="sm" icon="download" onClick={() => downloadText(`approvals-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows.map((r) => ({ ...r, details: JSON.stringify(r.details) })), ['approved_at', 'action', 'subject_table', 'subject_id', 'requested_by_name', 'approved_by_name', 'approver_role', 'location_id', 'details']), 'text/csv')}>CSV</Button> : undefined} />
      <div className="acp-kpis"><StatTile label="Approvals" value={rows.length} icon="key" /><StatTile label="Last 7 days" value={rows.filter((r) => Date.now() - new Date(r.approved_at).getTime() < 7 * 864e5).length} icon="clock" /><StatTile label="Refunds" value={rows.filter((r) => r.action.startsWith('payment')).length} icon="dollar" /><StatTile label="Deletes" value={rows.filter((r) => r.action.includes('delete')).length} icon="trash" /></div>
      <DataTable<ApprovalRow> rows={rows} rowKey={(r) => r.id} searchable dense emptyText="No approvals yet"
        filters={[{ key: 'action', label: 'Action', options: actions.map((a) => ({ value: a, label: a })), test: (r, v) => r.action === v }]}
        columns={[
          { key: 'approved_at', label: 'When', render: (r) => <span className="acp-mono">{fmtDateTime(r.approved_at)}</span>, width: 140 },
          { key: 'action', label: 'Action', render: (r) => <Badge size="sm" tone="primary">{r.action}</Badge> },
          { key: 'subject', label: 'Record', sortable: false, render: (r) => (r.subject_table ? <span className="acp-mono">{r.subject_table}{r.subject_id ? ` / ${r.subject_id}` : ''}</span> : <span className="faint">—</span>) },
          { key: 'requested_by_name', label: 'Requested by' },
          { key: 'approved_by_name', label: 'Approved by', render: (r) => <span>{r.approved_by_name}<div className="acp-note">{ROLE_LABEL[r.approver_role as Role] ?? r.approver_role}</div></span> },
          ...(allLocations ? [{ key: 'location_id', label: 'Location', render: (r: ApprovalRow) => locName[r.location_id ?? ''] ?? '—' }] : []),
          { key: 'details', label: 'Details', hideOnCard: true, sortable: false, render: (r) => (r.details ? <code className="acp-mono">{JSON.stringify(r.details)}</code> : <span className="faint">—</span>) },
        ]} />
    </div>
  );
}

/** A-38 Audit log */
export function AuditLogPage() {
  const { scope, allLocations } = useLocation();
  const { rows: scoped } = useTable<AuditLogRow>('audit_log', { where: scope, orderBy: { column: 'created_at', dir: 'desc' } });
  const { rows: global } = useTable<AuditLogRow>('audit_log', { where: { location_id: null }, orderBy: { column: 'created_at', dir: 'desc' } });
  const { rows: locs } = useTable<LocationRow>('locations');
  const { can } = useSession();
  const locName = useMemo(() => Object.fromEntries(locs.map((l) => [l.id, l.short_name])), [locs]);
  const rows = useMemo(() => { if (allLocations) return scoped; const ids = new Set(scoped.map((r) => r.id)); return [...scoped, ...global.filter((g) => !ids.has(g.id))].sort((a, b) => b.created_at.localeCompare(a.created_at)); }, [scoped, global, allLocations]);
  const tables = useMemo(() => [...new Set(rows.map((r) => r.table_name))].sort(), [rows]);
  const renderDiff = (d: Record<string, unknown> | null) => {
    if (!d) return <span className="faint">—</span>;
    const entries = Object.entries(d).slice(0, 6);
    return <div className="acp-diff">{entries.map(([k, v]) => Array.isArray(v) && v.length === 2 ? <span key={k}>{k}: <del>{JSON.stringify(v[0])}</del> <ins>{JSON.stringify(v[1])}</ins></span> : <span key={k}>{k}: {JSON.stringify(v).slice(0, 80)}</span>)}{Object.keys(d).length > 6 && <span className="faint">+{Object.keys(d).length - 6} more</span>}</div>;
  };
  return (
    <div className="page stack">
      <PageHeader code="A-38" title="Audit log" subtitle="Who changed what: every Control Panel insert, update and delete with its diff (R-X41), plus front-desk changes as modules adopt the same helper." actions={can('reports.export') ? <Button variant="secondary" size="sm" icon="download" onClick={() => downloadText(`audit-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows.map((r) => ({ ...r, diff: JSON.stringify(r.diff) })), ['created_at', 'user_name', 'action', 'table_name', 'row_id', 'location_id', 'diff']), 'text/csv')}>CSV</Button> : undefined} />
      <div className="acp-kpis"><StatTile label="Entries" value={rows.length} icon="list" /><StatTile label="Today" value={rows.filter((r) => r.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length} icon="clock" /><StatTile label="Tables touched" value={tables.length} icon="table" /><StatTile label="Deletes" value={rows.filter((r) => r.action === 'delete').length} icon="trash" /></div>
      <DataTable<AuditLogRow> rows={rows} rowKey={(r) => r.id} searchable dense pageSize={50} emptyText="No changes recorded"
        filters={[{ key: 'table', label: 'Table', options: tables.map((t) => ({ value: t, label: t })), test: (r, v) => r.table_name === v }, { key: 'action', label: 'Action', options: ['insert', 'update', 'delete', 'pin.reset'].map((a) => ({ value: a, label: a })), test: (r, v) => r.action === v }]}
        columns={[
          { key: 'created_at', label: 'When', render: (r) => <span className="acp-mono">{fmtDateTime(r.created_at)}</span>, width: 140 },
          { key: 'user_name', label: 'Who', render: (r) => r.user_name ?? <span className="faint">system</span> },
          { key: 'action', label: 'Action', render: (r) => <Badge size="sm" tone={r.action === 'delete' ? 'danger' : r.action === 'insert' ? 'success' : 'info'}>{r.action}</Badge> },
          { key: 'table_name', label: 'Table', render: (r) => <span className="acp-mono">{r.table_name}{r.row_id ? <span className="faint"> / {r.row_id}</span> : null}</span> },
          ...(allLocations ? [{ key: 'location_id', label: 'Location', render: (r: AuditLogRow) => locName[r.location_id ?? ''] ?? <span className="faint">global</span> }] : []),
          { key: 'diff', label: 'Change', sortable: false, render: (r) => renderDiff(r.diff) },
        ]} />
    </div>
  );
}
