import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../atom/Icon/Icon';
import './CustomerScreenHeader.css';

export interface CustomerScreenHeaderProps {
  title: ReactNode;
  /** Small line under the title (e.g. "Encino · usually replies in minutes"). */
  subtitle?: ReactNode;
  /** Route for the back chevron; `-1` or omitted goes back in history; `null` hides the chevron. */
  backTo?: string | number | null;
  /** Custom back handler (wizard step back); wins over backTo. */
  onBack?: () => void;
  /** Right-hand slot: a text action (`<Button variant="link">Add Pet</Button>`), IconButton, Badge... */
  actions?: ReactNode;
  /** Stays visible while the screen scrolls (default true). */
  sticky?: boolean;
  /** Left-aligned large title (Language screen) instead of centered. */
  align?: 'center' | 'start';
  /** 1 px #B6B6B6 rule under the header (Figma 1807:27182; settings / list screens have none). Default true. */
  rule?: boolean;
  className?: string;
}

/**
 * The one customer-app screen header (Figma 1805:24876/24877, 443:17888): 40x40 back hit area at x=10 with a 2 px
 * #33363F chevron, Open Sans 600 20 black title centred, optional right text action in primary, 1 px #B6B6B6 rule.
 * Transparent over the screen tone. PhonePageHeader is a thin alias of this component.
 */
export function CustomerScreenHeader({ title, subtitle, backTo, onBack, actions, sticky = true, align = 'center', rule = true, className = '' }: CustomerScreenHeaderProps) {
  const nav = useNavigate();
  const back = onBack ? onBack : backTo === null ? null : () => (typeof backTo === 'string' ? nav(backTo) : nav(-1));
  return (
    <header className={`cshead cshead-${align} ${sticky ? 'is-sticky' : ''} ${rule ? 'has-rule' : ''} ${className}`}>
      <div className="cshead-side">{back && <button type="button" className="cshead-back" onClick={back} aria-label="Back"><Icon name="chevron-left" size={24} strokeWidth={2} /></button>}</div>
      <div className="cshead-text"><h1 className="cshead-title">{title}</h1>{subtitle && <p className="cshead-sub">{subtitle}</p>}</div>
      <div className="cshead-side cshead-actions">{actions}</div>
    </header>
  );
}
