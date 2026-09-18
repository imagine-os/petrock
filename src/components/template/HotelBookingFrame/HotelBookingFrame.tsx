import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../atom/Icon/Icon';
import { Stepper } from '../../molecule/Stepper/Stepper';
import './HotelBookingFrame.css';

export interface HotelBookingFrameProps {
  title: string;
  subtitle?: ReactNode;
  backTo?: string;
  onBack?: () => void;
  /** Wizard progress; omit for non-wizard pages (list, detail). */
  steps?: string[];
  step?: number;
  onStepClick?: (i: number) => void;
  /** Right-side header slot (location chip, invoice button). */
  aside?: ReactNode;
  children?: ReactNode;
  /** Sticky action bar above the bottom nav (Next / Pay). */
  footer?: ReactNode;
  footerNote?: ReactNode;
}

/** Customer booking page frame (Figma: back chevron + centered title): header, optional Stepper, scrolling body, sticky footer CTA that clears the BottomNav. */
export function HotelBookingFrame({ title, subtitle, backTo, onBack, steps, step = 0, onStepClick, aside, children, footer, footerNote }: HotelBookingFrameProps) {
  const back = onBack ? <button type="button" className="hbf-back" onClick={onBack} aria-label="Back"><Icon name="chevron-left" size={22} /></button> : backTo ? <Link to={backTo} className="hbf-back" aria-label="Back"><Icon name="chevron-left" size={22} /></Link> : <span className="hbf-back is-empty" />;
  return (
    <div className="hbf">
      <header className="hbf-head">
        {back}
        <div className="hbf-titles"><h1 className="hbf-title">{title}</h1>{subtitle && <div className="hbf-sub">{subtitle}</div>}</div>
        <div className="hbf-aside">{aside}</div>
      </header>
      {steps && <div className="hbf-steps"><Stepper steps={steps} current={step} onStepClick={onStepClick} compact /></div>}
      <div className="hbf-body">{children}</div>
      {footer && <div className="hbf-foot">{footerNote && <div className="hbf-foot-note">{footerNote}</div>}<div className="hbf-foot-actions">{footer}</div></div>}
    </div>
  );
}
