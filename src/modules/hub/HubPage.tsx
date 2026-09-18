import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useTheme } from '../../design/ThemeProvider';
import { useLocation } from '../../tenant/LocationProvider';
import { ROLE_HOME, ROLE_LABEL, STAFF_ROLES, type Role } from '../../auth/roles';
import { demoUsers } from '../../auth/demoUsers';
import { company } from '../../tenant/locations';
import { getRoutes } from '../../app/registry';
import { isStubElement } from '../../app/registry';
import { tables } from '../../data/schema';
import { rules } from '../../rules';
import { componentLibrary } from '../../design/library';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Badge } from '../../components/atom/Badge/Badge';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { RoleSwitcher } from '../../components/molecule/RoleSwitcher/RoleSwitcher';
import { LocationSwitcher } from '../../components/molecule/LocationSwitcher/LocationSwitcher';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { PhoneFrame } from '../../components/organism/PhoneFrame/PhoneFrame';
import './hub.css';

export function HubPage() {
  const { t, lang, setLang } = useI18n();
  const nav = useNavigate();
  const { user, isSuperAdmin, devMode, setDevMode, switchUser } = useSession();
  const { theme, toggleTheme, brand, setBrand, brands } = useTheme();
  const { locations, setLocationId } = useLocation();
  const routes = getRoutes();
  const built = routes.filter((r) => !isStubElement(r.element)).length;

  const enter = (to: string, role?: Role | string) => { if (role) switchUser(role); nav(to); };
  const enterDesk = (locId: string) => { const u = demoUsers.find((d) => d.role === 'front_desk' && d.locationId === locId) ?? demoUsers.find((d) => d.role === 'front_desk')!; switchUser(u.id); setLocationId(locId); nav('/desk'); };
  const phoneSrc = `${window.location.pathname}#/app`;

  return (
    <div className="hub">
      <header className="container hub-head">
        <div className="hub-brand"><img src="./brand/petrock-mark.svg" alt="" width={32} height={32} />Petrock <Badge tone="primary" size="sm">v{__APP_VERSION__}</Badge></div>
        <div className="hub-controls">
          <SegmentedControl size="sm" ariaLabel="Language" value={lang} onChange={(v) => setLang(v as 'en' | 'es')} options={[{ value: 'en', label: 'EN' }, { value: 'es', label: 'ES' }]} />
          <SegmentedControl size="sm" ariaLabel="Brand theme" value={brand} onChange={(v) => setBrand(v as typeof brand)} options={brands.map((b) => ({ value: b, label: b === 'petrock' ? 'Petrock' : 'Sunset', icon: 'palette' as IconName }))} />
          <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Light mode' : 'Dark mode'} variant="outline" onClick={toggleTheme} />
          {isSuperAdmin && <Toggle size="sm" checked={devMode} onChange={setDevMode} label={t('hub.devMode')} />}
        </div>
      </header>

      <main className="container">
        <section className="hub-hero">
          <p className="eyebrow">{company.name} · Encino & Westwood, Los Angeles</p>
          <h1>{t('hub.title')}</h1>
          <p className="muted">{t('hub.subtitle')}</p>
          <div className="hub-session"><span className="small muted">{t('hub.session')}</span><RoleSwitcher /><LocationSwitcher /></div>
          {devMode && <p className="small tone-info"><Icon name="spec" size={14} /> Builder tool is on: every page shows a spec chip (bottom right) and Ctrl+. opens the inspector.</p>}
        </section>

        <section className="hub-grid">
          <Card className="hub-card hub-span-8" padding="lg">
            <div className="hub-phone">
              <div className="stack-sm">
                <span className="hub-card-icon"><Icon name="paw" /></span>
                <h3>Customer app</h3>
                <p className="muted small">iOS / Android app (390 design, wrapped with Capacitor later): sign in, pets and vaccines, hotel, daycare, Grooming & Spa, payments, chat. Runs live in the frame.</p>
                <div className="row wrap">
                  <Button onClick={() => enter('/app', 'customer')} iconRight="arrow-right">Enter as {demoUsers.find((d) => d.role === 'customer')!.name}</Button>
                  <Button variant="secondary" onClick={() => enter('/auth/sign-in', 'public')}>Sign in / sign up</Button>
                </div>
                <p className="xs faint">Codes C-01…C-89. Home C-10, hotel C-30, grooming C-50, daycare C-60, settings & chat C-70.</p>
              </div>
              <div className="hub-phone-frame"><PhoneFrame src={phoneSrc} scale={0.42} title="Customer app preview" /></div>
            </div>
          </Card>

          <Card className="hub-card hub-span-4" padding="lg">
            <span className="hub-card-icon"><Icon name="bed" /></span>
            <h3>Front desk</h3>
            <p className="muted small">Desktop web (1440 design, responsive). Arrivals and departures, timeline, grooming day view, people & pets, vaccines, messages. Pinned to one location.</p>
            <div className="hub-locs">{locations.map((l) => <Button key={l.id} variant="secondary" size="sm" icon="location" onClick={() => enterDesk(l.id)}>{l.short_name}</Button>)}</div>
            <p className="xs faint">Codes F-01…F-79.</p>
          </Card>

          <Card className="hub-card hub-span-4" padding="lg" interactive onClick={() => enter('/admin', 'owner')}>
            <span className="hub-card-icon"><Icon name="building" /></span>
            <h3>Owner / admin</h3>
            <p className="muted small">Both locations, KPIs, Control Panel: pricing, discounts, capacities, staff & roles, Settings › Rules, feedback inbox.</p>
            <span className="hub-card-cta">Enter as {demoUsers.find((d) => d.role === 'owner')!.name} →</span>
          </Card>

          <Card className="hub-card hub-span-4" padding="lg" interactive onClick={() => enter('/manual')}>
            <span className="hub-card-icon"><Icon name="book" /></span>
            <h3>Ops manual</h3>
            <p className="muted small">Business operations manual per role with screenshots: front desk day, grooming, vaccines, payments. Codes M-01…M-30.</p>
            <span className="hub-card-cta">{t('hub.open')} →</span>
          </Card>

          <Card className="hub-card hub-span-4" padding="lg" interactive onClick={() => enter('/docs')}>
            <span className="hub-card-icon"><Icon name="layers" /></span>
            <h3>Docs</h3>
            <p className="muted small">Everything in docs/: brief, decisions, Figma catalog, rules, prompts, changelogs, page docs and screenshots, rendered in-app.</p>
            <span className="hub-card-cta">{t('hub.open')} →</span>
          </Card>

          <Card className="hub-card hub-span-6" padding="lg">
            <span className="hub-card-icon"><Icon name="users" /></span>
            <h3>Staff roles</h3>
            <p className="muted small">One fictional person per role. Staff can also sign in with a PIN (0000 super admin · 1111 owner · 2222 manager · 3333 / 4444 front desk · 5555 groomer).</p>
            <div className="hub-roles">{STAFF_ROLES.map((r) => <Button key={r} size="sm" variant={user.role === r ? 'primary' : 'secondary'} onClick={() => enter(ROLE_HOME[r], r)}>{ROLE_LABEL[r]}</Button>)}<Button size="sm" variant="ghost" icon="key" onClick={() => nav('/staff/pin')}>PIN login</Button></div>
          </Card>

          <Card className="hub-card hub-span-6" padding="lg">
            <span className="hub-card-icon"><Icon name="code" /></span>
            <h3>Dev</h3>
            <p className="muted small">Design system, component library, page specs, table library, rules registry, knowledge base. Super admin only.</p>
            <div className="hub-links">
              <Link to="/dev/tokens" onClick={() => switchUser('super_admin')}><Icon name="palette" size={16} /> Tokens <code className="xs faint">D-01</code></Link>
              <Link to="/dev/components" onClick={() => switchUser('super_admin')}><Icon name="grid" size={16} /> Components <code className="xs faint">D-02</code></Link>
              <Link to="/dev/specs" onClick={() => switchUser('super_admin')}><Icon name="spec" size={16} /> Specs <code className="xs faint">D-03</code></Link>
              <Link to="/dev/tables" onClick={() => switchUser('super_admin')}><Icon name="table" size={16} /> Tables <code className="xs faint">D-04</code></Link>
              <Link to="/dev/rules" onClick={() => switchUser('super_admin')}><Icon name="flag" size={16} /> Rules <code className="xs faint">D-05</code></Link>
              <Link to="/dev/knowledge" onClick={() => switchUser('super_admin')}><Icon name="book" size={16} /> Knowledge <code className="xs faint">D-07</code></Link>
              <Link to="/site"><Icon name="globe" size={16} /> Public site <code className="xs faint">P-00</code></Link>
            </div>
          </Card>
        </section>

        <footer className="hub-foot xs muted">
          <span>{routes.length} routes · {built} built · {routes.length - built} stubs</span><span>{tables.length} tables</span><span>{rules.length} rules</span><span>{componentLibrary.length} components</span>
          <span>Mock data (localStorage). Demo people and pets are fictional.</span>
        </footer>
      </main>
    </div>
  );
}
