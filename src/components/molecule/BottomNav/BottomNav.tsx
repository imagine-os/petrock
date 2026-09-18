import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './BottomNav.css';

export interface BottomNavItem { to: string; label: string; icon: IconName; badge?: number; end?: boolean }
export interface BottomNavProps { items: BottomNavItem[] }

/** Route nav icons -> the Figma Navbar glyphs (I1805:24880;*): home 37, ticket 37x27, paw disc 46x41, gear 34; anything else at 30. */
export const NAV_GLYPH: Partial<Record<string, { icon: IconName; size: number }>> = {
  home: { icon: 'nav-home', size: 37 }, 'nav-home': { icon: 'nav-home', size: 37 },
  calendar: { icon: 'nav-ticket', size: 37 }, ticket: { icon: 'nav-ticket', size: 37 }, 'nav-ticket': { icon: 'nav-ticket', size: 37 },
  paw: { icon: 'nav-paw', size: 46 }, bell: { icon: 'nav-paw', size: 46 }, 'nav-paw': { icon: 'nav-paw', size: 46 },
  settings: { icon: 'nav-settings', size: 34 }, user: { icon: 'nav-settings', size: 34 }, 'nav-settings': { icon: 'nav-settings', size: 34 },
  message: { icon: 'chat-notification', size: 30 },
};

/** Customer app tab bar (Figma Navbar 1824:40233): 71 px primary purple, white unlabelled glyphs, 8 px badge dot on the paw. Labels stay for screen readers. */
export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="bottomnav" aria-label="Primary">
      {items.map((it) => {
        const g = NAV_GLYPH[it.icon] ?? { icon: it.icon, size: 30 };
        return (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `bottomnav-item ${isActive ? 'is-active' : ''}`} title={it.label}>
            <span className="bottomnav-icon"><Icon name={g.icon} size={g.size} strokeWidth={2} />{it.badge ? <span className="bottomnav-badge" aria-label={`${it.badge} unread`} /> : null}</span>
            <span className="sr-only">{it.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
