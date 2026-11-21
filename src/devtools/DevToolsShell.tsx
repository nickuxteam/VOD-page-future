/**
 * DEV TOOL — not part of the handover.
 *
 * Wraps the demo page with the Q config panel and the device simulator.
 * Loaded only in `npm run dev` (or a build with VITE_DEVTOOLS=true), so it
 * never ships in the production bundle and the handover components carry no
 * simulation code: remote lag and dropped presses are applied here by
 * intercepting key presses before the page sees them.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ConfigPanel } from './config/ConfigPanel';
import { DeviceSimulator } from './simulation/DeviceSimulator';
import { NO_SIMULATION, findDevice } from './simulation/devices';

const STORAGE_KEY = 'vod.simulation.device';
const NAV_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ', 'Backspace', 'Escape']);
/** Marks presses we re-dispatch after the simulated delay. */
const REPLAYED = Symbol('sim-replayed');

function loadDevice(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return id && findDevice(id) ? id : NO_SIMULATION;
  } catch {
    return NO_SIMULATION;
  }
}

export default function DevToolsShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [deviceId, setDeviceId] = useState(loadDevice);
  const device = findDevice(deviceId);
  const state = useRef({ open, device });
  state.current = { open, device };

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, deviceId); } catch { /* storage unavailable */ }
  }, [deviceId]);

  // Capture phase: runs before the page's own (bubble-phase) key listener.
  useEffect(() => {
    let pending = 0;
    const timers = new Set<number>();
    const onKey = (e: KeyboardEvent) => {
      if ((e as unknown as Record<symbol, boolean>)[REPLAYED]) return;
      const typing = (e.target as HTMLElement | null)?.tagName === 'INPUT';
      const { open: isOpen, device: dev } = state.current;

      if ((e.key === 'q' || e.key === 'Q') && !typing) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setOpen((o) => !o);
        return;
      }
      if (isOpen) {
        if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
        // Let the panel's own controls (the select) work; keep keys from the page.
        e.stopImmediatePropagation();
        return;
      }
      if (!dev || dev.inputLatencyMs <= 0 || !NAV_KEYS.has(e.key)) return;

      // Simulated remote lag: swallow the press and replay it later.
      e.preventDefault();
      e.stopImmediatePropagation();
      if (dev.dropKeys && pending > 0) return;
      pending++;
      const id = window.setTimeout(() => {
        timers.delete(id);
        pending--;
        const replay = new KeyboardEvent('keydown', { key: e.key, bubbles: true, cancelable: true });
        (replay as unknown as Record<symbol, boolean>)[REPLAYED] = true;
        window.dispatchEvent(replay);
      }, dev.inputLatencyMs);
      timers.add(id);
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKey, { capture: true });
      timers.forEach((id) => clearTimeout(id));
    };
  }, []);

  return (
    <>
      {children}
      {device && <DeviceSimulator device={device} />}
      <ConfigPanel open={open} onClose={() => setOpen(false)} deviceId={deviceId} onDeviceChange={setDeviceId} />
    </>
  );
}
