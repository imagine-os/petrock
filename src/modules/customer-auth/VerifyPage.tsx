import { useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useData, useTable } from '../../data/DataContext';
import type { AuthCodePurpose, AuthCodeRow } from '../../data/schema/customer-auth';
import { AuthBrandHeader } from '../../components/molecule/AuthBrandHeader/AuthBrandHeader';
import { OtpVerifyPanel } from '../../components/molecule/OtpVerifyPanel/OtpVerifyPanel';
import { FormAlert } from '../../components/molecule/FormAlert/FormAlert';
import { Button } from '../../components/atom/Button/Button';
import { AUTH_ERROR_TEXT, findCredential, issueCode, verifyCode } from './authService';
import { maskEmail, normalizeEmail } from './passwordPolicy';
import { useAuthPolicy } from './useAuthPolicy';
import './customer-auth.css';

/** C-04 Verify code: after sign-up (or a deep link) the customer enters the emailed 6-digit code. */
export function VerifyPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const { switchUser } = useSession();
  const { policy, isMock } = useAuthPolicy();
  const [q] = useSearchParams();
  const email = normalizeEmail(q.get('email') ?? '');
  const purpose = (q.get('purpose') === 'sign_in' ? 'sign_in' : 'verify_email') as AuthCodePurpose;
  const next = q.get('next') || '/auth/welcome';
  const { rows: live } = useTable<AuthCodeRow>('auth_codes', { where: { email, purpose, consumed_at: null }, orderBy: { column: 'created_at', dir: 'desc' } });
  const demoCode = isMock ? live[0]?.code : undefined;

  const onVerify = useCallback(async (code: string) => {
    const r = await verifyCode(data, { email, purpose, code, pageCode: 'C-04' });
    return r.ok ? null : AUTH_ERROR_TEXT[r.error];
  }, [data, email, purpose]);
  const onResend = useCallback(async () => { const cred = await findCredential(data, email); await issueCode(data, { email, purpose, userId: cred?.user_id ?? null, pageCode: 'C-04' }); }, [data, email, purpose]);
  const onVerified = useCallback(async () => {
    const cred = await findCredential(data, email);
    if (cred) switchUser(cred.user_id);
    setTimeout(() => nav(next), 500);
  }, [data, email, next, nav, switchUser]);

  if (!email) {
    return (
      <div className="cauth">
        <AuthBrandHeader title={t('customer-auth.verifyTitle')} backTo="/auth" />
        <FormAlert tone="warn" title="We don't know which email to verify." action={<Link to="/auth/sign-up">{t('customer-auth.createAccount')}</Link>}>Start from Create account or Sign in and we will send you a code.</FormAlert>
      </div>
    );
  }
  return (
    <div className="cauth">
      <AuthBrandHeader title={t('customer-auth.verifyTitle')} subtitle={t('customer-auth.verifyEmail')} backTo={purpose === 'verify_email' ? '/auth/sign-up' : '/auth/sign-in'} backLabel={t('customer-auth.back')} />
      <OtpVerifyPanel destination={maskEmail(email)} onVerify={onVerify} onResend={onResend} onVerified={onVerified} length={policy.codeLength} resendSeconds={policy.resendSeconds} expiresMinutes={policy.codeTtlMinutes}>
        {demoCode && <FormAlert tone="info">{t('customer-auth.demoHint')}: the code is <code>{demoCode}</code>. The real app emails it; codes expire after {policy.codeTtlMinutes} minutes and {policy.maxCodeAttempts} wrong tries.</FormAlert>}
      </OtpVerifyPanel>
      <div className="cauth-footer"><p><span>Wrong email?</span><Link to="/auth/sign-up"><strong>Start over</strong></Link></p><Link to="/auth/sign-in"><Button variant="link" size="sm">{t('customer-auth.verifyLater')} · {t('customer-auth.signIn')}</Button></Link></div>
    </div>
  );
}
