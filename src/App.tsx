import { useEffect, useState } from 'react';
import { Stage } from './components/Stage/Stage';
import { VodTabsPage } from './pages/VodTabsPage';
import { ConfigPanel } from './config/ConfigPanel';
import { DeviceSimulator } from './simulation/DeviceSimulator';
import { NO_SIMULATION, findDevice } from './simulation/devices';
import { episodesBySeries, programme, relatedProgrammes } from './data/broadchurch';

const STORAGE_KEY = 'vod.simulation.device';

function loadDevice(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return id && findDevice(id) ? id : NO_SIMULATION;
  } catch {
    return NO_SIMULATION;
  }
}

/** Demo app: the VOD Tabs page plus the Q config panel (device simulation). */
export function App() {
  const [configOpen, setConfigOpen] = useState(false);
  const [deviceId, setDeviceId] = useState(loadDevice);
  const device = findDevice(deviceId);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, deviceId); } catch { /* storage unavailable */ }
  }, [deviceId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.tagName === 'INPUT';
      if ((e.key === 'q' || e.key === 'Q') && !typing) {
        e.preventDefault();
        setConfigOpen((o) => !o);
      } else if (e.key === 'Escape' && configOpen) {
        e.preventDefault();
        setConfigOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [configOpen]);

  return (
    <>
      <Stage>
        <VodTabsPage
          programme={programme}
          episodesBySeries={episodesBySeries}
          related={relatedProgrammes}
          inputEnabled={!configOpen}
          inputLatencyMs={device?.inputLatencyMs ?? 0}
          dropKeysWhileBusy={device?.dropKeys ?? false}
          onPlayEpisode={(ep) => console.info('play', `S${ep.series}:E${ep.episode}`)}
          onOpenProgramme={(item) => console.info('open', item.title)}
          onCta={(cta) => console.info('cta', cta.id)}
        />
      </Stage>
      {device && <DeviceSimulator device={device} />}
      <ConfigPanel
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        deviceId={deviceId}
        onDeviceChange={setDeviceId}
      />
    </>
  );
}
