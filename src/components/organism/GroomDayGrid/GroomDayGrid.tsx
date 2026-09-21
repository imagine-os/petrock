import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { initials } from '../../atom/Avatar/Avatar';
import { Icon } from '../../atom/Icon/Icon';
import { IconButton } from '../../atom/IconButton/IconButton';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import { ScheduleCard, flagAlerts, type ScheduleCardChip, type ScheduleCardFlags } from '../../molecule/ScheduleCard/ScheduleCard';
import './GroomDayGrid.css';

export interface GroomDayGridColumn { id: string; name: string; color: string; hidden?: boolean; /** Working hours for the day: null = off, undefined = unknown (no tint). */ hours?: { open: string; close: string } | null }
export interface GroomDayGridItem {
  id: string; columnId: string | null; startsAt: string; durationMin: number;
  /** Full R-G20 label; used as the card's accessible name and tooltip. */ label: string;
  /** Card anatomy: pet name, breed, customer. Falls back to `label` when absent. */ pet?: string | null; breed?: string | null; customer?: string | null;
  chips?: ScheduleCardChip[];
  subtitle?: string | null; status: string; flags?: ScheduleCardFlags; timeLabel?: string;
}
export interface GroomDayGridProps {
  columns: GroomDayGridColumn[]; items: GroomDayGridItem[];
  /** Grid start / end hours (24h). */ startHour?: number; endHour?: number; /** Pixel height of one hour. */ hourHeight?: number;
  onItemClick?: (id: string) => void;
  /** Column context menu callbacks (R-X62). */ onMoveColumn?: (id: string, dir: -1 | 1) => void; onColorColumn?: (id: string, color: string | null) => void; onHideColumn?: (id: string, hidden: boolean) => void;
  /** Click on an empty slot: (columnId, HH:MM). */ onSlotClick?: (columnId: string, hhmm: string) => void;
  /** Hours with this many or more overlapping items get a warning chip (R-G21). */ capacity?: number;
  /** Items moved by drag: (id, columnId, HH:MM). */ onItemMove?: (id: string, columnId: string, hhmm: string) => void;
  swatches?: string[];
  /** Draw the current-time hairline (pass day === today). */ showNow?: boolean;
  emptyText?: string;
  /** Translated labels. */
  labels?: { time?: string; unassigned?: string; off?: string; moveLeft?: string; moveRight?: string; colour?: string; reset?: string; picker?: string; hide?: string; options?: string; overCapacity?: string; now?: string; manyAlerts?: string };
}
/** Muted per-groomer hues from the design tokens (light + dark are resolved by the theme). */
const DEFAULT_SWATCHES = ['var(--groomer-1)', 'var(--groomer-2)', 'var(--groomer-3)', 'var(--groomer-4)', 'var(--groomer-5)', 'var(--groomer-6)'];
const DEFAULT_LABELS = { time: 'Time', unassigned: 'Unassigned', off: 'off today', moveLeft: 'Move left', moveRight: 'Move right', colour: 'Change colour', reset: 'Reset', picker: 'Picker', hide: 'Hide column', options: 'Column options', overCapacity: 'Over grooming capacity', now: 'Now', manyAlerts: '{n} alerts' };
const pad = (n: number) => String(n).padStart(2, '0');
const minutes = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const fmtHour = (h: number) => `${((h + 11) % 12) + 1}:00 ${h >= 12 ? 'PM' : 'AM'}`;
const fmtClock = (min: number) => `${((Math.floor(min / 60) + 11) % 12) + 1}:${pad(min % 60)} ${min >= 720 ? 'PM' : 'AM'}`;

/**
 * F-30 grooming day view: time rows x groomer columns. Each column head is a white cell with an initials disc in the
 * groomer's muted hue, the name and the working hours, under a thin coloured top border - no saturated header. Working
 * hours are an 8 % tint of that hue, off hours a low-contrast neutral hatch, half hours a faint line and whole hours a
 * darker one. Overlapping appointments split the column into side-by-side lanes (never nested). Over-capacity hours get
 * a small warning chip beside the neutral hour label; when the day is today a hairline with a time chip marks now.
 * Degrades to horizontal scroll with a sticky time column on phones.
 */
export function GroomDayGrid({ columns, items, startHour = 7, endHour = 18, hourHeight = 64, onItemClick, onMoveColumn, onColorColumn, onHideColumn, onSlotClick, capacity, onItemMove, swatches = DEFAULT_SWATCHES, showNow = true, emptyText, labels }: GroomDayGridProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const [menu, setMenu] = useState<{ id: string; colorOpen: boolean } | null>(null);
  const [nowMin, setNowMin] = useState(() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setInterval(() => { const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes()); }, 60_000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!menu) return; const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setMenu(null); }; document.addEventListener('mousedown', onDoc); return () => document.removeEventListener('mousedown', onDoc); }, [menu]);
  const visible = columns.filter((c) => !c.hidden);
  const hasUnassigned = items.some((i) => !i.columnId || !columns.some((c) => c.id === i.columnId));
  const cols: GroomDayGridColumn[] = hasUnassigned ? [...visible, { id: '__unassigned', name: L.unassigned, color: 'var(--color-border-strong)', hours: undefined }] : visible;
  const hours = useMemo(() => Array.from({ length: endHour - startHour }, (_, i) => startHour + i), [startHour, endHour]);
  const totalMin = (endHour - startHour) * 60;
  const top = (min: number) => ((min - startHour * 60) / totalMin) * 100;
  const overCapacity = useMemo(() => {
    if (!capacity) return new Set<number>();
    const set = new Set<number>();
    for (const h of hours) { const s = h * 60, e = s + 60; const n = items.filter((i) => !['cancelled', 'no_show'].includes(i.status) && minutes(i.startsAt.slice(11, 16)) < e && minutes(i.startsAt.slice(11, 16)) + i.durationMin > s).length; if (n > capacity) set.add(h); }
    return set;
  }, [capacity, hours, items]);
  const itemsFor = (colId: string) => items.filter((i) => (colId === '__unassigned' ? !i.columnId || !columns.some((c) => c.id === i.columnId) : i.columnId === colId));
  const localHm = (iso: string) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const slotFromY = (e: React.MouseEvent | React.DragEvent, el: HTMLElement) => { const r = el.getBoundingClientRect(); const min = startHour * 60 + Math.round(((e.clientY - r.top) / r.height) * totalMin / 15) * 15; const c = Math.min(endHour * 60 - 15, Math.max(startHour * 60, min)); return `${pad(Math.floor(c / 60))}:${pad(c % 60)}`; };

  /** Side-by-side lanes: greedy first-fit, so overlapping cards split the column instead of stacking on top of each other. */
  const laneLayout = (list: GroomDayGridItem[]) => {
    const sorted = list.slice().sort((a, b) => minutes(localHm(a.startsAt)) - minutes(localHm(b.startsAt)) || a.id.localeCompare(b.id));
    const laneEnds: number[] = [];
    const placed = sorted.map((i) => {
      const s = minutes(localHm(i.startsAt)), e = s + i.durationMin;
      let lane = laneEnds.findIndex((end) => end <= s);
      if (lane < 0) { laneEnds.push(e); lane = laneEnds.length - 1; } else laneEnds[lane] = e;
      return { i, s, e, lane };
    });
    return { placed, lanes: Math.max(1, laneEnds.length) };
  };

  if (!cols.length) return <EmptyState icon="scissors" title={emptyText ?? 'No groomer columns'} body="Every column is hidden or no groomer works at this location." />;
  return (
    <div className="gdaygrid" ref={ref} style={{ ['--gdg-hour' as string]: `${hourHeight}px`, ['--gdg-cols' as string]: cols.length }}>
      <div className="gdaygrid-scroll">
        <div className="gdaygrid-head">
          <div className="gdaygrid-corner">{L.time}</div>
          {cols.map((c, idx) => (
            <div key={c.id} className="gdaygrid-colhead" style={{ ['--gdg-tint' as string]: c.color }}>
              <span className="gdaygrid-disc" aria-hidden>{initials(c.name) || '?'}</span>
              <span className="gdaygrid-colmeta">
                <span className="gdaygrid-colname">{c.name}</span>
                {c.hours === null && <span className="gdaygrid-off">{L.off}</span>}
                {c.hours && <span className="gdaygrid-off tnum">{c.hours.open}–{c.hours.close}</span>}
              </span>
              {c.id !== '__unassigned' && (onMoveColumn || onColorColumn || onHideColumn) && (
                <div className="gdaygrid-menuwrap">
                  <IconButton icon="more" label={`${L.options}: ${c.name}`} size="sm" onClick={() => setMenu((m) => (m?.id === c.id ? null : { id: c.id, colorOpen: false }))} aria-haspopup="menu" aria-expanded={menu?.id === c.id} />
                  {menu?.id === c.id && (
                    <div className="gdaygrid-menu" role="menu">
                      {onMoveColumn && <button type="button" role="menuitem" disabled={idx === 0} onClick={() => { onMoveColumn(c.id, -1); setMenu(null); }}>{L.moveLeft}</button>}
                      {onMoveColumn && <button type="button" role="menuitem" disabled={idx >= visible.length - 1} onClick={() => { onMoveColumn(c.id, 1); setMenu(null); }}>{L.moveRight}</button>}
                      {onColorColumn && <button type="button" role="menuitem" aria-expanded={menu.colorOpen} onClick={() => setMenu({ id: c.id, colorOpen: !menu.colorOpen })}>{L.colour} ›</button>}
                      {onColorColumn && menu.colorOpen && (
                        <div className="gdaygrid-swatches" role="group" aria-label={L.colour}>
                          {swatches.map((s) => <button key={s} type="button" className={`gdaygrid-swatch ${s.toLowerCase() === c.color.toLowerCase() ? 'is-on' : ''}`} style={{ background: s }} aria-label={s} onClick={() => { onColorColumn(c.id, s); setMenu(null); }} />)}
                          <label className="gdaygrid-picker" title={L.picker}><input type="color" value={/^#/.test(c.color) ? c.color : '#552583'} onChange={(e) => onColorColumn(c.id, e.target.value)} /><span>{L.picker}</span></label>
                          <button type="button" className="gdaygrid-reset" onClick={() => { onColorColumn(c.id, null); setMenu(null); }}>{L.reset}</button>
                        </div>
                      )}
                      {onHideColumn && <button type="button" role="menuitem" onClick={() => { onHideColumn(c.id, true); setMenu(null); }}>{L.hide}</button>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="gdaygrid-body">
          <div className="gdaygrid-times">
            {hours.map((h) => (
              <div key={h} className="gdaygrid-time">
                <span className="tnum">{fmtHour(h)}</span>
                {overCapacity.has(h) && <span className="gdaygrid-cap" title={L.overCapacity} aria-label={L.overCapacity}><Icon name="warning" size={11} /></span>}
              </div>
            ))}
          </div>
          {cols.map((c) => {
            const { placed, lanes } = laneLayout(itemsFor(c.id));
            const open = c.hours ? minutes(c.hours.open) : null, close = c.hours ? minutes(c.hours.close) : null;
            return (
              <div key={c.id} className="gdaygrid-col" style={{ ['--gdg-tint' as string]: c.color }}
                onClick={onSlotClick && c.id !== '__unassigned' ? (e) => { if ((e.target as HTMLElement).closest('.schedcard')) return; onSlotClick(c.id, slotFromY(e, e.currentTarget)); } : undefined}
                onDragOver={onItemMove ? (e) => e.preventDefault() : undefined}
                onDrop={onItemMove && c.id !== '__unassigned' ? (e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) onItemMove(id, c.id, slotFromY(e, e.currentTarget)); } : undefined}>
                {hours.map((h) => { const on = c.hours === undefined ? false : open != null && close != null && h * 60 >= open && h * 60 < close; return <div key={h} className={`gdaygrid-cell ${on ? 'is-working' : ''} ${c.hours === null ? 'is-off' : ''}`} />; })}
                {placed.map(({ i, s, e, lane }) => {
                  if (e <= startHour * 60 || s >= endHour * 60) return null;
                  const t = Math.max(0, top(s)), b = Math.min(100, top(e));
                  const w = 100 / lanes;
                  return (
                    <div key={i.id} className="gdaygrid-item" style={{ top: `${t}%`, height: `calc(${b - t}% - 3px)`, left: `calc(${lane * w}% + 3px)`, width: `calc(${w}% - 6px)` }}>
                      <ScheduleCard compact status={i.status} tooltip={i.label} time={i.timeLabel} title={i.pet ?? i.label} titleMeta={i.breed} subtitle={i.durationMin >= 60 ? i.customer ?? i.subtitle : undefined}
                        chips={i.durationMin >= 75 ? i.chips : undefined} alerts={flagAlerts(i.flags)} manyAlertsLabel={L.manyAlerts} assigneeColor={c.id === '__unassigned' ? null : c.color}
                        draggable={!!onItemMove} onDragStart={(ev) => { ev.dataTransfer.setData('text/plain', i.id); ev.dataTransfer.effectAllowed = 'move'; }} onOpen={onItemClick ? () => onItemClick(i.id) : undefined} />
                    </div>
                  );
                })}
              </div>
            );
          })}
          {showNow && nowMin > startHour * 60 && nowMin < endHour * 60 && <div className="gdaygrid-now" style={{ top: `${top(nowMin)}%` }}><span className="gdaygrid-nowchip tnum">{fmtClock(nowMin)}</span></div>}
        </div>
      </div>
    </div>
  );
}

export function GroomDayGridLegend({ children }: { children?: ReactNode }) { return <div className="gdaygrid-legend">{children}</div>; }
