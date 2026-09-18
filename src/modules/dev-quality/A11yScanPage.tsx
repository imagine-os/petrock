import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { scanA11y, type A11yFinding } from './a11yScan';
import { sampleParams, useRouteOptions } from './ViewportPreviewPage';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { ViewportFrame } from '../../components/molecule/ViewportFrame/ViewportFrame';
import { Select } from '../../components/atom/Select/Select';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { Section } from '../../components/molecule/Section/Section';
import './dev-quality.css';

const RULES: [string, string, string][] = [['img-alt', 'Every <img> has an alt attribute (empty for decoration).', '1.1.1'], ['control-name', 'Buttons and links expose a name (text, aria-label, labelled image).', '4.1.2'], ['input-label', 'Inputs, selects and textareas have a <label>, aria-label or title.', '1.3.1'], ['iframe-title', 'Frames carry a title.', '4.1.2'], ['h1', 'One visible h1 per page.', '2.4.6'], ['heading-skip', 'Heading levels do not skip (h2 to h4).', '1.3.1'], ['landmark-main', 'A <main> landmark exists.', '1.3.1'], ['tabindex-positive', 'No positive tabindex.', '2.4.3'], ['link-href', 'Links have a real href; actions are buttons.', '4.1.2'], ['target-size', 'Targets are at least 24 x 24 px (tables exempt).', '2.5.8'], ['html-lang', '<html lang> is set.', '3.1.1']];

/** D-15 */
export function A11yScanPage() {
  const [params, setParams] = useSearchParams();
  const options = useRouteOptions();
  const route = params.get('route') || '/';
  const [width, setWidth] = useState(1280);
  const [findings, setFindings] = useState<A11yFinding[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [nonce, setNonce] = useState(0);
  const target = sampleParams(route);
  const onLoad = (doc: Document | null) => { if (!doc) return; setScanning(true); setTimeout(() => { try { setFindings(scanA11y(doc)); } finally { setScanning(false); } }, 500); };
  const rows = useMemo(() => (findings ?? []).map((f, i) => ({ id: String(i), ...f })), [findings]);
  const errors = rows.filter((r) => r.severity === 'error').length, warns = rows.length - errors;
  return (
    <div className="page stack">
      <PageHeader code="D-15" title="Accessibility scan" subtitle="Loads the route in a same-origin frame and runs the R-X87 checks live; the responsive QA script runs the same rules headless. Not a substitute for a screen-reader pass, but it catches the mechanical gaps.">
        <div className="dq-toolbar"><Select size="sm" label="Route" value={route} onChange={(e) => { params.set('route', e.target.value); setParams(params, { replace: true }); setFindings(null); }} options={options} /><Select size="sm" label="Width" value={String(width)} onChange={(e) => { setWidth(Number(e.target.value)); setFindings(null); }} options={[360, 390, 768, 1280, 1920].map((w) => ({ value: String(w), label: `${w} px` }))} /><Button size="sm" icon="refresh" onClick={() => { setFindings(null); setNonce((n) => n + 1); }} loading={scanning}>Rescan</Button></div>
      </PageHeader>
      <div className="dq-stat-grid"><StatTile label="Errors" value={findings ? errors : '…'} icon={errors ? 'close' : 'check'} tone={errors ? 'primary' : 'default'} /><StatTile label="Warnings" value={findings ? warns : '…'} icon="warning" /><StatTile label="Rules hit" value={findings ? new Set(rows.map((r) => r.rule)).size : '…'} icon="flag" /><StatTile label="Status" value={findings ? (rows.length ? 'findings' : 'clean') : scanning ? 'scanning' : 'loading'} icon="shield" /></div>
      <div className="grid grid-2">
        <Section title="Findings" description={findings ? `${rows.length} on ${target} at ${width} px` : 'Waiting for the frame to load…'}>
          <DataTable rows={rows} rowKey={(r) => r.id} dense pageSize={100} emptyText={findings ? 'No findings. Clean.' : 'Scanning…'} filters={[{ key: 'sev', label: 'Severity', options: [{ value: 'error', label: 'Errors' }, { value: 'warn', label: 'Warnings' }], test: (r, v) => r.severity === v }, { key: 'rule', label: 'Rule', options: [...new Set(rows.map((r) => r.rule))].map((v) => ({ value: v, label: v })), test: (r, v) => r.rule === v }]}
            columns={[{ key: 'severity', label: 'Sev', render: (r) => <Badge size="sm" tone={r.severity === 'error' ? 'danger' : 'warn'}>{r.severity}</Badge> }, { key: 'rule', label: 'Rule', mono: true }, { key: 'text', label: 'Finding' }, { key: 'selector', label: 'Element', mono: true, hideOnCard: true, render: (r) => <span className="xs">{r.selector}</span> }, { key: 'wcag', label: 'WCAG', mono: true, hideOnCard: true }]} />
        </Section>
        <Section title="Scanned page"><Card padding="sm"><ViewportFrame key={`${target}-${width}-${nonce}`} route={target} width={width} height={900} label={target} onLoad={onLoad} /></Card></Section>
      </div>
      <Section title="Rules" description="What each check looks for and its WCAG 2.2 criterion."><div className="dq-legend">{RULES.map(([id, text, wcag]) => <div key={id}><code>{id}</code> <span className="faint">({wcag})</span><br />{text}</div>)}</div></Section>
    </div>
  );
}
