import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation as useRouterLocation } from 'react-router-dom';
import { useTheme } from '../../../design/ThemeProvider';
import { useTable } from '../../../data/DataContext';
import type { LocationRow } from '../../../data/schema/core';
import { company } from '../../../tenant/locations';
import { Button } from '../../atom/Button/Button';
import { IconButton } from '../../atom/IconButton/IconButton';
import { Icon } from '../../atom/Icon/Icon';
import './SiteLayout.css';

export interface SiteNavItem { to: string; label: string; end?: boolean }
export interface SiteLayoutProps { children: ReactNode; nav?: SiteNavItem[]; ctaTo?: string; ctaLabel?: string; footerNote?: ReactNode }

export const SITE_NAV: SiteNavItem[] = [
  { to: '/site/home', label: 'Home', end: true }, { to: '/site/hotel', label: 'Hotel' }, { to: '/site/grooming', label: 'Grooming & Spa' }, { to: '/site/daycare', label: 'Daycare' },
  { to: '/site/pricing', label: 'Pricing' }, { to: '/site/locations', label: 'Locations' }, { to: '/site/reviews', label: 'Reviews' }, { to: '/site/faq', label: 'FAQ' },
];

/** Public website frame: sticky header with brand, nav (drawer on phones), theme toggle and the book-now CTA; footer with locations, links and the staff entry. Pages render bare inside. */
export function SiteLayout({ children, nav = SITE_NAV, ctaTo = '/site/book', ctaLabel = 'Book now', footerNote }: SiteLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useRouterLocation();
  const [open, setOpen] = useState(false);
  const { rows: locations } = useTable<LocationRow>('locations', { orderBy: { column: 'sort_order' } });
  useEffect(() => { setOpen(false); }, [pathname]);
  return (
    <div className="site2">
      <a className="sr-only site2-skip" href="#site-main">Skip to content</a>
      <header className="site2-head">
        <div className="container site2-head-inner">
          <Link to="/site/home" className="site2-brand"><img src="./brand/petrock-mark.svg" alt="" width={34} height={34} /><span>{company.name}<small>Hotel & Spa</small></span></Link>
          <nav className={`site2-nav ${open ? 'is-open' : ''}`} aria-label="Website">
            {nav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `site2-link ${isActive ? 'is-active' : ''}`}>{n.label}</NavLink>)}
            <div className="site2-nav-cta"><Link to={ctaTo}><Button block>{ctaLabel}</Button></Link></div>
          </nav>
          <div className="site2-tools">
            <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggleTheme} />
            <Link to={ctaTo} className="site2-cta"><Button size="sm">{ctaLabel}</Button></Link>
            <IconButton icon={open ? 'close' : 'menu'} label={open ? 'Close menu' : 'Open menu'} className="site2-burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} />
          </div>
        </div>
      </header>
      {open && <button type="button" className="site2-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <main id="site-main" className="site2-main">{children}</main>
      <footer className="site2-foot">
        <div className="container site2-foot-grid">
          <div className="site2-foot-brand"><img src="./brand/petrock-mark.svg" alt="" width={28} height={28} /><strong>{company.name}</strong><p className="small muted">{company.tagline}</p><p className="xs faint">Dog hotel, daycare and Grooming & Spa in Los Angeles.</p></div>
          {locations.map((l) => <div key={l.id} className="site2-foot-col"><div className="eyebrow">{l.short_name}</div><p className="small">{l.address}</p>{l.phone && <p className="small"><a href={`tel:${l.phone.replace(/[^\d+]/g, '')}`}>{l.phone}</a></p>}</div>)}
          <div className="site2-foot-col"><div className="eyebrow">More</div><Link to="/site/about">About</Link><Link to="/site/policies">Vaccines & policies</Link><Link to="/site/contact">Contact</Link><Link to="/app">Customer app</Link><Link to="/staff/pin"><Icon name="key" size={12} /> Staff</Link></div>
        </div>
        <div className="container site2-foot-legal xs muted"><span>© {new Date().getFullYear()} {company.legalName}</span>{footerNote ?? <Link to="/">Testing hub</Link>}</div>
      </footer>
    </div>
  );
}
