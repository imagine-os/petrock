/** A-28 Providers: email / SMS / push stubs plus the payment provider seam (R-M13, R-H12). No secrets in the mock. */
import { useState } from 'react';
import { useTable } from '../../data/DataContext';
import { useSession } from '../../auth/SessionProvider';
import type { ProviderRow } from '../../data/schema/admin-control-panel';
import { defaultPaymentProvider } from '../../payments';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Badge, toneFor } from '../../components/atom/Badge/Badge';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { useToast } from '../../components/molecule/Toast/Toast';
import { AdminRecordDrawer, type AdminField } from '../../components/organism/AdminRecordDrawer/AdminRecordDrawer';
import { useAdminCrud, fmtDateTime } from './lib';
import './admin.css';

const KIND_META: Record<string, { label: string; icon: IconName; options: { value: string; label: string }[]; hint: string }> = {
  email: { label: 'Email', icon: 'message', options: [{ value: 'none', label: 'None (log only)' }, { value: 'gmail', label: 'Gmail' }, { value: 'smtp', label: 'Other (SMTP)' }], hint: 'Booking confirmations, invoices, vaccine reminders' },
  sms: { label: 'SMS', icon: 'phone', options: [{ value: 'none', label: 'None (log only)' }, { value: 'twilio', label: 'Twilio' }, { value: 'petlinx', label: 'Petlinx (legacy)' }], hint: 'Arrival reminders, pickup ready' },
  push: { label: 'Push', icon: 'bell', options: [{ value: 'none', label: 'None' }, { value: 'fcm', label: 'Firebase Cloud Messaging' }, { value: 'apns', label: 'Apple Push (APNs)' }], hint: 'Customer app (Capacitor) notifications' },
};
const STATUS_LABEL: Record<string, string> = { not_configured: 'Not configured', configured: 'Configured', test_ok: 'Test OK', error: 'Error' };

export function ProvidersPage() {
  const { rows } = useTable<ProviderRow>('providers');
  const { can } = useSession();
  const crud = useAdminCrud();
  const { toast } = useToast();
  const [editing, setEditing] = useState<ProviderRow | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const writable = can('settings.write');
  const test = async (p: ProviderRow) => {
    setTesting(p.id);
    await new Promise((r) => setTimeout(r, 700));
    const ok = p.provider !== 'none' && p.enabled;
    await crud.update('providers', p.id, { last_test_at: new Date().toISOString(), last_test_result: ok ? `Test ${p.kind} sent (mock)` : `No ${p.kind} provider enabled`, status: ok ? 'test_ok' : p.provider === 'none' ? 'not_configured' : 'error' });
    setTesting(null);
    toast({ tone: ok ? 'success' : 'warn', title: ok ? `Test ${p.kind} sent` : 'Nothing sent', body: ok ? 'Mock provider: nothing left the browser.' : `Choose a provider and enable it first.` });
  };
  const fields = (p: ProviderRow): AdminField[] => [
    { key: 'name', label: 'Display name', required: true }, { key: 'provider', label: 'Provider', type: 'select', required: true, options: KIND_META[p.kind].options },
    ...(p.kind === 'email' ? [{ key: 'from_address', label: 'From address', type: 'email' as const, required: true }] : []),
    { key: 'secret_masked', label: 'API key / password', hint: 'Only the last 4 characters are kept in this mock', full: true, validate: (v) => (v && String(v).length > 4 ? 'Store only the last 4 characters (mock)' : null) },
    { key: 'config', label: 'Settings (JSON)', type: 'json', hint: 'Non-secret settings: host, port, sender id, platforms' },
    { key: 'enabled', label: 'Enabled', type: 'toggle' },
  ];
  return (
    <div className="page stack">
      <PageHeader code="A-28" title="Providers" subtitle="Outbound channels and the payment seam. Everything here is a stub until an integration is wired; test-send records the attempt and never leaves the browser." />
      <div className="grid grid-3">
        {rows.map((p) => {
          const meta = KIND_META[p.kind];
          return (
            <Card key={p.id} padding="md" header={<div className="acp-provider"><span className="acp-provider-icon"><Icon name={meta.icon} size={18} /></span><div><h3>{meta.label}</h3><p className="acp-note">{meta.hint}</p></div><Badge tone={p.status === 'test_ok' ? 'success' : p.status === 'error' ? 'danger' : p.status === 'configured' ? 'info' : 'neutral'}>{STATUS_LABEL[p.status]}</Badge></div>}
              footer={writable ? <><Button size="sm" variant="secondary" icon="edit" onClick={() => setEditing(p)}>Configure</Button><Button size="sm" variant="ghost" icon="arrow-right" loading={testing === p.id} onClick={() => test(p)}>Send test</Button></> : undefined}>
              <div className="stack-sm xs">
                <div className="row-between"><span className="muted">Provider</span><strong>{meta.options.find((o) => o.value === p.provider)?.label ?? p.provider}</strong></div>
                <div className="row-between"><span className="muted">Name</span><span>{p.name}{p.from_address ? ` · ${p.from_address}` : ''}</span></div>
                <div className="row-between"><span className="muted">Key</span><span className="mono">{p.secret_masked ? `••••${p.secret_masked}` : '—'}</span></div>
                <div className="row-between"><span className="muted">Enabled</span><Badge size="sm" tone={p.enabled ? 'success' : 'neutral'}>{p.enabled ? 'yes' : 'no'}</Badge></div>
                <div className="row-between"><span className="muted">Last test</span><span>{p.last_test_at ? `${fmtDateTime(p.last_test_at)} · ${p.last_test_result}` : 'never'}</span></div>
              </div>
            </Card>
          );
        })}
      </div>
      <Card padding="md" header={<div className="acp-provider"><span className="acp-provider-icon"><Icon name="card" size={18} /></span><div><h3>Payments</h3><p className="acp-note">PaymentProvider seam: MockPaymentProvider today, StripePaymentProvider (Elements-ready shape) when keys exist. No keys are stored in this app (R-H12).</p></div><Badge tone={toneFor(defaultPaymentProvider.name)}>{defaultPaymentProvider.name}</Badge></div>}>
        <p className="xs muted">Switch providers in <code>src/payments/index.ts</code>; the customer app, front desk and invoices only talk to the interface. Card fee and taxes come from Fees & taxes (A-22).</p>
      </Card>
      {editing && <AdminRecordDrawer open onClose={() => setEditing(null)} title={`${KIND_META[editing.kind].label} provider`} fields={fields(editing)} initial={editing as unknown as Record<string, unknown>} saveLabel="Save provider"
        onSave={async (v) => { const patch = crud.clean(v, ['name', 'provider', 'from_address', 'secret_masked', 'config', 'enabled']); const status = patch.provider === 'none' ? 'not_configured' : 'configured'; await crud.update('providers', editing.id, { ...patch, status }); toast({ tone: 'success', title: 'Provider saved' }); }} />}
    </div>
  );
}
