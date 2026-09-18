import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useData, useTable } from '../../data/DataContext';
import type { AuthCodeRow } from '../../data/schema/customer-auth';
import { AuthBrandHeader } from '../../components/molecule/AuthBrandHeader/AuthBrandHeader';
import { Input } from '../../components/atom/Input/Input';
import { OtpCodeInput } from '../../components/molecule/OtpCodeInput/OtpCodeInput';
import { useCountdown } from '../../components/molecule/OtpVerifyPanel/OtpVerifyPanel';
import { PasswordField } from '../../components/molecule/PasswordField/PasswordField';
import { Button } from '../../components/atom/Button/Button';
import { FormAlert } from '../../components/molecule/FormAlert/FormAlert';
import { useToast } from '../../components/molecule/Toast/Toast';
import { AUTH_ERROR_TEXT, requestPasswordReset, resetPassword } from './authService';
import { checkPassword, isEmail, normalizeEmail } from './passwordPolicy';
import { useAuthPolicy } from './useAuthPolicy';
import './customer-auth.css';

/** C-06 Reset password: code + new password; clears any lockout. */
export function ResetPasswordPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { policy, isMock } = useAuthPolicy();
  const [q] = useSearchParams();
  const [email, setEmail] = useState(q.get('email') ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [errs, setErrs] = useState<{ email?: string; password?: string }>({});
  const [resendAt, setResendAt] = useState<number | null>(Date.now() + policy.resendSeconds * 1000);
  const left = useCountdown(resendAt);
  const norm = normalizeEmail(email);
  const { rows: live } = useTable<AuthCodeRow>('auth_codes', { where: { email: norm, purpose: 'reset_password', consumed_at: null }, orderBy: { column: 'created_at', dir: 'desc' } });
  const demoCode = isMock ? live[0]?.code : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const fe: typeof errs = {};
    if (!isEmail(email)) fe.email = 'Enter a valid email address.';
    if (!checkPassword(password, policy.passwordMinLength).ok) fe.password = `Use at least ${policy.passwordMinLength} characters with a letter and a number.`;
    setErrs(fe);
    if (code.length < policy.codeLength) { setCodeErr(`Enter the ${policy.codeLength}-digit code.`); return; }
    if (Object.keys(fe).length) return;
    setBusy(true); setCodeErr(null);
    const r = await resetPassword(data, { email, code, password });
    setBusy(false);
    if (!r.ok) { setCodeErr(AUTH_ERROR_TEXT[r.error]); return; }
    toast({ tone: 'success', title: 'Password updated', body: 'Sign in with your new password.' });
    nav('/auth/sign-in');
  };
  const resend = async () => { if (left > 0 || !isEmail(email)) return; setCode(''); setCodeErr(null); await requestPasswordReset(data, email, 'C-06'); setResendAt(Date.now() + policy.resendSeconds * 1000); toast({ tone: 'info', title: 'New code sent', body: 'If an account exists for that email.' }); };

  return (
    <div className="cauth">
      <AuthBrandHeader title={t('customer-auth.resetTitle')} subtitle={t('customer-auth.resetBody')} backTo="/auth/forgot" backLabel={t('customer-auth.back')} />
      <form className="cauth-form" onSubmit={submit} noValidate>
        <Input label={t('customer-auth.email')} type="email" inputMode="email" autoComplete="email" icon="message" value={email} onChange={(e) => { setEmail(e.target.value); setErrs((s) => ({ ...s, email: undefined })); }} error={errs.email} required />
        <div className="stack-sm">
          <span className="field-label">Code from the email</span>
          <OtpCodeInput length={policy.codeLength} value={code} onChange={(v) => { setCode(v); setCodeErr(null); }} error={codeErr} autoFocus={!!q.get('email')} />
          <div className="row" style={{ justifyContent: 'center' }}><Button variant="link" size="sm" onClick={resend} disabled={left > 0 || !isEmail(email)}>{left > 0 ? `Resend in ${left}s` : 'Resend code'}</Button></div>
          {demoCode && <FormAlert tone="info">{t('customer-auth.demoHint')}: the code is <code>{demoCode}</code>.</FormAlert>}
        </div>
        <PasswordField label={t('customer-auth.newPassword')} value={password} onChange={(v) => { setPassword(v); setErrs((s) => ({ ...s, password: undefined })); }} error={errs.password} showStrength minLength={policy.passwordMinLength} autoComplete="new-password" placeholder={`At least ${policy.passwordMinLength} characters`} required />
        <Button type="submit" block size="lg" loading={busy}>{t('customer-auth.updatePassword')}</Button>
      </form>
      <div className="cauth-footer"><p><Link to="/auth/sign-in">{t('customer-auth.back')} to {t('customer-auth.signIn').toLowerCase()}</Link></p></div>
    </div>
  );
}
