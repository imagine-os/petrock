import { useState, type ReactNode } from 'react';
import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import { EmptyState } from '../../molecule/EmptyState/EmptyState';
import './GroomStatusBoard.css';

export interface GroomBoardColumn { key: string; label: string; hint?: string; collapsedByDefault?: boolean }
export interface GroomBoardItem { id: string; status: string; node: ReactNode; sortKey?: string }
export interface GroomStatusBoardProps {
  columns: GroomBoardColumn[]; items: GroomBoardItem[];
  /** Which statuses an item may move to (empty = not movable). */ allowedMoves: (item: GroomBoardItem) => { to: string; label: string; pin?: boolean }[];
  onMove: (item: GroomBoardItem, to: string) => void;
}

/** Kanban by status (D-008: Spa gets Table + Board). Drag between columns or use the per-card "Move to" menu; PIN-gated moves show a lock. */
export function GroomStatusBoard({ columns, items, allowedMoves, onMove }: GroomStatusBoardProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(columns.filter((c) => c.collapsedByDefault).map((c) => c.key)));
  const [over, setOver] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const toggle = (k: string) => setCollapsed((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  if (!items.length) return <EmptyState icon="scissors" title="No appointments for this day" body="Pick another day or add a groom booking." />;
  return (
    <div className="gboard">
      {columns.map((c) => {
        const list = items.filter((i) => i.status === c.key).sort((a, b) => (a.sortKey ?? '').localeCompare(b.sortKey ?? ''));
        const isCollapsed = collapsed.has(c.key);
        return (
          <section key={c.key} className={`gboard-col ${isCollapsed ? 'is-collapsed' : ''} ${over === c.key ? 'is-over' : ''}`} data-status={c.key} aria-label={`${c.label} (${list.length})`}
            onDragOver={(e) => { e.preventDefault(); setOver(c.key); }} onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/plain'); const it = items.find((x) => x.id === id); if (it && it.status !== c.key && allowedMoves(it).some((m) => m.to === c.key)) onMove(it, c.key); }}>
            <button type="button" className="gboard-head" onClick={() => toggle(c.key)} aria-expanded={!isCollapsed}>
              <span className="gboard-dot" /><span className="gboard-title">{c.label}</span><Badge size="sm">{list.length}</Badge>
              <Icon name={isCollapsed ? 'chevron-down' : 'chevron-up'} size={14} className="gboard-chev" />
            </button>
            {c.hint && !isCollapsed && <p className="gboard-hint">{c.hint}</p>}
            {!isCollapsed && (
              <div className="gboard-list">
                {list.length === 0 && <div className="gboard-empty">Drop here</div>}
                {list.map((it) => {
                  const moves = allowedMoves(it);
                  return (
                    <div key={it.id} className="gboard-card" draggable={moves.length > 0} onDragStart={(e) => { e.dataTransfer.setData('text/plain', it.id); e.dataTransfer.effectAllowed = 'move'; }}>
                      {it.node}
                      {moves.length > 0 && (
                        <div className="gboard-move">
                          <button type="button" className="gboard-movebtn" onClick={() => setMenu((m) => (m === it.id ? null : it.id))} aria-haspopup="menu" aria-expanded={menu === it.id}>Move to <Icon name="chevron-down" size={12} /></button>
                          {menu === it.id && (
                            <div className="gboard-menu" role="menu">
                              {moves.map((m) => <button key={m.to} type="button" role="menuitem" onClick={() => { setMenu(null); onMove(it, m.to); }}>{m.pin && <Icon name="lock" size={12} />} {m.label}</button>)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
