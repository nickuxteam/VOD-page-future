/**
 * DEV TOOL — not part of the handover. Alternative demo content for testing,
 * selected with ?fixture=<name> (dev builds only).
 */
import type { Episode, Programme, RelatedProgramme } from '../types';
import { episodesBySeries, programme, relatedProgrammes } from '../data/broadchurch';

export interface Fixture {
  programme: Programme;
  episodesBySeries: Record<number, Episode[]>;
  related: RelatedProgramme[];
}

const film: Fixture = {
  programme: {
    title: 'Example Film',
    description: 'Film synopsis from the content API.',
    genre: 'FILM',
    subgenres: ['Thriller'],
    moods: ['Tense'],
    cast: ['Lead Actor'],
    year: '2021',
    rating: '15',
    lengthMinutes: 112,
    seriesCount: 0,
    access: ['AD', 'S'],
  },
  episodesBySeries: {},
  related: relatedProgrammes,
};

export const FIXTURES: Record<string, Fixture> = {
  broadchurch: { programme, episodesBySeries, related: relatedProgrammes },
  film,
};
