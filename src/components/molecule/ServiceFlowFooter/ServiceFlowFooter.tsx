import type { ReactNode } from 'react';
import { Button } from '../../atom/Button/Button';
import './ServiceFlowFooter.css';

export interface ServiceFlowFooterProps { primaryLabel: string; onPrimary: () => void; primaryDisabled?: boolean; primaryLoading?: boolean; secondaryLabel?: string; onSecondary?: () => void; summary?: ReactNode; hint?: ReactNode; sticky?: boolean }

/** Bottom action bar of a booking step: optional running total on the left, primary Next / Pay button, optional outlined secondary ("Groom another pet"). Sticks above the BottomNav on phones. */
export function ServiceFlowFooter({ primaryLabel, onPrimary, primaryDisabled = false, primaryLoading = false, secondaryLabel, onSecondary, summary, hint, sticky = true }: ServiceFlowFooterProps) {
  return (
    <div className={`flowfooter ${sticky ? 'is-sticky' : ''}`}>
      {summary && <div className="flowfooter-summary">{summary}</div>}
      <div className="flowfooter-actions">
        {secondaryLabel && onSecondary && <Button variant="secondary" onClick={onSecondary} block>{secondaryLabel}</Button>}
        <Button onClick={onPrimary} disabled={primaryDisabled} loading={primaryLoading} block>{primaryLabel}</Button>
      </div>
      {hint && <div className="flowfooter-hint xs muted">{hint}</div>}
    </div>
  );
}
