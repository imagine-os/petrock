import { useState, type ReactNode } from 'react';
import { Badge, type BadgeTone } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './AppointmentBoard.css';

export interface BoardColumn { key: string; label: string; tone?: BadgeTone; /** Dropping here needs approval (lock icon). */ locked?: boolean; hint?: string }
export interface BoardCard { id: string; column: string; title: string; subtitle?: string; time?: string; meta?: ReactNode; flags?: ReactNode; /** Left accent colour (groomer colour). */ accent?: string | null; sortKey?: string }
export interface AppointmentBoardProps { columns: BoardColumn[]; cards: BoardCard[]; onMove?: (card: BoardCard, toColumn: string) => void; onCardClick?: (card: BoardCard) => void; emptyText?: string; selectedId?: string | null }

/** Kanban of Grooming & Spa appointments by status (D-008: Spa gets Table + Board). Drag a card to another column to change status; locked columns mark PIN-gated moves. Columns stack on phones. */
export function AppointmentBoard({ columns, cards, onMove, onCardClick, emptyText = 'Nothing here', selectedId }: AppointmentBoardProps) {
  const [over, setOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  return (
    <div className="board" role="list" aria-label="Appointment board">
      {columns.map((col) => {
        const list = cards.filter((c) => c.column === col.key).sort((a, b) => (a.sortKey ?? a.time ?? '').localeCompare(b.sortKey ?? b.time ?? ''));
        return (
          <section key={col.key} className={`board-col ${over === col.key ? 'is-over' : ''}`} role="listitem" aria-label={col.label}
            onDragOver={onMove ? (e) => { e.preventDefault(); if (over !== col.key) setOver(col.key); } : undefined}
            onDragLeave={onMove ? (e) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setOver(null); } : undefined}
            onDrop={onMove ? (e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/petrock-card'); const c = cards.find((x) => x.id === id); setDragging(null); if (c && c.column !== col.key) onMove(c, col.key); } : undefined}>
            <header className="board-colhead">
              <Badge tone={col.tone ?? 'neutral'} dot>{col.label}</Badge>
              <span className="board-count mono xs">{list.length}</span>
              {col.locked && <Icon name="lock" size={13} className="board-lock" title={col.hint ?? 'Needs a manager PIN'} />}
            </header>
            <div className="board-cards">
              {list.length === 0 && <div className="board-empty"><EmptyState compact icon="scissors" title={emptyText} /></div>}
              {list.map((c) => (
                <article key={c.id} className={`board-card ${dragging === c.id ? 'is-dragging' : ''} ${selectedId === c.id ? 'is-selected' : ''}`} style={c.accent ? { borderLeftColor: c.accent } : undefined}
                  draggable={!!onMove} tabIndex={0} role={onCardClick ? 'button' : undefined}
                  onDragStart={(e) => { e.dataTransfer.setData('text/petrock-card', c.id); e.dataTransfer.effectAllowed = 'move'; setDragging(c.id); }} onDragEnd={() => setDragging(null)}
                  onClick={onCardClick ? () => onCardClick(c) : undefined} onKeyDown={onCardClick ? (e) => { if (e.key === 'Enter') onCardClick(c); } : undefined}>
                  <div className="board-cardtop">{c.time && <span className="board-time mono">{c.time}</span>}{c.flags && <span className="board-flags">{c.flags}</span>}</div>
                  <div className="board-title">{c.title}</div>
                  {c.subtitle && <div className="board-sub muted xs">{c.subtitle}</div>}
                  {c.meta && <div className="board-meta">{c.meta}</div>}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
