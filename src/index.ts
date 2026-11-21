/**
 * VOD Tabs component library — public API.
 * At the app root import, once: './styles/tokens.css', './styles/flex-gap-fallback.css'
 * (importing this module runs the flex-gap check). Browser support: Chromium 68+.
 */
import './legacy/flexGap';
export * from './types';
export * from './navigation/vodNavigation';
export { Stage } from './components/Stage/Stage';
export { HeroBackdrop } from './components/HeroBackdrop/HeroBackdrop';
export { EpisodeHero, Tag, AccessibilityTags, MetaLine, Strapline } from './components/HeroMeta/HeroMeta';
export { CtaTower } from './components/CtaTower/CtaTower';
export { SeriesNav, type SeriesNavTab } from './components/SeriesNav/SeriesNav';
export { EpisodeRail, EpisodeTile, railOffsets, type RailEndMode } from './components/EpisodeRail/EpisodeRail';
export { RelatedRail, PortraitTile, RailMeta } from './components/RelatedRail/RelatedRail';
export { AboutPanel } from './components/AboutPanel/AboutPanel';
export { TrailerRail, type Trailer } from './components/TrailerRail/TrailerRail';
export { KeyHint } from './components/KeyHint/KeyHint';
export { VodTabsPage, type VodTabsPageProps } from './pages/VodTabsPage';
export { supportsFlexGap, applyFlexGapFallback } from './legacy/flexGap';
