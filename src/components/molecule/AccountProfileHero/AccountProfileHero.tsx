import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Icon, type IconName } from '../../atom/Icon/Icon';
import './AccountProfileHero.css';

export interface AccountProfileHeroProps {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  /** When given, a camera badge opens a file picker and calls back with a data URL (mock upload). */
  onPhoto?: (dataUrl: string) => void;
  /** Max accepted file size in bytes (default 1.5 MB). */
  maxBytes?: number;
  onTooLarge?: () => void;
  size?: number;
  /** Second line override (pet profile: "Breed: Ragdoll"). Wins over `email`. */
  subtitle?: ReactNode;
  /** Pet or person avatar palette. */
  kind?: 'person' | 'pet';
  /** Disc button when there is no photo picker (pet profile: pencil -> edit). */
  action?: { icon: IconName; label: string; onClick: () => void };
  className?: string;
}

/** Profile / pet hero (Figma profile.jpg, Pet Profile (Single Pet).jpg): 110 px avatar in a dashed coral ring, 28 px purple disc bottom-right (camera or pencil), Be Vietnam Pro 600 24 navy name, 14 px muted line. */
export function AccountProfileHero({ name, email, avatarUrl, onPhoto, maxBytes = 1_500_000, onTooLarge, size = 110, subtitle, kind = 'person', action, className = '' }: AccountProfileHeroProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !onPhoto) return;
    if (f.size > maxBytes) { onTooLarge?.(); return; }
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' && onPhoto(reader.result);
    reader.readAsDataURL(f);
  };
  return (
    <div className={`acchero ${className}`}>
      <div className="acchero-avatar" style={{ width: size + 12, height: size + 12 }}>
        <Avatar name={name} src={avatarUrl} size={size} kind={kind} />
        {onPhoto && (
          <>
            <button type="button" className="acchero-camera" aria-label="Change photo" onClick={() => fileRef.current?.click()}><Icon name="image" size={14} /></button>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={pick} tabIndex={-1} />
          </>
        )}
        {!onPhoto && action && <button type="button" className="acchero-camera" aria-label={action.label} onClick={action.onClick}><Icon name={action.icon} size={14} /></button>}
      </div>
      <h2 className="acchero-name">{name}</h2>
      {(subtitle ?? email) && <p className="acchero-email">{subtitle ?? email}</p>}
    </div>
  );
}
