import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import { IconButton } from '../../atom/IconButton/IconButton';
import './Sidebar.css';

export interface SidebarItem { to: string; label: string; icon: IconName; code?: string; badge?: number; end?: boolean }
export interface SidebarGroup { key: string; label: string; icon: IconName; items: SidebarItem[] }
export interface SidebarProps {
  groups: SidebarGroup[];
  /** Collapsed rail (icons only). */
  rail?: boolean;
  onToggleRail?: () => void;
  /** localStorage key for the per-category collapsed state (per role). */
  storageKey?: string;
  header?: ReactNode;
  footer?: ReactNode;
  onNavigate?: () => void;
}

function readSet(key?: string): Set<string> { if (!key) return new Set(); try { const raw = localStorage.getItem(key); return new Set(raw ? (JSON.parse(raw) as string[]) : []); } catch { return new Set(); } }

/**
 * Categorised side menu (D-014): every category collapses on its own, expand-all / collapse-all at the top, and a
 * rail mode for narrow desktops. Groups come from routes with a `nav` entry, filtered by the current role (per-role menus).
 */
export function Sidebar({ groups, rail = false, onToggleRail, storageKey, header, footer, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => readSet(storageKey));
  useEffect(() => { setCollapsed(readSet(storageKey)); }, [storageKey]);
  useEffect(() => { if (storageKey) try { localStorage.setItem(storageKey, JSON.stringify([...collapsed])); } catch { /* ignore */ } }, [collapsed, storageKey]);
  const toggle = useCallback((k: string) => setCollapsed((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; }), []);
  const allCollapsed = useMemo(() => groups.length > 0 && groups.every((g) => collapsed.has(g.key)), [groups, collapsed]);
  const setAll = (on: boolean) => setCollapsed(on ? new Set(groups.map((g) => g.key)) : new Set());

  return (
    <nav className={`sidebar ${rail ? 'is-rail' : ''}`} aria-label="Main menu">
      {header && <div className="sidebar-head">{header}</div>}
      <div className="sidebar-tools">
        {!rail && <button type="button" className="sidebar-tool" onClick={() => setAll(!allCollapsed)}><Icon name={allCollapsed ? 'expand' : 'collapse'} size={14} />{allCollapsed ? 'Expand all' : 'Collapse all'}</button>}
        {onToggleRail && <IconButton icon={rail ? 'chevron-right' : 'chevron-left'} label={rail ? 'Expand menu' : 'Collapse menu'} size="sm" onClick={onToggleRail} className="sidebar-railbtn" />}
      </div>
      <div className="sidebar-scroll">
        {groups.map((g) => {
          const isCollapsed = collapsed.has(g.key) && !rail;
          return (
            <section key={g.key} className={`sidebar-group ${isCollapsed ? 'is-collapsed' : ''}`}>
              <button type="button" className="sidebar-cat" onClick={() => toggle(g.key)} aria-expanded={!isCollapsed} title={g.label}>
                <Icon name={g.icon} size={16} className="sidebar-cat-icon" />
                <span className="sidebar-cat-label">{g.label}</span>
                <Icon name="chevron-down" size={14} className="sidebar-cat-chevron" />
              </button>
              {!isCollapsed && (
                <ul className="sidebar-items">
                  {g.items.map((it) => (
                    <li key={it.to}>
                      <NavLink to={it.to} end={it.end} className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`} title={rail ? it.label : undefined} onClick={onNavigate}>
                        <Icon name={it.icon} size={18} />
                        <span className="sidebar-link-label">{it.label}</span>
                        {it.badge ? <span className="sidebar-badge">{it.badge}</span> : null}
                        {it.code && <code className="sidebar-code">{it.code}</code>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      {footer && <div className="sidebar-foot">{footer}</div>}
    </nav>
  );
}
