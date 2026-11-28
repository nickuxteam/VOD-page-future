import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/flex-gap-fallback.css';
import './legacy/flexGap';
import { Stage } from './components/Stage/Stage';
import { MyItvPage } from './pages/MyItvPage';
import { useMyItvContent } from './data/useMyItvContent';

/** Entry for myitv.html — the My ITVX page with TMDB artwork (placeholder art without a key). */
function MyItvApp() {
  const content = useMyItvContent();
  return (
    <Stage>
      <MyItvPage {...content} onOpen={(e) => console.info('open', e.rail, e.index)} />
    </Stage>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><MyItvApp /></StrictMode>);
