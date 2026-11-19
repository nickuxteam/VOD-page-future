/** Data shapes shared by the VOD Tabs components. */

export type AccessTag = 'AD' | 'S' | 'BSL';

export interface Episode {
  series: number;
  episode: number;
  title: string;
  description?: string;
  /** e.g. "45m" (tile meta line) */
  length?: string;
  /** e.g. "12 Mar 2017" */
  airDate?: string;
  /** 16:9 still. Falls back to the tile colour while loading. */
  image?: string;
  /** 0–100. Renders the progress bar on the tile. */
  progress?: number;
  /** "New episode", "Continue watching", "Live" … */
  tag?: string;
  live?: boolean;
  access?: AccessTag[];
}

export interface RelatedProgramme {
  id: string;
  title: string;
  genre: string;
  subgenre?: string;
  /** "8 episodes" / "1h 52m" — shown in the rail meta row. */
  count?: string;
  description?: string;
  /** 2:3 portrait art. */
  image?: string;
  /** Badge bottom-left of the tile, e.g. "NEW SERIES". */
  badge?: string;
}

export interface Programme {
  title: string;
  /** Optional title-art URL. Falls back to an SVG text lockup. */
  logo?: string;
  /** 16:9 backdrop for the hero. */
  backdrop?: string;
  /** Poster used by the About panel. */
  poster?: string;
  description: string;
  genre: string;
  subgenres: string[];
  moods: string[];
  cast: string[];
  director?: string;
  year?: string;
  rating?: string;
  lengthMinutes: number;
  /** Number of series. 0 for films (no episode nav). */
  seriesCount: number;
  access?: AccessTag[];
  /** Tag pills before the meta line, e.g. ["EXCLUSIVE"]. */
  tags?: string[];
  /** Editorial strapline 1 (yellow glow), e.g. "Top 5, trending in drama!" */
  strapline?: string;
  /** Editorial strapline 2 (mint glow), e.g. "All episodes available now". */
  strapline2?: string;
}

export type CtaIcon = 'play' | 'plus' | 'tick' | 'restart';

export interface Cta {
  id: string;
  label: string;
  icon?: CtaIcon;
}

export type GuidanceMode = 'off' | 'strap3' | 'topright' | 'abovedesc' | 'belowlogo';
