import { useSession } from '../../../auth/SessionProvider';
import { demoUsers } from '../../../auth/demoUsers';
import { ROLE_LABEL, ROLES, type Role } from '../../../auth/roles';
import { Select } from '../../atom/Select/Select';
import './RoleSwitcher.css';

export interface RoleSwitcherProps { compact?: boolean }

/** Demo user select + (super admin only) "view as" role. Lives in the hub and the shells. */
export function RoleSwitcher({ compact = false }: RoleSwitcherProps) {
  const { user, isSuperAdmin, viewAs, switchUser, setViewAs } = useSession();
  const selfId = demoUsers.some((d) => d.id === user.id) ? user.id : '__custom__';
  return (
    <div className={`roleswitch ${compact ? 'is-compact' : ''}`}>
      <Select size="sm" aria-label="Demo user" value={selfId} onChange={(e) => switchUser(e.target.value)}
        options={[...demoUsers.map((d) => ({ value: d.id, label: `${d.name} · ${ROLE_LABEL[d.role]}` })), ...(selfId === '__custom__' ? [{ value: '__custom__', label: `${user.name} · ${ROLE_LABEL[user.role]}` }] : [])]} />
      {isSuperAdmin && (
        <Select size="sm" aria-label="View as role" value={viewAs ?? ''} onChange={(e) => setViewAs((e.target.value || null) as Role | null)}
          options={[{ value: '', label: 'View as: myself' }, ...ROLES.filter((r) => r !== 'super_admin').map((r) => ({ value: r, label: `View as: ${ROLE_LABEL[r]}` }))]} />
      )}
    </div>
  );
}
