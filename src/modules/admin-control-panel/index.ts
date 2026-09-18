/** admin-control-panel: owner / super-admin Control Panel, A-01..A-49 (A-40 Settings › Rules lives in settings-rules). */
import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import type { StringTable } from '../../i18n/types';
import { DashboardPage } from './DashboardPage';
import { CompanyPage, LocationPage, AddLocationPage } from './CompanyPages';
import { RoomsPage } from './RoomsPage';
import { RatesPage, DiscountsPage, FeesTaxesPage, DaycarePricingPage, PackagesPage, AddonsPage, ServicesPage } from './PricingPages';
import { PricingPreviewPage } from './PricingPreviewPage';
import { ProvidersPage } from './ProvidersPage';
import { EmployeesPage } from './EmployeesPage';
import { RolesPage, MenusPage } from './RolesPages';
import { ReviewsPage, FeedbackInboxPage, ApprovalsPage, AuditLogPage } from './InboxPages';
import { ReportsPage } from './ReportsPage';
import { BackupsPage, SettingsPage } from './SystemPages';
import * as S from './specs';

export const strings: StringTable = {
  'admin-control-panel.dashboard': { en: 'Dashboard', es: 'Panel' },
  'admin-control-panel.company': { en: 'Company & locations', es: 'Empresa y sedes' },
  'admin-control-panel.pricing': { en: 'Pricing', es: 'Precios' },
  'admin-control-panel.employees': { en: 'Employees', es: 'Empleados' },
  'admin-control-panel.reports': { en: 'Reports & analytics', es: 'Informes' },
};

const OWN = ['owner', 'super_admin'] as const;
const OWN_MGR = ['owner', 'super_admin', 'manager'] as const;
const base = { surface: 'admin' as const, layout: 'desktop' as const };
const r = (path: string, el: () => JSX.Element, spec: RouteDef['spec'], roles: readonly RouteDef['roles'][number][], nav?: RouteDef['nav']): RouteDef => ({ ...base, path, element: h(el), spec, roles: [...roles], nav });

export const routes: RouteDef[] = [
  r('/admin', DashboardPage, S.dashboardSpec, OWN, { label: 'Dashboard', icon: 'chart', order: 0, group: 'overview' }),
  r('/admin/reports', ReportsPage, S.reportsSpec, OWN_MGR, { label: 'Reports & analytics', icon: 'chart', order: 0, group: 'reports' }),
  r('/admin/company', CompanyPage, S.companySpec, OWN, { label: 'Company & locations', icon: 'building', order: 10, group: 'settings' }),
  r('/admin/locations/new', AddLocationPage, S.addLocationSpec, OWN),
  r('/admin/locations/:id', LocationPage, S.locationSpec, OWN),
  r('/admin/rooms', RoomsPage, S.roomsSpec, OWN, { label: 'Rooms & room types', icon: 'bed', order: 12, group: 'settings' }),
  r('/admin/pricing', PricingPreviewPage, S.pricingPreviewSpec, OWN_MGR, { label: 'Pricing', icon: 'dollar', order: 20, group: 'settings' }),
  r('/admin/pricing/rates', RatesPage, S.ratesSpec, OWN),
  r('/admin/pricing/discounts', DiscountsPage, S.discountsSpec, OWN),
  r('/admin/pricing/fees', FeesTaxesPage, S.feesSpec, OWN),
  r('/admin/pricing/daycare', DaycarePricingPage, S.daycarePricingSpec, OWN),
  r('/admin/pricing/packages', PackagesPage, S.packagesSpec, OWN),
  r('/admin/pricing/addons', AddonsPage, S.addonsSpec, OWN),
  r('/admin/services', ServicesPage, S.servicesSpec, OWN, { label: 'Services', icon: 'sparkle', order: 22, group: 'settings' }),
  r('/admin/providers', ProvidersPage, S.providersSpec, OWN, { label: 'Providers', icon: 'globe', order: 60, group: 'settings' }),
  r('/admin/employees', EmployeesPage, S.employeesSpec, OWN, { label: 'Employees', icon: 'users', order: 30, group: 'people' }),
  r('/admin/roles', RolesPage, S.rolesSpec, OWN, { label: 'Roles & permissions', icon: 'shield', order: 40, group: 'settings' }),
  r('/admin/menus', MenusPage, S.menusSpec, OWN, { label: 'Side menus', icon: 'menu', order: 42, group: 'settings' }),
  r('/admin/reviews', ReviewsPage, S.reviewsSpec, OWN_MGR, { label: 'Reviews', icon: 'star', order: 20, group: 'messages' }),
  r('/admin/feedback', FeedbackInboxPage, S.feedbackSpec, OWN_MGR, { label: 'Feedback inbox', icon: 'feedback', order: 30, group: 'messages' }),
  r('/admin/approvals', ApprovalsPage, S.approvalsSpec, OWN_MGR, { label: 'Approvals log', icon: 'key', order: 50, group: 'reports' }),
  r('/admin/audit', AuditLogPage, S.auditSpec, OWN_MGR, { label: 'Audit log', icon: 'list', order: 52, group: 'reports' }),
  r('/admin/backups', BackupsPage, S.backupsSpec, OWN, { label: 'Backups & export', icon: 'download', order: 70, group: 'settings' }),
  r('/admin/settings', SettingsPage, S.settingsSpec, OWN, { label: 'General settings', icon: 'settings', order: 80, group: 'settings' }),
];
