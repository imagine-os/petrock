import { useMemo, type ReactNode } from 'react';
import { Link, useLocation as useRouterLocation, matchPath } from 'react-router-dom';
import type { RouteDef, Surface } from '../../../specs/types';
import { useSession } from '../../../auth/SessionProvider';
import { useTable } from '../../../data/DataContext';
import type { NotificationRow } from '../../../data/schema/core';
import { BottomNav, type BottomNavItem } from '../../molecule/BottomNav/BottomNav';
import type { IconName } from '../../atom/Icon/Icon';
import { Icon } from '../../atom/Icon/Icon';
import './PhoneShell.css';

export interface PhoneShellProps { surface: Surface; routes: RouteDef[]; children: ReactNode; homeTo: string }

/**
 * Customer app frame: full-bleed on phones, a centered 430 px column on larger screens, BottomNav from customer routes
 * with nav. The screen background follows the route's `spec.tone` (Figma: white home / auth, #F4F6FA lists, #EEF2F5
 * forms) and the mobile field skin (4 px inputs, 16/600 values) is set here as custom properties.
 */
export function PhoneShell({ surface, routes, children, homeTo }: PhoneShellProps) {
  const { hasRole, user } = useSession();
  const { pathname } = useRouterLocation();
  const { rows: unread } = useTable<NotificationRow>('notifications', { where: { user_id: user.id, read: false } });
  const items = useMemo<BottomNavItem[]>(() => routes.filter((r) => r.nav && r.surface === surface && hasRole(r.roles)).sort((a, b) => a.nav!.order - b.nav!.order)
    .map((r) => ({ to: r.nav!.to ?? r.path, label: r.nav!.label, icon: r.nav!.icon as IconName, end: r.path === homeTo, badge: r.nav!.icon === 'bell' || r.nav!.icon === 'paw' ? unread.length || undefined : undefined })), [routes, surface, hasRole, homeTo, unread.length]);
  const current = routes.find((r) => matchPath({ path: r.path, end: true }, pathname));
  const hideNav = current?.layout === 'mobile' && !current?.nav && pathname.startsWith('/auth');
  const inFrame = typeof window !== 'undefined' && window.self !== window.top;
  const tone = current?.spec.tone ?? 'home';
  return (
    <div className={`phoneshell ${inFrame ? 'in-frame' : ''}`} data-tone={tone}>
      {!inFrame && <Link to="/" className="phoneshell-hub" title="Back to the testing hub"><Icon name="arrow-left" size={14} /> Hub</Link>}
      <div className="phoneshell-col">
        <div className="phoneshell-content">{children}</div>
        {items.length > 0 && !hideNav && <div className="phoneshell-nav"><BottomNav items={items} /></div>}
      </div>
    </div>
  );
}
