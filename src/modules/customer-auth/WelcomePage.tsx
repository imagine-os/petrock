import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { ALL_SIGNED_IN, ROLE_HOME } from '../../auth/roles';
import { useTable } from '../../data/DataContext';
import type { LocationRow } from '../../data/schema/core';
import { company } from '../../tenant/locations';
import { AuthBrandHeader } from '../../components/molecule/AuthBrandHeader/AuthBrandHeader';
import { Button } from '../../components/atom/Button/Button';
import { Chip } from '../../components/atom/Chip/Chip';
import { Icon } from '../../components/atom/Icon/Icon';
import { OnboardingIntroModal } from '../../components/organism/OnboardingIntroModal/OnboardingIntroModal';
import './customer-auth.css';

export const INTRO_SEEN_KEY = 'petrock.auth.introSeen';

/** C-01 Welcome: brand, promise, Create account / Sign in; first-visit intro carousel. */
export function WelcomePage() {
  const t = useT();
  const nav = useNavigate();
  const { user, hasRole, role } = useSession();
  const { rows: locations } = useTable<LocationRow>('locations', { where: { active: true } });
  const signedIn = hasRole(ALL_SIGNED_IN) && user.id !== 'usr_public';
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    let seen = true;
    try { seen = localStorage.getItem(INTRO_SEEN_KEY) === '1'; } catch { /* ignore */ }
    if (seen || signedIn) return;
    const id = window.setTimeout(() => setIntro(true), 700);
    return () => window.clearTimeout(id);
  }, [signedIn]);
  const closeIntro = () => { setIntro(false); try { localStorage.setItem(INTRO_SEEN_KEY, '1'); } catch { /* ignore */ } };

  return (
    <div className="cauth cauth-welcome">
      <AuthBrandHeader variant="hero" title={company.tagline} subtitle="Dog hotel, Grooming & Spa and Daycare in Los Angeles" />
      <div className="cauth-services" aria-label="Services">
        <Chip icon="bed" size="sm">Hotel</Chip><Chip icon="scissors" size="sm">Grooming & Spa</Chip><Chip icon="sun" size="sm">Daycare</Chip>
      </div>
      <div className="cauth-spacer" />
      <div className="cauth-cta">
        {signedIn ? (
          <>
            <div className="cauth-cta-title">{t('customer-auth.welcomeBack')}</div>
            <Button block size="lg" onClick={() => nav(ROLE_HOME[role])}>{t('customer-auth.continueAs', { name: user.name.split(' ')[0] })}</Button>
            <p className="muted small"><Link to="/auth/sign-out">{t('customer-auth.signOut')}</Link></p>
          </>
        ) : (
          <>
            <div className="cauth-cta-title">{t('customer-auth.newTo')}</div>
            <Button block size="lg" onClick={() => nav('/auth/sign-up')}>{t('customer-auth.createAccount')}</Button>
            <div className="cauth-footer"><p><span>{t('customer-auth.haveAccount')}</span><Link to="/auth/sign-in"><strong>{t('customer-auth.signIn')}</strong></Link></p></div>
          </>
        )}
      </div>
      <div className="cauth-footer">
        <div className="cauth-locations"><Icon name="location" size={14} />{locations.map((l, i) => <span key={l.id}>{i > 0 && ' · '}{l.short_name}</span>)}</div>
        <div className="row wrap" style={{ justifyContent: 'center' }}>
          <Button variant="link" size="sm" icon="sparkle" onClick={() => setIntro(true)}>{t('customer-auth.howItWorks')}</Button>
          <Link to="/staff/pin"><Button variant="link" size="sm" icon="key">{t('customer-auth.staffSignIn')}</Button></Link>
        </div>
      </div>
      <OnboardingIntroModal open={intro} onClose={closeIntro} onDone={() => nav('/auth/sign-up')} doneLabel={t('customer-auth.createAccount')} />
    </div>
  );
}
