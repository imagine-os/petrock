import { brands, neutrals, semantic, type as typeTokens, spacing, radii, shadows, motion, bookingHues, status } from '../../design/tokens';
import { useTheme } from '../../design/ThemeProvider';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Section } from '../../components/molecule/Section/Section';
import { Card } from '../../components/molecule/Card/Card';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { StatusBadge } from '../../components/atom/Badge/Badge';
import { BOOKING_STATUSES } from '../../domain/booking';
import './dev.css';

const Swatch = ({ name, value, cssVar }: { name: string; value?: string; cssVar?: string }) => (
  <div className="swatch"><div className="swatch-color" style={{ background: cssVar ? `var(${cssVar})` : value }} /><strong>{name}</strong>{value && <code>{value}</code>}</div>
);

export function TokensPage() {
  const { theme, setTheme, brand, setBrand, brands: brandNames } = useTheme();
  const b = brands[brand];
  return (
    <div className="page stack">
      <PageHeader code="D-01" title="Design tokens" subtitle="src/design/tokens.ts is the single source; npm run tokens writes src/styles/tokens.css. Two axes: data-theme (light | dark) and data-brand (petrock | sunset)."
        actions={<><SegmentedControl size="sm" value={theme} onChange={(v) => setTheme(v as 'light' | 'dark')} options={[{ value: 'light', label: 'Light', icon: 'sun' }, { value: 'dark', label: 'Dark', icon: 'moon' }]} /><SegmentedControl size="sm" value={brand} onChange={(v) => setBrand(v as typeof brand)} options={brandNames.map((n) => ({ value: n, label: brands[n].label }))} /></>} />
      <Section title="Brand palette" description={`${b.label}: primary ramp + accent. Every semantic role resolves from these.`}>
        <div className="swatches">{Object.entries(b).filter(([k]) => k !== 'label').map(([k, v]) => <Swatch key={k} name={k} value={v} />)}</div>
      </Section>
      <Section title="Neutrals" description="Shared by every brand. Ink #0E0C11, navy headings #11104A, app background #F4F6FA (from the Figma scan).">
        <div className="swatches">{Object.entries(neutrals).map(([k, v]) => <Swatch key={k} name={k} value={v} />)}</div>
      </Section>
      <Section title={`Semantic roles (${theme})`} description="What components actually use. Shown live from the current theme + brand.">
        <div className="swatches">{Object.keys(semantic[theme]).filter((k) => k.startsWith('color-')).map((k) => <Swatch key={k} name={k.replace('color-', '')} cssVar={`--${k}`} />)}</div>
        <div className="swatches">{Object.entries(status[theme]).map(([k, v]) => <Swatch key={k} name={k} value={v} />)}</div>
      </Section>
      <Section title="Booking status hues (R-I01)" description="One lifecycle, one colour set, every surface.">
        <div className="row wrap">{BOOKING_STATUSES.map((s) => <StatusBadge key={s} status={s} />)}</div>
        <div className="swatches">{Object.entries(bookingHues).map(([k, h]) => <Swatch key={k} name={k} value={`${h.fg} / ${h.bg}`} cssVar={`--status-${k}-bg`} />)}</div>
      </Section>
      <Section title="Typography" description="Open Sans 400 / 600 / 700 (--font-sans) and Be Vietnam Pro 400 / 500 / 600 (--font-display, D-185). 12 / 14 / 16 / 18 / 20 / 22 / 24 / 32; Figma 8 / 10 px roles render at the 12 px floor.">
        <Card><div className="typescale">{(['fs-xs', 'fs-sm', 'fs-md', 'fs-lg', 'fs-xl', 'fs-2xl'] as const).map((k) => <div key={k} className="typescale-row"><code className="xs muted">{k} · {typeTokens[k]}</code><span style={{ fontSize: `var(--${k})`, fontWeight: k === 'fs-2xl' ? 700 : k.endsWith('lg') || k.endsWith('xl') ? 600 : 400, lineHeight: 1.2 }}>Rock out with your paws out</span></div>)}</div></Card>
      </Section>
      <div className="grid grid-2">
        <Section title="Spacing (4-pt grid)"><Card><div className="stack-sm">{Object.entries(spacing).filter(([, v]) => v !== '0').map(([k, v]) => <div key={k} className="spacing-row"><code style={{ width: 48 }}>{k}</code><span className="spacing-bar" style={{ width: v }} /><span className="muted">{v}</span></div>)}</div></Card></Section>
        <Section title="Radii" description="8 default (inputs, buttons), 10 cards, 24 pills."><Card><div className="radii">{Object.entries(radii).map(([k, v]) => <div key={k} className="radius" style={{ borderRadius: v }}>{k.replace('r-', '')}<br />{v}</div>)}</div></Card></Section>
      </div>
      <div className="grid grid-2">
        <Section title="Shadows"><div className="grid grid-2">{Object.keys(shadows).filter((k) => k !== 'shadow-focus').map((k) => <div key={k} className="shadowbox" style={{ boxShadow: `var(--${k})` }}>{k}</div>)}</div></Section>
        <Section title="Motion"><Card><table className="comp-props"><tbody>{Object.entries(motion).map(([k, v]) => <tr key={k}><th>{k}</th><td><code>{v}</code></td></tr>)}</tbody></table></Card></Section>
      </div>
    </div>
  );
}
