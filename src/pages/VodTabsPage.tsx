import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Cta, Episode, GuidanceMode, Programme, RelatedProgramme } from '../types';
import {
  deriveView, initialNavState, navigate, seriesChipOrder, toNavKey,
  type NavConfig, type NavEffect, type NavState, type TabId,
} from '../navigation/vodNavigation';
import { HeroBackdrop } from '../components/HeroBackdrop/HeroBackdrop';
import { EpisodeHero, Strapline, Tag } from '../components/HeroMeta/HeroMeta';
import { CtaTower } from '../components/CtaTower/CtaTower';
import { SeriesNav, type SeriesNavTab } from '../components/SeriesNav/SeriesNav';
import { EpisodeRail, type RailEndMode } from '../components/EpisodeRail/EpisodeRail';
import { RelatedRail } from '../components/RelatedRail/RelatedRail';
import { AboutPanel } from '../components/AboutPanel/AboutPanel';
import { TrailerRail, type Trailer } from '../components/TrailerRail/TrailerRail';
import { KeyHint } from '../components/KeyHint/KeyHint';
import './VodTabsPage.css';

export interface VodTabsPageProps {
  programme: Programme;
  episodesBySeries: Record<number, Episode[]>;
  related: RelatedProgramme[];
  trailers?: Trailer[];
  guidance?: { mode: GuidanceMode; full: string; short: string };
  episodeRailEnd?: RailEndMode;
  showKeyHint?: boolean;
  onPlayEpisode?: (episode: Episode) => void;
  onOpenProgramme?: (item: RelatedProgramme) => void;
  onCta?: (cta: Cta, index: number) => void;
}

const TAB_LABEL: Record<TabId, string> = {
  episodes: 'Episodes',
  about: 'About',
  trailers: 'Trailers',
  related: 'Related',
};

/** Episode rail shell height minus its discover-mode half-height peek (prototype maths). */
const EPISODE_PEEK_BOTTOM = (274 + 216) - (274 + 120) * 0.5;

/** Play / Watch ad free / Add to list — the 3-button tower. */
const CTA_COUNT = 3;

const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

/**
 * The VOD Tabs CTV page, composed from the component library and driven
 * by the pure navigation model. Arrow keys / Enter / Backspace = D-pad.
 */
export function VodTabsPage({
  programme: p, episodesBySeries, related, trailers: trailersProp, guidance,
  episodeRailEnd = 'breakaway-1', showKeyHint = true, onPlayEpisode, onOpenProgramme, onCta,
}: VodTabsPageProps) {
  const seriesNumbers = useMemo(
    () => Array.from({ length: p.seriesCount }, (_, i) => i + 1).filter((n) => episodesBySeries[n]?.length),
    [p.seriesCount, episodesBySeries],
  );

  const trailers = useMemo<Trailer[]>(
    () => trailersProp ?? [...seriesNumbers].reverse().slice(0, 4).map((n) => ({
      id: `s${n}`, label: `Series ${n} trailer`, image: p.backdrop,
    })),
    [trailersProp, seriesNumbers, p.backdrop],
  );

  const config: NavConfig = useMemo(() => {
    const tabs: TabId[] = [];
    if (seriesNumbers.length) tabs.push('episodes');
    tabs.push('about');
    if (trailers.length) tabs.push('trailers');
    if (related.length) tabs.push('related');
    return {
      tabs,
      seriesNumbers,
      episodeCounts: Object.fromEntries(seriesNumbers.map((n) => [n, episodesBySeries[n].length])),
      ctaCount: CTA_COUNT,
      trailerCount: trailers.length,
      relatedCount: related.length,
    };
  }, [seriesNumbers, episodesBySeries, trailers.length, related.length]);

  const [nav, setNav] = useState<NavState>(() => initialNavState(config));
  const [playingTrailer, setPlayingTrailer] = useState<string | null>(null);
  const view = deriveView(nav, config);

  const episodes = nav.activeSeries != null ? episodesBySeries[nav.activeSeries] ?? [] : [];
  const heroEpisode = episodes[nav.episodeIndex];
  const primaryLabel = heroEpisode
    ? `Start watching - S${heroEpisode.series}:E${heroEpisode.episode}`
    : 'Start watching';

  const [listed, setListed] = useState(false);
  const ctas: Cta[] = useMemo(() => [
    { id: 'play', label: primaryLabel, icon: 'play' },
    { id: 'adfree', label: 'Watch ad free', icon: 'play' },
    { id: 'list', label: listed ? 'Added to list' : 'Add to list', icon: listed ? 'tick' : 'plus' },
  ], [primaryLabel, listed]);

  const runEffect = useCallback((effect: NavEffect) => {
    if (!effect) return;
    switch (effect.type) {
      case 'cta': {
        const cta = ctas[effect.index];
        if (cta?.id === 'list') setListed((v) => !v);
        if (cta) onCta?.(cta, effect.index);
        break;
      }
      case 'playEpisode': {
        const ep = episodesBySeries[effect.series]?.[effect.index];
        if (ep) onPlayEpisode?.(ep);
        break;
      }
      case 'openProgramme':
        if (related[effect.index]) onOpenProgramme?.(related[effect.index]);
        break;
      case 'toggleTrailer': {
        const id = trailers[effect.index]?.id ?? null;
        setPlayingTrailer((cur) => (cur === id ? null : id));
        break;
      }
    }
  }, [ctas, episodesBySeries, related, trailers, onCta, onPlayEpisode, onOpenProgramme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
      const key = toNavKey(e.key);
      if (!key) return;
      e.preventDefault();
      const { state, effect } = navigate(nav, key, config);
      if (state.section !== 'trailer') setPlayingTrailer(null);
      setNav(state);
      runEffect(effect);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nav, config, runEffect]);

  // In discover mode, About / Trailers pull up so only their lower part peeks above the rail.
  const aboutRef = useRef<HTMLElement>(null);
  const trailerRef = useRef<HTMLElement>(null);
  const [peek, setPeek] = useState({ about: 0, trailer: 0 });
  useLayoutEffect(() => {
    const lift = (el: HTMLElement | null, shown: boolean) =>
      view.onDiscover && shown && el ? Math.min(0, EPISODE_PEEK_BOTTOM - el.offsetHeight) : 0;
    setPeek({ about: lift(aboutRef.current, view.aboutVisible), trailer: lift(trailerRef.current, view.trailerVisible) });
  }, [view.onDiscover, view.aboutVisible, view.trailerVisible]);

  /* ---------------------------------------------------- hero content */
  const keywords = [titleCase(p.genre), p.subgenres[0], p.moods[0], p.cast[0]].filter(Boolean) as string[];
  const meta = [
    ...(p.seriesCount ? [`${p.seriesCount} Series`] : []),
    `${p.lengthMinutes} mins`,
  ];
  const tabs: SeriesNavTab[] = config.tabs.map((id) => ({
    id, label: TAB_LABEL[id], trigger: id === 'episodes',
  }));
  const appClass = [...view.appClasses, guidance && guidance.mode !== 'off' ? `guidance-${guidance.mode}` : '']
    .filter(Boolean).join(' ');

  return (
    <div className={appClass}>
      <HeroBackdrop image={p.backdrop} />

      <EpisodeHero
        title={p.title}
        logo={p.logo}
        access={p.access}
        tags={p.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
        meta={meta}
        straplines={
          <>
            {p.strapline && <Strapline>{p.strapline}</Strapline>}
            {p.strapline2 && <Strapline variant={2}>{p.strapline2}</Strapline>}
          </>
        }
        description={p.description}
        keywords={keywords}
        guidance={guidance}
      >
        <CtaTower
          ctas={ctas}
          focusedIndex={nav.section === 'hero' ? nav.ctaIndex : -1}
          onSelect={(i) => { setNav({ ...nav, section: 'hero', ctaIndex: i }); runEffect({ type: 'cta', index: i }); }}
        />
      </EpisodeHero>

      {config.tabs.length > 0 && (
        <SeriesNav
          tabs={tabs}
          focusedTab={nav.section === 'series' && !(nav.ddOpen && nav.ddFocus === 'chips') ? nav.tabIndex : -1}
          series={seriesChipOrder(config)}
          activeSeries={nav.activeSeries}
          subNavVisible={view.subNavVisible}
          subNavOpen={nav.ddOpen}
          focusedSeries={nav.section === 'series' && nav.ddOpen && nav.ddFocus === 'chips' ? nav.ddSeries : null}
          onTabClick={(i) => setNav({ ...nav, section: 'series', tabIndex: i, ddOpen: false, ddFocus: 'trigger' })}
          onSeriesClick={(n) => setNav({ ...nav, section: 'series', ddOpen: true, ddFocus: 'chips', ddSeries: n, activeSeries: n, episodeIndex: 0, util: null })}
        />
      )}

      <TrailerRail
        visible={view.trailerVisible}
        trailers={trailers}
        focusedIndex={nav.trailerIndex}
        hasFocus={nav.section === 'trailer'}
        playingId={playingTrailer}
        marginTop={peek.trailer}
        shellRef={trailerRef}
      />

      <AboutPanel
        visible={view.aboutVisible}
        focused={nav.section === 'about'}
        poster={p.poster}
        description={p.description}
        guidance={guidance && guidance.mode !== 'off' ? guidance.full : undefined}
        facts={[
          { label: 'Genre', value: p.subgenres.join(', ') },
          { label: 'Length', value: `${p.lengthMinutes} mins` },
          { label: 'Cast', value: p.cast.join(', ') },
          { label: 'Year', value: p.year },
          { label: 'Rating', value: p.rating },
          { label: 'Director', value: p.director },
        ]}
        marginTop={peek.about}
        panelRef={aboutRef}
      />

      {view.episodesVisible && (
        <EpisodeRail
          episodes={episodes}
          focusedIndex={nav.episodeIndex}
          hasFocus={nav.section === 'episodes'}
          dim={nav.section !== 'episodes'}
          endMode={episodeRailEnd}
          onEpisodeClick={(i) => setNav({ ...nav, section: 'episodes', episodeIndex: i })}
        />
      )}

      {related.length > 0 && (
        <RelatedRail
          title={<>Find something similar to “{p.title}”</>}
          items={related}
          focusedIndex={nav.tileIndex}
          hasFocus={nav.section === 'rail'}
          dim={!view.onDiscover && !(nav.relatedView && nav.section === 'rail')}
          onItemClick={(i) => setNav({ ...nav, section: 'rail', tileIndex: i })}
        />
      )}

      {showKeyHint && <KeyHint />}
    </div>
  );
}
