/** A-30 Employees: list, add / edit, role + location, PIN set / reset (manager approval, R-X43), status (R-L01). */
import { useMemo, useState } from 'react';
import { useData, useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import { useLocation } from '../../tenant/LocationProvider';
import type { EmployeeRow, UserRow, LocationRow, ApprovalRow } from '../../data/schema/core';
import { hashPin, isValidPinShape, PIN_MIN, PIN_MAX } from '../../auth/pin';
import { ROLE_LABEL, STAFF_ROLES, type Role } from '../../auth/roles';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Badge, toneFor } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Modal } from '../../components/organism/Modal/Modal';
import { Input } from '../../components/atom/Input/Input';
import { PinApprovalModal, type PinApprovalRequest } from '../../components/organism/PinApprovalModal/PinApprovalModal';
import { useToast } from '../../components/molecule/Toast/Toast';
import { CrudTable } from './CrudTable';
import { useAdminCrud, fmtDate } from './lib';
import './admin.css';

const DEPARTMENTS = ['Operations', 'Receptionist', 'Groom', 'Take Care', 'Sales'];

export function EmployeesPage() {
  const data = useData();
  const { scope, locationId, allLocations, locations } = useLocation();
  const { can, user } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const { rows: employees } = useTable<EmployeeRow>('employees', { where: scope });
  const { rows: users } = useTable<UserRow>('users');
  const { rows: locs } = useTable<LocationRow>('locations');
  const userById = Object.fromEntries(users.map((u) => [u.id, u])) as Record<string, UserRow>; // live array from a query-less useTable; no memo
  const locName = useMemo(() => Object.fromEntries(locs.map((l) => [l.id, l.short_name])), [locs]);
  const [pinFor, setPinFor] = useState<EmployeeRow | null>(null);
  const [newPin, setNewPin] = useState('');
  const [approval, setApproval] = useState<PinApprovalRequest | null>(null);
  const roleOf = (e: EmployeeRow): Role | null => { const u = e.user_id ? userById[e.user_id] : null; return (u?.role as Role) ?? (e.is_groomer ? 'groomer' : null); };
  const writable = can('employees.write');
  const active = employees.filter((e) => e.status === 'active');

  const applyPin = async (a: ApprovalRow) => {
    if (!pinFor) return;
    await crud.update('employees', pinFor.id, { pin_hash: hashPin(newPin) });
    await crud.audit('pin.reset', 'employees', pinFor.id, { approval_id: a.id, by: user.name }, pinFor.location_id ?? null);
    toast({ tone: 'success', title: 'PIN updated', body: `${pinFor.name} can sign in with the new PIN. Approved by ${a.approved_by_name}.` });
    setPinFor(null); setNewPin(''); setApproval(null);
  };
  /** Keep users.role / location in sync when the employee has a login. */
  const afterSave = async (values: Record<string, unknown>) => {
    const uid = values.user_id as string | null;
    if (uid && userById[uid]) { const patch: Partial<UserRow> = {}; if (values.role && userById[uid].role !== values.role) patch.role = values.role as string; if (values.location_id !== undefined && userById[uid].location_id !== values.location_id) patch.location_id = values.location_id as string | null; if (Object.keys(patch).length) await data.update('users', uid, patch); }
  };
  return (
    <div className="page stack">
      <PageHeader code="A-30" title="Employees" subtitle="Staff records: job, department, status, calendar colour, location and PIN. Roles drive permissions and the side menu (A-31, A-32)." />
      <div className="acp-kpis">
        <StatTile label="Active staff" value={active.length} icon="users" hint={`${employees.length - active.length} inactive / on leave`} />
        <StatTile label="Groomers" value={active.filter((e) => e.is_groomer).length} icon="scissors" />
        <StatTile label="Handlers" value={active.filter((e) => e.is_handler).length} icon="dog" />
        <StatTile label="With PIN" value={employees.filter((e) => e.pin_hash).length} icon="key" hint="can sign in at the desk" />
      </div>
      <CrudTable<EmployeeRow> table="employees" title="Staff" where={scope} orderBy={{ column: 'name' }} permission="employees.write" rowLabel={(e) => e.name} searchable addLabel="Add employee" cardBreakpoint={900}
        defaults={() => ({ location_id: locationId, status: 'active', is_groomer: false, is_handler: true, color: '#552583', department: 'Operations', pin_hash: null, user_id: null } as Partial<EmployeeRow>)}
        beforeSave={(v) => { const { role, ...rest } = v; void role; return rest; }} afterSave={afterSave}
        filters={[{ key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'on_leave', label: 'On leave' }, { value: 'inactive', label: 'Inactive' }], test: (r, v) => r.status === v }, { key: 'dept', label: 'Department', options: DEPARTMENTS.map((d) => ({ value: d, label: d })), test: (r, v) => r.department === v }]}
        columns={[
          { key: 'name', label: 'Employee', render: (e) => <span className="row" style={{ gap: 8 }}><Avatar name={e.name} size={28} /><span><strong>{e.name}</strong><div className="acp-note">{e.job_title ?? ''}{e.department ? ` · ${e.department}` : ''}</div></span></span> },
          { key: 'role', label: 'Role', render: (e) => { const r = roleOf(e); return r ? <Badge size="sm" tone="primary">{ROLE_LABEL[r]}</Badge> : <span className="faint xs">no login</span>; }, value: (e) => roleOf(e) ?? '' },
          ...(allLocations ? [{ key: 'location_id', label: 'Location', render: (e: EmployeeRow) => locName[e.location_id ?? ''] ?? '—' }] : []),
          { key: 'status', label: 'Status', render: (e) => <Badge size="sm" tone={toneFor(e.status)}>{e.status.replace('_', ' ')}</Badge> },
          { key: 'flags', label: 'Works as', sortable: false, hideOnCard: true, render: (e) => <span className="acp-badge-row">{e.is_groomer && <Badge size="sm">groomer</Badge>}{e.is_handler && <Badge size="sm">handler</Badge>}<span style={{ width: 12, height: 12, borderRadius: 3, background: e.color ?? 'transparent', display: 'inline-block', alignSelf: 'center' }} title="calendar colour" /></span> },
          { key: 'pin_hash', label: 'PIN', sortable: false, render: (e) => (writable ? <Button size="sm" variant={e.pin_hash ? 'ghost' : 'secondary'} icon="key" onClick={(ev) => { ev.stopPropagation(); setPinFor(e); setNewPin(''); }}>{e.pin_hash ? 'Reset' : 'Set PIN'}</Button> : e.pin_hash ? <Badge size="sm" tone="success">set</Badge> : <span className="faint">—</span>) },
          { key: 'date_started', label: 'Started', hideOnCard: true, render: (e) => fmtDate(e.date_started as string | null) },
        ]}
        fields={[
          { key: 'name', label: 'Full name', required: true }, { key: 'display_name', label: 'Display name', hint: 'On the grooming calendar' },
          { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone', type: 'tel' },
          { key: 'job_title', label: 'Job title', required: true }, { key: 'department', label: 'Department', type: 'select', options: DEPARTMENTS.map((d) => ({ value: d, label: d })) },
          { key: 'user_id', label: 'Login user', type: 'select', options: users.filter((u) => STAFF_ROLES.includes(u.role as Role)).map((u) => ({ value: u.id, label: `${u.name} · ${ROLE_LABEL[u.role as Role] ?? u.role}` })), placeholder: 'No login (PIN only)', hint: 'Links the staff record to a login; role below updates the user' },
          { key: 'role', label: 'Role', type: 'select', options: STAFF_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] })), when: (v) => !!v.user_id },
          ...(allLocations ? [{ key: 'location_id', label: 'Location', type: 'select' as const, required: true, options: locations.map((l) => ({ value: l.id, label: l.short_name })) }] : []),
          { key: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'active', label: 'Active' }, { value: 'on_leave', label: 'On leave' }, { value: 'inactive', label: 'Inactive' }] },
          { key: 'date_started', label: 'Date started', type: 'date' }, { key: 'color', label: 'Calendar colour', type: 'color' },
          { key: 'is_groomer', label: 'Groomer (has a column on the grooming day view)', type: 'toggle', full: true }, { key: 'is_handler', label: 'Handler (can be assigned to a stay)', type: 'toggle', full: true },
          { key: 'note', label: 'Note', type: 'textarea', maxLength: 100 },
        ]}
        preview={(v) => { const r = roleOf(v as unknown as EmployeeRow); return <p className="acp-note">Permissions come from the role{v.role ? ` (${ROLE_LABEL[v.role as Role]})` : r ? ` (${ROLE_LABEL[r]})` : ''}; edit them in Roles & permissions (A-31). PIN is set from the list, with a manager approval.</p>; }} />
      <Modal open={!!pinFor && !approval} onClose={() => setPinFor(null)} title={`${pinFor?.pin_hash ? 'Reset' : 'Set'} PIN · ${pinFor?.name ?? ''}`} size="sm"
        footer={<><Button variant="ghost" onClick={() => setPinFor(null)}>Cancel</Button><Button disabled={!isValidPinShape(newPin)} onClick={() => setApproval({ action: 'employee.pin', title: 'Manager approval to change a PIN', description: `Setting a new PIN for ${pinFor?.name}. A manager or owner PIN approves it (R-X43).`, subjectTable: 'employees', subjectId: pinFor?.id, details: { employee: pinFor?.name } })}>Continue</Button></>}>
        <div className="stack-sm">
          <p className="muted small">{PIN_MIN}-{PIN_MAX} digits. The PIN is stored hashed; staff use it on the PIN login (A-00) and for approvals if their role allows.</p>
          <Input label="New PIN" inputMode="numeric" maxLength={PIN_MAX} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} error={newPin && !isValidPinShape(newPin) ? `${PIN_MIN}-${PIN_MAX} digits` : undefined} autoFocus />
          <div className="acp-pin-preview">{'•'.repeat(newPin.length) || ' '}</div>
        </div>
      </Modal>
      <PinApprovalModal open={!!approval} request={approval} onClose={() => setApproval(null)} onApproved={applyPin} />
    </div>
  );
}
