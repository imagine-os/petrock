import { useNavigate } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { NotificationRow as NotificationRowType } from '../../data/schema/core';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Chip } from '../../components/atom/Chip/Chip';
import { ConversationList } from './ConversationList';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

/** C-81 Inbox ("Chat" tab): one Front Desk thread per location (R-M20), bell to the notification centre. */
export function InboxPage() {
  const nav = useNavigate();
  const acc = useCustomerAccount();
  const { t } = acc;
  const { rows: unread } = useTable<NotificationRowType>('notifications', { where: { user_id: acc.accountUserId, read: false } });
  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('inbox.title'))} subtitle={t(k('inbox.subtitle'))} backTo="/app" actions={<IconButton icon="bell" label={t(k('notif.title'))} badge={unread.length || undefined} onClick={() => nav('/app/notifications')} />} />
      {acc.previewing && <div className="csc-preview"><Chip size="sm" icon="eye" tone="primary">{t(k('profile.previewing'), { name: acc.displayName })}</Chip></div>}
      <div className="csc-body"><ConversationList /></div>
    </div>
  );
}
