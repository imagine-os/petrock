import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData, useTable } from '../../data/DataContext';
import type { ConversationRow, NotificationRow as NotificationRowType } from '../../data/schema/core';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Chip } from '../../components/atom/Chip/Chip';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { NotificationRow } from '../../components/molecule/NotificationRow/NotificationRow';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { ConversationList } from './ConversationList';
import { useCustomerAccount, k } from './useCustomerAccount';
import { dayLabel, relativeTime } from './time';
import './customer-settings-chat.css';

type Tab = 'notifications' | 'inbox';

/** C-80 Notification centre: Notifications | Inbox tabs, unread filter, mark all read, grouped by day, tap opens the linked screen (R-M07, R-M08). */
export function NotificationCenterPage() {
  const nav = useNavigate();
  const data = useData();
  const [params, setParams] = useSearchParams();
  const acc = useCustomerAccount();
  const { t, lang, customer } = acc;
  const tab = (params.get('tab') as Tab) || 'notifications';
  const [onlyUnread, setOnlyUnread] = useState(false);
  const { rows } = useTable<NotificationRowType>('notifications', { where: { user_id: acc.accountUserId }, orderBy: { column: 'sent_at', dir: 'desc' } });
  const { rows: convs } = useTable<ConversationRow>('conversations', customer ? { where: { customer_id: customer.id } } : undefined);
  const unreadChat = customer ? convs.reduce((n, c) => n + (c.unread_customer ?? 0), 0) : 0;
  const unread = rows.filter((r) => !r.read);
  const shown = onlyUnread ? unread : rows;
  const groups = useMemo(() => { const g = new Map<string, NotificationRowType[]>(); const now = new Date(); for (const r of shown) { const key = dayLabel(r.sent_at, now, lang); g.set(key, [...(g.get(key) ?? []), r]); } return [...g.entries()]; }, [shown, lang]);

  const open = async (n: NotificationRowType) => { if (!n.read) await data.update('notifications', n.id, { read: true }); if (n.link) nav(n.link); };
  const markAll = async () => { await Promise.all(unread.map((n) => data.update('notifications', n.id, { read: true }))); };

  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={tab === 'inbox' ? t(k('notif.inbox')) : t(k('notif.title'))} backTo="/app" actions={<IconButton icon="settings" label={t(k('prefs.title'))} onClick={() => nav('/app/settings/notifications')} />} />
      <div style={{ padding: '0 var(--sp-4)' }}>
        <Tabs<Tab> ariaLabel="Notification centre" value={tab} onChange={(v) => setParams(v === 'notifications' ? {} : { tab: v })} items={[{ key: 'notifications', label: t(k('notif.title')), count: unread.length || undefined }, { key: 'inbox', label: t(k('notif.inbox')), count: unreadChat || undefined }]} />
      </div>
      {tab === 'inbox' ? (
        <div className="csc-body"><ConversationList /></div>
      ) : (
        <div className="csc-body is-flush">
          <div className="csc-filters">
            <div className="row" style={{ gap: 6 }}><Chip size="sm" selected={!onlyUnread} tone="primary" onClick={() => setOnlyUnread(false)}>{t(k('notif.all'))} {rows.length}</Chip><Chip size="sm" selected={onlyUnread} tone="primary" onClick={() => setOnlyUnread(true)}>{t(k('notif.unread'))} {unread.length}</Chip></div>
            {unread.length > 0 && <Button variant="link" size="sm" onClick={markAll}>{t(k('notif.markAll'))}</Button>}
          </div>
          {shown.length === 0 ? (
            <div style={{ padding: '0 var(--sp-4)' }}><EmptyState icon="bell" title={t(k('notif.empty'))} body={t(k('notif.empty.body'))} /></div>
          ) : groups.map(([label, items]) => (
            <div key={label} className="csc-group">
              <p className="eyebrow csc-daylabel">{label}</p>
              <Card padding="none" style={{ borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
                {items.map((n) => <NotificationRow key={n.id} kind={n.kind} title={n.title} body={n.body ?? undefined} time={relativeTime(n.sent_at, new Date(), lang)} read={n.read} onClick={() => open(n)} onDismiss={() => data.remove('notifications', n.id)} />)}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
