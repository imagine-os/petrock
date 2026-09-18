import { useState } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../../atom/Button/Button';
import { Input } from '../../atom/Input/Input';
import { Badge } from '../../atom/Badge/Badge';
import { PetDocumentUpload, type UploadedDocument } from '../../molecule/PetDocumentUpload/PetDocumentUpload';
import './VaccineRecordForm.css';

/** What the customer fills for one vaccine; the page turns it into a vaccine_records row (status submitted). */
export interface VaccineRecordDraft { vaccinatedOn: string; expiresOn: string; proof: UploadedDocument | null }
export interface VaccineRecordFormProps {
  open: boolean;
  onClose: () => void;
  petName: string;
  vaccineName: string;
  required: boolean;
  initial?: Partial<VaccineRecordDraft> | null;
  /** Default validity in months when no expiry is typed (Rabies is often 12 or 36). */
  defaultMonths?: number;
  onSave: (draft: VaccineRecordDraft) => void | Promise<void>;
  onRemove?: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const isoToday = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const addMonthsIso = (iso: string, months: number) => { const d = new Date(iso + 'T00:00:00'); d.setMonth(d.getMonth() + months); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

/**
 * Modal form for one vaccine record: date given, expiry (prefilled + default validity), proof upload (required to submit).
 * Used by the pet wizard vaccines step (C-12 / C-14) and the vaccine pages (C-20 / C-21).
 */
export function VaccineRecordForm({ open, onClose, petName, vaccineName, required, initial, defaultMonths = 12, onSave, onRemove }: VaccineRecordFormProps) {
  const [vaccinatedOn, setVaccinatedOn] = useState(initial?.vaccinatedOn ?? '');
  const [expiresOn, setExpiresOn] = useState(initial?.expiresOn ?? '');
  const [proof, setProof] = useState<UploadedDocument | null>(initial?.proof ?? null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const today = isoToday();

  const dateError = touched && !vaccinatedOn ? 'Enter the date the vaccine was given.' : vaccinatedOn && vaccinatedOn > today ? 'The date cannot be in the future.' : undefined;
  const expiryError = expiresOn && vaccinatedOn && expiresOn <= vaccinatedOn ? 'Expiry must be after the vaccination date.' : undefined;
  const proofError = touched && !proof ? 'Upload the certificate or invoice so the front desk can verify it.' : undefined;
  const valid = !!vaccinatedOn && !dateError && !expiryError && !!proof;

  const onDate = (v: string) => { setVaccinatedOn(v); if (v && (!expiresOn || !initial?.expiresOn)) setExpiresOn(addMonthsIso(v, defaultMonths)); };
  const save = async () => { setTouched(true); if (!valid) return; setBusy(true); try { await onSave({ vaccinatedOn, expiresOn: expiresOn || addMonthsIso(vaccinatedOn, defaultMonths), proof }); } finally { setBusy(false); } };

  return (
    <Modal open={open} onClose={onClose} size="sm" title={`${vaccineName}`}
      footer={<>{onRemove && <Button variant="ghost" onClick={onRemove} className="vrf-remove">Remove</Button>}<Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save} loading={busy} disabled={touched && !valid}>Save record</Button></>}>
      <div className="vrf">
        <p className="small muted vrf-intro">{petName} · <Badge size="sm" tone={required ? 'primary' : 'neutral'}>{required ? 'Required' : 'Recommended'}</Badge></p>
        <div className="vrf-dates">
          <Input label="Date given" type="date" value={vaccinatedOn} max={today} onChange={(e) => onDate(e.target.value)} onBlur={() => setTouched(true)} error={dateError} required />
          <Input label="Expires" type="date" value={expiresOn} min={vaccinatedOn || undefined} onChange={(e) => setExpiresOn(e.target.value)} error={expiryError} hint={!expiryError ? `Defaults to ${defaultMonths} months after the date given` : undefined} />
        </div>
        <PetDocumentUpload label="Certificate or invoice" value={proof} onChange={setProof} hint={proofError ?? '.jpg, .png or .pdf · the front desk verifies it before your booking is confirmed'} />
        {proofError && <p className="field-error xs">{proofError}</p>}
      </div>
    </Modal>
  );
}
