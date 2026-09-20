import type { IconName } from '../../components/atom/Icon/Icon';
import type { Role } from '../../auth/roles';

/**
 * Everything the hub renders, as data. The page maps over these; copy lives in `strings.ts` under
 * `hub.card.<key>.name` / `.body`, `hub.group.<key>.eyebrow` / `.title` / `.body` and `hub.tool.<key>.name` / `.desc`.
 * Demo people's names, page codes and route paths are data, never strings.
 */

/** How the card draws its thumbnail: a 16:10 desktop capture or a 9:19.5 phone capture in a phone frame. */
export type ThumbShape = 'desktop' | 'phone';
/** The card's single control. `enterAs` / `openAs` name the demo person; `open` does not switch the session. */
export type HubCta = 'enterAs' | 'openAs' | 'open';

export interface HubCard {
  /** Strings suffix and React key. */
  key: string;
  /** Page code: picks the thumbnail and, via the route manifest, the status pill. */
  code: string;
  /** Route the single button opens. */
  to: string;
  icon: IconName;
  /** Whose seat this is; drives the role line and the "You are here" pill. */
  role: Role;
  /** Medallion / wireframe hue (hsl degrees). */
  hue: number;
  shape: ThumbShape;
  cta: HubCta;
  /** Demo user to switch to before navigating. */
  userId?: string;
  /** Location to pin before navigating (the two front desks). */
  locationId?: string;
  /** Thumbnail variant suffix (`thumb-westwood.jpg`). */
  thumbLabel?: string;
  /** Spans the whole card row, text beside the thumbnail. */
  feature?: boolean;
  /** Override for the "You are here" pill when the card is not literally ROLE_HOME. */
  home?: boolean;
}

export interface HubGroup {
  key: string;
  /** Tinted full-bleed band behind the group. */
  band?: boolean;
  /** Smaller medallions and tighter copy (the build band). */
  compact?: boolean;
  /** Cards per row on wide screens. */
  columns?: 3 | 4;
  cards: HubCard[];
}

export const HUB_GROUPS: HubGroup[] = [
  {
    key: 'outside',
    cards: [
      { key: 'customerApp', code: 'C-10', to: '/app', icon: 'paw', role: 'customer', hue: 265, shape: 'phone', cta: 'enterAs', userId: 'usr_customer', feature: true },
      { key: 'website', code: 'P-01', to: '/site', icon: 'globe', role: 'public', hue: 205, shape: 'desktop', cta: 'open' },
      { key: 'signIn', code: 'C-02', to: '/auth/sign-in', icon: 'lock', role: 'public', hue: 285, shape: 'phone', cta: 'openAs', userId: 'usr_public' },
      { key: 'bookOnline', code: 'P-10', to: '/site/book', icon: 'calendar', role: 'public', hue: 325, shape: 'desktop', cta: 'open' },
    ],
  },
  {
    key: 'staff',
    cards: [
      { key: 'deskEncino', code: 'F-01', to: '/desk', icon: 'bed', role: 'front_desk', hue: 25, shape: 'desktop', cta: 'enterAs', userId: 'usr_desk', locationId: 'loc_encino' },
      { key: 'deskWestwood', code: 'F-01', to: '/desk', icon: 'bed', role: 'front_desk', hue: 45, shape: 'desktop', cta: 'enterAs', userId: 'usr_desk_ww', locationId: 'loc_westwood', thumbLabel: 'westwood' },
      { key: 'grooming', code: 'F-30', to: '/desk/grooming', icon: 'scissors', role: 'groomer', hue: 340, shape: 'desktop', cta: 'enterAs', userId: 'usr_groomer' },
      { key: 'manager', code: 'F-10', to: '/desk/reservations', icon: 'users', role: 'manager', hue: 220, shape: 'desktop', cta: 'enterAs', userId: 'usr_manager' },
      { key: 'owner', code: 'A-01', to: '/admin', icon: 'chart', role: 'owner', hue: 155, shape: 'desktop', cta: 'enterAs', userId: 'usr_owner' },
      { key: 'admin', code: 'A-44', to: '/admin/settings', icon: 'settings', role: 'super_admin', hue: 250, shape: 'desktop', cta: 'enterAs', userId: 'usr_super', home: true },
    ],
  },
  {
    key: 'build',
    band: true,
    compact: true,
    columns: 4,
    cards: [
      { key: 'manual', code: 'M-01', to: '/manual', icon: 'book', role: 'owner', hue: 190, shape: 'desktop', cta: 'enterAs', userId: 'usr_owner' },
      { key: 'docs', code: 'D-06', to: '/docs', icon: 'layers', role: 'super_admin', hue: 210, shape: 'desktop', cta: 'enterAs', userId: 'usr_super' },
      { key: 'devtools', code: 'D-01', to: '/dev/tokens', icon: 'code', role: 'super_admin', hue: 270, shape: 'desktop', cta: 'enterAs', userId: 'usr_super' },
      { key: 'quality', code: 'D-12', to: '/dev/qa/responsive', icon: 'check', role: 'super_admin', hue: 130, shape: 'desktop', cta: 'enterAs', userId: 'usr_super' },
    ],
  },
];

export interface HubTool {
  key: string;
  code: string;
  to: string;
  icon: IconName;
  /** Demo user to switch to first (the dev tools are super-admin only). */
  userId?: string;
  /** False = designed, not built: the row is wrapped in `Placeholder`. */
  wired: boolean;
}

export const HUB_TOOLS: HubTool[] = [
  { key: 'preview', code: 'D-13', to: '/dev/qa/preview', icon: 'expand', userId: 'usr_super', wired: true },
  { key: 'screenshots', code: 'D-17', to: '/dev/qa/screenshots', icon: 'image', userId: 'usr_super', wired: true },
  { key: 'routes', code: 'D-19', to: '/dev/routes', icon: 'list', userId: 'usr_super', wired: true },
  { key: 'specs', code: 'D-03', to: '/dev/specs', icon: 'spec', userId: 'usr_super', wired: true },
  { key: 'components', code: 'D-02', to: '/dev/components', icon: 'grid', userId: 'usr_super', wired: true },
  { key: 'tables', code: 'D-04', to: '/dev/tables', icon: 'table', userId: 'usr_super', wired: true },
  { key: 'rules', code: 'D-05', to: '/dev/rules', icon: 'flag', userId: 'usr_super', wired: true },
  { key: 'knowledge', code: 'D-07', to: '/dev/knowledge', icon: 'book', userId: 'usr_super', wired: true },
  { key: 'docsSearch', code: 'D-18', to: '/dev/docs-search', icon: 'search', userId: 'usr_super', wired: true },
  { key: 'pin', code: 'A-00', to: '/staff/pin', icon: 'key', wired: true },
  { key: 'canvas', code: 'D-21', to: '/dev/canvas', icon: 'layers', wired: false },
  { key: 'simulator', code: 'D-22', to: '/dev/simulator', icon: 'phone', wired: false },
  { key: 'plan', code: 'D-23', to: '/plan', icon: 'calendar', wired: false },
];

/** i18n key for a role label, so the card footers never hard-code English. */
export const ROLE_KEY: Record<Role, string> = {
  super_admin: 'hub.role.superAdmin', owner: 'hub.role.owner', manager: 'hub.role.manager',
  front_desk: 'hub.role.frontDesk', groomer: 'hub.role.groomer', customer: 'hub.role.customer', public: 'hub.role.public',
};
