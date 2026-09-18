import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useData } from '../../data/DataContext';
import { useLocation } from '../../tenant/LocationProvider';
import { AuthBrandHeader } from '../../components/molecule/AuthBrandHeader/AuthBrandHeader';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { PasswordField } from '../../components/molecule/PasswordField/PasswordField';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Button } from '../../components/atom/Button/Button';
import { FormAlert } from '../../components/molecule/FormAlert/FormAlert';
import { AUTH_ERROR_TEXT, signUp } from './authService';
import { checkPassword, isEmail, isPhone, normalizeEmail } from './passwordPolicy';
import { useAuthPolicy } from './useAuthPolicy';
import './customer-auth.css';

type Field = 'firstName' | 'lastName' | 'email' | 'phone' | 'homeLocationId' | 'password' | 'terms';

/** C-03 Create account: names, email, optional mobile, usual location, password with strength, terms + marketing. */
export function SignUpPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const { locations, locationId } = useLocation();
  const { policy } = useAuthPolicy();
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', phone: '', homeLocationId: locationId, password: '', terms: false, marketing: false });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; taken?: boolean } | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => { setF((s) => ({ ...s, [k]: v })); setError(null); };
  const touch = (k: Field) => setTouched((s) => ({ ...s, [k]: true }));

  const errors: Partial<Record<Field, string>> = {};
  if (!f.firstName.trim()) errors.firstName = 'Enter your first name.';
  if (!f.lastName.trim()) errors.lastName = 'Enter your last name.';
  if (!isEmail(f.email)) errors.email = 'Enter a valid email address.';
  if (!isPhone(f.phone)) errors.phone = 'Enter a 10-digit US number, or leave it empty.';
  if (!f.homeLocationId) errors.homeLocationId = 'Pick the Petrock you visit most.';
  if (!checkPassword(f.password, policy.passwordMinLength).ok) errors.password = `Use at least ${policy.passwordMinLength} characters with a letter and a number.`;
  if (!f.terms) errors.terms = 'Please accept the terms to continue.';
  const show = (k: Field) => (touched[k] ? errors[k] : undefined);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, phone: true, homeLocationId: true, password: true, terms: true });
    if (Object.keys(errors).length) return;
    setBusy(true); setError(null);
    const r = await signUp(data, { firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone, password: f.password, homeLocationId: f.homeLocationId, marketingOptIn: f.marketing });
    setBusy(false);
    if (!r.ok) { setError({ text: AUTH_ERROR_TEXT[r.error], taken: r.error === 'email_taken' }); return; }
    nav(`/auth/verify?email=${encodeURIComponent(normalizeEmail(f.email))}&next=${encodeURIComponent('/auth/welcome')}`);
  };

  return (
    <div className="cauth">
      <AuthBrandHeader title={t('customer-auth.createTitle')} subtitle={t('customer-auth.createSubtitle')} backTo="/auth" backLabel={t('customer-auth.back')} />
      <form className="cauth-form" onSubmit={submit} noValidate>
        {error && <FormAlert tone="danger" title={error.text} action={error.taken ? <Link to={`/auth/sign-in`}>{t('customer-auth.signIn')}</Link> : undefined} />}
        <div className="cauth-names">
          <Input label={t('customer-auth.firstName')} autoComplete="given-name" placeholder="e.g. Merry" value={f.firstName} onChange={(e) => set('firstName', e.target.value)} onBlur={() => touch('firstName')} error={show('firstName')} required autoFocus />
          <Input label={t('customer-auth.lastName')} autoComplete="family-name" placeholder="e.g. Jonas" value={f.lastName} onChange={(e) => set('lastName', e.target.value)} onBlur={() => touch('lastName')} error={show('lastName')} required />
        </div>
        <Input label={t('customer-auth.email')} type="email" inputMode="email" autoComplete="email" icon="message" placeholder="e.g. merry@example.com" value={f.email} onChange={(e) => set('email', e.target.value)} onBlur={() => touch('email')} error={show('email')} required />
        <Input label={t('customer-auth.mobile')} type="tel" inputMode="tel" autoComplete="tel" icon="phone" placeholder="e.g. (818) 555-0123" hint="For check-in updates and pickup texts." value={f.phone} onChange={(e) => set('phone', e.target.value)} onBlur={() => touch('phone')} error={show('phone')} />
        <Select label={t('customer-auth.homeLocation')} value={f.homeLocationId} onChange={(e) => set('homeLocationId', e.target.value)} onBlur={() => touch('homeLocationId')} error={show('homeLocationId')} options={locations.map((l) => ({ value: l.id, label: `${l.name} · ${l.city}` }))} required />
        <PasswordField label={t('customer-auth.password')} value={f.password} onChange={(v) => set('password', v)} onBlur={() => touch('password')} error={show('password')} showStrength minLength={policy.passwordMinLength} autoComplete="new-password" placeholder={`At least ${policy.passwordMinLength} characters`} required />
        <div className="cauth-checks">
          <Checkbox checked={f.terms} onChange={(e) => { set('terms', e.target.checked); touch('terms'); }} label={<>I agree to the <Link to="/site">Terms of Service</Link> and <Link to="/site">Privacy Policy</Link></>} description={show('terms') ? <span className="tone-danger">{errors.terms}</span> : undefined} required />
          <Checkbox checked={f.marketing} onChange={(e) => set('marketing', e.target.checked)} label={t('customer-auth.marketing')} />
        </div>
        <Button type="submit" block size="lg" loading={busy}>{t('customer-auth.createAccount')}</Button>
      </form>
      <div className="cauth-footer"><p><span>{t('customer-auth.haveAccount')}</span><Link to="/auth/sign-in"><strong>{t('customer-auth.signIn')}</strong></Link></p></div>
    </div>
  );
}
