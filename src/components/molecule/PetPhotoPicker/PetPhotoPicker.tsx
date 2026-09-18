import { useRef, type ChangeEvent } from 'react';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Icon } from '../../atom/Icon/Icon';
import './PetPhotoPicker.css';

export interface PetPhotoPickerProps { name: string; value: string | null; onChange: (dataUrl: string | null) => void; size?: number; disabled?: boolean }

/** Downscale to a small square JPEG data URL so it fits comfortably in localStorage (real storage later). */
export function shrinkImage(file: File, px = 160): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = px; c.height = px;
      const ctx = c.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('no canvas')); return; }
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, px, px);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

/** Round pet photo with a camera badge (Pet Edit.png): tap to pick a photo; shows initials until one exists; long-press-free remove link. */
export function PetPhotoPicker({ name, value, onChange, size = 96, disabled = false }: PetPhotoPickerProps) {
  const ref = useRef<HTMLInputElement>(null);
  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try { onChange(await shrinkImage(f)); } catch { /* ignore unreadable file */ }
  };
  return (
    <div className="photopick">
      <button type="button" className="photopick-btn" onClick={() => ref.current?.click()} disabled={disabled} aria-label={value ? 'Change photo' : 'Add photo'} style={{ width: size, height: size }}>
        <Avatar name={name || 'Pet'} src={value} size={size} kind="pet" />
        <span className="photopick-badge" aria-hidden><Icon name="image" size={14} strokeWidth={2} /></span>
      </button>
      <input ref={ref} type="file" accept="image/*" capture="environment" className="sr-only" onChange={onPick} tabIndex={-1} aria-hidden />
      {value && !disabled && <button type="button" className="photopick-remove" onClick={() => onChange(null)}>Remove photo</button>}
    </div>
  );
}
