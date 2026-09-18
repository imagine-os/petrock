import { Link } from 'react-router-dom';
import { useTable } from '../../data/DataContext';
import type { LocationRow, PackageRow, RoomTypeRow } from '../../data/schema/core';
import { company } from '../../tenant/locations';
import { Button } from '../../components/atom/Button/Button';
import { Card } from '../../components/molecule/Card/Card';
import { Icon } from '../../components/atom/Icon/Icon';
import { fmtMoney } from '../../pricing/engine';
import './public.css';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmt = (t: string) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''}${h >= 12 ? 'pm' : 'am'}`; };

/** P-00 public landing placeholder (petrockhotel.com is Squarespace today; website rebuild is a later phase). Facts come from tables. */
export function LandingPage() {
  const { rows: locations } = useTable<LocationRow>('locations', { orderBy: { column: 'sort_order' } });
  const { rows: roomTypes } = useTable<RoomTypeRow>('room_types', { orderBy: { column: 'sort_order' } });
  const { rows: packages } = useTable<PackageRow>('packages', { orderBy: { column: 'sort_order' } });
  return (
    <div className="site">
      <header className="site-head container"><Link to="/site" className="site-brand"><img src="./brand/petrock-mark.svg" alt="" width={32} height={32} />{company.name}</Link><nav className="site-nav"><a href="#rooms">Hotel</a><a href="#grooming">Grooming & Spa</a><a href="#locations">Locations</a><Link to="/app"><Button size="sm">Book in the app</Button></Link></nav></header>
      <section className="site-hero container">
        <p className="eyebrow">Dog hotel & spa · Encino & Westwood</p>
        <h1>{company.tagline}</h1>
        <p className="muted md">Penthouses and suites with nightly photos, daycare with real playtime, and Grooming & Spa packages for every size. Book from the Petrock app.</p>
        <div className="row wrap"><Link to="/app"><Button size="lg" iconRight="arrow-right">Open the app</Button></Link><Link to="/staff/pin"><Button size="lg" variant="ghost" icon="key">Staff</Button></Link></div>
        <p className="xs faint">P-00 placeholder. The public website rebuild (P-01…P-19) is a later phase; petrockhotel.com stays on Squarespace until then.</p>
      </section>
      <section id="rooms" className="container site-section"><h2>Hotel rooms</h2><div className="grid grid-2">{roomTypes.map((rt) => <Card key={rt.id} padding="lg"><h3>{rt.name}</h3><p className="muted small">{rt.description}</p></Card>)}</div></section>
      <section id="grooming" className="container site-section"><h2>Grooming & Spa</h2><div className="grid grid-3">{packages.map((p) => <Card key={p.id} padding="lg"><div className="row-between"><h3>{p.name}</h3><span className="site-price">{fmtMoney(p.price_s)}–{fmtMoney(p.price_giant)}</span></div><p className="muted small">{p.inclusions}</p></Card>)}</div></section>
      <section id="locations" className="container site-section"><h2>Locations</h2><div className="grid grid-2">{locations.map((l) => <Card key={l.id} padding="lg"><h3><Icon name="location" size={18} /> {l.name}</h3><p className="small">{l.address}</p><p className="small muted">{l.phone}</p><ul className="site-hours">{[1, 6, 0].map((d) => <li key={d}><span>{d === 1 ? 'Mon–Fri' : DAY[d]}</span><span>{l.hours?.[String(d)] ? `${fmt(l.hours[String(d)]!.open)} – ${fmt(l.hours[String(d)]!.close)}` : 'Closed'}</span></li>)}</ul></Card>)}</div></section>
      <footer className="container site-foot xs muted"><span>© {new Date().getFullYear()} {company.legalName}</span><Link to="/">Testing hub</Link></footer>
    </div>
  );
}
