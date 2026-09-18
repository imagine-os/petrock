import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../data/DataContext';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Input } from '../../components/atom/Input/Input';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { PasswordStrengthBar, passwordScore } from '../../components/atom/PasswordStrengthBar/PasswordStrengthBar';
import { useToast } from '../../components/molecule/Toast/Toast';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

/** C-84 Change password: current + new + repeat with strength meter; mock check, audit_log row (R-M01). */
export function ChangePasswordPage() {
  const nav = useNavigate();
  const data = useData();
  const { toast } = useToast();
  const acc = useCustomerAccount();
  const { t } = acc;
  const [cur, setCur] = useState(''); const [pw, setPw] = useState(''); const [rep, setRep] = useState('');
  const [errs, setErrs] = useState<{ cur?: string; pw?: string; rep?: string }>({});
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: typeof errs = {};
    if (cur.length < 4) er.cur = 'Enter your current password';
    if (passwordScore(pw) < 2) er.pw = 'Use at least 8 characters with a letter and a number';
    if (pw !== rep) er.rep = 'Passwords do not match';
    if (pw && pw === cur) er.pw = 'Choose a different password';
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      await data.insert('audit_log', { location_id: acc.customer?.home_location_id ?? null, user_id: acc.accountUserId, user_name: acc.displayName, action: 'password.change', table_name: 'users', row_id: acc.userRow?.id ?? null, diff: null });
      toast({ tone: 'success', title: t(k('pw.saved')), body: 'Other devices were signed out (mock).' });
      nav(-1);
    } finally { setBusy(false); }
  };
  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('pw.title'))} />
      <form className="csc-body" onSubmit={submit} noValidate>
        <Card>
          <div className="stack-sm">
            <Input label={t(k('pw.current'))} type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" icon="lock" error={errs.cur} />
            <div className="csc-link-row"><Button variant="link" size="sm" onClick={() => nav('/auth/forgot')}>Forgot password?</Button></div>
            <Input label={t(k('pw.new'))} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" icon="key" error={errs.pw} />
            <PasswordStrengthBar password={pw} />
            <Input label={t(k('pw.repeat'))} type="password" value={rep} onChange={(e) => setRep(e.target.value)} autoComplete="new-password" icon="key" error={errs.rep} />
          </div>
        </Card>
        <p className="csc-note">Changing your password signs out every other device. Staff never see your password; the front desk can only send a reset link.</p>
        <div className="csc-sticky-cta"><Button type="submit" block size="lg" loading={busy}>{t(k('pw.save'))}</Button></div>
      </form>
    </div>
  );
}
