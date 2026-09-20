import { useEffect, useState, type ReactNode } from 'react';
import { IconButton } from '../../atom/IconButton/IconButton';
import './SiteHero.css';

/**
 * Background media for `tone="media"`. A YouTube background always renders `poster` underneath, so a blocked,
 * slow or offline embed still shows the photo; the iframe is decorative and never reachable by keyboard.
 */
export type SiteHeroMedia =
  | { kind: 'video-youtube'; id: string; poster: ReactNode; playLabel?: string; pauseLabel?: string }
  | { kind: 'image'; node: ReactNode };

export interface SiteHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** One line under the title (the services strip on the landing page). */
  subhead?: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: 'brand' | 'soft' | 'plain' | 'media';
  align?: 'left' | 'center';
  compact?: boolean;
  /** Full-bleed background layer; only `tone="media"` lays the text over it. */
  media?: SiteHeroMedia;
}

const ytSrc = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&modestbranding=1&disablekb=1`;

/** Autoplay only when motion is welcome, the viewport is wide enough for a background video, and this is not an automated run. */
function videoWelcome(): boolean {
  if (typeof window === 'undefined') return false;
  if (navigator.webdriver) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return window.innerWidth >= 700;
}

/**
 * Public-website hero: eyebrow, big title, lead, call-to-action row and an optional aside (image / card).
 * `tone="brand"` is the purple block of the inner pages; `tone="media"` is the full-bleed landing hero that lays
 * white text over a photo or a muted background video behind a brand scrim, with a real pause / play control.
 */
export function SiteHero({ eyebrow, title, subhead, lead, actions, aside, tone = 'brand', align = 'left', compact = false, media }: SiteHeroProps) {
  const video = media?.kind === 'video-youtube' ? media : null;
  const [playing, setPlaying] = useState(false);
  // Keyed on the id, not the media object: pages build `media` inline, so a re-render must not restart a paused video.
  const videoId = video?.id ?? null;
  useEffect(() => { if (videoId && videoWelcome()) setPlaying(true); }, [videoId]);

  return (
    <section className={`shero shero-${tone} shero-${align} ${compact ? 'is-compact' : ''} ${aside ? 'has-aside' : ''}`}>
      {media && (
        <div className="shero-bg" aria-hidden="true">
          {media.kind === 'image' ? media.node : (
            <>
              {media.poster}
              {playing && <div className="shero-video"><iframe title="" aria-hidden="true" tabIndex={-1} src={ytSrc(media.id)} allow="autoplay; encrypted-media" /></div>}
            </>
          )}
          <span className="shero-scrim" />
        </div>
      )}
      <div className="shero-inner container">
        <div className="shero-text">
          {eyebrow && <p className="shero-eyebrow">{eyebrow}</p>}
          <h1 className="shero-title">{title}</h1>
          {subhead && <p className="shero-subhead">{subhead}</p>}
          {lead && <p className="shero-lead">{lead}</p>}
          {actions && <div className="shero-actions">{actions}</div>}
        </div>
        {aside && <div className="shero-aside">{aside}</div>}
      </div>
      {video && (
        <div className="shero-mediactl">
          <IconButton icon={playing ? 'pause' : 'play'} variant="outline" aria-pressed={playing}
            label={(playing ? video.pauseLabel : video.playLabel) ?? (playing ? 'Pause video' : 'Play video')}
            onClick={() => setPlaying((p) => !p)} />
        </div>
      )}
    </section>
  );
}
