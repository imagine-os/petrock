import { Link } from 'react-router-dom';
import './Figure.css';

export interface FigureProps { src?: string; alt: string; caption?: string; code?: string; to?: string; width?: number | string; placeholder?: boolean }

/** Framed screenshot with caption and page-code chip (ops manual, page docs). Without src it renders a dashed placeholder. */
export function Figure({ src, alt, caption, code, to, width, placeholder }: FigureProps) {
  return (
    <figure className="figure" style={{ maxWidth: width }}>
      {src && !placeholder ? <img src={src} alt={alt} loading="lazy" /> : <div className="figure-ph" role="img" aria-label={alt}>screenshot: {code ?? alt}</div>}
      {(caption || code) && (
        <figcaption>
          {code && (to ? <Link to={to} className="figure-code">{code}</Link> : <code className="figure-code">{code}</code>)}
          {caption && <span>{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}
