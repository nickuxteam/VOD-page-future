import type { ReactNode } from 'react';
import './AboutPanel.css';

export interface AboutPanelProps {
  visible: boolean;
  focused: boolean;
  poster?: string;
  description: string;
  /** Up to six label/value cells: Genre, Length, Cast, Year, Rating, Director. */
  facts: Array<{ label: string; value: ReactNode }>;
  /** Shown above the description when guidance is on. */
  guidance?: string;
  /** Pull the panel up (discover-mode peek), in px. */
  marginTop?: number;
  panelRef?: React.Ref<HTMLElement>;
}

/** ctvcomponents "About section": 1696px card, poster + description + 3-column facts grid. */
export function AboutPanel({ visible, focused, poster, description, facts, guidance, marginTop, panelRef }: AboutPanelProps) {
  return (
    <section ref={panelRef} className={'about-shell' + (visible ? ' show' : '')} style={marginTop ? { marginTop } : undefined}>
      <div className={'about-panel' + (focused ? ' focused' : '')} data-name="About section">
        <div className="ab-poster" style={poster ? { backgroundImage: `url("${poster}")` } : undefined} />
        <div className="ab-col">
          {guidance && <span className="ab-guidance">Guidance: {guidance}</span>}
          <p className="about-desc">{description}</p>
          <div className="ab-grid">
            {facts.map((f) => (
              <div key={f.label} className="ab-cell">
                <span className="ab-lab">{f.label}</span>
                <span className="ab-val">{f.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
