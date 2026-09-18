import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useTable } from '../../data/DataContext';
import type { LocationRow } from '../../data/schema/core';
import type { AuthCredentialRow } from '../../data/schema/customer-auth';
import { AuthBrandHeader } from '../../components/molecule/AuthBrandHeader/AuthBrandHeader';
import { useCountdown } from '../../components/molecule/OtpVerifyPanel/OtpVerifyPanel';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Icon } from '../../components/atom/Icon/Icon';
import { FormAlert } from '../../components/molecule/FormAlert/FormAlert';
import { normalizeEmail } from './passwordPolicy';
import { useAuthPolicy } from './useAuthPolicy';
import './customer-auth.css';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** C-07 Account locked: countdown until sign-in reopens, reset password, call the front desk. */
export function LockedPage() {
  const t = useT();
  const nav = useNavigate();
  const [q] = useSearchParams();
  const email = normalizeEmail(q.get('email') ?? '');
  const { policy } = useAuthPolicy();
  const { rows: creds } = useTable<AuthCredentialRow>('auth_credentials', { where: { email } });
  const { rows: locations } = useTable<LocationRow>('locations', { where: { active: true } });
  const until = creds[0]?.locked_until ? new Date(creds[0].locked_until).getTime() : null;
  const left = useCountdown(until);
  const locked = left > 0;

  return (
    <div className="cauth">
      <AuthBrandHeader backTo="/auth/sign-in" backLabel={t('customer-auth.back')} />
      <div className="cauth-center">
        <div className="cauth-mark cauth-mark-lock"><Icon name="lock" size={36} /></div>
        <h1>{t('customer-auth.lockedTitle')}</h1>
        <p>{t('customer-auth.lockedBody')}</p>
        {locked ? <><div className="eyebrow">{t('customer-auth.tryAgainIn')}</div><div className="cauth-countdown" aria-live="polite">{mmss(left)}</div></>
          : <FormAlert tone="success" title="Sign-in is open again.">{email ? `Try signing in as ${email}.` : 'Go back and try again.'}</FormAlert>}
      </div>
      <div className="cauth-actions">
        <Button block size="lg" icon="key" onClick={() => nav(`/auth/forgot${email ? `?email=${encodeURIComponent(email)}` : ''}`)}>{t('customer-auth.resetPassword')}</Button>
        <Button block variant="secondary" disabled={locked} onClick={() => nav('/auth/sign-in')}>{locked ? `${t('customer-auth.tryAgain')} in ${mmss(left)}` : t('customer-auth.tryAgain')}</Button>
      </div>
      <Card padding="md" header={<h3><Icon name="phone" size={16} /> {t('customer-auth.contactDesk')}</h3>}>
        <div className="cauth-phones">
          {locations.map((l) => <div key={l.id} className="cauth-phone"><span>{l.name} · {l.city}</span>{l.phone ? <a href={`tel:${l.phone.replace(/[^\d+]/g, '')}`}>{l.phone}</a> : <span className="faint">-</span>}</div>)}
        </div>
        <p className="xs faint" style={{ marginTop: 'var(--sp-3)' }}>Locks last {policy.lockMinutes} minutes after {policy.maxFailedAttempts} wrong passwords. Help and account options live in Settings once you are signed in.</p>
      </Card>
      <div className="cauth-footer"><p><Link to="/auth">{t('customer-auth.back')} to start</Link></p></div>
    </div>
  );
}
