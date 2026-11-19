import type { Cta } from '../../types';
import { CtaIconSvg, PlayIcon } from '../icons';
import './CtaTower.css';

export interface CtaTowerProps {
  /** First entry is the primary CTA; the rest are secondaries (max 3). */
  ctas: Cta[];
  /** Index of the focused CTA, or -1 when focus is elsewhere. */
  focusedIndex: number;
  /** 0–100: shows the progress indicator under the primary (continue watching / live). */
  progress?: number;
  live?: boolean;
  onSelect?: (index: number) => void;
}

/**
 * Figma "CTA TOWER" — 610px primary pill on top, secondaries split the
 * row beneath. Pick the 2 / 3 / 4-button variant by passing 2–4 CTAs;
 * the page adds the matching .tower-2 / .tower-3 class to .app.
 */
export function CtaTower({ ctas, focusedIndex, progress, live, onSelect }: CtaTowerProps) {
  const [primary, ...secondaries] = ctas;
  return (
    <div className="vod-cta-row">
      {primary && (
        <div
          className={'vod-cta primary' + (focusedIndex === 0 ? ' focused' : '')}
          data-cta="0"
          role="button"
          onClick={() => onSelect?.(0)}
        >
          <PlayIcon />
          <span id="ctaPlayLabel">{primary.label}</span>
          <div className="progress" />
        </div>
      )}
      {progress != null && (
        <div className={'cta-tower-progress' + (live ? ' live' : '')} style={{ display: 'block' }}>
          <i style={{ width: `${progress}%` }} />
        </div>
      )}
      {secondaries.slice(0, 3).map((c, i) => (
        <div
          key={c.id}
          className={'vod-cta secondary' + (focusedIndex === i + 1 ? ' focused' : '')}
          data-cta={i + 1}
          role="button"
          onClick={() => onSelect?.(i + 1)}
        >
          <CtaIconSvg icon={c.icon} />
          <span>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
