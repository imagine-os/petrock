import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { docs } from '../docs/docsIndex';
import { searchDocs, docFolders } from './docsSearch';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { SearchHitList } from '../../components/molecule/SearchHitList/SearchHitList';
import { Chip } from '../../components/atom/Chip/Chip';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import './dev-quality.css';

/** D-18 */
export function DocsSearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const folder = params.get('folder') ?? '';
  const set = (k: string, v: string) => { if (v) params.set(k, v); else params.delete(k); setParams(params, { replace: true }); };
  const hits = useMemo(() => searchDocs(q, { folder: folder || undefined }), [q, folder]);
  const folders = docFolders();
  const counts = useMemo(() => Object.fromEntries(folders.map((f) => [f, docs.filter((d) => (d.dir.split('/')[0] || '(root)') === f).length])), [folders]);
  return (
    <div className="page stack">
      <PageHeader code="D-18" title="Docs search" subtitle={`Full text over ${docs.length} markdown files under docs/. Title matches rank first; each hit opens the docs viewer.`} />
      <Card padding="md">
        <div className="dq-searchbar"><Input label="Search" icon="search" placeholder="e.g. vaccine, PIN, R-E09, Diamond" value={q} onChange={(e) => set('q', e.target.value)} autoFocus /><Select label="Folder" placeholder="All folders" value={folder} onChange={(e) => set('folder', e.target.value)} options={folders.map((f) => ({ value: f, label: `${f} (${counts[f]})` }))} /></div>
        <div className="row wrap" style={{ marginTop: 10 }}>{folders.map((f) => <Chip key={f} size="sm" selected={folder === f} onClick={() => set('folder', folder === f ? '' : f)}>{f} <span className="faint">{counts[f]}</span></Chip>)}</div>
      </Card>
      {q.trim().length < 2 ? <EmptyState icon="search" title="Type at least two characters" body="Searches titles, paths and body text. Try a rule id (R-E09), a page code (F-01) or a word like 'daycare'." />
        : <Card padding="md"><div className="xs muted" style={{ marginBottom: 6 }}>{hits.length} {hits.length === 1 ? 'document' : 'documents'} for “{q}”{folder ? ` in ${folder}` : ''}</div><SearchHitList hits={hits} query={q.trim().split(/\s+/)[0]} emptyText="No document matches every term. Try fewer words." /></Card>}
    </div>
  );
}
