import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/atom/Button/Button';
import { Icon, type IconName } from '../../../components/atom/Icon/Icon';
import './site.css';

export function SectionHead({ eyebrow, title, lead, center }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; center?: boolean }) {
  return <div className={`ps-section-head ${center ? 'is-center' : ''}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{lead && <p>{lead}</p>}</div>;
}

export function CtaBand({ title = 'Ready to book?', lead = 'Create your account in the Petrock app, add your dog and upload the vaccines once. Every booking after that takes a minute.', primary = { to: '/site/book', label: 'Book now' }, secondary = { to: '/site/contact', label: 'Ask a question' } }: { title?: string; lead?: string; primary?: { to: string; label: string }; secondary?: { to: string; label: string } | null }) {
  return <section className="ps-cta"><div className="stack-sm"><h2>{title}</h2><p>{lead}</p></div><div className="row wrap"><Link to={primary.to}><Button size="lg" iconRight="arrow-right">{primary.label}</Button></Link>{secondary && <Link to={secondary.to}><Button size="lg" variant="secondary">{secondary.label}</Button></Link>}</div></section>;
}

/** Decorative art block (no real photography in the repo yet): brand gradient with an icon. */
export function Art({ icon, label, small }: { icon: IconName; label: string; small?: boolean }) {
  return <div className={`ps-art ${small ? 'is-sm' : ''}`} role="img" aria-label={label}><Icon name={icon} size={small ? 48 : 72} strokeWidth={1.25} /></div>;
}
