import { Link, useSearchParams } from 'react-router-dom';
import { useSession } from '../../auth/SessionProvider';
import { ROLE_LABEL } from '../../auth/roles';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { Button } from '../../components/atom/Button/Button';

export function NoAccessPage() {
  const [sp] = useSearchParams();
  const { role } = useSession();
  const from = sp.get('from') ?? '/';
  return (
    <div className="container page" style={{ maxWidth: 560 }}>
      <EmptyState icon="lock" title="This page is not available to your role" body={<>You are <strong>{ROLE_LABEL[role]}</strong>; <code>{from}</code> needs a different role. Switch the demo user in the hub or sign in with a staff PIN.</>}
        action={<div className="row wrap"><Link to="/"><Button icon="arrow-left">Testing hub</Button></Link><Link to="/staff/pin"><Button variant="secondary" icon="key">PIN login</Button></Link></div>} />
    </div>
  );
}
