/** A-20..A-26: pricing setup pages. Every price lives in a table; pages only edit rows (R-X44). */
import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { RoomTypeRow, SeasonRow, RateRow, DiscountRow, FeeRow, TaxRow, DaycarePricingRow, PackageRow, AddonRow, ServiceRow } from '../../data/schema/core';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Badge, toneFor } from '../../components/atom/Badge/Badge';
import { Chip } from '../../components/atom/Chip/Chip';
import { CrudTable } from './CrudTable';
import { fmtMoney, fmtDate } from './lib';
import './admin.css';

const PRICING_LINKS: [string, string, string][] = [['A-27', '/admin/pricing', 'Overview'], ['A-20', '/admin/pricing/rates', 'Room rates & seasons'], ['A-21', '/admin/pricing/discounts', 'Discounts'], ['A-22', '/admin/pricing/fees', 'Fees & taxes'], ['A-23', '/admin/pricing/daycare', 'Daycare'], ['A-24', '/admin/pricing/packages', 'Grooming packages'], ['A-25', '/admin/pricing/addons', 'Add-ons'], ['A-26', '/admin/services', 'Services']];
export function PricingNav({ current }: { current: string }) {
  return <div className="row wrap" style={{ gap: 6 }}>{PRICING_LINKS.map(([code, to, label]) => <Link key={code} to={to} style={{ textDecoration: 'none' }}><Chip size="sm" selected={code === current} tone="primary">{label}</Chip></Link>)}</div>;
}
const yesNo = (v: boolean) => (v ? <Badge size="sm" tone="success">yes</Badge> : <span className="faint">no</span>);
const activeBadge = (v: boolean) => <Badge size="sm" tone={v ? 'success' : 'neutral'}>{v ? 'active' : 'inactive'}</Badge>;

function Page({ code, title, subtitle, children }: { code: string; title: string; subtitle: ReactNode; children: ReactNode }) {
  return <div className="page stack"><PageHeader code={code} title={title} subtitle={subtitle}><PricingNav current={code} /></PageHeader>{children}</div>;
}

/** A-20 Room rates by room type, day kind and season; seasons table beside it. */
export function RatesPage() {
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: seasons } = useTable<SeasonRow>('seasons', { orderBy: { column: 'starts_on' } });
  const rt = useMemo(() => Object.fromEntries(roomTypes.map((r) => [r.id, r.name])), [roomTypes]);
  const se = useMemo(() => Object.fromEntries(seasons.map((s) => [s.id, s.name])), [seasons]);
  return (
    <Page code="A-20" title="Room rates & seasons" subtitle="Nightly rate per room type, Mon-Thu vs Fri-Sun, base or seasonal. Long-stay discounts skip holiday seasons (R-D05, R-D06, R-E15).">
      <div className="acp-two">
        <CrudTable<RateRow> table="rates" title="Room rates" description="One row per room type x day kind x season. Base = no season." permission="pricing.write" orderBy={{ column: 'room_type_id' }} rowLabel={(r) => `${rt[r.room_type_id] ?? r.room_type_id} ${r.day_kind}`}
          columns={[
            { key: 'room_type_id', label: 'Room type', render: (r) => rt[r.room_type_id] ?? r.room_type_id, value: (r) => rt[r.room_type_id] },
            { key: 'day_kind', label: 'Days', render: (r) => (r.day_kind === 'weekday' ? 'Mon-Thu' : 'Fri-Sun') },
            { key: 'season_id', label: 'Season', render: (r) => (r.season_id ? <Badge size="sm" tone="info">{se[r.season_id] ?? r.season_id}</Badge> : <span className="muted xs">Base</span>), value: (r) => (r.season_id ? se[r.season_id] : 'Base') },
            { key: 'price_per_night', label: 'Per night', align: 'right', render: (r) => <strong>{fmtMoney(r.price_per_night)}</strong> },
          ]}
          fields={[
            { key: 'room_type_id', label: 'Room type', type: 'select', required: true, options: roomTypes.map((r) => ({ value: r.id, label: r.name })) },
            { key: 'day_kind', label: 'Days', type: 'select', required: true, options: [{ value: 'weekday', label: 'Mon-Thu' }, { value: 'weekend', label: 'Fri-Sun' }] },
            { key: 'season_id', label: 'Season', type: 'select', options: seasons.map((s) => ({ value: s.id, label: s.name })), placeholder: 'Base (no season)', hint: 'Leave empty for the base rate' },
            { key: 'price_per_night', label: 'Price per night', type: 'money', required: true, min: 0 },
          ]} />
        <CrudTable<SeasonRow> table="seasons" title="Seasons" description="Date ranges with their own rates. Holiday seasons exclude long-stay discounts." permission="pricing.write" orderBy={{ column: 'starts_on' }} rowLabel={(s) => s.name}
          columns={[{ key: 'name', label: 'Season' }, { key: 'starts_on', label: 'From', render: (s) => fmtDate(s.starts_on) }, { key: 'ends_on', label: 'To', render: (s) => fmtDate(s.ends_on) }, { key: 'is_holiday', label: 'Holiday', render: (s) => yesNo(s.is_holiday) }]}
          fields={[{ key: 'name', label: 'Name', required: true, full: true }, { key: 'starts_on', label: 'Starts on', type: 'date', required: true }, { key: 'ends_on', label: 'Ends on', type: 'date', required: true, validate: (v, all) => (v && all.starts_on && String(v) < String(all.starts_on) ? 'Ends before it starts' : null) }, { key: 'is_holiday', label: 'Holiday season (no long-stay discount)', type: 'toggle', full: true }]} />
      </div>
    </Page>
  );
}

/** A-21 Discounts: multi-dog, long-stay, prepay, daycare extra pet. */
export function DiscountsPage() {
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const rt = useMemo(() => Object.fromEntries(roomTypes.map((r) => [r.id, r.name])), [roomTypes]);
  const KIND: Record<string, string> = { multi_dog: 'Multi-dog', long_stay: 'Long stay', prepay: 'Prepay', daycare_extra_pet: 'Daycare extra pet' };
  return (
    <Page code="A-21" title="Discounts" subtitle="Multi-dog (per dog per night by room type), long-stay percentages (paid in full, not on holidays) and the daycare extra-pet discount (R-E01..E08, R-F05).">
      <CrudTable<DiscountRow> table="discounts" title="Discount rules" permission="pricing.write" orderBy={{ column: 'kind' }} rowLabel={(d) => d.name} searchable
        filters={[{ key: 'kind', label: 'Kind', options: Object.entries(KIND).map(([value, label]) => ({ value, label })), test: (r, v) => r.kind === v }]}
        columns={[
          { key: 'name', label: 'Rule' },
          { key: 'kind', label: 'Kind', render: (d) => <Badge size="sm">{KIND[d.kind] ?? d.kind}</Badge> },
          { key: 'room_type_id', label: 'Room type', render: (d) => (d.room_type_id ? rt[d.room_type_id] : <span className="muted xs">Any</span>), value: (d) => (d.room_type_id ? rt[d.room_type_id] : 'Any') },
          { key: 'condition', label: 'Condition', sortable: false, render: (d) => (d.kind === 'multi_dog' ? `${d.dog_count} dogs share a room` : d.kind === 'long_stay' ? `${d.min_nights}+ nights${d.requires_paid_in_full ? ', paid in full' : ''}${d.excludes_holidays ? ', not holidays' : ''}` : d.kind === 'daycare_extra_pet' ? 'Each additional pet' : 'Prepaid') },
          { key: 'amount', label: 'Discount', align: 'right', sortable: false, render: (d) => <strong>{d.percent_off ? `${d.percent_off}%` : `${fmtMoney(d.amount_off)} ${d.kind === 'multi_dog' ? '/ dog / night' : d.kind === 'daycare_extra_pet' ? '/ pet' : ''}`}</strong> },
          { key: 'active', label: 'Status', render: (d) => activeBadge(d.active) },
        ]}
        fields={[
          { key: 'name', label: 'Name', required: true, full: true },
          { key: 'kind', label: 'Kind', type: 'select', required: true, options: Object.entries(KIND).map(([value, label]) => ({ value, label })) },
          { key: 'room_type_id', label: 'Room type', type: 'select', options: roomTypes.map((r) => ({ value: r.id, label: r.name })), placeholder: 'Any room type', when: (v) => v.kind === 'multi_dog' || v.kind === 'long_stay' },
          { key: 'dog_count', label: 'Dogs sharing', type: 'number', min: 2, max: 6, when: (v) => v.kind === 'multi_dog', required: true },
          { key: 'min_nights', label: 'Minimum nights', type: 'number', min: 1, when: (v) => v.kind === 'long_stay', required: true },
          { key: 'amount_off', label: 'Amount off', type: 'money', min: 0, hint: 'Per dog per night (multi-dog) or per pet (daycare)', when: (v) => v.kind !== 'long_stay' },
          { key: 'percent_off', label: 'Percent off', type: 'percent', min: 0, max: 100, when: (v) => v.kind === 'long_stay' || v.kind === 'prepay' },
          { key: 'requires_paid_in_full', label: 'Only when paid in full', type: 'toggle', when: (v) => v.kind === 'long_stay' },
          { key: 'excludes_holidays', label: 'Not on holiday seasons', type: 'toggle', when: (v) => v.kind === 'long_stay' },
          { key: 'active', label: 'Active', type: 'toggle' },
        ]}
        defaults={() => ({ active: true, amount_off: 0, percent_off: null, room_type_id: null, dog_count: null, min_nights: null, requires_paid_in_full: false, excludes_holidays: false } as Partial<DiscountRow>)} />
    </Page>
  );
}

/** A-22 Fees & taxes: card fee (3.89 %) and the single named tax with three rates. */
export function FeesTaxesPage() {
  return (
    <Page code="A-22" title="Fees & taxes" subtitle="Card service fee applied to card payments through the app (R-H03) and the tax model: one named tax with service / product / boarding rates, prices exclusive by default (R-H04, R-H05).">
      <div className="acp-two-even">
        <CrudTable<FeeRow> table="fees" title="Fees" permission="pricing.write" rowLabel={(f) => f.name}
          columns={[{ key: 'name', label: 'Fee' }, { key: 'percent', label: 'Percent / amount', align: 'right', render: (f) => <strong>{f.amount != null ? `${fmtMoney(f.amount)}${f.included ? ' (included)' : ''}` : `${f.percent}%`}</strong> }, { key: 'applies_to', label: 'Applies to', render: (f) => (f.applies_to === 'card_payments' ? 'Card payments' : f.applies_to === 'grooming' ? 'Grooming (inside the price)' : 'All payments') }, { key: 'active', label: 'Status', render: (f) => activeBadge(f.active) }]}
          fields={[{ key: 'name', label: 'Name', required: true, full: true }, { key: 'kind', label: 'Kind', type: 'select', required: true, options: [{ value: 'card', label: 'Card / non-cash fee' }, { value: 'other', label: 'Other surcharge' }, { value: 'grooming_sanitation', label: 'Grooming sanitation (included in price)' }] }, { key: 'percent', label: 'Percent', type: 'percent', required: true, min: 0, max: 100, step: 0.01 }, { key: 'applies_to', label: 'Applies to', type: 'select', required: true, options: [{ value: 'card_payments', label: 'Card payments only' }, { value: 'all', label: 'All payments' }] }, { key: 'active', label: 'Active', type: 'toggle' }]}
          defaults={() => ({ kind: 'card', applies_to: 'card_payments', active: true } as Partial<FeeRow>)} />
        <CrudTable<TaxRow> table="taxes" title="Taxes" permission="pricing.write" rowLabel={(t) => t.name}
          columns={[{ key: 'name', label: 'Tax' }, { key: 'service_rate', label: 'Service', align: 'right', render: (t) => `${t.service_rate}%` }, { key: 'product_rate', label: 'Product', align: 'right', render: (t) => `${t.product_rate}%` }, { key: 'boarding_rate', label: 'Boarding', align: 'right', render: (t) => `${t.boarding_rate}%` }, { key: 'prices_inclusive', label: 'Prices', render: (t) => (t.prices_inclusive ? 'Inclusive' : 'Exclusive') }, { key: 'active', label: 'Status', render: (t) => activeBadge(t.active) }]}
          fields={[{ key: 'name', label: 'Name of tax', required: true }, { key: 'tax_number', label: 'Tax number' }, { key: 'service_rate', label: 'Service rate', type: 'percent', required: true, min: 0, max: 100, step: 0.01 }, { key: 'product_rate', label: 'Product rate', type: 'percent', required: true, min: 0, max: 100, step: 0.01 }, { key: 'boarding_rate', label: 'Boarding rate', type: 'percent', required: true, min: 0, max: 100, step: 0.01 }, { key: 'prices_inclusive', label: 'Prices are inclusive of tax', type: 'toggle' }, { key: 'active', label: 'Active', type: 'toggle' }]}
          defaults={() => ({ active: true, prices_inclusive: false } as Partial<TaxRow>)} />
      </div>
    </Page>
  );
}

/** A-23 Daycare pricing: full / half day with the hour threshold, play hour, walk. */
export function DaycarePricingPage() {
  const ITEM: Record<string, string> = { full_day: 'Full day', half_day: 'Half day', hour: 'Play hour', walk: 'Walk' };
  return (
    <Page code="A-23" title="Daycare pricing" subtitle="Full day at or above the hour threshold, half day below it, play hour and walk (R-F01..F04). The extra-pet discount lives under Discounts.">
      <CrudTable<DaycarePricingRow> table="daycare_pricing" title="Daycare items" permission="pricing.write" rowLabel={(d) => d.name}
        columns={[{ key: 'name', label: 'Item' }, { key: 'item', label: 'Kind', render: (d) => <Badge size="sm">{ITEM[d.item] ?? d.item}</Badge> }, { key: 'price', label: 'Price', align: 'right', render: (d) => <strong>{fmtMoney(d.price)}</strong> }, { key: 'threshold_hours', label: 'Rule', render: (d) => (d.item === 'full_day' ? `${d.threshold_hours ?? '?'} h or more` : d.item === 'half_day' ? `under ${d.threshold_hours ?? '?'} h` : d.item === 'hour' ? 'per hour' : 'per walk') }, { key: 'active', label: 'Status', render: (d) => activeBadge(d.active) }]}
        fields={[{ key: 'name', label: 'Name', required: true, full: true }, { key: 'item', label: 'Kind', type: 'select', required: true, options: Object.entries(ITEM).map(([value, label]) => ({ value, label })) }, { key: 'price', label: 'Price', type: 'money', required: true, min: 0 }, { key: 'threshold_hours', label: 'Hour threshold', type: 'number', min: 1, max: 12, step: 0.5, hint: 'Full day at / above, half day below (keep both rows equal)', when: (v) => v.item === 'full_day' || v.item === 'half_day' }, { key: 'active', label: 'Active', type: 'toggle' }]}
        defaults={() => ({ active: true, threshold_hours: null } as Partial<DaycarePricingRow>)} />
    </Page>
  );
}

const SIZES = ['s', 'm', 'l', 'xl', 'giant'] as const;
const SIZE_LABEL: Record<string, string> = { s: 'S', m: 'M', l: 'L', xl: 'XL', giant: 'Giant' };
/** A-24 Grooming packages by size with calendar minutes. */
export function PackagesPage() {
  return (
    <Page code="A-24" title="Grooming packages" subtitle="Gold / Platinum / Diamond priced by dog size S / M / L / XL / Giant with the calendar minutes per size (R-G01..G07). Diamond prices are placeholders pending Justin (R-G06).">
      <CrudTable<PackageRow> table="packages" title="Packages" permission="pricing.write" orderBy={{ column: 'sort_order' }} rowLabel={(p) => p.name} cardBreakpoint={900}
        columns={[
          { key: 'name', label: 'Package', render: (p) => <div><strong>{p.name}</strong><div className="acp-note">{p.inclusions}</div></div> },
          ...SIZES.map((s) => ({ key: `price_${s}`, label: SIZE_LABEL[s], group: 'Price', align: 'right' as const, render: (p: PackageRow) => fmtMoney(p[`price_${s}`]) })),
          ...SIZES.map((s) => ({ key: `minutes_${s}`, label: SIZE_LABEL[s], group: 'Minutes', align: 'right' as const, hideOnCard: true, render: (p: PackageRow) => `${p[`minutes_${s}`]}` })),
          { key: 'active', label: 'Status', render: (p) => activeBadge(p.active) },
        ]}
        fields={[
          { key: 'name', label: 'Name', required: true }, { key: 'tier', label: 'Tier key', required: true, hint: 'gold | platinum | diamond' },
          { key: 'inclusions', label: 'Inclusions', type: 'textarea', maxLength: 200 },
          ...SIZES.map((s) => ({ key: `price_${s}`, label: `Price ${SIZE_LABEL[s]}`, type: 'money' as const, required: true, min: 0 })),
          ...SIZES.map((s) => ({ key: `minutes_${s}`, label: `Minutes ${SIZE_LABEL[s]}`, type: 'number' as const, required: true, min: 15, step: 15 })),
          { key: 'notes', label: 'Notes', type: 'textarea' }, { key: 'sort_order', label: 'Order', type: 'number', min: 0 }, { key: 'active', label: 'Active', type: 'toggle' },
        ]}
        defaults={() => ({ active: true, sort_order: 10, minutes_s: 60, minutes_m: 60, minutes_l: 60, minutes_xl: 90, minutes_giant: 90 } as Partial<PackageRow>)} />
    </Page>
  );
}

/** A-25 Grooming add-ons with starting-at flag, added minutes and employee restriction. */
export function AddonsPage() {
  return (
    <Page code="A-25" title="Grooming add-ons" subtitle="Add-ons with price ('starting at' when the final price depends on coat condition), minutes added to the calendar for S-M and L+ dogs, and an employee-type restriction (R-G08..G13, R-L06).">
      <CrudTable<AddonRow> table="addons" title="Add-ons" permission="pricing.write" rowLabel={(a) => a.name} searchable
        columns={[{ key: 'name', label: 'Add-on' }, { key: 'price', label: 'Price', align: 'right', render: (a) => <strong>{fmtMoney(a.price)}{a.starting_at ? '+' : ''}</strong> }, { key: 'added_minutes_sm', label: 'S-M', group: 'Added minutes', align: 'right' }, { key: 'added_minutes_l', label: 'L+', group: 'Added minutes', align: 'right' }, { key: 'employee_type', label: 'Restricted to', render: (a) => (a.employee_type ? <Badge size="sm" tone="warn">{a.employee_type}</Badge> : <span className="faint">—</span>) }, { key: 'active', label: 'Status', render: (a) => activeBadge(a.active) }]}
        fields={[{ key: 'name', label: 'Name', required: true, full: true }, { key: 'price', label: 'Price', type: 'money', required: true, min: 0 }, { key: 'starting_at', label: 'Starting at (final price varies)', type: 'toggle' }, { key: 'added_minutes_sm', label: 'Added minutes S-M', type: 'number', min: 0, step: 5, required: true }, { key: 'added_minutes_l', label: 'Added minutes L+', type: 'number', min: 0, step: 5, required: true }, { key: 'employee_type', label: 'Employee type', hint: 'e.g. special employee; empty = any groomer' }, { key: 'description', label: 'Description', type: 'textarea', maxLength: 100 }, { key: 'active', label: 'Active', type: 'toggle' }]}
        defaults={() => ({ active: true, starting_at: false, added_minutes_sm: 0, added_minutes_l: 0, employee_type: null } as Partial<AddonRow>)} />
    </Page>
  );
}

/** A-26 Services & appointment types: the service catalog with category and tax class. */
export function ServicesPage() {
  const CAT: Record<string, string> = { hotel: 'Hotel', daycare: 'Daycare', grooming: 'Grooming & Spa', extra: 'Extra' };
  return (
    <Page code="A-26" title="Services & appointment types" subtitle="The service catalog: hotel, daycare, Grooming & Spa (one service, D-004) and extras such as Veterinary travel or the Vaccination fee, each with its tax class.">
      <CrudTable<ServiceRow> table="services" title="Services" permission="pricing.write" rowLabel={(s) => s.name} searchable
        filters={[{ key: 'category', label: 'Category', options: Object.entries(CAT).map(([value, label]) => ({ value, label })), test: (r, v) => r.category === v }]}
        columns={[{ key: 'name', label: 'Service' }, { key: 'category', label: 'Category', render: (s) => <Badge size="sm" tone={toneFor(s.category)}>{CAT[s.category] ?? s.category}</Badge> }, { key: 'price', label: 'Flat price', align: 'right', render: (s) => (s.price ? fmtMoney(s.price) : <span className="muted xs">from tables</span>) }, { key: 'taxable_as', label: 'Taxed as' }, { key: 'active', label: 'Status', render: (s) => activeBadge(s.active) }]}
        fields={[{ key: 'name', label: 'Name', required: true, full: true }, { key: 'category', label: 'Category', type: 'select', required: true, options: Object.entries(CAT).map(([value, label]) => ({ value, label })) }, { key: 'taxable_as', label: 'Taxed as', type: 'select', required: true, options: [{ value: 'service', label: 'Service' }, { value: 'product', label: 'Product' }, { value: 'boarding', label: 'Boarding' }] }, { key: 'price', label: 'Flat price', type: 'money', min: 0, hint: '0 when priced by rates / packages / daycare tables' }, { key: 'description', label: 'Description', type: 'textarea', maxLength: 200 }, { key: 'active', label: 'Active', type: 'toggle' }]}
        defaults={() => ({ active: true, price: 0, taxable_as: 'service', category: 'extra' } as Partial<ServiceRow>)} />
    </Page>
  );
}
