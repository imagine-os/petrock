import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../../../auth/SessionProvider';
import { useData, useTable } from '../../../data/DataContext';
import type { NotificationRow } from '../../../data/schema/core';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../../components/molecule/Card/Card';
import { Button } from '../../../components/atom/Button/Button';
import { Tabs } from '../../../components/molecule/Tabs/Tabs';
import { Select } from '../../../components/atom/Select/Select';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { NOTIFICATION_KIND_LABEL, StaffNotificationRow } from '../../../components/molecule/StaffNotificationRow/StaffNotificationRow';
import './extras.css';

/** F-60 Staff notifications for the signed-in user: unread / all tabs, kind filter, mark read on open, mark all read (R-X48, R-M07, R-M08). */
export function StaffNotificationsPage() {
  const data = useData();
  const { user } = useSession();
  const { rows } = useTable<NotificationRow>('notifications', { where: { user_id: user.id }, orderBy: { column: 'sent_at', dir: 'desc' } });
  const [tab, setTab] = useState<'unread' | 'all'>('unread');
  const [kind, setKind] = useState('');
  const unread = rows.filter((r) => !r.read);
  const list = useMemo(() => rows.filter((r) => (tab === 'all' || !r.read) && (!kind || r.kind === kind)), [rows, tab, kind]);
  const kinds = useMemo(() => [...new Set(rows.map((r) => r.kind))], [rows]);
  // The bell count drops as soon as the page is left: everything shown while the list was open counts as seen (R-X48).
  const [seen] = useState(() => new Set(unread.map((r) => r.id)));
  useEffect(() => () => { for (const id of seen) void data.update('notifications', id, { read: true }); }, [data, seen]);
  const markAll = async () => { for (const n of unread) await data.update('notifications', n.id, { read: true }); };
  return (
    <div className="container ex-page">
      <PageHeader code="F-60" title="Notifications" subtitle={`For ${user.name}. Vaccine proofs, new bookings, payments and messages that need a hand.`} actions={<Button variant="secondary" size="sm" icon="check" onClick={() => void markAll()} disabled={!unread.length}>Mark all read</Button>}>
        <div className="row wrap" style={{ justifyContent: 'space-between' }}>
          <Tabs size="sm" value={tab} onChange={setTab} ariaLabel="Read state" items={[{ key: 'unread', label: 'Unread', count: unread.length }, { key: 'all', label: 'All', count: rows.length }]} />
          <Select size="sm" aria-label="Kind" placeholder="All kinds" value={kind} onChange={(e) => setKind(e.target.value)} options={kinds.map((k) => ({ value: k, label: NOTIFICATION_KIND_LABEL[k] ?? k }))} />
        </div>
      </PageHeader>
      <Card padding="sm">
        {list.length === 0 ? <EmptyState icon="bell" title={tab === 'unread' ? 'You are all caught up' : 'No notifications yet'} body={tab === 'unread' ? 'New proofs, bookings and messages will show here.' : undefined} /> : (
          <div className="ex-ntf-list">{list.map((n) => <StaffNotificationRow key={n.id} kind={n.kind} title={n.title} body={n.body} link={n.link} read={n.read} sentAt={n.sent_at} onOpen={() => { if (!n.read) void data.update('notifications', n.id, { read: true }); }} onToggleRead={() => void data.update('notifications', n.id, { read: !n.read })} />)}</div>
        )}
      </Card>
    </div>
  );
}
