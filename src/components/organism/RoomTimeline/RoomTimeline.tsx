import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../atom/Icon/Icon';
import { IconButton } from '../../atom/IconButton/IconButton';
import { toIso } from '../../molecule/DatePicker/DatePicker';
import './RoomTimeline.css';

export interface TimelineRow { id: string; label: string; sub?: string }
export interface TimelineGroup { key: string; label: string; rows: TimelineRow[] }
export type TimelineFlag = 'vaccine' | 'unpaid' | 'note' | 'medication';
export interface TimelineBlock {
  id: string; rowId: string;
  /** First night (YYYY-MM-DD). */
  startDay: string;
  /** Check-out day, exclusive. Same as startDay for a single-day item. */
  endDay: string;
  label: string; sub?: string;
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
}

const shift = (day: string, n: number) => { const d = new Date(day + 'T00:00:00'); d.setDate(d.getDate() + n); return toIso(d); };
const diff = (a: string, b: string) => Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000);
const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const FLAG_ICON: Record<TimelineFlag, { icon: 'warning' | 'dollar' | 'info' | 'plus'; title: string }> = { vaccine: { icon: 'warning', title: 'Vaccine issue' }, unpaid: { icon: 'dollar', title: 'Balance due' }, note: { icon: 'info', title: 'Has notes' }, medication: { icon: 'plus', title: 'Medication' } };

/**
 * Rooms x days Gantt for hotel stays (D-008). Skin per Figma `all reservation grooming.jpg` / `front desk-9.jpg`: full week
 * range headers, 54 px day heads with green weekend labels and a black TODAY pill, alternating white / #EEF2F5 day columns,
 * a dashed today line, grey #D9D9D9 group rows with a caret, 54 px room rows with a 32 px grey disc, flat square blocks in
 * the status hue with the flag icons left and a clock right. Blocks start at the check-in half-day and end at the check-out
 * half-day; overlapping blocks stack in lanes. Drag a block onto a cell to move it. Degrades to horizontal scrolling with a
 * sticky room column on phones (D-016).
 */
export function RoomTimeline({ groups, blocks, startDay, days, today, selectedId, onBlockClick, onCellClick, onBlockMove, renderDetail, dayMinWidth = 56 }: RoomTimelineProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<{ block: TimelineBlock; x: number; y: number } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const dayList = useMemo(() => Array.from({ length: days }, (_, i) => shift(startDay, i)), [startDay, days]);
  const endDay = shift(startDay, days);
  useEffect(() => {
    if (!active) return;
    const onDoc = (e: MouseEvent) => { const t = e.target as HTMLElement; if (!t.closest('.rtl-pop') && !t.closest('.rtl-block')) setActive(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [active]);

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

  const openBlock = (b: TimelineBlock, el: HTMLElement) => {
    onBlockClick?.(b);
    if (!renderDetail) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight, popH = 300;
    // below the block by default; above it when that would run off the bottom of the viewport
    const y = r.bottom + 6 + popH > vh ? Math.max(8, r.top - 6 - popH) : r.bottom + 6;
    setActive({ block: b, x: Math.min(Math.max(8, r.left), vw - 328), y });
  };

  return (
    <div className="rtl" ref={wrap} style={{ ['--rtl-days' as string]: days, ['--rtl-day-min' as string]: `${dayMinWidth}px`, ['--rtl-today' as string]: showToday ? `${((todayIdx + 0.5) / days) * 100}%` : '-1000%' }}>
      <div className="rtl-scroll">
        <div className="rtl-grid" role="grid" aria-label="Room timeline">
          <div className="rtl-head rtl-weeks" role="row">
            <div className="rtl-corner" />
            <div className="rtl-track rtl-weektrack">{weeks.map((w, i) => <div key={i} className="rtl-week" style={{ flex: w.span }}>{w.label}</div>)}</div>
          </div>
          <div className="rtl-head rtl-dayhead" role="row">
            <div className="rtl-corner rtl-corner-label">All rooms</div>
            <div className="rtl-track rtl-daytrack">{dayList.map((d, i) => { const dt = new Date(d + 'T00:00:00'); const we = dt.getDay() === 0 || dt.getDay() === 6; return <div key={d} className={`rtl-day ${d === today ? 'is-today' : ''} ${we ? 'is-weekend' : ''} ${i % 2 ? 'is-alt' : ''}`} role="columnheader" aria-label={d}><span className="rtl-dow">{DOW[dt.getDay()]}</span>{d === today ? <span className="rtl-todaytag">TODAY</span> : null}<span className="rtl-dnum">{dt.getDate()}</span></div>; })}</div>
          </div>
          {groups.map((g) => {
            const isCollapsed = !!collapsed[g.key];
            const count = blocks.filter((b) => g.rows.some((r) => r.id === b.rowId) && b.startDay < endDay && (b.endDay > startDay || b.startDay >= startDay)).length;
            return (
              <div key={g.key} className="rtl-group">
                <button type="button" className="rtl-grouphead" onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))} aria-expanded={!isCollapsed}>
                  {g.label} <Icon name="chevron-down" size={16} strokeWidth={2.5} className={`rtl-groupcaret ${isCollapsed ? 'is-collapsed' : ''}`} /><span className="rtl-groupcount">{g.rows.length} rows · {count} in view</span>
                </button>
                {!isCollapsed && g.rows.map((row) => {
                  const rowBlocks = blocks.filter((b) => b.rowId === row.id && b.startDay < endDay && (b.endDay > startDay || (b.endDay === b.startDay && b.startDay >= startDay)));
                  const laid = lanesFor(rowBlocks);
                  const laneCount = laid[0]?.lanes ?? 1;
                  return (
                    <div key={row.id} className="rtl-row" role="row" style={{ ['--rtl-lanes' as string]: laneCount }}>
                      <div className="rtl-label" role="rowheader" title={row.sub}><span className="rtl-disc" aria-hidden /><span className="rtl-labeltext">{row.label}</span>{row.sub && <span className="rtl-labelsub">{row.sub}</span>}</div>
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
                          return (
                            <button key={b.id} type="button" className={`rtl-block ${selectedId === b.id || active?.block.id === b.id ? 'is-selected' : ''} ${clipStart ? 'clip-start' : ''} ${clipEnd ? 'clip-end' : ''}`} data-status={b.status}
                              style={{ left: `${left}%`, width: `${Math.max(right - left, 100 / days / 3)}%`, top: `calc(4px + ${lane} * (var(--rtl-lane-h) + 3px))` }}
                              title={`${b.label}${b.sub ? ` · ${b.sub}` : ''} · ${b.startDay} → ${b.endDay}`}
                              draggable={!!onBlockMove && b.draggable !== false}
                              onDragStart={(ev) => { ev.dataTransfer.setData('text/petrock-block', b.id); ev.dataTransfer.effectAllowed = 'move'; setActive(null); }}
                              onClick={(ev) => openBlock(b, ev.currentTarget)}>
                              {b.flags?.length ? <span className="rtl-flags">{b.flags.map((f) => <Icon key={f} name={FLAG_ICON[f].icon} size={14} title={FLAG_ICON[f].title} className={`rtl-flag rtl-flag-${f}`} />)}</span> : null}
                              <span className="rtl-blocktext">{b.label}{b.sub && <span className="rtl-blocksub">, {b.sub}</span>}</span>
                              <Icon name="clock-filled" size={12} className="rtl-blockclock" />
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
          {groups.length === 0 && <div className="rtl-empty muted">No rooms at this location.</div>}
        </div>
      </div>
      {active && renderDetail && (
        <div className="rtl-pop" role="dialog" aria-label={active.block.label} style={{ left: active.x, top: active.y }}>
          <div className="rtl-popclose"><IconButton icon="close" label="Close" size="sm" onClick={() => setActive(null)} /></div>
          {renderDetail(active.block, () => setActive(null))}
        </div>
      )}
    </div>
  );
}
