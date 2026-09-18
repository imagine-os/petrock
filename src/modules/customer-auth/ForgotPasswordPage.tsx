import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useData } from '../../data/DataContext';
import { AuthBrandHeader } from '../../components/molecule/AuthBrandHeader/AuthBrandHeader';
import { Input } from '../../components/atom/Input/Input';
import { Button } from '../../components/atom/Button/Button';
import { FormAlert } from '../../components/molecule/FormAlert/FormAlert';
import { requestPasswordReset } from './authService';
import { isEmail, maskEmail, normalizeEmail } from './passwordPolicy';
import { useAuthPolicy } from './useAuthPolicy';
import './customer-auth.css';

/** C-05 Forgot password: email -> code (never reveals whether the account exists, R-X34). */
export function ForgotPasswordPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const { isMock, policy } = useAuthPolicy();
  const [q] = useSearchParams();
  const [email, setEmail] = useState(q.get('email') ?? '');
  const [err, setErr] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ email: string; demoCode: string | null } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) { setErr('Enter a valid email address.'); return; }
    setBusy(true);
    const r = await requestPasswordReset(data, email);
    setBusy(false);
    setSent({ email: normalizeEmail(email), demoCode: r.code?.code ?? null });
  };

  return (
    <div className="cauth">
      <AuthBrandHeader title={t('customer-auth.forgotTitle')} subtitle={t('customer-auth.forgotBody')} backTo="/auth/sign-in" backLabel={t('customer-auth.back')} />
      {sent ? (
        <div className="cauth-form">
          <FormAlert tone="success" title={`If an account exists for ${maskEmail(sent.email)}, a ${policy.codeLength}-digit code is on its way.`}>Check your inbox (and spam). The code works for {policy.codeTtlMinutes} minutes.</FormAlert>
          {isMock && <FormAlert tone="info">{t('customer-auth.demoHint')}: {sent.demoCode ? <>the code is <code>{sent.demoCode}</code>.</> : <>no account has this email, so no code was issued (the message above stays the same on purpose).</>}</FormAlert>}
          <Button block size="lg" onClick={() => nav(`/auth/reset?email=${encodeURIComponent(sent.email)}`)} iconRight="arrow-right">Enter the code</Button>
          <Button block variant="ghost" onClick={() => setSent(null)}>Use a different email</Button>
        </div>
      ) : (
        <form className="cauth-form" onSubmit={submit} noValidate>
          <Input label={t('customer-auth.email')} type="email" inputMode="email" autoComplete="email" icon="message" placeholder="e.g. merry@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setErr(undefined); }} error={err} required autoFocus />
          <Button type="submit" block size="lg" loading={busy}>{t('customer-auth.sendCode')}</Button>
        </form>
      )}
      <div className="cauth-footer"><p><Link to="/auth/sign-in">{t('customer-auth.back')} to {t('customer-auth.signIn').toLowerCase()}</Link></p></div>
    </div>
  );
}
