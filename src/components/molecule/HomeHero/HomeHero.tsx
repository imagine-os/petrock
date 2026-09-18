import './HomeHero.css';

export interface HomeHeroProps {
  /** Licensed hero photo (Figma Home Page.png: the Encino pool, 390x142). Falls back to a brand gradient until one exists (open question 116). */
  photoUrl?: string | null;
  /** Logo image centred on the photo (Figma: paw mark + "Petrock Hotel and Spa" wordmark). */
  logoUrl?: string;
  alt?: string;
  height?: number;
  className?: string;
}

/** Customer home hero (Figma Home Page.png 0..142): full-bleed photo with the logo mark + wordmark centred over it; no greeting, chip or bell (D-189). */
export function HomeHero({ photoUrl, logoUrl = './brand/petrock-logo-2x.png', alt = 'Petrock Hotel & Spa', height = 142, className = '' }: HomeHeroProps) {
  return (
    <div className={`homehero ${photoUrl ? 'has-photo' : ''} ${className}`} style={{ height, backgroundImage: photoUrl ? `url(${photoUrl})` : undefined }} role="img" aria-label={alt}>
      <span className="homehero-logo"><img src={logoUrl} alt="" /></span>
    </div>
  );
}
