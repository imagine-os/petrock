import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { GroomAppointmentCard, type GroomAppointmentFlags } from '../../molecule/GroomAppointmentCard/GroomAppointmentCard';
import { IconButton } from '../../atom/IconButton/IconButton';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './GroomDayGrid.css';

export interface GroomDayGridColumn { id: string; name: string; color: string; hidden?: boolean; /** Working hours for the day: null = off, undefined = unknown (no tint). */ hours?: { open: string; close: string } | null }
export interface GroomDayGridItem { id: string; columnId: string | null; startsAt: string; durationMin: number; label: string; subtitle?: string; status: string; flags?: GroomAppointmentFlags; timeLabel?: string }
export interface GroomDayGridProps {
  columns: GroomDayGridColumn[]; items: GroomDayGridItem[];
  /** Grid start / end hours (24h). */ startHour?: number; endHour?: number; /** Pixel height of one hour. */ hourHeight?: number;
  onItemClick?: (id: string) => void;
  /** Column context menu callbacks (R-X62). */ onMoveColumn?: (id: string, dir: -1 | 1) => void; onColorColumn?: (id: string, color: string | null) => void; onHideColumn?: (id: string, hidden: boolean) => void;
  /** Click on an empty slot: (columnId, HH:MM). */ onSlotClick?: (columnId: string, hhmm: string) => void;
  /** Rows with this many or more overlapping items are shaded (R-G21). */ capacity?: number;
  /** Items moved by drag: (id, columnId, HH:MM). */ onItemMove?: (id: string, columnId: string, hhmm: string) => void;
  swatches?: string[]; showNow?: boolean; emptyText?: string;
}
const DEFAULT_SWATCHES = ['#A5D8A0', '#E79DD1', '#F4D06F', '#F08A8A', '#7B7BE8', '#8A9BB8', '#7FDBDA'];
const pad = (n: number) => String(n).padStart(2, '0');
const minutes = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + (m || 0); };
const fmtHour = (h: number) => `${((h + 11) % 12) + 1}:00 ${h >= 12 ? 'PM' : 'AM'}`;

/**
 * Grooming day view (Grooming.png): time rows x groomer columns tinted with each groomer's working hours, appointment
 * cards positioned by start / duration, a per-column context menu (move left / right, change colour, hide) and an
 * "unassigned" column when items have no groomer. Degrades to horizontal scroll with a sticky time column on phones.
 */
export function GroomDayGrid({ columns, items, startHour = 7, endHour = 18, hourHeight = 64, onItemClick, onMoveColumn, onColorColumn, onHideColumn, onSlotClick, capacity, onItemMove, swatches = DEFAULT_SWATCHES, showNow = true, emptyText }: GroomDayGridProps) {
  const [menu, setMenu] = useState<{ id: string; colorOpen: boolean } | null>(null);
  const [nowMin, setNowMin] = useState(() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setInterval(() => { const d = new Date(); setNowMin(d.getHours() * 60 + d.getMinutes()); }, 60_000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!menu) return; const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setMenu(null); }; document.addEventListener('mousedown', onDoc); return () => document.removeEventListener('mousedown', onDoc); }, [menu]);
  const visible = columns.filter((c) => !c.hidden);
  const hasUnassigned = items.some((i) => !i.columnId || !columns.some((c) => c.id === i.columnId));
  const cols: GroomDayGridColumn[] = hasUnassigned ? [...visible, { id: '__unassigned', name: 'Unassigned', color: 'var(--color-border-strong)', hours: undefined }] : visible;
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

  if (!cols.length) return <EmptyState icon="scissors" title={emptyText ?? 'No groomer columns'} body="Every column is hidden or no groomer works at this location." />;
  return (
    <div className="gdaygrid" ref={ref} style={{ ['--gdg-hour' as string]: `${hourHeight}px`, ['--gdg-cols' as string]: cols.length }}>
      <div className="gdaygrid-scroll">
        <div className="gdaygrid-head">
          <div className="gdaygrid-corner">Time</div>
          {cols.map((c, idx) => (
            <div key={c.id} className="gdaygrid-colhead" style={{ background: c.color }}>
              <span className="gdaygrid-colname">{c.name}</span>
              {c.hours === null && <span className="gdaygrid-off">off today</span>}
              {c.hours && <span className="gdaygrid-off">{c.hours.open}–{c.hours.close}</span>}
              {c.id !== '__unassigned' && (onMoveColumn || onColorColumn || onHideColumn) && (
                <div className="gdaygrid-menuwrap">
                  <IconButton icon="more" label={`Column options for ${c.name}`} size="sm" onClick={() => setMenu((m) => (m?.id === c.id ? null : { id: c.id, colorOpen: false }))} />
                  {menu?.id === c.id && (
                    <div className="gdaygrid-menu" role="menu">
                      {onMoveColumn && <button type="button" role="menuitem" disabled={idx === 0} onClick={() => { onMoveColumn(c.id, -1); setMenu(null); }}>Move left</button>}
                      {onMoveColumn && <button type="button" role="menuitem" disabled={idx >= visible.length - 1} onClick={() => { onMoveColumn(c.id, 1); setMenu(null); }}>Move right</button>}
                      {onColorColumn && <button type="button" role="menuitem" aria-expanded={menu.colorOpen} onClick={() => setMenu({ id: c.id, colorOpen: !menu.colorOpen })}>Change colour ›</button>}
                      {onColorColumn && menu.colorOpen && (
                        <div className="gdaygrid-swatches" role="group" aria-label="Colour">
                          {swatches.map((s) => <button key={s} type="button" className={`gdaygrid-swatch ${s.toLowerCase() === c.color.toLowerCase() ? 'is-on' : ''}`} style={{ background: s }} aria-label={s} onClick={() => { onColorColumn(c.id, s); setMenu(null); }} />)}
                          <label className="gdaygrid-picker" title="Colour picker"><input type="color" value={/^#/.test(c.color) ? c.color : '#552583'} onChange={(e) => onColorColumn(c.id, e.target.value)} /><span>Picker</span></label>
                          <button type="button" className="gdaygrid-reset" onClick={() => { onColorColumn(c.id, null); setMenu(null); }}>Reset</button>
                        </div>
                      )}
                      {onHideColumn && <button type="button" role="menuitem" onClick={() => { onHideColumn(c.id, true); setMenu(null); }}>Hide column</button>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="gdaygrid-body">
          <div className="gdaygrid-times">
            {hours.map((h) => <div key={h} className={`gdaygrid-time ${overCapacity.has(h) ? 'is-over' : ''}`} title={overCapacity.has(h) ? 'Over grooming capacity' : undefined}>{fmtHour(h)}</div>)}
          </div>
          {cols.map((c) => {
            const list = itemsFor(c.id);
            const open = c.hours ? minutes(c.hours.open) : null, close = c.hours ? minutes(c.hours.close) : null;
            return (
              <div key={c.id} className="gdaygrid-col" style={{ ['--gdg-tint' as string]: c.color }}
                onClick={onSlotClick && c.id !== '__unassigned' ? (e) => { if ((e.target as HTMLElement).closest('.gapcard')) return; onSlotClick(c.id, slotFromY(e, e.currentTarget)); } : undefined}
                onDragOver={onItemMove ? (e) => e.preventDefault() : undefined}
                onDrop={onItemMove && c.id !== '__unassigned' ? (e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) onItemMove(id, c.id, slotFromY(e, e.currentTarget)); } : undefined}>
                {hours.map((h) => { const on = c.hours === undefined ? false : open != null && close != null && h * 60 >= open && h * 60 < close; return <div key={h} className={`gdaygrid-cell ${on ? 'is-working' : ''} ${c.hours === null ? 'is-off' : ''} ${overCapacity.has(h) ? 'is-over' : ''}`} />; })}
                {list.map((i) => {
                  const s = minutes(localHm(i.startsAt)); const e = s + i.durationMin;
                  if (e <= startHour * 60 || s >= endHour * 60) return null;
                  const t = Math.max(0, top(s)), b = Math.min(100, top(e));
                  const overlapIdx = list.filter((o) => o.id !== i.id && minutes(localHm(o.startsAt)) < e && minutes(localHm(o.startsAt)) + o.durationMin > s && o.id < i.id).length;
                  return (
                    <div key={i.id} className="gdaygrid-item" style={{ top: `${t}%`, height: `calc(${b - t}% - 2px)`, left: `calc(${4 + overlapIdx * 10}% )`, right: 2 }}>
                      <GroomAppointmentCard label={i.label} subtitle={i.subtitle} timeLabel={i.timeLabel} status={i.status} flags={i.flags} color={c.id === '__unassigned' ? null : c.color} compact={i.durationMin < 45} draggable={!!onItemMove} onDragStart={(ev) => { ev.dataTransfer.setData('text/plain', i.id); ev.dataTransfer.effectAllowed = 'move'; }} onClick={onItemClick ? () => onItemClick(i.id) : undefined} />
                    </div>
                  );
                })}
              </div>
            );
          })}
          {showNow && nowMin > startHour * 60 && nowMin < endHour * 60 && <div className="gdaygrid-now" style={{ top: `${top(nowMin)}%` }} aria-hidden><span /></div>}
        </div>
      </div>
    </div>
  );
}

export function GroomDayGridLegend({ children }: { children?: ReactNode }) { return <div className="gdaygrid-legend">{children}</div>; }
