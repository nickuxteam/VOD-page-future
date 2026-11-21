/**
 * D-pad focus model for the VOD Tabs page, ported from the prototype's
 * STATE object and handle*Key() functions. It is a pure function of
 * (state, key, config), so it can be unit tested and reused by any
 * renderer (React here, but nothing in this file depends on React).
 *
 * Sections (focus rows), top to bottom:
 *   hero      CTA tower (primary on top, secondaries beneath)
 *   series    tab row: [EPISODES ▾] About Trailers Related
 *             + the series sub nav chips when the dropdown is open
 *   episodes  landscape episode rail for the active series
 *   about     About panel (when the About tab is selected)
 *   trailer   trailer rail (when the Trailers tab is selected)
 *   rail      related ("More like this") portrait rail
 */

export type TabId = 'episodes' | 'about' | 'trailers' | 'related';
export type Section = 'hero' | 'series' | 'episodes' | 'about' | 'trailer' | 'rail';
export type UtilView = null | 'about' | 'trailer' | 'rail';
export type NavKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Enter' | 'Back';

export interface NavConfig {
  /** Tabs in display order. Include 'episodes' only when there are series. */
  tabs: TabId[];
  /** Series numbers available, e.g. [1, 2, 3]. Empty for films. */
  seriesNumbers: number[];
  /** Episode count per series number. */
  episodeCounts: Record<number, number>;
  /** Total CTAs in the tower, primary included. */
  ctaCount: number;
  trailerCount: number;
  relatedCount: number;
}

export interface NavState {
  section: Section;
  ctaIndex: number;
  /** Focused tab in the tab row. */
  tabIndex: number;
  /** Selected series (drives the episode rail). null for films. */
  activeSeries: number | null;
  /** Series sub nav (chips) open. */
  ddOpen: boolean;
  ddFocus: 'trigger' | 'chips';
  /** Series chip that has focus while the sub nav is open. */
  ddSeries: number;
  episodeIndex: number;
  trailerIndex: number;
  tileIndex: number;
  /** Content view picked from the tab row (null = episodes). */
  util: UtilView;
  /** Related rail reached from the Related tab: keep the collapsed hero. */
  relatedView: boolean;
}

export type NavEffect =
  | { type: 'cta'; index: number }
  | { type: 'playEpisode'; series: number; index: number }
  | { type: 'openProgramme'; index: number }
  | { type: 'toggleTrailer'; index: number }
  | null;

export interface NavResult {
  state: NavState;
  effect: NavEffect;
}

export function initialNavState(config: NavConfig, activeSeries?: number): NavState {
  const first = config.seriesNumbers.length ? Math.min(...config.seriesNumbers) : null;
  const active = activeSeries ?? first;
  return {
    section: 'hero',
    ctaIndex: 0,
    tabIndex: 0,
    activeSeries: active,
    ddOpen: false,
    ddFocus: 'trigger',
    ddSeries: active ?? 0,
    episodeIndex: 0,
    trailerIndex: 0,
    tileIndex: 0,
    util: null,
    relatedView: false,
  };
}

/** Sub nav chips run newest series first, as in the prototype. */
export function seriesChipOrder(config: NavConfig): number[] {
  return [...config.seriesNumbers].sort((a, b) => b - a);
}

const hasEpisodes = (s: NavState) => s.activeSeries != null;
const multiSeries = (c: NavConfig) => c.seriesNumbers.length > 1;
const tabAt = (c: NavConfig, i: number): TabId | undefined => c.tabs[i];
const tabIndexOf = (c: NavConfig, id: TabId) => Math.max(0, c.tabs.indexOf(id));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function episodeCount(s: NavState, c: NavConfig) {
  return s.activeSeries == null ? 0 : c.episodeCounts[s.activeSeries] ?? 0;
}

function enterEpisodes(s: NavState, c: NavConfig): NavState {
  const count = episodeCount(s, c);
  return { ...s, section: 'episodes', episodeIndex: s.episodeIndex >= count ? 0 : s.episodeIndex };
}

function openSubNav(s: NavState): NavState {
  return { ...s, ddOpen: true, ddFocus: 'chips', ddSeries: s.activeSeries ?? s.ddSeries, util: null };
}

function closeSubNav(s: NavState, c: NavConfig): NavState {
  return { ...s, ddOpen: false, ddFocus: 'trigger', tabIndex: tabIndexOf(c, 'episodes') };
}

function selectSeries(s: NavState, series: number): NavState {
  if (s.activeSeries === series) return { ...s, util: null };
  return { ...s, activeSeries: series, episodeIndex: 0, util: null };
}

/* ----------------------------------------------------------- hero --- */
function heroKey(s: NavState, k: NavKey, c: NavConfig): NavResult {
  const last = c.ctaCount - 1;
  switch (k) {
    case 'ArrowLeft':
      return { state: { ...s, ctaIndex: s.ctaIndex > 1 ? s.ctaIndex - 1 : s.ctaIndex }, effect: null };
    case 'ArrowRight':
      return { state: { ...s, ctaIndex: s.ctaIndex >= 1 && s.ctaIndex < last ? s.ctaIndex + 1 : s.ctaIndex }, effect: null };
    case 'ArrowUp':
      return { state: { ...s, ctaIndex: s.ctaIndex >= 1 ? 0 : s.ctaIndex }, effect: null };
    case 'ArrowDown': {
      if (s.ctaIndex === 0 && last >= 1) return { state: { ...s, ctaIndex: 1 }, effect: null };
      if (!c.tabs.length) return { state: s, effect: null };
      const utilTab: TabId = s.util === 'about' ? 'about' : s.util === 'trailer' ? 'trailers'
        : s.util === 'rail' ? 'related' : 'episodes';
      return { state: { ...s, section: 'series', tabIndex: tabIndexOf(c, utilTab) }, effect: null };
    }
    case 'Enter':
      return { state: s, effect: { type: 'cta', index: s.ctaIndex } };
    default:
      return { state: s, effect: null };
  }
}

/* ------------------------------------------------- series sub nav --- */
function subNavKey(s: NavState, k: NavKey, c: NavConfig): NavResult {
  if (s.ddFocus === 'trigger') {
    if (k === 'ArrowDown') return { state: { ...s, ddFocus: 'chips' }, effect: null };
    if (k === 'ArrowUp') return { state: { ...closeSubNav(s, c), section: 'hero' }, effect: null };
    if (k === 'ArrowLeft' || k === 'ArrowRight') return tabsKey(closeSubNav(s, c), k, c);
    return { state: closeSubNav(s, c), effect: null };
  }
  const order = seriesChipOrder(c);
  const pos = Math.max(0, order.indexOf(s.ddSeries));
  switch (k) {
    case 'ArrowRight':
      return { state: { ...s, ddSeries: order[Math.min(order.length - 1, pos + 1)] }, effect: null };
    case 'ArrowLeft':
      return { state: { ...s, ddSeries: order[Math.max(0, pos - 1)] }, effect: null };
    case 'ArrowUp':
    case 'Back':
      return { state: { ...s, ddFocus: 'trigger' }, effect: null };
    case 'ArrowDown':
      return { state: enterEpisodes(s, c), effect: null };
    case 'Enter':
      return { state: selectSeries(s, s.ddSeries), effect: null };
  }
}

/* ------------------------------------------------------- tab row --- */
function tabsKey(s: NavState, k: NavKey, c: NavConfig): NavResult {
  if (s.ddOpen) return subNavKey(s, k, c);
  const tab = tabAt(c, s.tabIndex);
  switch (k) {
    case 'ArrowLeft':
      return { state: { ...s, tabIndex: Math.max(0, s.tabIndex - 1) }, effect: null };
    case 'ArrowRight':
      return { state: { ...s, tabIndex: Math.min(c.tabs.length - 1, s.tabIndex + 1) }, effect: null };
    case 'ArrowUp':
    case 'Back':
      return { state: { ...s, section: 'hero' }, effect: null };
    case 'ArrowDown':
      if (tab === 'episodes') {
        return { state: multiSeries(c) ? openSubNav(s) : enterEpisodes({ ...s, util: null }, c), effect: null };
      }
      if (tab === 'about') return { state: { ...s, section: 'about', util: 'about' }, effect: null };
      if (tab === 'trailers') return { state: { ...s, section: 'trailer', util: 'trailer' }, effect: null };
      return { state: { ...s, section: 'rail', util: 'rail', tileIndex: 0, relatedView: true }, effect: null };
    case 'Enter':
      if (tab === 'episodes') return { state: multiSeries(c) ? openSubNav(s) : { ...s, util: null }, effect: null };
      if (tab === 'about') return { state: { ...s, util: 'about' }, effect: null };
      if (tab === 'trailers') return { state: { ...s, util: 'trailer' }, effect: null };
      return { state: { ...s, util: 'rail', section: 'rail', tileIndex: 0, relatedView: false }, effect: null };
  }
}

/* ------------------------------------------------------ episodes --- */
function episodesKey(s: NavState, k: NavKey, c: NavConfig): NavResult {
  const count = episodeCount(s, c);
  switch (k) {
    case 'ArrowLeft':
      return { state: { ...s, episodeIndex: Math.max(0, s.episodeIndex - 1) }, effect: null };
    case 'ArrowRight':
      return { state: { ...s, episodeIndex: Math.min(count - 1, s.episodeIndex + 1) }, effect: null };
    case 'ArrowUp':
    case 'Back':
      return { state: { ...s, section: 'series', tabIndex: tabIndexOf(c, 'episodes') }, effect: null };
    case 'ArrowDown':
      if (!c.relatedCount) return { state: s, effect: null };
      return { state: { ...s, section: 'rail', tileIndex: 0, relatedView: false }, effect: null };
    case 'Enter':
      return { state: s, effect: { type: 'playEpisode', series: s.activeSeries!, index: s.episodeIndex } };
  }
}

/* ------------------------------------------------- about / trailer --- */
function aboutKey(s: NavState, k: NavKey, c: NavConfig): NavResult {
  if (k === 'ArrowUp' || k === 'Back') {
    return { state: { ...s, section: 'series', util: 'about', tabIndex: tabIndexOf(c, 'about') }, effect: null };
  }
  if (k === 'ArrowDown' && c.relatedCount) {
    return { state: { ...s, section: 'rail', util: 'about', tileIndex: 0, relatedView: false }, effect: null };
  }
  return { state: s, effect: null };
}

function trailerKey(s: NavState, k: NavKey, c: NavConfig): NavResult {
  switch (k) {
    case 'ArrowUp':
    case 'Back':
      return { state: { ...s, section: 'series', util: 'trailer', tabIndex: tabIndexOf(c, 'trailers') }, effect: null };
    case 'ArrowDown':
      if (!c.relatedCount) return { state: s, effect: null };
      return { state: { ...s, section: 'rail', util: 'trailer', tileIndex: 0, relatedView: false }, effect: null };
    case 'ArrowLeft':
      return { state: { ...s, trailerIndex: Math.max(0, s.trailerIndex - 1) }, effect: null };
    case 'ArrowRight':
      return { state: { ...s, trailerIndex: clamp(s.trailerIndex + 1, 0, c.trailerCount - 1) }, effect: null };
    case 'Enter':
      return { state: s, effect: { type: 'toggleTrailer', index: s.trailerIndex } };
  }
}

/* ------------------------------------------------------ related --- */
function railKey(s: NavState, k: NavKey, c: NavConfig): NavResult {
  switch (k) {
    case 'ArrowLeft':
      return { state: { ...s, tileIndex: Math.max(0, s.tileIndex - 1) }, effect: null };
    case 'ArrowRight':
      return { state: { ...s, tileIndex: clamp(s.tileIndex + 1, 0, c.relatedCount - 1) }, effect: null };
    case 'ArrowUp':
    case 'Back': {
      const base = { ...s, relatedView: false };
      if (s.util === 'trailer') return { state: { ...base, section: 'trailer' }, effect: null };
      if (s.util === 'about') return { state: { ...base, section: 'about' }, effect: null };
      if (hasEpisodes(s)) return { state: enterEpisodes({ ...base, util: null }, c), effect: null };
      return { state: { ...base, section: 'series' }, effect: null };
    }
    case 'ArrowDown':
      return { state: s, effect: null };
    case 'Enter':
      return { state: s, effect: { type: 'openProgramme', index: s.tileIndex } };
  }
}

/** Apply one remote / keyboard press. */
export function navigate(state: NavState, key: NavKey, config: NavConfig): NavResult {
  switch (state.section) {
    case 'hero': return heroKey(state, key, config);
    case 'series': return tabsKey(state, key, config);
    case 'episodes': return episodesKey(state, key, config);
    case 'about': return aboutKey(state, key, config);
    case 'trailer': return trailerKey(state, key, config);
    case 'rail': return railKey(state, key, config);
  }
}

/** Map a DOM KeyboardEvent.key to a NavKey (Backspace / Escape / TV Back keys = Back). */
export function toNavKey(key: string): NavKey | null {
  switch (key) {
    case 'ArrowLeft': case 'ArrowRight': case 'ArrowUp': case 'ArrowDown': return key;
    case 'Left': case 'Right': case 'Up': case 'Down': return ('Arrow' + key) as NavKey; // older engines
    case 'Enter': case ' ': case 'Select': return 'Enter';
    case 'Backspace': case 'Escape': case 'GoBack': case 'BrowserBack': case 'XF86Back': return 'Back';
    default: return null;
  }
}

/**
 * TV remotes often report Back (and on old engines, arrows) only through
 * keyCode: LG webOS Back = 461, Samsung Tizen Return = 10009, Android/Fire TV
 * WebView Back = 4. Arrows 37–40 and OK 13 are standard.
 */
const KEYCODE_MAP: Record<number, NavKey> = {
  37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown',
  13: 'Enter', 8: 'Back', 27: 'Back', 461: 'Back', 10009: 'Back', 4: 'Back',
};

/** NavKey for a keyboard / remote event: `key` first, then the TV keyCode table. */
export function navKeyFromEvent(e: Pick<KeyboardEvent, 'key' | 'keyCode'>): NavKey | null {
  return toNavKey(e.key) ?? KEYCODE_MAP[e.keyCode] ?? null;
}

/* ---------------------------------------------------- derived view --- */
export interface NavView {
  /** Classes for the .app root — the CSS keys every layout mode off these. */
  appClasses: string[];
  aboutVisible: boolean;
  trailerVisible: boolean;
  episodesVisible: boolean;
  subNavVisible: boolean;
  /** Related rail sits in "discover" mode (hero + tabs collapsed away). */
  onDiscover: boolean;
}

export function deriveView(s: NavState, c: NavConfig): NavView {
  const relatedView = s.relatedView && s.section === 'rail';
  const onDiscover = !relatedView && s.section === 'rail';
  const trailerVisible = s.section === 'trailer' || s.util === 'trailer';
  const aboutVisible = s.section === 'about' || s.util === 'about';
  const episodesVisible = hasEpisodes(s) && !trailerVisible && !aboutVisible;
  const focusedTab = tabAt(c, s.tabIndex);
  const subNavVisible = multiSeries(c) && !s.util && !trailerVisible && !aboutVisible
    && s.section !== 'hero' && (s.ddOpen || !(s.section === 'series' && focusedTab !== 'episodes'));
  const seriesFocus = relatedView || (!onDiscover && s.section !== 'hero');

  const appClasses = ['app', 'alt-hero'];
  if (s.section === 'hero') appClasses.push('hero-focused');
  if (s.section === 'series') appClasses.push('tabs-active');
  if (seriesFocus) appClasses.push('series-focus');
  if (onDiscover) appClasses.push('discover-focus');
  if (c.ctaCount === 2) appClasses.push('tower-2');
  if (c.ctaCount === 3) appClasses.push('tower-3');

  return { appClasses, aboutVisible, trailerVisible, episodesVisible, subNavVisible, onDiscover };
}
