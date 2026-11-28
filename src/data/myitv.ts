/**
 * Dummy content for the My ITVX page. Titles are placeholders; artwork is
 * generated SVG (no network, no API keys). Swap in real data from the
 * content API through the same shapes.
 */
import type { ComingSoonItem } from '../components/ComingSoonRail/ComingSoonRail';
import type { Episode, RelatedProgramme } from '../types';

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
const cw: [string, number, number, string, number, string][] = [
  // title, series, episode, episode title, progress %, mins left
  ['Harbour Lights', 2, 4, 'The Night Ferry', 62, '18 mins left'],
  ['The Long Field', 1, 6, 'Harvest', 35, '31 mins left'],
  ['Northern Line', 3, 2, 'Signal Failure', 80, '9 mins left'],
  ['Kitchen Wars', 5, 9, 'Final Plate', 20, '38 mins left'],
  ['Saltmarsh', 1, 3, 'Low Tide', 48, '24 mins left'],
  ['Copper Street', 4, 1, 'New Neighbours', 12, '40 mins left'],
  ['The Quiz Room', 7, 14, 'Head to Head', 55, '20 mins left'],
];
export const continueWatching: Episode[] = cw.map(([show, series, episode, epTitle, progress, left], i) => ({
  series, episode, progress,
  title: show,
  description: `S${series}:E${episode} · ${epTitle}`,
  length: left,
  image: landscape(show, (i * 47 + 190) % 360),
  access: ['S', 'AD'],
}));

/* ---------------------------------------------------------- Portrait rails */
type Row = [title: string, genre: string, subgenre: string, count: string, description: string];
const toItems = (prefix: string, rows: Row[], hue0: number, badge?: (i: number) => string | undefined): RelatedProgramme[] =>
  rows.map(([title, genre, subgenre, count, description], i) => ({
    id: `${prefix}-${i}`, title, genre, subgenre, count, description,
    image: portrait(title, (hue0 + i * 37) % 360),
    badge: badge?.(i),
  }));

export const myList = toItems('list', [
  ['Saltmarsh', 'Drama', 'Crime', '2 series', 'A detective returns to the Essex coast to reopen the case that ended her career.'],
  ['Wild Isles Diaries', 'Factual', 'Nature', '6 episodes', 'A year with the wildlife of Britain’s most remote islands.'],
  ['The Last Train Home', 'Film', 'Thriller', '1h 48m', 'One night, one train, and a passenger who isn’t who they say they are.'],
  ['Copper Street', 'Drama', 'Soap', '4 series', 'Life, love and feuds on the busiest street in Salford.'],
  ['Laugh Lines', 'Comedy', 'Stand-up', '8 episodes', 'The best new stand-ups take on a live studio audience.'],
  ['Kitchen Wars', 'Entertainment', 'Cooking', '5 series', 'Twelve home cooks. One kitchen. Only one can win.'],
  ['Deep Water', 'Drama', 'Thriller', '1 series', 'A diver uncovers a secret beneath a North Sea rig.'],
  ['Pitch Perfect XI', 'Sport', 'Football', '10 episodes', 'Behind the scenes with a non-league club chasing promotion.'],
], 200);

export const thisWeek = toItems('week', [
  ['The Hollow Crown Inn', 'Drama', 'Period', 'New series', 'A family-run coaching inn faces ruin in 1840s Yorkshire.'],
  ['Island Escape', 'Entertainment', 'Reality', 'Nightly', 'Singles head to the sun for a summer they’ll never forget.'],
  ['Midnight Verdict', 'Drama', 'Legal', '6 episodes', 'A barrister defends the one client she believes is guilty.'],
  ['Big Bake Live', 'Entertainment', 'Cooking', 'Live Sun 8pm', 'The nation’s best amateur bakers, live from the tent.'],
  ['The Chase Down', 'Entertainment', 'Quiz', 'Weekdays', 'Beat the hunter to the bank in the fastest quiz on TV.'],
  ['Coastline', 'Factual', 'Travel', '8 episodes', 'A walk around every mile of the British coast.'],
  ['Ironside Road', 'Drama', 'Crime', 'New series', 'A rookie officer is partnered with a legend on his final case.'],
  ['Matchday Live', 'Sport', 'Football', 'Live Sat 5pm', 'Every goal and every talking point, live.'],
], 330, (i) => (i === 0 || i === 6 ? 'New series' : i === 3 || i === 7 ? 'Live' : undefined));

export const recommended = toItems('rec', [
  ['Northern Line', 'Drama', 'Thriller', '3 series', 'A transport cop hunts a killer across the Underground.'],
  ['Small Town Secrets', 'Drama', 'Mystery', '2 series', 'Everyone in Little Fenwick has something to hide.'],
  ['The Long Field', 'Drama', 'Rural', '1 series', 'Three generations fight to save the family farm.'],
  ['Harbour Lights', 'Drama', 'Crime', '2 series', 'A harbourmaster is drawn into a smuggling ring.'],
  ['Night Shift', 'Factual', 'Emergency', '10 episodes', 'Twelve hours inside A&E on a Saturday night.'],
  ['The Gilded Age of Steam', 'Factual', 'History', '4 episodes', 'How the railways remade Britain.'],
  ['Cold Case Unit', 'Drama', 'Crime', '5 series', 'Old evidence, new science, and the families still waiting.'],
  ['Lakeside', 'Drama', 'Romance', '1 series', 'Two strangers inherit the same cottage in the Lake District.'],
], 140);

export const leavingSoon = toItems('leave', [
  ['Beneath the Pier', 'Drama', 'Crime', '1 series', 'A body under Brighton pier reopens a 30-year-old case.'],
  ['The Weekend Away', 'Film', 'Comedy', '1h 36m', 'Four old friends, one cottage, too many secrets.'],
  ['Moorland Vets', 'Factual', 'Animals', '3 series', 'A year with a vets’ practice on the North York Moors.'],
  ['Double Booked', 'Comedy', 'Sitcom', '2 series', 'Two wedding planners, one venue, the same Saturday.'],
  ['Red Sky Rising', 'Film', 'Action', '2h 04m', 'A pilot has one night to stop a stolen jet.'],
  ['Inside the Palace', 'Factual', 'Royals', '6 episodes', 'Life behind the doors of Buckingham Palace.'],
  ['The Fixer', 'Drama', 'Thriller', '2 series', 'A crisis manager makes scandals disappear — for a price.'],
], 20, (i) => `${[2, 3, 5, 6, 9, 12, 14][i]} days left`);

/* ----------------------------------------------------------- Coming soon */
/** Same titles and countdowns as the VOD page's Coming soon rail (prototype hydrateCsRail). */
const csTitles = ['The Bear', 'Mr Inbetween', 'Big Brother', 'Harry Potter', 'John Wick: Chapter 4', 'Daredevil: Born Again', 'WandaVision'];
const csLabels = ['1 day to go', '5 days to go', '11 days to go', '13 days to go'];
export const comingSoon: ComingSoonItem[] = csTitles.map((title, i) => ({
  id: `cs-${i}`, title, countdown: csLabels[i] ?? 'Soon',
  image: portrait(title, (260 + i * 41) % 360),
}));
