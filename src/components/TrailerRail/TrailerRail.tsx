import { TrailerPlayBadge } from '../icons';
import './TrailerRail.css';

export interface Trailer {
  id: string;
  label: string;
  /** Still frame behind the play badge. */
  image?: string;
  /** Embed URL (e.g. YouTube nocookie) loaded when playing. */
  embedUrl?: string;
}

export interface TrailerRailProps {
  visible: boolean;
  trailers: Trailer[];
  focusedIndex: number;
  hasFocus: boolean;
  /** Id of the trailer currently playing, if any. */
  playingId?: string | null;
  marginTop?: number;
  shellRef?: React.Ref<HTMLElement>;
}

/** Trailers tab content — one 486×274 tile per series trailer, newest first. */
export function TrailerRail({ visible, trailers, focusedIndex, hasFocus, playingId, marginTop, shellRef }: TrailerRailProps) {
  return (
    <section ref={shellRef} className={'trailer-shell' + (visible ? ' show' : '')} style={marginTop ? { marginTop } : undefined}>
      <div className={'trailer-rail' + (hasFocus ? ' has-focus' : '')}>
        {trailers.map((t, i) => {
          const playing = playingId === t.id;
          const focused = hasFocus && i === focusedIndex;
          const cls = ['trailer-tile'];
          if (focused) cls.push('focused');
          if (playing) cls.push('playing');
          return (
            <div key={t.id} className={'trailer-tile-wrap' + (focused ? ' is-focused' : '')}>
              <div className={cls.join(' ')}>
                <div className="trailer-tile-still" style={t.image ? { backgroundImage: `url("${t.image}")` } : undefined}>
                  <TrailerPlayBadge />
                </div>
                {playing && t.embedUrl && (
                  <iframe src={t.embedUrl} title={t.label} allow="autoplay; encrypted-media" tabIndex={-1} />
                )}
              </div>
              <div className="trailer-tile-label">{t.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
