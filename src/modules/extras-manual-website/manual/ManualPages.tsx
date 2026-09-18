import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../../../auth/SessionProvider';
import { useLocation } from '../../../tenant/LocationProvider';
import { useData, useTable } from '../../../data/DataContext';
import type { EmployeeRow } from '../../../data/schema/core';
import type { TrainingCompletionRow } from '../../../data/schema/extras-manual-website';
import { ROLE_LABEL } from '../../../auth/roles';
import { rules as allRules } from '../../../rules';
import { Card } from '../../../components/molecule/Card/Card';
import { Badge, toneFor } from '../../../components/atom/Badge/Badge';
import { Button } from '../../../components/atom/Button/Button';
import { IconButton } from '../../../components/atom/IconButton/IconButton';
import { Input } from '../../../components/atom/Input/Input';
import { Icon } from '../../../components/atom/Icon/Icon';
import { Chip } from '../../../components/atom/Chip/Chip';
import { PageHeader } from '../../../components/molecule/PageHeader/PageHeader';
import { Section } from '../../../components/molecule/Section/Section';
import { EmptyState } from '../../../components/molecule/EmptyState/EmptyState';
import { Figure } from '../../../components/molecule/Figure/Figure';
import { MarkdownViewer } from '../../../components/organism/MarkdownViewer/MarkdownViewer';
import { LiveBlock } from '../../../components/organism/LiveBlock/LiveBlock';
import { ManualCallout } from '../../../components/molecule/ManualCallout/ManualCallout';
import { ManualToc } from '../../../components/molecule/ManualToc/ManualToc';
import { ManualChapterCard } from '../../../components/molecule/ManualChapterCard/ManualChapterCard';
import { useToast } from '../../../components/molecule/Toast/Toast';
import { allDecisions, allPlaceholders, assetByPath, chapterBySlug, chapterPath, chapters, chaptersByPart, chaptersForRole, pendingDrafts, readingMinutes, searchChapters, shotRoute, shotUrl, type ManualChapter } from './manualIndex';
import './manual.css';

/** Completions of the signed-in user (by employee row or by user id). */
function useMyCompletions() {
  const { user } = useSession();
  const { rows: employees } = useTable<EmployeeRow>('employees', { where: { user_id: user.id } });
  const me = employees[0];
  const { rows } = useTable<TrainingCompletionRow>('training_completions', { where: me ? { employee_id: me.id } : { user_id: user.id } });
  return { me, completions: rows };
}

export function ManualSidebar({ active }: { active?: string }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const hits = useMemo(() => searchChapters(q), [q]);
  const groups = chaptersByPart();
  const decisions = allDecisions().length;
  return (
    <aside className={`manual-side ${open ? 'is-open' : ''}`}>
      <div className="manual-side-head"><Icon name="book" size={18} /><h2><Link to="/manual">Ops manual</Link></h2><IconButton icon={open ? 'chevron-up' : 'list'} label={open ? 'Hide chapters' : 'Show chapters'} size="sm" className="manual-side-toggle" onClick={() => setOpen((o) => !o)} /></div>
      <Input size="sm" icon="search" placeholder="Search the manual" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the manual" />
      {q.trim().length >= 2 && <div className="manual-search-out" role="status"><span className="xs muted">{hits.length} chapter{hits.length === 1 ? '' : 's'}</span>{hits.slice(0, 8).map((c) => <Link key={c.slug} to={chapterPath(c.slug)} onClick={() => setQ('')}><span className="manual-num">{c.number}</span> {c.title}</Link>)}</div>}
      <div className="manual-side-list">
        <div className="manual-part"><NavLink to="/manual" end className={({ isActive }) => `manual-link ${isActive ? 'is-active' : ''}`}><span className="manual-num">▤</span>Cover & reading paths</NavLink><NavLink to="/manual/pending" className={({ isActive }) => `manual-link ${isActive ? 'is-active' : ''}`}><span className="manual-num">!</span>Pending decisions <Badge size="sm" tone="warn">{decisions}</Badge></NavLink></div>
        {groups.map((g) => <div key={g.key || 'other'} className="manual-part"><div className="eyebrow">{g.key ? `Part ${g.key} · ${g.label}` : g.label}</div>{g.chapters.map((c) => <NavLink key={c.slug} to={chapterPath(c.slug)} className={({ isActive }) => `manual-link ${isActive || active === c.slug ? 'is-active' : ''}`}><span className="manual-num">{c.number}</span><span>{c.title}</span></NavLink>)}</div>)}
        <Button variant="secondary" size="sm" icon="download" onClick={() => window.print()}>Print this page</Button>
        <Button variant="ghost" size="sm" onClick={() => nav('/docs/ops-manual/README')}>Authoring conventions</Button>
      </div>
    </aside>
  );
}

/** M-01: cover, reading path for the current role, role x chapter matrix, chapter grid by part. */
export function ManualCover() {
  const { role } = useSession();
  const { completions } = useMyCompletions();
  const groups = chaptersByPart();
  const mine = chaptersForRole(role);
  const doneSlugs = new Set(completions.map((c) => c.chapter_slug));
  const figures = chapters.reduce((n, c) => n + c.figures, 0);
  const placeholders = allPlaceholders().length;
  const decisions = allDecisions().length;
  const minutes = chapters.reduce((n, c) => n + readingMinutes(c), 0);
  const audiences = ['front desk', 'groomer', 'manager', 'owner', 'all staff'];
  const version = chapters.map((c) => c.version).filter(Boolean).sort().pop() ?? '';
  const updated = chapters.map((c) => c.updated).filter(Boolean).sort().pop() ?? '';
  return (
    <div className="manual">
      <ManualSidebar />
      <div className="manual-main">
        <header className="manual-cover">
          <p className="eyebrow">Petrock Hotel · business operations manual · v{version} · {updated}</p>
          <h1>How Petrock runs, per role, in person and in the software</h1>
          <p>Every chapter is a lesson with an in-person part (what you do at the desk, in the grooming room, on the floor) and an online part (which screen, which button, which rule). Numbers you see in the blue "live" blocks are read from the system, never typed.</p>
          <div className="manual-cover-stats"><div><strong>{chapters.length}</strong>chapters</div><div><strong>{minutes} min</strong>total reading</div><div><strong>{figures}</strong>screenshots</div><div><strong>{placeholders}</strong>screens to capture</div><div><strong>{decisions}</strong>pending decisions</div></div>
        </header>

        <Section title={`Your reading path as ${ROLE_LABEL[role].toLowerCase()}`} description={mine.length ? `${doneSlugs.size ? `${mine.filter((c) => doneSlugs.has(c.slug)).length} of ${mine.length} completed. ` : ''}Start at the top; each chapter ends with the buttons that record your lesson.` : 'This role has no chapters assigned; browse the grid below.'} actions={<Link to="/desk/education"><Button size="sm" variant="secondary" icon="check">Training progress</Button></Link>}>
          {mine.length > 0 && <div className="manual-grid">{mine.map((c) => <ManualChapterCard key={c.slug} to={chapterPath(c.slug)} code={c.code} number={c.number} title={c.title} summary={c.summary} roles={c.roles} minutes={readingMinutes(c)} figures={c.figures} placeholders={c.placeholders.length} decisions={c.decisions.length} recommended completed={doneSlugs.has(c.slug)} />)}</div>}
        </Section>

        <Section title="Who reads what" description="One row per chapter, one column per audience. Green means you completed it.">
          <Card padding="none"><div className="manual-matrix"><table><thead><tr><th>Chapter</th>{audiences.map((a) => <th key={a}>{a}</th>)}</tr></thead><tbody>{chapters.map((c) => <tr key={c.slug}><td><Link to={chapterPath(c.slug)}><span className="manual-num">{c.number}</span> {c.title}</Link></td>{audiences.map((a) => <td key={a}>{c.roles.map((r) => r.toLowerCase()).includes(a) ? <span className={`dot ${doneSlugs.has(c.slug) ? 'is-done' : ''}`} title={a} /> : ''}</td>)}</tr>)}</tbody></table></div></Card>
        </Section>

        {groups.map((g) => <Section key={g.key || 'other'} title={g.key ? `Part ${g.key} · ${g.label}` : g.label} description={g.lead}><div className="manual-grid">{g.chapters.map((c) => <ManualChapterCard key={c.slug} to={chapterPath(c.slug)} code={c.code} number={c.number} title={c.title} summary={c.summary} roles={c.roles} minutes={readingMinutes(c)} figures={c.figures} placeholders={c.placeholders.length} decisions={c.decisions.length} completed={doneSlugs.has(c.slug)} recommended={mine.includes(c)} />)}</div></Section>)}
      </div>
    </div>
  );
}

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | undefined>(ids[0]);
  useEffect(() => {
    if (!ids.length) return;
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const obs = new IntersectionObserver((entries) => { const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (hit) setActive(hit.target.id); }, { rootMargin: '-80px 0px -60% 0px' });
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

/** M-1x: one chapter rendered from its segments (markdown, live blocks, figures, callouts) with TOC, meta, lesson buttons and prev/next. */
export function ManualChapterPage({ chapter }: { chapter: ManualChapter }) {
  const data = useData();
  const { toast } = useToast();
  const { user } = useSession();
  const { locationId } = useLocation();
  const { me, completions } = useMyCompletions();
  const done = (mode: 'in_person' | 'online') => completions.find((c) => c.chapter_slug === chapter.slug && c.mode === mode);
  const active = useActiveHeading(chapter.headings.map((h) => h.id));
  const idx = chapters.indexOf(chapter);
  const prev = chapters[idx - 1], next = chapters[idx + 1];
  const pageRules = chapter.rules.map((id) => allRules.find((r) => r.id === id) ?? { id, title: '(not in registry)', status: 'requested' as const });
  const complete = async (mode: 'in_person' | 'online') => {
    if (done(mode)) return;
    await data.insert('training_completions', { location_id: me?.location_id ?? locationId, employee_id: me?.id ?? user.id, user_id: user.id, chapter_slug: chapter.slug, chapter_code: chapter.code, mode, completed_at: new Date().toISOString(), signed_off_by: null, note: null });
    toast({ tone: 'success', title: mode === 'online' ? 'Online lesson recorded' : 'In-person lesson recorded', body: `${chapter.code} · ${chapter.title}${mode === 'in_person' ? ' (a manager signs it off in Education)' : ''}` });
  };
  const resolveImage = (src: string) => { const clean = src.split('?')[0].replace(/^(\.\.\/)+/, 'docs/'); return assetByPath(clean.startsWith('docs/') ? clean : `docs/${clean}`); };
  return (
    <div className={`manual ${chapter.headings.length > 2 ? 'has-toc' : ''}`}>
      <ManualSidebar active={chapter.slug} />
      <article className="manual-main">
        <Card className="manual-article" padding="none">
          <header className="manual-head">
            <div className="row wrap" style={{ gap: 8 }}><code className="chcard-code">{chapter.code}</code>{chapter.part && <span className="xs muted">Part {chapter.part}</span>}{chapter.roles.map((r) => <Badge key={r} size="sm">{r}</Badge>)}</div>
            <h1>{chapter.number}. {chapter.title}</h1>
            {chapter.summary && <p className="muted">{chapter.summary}</p>}
            <div className="manual-meta"><span><Icon name="clock" size={12} /> {readingMinutes(chapter)} min read</span><span>v{chapter.version} · {chapter.updated}</span>{chapter.figures > 0 && <span><Icon name="image" size={12} /> {chapter.figures} screenshots</span>}{chapter.placeholders.length > 0 && <span className="tone-warn">{chapter.placeholders.length} to capture</span>}{pageRules.map((r) => <Link key={r.id} to={`/dev/rules#${r.id}`} title={r.title}><Chip size="sm">{r.id}</Chip></Link>)}</div>
            <div className="manual-lessons"><Icon name="check" size={16} /><span>Record this lesson:</span><Button size="sm" variant={done('online') ? 'secondary' : 'primary'} icon={done('online') ? 'check' : 'globe'} onClick={() => void complete('online')} disabled={!!done('online')}>{done('online') ? 'Online done' : 'I read the online lesson'}</Button><Button size="sm" variant={done('in_person') ? 'secondary' : 'primary'} icon={done('in_person') ? 'check' : 'users'} onClick={() => void complete('in_person')} disabled={!!done('in_person')}>{done('in_person') ? 'In-person done' : 'I did the in-person lesson'}</Button><Link to="/desk/education" className="xs">Progress →</Link></div>
          </header>
          {chapter.headings.length > 2 && <div className="manual-toc-inline"><ManualToc headings={chapter.headings} active={active} /></div>}
          <div className="manual-body">
            {chapter.segments.map((s, i) => {
              if (s.kind === 'live') return <LiveBlock key={i} kind={s.name} arg={s.arg} />;
              if (s.kind === 'shot') return <Figure key={i} src={shotUrl(s.code)} alt={s.caption ?? s.code} caption={s.caption} code={s.code} to={shotRoute(s.code)} placeholder={!shotUrl(s.code)} />;
              if (s.kind === 'callout') return <ManualCallout key={i} tone={s.tone}>{s.text}</ManualCallout>;
              return <div key={i} id={s.anchor}><MarkdownViewer source={s.source} resolveImage={resolveImage} /></div>;
            })}
          </div>
          <nav className="manual-prevnext" aria-label="Chapters">
            {prev ? <Link to={chapterPath(prev.slug)}><span>Previous</span><strong>{prev.number}. {prev.title}</strong></Link> : <span />}
            {next ? <Link to={chapterPath(next.slug)} style={{ textAlign: 'right' }}><span>Next</span><strong>{next.number}. {next.title}</strong></Link> : <span />}
          </nav>
        </Card>
      </article>
      {chapter.headings.length > 2 && <div className="manual-toc-col"><ManualToc headings={chapter.headings} active={active} /></div>}
    </div>
  );
}

/** M-02: fallback for /manual/:slug when no chapter matches. */
export function ManualNotFound() {
  const { slug = '' } = useParams();
  const found = chapterBySlug(slug);
  if (found) return <ManualChapterPage chapter={found} />;
  return (
    <div className="manual"><ManualSidebar /><div className="manual-main"><PageHeader code="M-02" title="Chapter not found" subtitle={`Nothing at /manual/${slug}. Pick a chapter from the list.`} backTo="/manual" /><div className="manual-grid">{chapters.map((c) => <ManualChapterCard key={c.slug} to={chapterPath(c.slug)} code={c.code} number={c.number} title={c.title} summary={c.summary} roles={c.roles} minutes={readingMinutes(c)} />)}</div></div></div>
  );
}

/** M-03: every `> DECISION NEEDED:` in the chapters, screens still to capture, and draft chapters from other modules. */
export function ManualPending() {
  const decisions = allDecisions();
  const placeholders = allPlaceholders();
  return (
    <div className="manual">
      <ManualSidebar />
      <div className="manual-main">
        <PageHeader code="M-03" title="Pending: decisions, captures and drafts" subtitle="Auto-extracted from the chapters. Decisions are questions Justin still has to answer; captures are screens the manual references without a screenshot yet; drafts are chapters other modules wrote for the integrator." />
        <Section title={`${decisions.length} decisions needed`} description="Each line is a > DECISION NEEDED: callout in a chapter. The build chose a working value where it had to (docs/decisions/_pending)."> 
          {decisions.length === 0 ? <EmptyState compact icon="check" title="No pending decisions" /> : <Card><ul className="manual-pending-list">{decisions.map((d, i) => <li key={i}><Link to={chapterPath(d.chapter.slug)}><Chip size="sm" tone="primary">{d.chapter.code}</Chip></Link><span>{d.text}</span></li>)}</ul></Card>}
        </Section>
        <Section title={`${placeholders.length} screens to capture`} description="Run npm run screenshots -- --codes=<CODE> once the page exists; the placeholder becomes the real capture automatically.">
          {placeholders.length === 0 ? <EmptyState compact icon="image" title="Every referenced screen has a capture" /> : <Card><ul className="manual-pending-list">{placeholders.map((p, i) => <li key={i}><Link to={chapterPath(p.chapter.slug)}><Chip size="sm">{p.chapter.code}</Chip></Link><span><code>{p.code}</code> {p.caption}{shotRoute(p.code) ? <> · <Link to={shotRoute(p.code)!}>open page</Link></> : <span className="muted xs"> · page not built yet</span>}</span></li>)}</ul></Card>}
        </Section>
        <Section title={`${pendingDrafts.length} draft chapters from modules`} description="docs/ops-manual/en/_pending/<module>.md; the integrator merges them into numbered chapters.">
          {pendingDrafts.length === 0 ? <EmptyState compact icon="book" title="No drafts waiting" /> : <div className="stack">{pendingDrafts.map((d) => <Card key={d.path} padding="lg"><div className="row-between wrap"><h3>{d.title}</h3><Badge size="sm" tone={toneFor('draft')}>draft · {d.words} words</Badge></div><p className="xs faint">{d.path}</p><MarkdownViewer source={d.source.split('\n').slice(0, 40).join('\n')} /></Card>)}</div>}
        </Section>
      </div>
    </div>
  );
}
