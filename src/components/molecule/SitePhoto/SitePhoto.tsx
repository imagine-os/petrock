import './SitePhoto.css';

export interface SitePhotoSources {
  /** Path template of the .webp candidates with `{w}` where the width goes, e.g. `./site/img/dsc06310-{w}.webp`. */
  webp: string;
  /** The .jpg fallback, used as the `src` and by any browser without webp. */
  jpg: string;
  /** Available candidate widths, ascending. */
  widths: number[];
  /** Source pixel size; sets width / height so the box is reserved before the bytes arrive. */
  w: number;
  h: number;
}

export interface SitePhotoProps {
  sources: SitePhotoSources;
  /** Always written: the photo's meaning, not its file name. Empty string only for purely decorative photos. */
  alt: string;
  /** `sizes` for the srcset; default is the full viewport width. */
  sizes?: string;
  /** Above the fold: loads eagerly and decodes synchronously (the hero poster). */
  priority?: boolean;
  /** Crops to this aspect ratio (CSS `aspect-ratio`, e.g. `4 / 3`) instead of keeping the source shape. */
  ratio?: string;
  className?: string;
}

/**
 * A responsive photo: `<picture>` with a webp srcset, a jpg fallback, intrinsic width / height (no layout shift)
 * and lazy loading unless `priority`. Sources are plain paths, so the component stays free of any page's manifest.
 */
export function SitePhoto({ sources, alt, sizes = '100vw', priority = false, ratio, className = '' }: SitePhotoProps) {
  const srcSet = sources.widths.map((w) => `${sources.webp.replace('{w}', String(w))} ${w}w`).join(', ');
  return (
    <picture className={`sphoto ${ratio ? 'is-cropped' : ''} ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img src={sources.jpg} alt={alt} width={sources.w} height={sources.h} loading={priority ? 'eager' : 'lazy'} decoding={priority ? 'sync' : 'async'} />
    </picture>
  );
}
