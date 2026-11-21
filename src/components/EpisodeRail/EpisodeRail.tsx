import type { Episode } from '../../types';
import './EpisodeRail.css';

/** Tile pitch: --ep-tile-w (486) + 18px gap — Figma Episode slider. */
const PITCH = 486 + 18;

/**
 * How the rail behaves at its end (prototype dev option "Episode slider focus"):
 *  - 'breakaway-1': track stops one tile early; focus walks onto the last tile (default)
 *  - 'breakaway-2': track stops two tiles early
 *  - 'fixed':       focused tile always locked to slot 0
 */
export type RailEndMode = 'breakaway-1' | 'breakaway-2' | 'fixed';

/** Shared slot-0 focus maths for every CTV rail. */
export function railOffsets(index: number, count: number, pitch: number, mode: RailEndMode) {
  const maxOffset = mode === 'fixed' ? Infinity
    : Math.max(0, count - (mode === 'breakaway-1' ? 2 : 3)) * pitch;
  const offset = Math.min(index * pitch, maxOffset);
  return { offset, ringShift: index * pitch - offset };
}

/* --------------------------------------------------------- EpisodeTile */
export interface EpisodeTileProps {
  episode: Episode;
  focused?: boolean;
  /** Short label bottom-left, e.g. "S1:E3". */
  label?: string;
  /** Extra class on the wrap, e.g. "left-of-view". */
  className?: string;
  onClick?: () => void;
}

export function EpisodeTile({ episode: ep, focused, label, className, onClick }: EpisodeTileProps) {
  const hasProgress = ep.progress != null;
  const tileCls = ['episode-tile'];
  if (!ep.image) tileCls.push('loading');
  if (ep.live) tileCls.push('live', 'live-air');
  else if (hasProgress) tileCls.push('live');
  if (focused) tileCls.push('focused');
  const tagCls = ep.live ? 'ep-tag live' : 'ep-tag latest';

  return (
    <div className={'episode-tile-wrap' + (focused ? ' is-focused' : '') + (className ? ' ' + className : '')} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <div className={tileCls.join(' ')} style={ep.image ? { backgroundImage: `url("${ep.image}")` } : undefined}>
        <div className="ep-tags">
          {label && <span className="ep-tag">{label}</span>}
          {ep.tag && <span className={tagCls}>{ep.tag}</span>}
        </div>
        {hasProgress && <div className="ep-progress"><i style={{ width: `${ep.progress}%` }} /></div>}
      </div>
      <div className="episode-title">{ep.title}</div>
      <div className="episode-desc">{ep.description}</div>
      <div className="episode-meta">
        {ep.access && ep.access.length > 0 && (
          <span className="ep-acc">
            {ep.access.map((a) => <span key={a} className={`pill-access ${a.toLowerCase()}`}>{a}</span>)}
          </span>
        )}
        {ep.length && <span className="ep-len">{ep.length}</span>}
        {ep.airDate && <><span className="ep-dot">•</span><span className="ep-date">{ep.airDate}</span></>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- EpisodeRail */
export interface EpisodeRailProps {
  episodes: Episode[];
  focusedIndex: number;
  /** Rail owns focus (shows the ring and dims siblings). */
  hasFocus: boolean;
  /** Section is out of focus — drops to 80%. */
  dim?: boolean;
  endMode?: RailEndMode;
  onEpisodeClick?: (index: number) => void;
}

/**
 * Section 2.5 — landscape episode slider. The focused tile locks to the
 * 112px content inset and the track slides under a fixed focus ring.
 */
export function EpisodeRail({ episodes, focusedIndex, hasFocus, dim, endMode = 'breakaway-1', onEpisodeClick }: EpisodeRailProps) {
  const { offset, ringShift } = railOffsets(focusedIndex, episodes.length, PITCH, endMode);
  return (
    <section className={'episode-rail-shell' + (dim ? ' dim' : '')}>
      <div className={'episode-rail-clip-shell' + (hasFocus ? ' has-focus' : '')}>
        <div className="episode-rail-clip">
          <div className="focus-edge" />
          <div className="episode-rail-track" style={{ transform: `translateX(${-offset}px)` }}>
            {episodes.map((ep, i) => (
              <EpisodeTile
                key={`${ep.series}-${ep.episode}`}
                episode={ep}
                focused={hasFocus && i === focusedIndex}
                label={`S${ep.series}:E${ep.episode}`}
                className={i * PITCH < offset - 1 ? 'left-of-view' : undefined}
                onClick={onEpisodeClick ? () => onEpisodeClick(i) : undefined}
              />
            ))}
          </div>
        </div>
        <div className="episode-tile-focus-ring" style={{ transform: `translateX(${ringShift}px)` }} />
      </div>
    </section>
  );
}
