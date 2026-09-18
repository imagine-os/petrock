import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { HotelBookingFrame } from '../../components/template/HotelBookingFrame/HotelBookingFrame';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { useT } from '../../i18n';
import { STEP_LABELS, STEP_PATHS, draftStage, useHotelDraft, type CustomerDetailsDraft } from './draft';
import { US_STATES, useCustomerAccount } from './lib';
import './customer-hotel.css';

const EMPTY: CustomerDetailsDraft = { first_name: '', last_name: '', mobile: '', alt_phone: '', email: '', address: '', apt_suite: '', city: '', state: 'CA', zip: '' };
type Errs = Partial<Record<keyof CustomerDetailsDraft, string>>;
function validate(v: CustomerDetailsDraft): Errs {
  const e: Errs = {};
  if (!v.first_name.trim()) e.first_name = 'Required'; if (!v.last_name.trim()) e.last_name = 'Required';
  if (v.mobile.replace(/\D/g, '').length < 10) e.mobile = 'Enter a 10-digit phone';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) e.email = 'Enter a valid email';
  if (!v.address.trim()) e.address = 'Required'; if (!v.city.trim()) e.city = 'Required'; if (!v.state) e.state = 'Required';
  if (!/^\d{5}(-\d{4})?$/.test(v.zip.trim())) e.zip = '5-digit ZIP';
  return e;
}

/** C-34 · Hotel: customer details (Figma Customer / Billing Details) - one form for contact and billing. */
export function CustomerDetailsPage() {
  const t = useT();
  const nav = useNavigate();
  const { draft, patch } = useHotelDraft();
  const { customer } = useCustomerAccount();
  const [v, setV] = useState<CustomerDetailsDraft>(draft.customer ?? EMPTY);
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (!draft.customer && customer) { const c = customer as unknown as Record<string, string | null>; setV({ first_name: c.first_name ?? '', last_name: c.last_name ?? '', mobile: c.mobile ?? '', alt_phone: c.alt_phone ?? '', email: c.email ?? '', address: c.address ?? '', apt_suite: c.apt_suite ?? '', city: c.city ?? '', state: c.state ?? 'CA', zip: c.zip ?? '' }); } }, [customer, draft.customer]);
  if (draftStage(draft) < 4) return <Navigate to={STEP_PATHS[draftStage(draft)]} replace />;
  const errs = touched ? validate(v) : {};
  const set = (k: keyof CustomerDetailsDraft) => (val: string) => setV((x) => ({ ...x, [k]: val }));
  const submit = () => { setTouched(true); if (Object.keys(validate(v)).length) return; patch({ customer: v }); nav(STEP_PATHS[5]); };

  return (
    <HotelBookingFrame title={t('customer-hotel.customer')} backTo={STEP_PATHS[3]} steps={STEP_LABELS} step={4} onStepClick={(i) => nav(STEP_PATHS[i])}
      footer={<Button size="lg" block onClick={submit}>{t('customer-hotel.next')}</Button>} footerNote="Used for your booking confirmation and invoice.">
      <div className="ch-cols-2"><Input label="First name" required autoComplete="given-name" value={v.first_name} onChange={(e) => set('first_name')(e.target.value)} error={errs.first_name} /><Input label="Last name" required autoComplete="family-name" value={v.last_name} onChange={(e) => set('last_name')(e.target.value)} error={errs.last_name} /></div>
      <div className="ch-cols-2"><Input label="Mobile" required type="tel" autoComplete="tel" value={v.mobile} onChange={(e) => set('mobile')(e.target.value)} error={errs.mobile} icon="phone" /><Input label="Alt phone" type="tel" value={v.alt_phone} onChange={(e) => set('alt_phone')(e.target.value)} /></div>
      <Input label="Email" required type="email" autoComplete="email" value={v.email} onChange={(e) => set('email')(e.target.value)} error={errs.email} />
      <Input label="Address" required autoComplete="address-line1" value={v.address} onChange={(e) => set('address')(e.target.value)} error={errs.address} />
      <div className="ch-cols-2"><Input label="Apt / Suite" autoComplete="address-line2" value={v.apt_suite} onChange={(e) => set('apt_suite')(e.target.value)} /><Input label="City" required autoComplete="address-level2" value={v.city} onChange={(e) => set('city')(e.target.value)} error={errs.city} /></div>
      <div className="ch-cols-2"><Select label="State" required value={v.state} onChange={(e) => set('state')(e.target.value)} options={US_STATES.map((s) => ({ value: s, label: s }))} error={errs.state} /><Input label="ZIP" required inputMode="numeric" autoComplete="postal-code" value={v.zip} onChange={(e) => set('zip')(e.target.value)} error={errs.zip} /></div>
      <p className="xs faint">Billing uses the same address (one form instead of Customer + Billing Details).</p>
    </HotelBookingFrame>
  );
}
