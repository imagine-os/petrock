import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, useTable } from '../../data/DataContext';
import type { LocationRow } from '../../data/schema/core';
import { SUPPORT_TOPICS, type FaqItemRow, type SupportRequestRow } from '../../data/schema/customer-settings-chat';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import { AccountMenuRow } from '../../components/molecule/AccountMenuRow/AccountMenuRow';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Select } from '../../components/atom/Select/Select';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomerAccount, k } from './useCustomerAccount';
import { relativeTime } from './time';
import './customer-settings-chat.css';

const TOPIC_LABEL: Record<(typeof SUPPORT_TOPICS)[number], string> = { booking: 'Bookings & stays', payment: 'Payments & receipts', vaccines: 'Vaccines', app: 'Using the app', other: 'Something else' };

/** C-77 Help & support: contact options (chat, call), FAQ by topic, support request form and history. */
export function HelpSupportPage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const acc = useCustomerAccount();
  const { t, customer, lang } = acc;
  const { rows: faqs } = useTable<FaqItemRow>('faq_items', { where: { active: true }, orderBy: { column: 'sort_order' } });
  const { rows: locations } = useTable<LocationRow>('locations', { where: { active: true }, orderBy: { column: 'sort_order' } });
  const { rows: history } = useTable<SupportRequestRow>('support_requests', { where: { user_id: acc.accountUserId }, orderBy: { column: 'created_at', dir: 'desc' } });
  const [topic, setTopic] = useState<'all' | (typeof SUPPORT_TOPICS)[number]>('all');
  const [form, setForm] = useState({ topic: '', message: '' });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shown = useMemo(() => (topic === 'all' ? faqs : faqs.filter((f) => f.topic === topic)), [faqs, topic]);
  const home = locations.find((l) => l.id === customer?.home_location_id) ?? locations[0];

  const send = async () => {
    if (!form.topic) { setErr('Choose a topic'); return; }
    if (form.message.trim().length < 10) { setErr('Tell us a little more (at least 10 characters)'); return; }
    setErr(null); setBusy(true);
    try {
      await data.insert<SupportRequestRow>('support_requests', { location_id: home?.id ?? null, customer_id: customer?.id ?? null, user_id: acc.accountUserId, user_name: acc.displayName, email: acc.email || null, topic: form.topic as SupportRequestRow['topic'], message: form.message.trim(), status: 'new', staff_reply: null });
      setForm({ topic: '', message: '' });
      toast({ tone: 'success', title: t(k('help.sent')) });
    } finally { setBusy(false); }
  };

  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('help.title'))} backTo="/app/profile" />
      <div className="csc-body">
        <div className="csc-group">
          <p className="eyebrow csc-group-title">{t(k('help.contact'))}</p>
          <Card padding="none">
            <AccountMenuRow icon="message" label={t(k('help.chatNow'))} description={home ? `${home.short_name} · usually replies in minutes` : undefined} onClick={() => nav('/app/inbox')} />
            {locations.map((l) => l.phone && <AccountMenuRow key={l.id} icon="phone" label={t(k('help.call'), { location: l.short_name })} value={l.phone} onClick={() => { window.location.href = `tel:${l.phone!.replace(/[^\d+]/g, '')}`; }} />)}
            <AccountMenuRow icon="globe" label="petrockhotel.com" onClick={() => window.open('https://petrockhotel.com', '_blank', 'noopener')} />
          </Card>
        </div>

        <Section title={t(k('help.faq'))}>
          <div className="stack-sm">
            <Tabs size="sm" variant="pills" ariaLabel="FAQ topic" value={topic} onChange={setTopic} items={[{ key: 'all' as const, label: 'All' }, ...SUPPORT_TOPICS.map((tp) => ({ key: tp, label: TOPIC_LABEL[tp] }))]} />
            {shown.length === 0 ? <EmptyState compact icon="question" title="No questions here yet" /> : shown.map((f) => (
              <Card key={f.id} padding="none"><Section title={f.question} collapsible defaultOpen={false} className="csc-faq"><p className="small muted" style={{ padding: '0 var(--sp-4) var(--sp-4)' }}>{f.answer}</p></Section></Card>
            ))}
          </div>
        </Section>

        <Section title={t(k('help.form'))} description="We reply by email within one business day.">
          <div className="stack-sm">
            <Select label={t(k('help.topic'))} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Choose a topic" options={SUPPORT_TOPICS.map((tp) => ({ value: tp, label: TOPIC_LABEL[tp] }))} error={err && !form.topic ? err : undefined} />
            <Textarea label={t(k('help.message'))} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} maxLength={1000} showCount error={err && form.topic ? err : undefined} />
            <Button block onClick={send} loading={busy} iconRight="arrow-right">{t(k('help.send'))}</Button>
          </div>
        </Section>

        {history.length > 0 && (
          <Section title={t(k('help.history'))}>
            <div className="stack-sm">
              {history.map((r) => (
                <Card key={r.id} padding="sm">
                  <div className="row-between"><span className="small" style={{ fontWeight: 500 }}>{TOPIC_LABEL[r.topic]}</span><Badge size="sm" tone={r.status === 'resolved' ? 'success' : r.status === 'open' ? 'info' : 'neutral'}>{r.status}</Badge></div>
                  <p className="small muted">{r.message}</p>
                  {r.staff_reply && <p className="small" style={{ marginTop: 6 }}><strong>Petrock:</strong> {r.staff_reply}</p>}
                  <p className="xs faint" style={{ marginTop: 4 }}>{relativeTime(r.created_at, new Date(), lang)}</p>
                </Card>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
