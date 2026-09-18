import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { useData, useTable } from '../../data/DataContext';
import type { BookingRow } from '../../data/schema/core';
import { DELETION_REASONS, type AccountDeletionRequestRow } from '../../data/schema/customer-settings-chat';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Input } from '../../components/atom/Input/Input';
import { Button } from '../../components/atom/Button/Button';
import { Modal } from '../../components/organism/Modal/Modal';
import { Badge } from '../../components/atom/Badge/Badge';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomerAccount, k } from './useCustomerAccount';
import { longDate } from './time';
import './customer-settings-chat.css';

const REASON_LABEL: Record<(typeof DELETION_REASONS)[number], string> = { moving: 'Moving away', no_longer_needed: 'No longer need the service', privacy: 'Privacy concerns', too_many_notifications: 'Too many notifications', other: 'Other' };
const ACTIVE = ['requested', 'pending_vaccines', 'confirmed', 'checked_in'];
export const GRACE_DAYS = 30;

/** C-76 Delete account: explains what happens, blocks on active bookings, asks a reason, requires typing DELETE, writes account_deletion_requests, signs out (R-M05, R-M21). */
export function DeleteAccountPage() {
  const nav = useNavigate();
  const data = useData();
  const { signOut } = useSession();
  const { toast } = useToast();
  const acc = useCustomerAccount();
  const { t, customer } = acc;
  const { rows: bookings } = useTable<BookingRow>('bookings', customer ? { where: { customer_id: customer.id } } : undefined);
  const { rows: existing } = useTable<AccountDeletionRequestRow>('account_deletion_requests', { where: { user_id: acc.accountUserId, status: 'requested' } });
  const active = useMemo(() => (customer ? bookings.filter((b) => ACTIVE.includes(b.status)) : []), [bookings, customer]);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [ack, setAck] = useState(false);
  const [typed, setTyped] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = existing[0];
  const canSubmit = !!customer && active.length === 0 && !!reason && ack && typed.trim().toUpperCase() === 'DELETE' && !pending;
  const scheduled = new Date(); scheduled.setDate(scheduled.getDate() + GRACE_DAYS);

  const submit = async () => {
    if (!canSubmit || !customer) return;
    setBusy(true);
    try {
      await data.insert<AccountDeletionRequestRow>('account_deletion_requests', { user_id: acc.accountUserId, customer_id: customer.id, reason: reason as AccountDeletionRequestRow['reason'], details: details.trim() || null, status: 'requested', requested_at: new Date().toISOString(), scheduled_for: scheduled.toISOString().slice(0, 10), completed_at: null });
      await data.insert('audit_log', { location_id: customer.home_location_id ?? null, user_id: acc.accountUserId, user_name: acc.displayName, action: 'account.delete_requested', table_name: 'customers', row_id: customer.id, diff: { reason, scheduled_for: scheduled.toISOString().slice(0, 10) } });
      toast({ tone: 'info', title: 'Deletion scheduled', body: `Your account closes on ${longDate(scheduled.toISOString())}. Sign in before then to cancel.` });
      signOut();
      nav('/auth/sign-in');
    } finally { setBusy(false); setConfirm(false); }
  };
  const cancelPending = async () => { if (pending) { await data.update('account_deletion_requests', pending.id, { status: 'cancelled' }); toast('Deletion request cancelled'); } };

  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('delete.title'))} backTo="/app/settings" />
      <div className="csc-body">
        {pending && (
          <Card tint>
            <div className="stack-sm">
              <div className="row-between"><strong className="small">Deletion already requested</strong><Badge tone="warn" size="sm">Scheduled</Badge></div>
              <p className="small muted">Your account is scheduled to close on {longDate(pending.scheduled_for)}. You can cancel until then.</p>
              <Button variant="secondary" onClick={cancelPending}>Keep my account</Button>
            </div>
          </Card>
        )}
        <Card>
          <div className="stack-sm">
            <h3>What happens</h3>
            <ul className="csc-check-list">
              <li>Your profile, pets, vaccine certificates and saved cards are deleted after a <strong>{GRACE_DAYS}-day grace period</strong>.</li>
              <li>Invoices and payment records are kept as required by law, without your name.</li>
              <li>Photos and chat history with the Front Desk are removed.</li>
              <li>Sign in again within {GRACE_DAYS} days to cancel the request.</li>
            </ul>
          </div>
        </Card>
        {active.length > 0 && (
          <div className="csc-danger-box" role="alert">{t(k('delete.blocked'))} <span className="small">({active.map((b) => b.code).join(', ')})</span></div>
        )}
        <Select label={t(k('delete.reason'))} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Choose a reason" options={DELETION_REASONS.map((r) => ({ value: r, label: REASON_LABEL[r] }))} required />
        <Textarea label="Anything we should know? (optional)" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={500} showCount rows={3} />
        <Checkbox label="I understand my data is deleted after the grace period and this cannot be undone afterwards." checked={ack} onChange={(e) => setAck(e.target.checked)} />
        <Input label={t(k('delete.type'))} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoCapitalize="characters" placeholder="DELETE" />
        <div className="csc-sticky-cta"><Button block size="lg" variant="danger" icon="trash" disabled={!canSubmit} onClick={() => setConfirm(true)}>{t(k('delete.confirm'))}</Button></div>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Delete account?" size="sm" footer={<><Button variant="secondary" onClick={() => setConfirm(false)}>{t(k('edit.cancel'))}</Button><Button variant="danger" loading={busy} onClick={submit}>Yes, delete</Button></>}>
        <p className="small">Your account closes on <strong>{longDate(scheduled.toISOString())}</strong>. You will be signed out now.</p>
      </Modal>
    </div>
  );
}
