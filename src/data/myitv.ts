/**
 * Demo content for the My ITVX page: real ITVX titles (from the prototype's catalogue).
 * Artwork, descriptions and episode titles come from TMDB when a key is set (see
 * data/tmdb.ts and useMyItvContent); until then, and if a lookup fails, tiles show
 * generated placeholder art. Countdowns, badges and progress are made up.
 */
import type { ComingSoonItem } from '../components/ComingSoonRail/ComingSoonRail';
import type { Episode, RelatedProgramme } from '../types';
import type { TmdbLookup } from './tmdb';

/** Placeholder artwork: a two-tone gradient with the title set in the brand face. */
export function dummyArt(title: string, hue: number, w: number, h: number, textAt: 'top' | 'bottom' = 'bottom'): string {
  const maxChars = w > h ? 18 : 9;
  const lines = title.toUpperCase().split(' ').reduce<string[]>((acc, word) => {
    const last = acc[acc.length - 1];
    if (last && (last + ' ' + word).length <= maxChars) acc[acc.length - 1] = last + ' ' + word;
    else acc.push(word);
    return acc;
  }, []);
  // Shrink the type so the longest line fits inside a 24px inset (bold caps ≈ 0.66em per glyph).
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.min(w > h ? 40 : 30, Math.floor((w - 48) / (longest * 0.66)));
  const lh = size * 1.1;
  // Bottom text sits above the tile's badge strip; landscape tiles put it top-left, clear of the tags + progress bar.
  const y0 = textAt === 'top' ? 24 + size : h - 60 - (lines.length - 1) * lh;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue},55%,42%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},60%,14%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="100%" height="100%" fill="url(#g)"/>` +
    `<circle cx="${w * 0.78}" cy="${h * 0.28}" r="${Math.min(w, h) * 0.32}" fill="hsl(${(hue + 180) % 360},70%,70%)" opacity="0.18"/>` +
    lines.map((l, i) =>
      `<text x="24" y="${y0 + i * lh}" font-family="F37 Zagma, Inter, Arial, sans-serif" font-weight="700" font-size="${size}" fill="#fff">${esc(l)}</text>`,
    ).join('') +
    `</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const portrait = (title: string, hue: number) => dummyArt(title, hue, 234, 350);
const landscape = (title: string, hue: number) => dummyArt(title, hue, 486, 274, 'top');

/* ----------------------------------------------------- Continue watching */
export interface ContinueSeed {
  title: string;
  series: number;
  episode: number;
  progress: number;
  minsLeft: number;
  tmdb: TmdbLookup;
}
export const continueSeeds: ContinueSeed[] = [
  { title: 'Broadchurch', series: 2, episode: 4, progress: 62, minsLeft: 18, tmdb: { query: 'Broadchurch', kind: 'tv', year: 2013 } },
  { title: 'Mr Bates vs The Post Office', series: 1, episode: 3, progress: 35, minsLeft: 31, tmdb: { query: 'Mr Bates vs The Post Office', kind: 'tv', year: 2024 } },
  { title: 'Endeavour', series: 5, episode: 2, progress: 80, minsLeft: 17, tmdb: { query: 'Endeavour', kind: 'tv', year: 2013 } },
  { title: 'Vera', series: 11, episode: 1, progress: 20, minsLeft: 70, tmdb: { query: 'Vera', kind: 'tv', year: 2011 } },
  { title: 'DI Ray', series: 2, episode: 3, progress: 48, minsLeft: 24, tmdb: { query: 'DI Ray', kind: 'tv', year: 2022 } },
  { title: 'Midsomer Murders', series: 22, episode: 1, progress: 12, minsLeft: 80, tmdb: { query: 'Midsomer Murders', kind: 'tv', year: 1997 } },
  { title: 'Trigger Point', series: 2, episode: 5, progress: 55, minsLeft: 21, tmdb: { query: 'Trigger Point', kind: 'tv', year: 2022 } },
];
export const continueWatching: Episode[] = continueSeeds.map((c, i) => ({
  series: c.series, episode: c.episode, progress: c.progress,
  title: c.title,
  description: `S${c.series}:E${c.episode}`,
  length: `${c.minsLeft} mins left`,
  image: landscape(c.title, (i * 47 + 190) % 360),
  access: ['S', 'AD'],
}));

/* ---------------------------------------------------------- Portrait rails */
export interface PortraitSeed {
  title: string;
  genre: string;
  subgenre: string;
  count: string;
  badge?: string;
  tmdb: TmdbLookup;
}
const tv = (query: string, year?: number): TmdbLookup => ({ query, kind: 'tv', year });
const film = (query: string, year?: number): TmdbLookup => ({ query, kind: 'movie', year });
const seed = (title: string, genre: string, subgenre: string, count: string, tmdb: TmdbLookup, badge?: string): PortraitSeed =>
  ({ title, genre, subgenre, count, tmdb, badge });

export const myListSeeds: PortraitSeed[] = [
  seed('Downton Abbey', 'Drama', 'Period drama', '6 series', tv('Downton Abbey', 2010)),
  seed('Doc Martin', 'Drama', 'Comedy drama', '10 series', tv('Doc Martin', 2004)),
  seed('Cold Feet', 'Drama', 'Comedy drama', '9 series', tv('Cold Feet', 1998)),
  seed('Prime Suspect', 'Drama', 'Crime thriller', '7 series', tv('Prime Suspect', 1991)),
  seed('Poirot', 'Drama', 'Mystery', '13 series', tv("Agatha Christie's Poirot", 1989)),
  seed('The Larkins', 'Drama', 'Period', '2 series', tv('The Larkins', 2021)),
  seed('Sanditon', 'Drama', 'Period drama', '3 series', tv('Sanditon', 2019)),
  seed('Grace', 'Drama', 'Mystery', '4 series', tv('Grace', 2021)),
];

export const thisWeekSeeds: PortraitSeed[] = [
  seed('Love Island', 'Reality', 'Dating', 'Nightly 9pm', tv('Love Island', 2015), 'New episode'),
  seed("I'm A Celebrity", 'Entertainment', 'Reality', 'Live nightly', tv("I'm a Celebrity...Get Me Out of Here!", 2002), 'Live'),
  seed('Trigger Point', 'Drama', 'Action thriller', 'New series', tv('Trigger Point', 2022), 'New series'),
  seed('The 1% Club', 'Entertainment', 'Game show', 'Sat 8pm', tv('The 1% Club', 2022)),
  seed('Joan', 'Drama', 'Crime thriller', '6 episodes', tv('Joan', 2024), 'New series'),
  seed('The Masked Singer', 'Entertainment', 'Game show', 'Sat 7pm', tv('The Masked Singer', 2020)),
  seed("The Devil's Hour", 'Drama', 'Thriller', '3 series', tv("The Devil's Hour", 2022)),
  seed("Britain's Got Talent", 'Entertainment', 'Talent show', 'Live Sat 8pm', tv("Britain's Got Talent", 2007), 'Live'),
];

export const recommendedSeeds: PortraitSeed[] = [
  seed('Des', 'Drama', 'Based on a true story', '3 episodes', tv('Des', 2020)),
  seed('The Long Shadow', 'Drama', 'Crime thriller', '7 episodes', tv('The Long Shadow', 2023)),
  seed('Manhunt', 'Drama', 'Crime thriller', '2 series', tv('Manhunt', 2019)),
  seed('Karen Pirie', 'Drama', 'Mystery', '2 series', tv('Karen Pirie', 2022)),
  seed('The Bay', 'Drama', 'Crime thriller', '5 series', tv('The Bay', 2019)),
  seed('Little Boy Blue', 'Drama', 'Crime thriller', '4 episodes', tv('Little Boy Blue', 2017)),
  seed('Unforgotten', 'Drama', 'Crime drama', '6 series', tv('Unforgotten', 2015)),
  seed('Litvinenko', 'Drama', 'Based on a true story', '4 episodes', tv('Litvinenko', 2022)),
];

export const leavingSoonSeeds: PortraitSeed[] = [
  seed('The Matrix', 'Film', 'Action', '2h 16m', film('The Matrix', 1999), '2 days left'),
  seed('Dune', 'Film', 'Action adventure', '2h 35m', film('Dune', 2021), '3 days left'),
  seed('Goldfinger', 'Film', 'Action adventure', '1h 50m', film('Goldfinger', 1964), '5 days left'),
  seed('Legally Blonde', 'Film', 'Comedy', '1h 36m', film('Legally Blonde', 2001), '6 days left'),
  seed('The Devil Wears Prada', 'Film', 'Comedy drama', '1h 49m', film('The Devil Wears Prada', 2006), '9 days left'),
  seed('Shaun of the Dead', 'Film', 'Horror comedy', '1h 39m', film('Shaun of the Dead', 2004), '12 days left'),
  seed('The Notebook', 'Film', 'Romance', '2h 3m', film('The Notebook', 2004), '14 days left'),
];

const toItems = (prefix: string, seeds: PortraitSeed[], hue0: number): RelatedProgramme[] =>
  seeds.map((sd, i) => ({
    id: `${prefix}-${i}`, title: sd.title, genre: sd.genre, subgenre: sd.subgenre, count: sd.count,
    description: '',
    image: portrait(sd.title, (hue0 + i * 37) % 360),
    badge: sd.badge,
  }));

export const myList = toItems('list', myListSeeds, 200);
export const thisWeek = toItems('week', thisWeekSeeds, 330);
export const recommended = toItems('rec', recommendedSeeds, 140);
export const leavingSoon = toItems('leave', leavingSoonSeeds, 20);

/* ----------------------------------------------------------- Coming soon */
/** Same titles and countdowns as the VOD page's Coming soon rail (prototype hydrateCsRail). */
export const comingSoonSeeds: { title: string; tmdb: TmdbLookup }[] = [
  { title: 'The Bear', tmdb: tv('The Bear') },
  { title: 'Mr Inbetween', tmdb: tv('Mr Inbetween') },
  { title: 'Big Brother', tmdb: tv('Big Brother') },
  { title: 'Harry Potter', tmdb: film('Harry Potter') },
  { title: 'John Wick: Chapter 4', tmdb: film('John Wick: Chapter 4') },
  { title: 'Daredevil: Born Again', tmdb: tv('Daredevil: Born Again') },
  { title: 'WandaVision', tmdb: tv('WandaVision') },
];
const csLabels = ['1 day to go', '5 days to go', '11 days to go', '13 days to go'];
export const comingSoon: ComingSoonItem[] = comingSoonSeeds.map((c, i) => ({
  id: `cs-${i}`, title: c.title, countdown: csLabels[i] ?? 'Soon',
  image: portrait(c.title, (260 + i * 41) % 360),
}));
