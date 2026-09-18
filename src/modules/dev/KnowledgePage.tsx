import { useState } from 'react';
import { Link } from 'react-router-dom';
import { docs, docByPath, docsRoute, headerMeta, assetUrl } from '../docs/docsIndex';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { Card } from '../../components/molecule/Card/Card';
import { Badge } from '../../components/atom/Badge/Badge';
import { MarkdownViewer } from '../../components/organism/MarkdownViewer/MarkdownViewer';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import './dev.css';

type Tab = 'kanban' | 'changelog' | 'prompts' | 'plan';
const numbered = (prefix: string) => docs.filter((d) => d.path.startsWith(prefix) && /\/\d{4}-/.test(d.path)).sort((a, b) => b.path.localeCompare(a.path));

export function KnowledgePage() {
  const [tab, setTab] = useState<Tab>('kanban');
  const kanban = docByPath('docs/kanban.md');
  const plan = docByPath('docs/build-plan.md');
  const changelog = numbered('docs/changelog/');
  const pending = docs.filter((d) => d.path.startsWith('docs/changelog/_pending/') && !/README/.test(d.path));
  const prompts = numbered('docs/prompts/');
  const resolveImage = (src: string) => assetUrl(src.replace(/^(\.\.\/)+/, 'docs/').replace(/^\.\//, 'docs/')) ?? assetUrl(`docs/${src}`);
  return (
    <div className="page stack">
      <PageHeader code="D-07" title="Knowledge base" subtitle="Kanban, changelog and prompt log, straight from docs/. Every change is documented in the same turn as the work.">
        <Tabs size="sm" value={tab} onChange={setTab} items={[{ key: 'kanban', label: 'Kanban' }, { key: 'plan', label: 'Build plan' }, { key: 'changelog', label: 'Changelog', count: changelog.length + pending.length }, { key: 'prompts', label: 'Prompts', count: prompts.length }]} />
      </PageHeader>
      {tab === 'kanban' && (kanban ? <Card padding="lg"><MarkdownViewer source={kanban.source} resolveImage={resolveImage} /></Card> : <EmptyState title="No kanban.md" />)}
      {tab === 'plan' && (plan ? <Card padding="lg"><MarkdownViewer source={plan.source} resolveImage={resolveImage} /></Card> : <EmptyState title="No build-plan.md" />)}
      {tab === 'changelog' && (
        <div className="kb-list">
          {pending.length > 0 && <Card tint><strong className="small">Pending module drafts ({pending.length})</strong><div className="kb-list" style={{ marginTop: 8 }}>{pending.map((d) => <Link key={d.path} to={docsRoute(d.path)!} className="small">{d.path.split('/').pop()}</Link>)}</div></Card>}
          {changelog.map((d) => { const m = headerMeta(d.source); return (
            <Card key={d.path} interactive padding="md" onClick={() => { window.location.hash = docsRoute(d.path)!; }}>
              <div className="kb-item"><div className="stack-sm"><strong>{d.title}</strong><div className="kb-meta">{m.version && <Badge size="sm" tone="primary">v{m.version}</Badge>}{m.date && <span>{m.date}</span>}{m.prompt && <span>prompt {m.prompt}</span>}{m.codes && <span className="mono">{m.codes}</span>}</div>{m.intent && <p className="xs muted">{m.intent.slice(0, 220)}{m.intent.length > 220 ? '…' : ''}</p>}</div><Badge size="sm">open</Badge></div>
            </Card>); })}
        </div>
      )}
      {tab === 'prompts' && (
        <div className="kb-list">{prompts.map((d) => { const [p, r] = d.source.split(/^## Response\s*$/m); return (
          <Card key={d.path} padding="lg"><div className="row-between wrap"><h2 className="small">{d.title}</h2><Link to={docsRoute(d.path)!} className="xs">open</Link></div>
            <div className="prompt-split" style={{ marginTop: 12 }}><div className="prompt-side is-prompt"><div className="eyebrow">Prompt</div><MarkdownViewer source={p.replace(/^# .*\n/, '').slice(0, 2500)} /></div><div className="prompt-side"><div className="eyebrow">Response</div><MarkdownViewer source={(r ?? '_no response yet_').slice(0, 2500)} /></div></div></Card>); })}</div>
      )}
    </div>
  );
}
