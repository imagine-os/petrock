/** customer-settings-chat: customer profile & settings (C-70..C-79), notifications & Front Desk chat (C-80..C-84). */
import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import type { Role } from '../../auth/roles';
import { ProfileHubPage } from './ProfileHubPage';
import { EditProfilePage } from './EditProfilePage';
import { AppSettingsPage } from './AppSettingsPage';
import { LanguagePage } from './LanguagePage';
import { PaymentMethodsPage } from './PaymentMethodsPage';
import { NotificationPrefsPage } from './NotificationPrefsPage';
import { DeleteAccountPage } from './DeleteAccountPage';
import { HelpSupportPage } from './HelpSupportPage';
import { AboutLegalPage } from './AboutLegalPage';
import { LegalDocumentPage } from './LegalDocumentPage';
import { NotificationCenterPage } from './NotificationCenterPage';
import { InboxPage } from './InboxPage';
import { ChatThreadPage } from './ChatThreadPage';
import { RateAppPage } from './RateAppPage';
import { ChangePasswordPage } from './ChangePasswordPage';
import * as S from './specs';
export { strings } from './useCustomerAccount';

const roles: Role[] = ['customer', 'super_admin'];
const page = (path: string, el: () => JSX.Element, spec: RouteDef['spec'], nav?: RouteDef['nav']): RouteDef => ({ path, element: h(el), spec, roles, surface: 'customer', layout: 'mobile', nav });

export const routes: RouteDef[] = [
  page('/app/profile', ProfileHubPage, S.profileHubSpec, { label: 'Settings', icon: 'settings', order: 40, group: 'customer' }),
  page('/app/profile/edit', EditProfilePage, S.editProfileSpec),
  page('/app/settings', AppSettingsPage, S.appSettingsSpec),
  page('/app/settings/language', LanguagePage, S.languageSpec),
  page('/app/payment-methods', PaymentMethodsPage, S.paymentMethodsSpec),
  page('/app/settings/notifications', NotificationPrefsPage, S.notificationPrefsSpec),
  page('/app/settings/delete-account', DeleteAccountPage, S.deleteAccountSpec),
  page('/app/help', HelpSupportPage, S.helpSupportSpec),
  page('/app/about', AboutLegalPage, S.aboutLegalSpec),
  page('/app/legal/:slug', LegalDocumentPage, S.legalDocumentSpec),
  page('/app/notifications', NotificationCenterPage, S.notificationCenterSpec),
  page('/app/inbox', InboxPage, S.inboxSpec, { label: 'Chat', icon: 'message', order: 30, group: 'customer' }),
  page('/app/inbox/:conversationId', ChatThreadPage, S.chatThreadSpec),
  page('/app/rate', RateAppPage, S.rateAppSpec),
  page('/app/settings/password', ChangePasswordPage, S.changePasswordSpec),
];
