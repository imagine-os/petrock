import type { IconName } from '../components/atom/Icon/Icon';

/**
 * Side-menu categories (D-014). Module routes reference a category by `nav.group` key; unknown keys render as an
 * ad-hoc category with the key as label. Order here is the menu order. Nobody needs to edit this file to add a page.
 */
export interface NavGroupDef { key: string; label: string; icon: IconName; order: number }

export const NAV_GROUPS: NavGroupDef[] = [
  { key: 'overview', label: 'Overview', icon: 'home', order: 0 },
  { key: 'reservations', label: 'Hotel reservations', icon: 'bed', order: 10 },
  { key: 'grooming', label: 'Grooming & Spa', icon: 'scissors', order: 20 },
  { key: 'daycare', label: 'Daycare', icon: 'sun', order: 30 },
  { key: 'people', label: 'People & pets', icon: 'users', order: 40 },
  { key: 'vaccines', label: 'Vaccines', icon: 'shield', order: 45 },
  { key: 'money', label: 'Payments & invoices', icon: 'dollar', order: 50 },
  { key: 'messages', label: 'Messages & reviews', icon: 'message', order: 60 },
  { key: 'reports', label: 'Reports', icon: 'chart', order: 70 },
  { key: 'settings', label: 'Settings', icon: 'settings', order: 80 },
  { key: 'extras', label: 'Extras', icon: 'sparkle', order: 90 },
  { key: 'manual', label: 'Ops manual', icon: 'book', order: 95 },
  { key: 'developer', label: 'Developer', icon: 'code', order: 100 },
  { key: 'docs', label: 'Docs', icon: 'layers', order: 110 },
];
export const navGroup = (key: string): NavGroupDef => NAV_GROUPS.find((g) => g.key === key) ?? { key, label: key, icon: 'grid', order: 500 };
