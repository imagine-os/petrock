import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData, useTable } from '../../../data/DataContext';
import type { EmployeeRow } from '../../../data/schema/core';
import type { SiteFaqRow } from '../../../data/schema/extras-manual-website';
import { company } from '../../../tenant/locations';
import { useT } from '../../../i18n/I18nProvider';
import { BOOKING_STATUSES, BOOKING_STATUS_CUSTOMER_LABEL } from '../../../domain/booking';
import { SiteLayout } from '../../../components/template/SiteLayout/SiteLayout';
import { SiteHero } from '../../../components/molecule/SiteHero/SiteHero';
import { Button } from '../../../components/atom/Button/Button';
import { Card } from '../../../components/molecule/Card/Card';
import { Badge, StatusBadge } from '../../../components/atom/Badge/Badge';
import { Icon, type IconName } from '../../../components/atom/Icon/Icon';
import { Input } from '../../../components/atom/Input/Input';
import { Select } from '../../../components/atom/Select/Select';
import { Textarea } from '../../../components/atom/Textarea/Textarea';
import { Tabs } from '../../../components/molecule/Tabs/Tabs';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { Avatar } from '../../../components/atom/Avatar/Avatar';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { SectionHead, CtaBand, Art, CheckList } from './siteBits';
import { SitePhoto } from './siteImages';
import { cardFee, tel, useLocations, usePricingTables, useVaccineTypes } from './teasers';

const K = 'extras-manual-website.site';

/** P-08 Vaccines & policies: required / recommended vaccines, how verification works, the booking statuses a parent sees, payment and cancellation notes. */
export function SitePolicies() {
  const vaccines = useVaccineTypes();
  const { fees, discounts } = usePricingTables();
  const fee = cardFee(fees);
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow="Vaccines & policies" title="Safe for every dog in the building" lead="Our rules are short and the app enforces them, so there are no surprises at the door." />
      <div className="container ps">
        <section className="ps-section">
          <SectionHead eyebrow="Vaccines" title="What we require" lead="Each record has a date and an expiry. Upload the certificate from your vet in the app; our staff verifies it, usually the same day. Bookings stay pending until every required vaccine is verified." />
          <div className="ps-two"><Card padding="lg">{vaccines.map((v) => <div key={v.id} className="ps-vax"><Icon name="shield" size={18} className={v.required ? 'tone-danger' : 'tone-success'} /><div><div className="row wrap" style={{ gap: 8 }}><strong>{v.name}</strong><Badge size="sm" tone={v.required ? 'danger' : 'success'}>{v.required ? 'required' : 'recommended'}</Badge></div><p className="small muted">{v.required ? 'Needed before any hotel, daycare or grooming visit.' : 'Strongly recommended for group play.'}</p></div></div>)}</Card><Art icon="shield" label="Vaccine certificate" small /></div>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Your booking" title="What each status means" />
          <Card padding="lg"><div className="stack-sm">{BOOKING_STATUSES.map((s) => <div key={s} className="row wrap" style={{ gap: 12 }}><StatusBadge status={s} customer /><span className="small muted">{({ requested: 'We received it and are checking vaccines and room availability.', pending_vaccines: 'A required vaccine is missing or not verified yet; upload it in the app.', confirmed: 'All set; see you at check-in.', checked_in: 'Your dog is with us; photos arrive every night.', checked_out: 'Stay complete; the invoice is in the app.', cancelled: 'Cancelled by you or by us.', no_show: 'The stay did not start on the check-in day.' } as Record<string, string>)[s]} <span className="xs faint">({BOOKING_STATUS_CUSTOMER_LABEL[s]})</span></span></div>)}</div></Card>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Payments & changes" title="Deposits, fees and cancellations" />
          <div className="ps-policy-list">
            <Card padding="lg" className="stack-sm"><h3>Deposit</h3><p className="small muted">Hotel stays take a deposit when you book; the balance is due at check-out. Grooming and daycare can be paid in the app or at the desk.</p></Card>
            <Card padding="lg" className="stack-sm"><h3>Card fee</h3><p className="small muted">{fee ? `${fee.name}: ${fee.percent}% on card payments.` : 'A non-cash fee applies to card payments.'} Cash and prepaid stays avoid it.</p></Card>
            <Card padding="lg" className="stack-sm"><h3>Prepay</h3><p className="small muted">{discounts.filter((d) => d.requires_paid_in_full).map((d) => `${d.name}: ${d.percent_off ?? d.amount_off}${d.percent_off != null ? '%' : ''} off${d.excludes_holidays ? ' (holidays excluded)' : ''}`).join('; ') || 'Pay the full stay upfront to unlock the prepay discount where it applies.'}</p></Card>
            <Card padding="lg" className="stack-sm"><h3>Cancellations</h3><p className="small muted">Cancel from the app or message the front desk. Refunds follow the deposit policy the desk confirms with you; a manager reviews every refund.</p></Card>
          </div>
        </section>
        <CtaBand title="Questions about a policy?" lead="Message the front desk from the app or use the contact form." primary={{ to: '/site/contact', label: 'Contact us' }} secondary={{ to: '/site/faq', label: 'Read the FAQ' }} />
      </div>
    </SiteLayout>
  );
}

/** P-09 Book now: choose a service, what to prepare, hand-off into the customer app (sign in / sign up). */
export function SiteBook() {
  const choices: { icon: IconName; title: string; body: string; to: string }[] = [
    { icon: 'bed', title: 'Hotel stay', body: 'Choose dogs, shared room, room type and dates; see the estimate; pay a deposit or in full.', to: '/app' },
    { icon: 'sun', title: 'Daycare day', body: 'Pick the date and your drop-off and pick-up times; the price is computed for you.', to: '/app' },
    { icon: 'scissors', title: 'Grooming & Spa', body: 'Pick the dog, the package for their size, add-ons and a time.', to: '/app' },
  ];
  return (
    <SiteLayout>
      <SiteHero eyebrow="Book now" title="Booking happens in the app" lead="One account, all your dogs, every booking and photo in one place. Choose what you need and we will take you there." align="center" />
      <div className="container ps">
        <div className="ps-tiles">{choices.map((c) => <Card key={c.title} padding="lg" className="ps-choice"><span className="ps-tile-icon"><Icon name={c.icon} size={24} /></span><h3>{c.title}</h3><p>{c.body}</p><Link to={c.to}><Button iconRight="arrow-right">Continue in the app</Button></Link></Card>)}</div>
        <section className="ps-section">
          <SectionHead eyebrow="Before you book" title="Have these ready" center />
          <div className="ps-steps">{[['Your dog\'s weight', 'Sets the grooming size band and helps us pick the right room.'], ['Vaccine certificates', 'A photo or PDF from your vet for each required vaccine.'], ['Meds and feeding', 'Names, doses and times; we follow them to the minute.'], ['A payment method', 'Card in the app, or cash at the desk.']].map(([t, b]) => <div key={t} className="ps-step"><h3>{t}</h3><p>{b}</p></div>)}</div>
        </section>
        <div className="row wrap" style={{ justifyContent: 'center' }}><Link to="/auth/sign-in"><Button size="lg" variant="secondary">I already have an account</Button></Link><Link to="/site/contact"><Button size="lg" variant="ghost">I would rather call</Button></Link></div>
      </div>
    </SiteLayout>
  );
}

const TOPICS = [{ value: 'hotel', label: 'Hotel stay' }, { value: 'grooming', label: 'Grooming & Spa' }, { value: 'daycare', label: 'Daycare' }, { value: 'in_home', label: 'In-home care (inquiry)' }, { value: 'other', label: 'Something else' }];

/** P-10 Contact: phones and addresses per location plus a form that writes a site_inquiries row for the chosen location (R-X72). */
export function SiteContact() {
  const data = useData();
  const { toast } = useToast();
  const locations = useLocations();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ location_id: params.get('location') ?? '', name: '', email: '', phone: '', topic: 'hotel', message: '' });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const locId = form.location_id || locations[0]?.id || '';
  const valid = form.name.trim() && /.+@.+\..+/.test(form.email) && form.message.trim().length >= 10;
  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    await data.insert('site_inquiries', { location_id: locId, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || null, topic: form.topic, message: form.message.trim(), status: 'new', replied_by: null, replied_at: null });
    setBusy(false); setSent(true);
    toast({ tone: 'success', title: 'Message sent', body: 'The front desk answers within one business day.' });
  };
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow="Contact" title="Talk to a person" lead="Call the location, or write and the front desk gets back to you within one business day. Existing customers: the chat in the app is fastest." />
      <div className="container ps">
        <div className="ps-two">
          <Card padding="lg">
            {sent ? <EmptyState icon="check" title="Thanks, we have it" body={`Your message went to ${locations.find((l) => l.id === locId)?.name ?? 'the front desk'}. Expect a reply within one business day.`} action={<Button variant="secondary" onClick={() => { setSent(false); setForm((f) => ({ ...f, message: '' })); }}>Send another</Button>} /> : (
              <form className="ps-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
                <Select label="Location" value={locId} onChange={set('location_id')} options={locations.map((l) => ({ value: l.id, label: l.name }))} />
                <div className="grid grid-2"><Input label="Your name" value={form.name} onChange={set('name')} required autoComplete="name" /><Input label="Email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></div>
                <div className="grid grid-2"><Input label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" /><Select label="About" value={form.topic} onChange={set('topic')} options={TOPICS} /></div>
                <Textarea label="Message" rows={5} value={form.message} onChange={set('message')} maxLength={1000} showCount hint="Dates, dog's size and anything we should know." required />
                <div className="row wrap"><Button type="submit" loading={busy} disabled={!valid} iconRight="arrow-right">Send message</Button><span className="xs faint">We never share your details.</span></div>
              </form>
            )}
          </Card>
          <div className="stack">{locations.map((l) => <Card key={l.id} padding="lg" className="stack-sm"><h3><Icon name="location" size={16} /> {l.name}</h3><p className="small">{l.address}</p>{l.phone && <a href={tel(l.phone)} className="small"><Icon name="phone" size={14} /> {l.phone}</a>}<Link to={`/site/locations#${l.slug}`} className="xs">Hours & directions →</Link></Card>)}<Card padding="lg" tint className="stack-sm"><h3>Already a customer?</h3><p className="small muted">Open the app and tap Front Desk chat: one thread, real people, and your dog's file already open on our side.</p><Link to="/app"><Button size="sm" variant="secondary">Open the app</Button></Link></Card></div>
        </div>
      </div>
    </SiteLayout>
  );
}

const FAQ_TOPICS: { key: string; label: string }[] = [{ key: 'all', label: 'All' }, { key: 'hotel', label: 'Hotel' }, { key: 'grooming', label: 'Grooming & Spa' }, { key: 'daycare', label: 'Daycare' }, { key: 'vaccines', label: 'Vaccines' }, { key: 'payments', label: 'Payments' }, { key: 'general', label: 'General' }];

/** P-11 FAQ: published site_faqs grouped by topic with search. */
export function SiteFaq() {
  const { rows } = useTable<SiteFaqRow>('site_faqs', { where: { published: true }, orderBy: { column: 'sort_order' } });
  const [topic, setTopic] = useState('all');
  const [q, setQ] = useState('');
  const list = useMemo(() => rows.filter((f) => (topic === 'all' || f.topic === topic) && (!q.trim() || `${f.question} ${f.answer}`.toLowerCase().includes(q.trim().toLowerCase()))), [rows, topic, q]);
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow="FAQ" title="Questions parents ask" lead="Short answers, kept current by our team. Not here? Ask us." />
      <div className="container ps">
        <div className="stack">
          <div className="row-between wrap"><Tabs size="sm" variant="pills" ariaLabel="Topic" value={topic} onChange={setTopic} items={FAQ_TOPICS.map((t) => ({ key: t.key, label: t.label, count: t.key === 'all' ? rows.length : rows.filter((f) => f.topic === t.key).length }))} /><Input size="sm" icon="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the FAQ" /></div>
          {list.length === 0 ? <EmptyState icon="question" title="Nothing matches" body="Try another word or ask us directly." action={<Link to="/site/contact"><Button size="sm">Contact us</Button></Link>} /> : <div className="ps-faq">{list.map((f, i) => <details key={f.id} open={i === 0 && !q}><summary>{f.question}</summary><p>{f.answer}</p></details>)}</div>}
        </div>
        <CtaBand title="Still wondering?" lead="Write to the front desk; a real person answers within one business day." primary={{ to: '/site/contact', label: 'Contact us' }} secondary={{ to: '/site/policies', label: 'Vaccines & policies' }} />
      </div>
    </SiteLayout>
  );
}

/** P-12 About: the client's own "established 2011" story, what we believe, the team from active employees, the legal entity. */
export function SiteAbout() {
  const t = useT();
  const locations = useLocations();
  const { rows: staff } = useTable<EmployeeRow>('employees', { where: { status: 'active' } });
  return (
    <SiteLayout>
      <SiteHero tone="soft" compact eyebrow={t(`${K}.about.eyebrow`)} title={t(`${K}.about.title`)} lead={t(`${K}.about.lead`)} />
      <div className="container ps">
        <section className="ps-section">
          <div className="ps-room">
            <SitePhoto slug="dsc06642" ratio="4 / 3" sizes="(max-width: 900px) 100vw, 40vw" />
            <div className="stack">
              <SectionHead eyebrow={t(`${K}.why.eyebrow`)} title={t(`${K}.why.title`)} />
              <p className="small muted">{t(`${K}.about.story1`)}</p>
              <p className="small muted">{t(`${K}.about.story2`)}</p>
              <p className="small muted">{t(`${K}.about.story3`)}</p>
            </div>
          </div>
        </section>
        <section className="ps-section">
          <div className="ps-room">
            <div className="stack">
              <SectionHead eyebrow="What we believe" title="Small, known, photographed" />
              <CheckList prefix={`${K}.why.item`} count={6} />
            </div>
            <SitePhoto slug="dsc06358" ratio="4 / 3" sizes="(max-width: 900px) 100vw, 40vw" />
          </div>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Team" title="The people at the desk and on the floor" lead="First names and roles; you will meet them at drop-off." />
          <div className="ps-team">{staff.map((e) => <Card key={e.id} padding="lg" className="ps-team-card"><Avatar name={e.display_name ?? e.name} size={56} /><strong>{e.display_name ?? e.name.split(' ')[0]}</strong><span className="xs muted">{e.job_title ?? e.department ?? 'Team'} · {locations.find((l) => l.id === e.location_id)?.short_name ?? ''}</span></Card>)}</div>
        </section>
        <section className="ps-section">
          <SectionHead eyebrow="Behind the app" title="One system, built for dogs" lead="The website, the customer app and our front desk run on the same software, so what you book is what the desk sees, and the prices you read here are the ones we charge." />
          <div className="row wrap"><Link to="/site/pricing"><Button variant="secondary">Pricing</Button></Link><Link to="/site/policies"><Button variant="secondary">Vaccines & policies</Button></Link><Link to="/site/gallery"><Button variant="secondary">{t(`${K}.gallery.eyebrow`)}</Button></Link><Link to="/site/reviews"><Button variant="secondary">Reviews</Button></Link></div>
          <p className="ps-inline-note">{company.name} is operated by {company.legalName}, {locations.map((l) => l.address).join(' · ')}.</p>
        </section>
        <CtaBand />
      </div>
    </SiteLayout>
  );
}
