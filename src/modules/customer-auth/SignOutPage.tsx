import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { ALL_SIGNED_IN, ROLE_LABEL } from '../../auth/roles';
import { useData } from '../../data/DataContext';
import { AuthBrandHeader } from '../../components/molecule/AuthBrandHeader/AuthBrandHeader';
import { Card } from '../../components/molecule/Card/Card';
import { Avatar } from '../../components/atom/Avatar/Avatar';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { signOutEvent } from './authService';
import './customer-auth.css';

/** C-09 Sign out: confirm, log, clear the session. */
export function SignOutPage() {
  const t = useT();
  const nav = useNavigate();
  const data = useData();
  const { user, role, hasRole, signOut } = useSession();
  const signedIn = hasRole(ALL_SIGNED_IN) && user.id !== 'usr_public';
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const go = async () => {
    setBusy(true);
    await signOutEvent(data, user.id, user.email || null);
    try { localStorage.removeItem('petrock.auth.remember'); } catch { /* ignore */ }
    signOut();
    setBusy(false); setDone(true);
  };

  if (done || !signedIn) {
    return (
      <div className="cauth">
        <AuthBrandHeader />
        <div className="cauth-spacer" />
        <div className="cauth-center">
          <div className="cauth-mark cauth-mark-success"><Icon name="check" size={36} strokeWidth={2.5} /></div>
          <h1>{t('customer-auth.signedOut')}</h1>
          <p>{t('customer-auth.signOutBody')}</p>
        </div>
        <div className="cauth-actions">
          <Button block size="lg" onClick={() => nav('/auth/sign-in')}>{t('customer-auth.signIn')}</Button>
          <Button block variant="secondary" onClick={() => nav('/auth/sign-up')}>{t('customer-auth.createAccount')}</Button>
        </div>
        <div className="cauth-footer"><p><Link to="/">Testing hub</Link></p></div>
        <div className="cauth-spacer" />
      </div>
    );
  }
  return (
    <div className="cauth">
      <AuthBrandHeader title={t('customer-auth.signOutTitle')} subtitle={t('customer-auth.signOutBody')} backTo="/auth" backLabel={t('customer-auth.back')} />
      <Card padding="md">
        <div className="cauth-user"><Avatar name={user.name} size={44} /><div className="cauth-user-text"><strong>{user.name}</strong><span className="muted small">{user.email || ROLE_LABEL[role]}</span></div></div>
      </Card>
      <div className="cauth-actions">
        <Button block size="lg" variant="danger" icon="logout" loading={busy} onClick={go}>{t('customer-auth.signOut')}</Button>
        <Button block variant="ghost" onClick={() => nav(-1)}>{t('customer-auth.back')}</Button>
      </div>
    </div>
  );
}
