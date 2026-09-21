import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, type BadgeTone } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import { ScheduleCard, type ScheduleCardAction, type ScheduleCardProps } from '../../molecule/ScheduleCard/ScheduleCard';
import './AppointmentBoard.css';

export interface BoardColumn {
  key: string; label: string; tone?: BadgeTone;
  /** Dropping here needs approval (lock icon). */ locked?: boolean;
  hint?: string;
  collapsedByDefault?: boolean;
}
/** A board card is a ScheduleCard plus where it lives. */
export interface BoardCard extends Omit<ScheduleCardProps, 'onOpen' | 'compact' | 'selected' | 'draggable' | 'onDragStart' | 'onDragEnd' | 'actions' | 'className' | 'children'> {
  id: string; column: string; sortKey?: string;
}
export interface AppointmentBoardProps {
  columns: BoardColumn[];
  cards: BoardCard[];
  /** Drop / menu move target. Omit to make the board read-only. */
  onMove?: (card: BoardCard, toColumn: string) => void;
  onCardClick?: (card: BoardCard) => void;
  /** Extra menu entries per card, appended after Open and the Move to… entries. */
  cardActions?: (card: BoardCard) => ScheduleCardAction[];
  /** Which columns a card may move to; defaults to every other column when onMove is given. */
  allowedMoves?: (card: BoardCard) => { to: string; label: string; locked?: boolean }[];
  emptyText?: string;
  selectedId?: string | null;
  ariaLabel?: string;
  /** Labels (the module passes them through useT). */
  labels?: { open?: string; more?: string; collapse?: string; expand?: string; locked?: string };
}

const DEFAULT_LABELS = { open: 'Open', more: 'More actions', collapse: 'Collapse column', expand: 'Expand column', locked: 'Needs a manager PIN' };

/**
 * The ONE kanban for schedule surfaces (F-14 Grooming & Spa board, F-31 Grooming board). Columns are statuses:
 * dot + label + count + collapse toggle; cards are ScheduleCards. Move a card by dragging it OR from its "more"
 * menu (never drag-only, D-195). Columns scroll horizontally with scroll-snap, a visible scrollbar and an edge
 * fade so a cut-off column reads as scrollable; they stack on phones.
 */
export function AppointmentBoard({ columns, cards, onMove, onCardClick, cardActions, allowedMoves, emptyText = 'Nothing here', selectedId, ariaLabel = 'Appointment board', labels }: AppointmentBoardProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const [over, setOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(columns.filter((c) => c.collapsedByDefault).map((c) => c.key)));
  const [edge, setEdge] = useState({ left: false, right: false });
  const scroller = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    const el = scroller.current; if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ left: el.scrollLeft > 4, right: max > 4 && el.scrollLeft < max - 4 });
  }, []);
  useEffect(() => {
    const el = scroller.current; if (!el) return;
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [measure, columns.length, cards.length]);

  const toggle = (k: string) => setCollapsed((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const movesFor = (card: BoardCard) => {
    if (!onMove) return [];
    if (allowedMoves) return allowedMoves(card);
    return columns.filter((c) => c.key !== card.column).map((c) => ({ to: c.key, label: c.label, locked: c.locked }));
  };

  return (
    <div className={`boardwrap ${edge.left ? 'has-left' : ''} ${edge.right ? 'has-right' : ''}`}>
      <div className="board" role="list" aria-label={ariaLabel} ref={scroller} onScroll={measure}>
        {columns.map((col) => {
          const list = cards.filter((c) => c.column === col.key).sort((a, b) => (a.sortKey ?? a.time ?? '').localeCompare(b.sortKey ?? b.time ?? ''));
          const isCollapsed = collapsed.has(col.key);
          return (
            <section key={col.key} className={`board-col ${over === col.key ? 'is-over' : ''} ${isCollapsed ? 'is-collapsed' : ''}`} role="listitem" aria-label={`${col.label} (${list.length})`} data-tone={col.tone ?? 'neutral'}
              onDragOver={onMove ? (e) => { e.preventDefault(); if (over !== col.key) setOver(col.key); } : undefined}
              onDragLeave={onMove ? (e) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setOver(null); } : undefined}
              onDrop={onMove ? (e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/petrock-card'); const c = cards.find((x) => x.id === id); setDragging(null); if (c && c.column !== col.key) onMove(c, col.key); } : undefined}>
              <button type="button" className="board-colhead" onClick={() => toggle(col.key)} aria-expanded={!isCollapsed} title={isCollapsed ? L.expand : L.collapse}>
                <span className="board-dot" aria-hidden />
                <span className="board-collabel">{col.label}</span>
                <Badge size="sm">{list.length}</Badge>
                {col.locked && <Icon name="lock" size={13} className="board-lock" title={col.hint ?? L.locked} />}
                <Icon name={isCollapsed ? 'chevron-down' : 'chevron-up'} size={15} className="board-chev" />
              </button>
              {col.hint && !isCollapsed && <p className="board-hint">{col.hint}</p>}
              {!isCollapsed && (
                <div className="board-cards">
                  {list.length === 0 && <p className="board-emptyline">{emptyText}</p>}
                  {list.map((c) => {
                    // ScheduleCard ignores the board-only fields (id / column / sortKey), so the card spreads straight through
                    const actions: ScheduleCardAction[] = [];
                    if (onCardClick) actions.push({ id: 'open', label: L.open, icon: 'eye', onSelect: () => onCardClick(c) });
                    for (const m of movesFor(c)) actions.push({ id: `move:${m.to}`, label: m.label, icon: 'arrow-right', locked: m.locked, onSelect: () => onMove?.(c, m.to) });
                    if (cardActions) actions.push(...cardActions(c));
                    return (
                      <ScheduleCard key={c.id} {...c} className={dragging === c.id ? 'is-dragging' : ''} selected={selectedId === c.id} actions={actions} menuLabel={L.more}
                        draggable={!!onMove} onDragStart={(e) => { e.dataTransfer.setData('text/petrock-card', c.id); e.dataTransfer.effectAllowed = 'move'; setDragging(c.id); }} onDragEnd={() => setDragging(null)}
                        onOpen={onCardClick ? () => onCardClick(c) : undefined} />
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
