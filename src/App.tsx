import { Suspense, lazy } from 'react';
import { Stage } from './components/Stage/Stage';
import { VodTabsPage } from './pages/VodTabsPage';
import { episodesBySeries, programme, relatedProgrammes } from './data/broadchurch';

/**
 * Dev tools (Q config panel, device simulation) are dev-only and not part
 * of the handover: they load in `npm run dev`, or in a build made with
 * VITE_DEVTOOLS=true, and are tree-shaken out of normal production builds.
 */
const DEVTOOLS_ENABLED = import.meta.env.DEV || import.meta.env.VITE_DEVTOOLS === 'true';
const DevToolsShell = DEVTOOLS_ENABLED ? lazy(() => import('./devtools/DevToolsShell')) : null;

export function App() {
  const page = (
    <Stage>
      <VodTabsPage
        programme={programme}
        episodesBySeries={episodesBySeries}
        related={relatedProgrammes}
        onPlayEpisode={(ep) => console.info('play', `S${ep.series}:E${ep.episode}`)}
        onOpenProgramme={(item) => console.info('open', item.title)}
        onCta={(cta) => console.info('cta', cta.id)}
      />
    </Stage>
  );
  if (!DevToolsShell) return page;
  return (
    <Suspense fallback={page}>
      <DevToolsShell>{page}</DevToolsShell>
    </Suspense>
  );
}
