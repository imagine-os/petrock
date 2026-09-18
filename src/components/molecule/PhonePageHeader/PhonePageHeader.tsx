import type { ReactNode } from 'react';
import { CustomerScreenHeader } from '../CustomerScreenHeader/CustomerScreenHeader';

export interface PhonePageHeaderProps { title: string; backTo?: string | -1; actions?: ReactNode; subtitle?: ReactNode; sticky?: boolean; className?: string; rule?: boolean }

/** Alias of CustomerScreenHeader kept for the pages that already import it (kanban dedupe): same Figma header, one CSS. `backTo` omitted hides the chevron. */
export function PhonePageHeader({ title, backTo, actions, subtitle, sticky = true, className = '', rule }: PhonePageHeaderProps) {
  return <CustomerScreenHeader title={title} subtitle={subtitle} actions={actions} sticky={sticky} className={className} rule={rule} backTo={backTo === undefined ? null : backTo} />;
}
