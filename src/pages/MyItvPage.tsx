import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RailTabs } from '../components/RailTabs/RailTabs';
import { EpisodeRail } from '../components/EpisodeRail/EpisodeRail';
import { RelatedRail } from '../components/RelatedRail/RelatedRail';
import { ComingSoonRail, type ComingSoonItem } from '../components/ComingSoonRail/ComingSoonRail';
import { KeyHint } from '../components/KeyHint/KeyHint';
import { navKeyFromEvent } from '../navigation/vodNavigation';
import {
  MYITV_ROWS, initialMyItvState, navigateMyItv, railForRow,
  type MyItvConfig, type MyItvEffect, type MyItvState,
} from '../navigation/myItvNavigation';
import type { Episode, RelatedProgramme } from '../types';
import './MyItvPage.css';

export interface MyItvPageProps {
  continueWatching: Episode[];
  myList: RelatedProgramme[];
  thisWeek: RelatedProgramme[];
  recommended: RelatedProgramme[];
  leavingSoon: RelatedProgramme[];
  comingSoon: ComingSoonItem[];
  onOpen?: (effect: MyItvEffect) => void;
}

/** Focused row sits this far from the top of the 1080 canvas once the page scrolls. */
const SCROLL_TOP_Y = 40;
/** Room the focused portrait rail's meta area takes; rows below slide down by this. */
const META_H = 120;
/** Space kept below the last rail for the key hint bar. */
const BOTTOM_PAD = 120;

/**
 * My ITVX — a tab row switching the rail beneath it between Continue watching
 * and My list, then This week on ITVX, Recommended for you, Leaving soon and
 * Coming soon on ITVX. Built from the VOD page components.
 */
export function MyItvPage(props: MyItvPageProps) {
  const { continueWatching, myList, thisWeek, recommended, leavingSoon, comingSoon, onOpen } = props;
  const config: MyItvConfig = {
    continue: continueWatching.length, mylist: myList.length, week: thisWeek.length,
    recommended: recommended.length, leaving: leavingSoon.length, soon: comingSoon.length,
  };
  const [nav, setNav] = useState<MyItvState>(initialMyItvState);

  const latest = useRef({ nav, config, onOpen });
  latest.current = { nav, config, onOpen };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = navKeyFromEvent(e);
      if (!key) return;
      e.preventDefault();
      const { nav: s, config: c, onOpen: open } = latest.current;
      const r = navigateMyItv(s, key, c);
      setNav(r.state);
      if (r.effect) open?.(r.effect);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Vertical scroll: rows are measured once laid out (transforms don't affect offsetTop).
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  useLayoutEffect(() => {
    const el = rowRefs.current[nav.row];
    if (nav.row <= 1 || !el) { setScrollY(0); return; }
    // Don't scroll past the end: the last rail stops above the key hint.
    const maxScroll = Math.max(0, (scrollRef.current?.offsetHeight ?? 0) + BOTTOM_PAD - 1080);
    setScrollY(Math.min(el.offsetTop - SCROLL_TOP_Y, maxScroll));
  }, [nav.row, nav.tab]);

  const focusedRail = railForRow(nav);
  const has = (row: number) => nav.row === row;
  const click = (row: number, i: number) => {
    const s = { ...nav, row, index: { ...nav.index } };
    const rail = railForRow(s, row);
    if (!rail) return;
    s.index[rail] = i;
    setNav(s);
    onOpen?.({ type: 'open', rail, index: i });
  };
  // Portrait rails with a meta area push the rows below them down while focused.
  // (The top row has a fixed height that already fits My list's meta area.)
  const metaRows = new Set([2, 3, 4]);
  const rowStyle = (row: number) => ({
    transform: row > nav.row && metaRows.has(nav.row) ? `translateY(${META_H}px)` : undefined,
  });
  const rowRef = (row: number) => (el: HTMLDivElement | null) => { rowRefs.current[row] = el; };

  const tabs = [{ id: 'continue', label: 'Continue watching' }, { id: 'mylist', label: 'My list' }];

  return (
    <div className={'app myitv' + (focusedRail ? ` focus-${focusedRail}` : ' focus-tabs')} data-row={MYITV_ROWS[nav.row]}>
      <div className="myitv-scroll" ref={scrollRef} style={{ transform: `translateY(${-scrollY}px)` }}>
        <div className="myitv-row myitv-row-tabs" ref={rowRef(0)} style={rowStyle(0)}>
          <RailTabs
            tabs={tabs}
            activeIndex={nav.tab}
            hasFocus={has(0)}
            onTabClick={(i) => setNav({ ...nav, row: 0, tab: i })}
          />
        </div>
        <div className="myitv-row myitv-row-top" ref={rowRef(1)} style={rowStyle(1)}>
          {nav.tab === 0 ? (
            <EpisodeRail
              episodes={continueWatching}
              focusedIndex={nav.index.continue}
              hasFocus={has(1)}
              labelFor={(ep) => `S${ep.series}:E${ep.episode}`}
              onEpisodeClick={(i) => click(1, i)}
            />
          ) : (
            <div className="myitv-toprail">
              <RelatedRail title="My list" items={myList} focusedIndex={nav.index.mylist} hasFocus={has(1)} onItemClick={(i) => click(1, i)} />
            </div>
          )}
        </div>
        <div className="myitv-row" ref={rowRef(2)} style={rowStyle(2)}>
          <RelatedRail title="This week on ITVX" items={thisWeek} focusedIndex={nav.index.week} hasFocus={has(2)} onItemClick={(i) => click(2, i)} />
        </div>
        <div className="myitv-row" ref={rowRef(3)} style={rowStyle(3)}>
          <RelatedRail title="Recommended for you" items={recommended} focusedIndex={nav.index.recommended} hasFocus={has(3)} onItemClick={(i) => click(3, i)} />
        </div>
        <div className="myitv-row myitv-leaving" ref={rowRef(4)} style={rowStyle(4)}>
          <RelatedRail title="Leaving soon" items={leavingSoon} focusedIndex={nav.index.leaving} hasFocus={has(4)} onItemClick={(i) => click(4, i)} />
        </div>
        <div className="myitv-row" ref={rowRef(5)} style={rowStyle(5)}>
          <ComingSoonRail items={comingSoon} focusedIndex={nav.index.soon} hasFocus={has(5)} onItemClick={(i) => click(5, i)} />
        </div>
      </div>
      <KeyHint />
    </div>
  );
}
