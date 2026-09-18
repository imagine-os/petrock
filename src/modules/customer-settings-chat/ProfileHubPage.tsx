import { useNavigate } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { useData, useTable } from '../../data/DataContext';
import type { NotificationRow as NotificationRowType, ConversationRow } from '../../data/schema/core';
import type { PaymentMethodRow } from '../../data/schema/customer-settings-chat';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { AccountProfileHero } from '../../components/molecule/AccountProfileHero/AccountProfileHero';
import { AccountMenuRow } from '../../components/molecule/AccountMenuRow/AccountMenuRow';
import { Badge } from '../../components/atom/Badge/Badge';
import { Chip } from '../../components/atom/Chip/Chip';
import { useToast } from '../../components/molecule/Toast/Toast';
import { CARD_BRAND_LABEL } from '../../components/molecule/PaymentCardTile/PaymentCardTile';
import { useCustomerAccount } from './useCustomerAccount';
import { k } from './useCustomerAccount';
import './customer-settings-chat.css';

/** C-70 Settings hub (Figma profile.jpg): 110 px avatar in the dashed coral ring, Be Vietnam Pro name, email, then 68 px rows with alternating purple / coral filled icons and 1 px rules directly on the #F4F6FA screen (R-M06). */
export function ProfileHubPage() {
  const nav = useNavigate();
  const data = useData();
  const { signOut } = useSession();
  const { toast } = useToast();
  const acc = useCustomerAccount();
  const { t } = acc;
  const { rows: unread } = useTable<NotificationRowType>('notifications', { where: { user_id: acc.accountUserId, read: false } });
  const { rows: convs } = useTable<ConversationRow>('conversations', acc.customer ? { where: { customer_id: acc.customer.id } } : undefined);
  const { rows: cards } = useTable<PaymentMethodRow>('payment_methods', acc.customer ? { where: { customer_id: acc.customer.id, status: 'active' } } : undefined);
  const unreadChat = acc.customer ? convs.reduce((n, c) => n + (c.unread_customer ?? 0), 0) : 0;
  const defaultCard = cards.find((c) => c.is_default) ?? cards[0];

  const setPhoto = async (dataUrl: string) => { if (acc.userRow) { await data.update('users', acc.userRow.id, { avatar_url: dataUrl }); toast(t(k('common.saved'))); } };

  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('profile.title'))} backTo="/app" rule={false} />
      <AccountProfileHero name={acc.displayName} email={acc.email} avatarUrl={acc.avatarUrl} onPhoto={setPhoto} onTooLarge={() => toast({ tone: 'warn', title: 'Photo too large', body: 'Choose an image under 1.5 MB.' })} />
      {acc.previewing && <div className="csc-preview"><Chip size="sm" icon="eye" tone="primary">{t(k('profile.previewing'), { name: acc.displayName })}</Chip></div>}
      <div className="csc-body is-flush">
        <div className="csc-list">
          <AccountMenuRow icon="user" label={t(k('profile.edit'))} to="/app/profile/edit" tone="primary" />
          <AccountMenuRow icon="paw" label={t(k('profile.pets'))} to="/app/pets" tone="accent" />
          <AccountMenuRow icon="users" label={t(k('profile.addPet'))} to="/app/pets/new" tone="primary" />
          <AccountMenuRow icon="location" label={t(k('profile.address'))} to="/app/profile/edit" tone="accent" />
          <AccountMenuRow icon="card" label={t(k('profile.payments'))} value={defaultCard ? `${CARD_BRAND_LABEL[defaultCard.brand ?? 'other']} ···· ${defaultCard.last4}` : undefined} to="/app/payment-methods" tone="primary" />
          <AccountMenuRow icon="bell" label={t(k('profile.notifications'))} trailing={unread.length ? <Badge tone="danger" size="sm" variant="pill">{unread.length}</Badge> : undefined} to="/app/notifications" tone="accent" />
          <AccountMenuRow icon="message" label={t(k('profile.chat'))} trailing={unreadChat ? <Badge tone="primary" size="sm" variant="pill">{unreadChat}</Badge> : undefined} to="/app/inbox" tone="primary" />
          <AccountMenuRow icon="settings" label={t(k('profile.settings'))} to="/app/settings" tone="accent" />
          <AccountMenuRow icon="star" label={t(k('profile.rate'))} to="/app/rate" tone="primary" />
          <AccountMenuRow icon="info" label={t(k('profile.about'))} to="/app/about" tone="accent" />
          <AccountMenuRow icon="question" label={t(k('profile.help'))} to="/app/help" tone="primary" />
          <AccountMenuRow icon="logout" label={t(k('profile.logout'))} tone="accent" onClick={() => { signOut(); nav('/auth/sign-in'); }} />
        </div>
      </div>
    </div>
  );
}
