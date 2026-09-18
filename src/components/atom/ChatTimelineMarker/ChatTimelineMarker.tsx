import type { ReactNode } from 'react';
import './ChatTimelineMarker.css';

export interface ChatTimelineMarkerProps { children?: ReactNode; tone?: 'neutral' | 'primary' | 'system'; className?: string }

/** Centered pill inside a chat timeline: "Session start", day dividers ("Today"), system notes ("Front Desk closed · replies from 7:00 AM"). */
export function ChatTimelineMarker({ children, tone = 'neutral', className = '' }: ChatTimelineMarkerProps) {
  return <div className={`chatmark chatmark-${tone} ${className}`} role="separator" aria-label={typeof children === 'string' ? children : undefined}><span className="chatmark-pill">{children}</span></div>;
}
