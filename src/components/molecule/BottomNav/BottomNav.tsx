import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './BottomNav.css';

export interface BottomNavItem { to: string; label: string; icon: IconName; badge?: number; end?: boolean }
export interface BottomNavProps { items: BottomNavItem[] }

/** Customer app tab bar (Home, Bookings, Paw/notifications, Chat, Profile). Sticks to the bottom with safe-area padding. */
export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="bottomnav" aria-label="Primary">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `bottomnav-item ${isActive ? 'is-active' : ''}`}>
          <span className="bottomnav-icon"><Icon name={it.icon} size={22} />{it.badge ? <span className="bottomnav-badge">{it.badge}</span> : null}</span>
          <span className="bottomnav-label">{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
