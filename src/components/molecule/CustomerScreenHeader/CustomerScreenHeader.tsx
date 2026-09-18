import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../../atom/IconButton/IconButton';
import './CustomerScreenHeader.css';

export interface CustomerScreenHeaderProps {
  title: ReactNode;
  /** Small line under the title (e.g. "Encino · usually replies in minutes"). */
  subtitle?: ReactNode;
  /** Route for the back chevron; when omitted the header goes back in history. `null` hides the chevron. */
  backTo?: string | null;
  /** Right-hand slot (IconButton, Badge...). */
  actions?: ReactNode;
  /** Stays visible while the screen scrolls (default true). */
  sticky?: boolean;
  /** Left-aligned large title (Language screen) instead of centered. */
  align?: 'center' | 'start';
  className?: string;
}

/** Customer-app screen header: back chevron, centered title, optional right action (Figma Settings / Notification / Front Desk headers). */
export function CustomerScreenHeader({ title, subtitle, backTo, actions, sticky = true, align = 'center', className = '' }: CustomerScreenHeaderProps) {
  const nav = useNavigate();
  const back = backTo === null ? null : () => (backTo ? nav(backTo) : nav(-1));
  return (
    <header className={`cshead cshead-${align} ${sticky ? 'is-sticky' : ''} ${className}`}>
      <div className="cshead-side">{back && <IconButton icon="arrow-left" label="Back" onClick={back} />}</div>
      <div className="cshead-text"><h1 className="cshead-title">{title}</h1>{subtitle && <p className="cshead-sub">{subtitle}</p>}</div>
      <div className="cshead-side cshead-actions">{actions}</div>
    </header>
  );
}
