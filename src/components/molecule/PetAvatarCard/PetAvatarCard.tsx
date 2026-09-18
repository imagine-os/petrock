import type { ReactNode } from 'react';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Icon } from '../../atom/Icon/Icon';
import './PetAvatarCard.css';

export interface PetAvatarCardProps {
  name: string;
  photoUrl?: string | null;
  /** Second line: breed, or "Golden Retriever · 68 lb". */
  subtitle?: ReactNode;
  /** Status line under the name: coloured text (Figma "Pending & Needs more Details"), a StatusBadge pill, a chip... */
  status?: ReactNode;
  /** Shows the warning triangle next to the status (Figma home pet card). */
  warning?: boolean;
  /** 2 px #9D67EF border (home selected pet). */
  selected?: boolean;
  /** Hotel flow selected pet: primary fill with white text (1807:27155). */
  filled?: boolean;
  /** Dim the card (pet not yet approved on a selector). */
  muted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

/** Pet tile (Figma Pets Card 1807:27155/27156): white r10, 60 px round photo, Open Sans 600 14 name, status line; `0 0 5 #441D67` glow when not selected, 2 px #9D67EF border when selected, primary fill in the hotel flow. */
export function PetAvatarCard({ name, photoUrl, subtitle, status, warning = false, selected = false, filled = false, muted = false, size = 'md', onClick, className = '' }: PetAvatarCardProps) {
  const Tag = onClick ? 'button' : 'div';
  const avatar = size === 'lg' ? 76 : size === 'sm' ? 48 : 60;
  return (
    <Tag type={onClick ? 'button' : undefined} className={`petcard petcard-${size} ${selected ? 'is-selected' : ''} ${filled ? 'is-filled' : ''} ${muted ? 'is-muted' : ''} ${onClick ? 'is-interactive' : ''} ${className}`} onClick={onClick} aria-pressed={onClick && (selected || filled) ? true : undefined}>
      <Avatar name={name} src={photoUrl ?? undefined} size={avatar} kind="pet" />
      <span className="petcard-name">{name}</span>
      {subtitle && <span className="petcard-sub">{subtitle}</span>}
      {status && <span className={`petcard-status ${warning ? 'is-warning' : ''}`}>{warning && <Icon name="warning" size={16} className="petcard-warn" />}<span className="petcard-status-text">{status}</span></span>}
    </Tag>
  );
}
