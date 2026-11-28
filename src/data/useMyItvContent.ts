import { useEffect, useState } from 'react';
import type { ComingSoonItem } from '../components/ComingSoonRail/ComingSoonRail';
import type { Episode, RelatedProgramme } from '../types';
import { findArt, findEpisode, tmdbEnabled } from './tmdb';
import {
  comingSoon, comingSoonSeeds, continueSeeds, continueWatching, leavingSoon, leavingSoonSeeds,
  myList, myListSeeds, recommended, recommendedSeeds, thisWeek, thisWeekSeeds, type PortraitSeed,
} from './myitv';

export interface MyItvContent {
  continueWatching: Episode[];
  myList: RelatedProgramme[];
  thisWeek: RelatedProgramme[];
  recommended: RelatedProgramme[];
  leavingSoon: RelatedProgramme[];
  comingSoon: ComingSoonItem[];
}

const PLACEHOLDER: MyItvContent = { continueWatching, myList, thisWeek, recommended, leavingSoon, comingSoon };

/** Continue watching: the episode's still + title, falling back to the show backdrop. */
async function hydrateContinue(): Promise<Episode[]> {
  return Promise.all(continueSeeds.map(async (c, i) => {
    const base = continueWatching[i];
    const show = await findArt(c.tmdb);
    if (!show) return base;
    const ep = await findEpisode(show.id, c.series, c.episode);
    return {
      ...base,
      image: ep?.still ?? show.backdrop ?? base.image,
      description: ep?.name ? `S${c.series}:E${c.episode} · ${ep.name}` : base.description,
    };
  }));
}

async function hydratePortraits(seeds: PortraitSeed[], items: RelatedProgramme[]): Promise<RelatedProgramme[]> {
  return Promise.all(seeds.map(async (sd, i) => {
    const art = await findArt(sd.tmdb);
    if (!art) return items[i];
    return { ...items[i], image: art.poster ?? items[i].image, description: art.overview || items[i].description };
  }));
}

/**
 * My ITVX demo content. Renders straight away with placeholder art, then swaps in
 * TMDB artwork and copy rail by rail as lookups resolve (when a key is configured).
 */
export function useMyItvContent(): MyItvContent {
  const [content, setContent] = useState<MyItvContent>(PLACEHOLDER);
  useEffect(() => {
    if (!tmdbEnabled) return;
    let live = true;
    const set = <K extends keyof MyItvContent>(k: K) => (v: MyItvContent[K]) => {
      if (live) setContent((c) => ({ ...c, [k]: v }));
    };
    hydrateContinue().then(set('continueWatching'));
    hydratePortraits(myListSeeds, myList).then(set('myList'));
    hydratePortraits(thisWeekSeeds, thisWeek).then(set('thisWeek'));
    hydratePortraits(recommendedSeeds, recommended).then(set('recommended'));
    hydratePortraits(leavingSoonSeeds, leavingSoon).then(set('leavingSoon'));
    Promise.all(comingSoonSeeds.map((c, i) =>
      findArt(c.tmdb).then((art) => ({ ...comingSoon[i], image: art?.poster ?? comingSoon[i].image })),
    )).then(set('comingSoon'));
    return () => { live = false; };
  }, []);
  return content;
}
