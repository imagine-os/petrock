import { useState } from 'react';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import './ImageCompare.css';

export interface ImageCompareProps { before?: string; after?: string; beforeLabel?: string; afterLabel?: string; alt: string; mode?: 'slider' | 'side' | 'onion' }

/** D-17: two screenshots of the same page, compared by a draggable split, side by side, or blended (onion skin). */
export function ImageCompare({ before, after, beforeLabel = 'before', afterLabel = 'after', alt, mode: initial = 'slider' }: ImageCompareProps) {
  const [mode, setMode] = useState<'slider' | 'side' | 'onion'>(initial);
  const [pos, setPos] = useState(50);
  const missing = !before || !after;
  return (
    <div className="imgc">
      <div className="imgc-bar">
        <SegmentedControl size="sm" ariaLabel="Compare mode" value={mode} onChange={setMode} options={[{ value: 'slider', label: 'Split' }, { value: 'side', label: 'Side by side' }, { value: 'onion', label: 'Blend' }]} />
        {mode !== 'side' && <label className="imgc-range xs muted">{mode === 'slider' ? 'Split' : 'Blend'}<input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label={mode === 'slider' ? 'Split position' : 'Blend amount'} /></label>}
      </div>
      {missing ? <p className="imgc-missing small muted">{!before && !after ? 'No screenshots for this page yet.' : !before ? `No "${beforeLabel}" capture; only "${afterLabel}" exists.` : `No "${afterLabel}" capture; only "${beforeLabel}" exists.`}{(before || after) && <img src={before ?? after} alt={alt} className="imgc-single" />}</p>
      : mode === 'side' ? <div className="imgc-side"><figure><img src={before} alt={`${alt} (${beforeLabel})`} /><figcaption>{beforeLabel}</figcaption></figure><figure><img src={after} alt={`${alt} (${afterLabel})`} /><figcaption>{afterLabel}</figcaption></figure></div>
      : (
        <div className="imgc-stage">
          <img src={before} alt={`${alt} (${beforeLabel})`} />
          <img src={after} alt={`${alt} (${afterLabel})`} className="imgc-top" style={mode === 'slider' ? { clipPath: `inset(0 0 0 ${pos}%)` } : { opacity: pos / 100 }} />
          {mode === 'slider' && <div className="imgc-divider" style={{ left: `${pos}%` }} aria-hidden="true" />}
          <span className="imgc-tag is-left">{beforeLabel}</span><span className="imgc-tag is-right">{afterLabel}</span>
        </div>
      )}
    </div>
  );
}
