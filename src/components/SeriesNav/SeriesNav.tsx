import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronIcon } from '../icons';
import './SeriesNav.css';

export interface SeriesNavTab {
  id: string;
  label: string;
  /** Renders as the EPISODES ▾ dropdown trigger for the series sub nav. */
  trigger?: boolean;
}

export interface SeriesNavProps {
  tabs: SeriesNavTab[];
  /** Focused tab index, or -1 when the tab row doesn't own focus. */
  focusedTab: number;
  /** Series numbers in sub nav order (newest first). */
  series: number[];
  activeSeries: number | null;
  /** Show the series chips row under the tabs. */
  subNavVisible: boolean;
  /** Sub nav open (trigger chevron flipped). */
  subNavOpen: boolean;
  /** Focused chip (series number) or null. */
  focusedSeries: number | null;
  /** Label for a series chip when expanded. */
  seriesLabel?: (n: number) => string;
  onTabClick?: (index: number) => void;
  onSeriesClick?: (n: number) => void;
}

const TRACK_GAP = 12; // --spacing-04, Figma Top Tabs gap
const CHIP_GAP = 8;
/** Tabs/chips only start sliding once focus passes the 4th slot. */
const LOCK_SLOT = 3;

/**
 * Section 2 — series navigation. A tab row (EPISODES ▾ / About /
 * Trailers / Related) plus, beneath the trigger, a sub nav of 60px
 * numeric chips that expand to "SERIES N" when focused or active.
 */
export function SeriesNav({
  tabs, focusedTab, series, activeSeries, subNavVisible, subNavOpen, focusedSeries,
  seriesLabel = (n) => `Series ${n}`, onTabClick, onSeriesClick,
}: SeriesNavProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [trackX, setTrackX] = useState(0);
  const [chipsX, setChipsX] = useState(0);
  const [menuLeft, setMenuLeft] = useState(0);
  const single = series.length < 2;

  // Slide the tab track so the focused tab stays within the first 4 slots.
  useLayoutEffect(() => {
    const els = trackRef.current ? Array.from(trackRef.current.children) as HTMLElement[] : [];
    let offset = 0;
    for (let i = 0; i < focusedTab - LOCK_SLOT; i++) offset += (els[i]?.offsetWidth ?? 0) + TRACK_GAP;
    setTrackX(offset);
    if (trackRef.current && triggerRef.current) {
      setMenuLeft(trackRef.current.offsetLeft + triggerRef.current.offsetLeft);
    }
  }, [focusedTab, tabs]);

  const chipPos = Math.max(0, series.indexOf(subNavOpen && focusedSeries != null ? focusedSeries : activeSeries ?? -1));
  useLayoutEffect(() => {
    const els = chipsRef.current ? Array.from(chipsRef.current.children) as HTMLElement[] : [];
    let offset = 0;
    for (let i = 0; i < chipPos - LOCK_SLOT; i++) offset += (els[i]?.offsetWidth ?? 0) + CHIP_GAP;
    setChipsX(offset);
  }, [chipPos, focusedSeries, activeSeries, subNavVisible]);

  return (
    <section className={'series-tabs-shell' + (subNavVisible ? ' dd-open' : '')}>
      <div className="focus-edge" />
      <div className="series-tabs-track" ref={trackRef} style={{ transform: `translateX(${-trackX}px)` }}>
        {tabs.map((t, i) => {
          const focused = i === focusedTab;
          if (t.trigger) {
            const cls = ['series-tab', 'numeric', 'expanded', 'dropdown-trigger'];
            if (single) cls.push('single');
            if (activeSeries != null) cls.push('active');
            if (focused) cls.push('focused');
            if (subNavOpen) cls.push('open');
            return (
              <div key={t.id} ref={triggerRef} className={cls.join(' ')} role="tab" aria-selected={focused} onClick={() => onTabClick?.(i)}>
                {!single && <ChevronIcon />}
                <span className="series-tab-label">{t.label}</span>
              </div>
            );
          }
          return (
            <div key={t.id} className={'series-tab' + (focused ? ' focused' : '')} role="tab" aria-selected={focused} onClick={() => onTabClick?.(i)}>
              <span className="series-tab-label">{t.label}</span>
            </div>
          );
        })}
      </div>
      <div className={'series-dd-menu' + (subNavVisible ? ' open' : '')} style={{ left: menuLeft }}>
        <div className="series-dd-track" ref={chipsRef} style={{ transform: `translateX(${-chipsX}px)` }}>
          {series.map((n) => {
            const focused = focusedSeries === n;
            const active = activeSeries === n;
            const cls = ['series-dd-item'];
            if (focused) cls.push('focused');
            if (active) cls.push('active');
            if (focused || active) cls.push('expanded');
            return (
              <div key={n} className={cls.join(' ')} role="tab" aria-selected={active} onClick={() => onSeriesClick?.(n)}>
                <span className="series-tab-label">{focused || active ? seriesLabel(n) : n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
