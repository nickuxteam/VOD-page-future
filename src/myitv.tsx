import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/flex-gap-fallback.css';
import './legacy/flexGap';
import { Stage } from './components/Stage/Stage';
import { MyItvPage } from './pages/MyItvPage';
import { comingSoon, continueWatching, leavingSoon, myList, recommended, thisWeek } from './data/myitv';

/** Entry for myitv.html — the My ITVX page, using dummy content. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Stage>
      <MyItvPage
        continueWatching={continueWatching}
        myList={myList}
        thisWeek={thisWeek}
        recommended={recommended}
        leavingSoon={leavingSoon}
        comingSoon={comingSoon}
        onOpen={(e) => console.info('open', e.rail, e.index)}
      />
    </Stage>
  </StrictMode>,
);
