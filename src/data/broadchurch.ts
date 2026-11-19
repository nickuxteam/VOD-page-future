/**
 * Demo content for the VOD Tabs page — the prototype's default
 * programme (Broadchurch) and a "More like this" rail drawn from the
 * prototype's catalogue spreadsheet (DRAMA / crime-thriller rows).
 *
 * Artwork is intentionally left blank: wire `image` / `backdrop` /
 * `poster` to your content API. Tiles render the ITVX placeholder
 * colours (with a title fallback) until art arrives.
 */
import type { Episode, Programme, RelatedProgramme } from '../types';

export const programme: Programme = {
  title: 'Broadchurch',
  description:
    'A small coastal town is rocked by tragedy when an eleven-year-old boy is found dead on the beach. ' +
    'Detectives Alec Hardy and Ellie Miller lead the investigation.',
  genre: 'DRAMA',
  subgenres: ['Crime thriller', 'Mystery'],
  moods: ['Suspenseful', 'Intense', 'Mysterious'],
  cast: ['David Tennant', 'Olivia Colman', 'Jodie Whittaker'],
  year: '2013',
  rating: '15',
  lengthMinutes: 45,
  seriesCount: 3,
  access: ['AD', 'S'],
  tags: ['EXCLUSIVE'],
  strapline: 'Top 5, trending in drama!',
};

/** 3 series × 8 episodes, 45 mins — per the prototype's metadata sheet. */
export const episodesBySeries: Record<number, Episode[]> = Object.fromEntries(
  [1, 2, 3].map((s) => [
    s,
    Array.from({ length: 8 }, (_, i): Episode => ({
      series: s,
      episode: i + 1,
      title: `Episode ${i + 1}`,
      description: 'Episode synopsis from the content API — clamped to three lines on the tile.',
      length: '45m',
      access: ['AD', 'S'],
      ...(s === 3 && i === 7 ? { tag: 'New episode' } : {}),
    })),
  ]),
);

const related = (title: string, subgenre: string): RelatedProgramme => ({
  id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  title,
  genre: 'Drama',
  subgenre,
  description: 'Programme description from the content API, clamped to two lines in the rail meta area.',
});

export const relatedProgrammes: RelatedProgramme[] = [
  related('Bancroft', 'Crime thriller'),
  related('DI Ray', 'Crime thriller'),
  related('Frauds', 'Crime thriller'),
  related('Gone', 'Crime thriller'),
  related('Inspector Morse', 'Crime thriller'),
  related('Joan', 'Crime thriller'),
  related('Kavanagh QC', 'Crime thriller'),
  related('Law and Order: UK', 'Crime thriller'),
  related('Legacies', 'Crime thriller'),
  related('Little Boy Blue', 'Crime thriller'),
  related('After the Flood', 'Thriller'),
  related('A Touch of Frost', 'Crime thriller'),
];
