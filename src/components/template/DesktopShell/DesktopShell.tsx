import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, matchPath, useLocation as useRouterLocation } from 'react-router-dom';
import type { RouteDef, Surface } from '../../../specs/types';
import { useSession } from '../../../auth/SessionProvider';
import { navGroup } from '../../../app/navGroups';
import { Sidebar, type SidebarGroup } from '../../organism/Sidebar/Sidebar';
import { TopBar } from '../../organism/TopBar/TopBar';
import { FeedbackButton } from '../../organism/FeedbackButton/FeedbackButton';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Button } from '../../atom/Button/Button';
import type { IconName } from '../../atom/Icon/Icon';
import './DesktopShell.css';

export interface DesktopShellProps { surfaces: Surface[]; routes: RouteDef[]; title: string; children: ReactNode; feedback?: boolean; /** Staff shell: title follows the effective role instead of the current route's surface. */ titleByRole?: boolean }

const ROLE_SHELL_TITLE: Partial<Record<string, string>> = { super_admin: 'Owner / admin', owner: 'Owner / admin', manager: 'Manager', front_desk: 'Front desk', groomer: 'Grooming' };

const RAIL_KEY = 'petrock.shell.rail';
function useNarrow(bp = 900) {
  const [narrow, setNarrow] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${bp}px)`).matches : false));
  useEffect(() => { const mq = window.matchMedia(`(max-width: ${bp}px)`); const h = () => setNarrow(mq.matches); mq.addEventListener('change', h); return () => mq.removeEventListener('change', h); }, [bp]);
  return narrow;
}

/** Staff / admin / dev / docs shell (Figma front desk.jpg): #F4F0FF canvas, 243 px white Sidebar with the 145x44 logo and a Logout button, 80 px TopBar (search, location, New booking, chat, Help, bell, user), content, FeedbackButton. Sidebar becomes an overlay drawer under 900 px; page-code pills show in dev mode only. */
export function DesktopShell({ surfaces, routes, title: titleProp, children, feedback = true, titleByRole = false }: DesktopShellProps) {
  const { role, hasRole, devMode, signOut } = useSession();
  const title = titleByRole ? ROLE_SHELL_TITLE[role] ?? titleProp : titleProp;
  const { pathname } = useRouterLocation();
  const narrow = useNarrow();
  const [rail, setRail] = useState(() => { try { return localStorage.getItem(RAIL_KEY) === '1'; } catch { return false; } });
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { try { localStorage.setItem(RAIL_KEY, rail ? '1' : '0'); } catch { /* ignore */ } }, [rail]);
  useEffect(() => { setDrawer(false); }, [pathname]);

  const groups = useMemo<SidebarGroup[]>(() => {
    const byKey = new Map<string, SidebarGroup & { order: number; itemsOrder: number[] }>();
    for (const r of routes) {
      if (!r.nav || !surfaces.includes(r.surface) || !hasRole(r.roles)) continue;
      const g = navGroup(r.nav.group);
      if (!byKey.has(g.key)) byKey.set(g.key, { key: g.key, label: g.label, icon: g.icon, items: [], order: g.order, itemsOrder: [] });
      const grp = byKey.get(g.key)!;
      grp.items.push({ to: r.nav.to ?? r.path, label: r.nav.label, icon: r.nav.icon as IconName, code: r.spec.code, end: r.path === '/desk' || r.path === '/admin' || r.path === '/dev' });
      grp.itemsOrder.push(r.nav.order);
    }
    return [...byKey.values()].sort((a, b) => a.order - b.order).map((g) => ({ key: g.key, label: g.label, icon: g.icon, items: g.items.map((it, i) => ({ it, o: g.itemsOrder[i] })).sort((a, b) => a.o - b.o).map((x) => x.it) }));
  }, [routes, surfaces, hasRole]);

  const current = routes.find((r) => matchPath({ path: r.path, end: true }, pathname));
  const has = (path: string) => routes.some((r) => r.path === path && hasRole(r.roles));
  const firstWith = (prefix: string) => routes.find((r) => r.path.startsWith(prefix) && hasRole(r.roles))?.path;
  const isDesk = surfaces.includes('frontdesk') || surfaces.includes('admin');
  const header = rail && !narrow
    ? <Link to="/" className="shell-brand" title="Testing hub"><img src="./brand/petrock-mark.svg" alt="Petrock" width={28} height={28} /></Link>
    : <Link to="/" className="shell-brand" title={`Petrock · ${title} · testing hub`}><img src="./brand/petrock-logo.png" srcSet="./brand/petrock-logo.png 1x, ./brand/petrock-logo-2x.png 4x" alt="Petrock Hotel and Spa" width={145} height={44} /></Link>;
  const footer = <Button variant="primary" block icon="logout" onClick={() => { signOut(); }} className="shell-logout" title="Sign out of the demo session">{rail && !narrow ? '' : 'Log Out'}</Button>;
  const sidebar = <Sidebar groups={groups} rail={rail && !narrow} onToggleRail={narrow ? undefined : () => setRail((r) => !r)} storageKey={`petrock.sidebar.${role}`} header={header} footer={footer} showCodes={devMode} onNavigate={() => setDrawer(false)} />;

  return (
    <div className={`shell ${rail && !narrow ? 'is-rail' : ''}`}>
      {!narrow && <div className="shell-side">{sidebar}</div>}
      {narrow && drawer && (
        <div className="shell-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setDrawer(false); }}>
          <div className="shell-overlay-panel">{sidebar}<IconButton icon="close" label="Close menu" className="shell-overlay-close" onClick={() => setDrawer(false)} variant="outline" /></div>
        </div>
      )}
      <div className="shell-main">
        <TopBar title={narrow ? title : undefined} onMenu={narrow ? () => setDrawer(true) : undefined} searchTo={isDesk ? (has('/desk/customers') ? '/desk/customers' : undefined) : undefined} newBookingTo={isDesk && has('/desk/reservations') ? '/desk/reservations' : undefined} chatTo={isDesk && has('/desk/messages') ? '/desk/messages' : undefined} helpTo={firstWith('/manual')} />
        <main className="shell-content" id="main">{children}</main>
      </div>
      {feedback && current && <FeedbackButton pageCode={current.spec.code} route={current.path} />}
    </div>
  );
}
