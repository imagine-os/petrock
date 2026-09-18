import { useEffect, useRef, useState } from 'react';
import { Badge } from '../../atom/Badge/Badge';
import './ViewportFrame.css';

export interface ViewportFrameProps {
  /** Hash route inside this app, e.g. '/desk'. Rendered as `./#<route>` so the same build serves it. */
  route: string;
  width: number;
  height?: number;
  label?: string;
  /** Scale the frame down to fit its container (default true). */
  fit?: boolean;
  onLoad?: (doc: Document | null) => void;
}

/** D-13: the app at a fixed viewport width inside an iframe, scaled to fit. Same origin, so pages can inspect the document. */
export function ViewportFrame({ route, width, height = 800, label, fit = true, onLoad }: ViewportFrameProps) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!fit || !box.current) return;
    const el = box.current;
    const ro = new ResizeObserver(() => setScale(Math.min(1, (el.clientWidth - 2) / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit, width]);
  const src = `${window.location.pathname}${window.location.search}#${route}`;
  return (
    <figure className="vpf" ref={box}>
      <figcaption className="vpf-cap"><span>{label ?? route}</span><Badge size="sm" tone="primary">{width} px</Badge>{scale < 1 && <span className="xs faint">{Math.round(scale * 100)} %</span>}</figcaption>
      <div className="vpf-stage" style={{ height: height * scale }}>
        <iframe title={`${label ?? route} at ${width}px`} src={src} width={width} height={height} style={{ transform: `scale(${scale})` }} loading="lazy" onLoad={(e) => onLoad?.((e.target as HTMLIFrameElement).contentDocument)} />
      </div>
    </figure>
  );
}
