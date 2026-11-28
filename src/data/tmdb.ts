/**
 * TMDB lookups for demo artwork and copy (My ITVX page). Demo plumbing, not
 * part of the component library: production pages get art from the content API.
 *
 * Needs a TMDB v3 API key in `.env.local` (git-ignored):
 *   VITE_TMDB_API_KEY=xxxxxxxx
 * Without a key every lookup resolves to null and pages keep their placeholder art.
 * Note: VITE_ variables are bundled into the client, so the key is visible to anyone
 * who loads the page. Fine for a prototype; don't ship a build with it.
 */
const KEY: string | undefined = import.meta.env.VITE_TMDB_API_KEY;
const API = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

export type TmdbKind = 'tv' | 'movie';

export interface TmdbLookup {
  /** Search text; defaults to the display title. */
  query: string;
  kind: TmdbKind;
  /** First-air / release year, to pick the right show (e.g. the UK Love Island). */
  year?: number;
}

export interface TmdbArt {
  id: number;
  poster: string | null;
  backdrop: string | null;
  overview: string;
  year: string;
}

export interface TmdbEpisode {
  name: string;
  still: string | null;
  overview: string;
  runtime: number | null;
}

export const tmdbEnabled = !!KEY;

const cache = new Map<string, Promise<unknown>>();

function getJson<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T | null> {
  if (!KEY) return Promise.resolve(null);
  const qs = Object.keys(params)
    .filter((k) => params[k] !== undefined)
    .map((k) => `${k}=${encodeURIComponent(String(params[k]))}`)
    .join('&');
  const url = `${API}${path}?api_key=${KEY}${qs ? '&' + qs : ''}`;
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  }
  return cache.get(url) as Promise<T | null>;
}

interface SearchResult {
  id: number;
  name?: string;
  title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date?: string;
  release_date?: string;
}

/** Find a show or film and return its artwork. Falls back to the other kind, as the prototype does. */
export async function findArt({ query, kind, year }: TmdbLookup): Promise<TmdbArt | null> {
  const kinds: TmdbKind[] = kind === 'tv' ? ['tv', 'movie'] : ['movie', 'tv'];
  for (const k of kinds) {
    const search = (y?: number) => getJson<{ results?: SearchResult[] }>(`/search/${k}`, {
      query, include_adult: 'false', ...(k === 'tv' ? { first_air_date_year: y } : { year: y }),
    });
    // Year-filtered first (right kind only); if that finds nothing, retry without the year
    // before falling back to the other kind.
    let results = (k === kind && year ? (await search(year))?.results : undefined) ?? [];
    if (!results.length) results = (await search())?.results ?? [];
    // Prefer an exact title match ("Des" must not pick "La semaine des 4 Julie"), then any result with a poster.
    const norm = (t?: string) => (t ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const exact = results.filter((r) => norm(r.name ?? r.title) === norm(query));
    const best = exact.find((r) => r.poster_path) ?? exact[0] ?? results.find((r) => r.poster_path) ?? results[0];
    if (best) {
      return {
        id: best.id,
        poster: best.poster_path ? `${IMG}/w500${best.poster_path}` : null,
        backdrop: best.backdrop_path ? `${IMG}/w780${best.backdrop_path}` : null,
        overview: best.overview ?? '',
        year: (best.first_air_date || best.release_date || '').slice(0, 4),
      };
    }
  }
  return null;
}

/** A TV episode's title and still (for Continue watching tiles). */
export async function findEpisode(showId: number, season: number, episode: number): Promise<TmdbEpisode | null> {
  const ep = await getJson<{ name?: string; still_path?: string | null; overview?: string; runtime?: number | null }>(
    `/tv/${showId}/season/${season}/episode/${episode}`,
  );
  if (!ep) return null;
  return {
    name: ep.name ?? '',
    still: ep.still_path ? `${IMG}/w780${ep.still_path}` : null,
    overview: ep.overview ?? '',
    runtime: ep.runtime ?? null,
  };
}
