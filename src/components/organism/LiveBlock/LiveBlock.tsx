import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTable } from '../../../data/DataContext';
import { TABLE_GROUPS, tableRegistry, tables } from '../../../data/schema';
import type { BaseRow } from '../../../data/schema/types';
import type { AddonRow, CapacityRow, DaycarePricingRow, DiscountRow, FeeRow, LocationRow, PackageRow, RateRow, RoomTypeRow, SeasonRow, TaxRow, VaccineTypeRow } from '../../../data/schema/core';
import { rules as allRules, RULE_CATEGORY_LABEL, RULE_STATUS_LABEL, type RuleCategory } from '../../../rules';
import { ROLES, ROLE_HOME, ROLE_LABEL, type Role } from '../../../auth/roles';
import { ROLE_PERMISSIONS } from '../../../auth/permissions';
import { demoUsers } from '../../../auth/demoUsers';
import { getRoutes } from '../../../app/registry';
import { BOOKING_STATUSES, BOOKING_STATUS_LABEL, BOOKING_TRANSITIONS, PIN_GATED_TRANSITIONS } from '../../../domain/booking';
import { fmtMoney } from '../../../pricing/engine';
import { Badge, StatusBadge, toneFor } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import './LiveBlock.css';

export interface LiveBlockProps {
  /** Directive name: table | tables | roles | permissions | routes | locations | capacities | pricing | statuses | vaccines | rules | rule | stats | demo-users. */
  kind: string;
  /** Text after the colon in `{{kind:arg}}`. */
  arg?: string;
}

export const LIVE_DIRECTIVES = ['table:<name>', 'tables', 'roles', 'permissions:<role>', 'routes:<surface>', 'locations', 'capacities', 'pricing:rooms|grooming|addons|daycare|discounts|fees', 'statuses', 'vaccines', 'rules:<category>', 'rule:<R-id>', 'stats', 'demo-users'];

/** Tables a directive reads, so a chapter's PageSpec.data can be derived from its directives. */
export function liveDirectiveTables(kind: string, arg?: string): string[] {
  switch (kind) {
    case 'table': return arg ? [arg] : [];
    case 'locations': return ['locations'];
    case 'capacities': return ['capacities', 'locations'];
    case 'pricing': return arg === 'rooms' ? ['rates', 'room_types', 'seasons'] : arg === 'grooming' ? ['packages'] : arg === 'addons' ? ['addons'] : arg === 'daycare' ? ['daycare_pricing'] : arg === 'discounts' ? ['discounts', 'room_types'] : arg === 'fees' ? ['fees', 'taxes'] : ['rates', 'packages', 'daycare_pricing'];
    case 'vaccines': return ['vaccine_types'];
    case 'rules': case 'rule': return ['rules'];
    case 'stats': return ['bookings', 'appointments', 'daycare_bookings', 'customers', 'pets'];
    default: return [];
  }
}

function Frame({ title, eyebrow, source, children }: { title: string; eyebrow?: ReactNode; source?: ReactNode; children: ReactNode }) {
  return (
    <section className="live" aria-label={title}>
      <header className="live-head"><div className="grow">{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h4 className="live-title">{title}</h4></div><Badge tone="success" dot size="sm">live</Badge></header>
      <div className="live-body">{children}</div>
      <footer className="live-foot"><span><Icon name="refresh" size={11} /> Live from the system: this block reads the tables, never a typed number.</span>{source && <span className="live-source">{source}</span>}</footer>
    </section>
  );
}

function Unknown({ kind, arg, options }: { kind: string; arg?: string; options: string[] }) {
  return <Frame title={`Unknown directive {{${kind}${arg ? `:${arg}` : ''}}}`} eyebrow="manual"><p className="small muted">This chapter asked for something LiveBlock does not know. Available: {options.map((o) => <code key={o} className="live-opt">{o}</code>)}</p></Frame>;
}

const cell = (v: unknown): string => v == null ? '' : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : typeof v === 'boolean' ? (v ? 'yes' : 'no') : String(v);

function TableBlock({ name }: { name: string }) {
  const def = tableRegistry[name];
  const { rows } = useTable<BaseRow>(name);
  if (!def) return <Unknown kind="table" arg={name} options={Object.keys(tableRegistry).slice(0, 12).concat(['…'])} />;
  const cols = def.columns.filter((c) => !c.wide).slice(0, 5);
  const title = def.titleColumn && !cols.some((c) => c.name === def.titleColumn) ? def.columns.find((c) => c.name === def.titleColumn) : undefined;
  const shown = [...(title ? [title] : []), ...cols].slice(0, 6);
  return (
    <Frame title={def.label} eyebrow={`table ${name} · ${rows.length} rows`} source={<Link to={`/dev/tables/${name}`}>Open in the table manager</Link>}>
      <p className="small muted live-desc">{def.description}</p>
      <div className="live-scroll"><table className="live-table"><thead><tr>{shown.map((c) => <th key={c.name}>{c.name}</th>)}</tr></thead><tbody>{rows.slice(0, 8).map((r) => <tr key={r.id}>{shown.map((c) => <td key={c.name}>{c.type === 'money' ? fmtMoney(Number(r[c.name] ?? 0)) : cell(r[c.name])}</td>)}</tr>)}</tbody></table></div>
      {rows.length > 8 && <p className="xs faint">+{rows.length - 8} more rows in the table manager.</p>}
    </Frame>
  );
}

function TablesBlock() {
  return (
    <Frame title={`${tables.length} tables in the schema`} eyebrow="src/data/schema" source={<Link to="/dev/tables">Table library</Link>}>
      <div className="live-groups">{TABLE_GROUPS.map((g) => { const list = tables.filter((t) => t.group === g.id); return list.length ? <div key={g.id} className="live-group"><div className="live-group-head"><strong>{g.label}</strong><span className="muted xs">{list.length}</span></div><div className="row wrap" style={{ gap: 6 }}>{list.map((t) => <Link key={t.name} to={`/dev/tables/${t.name}`} className="live-opt">{t.name}</Link>)}</div></div> : null; })}</div>
    </Frame>
  );
}

function RolesBlock() {
  return (
    <Frame title="Roles and where they land" eyebrow="src/auth/roles.ts" source={<Link to="/dev/rules">Rules registry</Link>}>
      <div className="live-scroll"><table className="live-table"><thead><tr><th>Role</th><th>Home</th><th>Permissions</th><th>Demo user</th><th>Location</th></tr></thead><tbody>
        {ROLES.map((r) => { const u = demoUsers.find((d) => d.role === r); return <tr key={r}><td><Badge tone={r === 'super_admin' || r === 'owner' ? 'primary' : 'neutral'} size="sm">{ROLE_LABEL[r]}</Badge></td><td><code>{ROLE_HOME[r]}</code></td><td>{ROLE_PERMISSIONS[r].length}</td><td>{u?.name}</td><td className="muted">{u?.locationId ? u.locationId.replace('loc_', '') : r === 'public' ? '—' : 'all'}</td></tr>; })}
      </tbody></table></div>
    </Frame>
  );
}

function PermissionsBlock({ role }: { role?: string }) {
  if (!role || !(ROLES as readonly string[]).includes(role)) return <Unknown kind="permissions" arg={role} options={[...ROLES]} />;
  const r = role as Role;
  return <Frame title={`What a ${ROLE_LABEL[r].toLowerCase()} can do`} eyebrow={`${ROLE_PERMISSIONS[r].length} permissions · src/auth/permissions.ts`}><div className="row wrap" style={{ gap: 6 }}>{ROLE_PERMISSIONS[r].map((p) => <code key={p} className="live-opt">{p}</code>)}</div></Frame>;
}

function RoutesBlock({ surface }: { surface?: string }) {
  const list = getRoutes().filter((r) => !surface || r.surface === surface).filter((r) => !r.path.includes(':') && !r.path.includes('*'));
  if (!list.length) return <Unknown kind="routes" arg={surface} options={['public', 'customer', 'frontdesk', 'admin', 'manual', 'dev', 'docs']} />;
  return (
    <Frame title={`Screens${surface ? ` of the ${surface} surface` : ''}`} eyebrow={`${list.length} routes · window.__petrock.routes`} source={<Link to="/dev/specs">Specs index</Link>}>
      <ul className="live-list">{list.sort((a, b) => a.spec.code.localeCompare(b.spec.code, undefined, { numeric: true })).map((r) => <li key={r.path}><code className="live-code">{r.spec.code}</code><Link to={r.path}>{r.spec.name}</Link><span className="muted xs">{r.path}</span></li>)}</ul>
    </Frame>
  );
}

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmtT = (t: string) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'pm' : 'am'}`; };
function LocationsBlock() {
  const { rows } = useTable<LocationRow>('locations', { orderBy: { column: 'sort_order' } });
  return (
    <Frame title="Locations, hours and phones" eyebrow="table locations" source={<Link to="/dev/tables/locations">locations</Link>}>
      <div className="live-cards">{rows.map((l) => <div key={l.id} className="live-card"><strong>{l.name}</strong><span className="small">{l.address}</span><span className="small muted">{l.phone}</span><table className="live-table is-plain"><tbody>{[1, 6, 0].map((d) => <tr key={d}><td>{d === 1 ? 'Mon–Fri' : DAY[d]}</td><td>{l.hours?.[String(d)] ? `${fmtT(l.hours[String(d)]!.open)} – ${fmtT(l.hours[String(d)]!.close)}` : 'Closed'}</td></tr>)}</tbody></table></div>)}</div>
    </Frame>
  );
}

function CapacitiesBlock() {
  const { rows: caps } = useTable<CapacityRow>('capacities');
  const { rows: locs } = useTable<LocationRow>('locations', { orderBy: { column: 'sort_order' } });
  const kinds = ['penthouse', 'suite', 'daycare', 'grooming'] as const;
  return (
    <Frame title="Capacity per location" eyebrow="table capacities (max simultaneous)" source={<Link to="/dev/tables/capacities">capacities</Link>}>
      <div className="live-scroll"><table className="live-table"><thead><tr><th>Location</th>{kinds.map((k) => <th key={k}>{k}</th>)}</tr></thead><tbody>{locs.map((l) => <tr key={l.id}><td>{l.short_name}</td>{kinds.map((k) => <td key={k}>{caps.find((c) => c.location_id === l.id && c.kind === k)?.max_simultaneous ?? '—'}</td>)}</tr>)}</tbody></table></div>
    </Frame>
  );
}

function PricingBlock({ what }: { what?: string }) {
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: rates } = useTable<RateRow>('rates');
  const { rows: seasons } = useTable<SeasonRow>('seasons');
  const { rows: packages } = useTable<PackageRow>('packages', { orderBy: { column: 'sort_order' } });
  const { rows: addons } = useTable<AddonRow>('addons');
  const { rows: daycare } = useTable<DaycarePricingRow>('daycare_pricing');
  const { rows: discounts } = useTable<DiscountRow>('discounts');
  const { rows: fees } = useTable<FeeRow>('fees');
  const { rows: taxes } = useTable<TaxRow>('taxes');
  const key = what ?? 'rooms';
  const src = (t: string) => <Link to={`/dev/tables/${t}`}>{t}</Link>;
  if (key === 'rooms') return <Frame title="Room rates per night" eyebrow="tables rates · room_types · seasons" source={src('rates')}><div className="live-scroll"><table className="live-table"><thead><tr><th>Room type</th><th>Season</th><th>Mon–Thu</th><th>Fri–Sun</th></tr></thead><tbody>{roomTypes.flatMap((rt) => [null, ...seasons].map((s) => { const wd = rates.find((r) => r.room_type_id === rt.id && r.day_kind === 'weekday' && (r.season_id ?? null) === (s?.id ?? null)); const we = rates.find((r) => r.room_type_id === rt.id && r.day_kind === 'weekend' && (r.season_id ?? null) === (s?.id ?? null)); return wd || we ? <tr key={`${rt.id}-${s?.id ?? 'base'}`}><td>{rt.name}</td><td>{s ? `${s.name} (${s.starts_on} – ${s.ends_on})` : 'Standard'}</td><td>{wd ? fmtMoney(wd.price_per_night) : '—'}</td><td>{we ? fmtMoney(we.price_per_night) : '—'}</td></tr> : null; }))}</tbody></table></div></Frame>;
  if (key === 'grooming') return <Frame title="Grooming & Spa packages by size" eyebrow="table packages" source={src('packages')}><div className="live-scroll"><table className="live-table"><thead><tr><th>Package</th><th>S</th><th>M</th><th>L</th><th>XL</th><th>Giant</th></tr></thead><tbody>{packages.map((p) => <tr key={p.id}><td><strong>{p.name}</strong><div className="xs muted">{p.inclusions}</div></td><td>{fmtMoney(p.price_s)}</td><td>{fmtMoney(p.price_m)}</td><td>{fmtMoney(p.price_l)}</td><td>{fmtMoney(p.price_xl)}</td><td>{fmtMoney(p.price_giant)}</td></tr>)}</tbody></table></div></Frame>;
  if (key === 'addons') return <Frame title="Grooming add-ons" eyebrow="table addons" source={src('addons')}><div className="live-scroll"><table className="live-table"><thead><tr><th>Add-on</th><th>Price</th><th>Extra minutes (S–M / L+)</th></tr></thead><tbody>{addons.map((a) => <tr key={a.id}><td>{a.name}</td><td>{a.starting_at ? 'from ' : ''}{fmtMoney(a.price)}</td><td>{a.added_minutes_sm} / {a.added_minutes_l}</td></tr>)}</tbody></table></div></Frame>;
  if (key === 'daycare') return <Frame title="Daycare price list" eyebrow="table daycare_pricing" source={src('daycare_pricing')}><div className="live-scroll"><table className="live-table"><thead><tr><th>Item</th><th>Price</th><th>Threshold</th></tr></thead><tbody>{daycare.map((d) => <tr key={d.id}><td>{d.name}</td><td>{fmtMoney(d.price)}</td><td>{d.threshold_hours != null ? `${d.threshold_hours} h` : '—'}</td></tr>)}</tbody></table></div></Frame>;
  if (key === 'discounts') return <Frame title="Discounts" eyebrow="table discounts" source={src('discounts')}><div className="live-scroll"><table className="live-table"><thead><tr><th>Discount</th><th>Kind</th><th>Amount</th><th>Conditions</th></tr></thead><tbody>{discounts.map((d) => <tr key={d.id}><td>{d.name}</td><td>{d.kind.replace('_', ' ')}</td><td>{d.percent_off != null ? `${d.percent_off} %` : `${fmtMoney(d.amount_off)} / dog / night`}</td><td className="muted xs">{[d.room_type_id ? roomTypes.find((r) => r.id === d.room_type_id)?.name : null, d.dog_count ? `${d.dog_count} dogs` : null, d.min_nights ? `${d.min_nights}+ nights` : null, d.requires_paid_in_full ? 'paid in full' : null, d.excludes_holidays ? 'not on holidays' : null, d.active ? null : 'inactive'].filter(Boolean).join(' · ')}</td></tr>)}</tbody></table></div></Frame>;
  if (key === 'fees') return <Frame title="Fees and taxes" eyebrow="tables fees · taxes" source={src('fees')}><div className="live-scroll"><table className="live-table"><thead><tr><th>Item</th><th>Rate</th><th>Applies to</th></tr></thead><tbody>{fees.map((f) => <tr key={f.id}><td>{f.name}</td><td>{f.percent} %</td><td>{f.applies_to.replace('_', ' ')}{f.active ? '' : ' (inactive)'}</td></tr>)}{taxes.map((t) => <tr key={t.id}><td>{t.name}</td><td>service {t.service_rate} % · product {t.product_rate} % · boarding {t.boarding_rate} %</td><td>{t.prices_inclusive ? 'prices include tax' : 'added at checkout'}</td></tr>)}</tbody></table></div></Frame>;
  return <Unknown kind="pricing" arg={what} options={['rooms', 'grooming', 'addons', 'daycare', 'discounts', 'fees']} />;
}

function StatusesBlock() {
  return (
    <Frame title="The one booking lifecycle" eyebrow="src/domain/booking.ts" source={<Link to="/dev/rules#R-A05">R-A05</Link>}>
      <div className="live-flow">{BOOKING_STATUSES.slice(0, 5).map((s, i) => <span key={s} className="live-flow-step"><StatusBadge status={s} />{i < 4 && <Icon name="arrow-right" size={14} />}</span>)}<span className="live-flow-step muted xs">plus</span><StatusBadge status="cancelled" /><StatusBadge status="no_show" /></div>
      <div className="live-scroll"><table className="live-table"><thead><tr><th>From</th><th>Can go to</th><th>Needs a manager PIN</th></tr></thead><tbody>{BOOKING_STATUSES.map((s) => <tr key={s}><td>{BOOKING_STATUS_LABEL[s]}</td><td>{BOOKING_TRANSITIONS[s].map((t) => BOOKING_STATUS_LABEL[t]).join(', ') || '—'}</td><td>{(PIN_GATED_TRANSITIONS[s] ?? []).map((t) => BOOKING_STATUS_LABEL[t]).join(', ') || '—'}</td></tr>)}</tbody></table></div>
    </Frame>
  );
}

function VaccinesBlock() {
  const { rows } = useTable<VaccineTypeRow>('vaccine_types', { orderBy: { column: 'sort_order' } });
  return <Frame title="Vaccines we track" eyebrow="table vaccine_types" source={<Link to="/dev/tables/vaccine_types">vaccine_types</Link>}><ul className="live-list">{rows.map((v) => <li key={v.id}><Badge size="sm" tone={v.required ? 'danger' : 'neutral'}>{v.required ? 'required' : 'recommended'}</Badge><strong>{v.name}</strong><span className="muted xs">{v.short_name}</span></li>)}</ul></Frame>;
}

function RulesBlock({ category }: { category?: string }) {
  const list = category ? allRules.filter((r) => r.category === category) : allRules;
  if (category && !(category in RULE_CATEGORY_LABEL)) return <Unknown kind="rules" arg={category} options={Object.keys(RULE_CATEGORY_LABEL)} />;
  return <Frame title={category ? `Rules: ${RULE_CATEGORY_LABEL[category as RuleCategory]}` : 'All business rules'} eyebrow={`${list.length} rules · rules registry`} source={<Link to="/dev/rules">Settings › Rules</Link>}><ul className="live-list">{list.map((r) => <li key={r.id}><Link to={`/dev/rules#${r.id}`} className="live-code">{r.id}</Link><span>{r.title}</span><Badge size="sm" tone={toneFor(r.status)}>{RULE_STATUS_LABEL[r.status]}</Badge></li>)}</ul></Frame>;
}

function RuleBlock({ id }: { id?: string }) {
  const r = allRules.find((x) => x.id === id);
  if (!r) return <Unknown kind="rule" arg={id} options={allRules.slice(0, 10).map((x) => x.id).concat(['…'])} />;
  return <Frame title={r.title} eyebrow={<><Link to={`/dev/rules#${r.id}`} className="live-code">{r.id}</Link> · {RULE_CATEGORY_LABEL[r.category]}</>} source={<Badge size="sm" tone={toneFor(r.status)}>{RULE_STATUS_LABEL[r.status]}</Badge>}><p className="small">{r.description}</p><p className="xs muted">Pages: {r.pages.join(', ') || '—'} · Source: {r.source}</p></Frame>;
}

function StatsBlock() {
  const { rows: bookings } = useTable<BaseRow>('bookings');
  const { rows: appts } = useTable<BaseRow>('appointments');
  const { rows: daycare } = useTable<BaseRow>('daycare_bookings');
  const { rows: customers } = useTable<BaseRow>('customers');
  const { rows: pets } = useTable<BaseRow>('pets');
  const items: [string, number][] = [['Hotel bookings', bookings.length], ['Grooming appointments', appts.length], ['Daycare days', daycare.length], ['Customers', customers.length], ['Pets', pets.length]];
  return <Frame title="What is in the system right now" eyebrow="row counts from the data layer"><div className="live-stats">{items.map(([k, v]) => <div key={k} className="live-stat"><strong>{v}</strong><span className="xs muted">{k}</span></div>)}</div></Frame>;
}

function DemoUsersBlock() {
  return <Frame title="Demo people you can practise as" eyebrow="src/auth/demoUsers.ts (all fictional)" source={<Link to="/">Testing hub</Link>}><ul className="live-list">{demoUsers.filter((u) => u.role !== 'public').map((u) => <li key={u.id}><Badge size="sm" tone="neutral">{ROLE_LABEL[u.role]}</Badge><strong>{u.name}</strong><span className="muted xs">{u.blurb}</span></li>)}</ul></Frame>;
}

/** Renders one `{{kind:arg}}` directive of an ops-manual chapter with data read from the system (R-X73). */
export function LiveBlock({ kind, arg }: LiveBlockProps) {
  switch (kind) {
    case 'table': return <TableBlock name={arg ?? ''} />;
    case 'tables': return <TablesBlock />;
    case 'roles': return <RolesBlock />;
    case 'permissions': return <PermissionsBlock role={arg} />;
    case 'routes': return <RoutesBlock surface={arg} />;
    case 'locations': return <LocationsBlock />;
    case 'capacities': return <CapacitiesBlock />;
    case 'pricing': return <PricingBlock what={arg} />;
    case 'statuses': return <StatusesBlock />;
    case 'vaccines': return <VaccinesBlock />;
    case 'rules': return <RulesBlock category={arg} />;
    case 'rule': return <RuleBlock id={arg} />;
    case 'stats': return <StatsBlock />;
    case 'demo-users': return <DemoUsersBlock />;
    default: return <Unknown kind={kind} arg={arg} options={LIVE_DIRECTIVES} />;
  }
}
