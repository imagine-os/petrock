import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import { IconButton } from '../../atom/IconButton/IconButton';
import { toIso } from '../../molecule/DatePicker/DatePicker';
import './RoomTimeline.css';

export interface TimelineRow { id: string; label: string; sub?: string; /** Tiny two-letter type badge after the code (Penthouse -> "PH"). Keep it short: the code must stay readable. */ badge?: string }
export interface TimelineGroup { key: string; label: string; rows: TimelineRow[]; /** Tooltip for the count pill (e.g. "4 stays in view"). */ countTitle?: string }
export type TimelineFlag = 'vaccine' | 'unpaid' | 'note' | 'medication';
export interface TimelineBlock {
  id: string; rowId: string;
  /** First night (YYYY-MM-DD). */
  startDay: string;
  /** Check-out day, exclusive. Same as startDay for a single-day item. */
  endDay: string;
  /** Primary label (the pet). */ label: string;
  /** Secondary label (the customer). */ sub?: string;
  /** Booking status (drives the colour, R-I09) or any token key. */
  status: string;
  flags?: TimelineFlag[];
  draggable?: boolean;
}
export interface RoomTimelineProps {
  groups: TimelineGroup[];
  blocks: TimelineBlock[];
  /** First visible day. */
  startDay: string;
  days: number;
  today?: string;
  selectedId?: string | null;
  onBlockClick?: (block: TimelineBlock) => void;
  onCellClick?: (rowId: string, day: string) => void;
  /** Drop handler: block dragged onto (rowId, day). */
  onBlockMove?: (block: TimelineBlock, rowId: string, day: string) => void;
  /** Popover content for the active block. */
  renderDetail?: (block: TimelineBlock, close: () => void) => ReactNode;
  /** Minimum pixel width of a day column (phones scroll horizontally). */
  dayMinWidth?: number;
  /** Translated labels. */
  labels?: { corner?: string; today?: string; close?: string; empty?: string; grid?: string };
}

const shift = (day: string, n: number) => { const d = new Date(day + 'T00:00:00'); d.setDate(d.getDate() + n); return toIso(d); };
const diff = (a: string, b: string) => Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000);
const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const FLAG_ICON: Record<TimelineFlag, { icon: 'warning' | 'dollar' | 'info' | 'plus'; title: string }> = { vaccine: { icon: 'warning', title: 'Vaccine issue' }, unpaid: { icon: 'dollar', title: 'Balance due' }, note: { icon: 'info', title: 'Has notes' }, medication: { icon: 'plus', title: 'Medication' } };
const DEFAULT_LABELS = { corner: 'All rooms', today: 'Today', close: 'Close', empty: 'No rooms at this location.', grid: 'Room timeline' };
/** A bar narrower than this shows a "…" chip instead of its label (the full label stays in the tooltip / aria-label). */
const NARROW_PX = 76;

/**
 * Rooms x days Gantt for hotel stays (D-008). Calm grid: white cells with hairlines, a very light tint on alternating
 * day columns, weekends marked in the header (with only a hint of tint in the cells), a group label cell in grey with a
 * hairline across the row, a sticky day header and a sticky room column (also on phones). Today is a thin dashed line
 * through the grid plus a small pill in the header. Bars are 6 px-radius buttons in the status fill with a dark left
 * edge (Figma), a "Pet · Customer" label that becomes a "…" chip when the bar is narrower than 76 px, and a popover on
 * click, Enter or focus. Drag a bar onto a cell to move it; the popover is the keyboard alternative.
 */
export function RoomTimeline({ groups, blocks, startDay, days, today, selectedId, onBlockClick, onCellClick, onBlockMove, renderDetail, dayMinWidth = 56, labels }: RoomTimelineProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<{ block: TimelineBlock; x: number; y: number } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dayPx, setDayPx] = useState(dayMinWidth);
  const track = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [focusPop, setFocusPop] = useState(false);
  const dayList = useMemo(() => Array.from({ length: days }, (_, i) => shift(startDay, i)), [startDay, days]);
  const endDay = shift(startDay, days);

  useEffect(() => {
    const el = track.current; if (!el) return;
    const measure = () => setDayPx(Math.max(dayMinWidth, el.clientWidth / days));
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [days, dayMinWidth]);
  useEffect(() => {
    if (!active) return;
    const onDoc = (e: MouseEvent) => { const t = e.target as HTMLElement; if (!t.closest('.rtl-pop') && !t.closest('.rtl-block')) setActive(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [active]);
  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);
  // keyboard-activated bars hand focus to the popover so its actions are reachable without a mouse
  useEffect(() => { if (focusPop && pop.current) { pop.current.querySelector<HTMLElement>('button, a, [tabindex]')?.focus(); setFocusPop(false); } }, [focusPop]);

  // week header cells (Sunday-Saturday spans)
  const weeks: { label: string; span: number; from: Date; to: Date }[] = [];
  for (const d of dayList) {
    const dt = new Date(d + 'T00:00:00');
    const last = weeks[weeks.length - 1];
    if (last && dt.getDay() !== 0) { last.span++; last.to = dt; }
    else weeks.push({ label: '', span: 1, from: dt, to: dt });
  }
  const longDay = (dt: Date) => dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  for (const w of weeks) w.label = w.span > 1 ? `${longDay(w.from)} - ${longDay(w.to)}` : longDay(w.from);
  const todayIdx = today ? diff(startDay, today) : -1;
  const showToday = todayIdx >= 0 && todayIdx < days;

  const lanesFor = (rowBlocks: TimelineBlock[]) => {
    const lanes: { end: string }[] = [];
    return rowBlocks.slice().sort((a, b) => a.startDay.localeCompare(b.startDay)).map((b) => {
      const bEnd = b.endDay > b.startDay ? b.endDay : shift(b.startDay, 1);
      let lane = lanes.findIndex((l) => l.end <= b.startDay);
      if (lane < 0) { lanes.push({ end: bEnd }); lane = lanes.length - 1; } else lanes[lane].end = bEnd;
      return { b, lane, lanes: 0 };
    }).map((x, _, arr) => ({ ...x, lanes: Math.max(...arr.map((y) => y.lane)) + 1 }));
  };

  const openBlock = (b: TimelineBlock, el: HTMLElement, fromClick: boolean) => {
    if (fromClick) onBlockClick?.(b);
    if (!renderDetail) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight, popH = 300;
    // below the block by default; above it when that would run off the bottom of the viewport
    const y = r.bottom + 6 + popH > vh ? Math.max(8, r.top - 6 - popH) : r.bottom + 6;
    setActive({ block: b, x: Math.min(Math.max(8, r.left), vw - 328), y });
  };

  return (
    <div className="rtl" style={{ ['--rtl-days' as string]: days, ['--rtl-day-min' as string]: `${dayMinWidth}px`, ['--rtl-today' as string]: showToday ? `${((todayIdx + 0.5) / days) * 100}%` : '-1000%' }}>
      <div className="rtl-scroll">
        <div className="rtl-grid" role="grid" aria-label={L.grid}>
          <div className="rtl-head rtl-weeks" role="row">
            <div className="rtl-corner" />
            <div className="rtl-track rtl-weektrack">{weeks.map((w, i) => <div key={i} className="rtl-week" style={{ flex: w.span }}>{w.label}</div>)}</div>
          </div>
          <div className="rtl-head rtl-dayhead" role="row">
            <div className="rtl-corner rtl-corner-label">{L.corner}</div>
            <div className="rtl-track rtl-daytrack" ref={track}>{dayList.map((d, i) => { const dt = new Date(d + 'T00:00:00'); const we = dt.getDay() === 0 || dt.getDay() === 6; return <div key={d} className={`rtl-day ${d === today ? 'is-today' : ''} ${we ? 'is-weekend' : ''} ${i % 2 ? 'is-alt' : ''}`} role="columnheader" aria-label={d}><span className="rtl-dow">{DOW[dt.getDay()]}</span><span className="rtl-dnum">{dt.getDate()}</span>{d === today ? <span className="rtl-todaytag">{L.today}</span> : null}</div>; })}</div>
          </div>
          {groups.map((g) => {
            const isCollapsed = !!collapsed[g.key];
            const count = blocks.filter((b) => g.rows.some((r) => r.id === b.rowId) && b.startDay < endDay && (b.endDay > startDay || b.startDay >= startDay)).length;
            return (
              <div key={g.key} className="rtl-group">
                <div className="rtl-grouprow" role="row">
                  <button type="button" className="rtl-grouphead" onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))} aria-expanded={!isCollapsed}>
                    <Icon name="chevron-down" size={15} strokeWidth={2.5} className={`rtl-groupcaret ${isCollapsed ? 'is-collapsed' : ''}`} />
                    <span className="rtl-grouplabel">{g.label}</span>
<span className="rtl-groupcount" title={g.countTitle} aria-label={g.countTitle ? `${count} - ${g.countTitle}` : undefined}>{count}</span>
                  </button>
                  <div className="rtl-grouprule" aria-hidden />
                </div>
                {!isCollapsed && g.rows.map((row) => {
                  const rowBlocks = blocks.filter((b) => b.rowId === row.id && b.startDay < endDay && (b.endDay > startDay || (b.endDay === b.startDay && b.startDay >= startDay)));
                  const laid = lanesFor(rowBlocks);
                  const laneCount = laid[0]?.lanes ?? 1;
                  return (
                    <div key={row.id} className="rtl-row" role="row" style={{ ['--rtl-lanes' as string]: laneCount }}>
                      <div className="rtl-label" role="rowheader" title={row.sub}>
                        <span className="rtl-labeltext">{row.label}</span>
                        {row.badge && <span className="rtl-labelbadge" title={row.sub ?? row.badge}>{row.badge}</span>}
                      </div>
                      <div className="rtl-track rtl-cells">
                        {dayList.map((d, i) => { const dt = new Date(d + 'T00:00:00'); const key = `${row.id}|${d}`; return (
                          <div key={d} role="gridcell" className={`rtl-cell ${dt.getDay() === 0 || dt.getDay() === 6 ? 'is-weekend' : ''} ${d === today ? 'is-today' : ''} ${i % 2 ? 'is-alt' : ''} ${dragOver === key ? 'is-over' : ''}`}
                            onClick={onCellClick ? () => onCellClick(row.id, d) : undefined}
                            onDragOver={onBlockMove ? (e) => { e.preventDefault(); if (dragOver !== key) setDragOver(key); } : undefined}
                            onDragLeave={onBlockMove ? () => setDragOver((k) => (k === key ? null : k)) : undefined}
                            onDrop={onBlockMove ? (e) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/petrock-block'); const b = blocks.find((x) => x.id === id); if (b) onBlockMove(b, row.id, d); } : undefined} />
                        ); })}
                        {laid.map(({ b, lane }) => {
                          const s = Math.max(0, diff(startDay, b.startDay));
                          const nights = Math.max(1, diff(b.startDay, b.endDay));
                          const e = Math.min(days, diff(startDay, b.startDay) + nights);
                          const clipStart = b.startDay < startDay, clipEnd = diff(startDay, b.startDay) + nights > days;
                          const left = ((s + (clipStart ? 0 : 0.45)) / days) * 100, right = ((e - (clipEnd ? 0 : 0.45)) / days) * 100;
                          const widthPct = Math.max(right - left, 100 / days / 3);
                          const narrow = (widthPct / 100) * dayPx * days < NARROW_PX;
                          const text = `${b.label}${b.sub ? ` · ${b.sub}` : ''}`;
                          return (
                            <button key={b.id} type="button" className={`rtl-block ${narrow ? 'is-narrow' : ''} ${selectedId === b.id || active?.block.id === b.id ? 'is-selected' : ''} ${clipStart ? 'clip-start' : ''} ${clipEnd ? 'clip-end' : ''}`} data-status={b.status}
                              style={{ left: `${left}%`, width: `${widthPct}%`, top: `calc(4px + ${lane} * (var(--rtl-lane-h) + 3px))` }}
                              title={`${text} · ${b.startDay} → ${b.endDay}`} aria-label={`${text}, ${b.startDay} to ${b.endDay}`}
                              draggable={!!onBlockMove && b.draggable !== false}
                              onDragStart={(ev) => { ev.dataTransfer.setData('text/petrock-block', b.id); ev.dataTransfer.effectAllowed = 'move'; setActive(null); }}
                              onClick={(ev) => { openBlock(b, ev.currentTarget, true); if (ev.detail === 0) setFocusPop(true); }}
                              onFocus={(ev) => openBlock(b, ev.currentTarget, false)}
                              onMouseEnter={(ev) => { const el = ev.currentTarget; if (hoverTimer.current) clearTimeout(hoverTimer.current); hoverTimer.current = setTimeout(() => openBlock(b, el, false), 350); }}
                              onMouseLeave={() => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }}>
                              {narrow ? <span className="rtl-blockdots" aria-hidden>…</span> : <>
                                {b.flags?.length ? <span className="rtl-flags">{b.flags.map((f) => <Icon key={f} name={FLAG_ICON[f].icon} size={12} title={FLAG_ICON[f].title} className={`rtl-flag rtl-flag-${f}`} />)}</span> : null}
                                <span className="rtl-blocktext">{text}</span>
                              </>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {groups.length === 0 && <div className="rtl-empty muted">{L.empty}</div>}
        </div>
      </div>
      {active && renderDetail && (
        <div className="rtl-pop" role="dialog" aria-label={active.block.label} style={{ left: active.x, top: active.y }} ref={pop}>
          <div className="rtl-popclose"><IconButton icon="close" label={L.close} size="sm" onClick={() => setActive(null)} /></div>
          {renderDetail(active.block, () => setActive(null))}
        </div>
      )}
    </div>
  );
}
