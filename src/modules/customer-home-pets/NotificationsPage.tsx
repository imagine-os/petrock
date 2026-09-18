import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useData, useTable } from '../../data/DataContext';
import type { NotificationRow } from '../../data/schema/core';
import { PhonePageHeader } from '../../components/molecule/PhonePageHeader/PhonePageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { AppNotificationRow } from '../../components/molecule/AppNotificationRow/AppNotificationRow';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Button } from '../../components/atom/Button/Button';
import { useToast } from '../../components/molecule/Toast/Toast';
import { relativeTime } from './lib';
import { routeExists } from './HomePage';
import './customer-home-pets.css';

export function NotificationsPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user } = useSession();
  const { rows } = useTable<NotificationRow>('notifications', { where: { user_id: user.id }, orderBy: { column: 'sent_at', dir: 'desc' } });
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const unread = useMemo(() => rows.filter((r) => !r.read), [rows]);
  const list = tab === 'unread' ? unread : rows;

  const open = async (n: NotificationRow) => {
    if (!n.read) await data.update<NotificationRow>('notifications', n.id, { read: true });
    if (n.link && routeExists(n.link)) nav(n.link); else if (n.link) toast({ tone: 'info', title: 'That page is coming soon', body: 'Marked as read.' });
  };
  const markAll = async () => { await Promise.all(unread.map((n) => data.update<NotificationRow>('notifications', n.id, { read: true }))); toast(`${unread.length} marked read`); };

  return (
    <div>
      <PhonePageHeader title={t('customer-home-pets.notifications.title')} backTo="/app" subtitle={unread.length ? `${unread.length} unread` : undefined}
        actions={<>{unread.length > 0 && <IconButton icon="check" label={t('customer-home-pets.notifications.markAll')} onClick={markAll} />}{routeExists('/app/chat') && <IconButton icon="message" label="Front desk chat" onClick={() => nav('/app/chat')} />}</>} />
      <div className="chp-page">
        <Tabs ariaLabel="Filter notifications" value={tab} onChange={setTab} items={[{ key: 'all', label: 'All', count: rows.length }, { key: 'unread', label: 'Unread', count: unread.length }]} />
        {list.length === 0 ? (
          <EmptyState icon="bell" title={t('customer-home-pets.notifications.empty')} body={tab === 'unread' ? 'No unread notifications.' : 'Booking confirmations, payments and vaccine reminders will show up here.'} action={tab === 'unread' && rows.length ? <Button variant="secondary" size="sm" onClick={() => setTab('all')}>Show all</Button> : undefined} />
        ) : (
          <div className="chp-ntf-list">{list.map((n) => <AppNotificationRow key={n.id} kind={n.kind} title={n.title} body={n.body} when={relativeTime(n.sent_at)} read={n.read} onClick={() => open(n)} />)}</div>
        )}
      </div>
    </div>
  );
}
