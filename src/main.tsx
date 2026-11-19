import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import { Stage } from './components/Stage/Stage';
import { VodTabsPage } from './pages/VodTabsPage';
import { episodesBySeries, programme, relatedProgrammes } from './data/broadchurch';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>,
);
