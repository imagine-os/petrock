/** A-31 Roles & permissions matrix (permissions table, R-L05, R-X49) and A-32 per-role side-menu editor (roles.menu, D-014, R-X40). */
import { useMemo, useState } from 'react';
import { useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
interface RoleRow extends BaseRow { key: string; label: string; description: string | null; menu: Record<string, boolean> | null }
import type { BaseRow } from '../../data/schema/types';
import { ROLES, ROLE_LABEL, type Role } from '../../auth/roles';
import { ROLE_PERMISSIONS, type Permission } from '../../auth/permissions';
import { NAV_GROUPS, navGroup } from '../../app/navGroups';
import { getRoutes } from '../../app/registry';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { Section } from '../../components/molecule/Section/Section';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { AdminPermissionMatrix } from '../../components/organism/AdminPermissionMatrix/AdminPermissionMatrix';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useAdminCrud } from './lib';
import './admin.css';

interface PermissionRow extends BaseRow { role: string; permission: string; granted: boolean }
const ALL_PERMISSIONS = ROLE_PERMISSIONS.super_admin as Permission[];
const GROUP_LABEL: Record<string, string> = { bookings: 'Bookings', appointments: 'Grooming & daycare', daycare: 'Grooming & daycare', customers: 'Customers & pets', pets: 'Customers & pets', vaccines: 'Customers & pets', payments: 'Payments & invoices', discounts: 'Payments & invoices', cash_drawer: 'Payments & invoices', invoices: 'Payments & invoices', employees: 'Staff & roles', roles: 'Staff & roles', pricing: 'Settings', settings: 'Settings', locations: 'Settings', rules: 'Settings', reports: 'Reports', messages: 'Messages & reviews', reviews: 'Messages & reviews', feedback: 'Feedback & approvals', approvals: 'Feedback & approvals', tables: 'Developer', dev: 'Developer', docs: 'Developer', audit: 'Feedback & approvals' };
const PERM_HELP: Partial<Record<Permission, string>> = { 'bookings.status': 'Change a booking status (PIN-gated transitions)', 'bookings.cancel': 'Cancel bookings', 'bookings.delete': 'Delete bookings', 'payments.refund': 'Create refunds', 'discounts.apply': 'Apply manual discounts', 'cash_drawer.open': 'Open cash drawer', 'reports.financial': 'View financial reports', 'reports.employees': 'View employee reports', 'reports.export': 'Export data / CSV', 'approvals.grant': 'Approve with own PIN', 'roles.write': 'Edit roles & permissions', 'pricing.write': 'Edit prices', 'settings.write': 'Edit settings', 'locations.write': 'Edit locations', 'rules.write': 'Add rules / change status', 'customers.delete': 'Delete customers', 'vaccines.verify': 'Verify vaccine proofs', 'audit.read': 'Read the audit log', 'dev.tools': 'Builder tool & dev pages' };

export function RolesPage() {
  const { rows: perms } = useTable<PermissionRow>('permissions');
  const { rows: roleRows } = useTable<RoleRow>('roles');
  const { can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const [editingDesc, setEditingDesc] = useState<Record<string, string>>({});
  const writable = can('roles.write');
  // No useMemo on `perms`: a query-less useTable returns the provider's live array, so identity never changes.
  const set = new Set(perms.filter((p) => p.granted).map((p) => `${p.role}|${p.permission}`));
  const granted = (perm: string, role: string) => role === 'super_admin' || set.has(`${role}|${perm}`);
  const toggle = async (perm: string, role: string, next: boolean) => {
    if (role === 'owner' && perm === 'settings.write' && !next) { toast({ tone: 'warn', title: 'Owner keeps settings.write', body: 'Otherwise nobody could edit this matrix (R-X49).' }); return; }
    const row = perms.find((p) => p.role === role && p.permission === perm);
    if (row) await crud.update('permissions', row.id, { granted: next }); else await crud.insert('permissions', { role, permission: perm, granted: next });
  };
  const rows = ALL_PERMISSIONS.map((p) => ({ key: p, label: PERM_HELP[p], group: GROUP_LABEL[p.split('.')[0]] ?? 'Other' })).sort((a, b) => a.group.localeCompare(b.group) || a.key.localeCompare(b.key));
  const drift = ROLES.filter((r) => r !== 'super_admin').flatMap((r) => ALL_PERMISSIONS.filter((p) => granted(p, r) !== ROLE_PERMISSIONS[r].includes(p)).map((p) => `${r}:${p}`));
  return (
    <div className="page stack">
      <PageHeader code="A-31" title="Roles & permissions" subtitle="Which role may do what. The permissions table is the runtime source; pages ask can('permission'), never compare roles (R-L05, R-X49). Super admin always has everything." actions={drift.length ? <Badge tone="warn">{drift.length} changes vs code defaults</Badge> : <Badge tone="success">matches code defaults</Badge>} />
      <div className="acp-role-cards">
        {ROLES.map((r) => { const row = roleRows.find((x) => x.key === r); const n = ALL_PERMISSIONS.filter((p) => granted(p, r)).length; return (
          <Card key={r} padding="sm" header={<div className="acp-card-title"><h3>{ROLE_LABEL[r]}</h3><Badge size="sm" tone={r === 'super_admin' ? 'primary' : 'neutral'}>{n} / {ALL_PERMISSIONS.length}</Badge></div>}>
            {writable && row ? <Textarea rows={2} value={editingDesc[r] ?? (row.description as string | null) ?? ''} placeholder="What this role is for" onChange={(e) => setEditingDesc({ ...editingDesc, [r]: e.target.value })} onBlur={async () => { if (editingDesc[r] !== undefined && editingDesc[r] !== (row.description ?? '')) { await crud.update('roles', row.id, { description: editingDesc[r] || null }); toast(`${ROLE_LABEL[r]} description saved`); } }} /> : <p className="acp-note">{(row?.description as string | null) ?? 'No description yet'}</p>}
          </Card>
        ); })}
      </div>
      <AdminPermissionMatrix columns={ROLES.map((r) => ({ key: r, label: ROLE_LABEL[r], readOnly: r === 'super_admin' }))} rows={rows} granted={granted} onToggle={writable ? toggle : undefined} />
      {drift.length > 0 && writable && <div className="row wrap"><Button variant="secondary" size="sm" icon="refresh" onClick={async () => { for (const r of ROLES) { if (r === 'super_admin') continue; for (const p of ALL_PERMISSIONS) { const should = ROLE_PERMISSIONS[r].includes(p); if (granted(p, r) !== should) await toggle(p, r, should); } } toast({ tone: 'success', title: 'Reset to code defaults' }); }}>Reset to code defaults</Button><span className="acp-note">Restores src/auth/permissions.ts for every role.</span></div>}
    </div>
  );
}

/** A-32 Per-role side menu editor: category visibility per role stored in roles.menu (D-014, R-X40). */
export function MenusPage() {
  const { rows: roleRows } = useTable<RoleRow>('roles');
  const { can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const [role, setRole] = useState<Role>('front_desk');
  const writable = can('roles.write');
  const row = roleRows.find((r) => r.key === role);
  const menu = (row?.menu as Record<string, boolean> | null) ?? {};
  const routes = useMemo(() => getRoutes().filter((r) => r.nav && r.nav.group !== 'customer' && r.roles.includes(role)), [role]);
  const groups = useMemo(() => { const m = new Map<string, typeof routes>(); for (const r of routes) { const g = navGroup(r.nav!.group).key; if (!m.has(g)) m.set(g, []); m.get(g)!.push(r); } return [...NAV_GROUPS, ...[...m.keys()].filter((k) => !NAV_GROUPS.some((g) => g.key === k)).map((k) => navGroup(k))].filter((g) => m.has(g.key)).map((g) => ({ ...g, routes: m.get(g.key)!.sort((a, b) => a.nav!.order - b.nav!.order) })); }, [routes]);
  const visible = (k: string) => menu[k] !== false;
  const setVisible = async (k: string, on: boolean) => { if (!row) return; await crud.update('roles', row.id, { menu: { ...menu, [k]: on } }); };
  const reset = async () => { if (!row) return; await crud.update('roles', row.id, { menu: null }); toast(`${ROLE_LABEL[role]} menu reset`); };
  const hiddenCount = groups.filter((g) => !visible(g.key)).length;
  return (
    <div className="page stack">
      <PageHeader code="A-32" title="Side menus per role" subtitle="Each role sees only the categories you leave on, on top of what its permissions allow (D-014). Pages a role cannot open never appear, whatever the toggle." actions={writable && row?.menu ? <Button variant="secondary" size="sm" icon="refresh" onClick={reset}>Reset {ROLE_LABEL[role]}</Button> : undefined} />
      <div className="acp-tabs-scroll"><SegmentedControl<Role> value={role} onChange={setRole} options={ROLES.filter((r) => r !== 'public' && r !== 'customer').map((r) => ({ value: r, label: ROLE_LABEL[r] }))} ariaLabel="Role" /></div>
      <div className="acp-two">
        <Section title={`Categories for ${ROLE_LABEL[role]}`} description={`${groups.length} categories · ${hiddenCount} hidden · ${routes.length} pages this role may open`}>
          <Card padding="md">
            <div className="acp-menu-grid">
              {groups.map((g) => <div key={g.key} className="acp-menu-cat"><div><strong>{g.label}</strong><small>{g.routes.map((r) => r.spec.code).join(', ')}</small></div><Toggle checked={visible(g.key)} onChange={(on) => setVisible(g.key, on)} disabled={!writable || g.key === 'overview'} label={<span className="sr-only">{g.label}</span>} /></div>)}
            </div>
            <p className="acp-note" style={{ marginTop: 12 }}>Overview always stays on so the role has a home. Stored as <code>roles.menu</code> {'{ category: visible }'}; the shell applies it when the integration lands (R-X40).</p>
          </Card>
        </Section>
        <Section title="Preview" description="How the sidebar reads for this role">
          <div className="acp-menu-preview">
            {groups.map((g) => <div key={g.key}><div className={`cat ${visible(g.key) ? '' : 'is-hidden'}`}>{g.label}</div>{g.routes.map((r) => <div key={r.path} className={`item ${visible(g.key) ? '' : 'is-hidden'}`}><span>{r.nav!.label}</span><code>{r.spec.code}</code></div>)}</div>)}
          </div>
        </Section>
      </div>
    </div>
  );
}
