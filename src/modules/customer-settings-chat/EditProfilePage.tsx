import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../data/DataContext';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { AccountProfileHero } from '../../components/molecule/AccountProfileHero/AccountProfileHero';
import { Section } from '../../components/molecule/Section/Section';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Button } from '../../components/atom/Button/Button';
import { Modal } from '../../components/organism/Modal/Modal';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

const US_STATES = ['AZ', 'CA', 'CO', 'NV', 'NY', 'OR', 'TX', 'WA'].map((s) => ({ value: s, label: s }));
const phoneOk = (v: string) => !v || /^[+\d][\d\s().-]{6,}$/.test(v);
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

interface Form { first_name: string; last_name: string; mobile: string; alt_phone: string; address: string; apt_suite: string; city: string; state: string; zip: string }

/** C-71 Edit profile: contact + address form; email and password change through separate flows (R-M01). */
export function EditProfilePage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const acc = useCustomerAccount();
  const { t, customer } = acc;
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [saving, setSaving] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPw, setEmailPw] = useState('');
  const [emailErr, setEmailErr] = useState<string | null>(null);

  useEffect(() => { if (customer && !form) setForm({ first_name: customer.first_name, last_name: customer.last_name, mobile: customer.mobile ?? '', alt_phone: customer.alt_phone ?? '', address: customer.address ?? '', apt_suite: customer.apt_suite ?? '', city: customer.city ?? '', state: customer.state ?? '', zip: customer.zip ?? '' }); }, [customer, form]);
  const set = (key: keyof Form) => (v: string) => setForm((f) => (f ? { ...f, [key]: v } : f));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form || !customer) return;
    const errs: typeof errors = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim()) errs.last_name = 'Required';
    if (!form.mobile.trim()) errs.mobile = 'Required'; else if (!phoneOk(form.mobile)) errs.mobile = 'Enter a valid phone number';
    if (!phoneOk(form.alt_phone)) errs.alt_phone = 'Enter a valid phone number';
    if (form.zip && !/^\d{5}(-\d{4})?$/.test(form.zip)) errs.zip = 'Use a 5-digit ZIP';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await data.update('customers', customer.id, { ...form, alt_phone: form.alt_phone || null, address: form.address || null, apt_suite: form.apt_suite || null, city: form.city || null, state: form.state || null, zip: form.zip || null });
      if (acc.userRow) await data.update('users', acc.userRow.id, { name: `${form.first_name.trim()} ${form.last_name.trim()}`, phone: form.mobile });
      toast(t(k('edit.saved')));
      nav('/app/profile');
    } finally { setSaving(false); }
  };

  const changeEmail = async () => {
    if (!emailOk(newEmail)) { setEmailErr('Enter a valid email address'); return; }
    if (emailPw.length < 4) { setEmailErr('Enter your password to confirm'); return; }
    if (customer) await data.update('customers', customer.id, { email: newEmail.trim() });
    if (acc.userRow) await data.update('users', acc.userRow.id, { email: newEmail.trim() });
    await data.insert('audit_log', { location_id: customer?.home_location_id ?? null, user_id: acc.accountUserId, user_name: acc.displayName, action: 'email.change', table_name: 'users', row_id: acc.userRow?.id ?? null, diff: { email: [acc.email, newEmail.trim()] } });
    setEmailModal(false); setNewEmail(''); setEmailPw(''); setEmailErr(null);
    toast({ tone: 'success', title: 'Email updated', body: 'A confirmation was sent to your new address (mock).' });
  };

  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('edit.title'))} backTo="/app/profile" />
      <AccountProfileHero name={acc.displayName} avatarUrl={acc.avatarUrl} size={88} onPhoto={async (url) => { if (acc.userRow) { await data.update('users', acc.userRow.id, { avatar_url: url }); toast(t(k('common.saved'))); } }} onTooLarge={() => toast({ tone: 'warn', title: 'Photo too large', body: 'Choose an image under 1.5 MB.' })} />
      {form && (
        <form className="csc-body" onSubmit={submit} noValidate>
          <Section title={t(k('edit.contact'))}>
            <div className="csc-form-grid">
              <Input label={t(k('edit.first'))} value={form.first_name} onChange={(e) => set('first_name')(e.target.value)} required error={errors.first_name} autoComplete="given-name" />
              <Input label={t(k('edit.last'))} value={form.last_name} onChange={(e) => set('last_name')(e.target.value)} required error={errors.last_name} autoComplete="family-name" />
              <Input label={t(k('edit.phone'))} value={form.mobile} onChange={(e) => set('mobile')(e.target.value)} required error={errors.mobile} type="tel" icon="phone" autoComplete="tel" />
              <Input label={t(k('edit.alt'))} value={form.alt_phone} onChange={(e) => set('alt_phone')(e.target.value)} error={errors.alt_phone} type="tel" icon="phone" />
            </div>
          </Section>
          <Section title={t(k('edit.address'))}>
            <div className="csc-form-grid">
              <Input className="span-2" label={t(k('edit.street'))} value={form.address} onChange={(e) => set('address')(e.target.value)} icon="location" autoComplete="street-address" />
              <Input label={t(k('edit.apt'))} value={form.apt_suite} onChange={(e) => set('apt_suite')(e.target.value)} />
              <Input label={t(k('edit.city'))} value={form.city} onChange={(e) => set('city')(e.target.value)} autoComplete="address-level2" />
              <Select label={t(k('edit.state'))} value={form.state} onChange={(e) => set('state')(e.target.value)} options={US_STATES} placeholder="—" />
              <Input label={t(k('edit.zip'))} value={form.zip} onChange={(e) => set('zip')(e.target.value)} error={errors.zip} inputMode="numeric" autoComplete="postal-code" />
            </div>
          </Section>
          <Section title={t(k('edit.security'))} description="Email and password change through their own confirmation steps.">
            <div className="stack-sm">
              <Input label={t(k('edit.email'))} value={acc.email} readOnly icon="message" />
              <div className="csc-link-row"><Button variant="link" size="sm" onClick={() => setEmailModal(true)}>{t(k('edit.changeEmail'))}</Button></div>
              <Input label={t(k('edit.password'))} value="••••••••" readOnly disabled icon="lock" />
              <div className="csc-link-row"><Button variant="link" size="sm" onClick={() => nav('/app/settings/password')}>{t(k('edit.changePassword'))}</Button></div>
            </div>
          </Section>
          <div className="csc-sticky-cta"><Button type="submit" block size="lg" loading={saving} disabled={!customer}>{t(k('edit.save'))}</Button></div>
        </form>
      )}
      <Modal open={emailModal} onClose={() => setEmailModal(false)} title={t(k('edit.changeEmail'))} size="sm"
        footer={<><Button variant="secondary" onClick={() => setEmailModal(false)}>{t(k('edit.cancel'))}</Button><Button onClick={changeEmail}>Confirm</Button></>}>
        <div className="stack-sm">
          <p className="small muted">We send a confirmation link to the new address. Your current email is <strong>{acc.email}</strong>.</p>
          <Input label="New email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} autoComplete="email" error={emailErr && !emailOk(newEmail) ? emailErr : undefined} />
          <Input label="Current password" type="password" value={emailPw} onChange={(e) => setEmailPw(e.target.value)} autoComplete="current-password" error={emailErr && emailOk(newEmail) ? emailErr : undefined} />
        </div>
      </Modal>
    </div>
  );
}
