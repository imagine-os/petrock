import { useRef, type ChangeEvent } from 'react';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Icon } from '../../atom/Icon/Icon';
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
  className?: string;
}

/** Profile header: avatar with dashed ring and camera badge, name and email (Figma Settings hub). */
export function AccountProfileHero({ name, email, avatarUrl, onPhoto, maxBytes = 1_500_000, onTooLarge, size = 104, className = '' }: AccountProfileHeroProps) {
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
        <Avatar name={name} src={avatarUrl} size={size} />
        {onPhoto && (
          <>
            <button type="button" className="acchero-camera" aria-label="Change photo" onClick={() => fileRef.current?.click()}><Icon name="image" size={14} /></button>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={pick} tabIndex={-1} />
          </>
        )}
      </div>
      <h2 className="acchero-name">{name}</h2>
      {email && <p className="acchero-email">{email}</p>}
    </div>
  );
}
