import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData, useTable } from '../../data/DataContext';
import type { ConversationRow, NotificationRow as NotificationRowType } from '../../data/schema/core';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Button } from '../../components/atom/Button/Button';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { NotificationRow } from '../../components/molecule/NotificationRow/NotificationRow';
import { ConversationList } from './ConversationList';
import { useCustomerAccount, k } from './useCustomerAccount';
import { relativeTime } from './time';
import './customer-settings-chat.css';

type Tab = 'notifications' | 'inbox';

/** C-80 Notification (Figma notification.png): header "Notification" with a "Mark all read" text action, split tabs Notification | Front Desk Chat, plain rows (44 px disc, filled while unread, title, "25 Min Ago"); tap opens the linked screen (R-M07, R-M08). */
export function NotificationCenterPage() {
  const nav = useNavigate();
  const data = useData();
  const [params, setParams] = useSearchParams();
  const acc = useCustomerAccount();
  const { t, lang, customer } = acc;
  const tab = (params.get('tab') as Tab) || 'notifications';
  const { rows } = useTable<NotificationRowType>('notifications', { where: { user_id: acc.accountUserId }, orderBy: { column: 'sent_at', dir: 'desc' } });
  const { rows: convs } = useTable<ConversationRow>('conversations', customer ? { where: { customer_id: customer.id } } : undefined);
  const unreadChat = customer ? convs.reduce((n, c) => n + (c.unread_customer ?? 0), 0) : 0;
  const unread = rows.filter((r) => !r.read);

  const open = async (n: NotificationRowType) => { if (!n.read) await data.update('notifications', n.id, { read: true }); if (n.link) nav(n.link); };
  const markAll = async () => { await Promise.all(unread.map((n) => data.update('notifications', n.id, { read: true }))); };

  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('notif.title'))} backTo="/app" rule={false} actions={tab === 'notifications' && unread.length > 0 ? <Button variant="link" size="sm" onClick={markAll}>{t(k('notif.markAll'))}</Button> : undefined} />
      <Tabs<Tab> variant="split" ariaLabel="Notification centre" value={tab} onChange={(v) => setParams(v === 'notifications' ? {} : { tab: v })} items={[{ key: 'notifications', label: t(k('notif.title')) }, { key: 'inbox', label: t(k('notif.inbox')), count: unreadChat || undefined }]} />
      {tab === 'inbox' ? (
        <div className="csc-body"><ConversationList /></div>
      ) : (
        <div className="csc-body is-flush">
          {rows.length === 0 ? (
            <div style={{ padding: '0 var(--sp-4)' }}><EmptyState icon="bell" title={t(k('notif.empty'))} body={t(k('notif.empty.body'))} /></div>
          ) : (
            <div className="csc-list">
              {rows.map((n) => <NotificationRow key={n.id} kind={n.kind} title={n.title} time={relativeTime(n.sent_at, new Date(), lang)} read={n.read} onClick={() => open(n)} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
