import type { ReactNode } from 'react';
import type { RouteDef } from '../specs/types';
import { PhoneShell } from '../components/template/PhoneShell/PhoneShell';
import { DesktopShell } from '../components/template/DesktopShell/DesktopShell';
import { getRoutes } from './registry';

/** Picks the shell for a route by surface. Public pages bring their own layout. */
export function withShell(route: RouteDef, children: ReactNode): ReactNode {
  const allRoutes = getRoutes();
  switch (route.surface) {
    case 'customer': return <PhoneShell surface="customer" routes={allRoutes} homeTo="/app">{children}</PhoneShell>;
    // one staff shell: the menu is filtered per role (hasRole), so a manager sees the admin pages they may open from any desk page (D-014)
    case 'frontdesk':
    case 'admin': return <DesktopShell surfaces={['admin', 'frontdesk', 'manual']} routes={allRoutes} title="Front desk" titleByRole>{children}</DesktopShell>;
    // dev keeps the admin nav beside the developer group so a super admin can go back
    case 'dev': return <DesktopShell surfaces={['dev', 'docs', 'admin']} routes={allRoutes} title="Developer">{children}</DesktopShell>;
    case 'docs': return <DesktopShell surfaces={['docs', 'dev']} routes={allRoutes} title="Docs" feedback={false}>{children}</DesktopShell>;
    case 'manual': return <DesktopShell surfaces={['manual', 'frontdesk']} routes={allRoutes} title="Ops manual" feedback={false}>{children}</DesktopShell>;
    default: return children;
  }
}
