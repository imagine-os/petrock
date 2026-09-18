import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRoutes } from '../../app/registry';
import { REQUIRED_WIDTHS } from './specReport';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { ViewportFrame } from '../../components/molecule/ViewportFrame/ViewportFrame';
import { Select } from '../../components/atom/Select/Select';
import { Chip } from '../../components/atom/Chip/Chip';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { Input } from '../../components/atom/Input/Input';
import { Card } from '../../components/molecule/Card/Card';
import './dev-quality.css';

export const sampleParams = (path: string) => path.replace(':table', 'bookings').replace(':code', 'D-03').replace(/:\w+/g, 'x').replace(/\/\*$/, '');
export function useRouteOptions() {
  return useMemo(() => { const seen = new Set<string>(); return getRoutes().filter((r) => { if (seen.has(r.path)) return false; seen.add(r.path); return true; }).sort((a, b) => a.spec.code.localeCompare(b.spec.code, undefined, { numeric: true })).map((r) => ({ value: r.path, label: `${r.spec.code} · ${r.spec.name} (${r.path})` })); }, []);
}

/** D-13 */
export function ViewportPreviewPage() {
  const [params, setParams] = useSearchParams();
  const options = useRouteOptions();
  const route = params.get('route') || '/';
  const mode = (params.get('width') ? 'single' : 'all') as 'single' | 'all';
  const width = Number(params.get('width') || 390);
  const [height, setHeight] = useState(800);
  const set = (k: string, v: string | null) => { if (v == null) params.delete(k); else params.set(k, v); setParams(params, { replace: true }); };
  const target = sampleParams(route);
  return (
    <div className="page stack">
      <PageHeader code="D-13" title="Responsive preview" subtitle="A route at the five D-016 widths side by side (scaled), or one width at full size. Frames share this session and theme.">
        <div className="dq-toolbar">
          <Select size="sm" label="Route" value={route} onChange={(e) => set('route', e.target.value)} options={options} />
          <SegmentedControl size="sm" ariaLabel="Mode" value={mode} onChange={(m) => set('width', m === 'all' ? null : String(width))} options={[{ value: 'all', label: 'All widths' }, { value: 'single', label: 'One width' }]} />
          {mode === 'single' && <Input size="sm" label="Width" type="number" min={280} max={2560} value={width} onChange={(e) => set('width', e.target.value)} />}
          <Input size="sm" label="Height" type="number" min={400} max={2000} value={height} onChange={(e) => setHeight(Number(e.target.value) || 800)} />
        </div>
        <div className="row wrap" style={{ marginTop: 8 }}>{[...REQUIRED_WIDTHS, 1440].map((w) => <Chip key={w} size="sm" selected={mode === 'single' && width === w} onClick={() => set('width', String(w))}>{w}</Chip>)}</div>
      </PageHeader>
      {mode === 'all' ? <div className="dq-frames">{REQUIRED_WIDTHS.map((w) => <ViewportFrame key={`${w}-${target}`} route={target} width={w} height={height} label={target} />)}</div>
        : <Card padding="sm"><div className="dq-frames is-single"><ViewportFrame key={`${width}-${target}`} route={target} width={width} height={height} label={target} fit={width > 1400} /></div></Card>}
      <p className="xs faint">Timeline and board views may degrade gracefully on phones (D-016). Parameterised routes use sample params (:table → bookings, :code → D-03).</p>
    </div>
  );
}
