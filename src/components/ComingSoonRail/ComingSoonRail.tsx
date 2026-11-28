import { railOffsets } from '../EpisodeRail/EpisodeRail';
import './ComingSoonRail.css';

export interface ComingSoonItem {
  id: string;
  title: string;
  /** "1 day to go" etc. — shown in the tag top-left. */
  countdown: string;
  /** 2:3 portrait art. */
  image?: string;
}

export interface ComingSoonRailProps {
  title?: string;
  items: ComingSoonItem[];
  focusedIndex: number;
  hasFocus: boolean;
  onItemClick?: (index: number) => void;
}

/** 234 tile + 17px gap (prototype .cs-rail). */
const PITCH = 234 + 17;

const Calendar = () => (
  <svg viewBox="0 0 20 19" aria-hidden="true">
    <defs>
      <linearGradient id="csCalGrad" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="3.62%" stopColor="rgba(51,221,223,0.95)" />
        <stop offset="49.78%" stopColor="rgba(128,255,181,0.95)" />
        <stop offset="97.76%" stopColor="rgba(244,252,165,0.95)" />
      </linearGradient>
    </defs>
    <path fillRule="evenodd" d="M3 2.4 L3 0.5 L5 0.5 L5 2.4 L14.8 2.4 L14.8 0.5 L16.8 0.5 L16.8 2.4 L19.8 2.4 L19.8 19 L0 19 L0 2.4 Z M1.9 7.9 L1.9 17.1 L17.9 17.1 L17.9 7.9 Z" />
  </svg>
);

/**
 * "Coming soon on ITVX" rail, ported from the VOD Tabs prototype (`.cs-rail`):
 * 234×350 portrait tiles with a "N days to go" tag. The track stops one tile
 * early (breakaway-1) and focus walks onto the last tile, as in the prototype.
 */
export function ComingSoonRail({ title = 'Coming soon on ITVX', items, focusedIndex, hasFocus, onItemClick }: ComingSoonRailProps) {
  const { offset } = railOffsets(focusedIndex, items.length, PITCH, 'breakaway-1');
  return (
    <section className={'cs-rail-shell' + (hasFocus ? ' has-focus' : '')}>
      <div className="cs-rail-title">{title}</div>
      <div className="cs-rail-clip">
        <div className={'cs-rail' + (hasFocus ? ' has-focus' : '')} style={{ transform: `translateX(${-offset}px)` }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              className={'cs-tile' + (hasFocus && i === focusedIndex ? ' focused' : '') + (i * PITCH < offset - 1 ? ' left-of-view' : '')}
              style={item.image ? { backgroundImage: `url("${item.image}")` } : undefined}
              aria-label={`${item.title}, ${item.countdown}`}
              onClick={onItemClick ? () => onItemClick(i) : undefined}
            >
              <span className="cs-tag"><Calendar /><span>{item.countdown}</span></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
