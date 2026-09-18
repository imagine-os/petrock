import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../atom/Icon/Icon';
import './AuthBrandHeader.css';

export interface AuthBrandHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** 'hero' = big mark + wordmark (welcome screen); 'compact' = small mark beside the title (forms). */
  variant?: 'hero' | 'compact';
  /** Route for a back chevron on the left (forms). */
  backTo?: string;
  backLabel?: string;
}

/** Petrock mark + wordmark + title/subtitle block that opens every customer auth screen (Frame 1171276420-423). */
export function AuthBrandHeader({ title, subtitle, variant = 'compact', backTo, backLabel = 'Back' }: AuthBrandHeaderProps) {
  return (
    <header className={`authbrand authbrand-${variant}`}>
      {backTo && <Link to={backTo} className="authbrand-back" aria-label={backLabel}><Icon name="arrow-left" size={18} /></Link>}
      <div className="authbrand-logo">
        <img src="./brand/petrock-mark.svg" alt="" width={variant === 'hero' ? 72 : 40} height={variant === 'hero' ? 72 : 40} />
        <div className="authbrand-word"><span className="authbrand-name">Petrock</span><span className="authbrand-tag">Hotel and Spa</span></div>
      </div>
      {(title || subtitle) && (
        <div className="authbrand-text">
          {title && <h1 className="authbrand-title">{title}</h1>}
          {subtitle && <p className="authbrand-subtitle">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}
