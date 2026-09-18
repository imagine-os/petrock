import type { ReactNode } from 'react';
import { Badge } from '../../atom/Badge/Badge';
import { Icon } from '../../atom/Icon/Icon';
import './PaymentCardTile.css';

export const CARD_BRAND_LABEL: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', discover: 'Discover', other: 'Card' };

export interface PaymentCardTileProps {
  brand: string | null;
  last4: string | null;
  expMonth?: number | null;
  expYear?: number | null;
  holderName?: string | null;
  isDefault?: boolean;
  expired?: boolean;
  selected?: boolean;
  onClick?: () => void;
  actions?: ReactNode;
  className?: string;
}

/** Saved card: brand mark, masked number, expiry, holder, Default / Expired badges and an actions slot (R-M22). */
export function PaymentCardTile({ brand, last4, expMonth, expYear, holderName, isDefault = false, expired = false, selected = false, onClick, actions, className = '' }: PaymentCardTileProps) {
  const b = brand ?? 'other';
  const exp = expMonth && expYear ? `${String(expMonth).padStart(2, '0')}/${String(expYear).slice(-2)}` : null;
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <div className={`paycard paycard-${b} ${selected ? 'is-selected' : ''} ${expired ? 'is-expired' : ''} ${className}`}>
      <Wrapper type={onClick ? 'button' : undefined} className="paycard-main" onClick={onClick} aria-pressed={onClick ? selected : undefined}>
        <span className="paycard-brand" aria-hidden><Icon name="card" size={22} /></span>
        <span className="paycard-text">
          <span className="paycard-title">{CARD_BRAND_LABEL[b] ?? 'Card'} <span className="paycard-num">···· {last4 ?? '••••'}</span></span>
          <span className="paycard-sub">{exp && <>Expires {exp}</>}{exp && holderName && ' · '}{holderName}</span>
        </span>
        <span className="paycard-badges">{isDefault && <Badge tone="primary" size="sm">Default</Badge>}{expired && <Badge tone="danger" size="sm">Expired</Badge>}</span>
      </Wrapper>
      {actions && <div className="paycard-actions">{actions}</div>}
    </div>
  );
}
