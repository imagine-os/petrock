import type { ReactNode } from 'react';
import './SiteHero.css';

export interface SiteHeroProps { eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; actions?: ReactNode; aside?: ReactNode; tone?: 'brand' | 'soft' | 'plain'; align?: 'left' | 'center'; compact?: boolean }

/** Public-website hero: eyebrow, big title, lead, CTA row and an optional aside (image / card). Brand tone is the purple block of the landing page. */
export function SiteHero({ eyebrow, title, lead, actions, aside, tone = 'brand', align = 'left', compact = false }: SiteHeroProps) {
  return (
    <section className={`shero shero-${tone} shero-${align} ${compact ? 'is-compact' : ''} ${aside ? 'has-aside' : ''}`}>
      <div className="shero-inner container">
        <div className="shero-text">
          {eyebrow && <p className="shero-eyebrow">{eyebrow}</p>}
          <h1 className="shero-title">{title}</h1>
          {lead && <p className="shero-lead">{lead}</p>}
          {actions && <div className="shero-actions">{actions}</div>}
        </div>
        {aside && <div className="shero-aside">{aside}</div>}
      </div>
    </section>
  );
}
