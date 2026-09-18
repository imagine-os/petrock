import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../../auth/SessionProvider';
import { ROLE_LABEL } from '../../../auth/roles';
import { useTheme } from '../../../design/ThemeProvider';
import { useTable } from '../../../data/DataContext';
import type { NotificationRow } from '../../../data/schema/core';
import { Avatar } from '../../atom/Avatar/Avatar';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Toggle } from '../../atom/Toggle/Toggle';
import { Badge } from '../../atom/Badge/Badge';
import { LocationSwitcher } from '../../molecule/LocationSwitcher/LocationSwitcher';
import { RoleSwitcher } from '../../molecule/RoleSwitcher/RoleSwitcher';
import './TopBar.css';

export interface TopBarProps { title?: ReactNode; onMenu?: () => void; children?: ReactNode; showLocation?: boolean; notificationsTo?: string }

/** Staff / admin top bar: menu (narrow), title, current location, then theme, brand, notifications and the user menu (role switcher, hub, sign out). */
export function TopBar({ title, onMenu, children, showLocation = true, notificationsTo = '/desk/notifications' }: TopBarProps) {
  const { user, role, isSuperAdmin, devMode, setDevMode, viewAs, signOut } = useSession();
  const { theme, toggleTheme, brand, cycleBrand } = useTheme();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { rows: unread } = useTable<NotificationRow>('notifications', { where: { user_id: user.id, read: false } });
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <header className="topbar">
      <div className="topbar-left">
        {onMenu && <IconButton icon="menu" label="Open menu" onClick={onMenu} className="topbar-menu" />}
        {title && <div className="topbar-title">{title}</div>}
        {showLocation && <div className="topbar-loc"><LocationSwitcher compact /></div>}
      </div>
      <div className="topbar-mid">{children}</div>
      <div className="topbar-right">
        <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggleTheme} />
        <IconButton icon="palette" label={`Theme: ${brand} (click to switch)`} onClick={cycleBrand} className="topbar-hide-sm" />
        <IconButton icon="bell" label="Notifications" badge={unread.length} onClick={() => nav(notificationsTo)} />
        <div className="topbar-user" ref={ref}>
          <button type="button" className="topbar-userbtn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
            <Avatar name={user.name} size={32} />
            <span className="topbar-username"><strong>{user.name}</strong><span className="muted xs">{ROLE_LABEL[role]}{viewAs ? ' (view as)' : ''}</span></span>
          </button>
          {open && (
            <div className="topbar-pop" role="menu">
              <div className="topbar-pop-head"><Avatar name={user.name} size={40} /><div><strong>{user.name}</strong><div className="xs muted">{user.email || 'no email'}</div><Badge size="sm" tone="primary">{ROLE_LABEL[user.role]}</Badge></div></div>
              <div className="topbar-pop-section"><div className="eyebrow">Demo session</div><RoleSwitcher /></div>
              {isSuperAdmin && <div className="topbar-pop-section"><Toggle size="sm" checked={devMode} onChange={setDevMode} label="Builder tool (dev mode)" description="Spec chip + inspector on every page, Ctrl+." /></div>}
              <div className="topbar-pop-links"><Link to="/" onClick={() => setOpen(false)}>Testing hub</Link><Link to="/staff/pin" onClick={() => setOpen(false)}>PIN login</Link><button type="button" className="topbar-signout" onClick={() => { signOut(); setOpen(false); nav('/'); }}>Sign out</button></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
