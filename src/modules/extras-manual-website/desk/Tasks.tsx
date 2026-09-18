import { useMemo, useState } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useData, useTable } from '../../../data/DataContext';
import type { EmployeeRow } from '../../../data/schema/core';
import type { TaskRow } from '../../../data/schema/extras-manual-website';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { StatTile } from '../../../components/molecule/StatTile/StatTile';
import { Button } from '../../../components/atom/Button/Button';
import { IconButton } from '../../../components/atom/IconButton/IconButton';
import { Badge } from '../../../components/atom/Badge/Badge';
import { Checkbox } from '../../../components/atom/Checkbox/Checkbox';
import { Select } from '../../../components/atom/Select/Select';
import { Input } from '../../../components/atom/Input/Input';
import { Textarea } from '../../../components/atom/Textarea/Textarea';
import { Tabs } from '../../../components/molecule/Tabs/Tabs';
import { Drawer } from '../../../components/organism/Drawer/Drawer';
import { DatePicker } from '../../../components/molecule/DatePicker/DatePicker';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { PinApprovalModal, type PinApprovalRequest } from '../../../components/organism/PinApprovalModal/PinApprovalModal';
import { Section } from '../../../components/molecule/Section/Section';
import { useToast } from '../../../components/molecule/Toast/Toast';
import './extras.css';

const PRIORITY_TONE = { low: 'neutral', normal: 'info', high: 'danger' } as const;
const today = () => new Date().toISOString().slice(0, 10);

/** F-68 Tasks and checklists (management): per-location to-dos with assignee, due date, priority and status; delete is PIN-gated (R-L07, R-X77). */
export function TasksPage() {
  const data = useData();
  const { user } = useSession();
  const { scope, locationId } = useLocation();
  const { toast } = useToast();
  const { rows: tasks } = useTable<TaskRow>('tasks', { where: scope, orderBy: { column: 'due_on' } });
  const { rows: employees } = useTable<EmployeeRow>('employees', { where: { ...scope, status: 'active' } });
  const [tab, setTab] = useState<'open' | 'done' | 'all'>('open');
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState<{ req: PinApprovalRequest; task: TaskRow } | null>(null);
  const [form, setForm] = useState<{ title: string; description: string; assignee_id: string; due_on: string | null; priority: TaskRow['priority']; kind: TaskRow['kind'] }>({ title: '', description: '', assignee_id: '', due_on: today(), priority: 'normal', kind: 'task' });
  const who = (id: string | null) => employees.find((e) => e.id === id)?.display_name ?? 'Unassigned';
  const visible = useMemo(() => tasks.filter((t) => tab === 'all' || (tab === 'done' ? t.status === 'done' : t.status !== 'done')), [tasks, tab]);
  const checklists = visible.filter((t) => t.kind === 'checklist'), plain = visible.filter((t) => t.kind === 'task');
  const overdue = tasks.filter((t) => t.status !== 'done' && t.due_on && t.due_on < today()).length;
  const toggle = (t: TaskRow) => data.update('tasks', t.id, t.status === 'done' ? { status: 'open', completed_at: null } : { status: 'done', completed_at: new Date().toISOString() });
  const add = async () => {
    if (!form.title.trim()) return;
    await data.insert('tasks', { location_id: locationId, title: form.title.trim(), description: form.description.trim() || null, assignee_id: form.assignee_id || null, created_by: user.id, due_on: form.due_on, priority: form.priority, status: 'open', kind: form.kind, completed_at: null });
    setOpen(false); setForm({ title: '', description: '', assignee_id: '', due_on: today(), priority: 'normal', kind: 'task' }); toast({ tone: 'success', title: 'Task added' });
  };
  const askDelete = (t: TaskRow) => setPin({ task: t, req: { action: 'task.delete', title: 'Delete task', description: `"${t.title}" will be removed. Deleting records needs a manager PIN (R-P01).`, subjectTable: 'tasks', subjectId: t.id, details: { title: t.title } } });
  const Row = ({ t }: { t: TaskRow }) => (
    <div className={`ex-task ${t.status === 'done' ? 'is-done' : ''}`}>
      <Checkbox aria-label={`Complete ${t.title}`} checked={t.status === 'done'} onChange={() => void toggle(t)} />
      <div className="ex-task-text"><span className="ex-task-title">{t.title}</span>{t.description && <span className="xs muted">{t.description}</span>}<div className="ex-task-meta"><span>{who(t.assignee_id)}</span>{t.due_on && <span className={t.status !== 'done' && t.due_on < today() ? 'tone-danger' : ''}>due {new Date(`${t.due_on}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}<Badge size="sm" tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>{t.status === 'in_progress' && <Badge size="sm" tone="warn">in progress</Badge>}</div></div>
      <div className="ex-task-actions">{t.status === 'open' && <Button size="sm" variant="ghost" onClick={() => void data.update('tasks', t.id, { status: 'in_progress' })}>Start</Button>}<IconButton icon="trash" label={`Delete ${t.title}`} size="sm" onClick={() => askDelete(t)} /></div>
    </div>
  );
  return (
    <div className="container ex-page">
      <PageHeader code="F-68" title="Tasks & checklists" subtitle="What the team has to do at this location. Checklists are the daily opening and closing lists; tasks are one-offs. Deleting needs a manager PIN." actions={<Button size="sm" icon="plus" onClick={() => setOpen(true)}>Add</Button>}>
        <Tabs size="sm" value={tab} onChange={setTab} ariaLabel="Status" items={[{ key: 'open', label: 'Open', count: tasks.filter((t) => t.status !== 'done').length }, { key: 'done', label: 'Done', count: tasks.filter((t) => t.status === 'done').length }, { key: 'all', label: 'All', count: tasks.length }]} />
      </PageHeader>
      <div className="ex-kpis"><StatTile label="Open" value={tasks.filter((t) => t.status !== 'done').length} icon="list" /><StatTile label="Overdue" value={overdue} icon="warning" tone={overdue ? 'primary' : 'default'} /><StatTile label="Done today" value={tasks.filter((t) => t.completed_at?.slice(0, 10) === today()).length} icon="check" /></div>
      <div className="ex-grid-2">
        <Section title="Checklists" description="Opening and closing, every day."><Card padding="sm">{checklists.length === 0 ? <EmptyState compact icon="check" title="No checklist items" /> : checklists.map((t) => <Row key={t.id} t={t} />)}</Card></Section>
        <Section title="Tasks" description="One-offs with an owner and a due date."><Card padding="sm">{plain.length === 0 ? <EmptyState compact icon="list" title="Nothing here" body={tab === 'open' ? 'Add a task or switch to Done.' : undefined} /> : plain.map((t) => <Row key={t.id} t={t} />)}</Card></Section>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add a task" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void add()} disabled={!form.title.trim()}>Add</Button></>}>
        <div className="stack">
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={100} showCount required />
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} maxLength={300} showCount />
          <div className="grid grid-2"><Select label="Kind" value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as TaskRow['kind'] }))} options={[{ value: 'task', label: 'Task (once)' }, { value: 'checklist', label: 'Checklist item (daily)' }]} /><Select label="Priority" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskRow['priority'] }))} options={[{ value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }]} /></div>
          <Select label="Assignee" placeholder="Unassigned" value={form.assignee_id} onChange={(e) => setForm((f) => ({ ...f, assignee_id: e.target.value }))} options={employees.map((e) => ({ value: e.id, label: e.display_name ?? e.name }))} />
          <DatePicker label="Due" value={form.due_on} onChange={(iso) => setForm((f) => ({ ...f, due_on: iso }))} />
        </div>
      </Drawer>
      <PinApprovalModal open={!!pin} request={pin?.req ?? null} onClose={() => setPin(null)} onApproved={() => { const t = pin?.task; setPin(null); if (t) void data.remove('tasks', t.id).then(() => toast({ tone: 'info', title: 'Task deleted', body: 'Approval written to the audit.' })); }} />
    </div>
  );
}
