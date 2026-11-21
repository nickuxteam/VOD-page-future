/** VOD Tabs component library — public API. Import './styles/tokens.css' once at app root. */
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
export { ConfigPanel } from './config/ConfigPanel';
export { DeviceSimulator } from './simulation/DeviceSimulator';
export { FIRE_TV_STICKS, NO_SIMULATION, findDevice, deviceLabel, type DeviceProfile, type GpuTier } from './simulation/devices';
