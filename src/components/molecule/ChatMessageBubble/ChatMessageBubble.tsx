import type { ReactNode } from 'react';
import { Avatar } from '../../atom/Avatar/Avatar';
import { Icon } from '../../atom/Icon/Icon';
import './ChatMessageBubble.css';

export type ChatDeliveryState = 'sending' | 'delivered' | 'seen' | 'failed';
export interface ChatMessageBubbleProps {
  text?: string;
  imageUrl?: string | null;
  /** True for the signed-in person's own message (right, primary). */
  mine: boolean;
  time: string;
  /** Sender shown on the left side for "their" messages. */
  senderName?: string;
  senderAvatarUrl?: string | null;
  /** Hide the avatar when the previous bubble is from the same sender. */
  grouped?: boolean;
  /** Delivery state shown under own messages (R-M24). */
  state?: ChatDeliveryState;
  stateLabel?: ReactNode;
  onImageClick?: (url: string) => void;
  className?: string;
}

/** One chat message: own messages right in primary purple, theirs left in a neutral bubble with avatar; image attachment, time and read receipt (R-M24, R-M25). */
export function ChatMessageBubble({ text, imageUrl, mine, time, senderName = 'Front Desk', senderAvatarUrl, grouped = false, state, stateLabel, onImageClick, className = '' }: ChatMessageBubbleProps) {
  return (
    <div className={`chatmsg ${mine ? 'is-mine' : 'is-theirs'} ${grouped ? 'is-grouped' : ''} ${className}`}>
      {!mine && <span className="chatmsg-avatar">{!grouped && <Avatar name={senderName} src={senderAvatarUrl} size={28} />}</span>}
      <div className="chatmsg-col">
        {!mine && !grouped && <span className="chatmsg-sender">{senderName}</span>}
        <div className={`chatmsg-bubble ${imageUrl ? 'has-image' : ''}`}>
          {imageUrl && (
            <button type="button" className="chatmsg-image" onClick={() => onImageClick?.(imageUrl)} aria-label="Open photo">
              <img src={imageUrl} alt={text || 'Photo attachment'} loading="lazy" />
            </button>
          )}
          {text && <p className="chatmsg-text">{text}</p>}
        </div>
        <span className="chatmsg-meta">
          <time>{time}</time>
          {mine && state && (
            <span className={`chatmsg-state chatmsg-state-${state}`}>
              {state === 'sending' && <Icon name="clock" size={12} />}
              {state === 'delivered' && <Icon name="check" size={12} />}
              {state === 'seen' && <><Icon name="check" size={12} /><Icon name="check" size={12} className="chatmsg-check2" /></>}
              {state === 'failed' && <Icon name="warning" size={12} />}
              {stateLabel ?? (state === 'seen' ? 'Seen' : state === 'sending' ? 'Sending' : state === 'failed' ? 'Failed' : 'Delivered')}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
