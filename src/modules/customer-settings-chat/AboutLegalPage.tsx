import { useTable } from '../../data/DataContext';
import type { LocationRow } from '../../data/schema/core';
import type { LegalDocumentRow } from '../../data/schema/customer-settings-chat';
import { company } from '../../tenant/locations';
import { CustomerScreenHeader } from '../../components/molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Card } from '../../components/molecule/Card/Card';
import { AccountMenuRow } from '../../components/molecule/AccountMenuRow/AccountMenuRow';
import { Badge } from '../../components/atom/Badge/Badge';
import { useCustomerAccount, k } from './useCustomerAccount';
import './customer-settings-chat.css';

const hoursToday = (l: LocationRow) => { const d = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3); const h = l.hours?.[d]; return h ? `${h.open} – ${h.close}` : 'Closed today'; };

/** C-78 About & legal: app version, legal documents (C-79), locations with hours, rate / delete links. */
export function AboutLegalPage() {
  const { t } = useCustomerAccount();
  const { rows: docs } = useTable<LegalDocumentRow>('legal_documents', { where: { published: true } });
  const { rows: locations } = useTable<LocationRow>('locations', { where: { active: true }, orderBy: { column: 'sort_order' } });
  const byKind = (kind: string) => docs.find((d) => d.kind === kind);
  return (
    <div className="csc-screen">
      <CustomerScreenHeader title={t(k('about.title'))} backTo="/app/profile" />
      <div className="csc-body">
        <div className="csc-appmark">
          <img src="./brand/petrock-mark.svg" alt="" />
          <h2>{company.name}</h2>
          <p className="small muted">{company.tagline}</p>
          <Badge tone="primary" size="sm">{t(k('about.version'), { v: __APP_VERSION__ })}</Badge>
        </div>
        <Card padding="none">
          <AccountMenuRow icon="shield" label={t(k('about.privacy'))} value={byKind('privacy') ? `v${byKind('privacy')!.version}` : undefined} to={`/app/legal/${byKind('privacy')?.slug ?? 'privacy-policy'}`} />
          <AccountMenuRow icon="book" label={t(k('about.terms'))} value={byKind('terms') ? `v${byKind('terms')!.version}` : undefined} to={`/app/legal/${byKind('terms')?.slug ?? 'terms-of-service'}`} />
          <AccountMenuRow icon="code" label={t(k('about.licenses'))} to={`/app/legal/${byKind('licenses')?.slug ?? 'open-source-licenses'}`} />
        </Card>
        <div className="csc-group">
          <p className="eyebrow csc-group-title">{t(k('about.locations'))}</p>
          <Card padding="none">
            {locations.map((l) => (
              <AccountMenuRow key={l.id} icon="location" label={l.name} description={<span className="csc-loc"><span>{l.address}</span><span>Today {hoursToday(l)}{l.phone ? ` · ${l.phone}` : ''}</span></span>} onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(l.address)}`, '_blank', 'noopener')} />
            ))}
          </Card>
        </div>
        <Card padding="none">
          <AccountMenuRow icon="star" label={t(k('profile.rate'))} tone="accent" to="/app/rate" />
          <AccountMenuRow icon="trash" label={t(k('settings.delete'))} tone="danger" to="/app/settings/delete-account" />
        </Card>
        <p className="csc-version">© {new Date().getFullYear()} {company.legalName} · {company.website.replace('https://', '')}</p>
      </div>
    </div>
  );
}
