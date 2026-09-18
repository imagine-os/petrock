import type { ReactNode } from 'react';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './ManualCallout.css';

export type ManualCalloutTone = 'note' | 'warning' | 'decision' | 'tip' | 'in_person' | 'online';
export interface ManualCalloutProps { tone: ManualCalloutTone; children?: ReactNode; title?: string }

const META: Record<ManualCalloutTone, { label: string; icon: IconName }> = {
  note: { label: 'Note', icon: 'info' }, warning: { label: 'Warning', icon: 'warning' }, decision: { label: 'Decision needed', icon: 'flag' },
  tip: { label: 'Tip', icon: 'sparkle' }, in_person: { label: 'In-person lesson', icon: 'users' }, online: { label: 'Online lesson', icon: 'globe' },
};

/** Callout inside a manual chapter (`> NOTE:`, `> WARNING:`, `> DECISION NEEDED:`, `> TIP:`, `> IN PERSON:`, `> ONLINE:`). */
export function ManualCallout({ tone, children, title }: ManualCalloutProps) {
  const m = META[tone];
  return (
    <aside className={`callout callout-${tone}`} role={tone === 'warning' ? 'alert' : 'note'}>
      <span className="callout-icon"><Icon name={m.icon} size={16} /></span>
      <div className="callout-body"><span className="callout-label">{title ?? m.label}</span><div className="callout-text">{children}</div></div>
    </aside>
  );
}
