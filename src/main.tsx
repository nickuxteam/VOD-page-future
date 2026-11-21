import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/flex-gap-fallback.css';
import './legacy/flexGap';
import { App } from './App';

const root = createRoot(document.getElementById('root')!);
const fixtureName = new URLSearchParams(location.search).get('fixture');

// Dev builds only: ?fixture=film etc. swaps the demo content (src/devtools/fixtures.ts).
if ((import.meta.env.DEV || import.meta.env.VITE_DEVTOOLS === 'true') && fixtureName) {
  import('./devtools/fixtures').then(({ FIXTURES }) => {
    root.render(<StrictMode><App content={FIXTURES[fixtureName]} /></StrictMode>);
  });
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
