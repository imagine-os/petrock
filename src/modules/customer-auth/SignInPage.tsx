import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { ALL_SIGNED_IN, ROLE_HOME } from '../../auth/roles';
import { useData } from '../../data/DataContext';
import type { AuthCredentialRow } from '../../data/schema/customer-auth';
import { DEMO_CUSTOMER_PASSWORD } from '../../data/seed/customer-auth';
import { AuthBrandHeader } from '../../components/molecule/AuthBrandHeader/AuthBrandHeader';
import { Input } from '../../components/atom/Input/Input';
import { PasswordField } from '../../components/molecule/PasswordField/PasswordField';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { FormAlert } from '../../components/molecule/FormAlert/FormAlert';
import { OtpVerifyModal } from '../../components/organism/OtpVerifyModal/OtpVerifyModal';
import { useToast } from '../../components/molecule/Toast/Toast';
import { AUTH_ERROR_TEXT, issueCode, signIn, verifyCode } from './authService';
import { isEmail, maskEmail, normalizeEmail } from './passwordPolicy';
import { useAuthPolicy } from './useAuthPolicy';
import './customer-auth.css';

/** C-02 Sign in: email + password, remember me, forgot link, lockout, verify-on-first-sign-in modal. */
export function SignInPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const { user, role, hasRole, switchUser, signOut } = useSession();
  const { policy, isMock } = useAuthPolicy();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{ email?: string; password?: string }>({});
  const [verify, setVerify] = useState<AuthCredentialRow | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const alreadyIn = hasRole(ALL_SIGNED_IN) && user.id !== 'usr_public';

  const finish = (cred: AuthCredentialRow) => {
    switchUser(cred.user_id);
    toast({ tone: 'success', title: t('customer-auth.welcomeBack'), body: cred.email });
    nav(ROLE_HOME.customer);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const fe: typeof fieldErr = {};
    if (!isEmail(email)) fe.email = 'Enter a valid email address.';
    if (!password) fe.password = 'Enter your password.';
    setFieldErr(fe);
    if (Object.keys(fe).length) return;
    setBusy(true); setError(null);
    const r = await signIn(data, email, password, remember);
    setBusy(false);
    if (!r.ok) {
      if (r.error === 'locked') { nav(`/auth/locked?email=${encodeURIComponent(normalizeEmail(email))}`); return; }
      setError(AUTH_ERROR_TEXT[r.error]); return;
    }
    if (!r.value.emailVerified) {
      const code = await issueCode(data, { email: r.value.credential.email, purpose: 'verify_email', userId: r.value.credential.user_id, pageCode: 'C-02' });
      setDemoCode(code.code); setVerify(r.value.credential); return;
    }
    finish(r.value.credential);
  };

  if (alreadyIn) {
    return (
      <div className="cauth">
        <AuthBrandHeader title={t('customer-auth.welcomeBack')} subtitle={user.name} backTo="/auth" />
        <div className="cauth-actions">
          <Button block size="lg" onClick={() => nav(ROLE_HOME[role])}>{t('customer-auth.continueAs', { name: user.name.split(' ')[0] })}</Button>
          <Button block variant="secondary" onClick={() => signOut()}>Use another account</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cauth">
      <AuthBrandHeader title={t('customer-auth.welcomeBack')} subtitle={t('customer-auth.signInSubtitle')} backTo="/auth" backLabel={t('customer-auth.back')} />
      <form className="cauth-form" onSubmit={submit} noValidate>
        {error && <FormAlert tone="danger" title={error} action={<Link to={`/auth/forgot?email=${encodeURIComponent(email)}`}>{t('customer-auth.forgot')}</Link>} />}
        <Input label={t('customer-auth.email')} type="email" inputMode="email" autoComplete="email" icon="message" placeholder="e.g. merry@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErr((f) => ({ ...f, email: undefined })); }} error={fieldErr.email} required autoFocus />
        <PasswordField label={t('customer-auth.password')} value={password} onChange={(v) => { setPassword(v); setFieldErr((f) => ({ ...f, password: undefined })); }} error={fieldErr.password} placeholder="Your password" autoComplete="current-password" required />
        <div className="row-between">
          <Checkbox label={t('customer-auth.rememberMe')} checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <Link to={`/auth/forgot${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="small">{t('customer-auth.forgot')}</Link>
        </div>
        <Button type="submit" block size="lg" loading={busy}>{t('customer-auth.signIn')}</Button>
      </form>
      <div className="cauth-footer"><p><span>{t('customer-auth.newTo')}</span><Link to="/auth/sign-up"><strong>{t('customer-auth.createAccount')}</strong></Link></p></div>
      {isMock && (
        <Card padding="sm" tint className="cauth-demo">
          <p><strong>{t('customer-auth.demoHint')}:</strong> <code>avery@demo.petrock.test</code> / <code>{DEMO_CUSTOMER_PASSWORD}</code> (verified) · <code>riley@demo.petrock.test</code> (email not verified yet). {policy.maxFailedAttempts} wrong passwords lock the account for {policy.lockMinutes} min.</p>
        </Card>
      )}
      <OtpVerifyModal open={!!verify} onClose={() => { if (verify) finish(verify); }} title={t('customer-auth.verifyEmail')} destination={verify ? maskEmail(verify.email) : ''} resendSeconds={policy.resendSeconds} expiresMinutes={policy.codeTtlMinutes}
        onVerify={async (code) => { if (!verify) return 'No account.'; const r = await verifyCode(data, { email: verify.email, purpose: 'verify_email', code, pageCode: 'C-02' }); return r.ok ? null : AUTH_ERROR_TEXT[r.error]; }}
        onResend={async () => { if (!verify) return; const c = await issueCode(data, { email: verify.email, purpose: 'verify_email', userId: verify.user_id, pageCode: 'C-02' }); setDemoCode(c.code); }}
        onVerified={() => { if (verify) setTimeout(() => finish(verify), 500); }}>
        {isMock && demoCode && <FormAlert tone="info">{t('customer-auth.demoHint')}: the code is <code>{demoCode}</code>. The real app emails it.</FormAlert>}
        <div className="row" style={{ justifyContent: 'center' }}><Button variant="link" size="sm" onClick={() => { if (verify) finish(verify); }}>{t('customer-auth.verifyLater')}</Button></div>
      </OtpVerifyModal>
    </div>
  );
}
