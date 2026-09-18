import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import type { PetVaccineSummary } from '../../../modules/frontdesk-reservations/lib/vaccines';
import { vaccineTone } from '../../../modules/frontdesk-reservations/lib/vaccines';
import './PetVaccineStatus.css';

export interface PetVaccineStatusProps { summary: PetVaccineSummary; petName?: string; compact?: boolean }

const LABEL: Record<PetVaccineSummary['state'], string> = { verified: 'Vaccines verified', submitted: 'Proof submitted', expired: 'Vaccine expired', missing: 'Vaccine missing' };

/** Per-pet vaccine state for the desk (R-A05, R-X04): one badge (compact) or the badge plus chips naming each problem vaccine. */
export function PetVaccineStatus({ summary, petName, compact = false }: PetVaccineStatusProps) {
  const tone = vaccineTone(summary.state);
  const detail = [...summary.expired.map((v) => `${v} expired`), ...summary.missing.map((v) => `${v} missing`), ...summary.submitted.map((v) => `${v} awaiting verification`), ...summary.soon.map((v) => `${v} expires within 30 days`)].join(', ');
  if (compact) return <Badge tone={tone} size="sm" title={`${petName ? petName + ': ' : ''}${detail || 'all required vaccines verified'}`}><Icon name={summary.ok ? 'shield' : 'warning'} size={12} />{summary.ok ? 'OK' : summary.state}</Badge>;
  return (
    <div className="petvacc">
      <Badge tone={tone}><Icon name={summary.ok ? 'shield' : 'warning'} size={13} />{LABEL[summary.state]}</Badge>
      <div className="petvacc-chips">
        {summary.expired.map((v) => <span key={`e${v}`} className="petvacc-chip is-danger">{v} · expired</span>)}
        {summary.missing.map((v) => <span key={`m${v}`} className="petvacc-chip is-danger">{v} · missing</span>)}
        {summary.submitted.map((v) => <span key={`s${v}`} className="petvacc-chip is-warn">{v} · submitted</span>)}
        {summary.soon.map((v) => <span key={`n${v}`} className="petvacc-chip is-warn">{v} · expires soon</span>)}
        {summary.verified.filter((v) => !summary.soon.includes(v)).map((v) => <span key={`v${v}`} className="petvacc-chip">{v}</span>)}
      </div>
    </div>
  );
}
