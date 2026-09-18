import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../../auth/SessionProvider';
import { ROLE_LABEL } from '../../../auth/roles';
import { useTheme } from '../../../design/ThemeProvider';
import { useTable } from '../../../data/DataContext';
import type { NotificationRow } from '../../../data/schema/core';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Button } from '../../atom/Button/Button';
import { Icon } from '../../atom/Icon/Icon';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Input } from '../../atom/Input/Input';
import { Toggle } from '../../atom/Toggle/Toggle';
import { Badge } from '../../atom/Badge/Badge';
import { SegmentedControl } from '../../molecule/SegmentedControl/SegmentedControl';
import { LocationSwitcher } from '../../molecule/LocationSwitcher/LocationSwitcher';
import { RoleSwitcher } from '../../molecule/RoleSwitcher/RoleSwitcher';
import './TopBar.css';

export interface TopBarProps {
  title?: ReactNode;
  onMenu?: () => void;
  children?: ReactNode;
  showLocation?: boolean;
  notificationsTo?: string;
  /** Route the search submits to (`?q=` appended); omitted = no search box. */
  searchTo?: string;
  /** Primary action ("New booking" 613:20421); omitted = hidden. */
  newBookingTo?: string;
  /** Chat-notification icon target; omitted = hidden. */
  chatTo?: string;
  /** "Help" link target; omitted = hidden. */
  helpTo?: string;
}

/**
 * Staff / admin top bar (Figma 593:16049): 80 tall white with a 1 px #EDEDED rule; search 320x48 left, then the current
 * location (binding rule, Figma has none); right cluster gap 15: "New Booking" 172x47 purple button (text only, as the
 * `front desk.jpg` export shows it), chat, Help, bell, avatar 32 + name + chevron. The user menu holds the demo role switcher, appearance (theme / brand) and the builder-tool toggle.
 */
export function TopBar({ title, onMenu, children, showLocation = true, notificationsTo = '/desk/notifications', searchTo, newBookingTo, chatTo, helpTo }: TopBarProps) {
  const { user, role, isSuperAdmin, devMode, setDevMode, viewAs, signOut } = useSession();
  const { theme, toggleTheme, brand, cycleBrand } = useTheme();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const { rows: unread } = useTable<NotificationRow>('notifications', { where: { user_id: user.id, read: false } });
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const submitSearch = (e: FormEvent) => { e.preventDefault(); if (searchTo && q.trim()) nav(`${searchTo}?q=${encodeURIComponent(q.trim())}`); };
  return (
    <header className="topbar">
      <div className="topbar-left">
        {onMenu && <IconButton icon="menu" label="Open menu" onClick={onMenu} className="topbar-menu" />}
        {searchTo && <form className="topbar-search" role="search" onSubmit={submitSearch}><Input icon="search" placeholder="Search" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} /></form>}
        {title && <div className="topbar-title">{title}</div>}
        {showLocation && <div className="topbar-loc"><LocationSwitcher compact /></div>}
      </div>
      <div className="topbar-mid">{children}</div>
      <div className="topbar-right">
        {newBookingTo && <Button onClick={() => nav(newBookingTo)} className="topbar-new">New Booking</Button>}
        {chatTo && <IconButton icon="chat-notification" label="Front desk chat" onClick={() => nav(chatTo)} className="topbar-hide-sm" />}
        {helpTo && <Link to={helpTo} className="topbar-help topbar-hide-sm"><Icon name="question" size={24} />Help</Link>}
        <IconButton icon="bell" label="Notifications" badge={unread.length} onClick={() => nav(notificationsTo)} />
        <div className="topbar-user" ref={ref}>
          <button type="button" className="topbar-userbtn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
            <Avatar name={user.name} size={32} />
            <span className="topbar-username"><strong>{user.name}</strong><span className="muted xs">{ROLE_LABEL[role]}{viewAs ? ' (view as)' : ''}</span></span>
            <Icon name="chevron-down" size={20} className="topbar-caret" />
          </button>
          {open && (
            <div className="topbar-pop" role="menu">
              <div className="topbar-pop-head"><Avatar name={user.name} size={40} /><div><strong>{user.name}</strong><div className="xs muted">{user.email || 'no email'}</div><Badge size="sm" tone="primary">{ROLE_LABEL[user.role]}</Badge></div></div>
              <div className="topbar-pop-section"><div className="eyebrow">Demo session</div><RoleSwitcher /></div>
              <div className="topbar-pop-section"><div className="eyebrow">Appearance</div><div className="row wrap"><SegmentedControl size="sm" ariaLabel="Theme" value={theme} onChange={() => toggleTheme()} options={[{ value: 'light', label: 'Light', icon: 'sun' }, { value: 'dark', label: 'Dark', icon: 'moon' }]} /><Button variant="ghost" size="sm" icon="palette" onClick={cycleBrand}>Brand: {brand}</Button></div></div>
              {isSuperAdmin && <div className="topbar-pop-section"><Toggle size="sm" checked={devMode} onChange={setDevMode} label="Builder tool (dev mode)" description="Spec chip + inspector on every page, Ctrl+." /></div>}
              <div className="topbar-pop-links"><Link to="/" onClick={() => setOpen(false)}>Testing hub</Link><Link to="/staff/pin" onClick={() => setOpen(false)}>PIN login</Link><button type="button" className="topbar-signout" onClick={() => { signOut(); setOpen(false); nav('/'); }}>Sign out</button></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
