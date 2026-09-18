import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useData, useTable } from '../../../data/DataContext';
import type { EmployeeRow } from '../../../data/schema/core';
import type { TrainingCompletionRow } from '../../../data/schema/extras-manual-website';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { StatTile } from '../../../components/molecule/StatTile/StatTile';
import { Badge } from '../../../components/atom/Badge/Badge';
import { Button } from '../../../components/atom/Button/Button';
import { Icon } from '../../../components/atom/Icon/Icon';
import { SegmentedControl } from '../../../components/molecule/SegmentedControl/SegmentedControl';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { chapterPath, chapters, chaptersForRole, readingMinutes } from '../manual/manualIndex';
import './extras.css';

/** F-66 Education: manual chapters as lessons; per-employee matrix of online / in-person completion; managers sign off (R-X74). */
export function EducationPage() {
  const data = useData();
  const { user, role, can } = useSession();
  const { scope, locationId } = useLocation();
  const { toast } = useToast();
  const { rows: employees } = useTable<EmployeeRow>('employees', { where: { ...scope, status: 'active' } });
  const { rows: completions } = useTable<TrainingCompletionRow>('training_completions', { where: scope });
  const [view, setView] = useState<'mine' | 'team'>(can('employees.read') ? 'team' : 'mine');
  const me = employees.find((e) => e.user_id === user.id);
  const mine = useMemo(() => completions.filter((c) => (me ? c.employee_id === me.id : c.user_id === user.id)), [completions, me, user.id]);
  const myChapters = chaptersForRole(role);
  const find = (empId: string, slug: string, mode: 'online' | 'in_person') => completions.find((c) => c.employee_id === empId && c.chapter_slug === slug && c.mode === mode);
  const signOff = async (c: TrainingCompletionRow) => { await data.update('training_completions', c.id, { signed_off_by: me?.id ?? user.id }); toast({ tone: 'success', title: 'Signed off', body: `${c.chapter_code} · in-person lesson` }); };
  const record = async (empId: string, slug: string, code: string, mode: 'online' | 'in_person') => { const emp = employees.find((e) => e.id === empId); await data.insert('training_completions', { location_id: emp?.location_id ?? locationId, employee_id: empId, user_id: emp?.user_id ?? null, chapter_slug: slug, chapter_code: code, mode, completed_at: new Date().toISOString(), signed_off_by: mode === 'in_person' ? (me?.id ?? user.id) : null, note: 'Recorded by manager' }); };
  const canSign = can('employees.read') || role === 'manager';
  const progress = (empId: string) => { const done = chapters.filter((ch) => find(empId, ch.slug, 'online') && find(empId, ch.slug, 'in_person')).length; return { done, pct: chapters.length ? Math.round((done / chapters.length) * 100) : 0 }; };
  return (
    <div className="container ex-page">
      <PageHeader code="F-66" title="Education" subtitle="Every ops-manual chapter is a lesson in two halves. Staff record what they read and did; managers sign off in-person lessons." actions={can('employees.read') ? <SegmentedControl size="sm" ariaLabel="View" value={view} onChange={setView} options={[{ value: 'mine', label: 'My progress' }, { value: 'team', label: 'Team' }]} /> : undefined} />
      {view === 'mine' || !can('employees.read') ? (
        <>
          <div className="ex-kpis"><StatTile label="Chapters for my role" value={myChapters.length} icon="book" /><StatTile label="Online lessons read" value={mine.filter((c) => c.mode === 'online').length} icon="globe" /><StatTile label="In-person done" value={mine.filter((c) => c.mode === 'in_person').length} hint={`${mine.filter((c) => c.mode === 'in_person' && c.signed_off_by).length} signed off`} icon="users" tone="primary" /></div>
          <Card padding="lg" className="stack">
            {myChapters.length === 0 && <EmptyState compact icon="book" title="No chapters assigned to this role" body="Browse the manual cover instead." action={<Link to="/manual"><Button size="sm" variant="secondary">Open the manual</Button></Link>} />}
            {myChapters.map((ch) => { const on = mine.find((c) => c.chapter_slug === ch.slug && c.mode === 'online'); const ip = mine.find((c) => c.chapter_slug === ch.slug && c.mode === 'in_person'); return <div key={ch.slug} className="ex-task"><span className="chcard-code">{ch.code}</span><div className="ex-task-text"><Link to={chapterPath(ch.slug)}><strong>{ch.number}. {ch.title}</strong></Link><div className="ex-task-meta"><span><Icon name="clock" size={12} /> {readingMinutes(ch)} min</span>{ch.roles.map((r) => <span key={r}>{r}</span>)}</div></div><div className="row wrap" style={{ gap: 6 }}><Badge size="sm" tone={on ? 'success' : 'neutral'}>{on ? 'online read' : 'online pending'}</Badge><Badge size="sm" tone={ip?.signed_off_by ? 'success' : ip ? 'warn' : 'neutral'}>{ip?.signed_off_by ? 'in-person signed off' : ip ? 'in-person awaiting sign-off' : 'in-person pending'}</Badge></div></div>; })}
          </Card>
        </>
      ) : (
        <>
          <div className="ex-kpis"><StatTile label="Active staff here" value={employees.length} icon="users" /><StatTile label="Awaiting sign-off" value={completions.filter((c) => c.mode === 'in_person' && !c.signed_off_by).length} icon="flag" tone="primary" /><StatTile label="Fully trained" value={employees.filter((e) => progress(e.id).pct === 100).length} hint={`of ${employees.length}`} icon="check" /></div>
          <Card padding="none"><div className="ex-matrix"><table>
            <thead><tr><th>Employee</th><th>Progress</th>{chapters.map((ch) => <th key={ch.slug} title={ch.title}><Link to={chapterPath(ch.slug)}>{ch.number}</Link></th>)}</tr></thead>
            <tbody>{employees.map((e) => { const p = progress(e.id); return <tr key={e.id}><td><strong>{e.display_name ?? e.name}</strong><div className="xs muted">{e.job_title}</div></td><td><div className="ex-meter" style={{ minWidth: 90 }}><div className="ex-meter-bar"><div style={{ width: `${p.pct}%` }} /></div><span className="xs muted">{p.done}/{chapters.length}</span></div></td>{chapters.map((ch) => { const on = find(e.id, ch.slug, 'online'); const ip = find(e.id, ch.slug, 'in_person'); return <td key={ch.slug}><span className="ex-cell"><button type="button" className={on ? 'is-on' : ''} title={on ? `Online read ${new Date(on.completed_at).toLocaleDateString()}` : 'Online lesson not read (click to record)'} disabled={!!on || !canSign} onClick={() => void record(e.id, ch.slug, ch.code, 'online')}><Icon name="globe" size={12} /></button><button type="button" className={ip?.signed_off_by ? 'is-on' : ip ? 'is-pending' : ''} title={ip?.signed_off_by ? 'In-person signed off' : ip ? 'In-person done, click to sign off' : 'In-person not done (click to record and sign off)'} disabled={!canSign || !!ip?.signed_off_by} onClick={() => (ip ? void signOff(ip) : void record(e.id, ch.slug, ch.code, 'in_person'))}><Icon name={ip?.signed_off_by ? 'check' : 'users'} size={12} /></button></span></td>; })}</tr>; })}</tbody>
          </table></div></Card>
          <p className="xs muted">Globe = online lesson read · people = in-person lesson done (amber until a manager signs off, green when signed). Managers click a cell to record or sign off.</p>
        </>
      )}
    </div>
  );
}
