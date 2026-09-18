import type { ReactNode } from 'react';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Icon } from '../../atom/Icon/Icon';
import './PetAvatarCard.css';

export interface PetAvatarCardProps {
  name: string;
  photoUrl?: string | null;
  /** Second line: breed, or "Golden Retriever · 68 lb". */
  subtitle?: ReactNode;
  /** Status chip / badge rendered under the name (VaccineStatusChip, Badge). */
  status?: ReactNode;
  /** Shows a warning triangle next to the status (Figma "Pending & Needs more Details"). */
  warning?: boolean;
  selected?: boolean;
  /** Dim the card (pet not yet approved on a selector). */
  muted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

/** Pet tile with a round photo (or initials), name, subtitle and a status slot. Home strip, My pets grid and the vaccine pet selector use it. */
export function PetAvatarCard({ name, photoUrl, subtitle, status, warning = false, selected = false, muted = false, size = 'md', onClick, className = '' }: PetAvatarCardProps) {
  const Tag = onClick ? 'button' : 'div';
  const avatar = size === 'lg' ? 88 : size === 'sm' ? 56 : 72;
  return (
    <Tag type={onClick ? 'button' : undefined} className={`petcard petcard-${size} ${selected ? 'is-selected' : ''} ${muted ? 'is-muted' : ''} ${onClick ? 'is-interactive' : ''} ${className}`} onClick={onClick} aria-pressed={onClick && selected ? true : undefined}>
      <Avatar name={name} src={photoUrl ?? undefined} size={avatar} kind="pet" />
      <span className="petcard-name">{name}</span>
      {subtitle && <span className="petcard-sub">{subtitle}</span>}
      {status && <span className="petcard-status">{warning && <Icon name="warning" size={14} className="petcard-warn" />}{status}</span>}
    </Tag>
  );
}
