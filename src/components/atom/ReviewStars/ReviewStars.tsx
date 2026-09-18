import { Icon } from '../Icon/Icon';
import './ReviewStars.css';

export interface ReviewStarsProps { rating: number; max?: number; size?: number; showValue?: boolean; className?: string }

/** Filled / half / empty stars for a 0..5 rating (reviews.jpg drew them unfilled beside "4.0"; here they fill to the value). */
export function ReviewStars({ rating, max = 5, size = 16, showValue = true, className = '' }: ReviewStarsProps) {
  const value = Math.max(0, Math.min(max, rating));
  return (
    <span className={`stars ${className}`} role="img" aria-label={`${value.toFixed(1)} out of ${max} stars`}>
      {showValue && <strong className="stars-value">{value.toFixed(1)}</strong>}
      <span className="stars-row" aria-hidden>
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return <span key={i} className="stars-star" style={{ width: size, height: size }}><Icon name="star" size={size} className="stars-bg" /><span className="stars-fill" style={{ width: `${fill * 100}%` }}><Icon name="star" size={size} className="stars-fg" /></span></span>;
        })}
      </span>
    </span>
  );
}
