import { useEffect, useState } from 'react';
import type { DeviceProfile } from './devices';
import { checkCompat } from './compat';
import './simulation.css';

/**
 * DEV TOOL — not part of the handover.
 * Applies a device profile to the page while it is mounted:
 *
 *  1. CPU — a requestAnimationFrame loop holds the main thread until each
 *     frame has lasted 1000/uiFps ms. React renders, layout and key handling
 *     then genuinely run at the device's frame rate (they queue behind it).
 *  2. GPU — sets `sim-gpu-<tier>` on <html>: CSS transitions become stepped at
 *     the device frame rate (compositor animations would otherwise stay
 *     smooth on a desktop GPU) and heavy effects are dropped on weak GPUs.
 *  3. HUD — a small overlay outside the TV canvas showing the device and the
 *     measured frame rate.
 *
 * Input latency / dropped presses are applied by DevToolsShell.
 */
export function DeviceSimulator({ device }: { device: DeviceProfile }) {
  const [fps, setFps] = useState<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const classes = ['sim-active', `sim-gpu-${device.gpuTier}`];
    root.classList.add(...classes);
    // Typical UI transition is ~330ms → number of frames the device draws in it.
    root.style.setProperty('--sim-steps', String(Math.max(2, Math.round(device.uiFps * 0.33))));

    const budget = 1000 / device.uiFps;
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let windowStart = last;
    const tick = () => {
      const target = last + budget;
      // Busy-wait: simulate a CPU that needs the whole frame budget.
      while (performance.now() < target) { /* spin */ }
      last = performance.now();
      frames++;
      if (last - windowStart >= 1000) {
        setFps(Math.round((frames * 1000) / (last - windowStart)));
        frames = 0;
        windowStart = last;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove(...classes);
      root.style.removeProperty('--sim-steps');
      setFps(null);
    };
  }, [device]);

  return (
    <div className="sim-hud" role="status" aria-live="off">
      <strong>Simulating {device.name} – {device.year}</strong>
      <span>{device.cpu} · {device.gpu} · {device.ramGB ? `${device.ramGB} GB` : 'RAM unknown'} · {device.os}</span>
      <CompatLine chromium={device.chromium} />
      <span>
        Target {device.uiFps} fps · measured {fps ?? '…'} fps · +{device.inputLatencyMs} ms input
        {device.dropKeys ? ' · drops presses while busy' : ''} · GPU {device.gpuTier}
      </span>
    </div>
  );
}

function CompatLine({ chromium }: { chromium?: number }) {
  const { checked, missing } = checkCompat(chromium);
  if (!checked) return <span>Engine not fixed — compatibility not checked</span>;
  const breaks = missing.filter((f) => f.severity === 'breaks').length;
  if (!missing.length) return <span>Chromium {chromium} · all page features supported</span>;
  return (
    <span className={breaks ? 'sim-hud-warn' : undefined}>
      Chromium {chromium} · {breaks ? `${breaks} feature(s) break the page` : `${missing.length} feature(s) degraded`} — see Q panel
    </span>
  );
}
