import { useMemo, useState } from 'react';
import { Modal } from '../Modal/Modal';
import { PinPad } from '../../molecule/PinPad/PinPad';
import { Badge } from '../../atom/Badge/Badge';
import { useData, useTable } from '../../../data/DataContext';
import type { ApprovalRow, EmployeeRow, UserRow } from '../../../data/schema/core';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { canApprove, demoPinHolders, findByPin, type PinHolder } from '../../../auth/pin';
import { ROLE_LABEL, type Role } from '../../../auth/roles';
import './PinApprovalModal.css';

export interface PinApprovalRequest { action: string; title?: string; description?: string; subjectTable?: string; subjectId?: string; details?: Record<string, unknown>; /** Location of the subject row; defaults to the actor's UI location. */ locationId?: string | null }
export interface PinApprovalModalProps { open: boolean; request: PinApprovalRequest | null; onClose: () => void; onApproved: (approval: ApprovalRow) => void }

/**
 * Manager approval in place (R-I06, R-P01): the person at the desk asks, a manager / owner / super admin types their
 * PIN, and the approval is written to the `approvals` audit table before the action runs.
 */
export function PinApprovalModal({ open, request, onClose, onApproved }: PinApprovalModalProps) {
  const data = useData();
  const { user } = useSession();
  const { locationId } = useLocation();
  const { rows: employees } = useTable<EmployeeRow>('employees');
  const { rows: users } = useTable<UserRow>('users');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const holders = useMemo<PinHolder[]>(() => {
    const fromEmployees = employees.filter((e) => e.pin_hash && e.status === 'active').map((e) => {
      const u = users.find((x) => x.id === e.user_id);
      return { userId: e.user_id ?? e.id, name: e.name, role: (u?.role ?? 'front_desk') as Role, pinHash: e.pin_hash!, locationId: e.location_id ?? null };
    });
    const ids = new Set(fromEmployees.map((h) => h.userId));
    return [...fromEmployees, ...demoPinHolders.filter((h) => !ids.has(h.userId))];
  }, [employees, users]);

  const submit = async (pin: string) => {
    if (!request) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 250));
    const holder = findByPin(pin, holders);
    if (!holder) { setError('PIN not recognised'); setBusy(false); return; }
    if (!canApprove(holder.role)) { setError(`${holder.name} is ${ROLE_LABEL[holder.role]}; a manager or owner PIN is needed`); setBusy(false); return; }
    const approval = await data.insert<ApprovalRow>('approvals', {
      location_id: request.locationId ?? locationId, action: request.action, subject_table: request.subjectTable ?? null, subject_id: request.subjectId ?? null,
      requested_by: user.id, requested_by_name: user.name, approved_by: holder.userId, approved_by_name: holder.name, approver_role: holder.role,
      details: request.details ?? null, approved_at: new Date().toISOString(),
    });
    setBusy(false); setError(null);
    onApproved(approval);
  };

  return (
    <Modal open={open && !!request} onClose={onClose} title={request?.title ?? 'Manager approval needed'} size="sm">
      <div className="pinapproval">
        <p className="muted small">{request?.description ?? 'You will get a PIN code from a manager to complete this action.'}</p>
        <div className="row wrap xs"><Badge tone="primary">{request?.action}</Badge>{request?.subjectTable && <code className="xs">{request.subjectTable}{request.subjectId ? ` / ${request.subjectId}` : ''}</code>}</div>
        <PinPad label="Manager PIN" onSubmit={submit} error={error} busy={busy} />
        <p className="xs faint">Requested by {user.name}. The approval is recorded in the approvals table.</p>
      </div>
    </Modal>
  );
}
