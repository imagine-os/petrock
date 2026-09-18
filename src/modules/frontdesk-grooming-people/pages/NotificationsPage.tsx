import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../../components/molecule/Tabs/Tabs';
import { Card } from '../../../components/molecule/Card/Card';
import { Button } from '../../../components/atom/Button/Button';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { StaffNotificationItem } from '../../../components/molecule/StaffNotificationItem/StaffNotificationItem';
import { useData, useTable } from '../../../data/DataContext';
import { useSession } from '../../../auth/SessionProvider';
import type { NotificationRow } from '../../../data/schema/core';
import { fmtDate, relativeTime, todayIso } from '../lib';
import '../module.css';

/** F-58 Staff notifications (replaces the F-60 stub path; the TopBar bell links here). */
export function NotificationsPage() {
  const nav = useNavigate();
  const data = useData();
  const { user } = useSession();
  const { rows } = useTable<NotificationRow>('notifications', { where: { user_id: user.id }, orderBy: { column: 'sent_at', dir: 'desc' } });
  const [tab, setTab] = useState<'unread' | 'all'>('unread');
  const list = useMemo(() => (tab === 'unread' ? rows.filter((r) => !r.read) : rows), [rows, tab]);
  const unread = rows.filter((r) => !r.read).length;
  const groups = useMemo(() => { const m = new Map<string, NotificationRow[]>(); for (const n of list) { const d = n.sent_at.slice(0, 10); const k = d === todayIso() ? 'Today' : fmtDate(d, { weekday: 'long', month: 'short', day: 'numeric' }); if (!m.has(k)) m.set(k, []); m.get(k)!.push(n); } return [...m.entries()]; }, [list]);
  const open = async (n: NotificationRow) => { if (!n.read) await data.update<NotificationRow>('notifications', n.id, { read: true }); if (n.link) nav(n.link); };
  const markAll = async () => { for (const n of rows.filter((r) => !r.read)) await data.update<NotificationRow>('notifications', n.id, { read: true }); };
  return (
    <div className="page stack" style={{ maxWidth: 760 }}>
      <PageHeader code="F-58" title="Notifications" subtitle={`${user.name} · ${unread} unread`} actions={unread > 0 ? <Button variant="secondary" size="sm" icon="check" onClick={markAll}>Mark all read</Button> : undefined} />
      <Tabs items={[{ key: 'unread', label: 'Unread', count: unread }, { key: 'all', label: 'All', count: rows.length }]} value={tab} onChange={setTab} ariaLabel="Notifications" />
      {groups.length === 0 ? <EmptyState icon="bell" title={tab === 'unread' ? 'You are all caught up' : 'No notifications yet'} body="Vaccine uploads, new app bookings, messages and approvals land here." /> : (
        <Card padding="sm">
          {groups.map(([day, list]) => <div key={day}><div className="fgp-ntf-day">{day}</div>{list.map((n) => <StaffNotificationItem key={n.id} kind={n.kind} title={n.title} body={n.body} when={relativeTime(n.sent_at)} read={n.read} onOpen={() => open(n)} onToggleRead={() => data.update<NotificationRow>('notifications', n.id, { read: !n.read })} />)}</div>)}
        </Card>
      )}
    </div>
  );
}
