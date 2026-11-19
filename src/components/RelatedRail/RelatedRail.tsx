import type { ReactNode } from 'react';
import type { AccessTag, RelatedProgramme } from '../../types';
import './RelatedRail.css';

/** --grid-tile-w (234) + 18px gap — Figma/FE portrait slider pitch. */
const PITCH = 234 + 18;

/* -------------------------------------------------------- PortraitTile */
export interface PortraitTileProps {
  item: RelatedProgramme;
  focused?: boolean;
  className?: string;
  onClick?: () => void;
}

/** ctvcomponents Portrait tile, 234 × 350. */
export function PortraitTile({ item, focused, className, onClick }: PortraitTileProps) {
  const cls = ['grid-tile'];
  if (focused) cls.push('focused');
  if (className) cls.push(className);
  return (
    <div
      className={cls.join(' ')}
      style={item.image ? { backgroundImage: `url("${item.image}")`, cursor: 'pointer' } : { cursor: 'pointer' }}
      onClick={onClick}
      aria-label={item.title}
    >
      {!item.image && <div className="grid-tile-fallback">{item.title}</div>}
      {item.badge && <div className="grid-tile-badge">{item.badge}</div>}
    </div>
  );
}

/* ------------------------------------------------------------ RailMeta */
/** Figma "_Meta Area Medium Description" — shown under the rail while it has focus. */
export function RailMeta({ item, access = ['AD', 'BSL', 'S'] }: { item?: RelatedProgramme; access?: AccessTag[] }) {
  return (
    <div className="rail-meta" aria-live="polite">
      <div className="rail-meta-row">
        <span className="rail-meta-item">{item?.genre ?? ''}</span>
        <span className="rail-meta-item">{item?.subgenre ?? ''}</span>
        <span className="rail-meta-item">{item?.count ?? ''}</span>
        <span className="rail-meta-tags">
          {access.map((a) => <span key={a} className="rail-meta-tag">{a}</span>)}
        </span>
      </div>
      <p className="rail-meta-desc">{item?.description ?? ''}</p>
    </div>
  );
}

/* ---------------------------------------------------------- RelatedRail */
export interface RelatedRailProps {
  title: ReactNode;
  items: RelatedProgramme[];
  focusedIndex: number;
  hasFocus: boolean;
  dim?: boolean;
  onItemClick?: (index: number) => void;
}

/**
 * Section 3 — "More like this" portrait rail. Focused tile locks to
 * slot 0; tiles scrolled past it fade to 33%. The heading sits at 50%
 * until the rail owns focus, and the meta area appears beneath.
 */
export function RelatedRail({ title, items, focusedIndex, hasFocus, dim, onItemClick }: RelatedRailProps) {
  const offset = focusedIndex * PITCH;
  return (
    <section className={'prompt-area' + (dim ? ' dim' : '')}>
      <div className="prompt-header">
        <div className="prompt-header-title"><span>{title}</span></div>
      </div>
      <div className={'prompt-grid-shell' + (hasFocus ? ' has-focus' : '')}>
        <div className="prompt-grid-clip">
          <div className="focus-edge" />
          <div className="prompt-grid" style={{ transform: `translateX(${-offset}px)` }}>
            {items.map((item, i) => (
              <PortraitTile
                key={item.id}
                item={item}
                focused={hasFocus && i === focusedIndex}
                className={i < focusedIndex ? 'left-of-view' : undefined}
                onClick={onItemClick ? () => onItemClick(i) : undefined}
              />
            ))}
          </div>
        </div>
        <div className="prompt-tile-focus-ring" />
        <RailMeta item={items[focusedIndex]} />
      </div>
    </section>
  );
}
