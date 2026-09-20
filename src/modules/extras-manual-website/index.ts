/**
 * extras-manual-website: public website (P-01..P-12), business operations manual (M-01..M-03 + one route per chapter
 * M-10..), and the front-desk extras (F-60 notifications, F-61 website inquiries, F-62..F-64 reports, F-65 reviews, F-66 education,
 * F-67 walking, F-68 tasks). Registered by src/app/registry.ts through the module glob.
 */
import { createElement as h } from 'react';
import type { RouteDef } from '../../specs/types';
import type { StringTable } from '../../i18n/types';
import { EVERYONE, STAFF_ROLES, type Role } from '../../auth/roles';
import { SiteHome } from './site/SiteHome';
import { SiteHotel, SiteGrooming, SiteDaycare } from './site/SiteServices';
import { SitePricing } from './site/SitePricing';
import { SiteLocations } from './site/SiteLocations';
import { SiteReviews } from './site/SiteReviews';
import { SiteGallery } from './site/SiteGallery';
import { SitePolicies, SiteBook, SiteContact, SiteFaq, SiteAbout } from './site/SiteInfo';
import { ManualCover, ManualChapterPage, ManualNotFound, ManualPending } from './manual/ManualPages';
import { chapters, chapterPath } from './manual/manualIndex';
import { StaffNotificationsPage } from './desk/StaffNotifications';
import { DeskMessagesPage } from './desk/DeskMessages';
import { ReportsOverviewPage, ReportRevenuePage, ReportOccupancyPage } from './desk/Reports';
import { ReviewsModerationPage } from './desk/ReviewsModeration';
import { EducationPage } from './desk/Education';
import { WalkingPage } from './desk/Walking';
import { TasksPage } from './desk/Tasks';
import { siteStrings } from './site/strings';
import { photoStrings } from './site/siteImages';
import * as S from './specs';

export const strings: StringTable = {
  ...siteStrings,
  ...photoStrings,
  'extras-manual-website.manual.title': { en: 'Ops manual', es: 'Manual de operaciones' },
  'extras-manual-website.manual.pending': { en: 'Pending decisions', es: 'Decisiones pendientes' },
  'extras-manual-website.site.book': { en: 'Book now', es: 'Reservar' },
  'extras-manual-website.desk.notifications': { en: 'Notifications', es: 'Notificaciones' },
  'extras-manual-website.desk.inquiries': { en: 'Website inquiries', es: 'Consultas del sitio web' },
  'extras-manual-website.desk.reports': { en: 'Reports', es: 'Reportes' },
};

const MGMT: Role[] = ['super_admin', 'owner', 'manager'];
const site = (path: string, el: () => JSX.Element, spec: RouteDef['spec']): RouteDef => ({ path, element: h(el), spec, roles: EVERYONE, surface: 'public', layout: 'auto' });
const desk = (path: string, el: () => JSX.Element, spec: RouteDef['spec'], roles: Role[], nav: RouteDef['nav']): RouteDef => ({ path, element: h(el), spec, roles, surface: 'frontdesk', layout: 'desktop', nav });

export const routes: RouteDef[] = [
  // Public website
  site('/site', SiteHome, S.siteHomeSpec), site('/site/home', SiteHome, S.siteHomeSpec), site('/site/hotel', SiteHotel, S.siteHotelSpec), site('/site/grooming', SiteGrooming, S.siteGroomingSpec), site('/site/daycare', SiteDaycare, S.siteDaycareSpec),
  site('/site/pricing', SitePricing, S.sitePricingSpec), site('/site/locations', SiteLocations, S.siteLocationsSpec), site('/site/reviews', SiteReviews, S.siteReviewsSpec), site('/site/gallery', SiteGallery, S.siteGallerySpec), site('/site/policies', SitePolicies, S.sitePoliciesSpec),
  site('/site/book', SiteBook, S.siteBookSpec), site('/site/contact', SiteContact, S.siteContactSpec), site('/site/faq', SiteFaq, S.siteFaqSpec), site('/site/about', SiteAbout, S.siteAboutSpec),
  // Ops manual
  { path: '/manual', element: h(ManualCover), spec: S.manualCoverSpec, roles: STAFF_ROLES, surface: 'manual', layout: 'desktop', nav: { label: 'Manual home', icon: 'book', order: 0, group: 'manual' } },
  { path: '/manual/pending', element: h(ManualPending), spec: S.manualPendingSpec, roles: STAFF_ROLES, surface: 'manual', layout: 'desktop', nav: { label: 'Pending decisions', icon: 'flag', order: 90, group: 'manual' } },
  ...chapters.map((c): RouteDef => ({ path: chapterPath(c.slug), element: h(ManualChapterPage, { chapter: c }), spec: S.chapterSpec(c), roles: STAFF_ROLES, surface: 'manual', layout: 'desktop' })),
  { path: '/manual/:slug', element: h(ManualNotFound), spec: S.manualFallbackSpec, roles: STAFF_ROLES, surface: 'manual', layout: 'desktop' },
  // Front desk extras
  desk('/desk/notifications', StaffNotificationsPage, S.notificationsSpec, STAFF_ROLES, { label: 'Notifications', icon: 'bell', order: 10, group: 'messages' }),
  desk('/desk/inquiries', DeskMessagesPage, S.messagesSpec, STAFF_ROLES, { label: 'Website inquiries', icon: 'globe', order: 5, group: 'messages' }),
  desk('/desk/reviews', ReviewsModerationPage, S.reviewsModSpec, MGMT, { label: 'Reviews', icon: 'star', order: 20, group: 'messages' }),
  desk('/desk/reports', ReportsOverviewPage, S.reportsSpec, MGMT, { label: 'Overview', icon: 'chart', order: 0, group: 'reports' }),
  desk('/desk/reports/revenue', ReportRevenuePage, S.revenueSpec, MGMT, { label: 'Revenue', icon: 'dollar', order: 10, group: 'reports' }),
  desk('/desk/reports/occupancy', ReportOccupancyPage, S.occupancySpec, MGMT, { label: 'Occupancy', icon: 'bed', order: 20, group: 'reports' }),
  desk('/desk/education', EducationPage, S.educationSpec, STAFF_ROLES, { label: 'Education', icon: 'book', order: 0, group: 'extras' }),
  desk('/desk/walking', WalkingPage, S.walkingSpec, STAFF_ROLES, { label: 'Walking', icon: 'paw', order: 10, group: 'extras' }),
  desk('/desk/tasks', TasksPage, S.tasksSpec, STAFF_ROLES, { label: 'Tasks', icon: 'list', order: 20, group: 'extras' }),
];
