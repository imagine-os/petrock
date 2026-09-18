import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { ALL_SIGNED_IN, ROLE_HOME } from '../../auth/roles';
import { useTable } from '../../data/DataContext';
import type { CustomerRow, LocationRow } from '../../data/schema/core';
import type { AuthCredentialRow } from '../../data/schema/customer-auth';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Badge } from '../../components/atom/Badge/Badge';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { OnboardingIntroModal } from '../../components/organism/OnboardingIntroModal/OnboardingIntroModal';
import { FormAlert } from '../../components/molecule/FormAlert/FormAlert';
import './customer-auth.css';

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'paw', title: 'Add your dogs', body: 'Name, breed, weight, food and meds. Takes two minutes per dog.' },
  { icon: 'shield', title: 'Upload vaccine records', body: 'Rabies, DHPP and Bordetella are required; we verify them before the first stay.' },
  { icon: 'calendar', title: 'Book a stay, a spa day or daycare', body: 'See the price up front, pay a deposit or in full.' },
];

/** C-08 Account created: greet, three next steps, into the app. */
export function AccountCreatedPage() {
  const t = useT();
  const nav = useNavigate();
  const { user, hasRole } = useSession();
  const signedIn = hasRole(ALL_SIGNED_IN) && user.id !== 'usr_public';
  const { rows: customers } = useTable<CustomerRow>('customers', { where: { user_id: user.id } });
  const { rows: creds } = useTable<AuthCredentialRow>('auth_credentials', { where: { user_id: user.id } });
  const { rows: locations } = useTable<LocationRow>('locations');
  const [intro, setIntro] = useState(false);
  const first = customers[0]?.first_name ?? user.name.split(' ')[0];
  const home = locations.find((l) => l.id === customers[0]?.home_location_id);

  if (!signedIn) {
    return (
      <div className="cauth">
        <FormAlert tone="warn" title="You're not signed in." action={<Link to="/auth">Go to the start</Link>}>Create an account or sign in to see this screen.</FormAlert>
      </div>
    );
  }
  return (
    <div className="cauth">
      <div className="cauth-spacer" />
      <div className="cauth-center">
        <div className="cauth-mark cauth-mark-success"><Icon name="check" size={40} strokeWidth={2.5} /></div>
        <h1>{t('customer-auth.welcomeTitle', { name: first })}</h1>
        <p>{t('customer-auth.welcomeBody')}</p>
        <div className="row wrap" style={{ justifyContent: 'center' }}>
          {creds[0]?.email_verified ? <Badge tone="success" dot>Email verified</Badge> : <Badge tone="warn" dot>Email not verified</Badge>}
          {home && <Badge tone="primary">{home.short_name}</Badge>}
        </div>
      </div>
      <Card padding="md">
        <ol className="cauth-steps">
          {STEPS.map((s) => <li key={s.title} className="cauth-step"><span className="cauth-step-n"><Icon name={s.icon} size={16} /></span><div><h3>{s.title}</h3><p>{s.body}</p></div></li>)}
        </ol>
      </Card>
      <div className="cauth-actions">
        <Button block size="lg" iconRight="arrow-right" onClick={() => nav(ROLE_HOME.customer)}>{t('customer-auth.goHome')}</Button>
        <Button block variant="ghost" icon="sparkle" onClick={() => setIntro(true)}>{t('customer-auth.howItWorks')}</Button>
      </div>
      <div className="cauth-spacer" />
      <OnboardingIntroModal open={intro} onClose={() => setIntro(false)} onDone={() => nav(ROLE_HOME.customer)} doneLabel={t('customer-auth.goHome')} />
    </div>
  );
}
