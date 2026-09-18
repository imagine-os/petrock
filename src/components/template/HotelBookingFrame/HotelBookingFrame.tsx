import type { ReactNode } from 'react';
import { CustomerScreenHeader } from '../../molecule/CustomerScreenHeader/CustomerScreenHeader';
import { Stepper } from '../../molecule/Stepper/Stepper';
import './HotelBookingFrame.css';

export interface HotelBookingFrameProps {
  title: string;
  subtitle?: ReactNode;
  backTo?: string;
  onBack?: () => void;
  /** Wizard progress; the hotel flow passes none (D-191), grooming / daycare may. */
  steps?: string[];
  step?: number;
  onStepClick?: (i: number) => void;
  /** Right-side header slot (text action, invoice button). */
  aside?: ReactNode;
  children?: ReactNode;
  /** Action bar above the bottom nav (Next / Pay); flat on the screen tone like the Figma frames. */
  footer?: ReactNode;
  footerNote?: ReactNode;
  /** Sticky footer (default true); false lets the CTA scroll with the body as in Booking Detail.jpg. */
  stickyFooter?: boolean;
}

/** Customer booking screen frame (Figma Hotel Reservation.png, Booking Detail.jpg): CustomerScreenHeader with the #B6B6B6 rule, optional Stepper, 20 px gutter body on the form tone, flat CTA footer that clears the BottomNav. */
export function HotelBookingFrame({ title, subtitle, backTo, onBack, steps, step = 0, onStepClick, aside, children, footer, footerNote, stickyFooter = true }: HotelBookingFrameProps) {
  return (
    <div className="hbf">
      <CustomerScreenHeader title={title} subtitle={subtitle} backTo={backTo ?? (onBack ? -1 : null)} onBack={onBack} actions={aside} className="hbf-head" />
      {steps && <div className="hbf-steps"><Stepper steps={steps} current={step} onStepClick={onStepClick} compact /></div>}
      <div className="hbf-body">{children}</div>
      {footer && <div className={`hbf-foot ${stickyFooter ? 'is-sticky' : ''}`}>{footerNote && <div className="hbf-foot-note">{footerNote}</div>}<div className="hbf-foot-actions">{footer}</div></div>}
    </div>
  );
}
