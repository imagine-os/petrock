import { useMemo, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n, useT } from '../../i18n/I18nProvider';
import { useSession } from '../../auth/SessionProvider';
import { useTheme } from '../../design/ThemeProvider';
import { useLocation } from '../../tenant/LocationProvider';
import { ROLE_HOME } from '../../auth/roles';
import { demoUserById } from '../../auth/demoUsers';
import { company } from '../../tenant/locations';
import { getRoutes, isStubElement } from '../../app/registry';
import { tables } from '../../data/schema';
import { rules } from '../../rules';
import { componentLibrary } from '../../design/library';
import { Card } from '../../components/molecule/Card/Card';
import { Button } from '../../components/atom/Button/Button';
import { Toggle } from '../../components/atom/Toggle/Toggle';
import { Badge, type BadgeTone } from '../../components/atom/Badge/Badge';
import { Icon, type IconName } from '../../components/atom/Icon/Icon';
import { IconButton } from '../../components/atom/IconButton/IconButton';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { RoleSwitcher } from '../../components/molecule/RoleSwitcher/RoleSwitcher';
import { LocationSwitcher } from '../../components/molecule/LocationSwitcher/LocationSwitcher';
import { SegmentedControl } from '../../components/molecule/SegmentedControl/SegmentedControl';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { HUB_GROUPS, HUB_TOOLS, ROLE_KEY, type HubCard, type HubTool, type ThumbShape } from './surfaces';
import { thumbFor } from './thumbs';
import kanbanSource from '../../../docs/kanban.md?raw';
import './hub.css';

// Keys only: docs/**/*.md is already bundled eagerly by the docs module, so this adds nothing to the bundle.
const PAGE_DOCS = import.meta.glob('../../../docs/pages/*.md', { query: '?raw', import: 'default', eager: true });

type RouteStatus = 'built' | 'stub' | 'planned';
const STATUS_TONE: Record<RouteStatus, BadgeTone> = { built: 'success', stub: 'warn', planned: 'neutral' };

/** Cards, lanes and done cards in `docs/kanban.md` (one `- ` line per card). */
function kanbanCounts(src: string): { done: number; total: number } {
  let lane = '';
  let done = 0;
  let total = 0;
  for (const line of src.split('\n')) {
    if (line.startsWith('## ')) { lane = line.slice(3).trim().toLowerCase(); continue; }
    if (!line.startsWith('- ')) continue;
    total += 1;
    if (lane === 'done') done += 1;
  }
  return { done, total };
}

/**
 * Fallback for a card whose thumbnail has not been captured yet: a "window" wireframe in the card's own hue.
 * Never a broken image - the hub ships before `npm run thumbs` has run.
 */
function ThumbWire({ shape, title }: { shape: ThumbShape; title: string }) {
  if (shape === 'phone') {
    return (
      <svg className="hub-wire" viewBox="0 0 100 195" preserveAspectRatio="none" role="img" aria-label={title}>
        <rect x="0" y="0" width="100" height="195" fill="currentColor" opacity=".07" />
        <rect x="34" y="5" width="32" height="5" rx="2.5" fill="currentColor" opacity=".22" />
        <rect x="10" y="20" width="46" height="8" rx="3" fill="currentColor" opacity=".2" />
        <rect x="10" y="36" width="80" height="34" rx="6" fill="currentColor" opacity=".15" />
        <rect x="10" y="78" width="38" height="30" rx="6" fill="currentColor" opacity=".12" />
        <rect x="52" y="78" width="38" height="30" rx="6" fill="currentColor" opacity=".12" />
        <rect x="10" y="118" width="80" height="12" rx="4" fill="currentColor" opacity=".1" />
        <rect x="10" y="136" width="80" height="12" rx="4" fill="currentColor" opacity=".1" />
        <rect x="0" y="168" width="100" height="27" fill="currentColor" opacity=".14" />
        {[16, 38, 60, 82].map((x) => <circle key={x} cx={x} cy="181" r="4" fill="currentColor" opacity=".25" />)}
      </svg>
    );
  }
  return (
    <svg className="hub-wire" viewBox="0 0 160 100" preserveAspectRatio="none" role="img" aria-label={title}>
      <rect x="0" y="0" width="160" height="100" fill="currentColor" opacity=".07" />
      <rect x="0" y="0" width="160" height="11" fill="currentColor" opacity=".16" />
      {[6, 13, 20].map((x) => <circle key={x} cx={x} cy="5.5" r="2" fill="currentColor" opacity=".32" />)}
      <rect x="0" y="11" width="34" height="89" fill="currentColor" opacity=".12" />
      {[20, 30, 40, 50, 60].map((y) => <rect key={y} x="6" y={y} width="22" height="4" rx="2" fill="currentColor" opacity=".22" />)}
      <rect x="42" y="20" width="62" height="7" rx="3" fill="currentColor" opacity=".24" />
      <rect x="42" y="34" width="106" height="4" rx="2" fill="currentColor" opacity=".14" />
      <rect x="42" y="42" width="88" height="4" rx="2" fill="currentColor" opacity=".14" />
      <rect x="42" y="56" width="50" height="32" rx="4" fill="currentColor" opacity=".13" />
      <rect x="98" y="56" width="50" height="32" rx="4" fill="currentColor" opacity=".13" />
    </svg>
  );
}

function Thumb({ card, dark }: { card: HubCard; dark: boolean }) {
  const t = useT();
  const url = thumbFor(card.code, { dark, label: card.thumbLabel });
  return (
    <div className={`hub-thumb is-${card.shape} ${card.feature ? 'is-feature' : ''}`}>
      {url
        ? <img className="hub-thumb-img" src={url} alt="" loading="eager" />
        : <ThumbWire shape={card.shape} title={t('hub.thumb.none')} />}
    </div>
  );
}

function StatusPill({ status }: { status: RouteStatus }) {
  const t = useT();
  return <Badge tone={STATUS_TONE[status]} size="sm" variant="pill" dot>{t(`hub.status.${status}`)}</Badge>;
}

interface SurfaceCardProps { card: HubCard; compact: boolean; status: RouteStatus; here: boolean; devMode: boolean; dark: boolean; onEnter: (card: HubCard) => void }

function SurfaceCard({ card, compact, status, here, devMode, dark, onEnter }: SurfaceCardProps) {
  const t = useT();
  const person = card.userId ? demoUserById(card.userId) : undefined;
  const label = card.cta === 'open' ? t('hub.cta.open') : t(`hub.cta.${card.cta}`, { name: person?.name ?? '' });
  const thumb = <Thumb card={card} dark={dark} />;

  const body = (
    <div className="hub-card-body">
      <div className="hub-card-head">
        <span className="hub-medallion"><Icon name={card.icon} size={compact ? 20 : 24} /></span>
        <span className="hub-pills">
          <StatusPill status={status} />
          {here && <Badge tone="info" size="sm" variant="pill">{t('hub.here')}</Badge>}
        </span>
      </div>
      <h3 className="hub-card-name">{t(`hub.card.${card.key}.name`)}</h3>
      <p className="hub-card-copy">{t(`hub.card.${card.key}.body`)}</p>
      <div className="hub-card-action">
        <Button block={!card.feature} iconRight="arrow-right" onClick={() => onEnter(card)}>{label}</Button>
      </div>
      <p className="hub-card-meta">
        <span>{t(ROLE_KEY[card.role])}</span>
        <code>{card.to}</code>
        {devMode && <code className="hub-card-code">{card.code}</code>}
      </p>
    </div>
  );

  return (
    <Card padding="none" className={`hub-card ${card.feature ? 'is-feature' : ''} ${compact ? 'is-compact' : ''}`} style={{ '--hue': card.hue } as CSSProperties}>
      {card.feature ? <>{body}{thumb}</> : <>{thumb}{body}</>}
    </Card>
  );
}

function ToolRow({ tool, devMode, onOpen }: { tool: HubTool; devMode: boolean; onOpen: (tool: HubTool) => void }) {
  const t = useT();
  const name = t(`hub.tool.${tool.key}.name`);
  const row = (
    <Button variant="outline" block className="hub-tool" icon={tool.icon} iconRight="arrow-right" onClick={() => onOpen(tool)}>
      <span className="hub-tool-name">{name}{devMode && <code className="hub-tool-code">{tool.code}</code>}</span>
      <span className="hub-tool-desc">{t(`hub.tool.${tool.key}.desc`)}</span>
    </Button>
  );
  return tool.wired ? row : <Placeholder what={name}>{row}</Placeholder>;
}

export function HubPage() {
  const { lang, setLang } = useI18n();
  const t = useT();
  const nav = useNavigate();
  const { role, isSuperAdmin, devMode, setDevMode, switchUser } = useSession();
  const { theme, toggleTheme, brand, setBrand, brands } = useTheme();
  const { locationId, setLocationId } = useLocation();
  const dark = theme === 'dark';

  const routes = getRoutes();
  const stats = useMemo(() => {
    const built = routes.filter((r) => !isStubElement(r.element)).length;
    const actions = routes.reduce((n, r) => n + (r.spec.actions?.length ?? 0), 0);
    const pageDocs = Object.keys(PAGE_DOCS).filter((p) => !p.includes('_TEMPLATE')).length;
    return { built, actions, pageDocs, kanban: kanbanCounts(kanbanSource) };
  }, [routes]);

  const statusOf = (path: string): RouteStatus => {
    const r = routes.find((x) => x.path === path);
    return !r ? 'planned' : isStubElement(r.element) ? 'stub' : 'built';
  };
  const isHere = (card: HubCard) =>
    card.role === role && (card.home ?? card.to === ROLE_HOME[card.role]) && (!card.locationId || card.locationId === locationId);

  const enter = (card: HubCard) => {
    if (card.userId) switchUser(card.userId);
    if (card.locationId) setLocationId(card.locationId);
    nav(card.to);
  };
  const openTool = (tool: HubTool) => {
    if (tool.userId) switchUser(tool.userId);
    nav(tool.to);
  };

  return (
    <div className="hub">
      <header className="hub-head">
        <div className="container hub-head-in">
          <div className="hub-brand">
            <img src="./brand/petrock-mark.svg" alt="" width={32} height={32} />
            <span className="hub-brand-name">Petrock</span>
            <Badge tone="primary" size="sm" title={t('hub.version')}>v{__APP_VERSION__}</Badge>
          </div>
          <div className="hub-controls">
            <SegmentedControl ariaLabel={t('hub.lang.label')} value={lang} onChange={(v) => setLang(v as 'en' | 'es')}
              options={[{ value: 'en', label: 'EN' }, { value: 'es', label: 'ES' }]} />
            <SegmentedControl ariaLabel={t('hub.brand.label')} value={brand} onChange={(v) => setBrand(v as typeof brand)}
              options={brands.map((b) => ({ value: b, label: b === 'petrock' ? 'Petrock' : 'Sunset', icon: 'palette' as IconName }))} />
            <IconButton icon={dark ? 'sun' : 'moon'} label={dark ? t('hub.theme.toLight') : t('hub.theme.toDark')} variant="outline" onClick={toggleTheme} />
            {isSuperAdmin && <Toggle checked={devMode} onChange={setDevMode} label={t('hub.devMode')} />}
          </div>
        </div>
      </header>

      <section className="hub-band">
        <div className="container hub-hero">
          <div className="hub-hero-text">
            <p className="hub-eyebrow">{t('hub.hero.eyebrow')}</p>
            <h1 className="hub-h1 font-display">{t('hub.title')}</h1>
            <p className="hub-lede">{t('hub.subtitle')}</p>
            <p className="hub-tagline">{company.tagline}</p>
          </div>
          <img className="hub-hero-art" src="./brand/petrock-logo-2x.png" alt="" loading="lazy" decoding="async" />
        </div>
      </section>

      <div className="container hub-main">
        <Card className="hub-sessionbar" padding="md">
          <span className="hub-sessionbar-label">{t('hub.session')}</span>
          <RoleSwitcher />
          <LocationSwitcher />
          {devMode && (
            <p className="hub-sessionbar-hint">
              <Icon name="spec" size={16} /> {t('hub.devHint.before')} <kbd>Ctrl</kbd> + <kbd>.</kbd> {t('hub.devHint.after')}
            </p>
          )}
        </Card>

        {HUB_GROUPS.map((group) => (
          <section key={group.key} className={`hub-group ${group.band ? 'is-band' : ''}`}>
            <div className="hub-group-head">
              <p className="hub-eyebrow">{t(`hub.group.${group.key}.eyebrow`)}</p>
              <h2 className="hub-group-title font-display">{t(`hub.group.${group.key}.title`)}</h2>
              <p className="hub-group-body">{t(`hub.group.${group.key}.body`)}</p>
            </div>
            <div className={`hub-cards ${group.columns === 4 ? 'is-four' : ''}`}>
              {group.cards.map((card) => (
                <SurfaceCard key={card.key} card={card} compact={!!group.compact} status={statusOf(card.to)}
                  here={isHere(card)} devMode={devMode} dark={dark} onEnter={enter} />
              ))}
            </div>
          </section>
        ))}

        <section className="hub-group">
          <div className="hub-group-head">
            <p className="hub-eyebrow">{t('hub.group.tools.eyebrow')}</p>
            <h2 className="hub-group-title font-display">{t('hub.group.tools.title')}</h2>
            <p className="hub-group-body">{t('hub.group.tools.body')}</p>
          </div>
          <div className="hub-tools">
            {HUB_TOOLS.map((tool) => <ToolRow key={tool.key} tool={tool} devMode={devMode} onOpen={openTool} />)}
          </div>
        </section>

        <footer className="hub-foot">
          <div className="hub-stats">
            <StatTile icon="list" label={t('hub.stat.routes')} value={routes.length} />
            <StatTile icon="check" label={t('hub.stat.built')} value={stats.built} />
            <StatTile icon="table" label={t('hub.stat.tables')} value={tables.length} />
            <StatTile icon="flag" label={t('hub.stat.rules')} value={rules.length} />
            <StatTile icon="grid" label={t('hub.stat.components')} value={componentLibrary.length} />
            <StatTile icon="sparkle" label={t('hub.stat.actions')} value={stats.actions} />
            <StatTile icon="book" label={t('hub.stat.pageDocs')} value={stats.pageDocs} />
            <StatTile icon="star" label={t('hub.stat.tasks')} value={`${stats.kanban.done} / ${stats.kanban.total}`} />
          </div>
          <p className="hub-note">{t('hub.mockNote')}</p>
        </footer>
      </div>
    </div>
  );
}
