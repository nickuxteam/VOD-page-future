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
 *  3. HUD — a small overlay outside the TV canvas showing the device, the
 *     measured frame rate, and CPU / memory usage bars (see measureLoad).
 *
 * Input latency / dropped presses are applied by DevToolsShell.
 */
/**
 * Rough per-app memory budget: share of device RAM a single web app can
 * expect once the OS, launcher and media pipeline have taken theirs. An
 * estimate for display only — calibrate on hardware.
 */
const APP_MEMORY_SHARE = 0.2;
/** Assumed RAM when a manufacturer doesn't publish it. */
const FALLBACK_RAM_GB = 1;

interface Usage {
  fps: number;
  /** Estimated device CPU use, 0–100. */
  cpu: number;
  /** JS heap in MB, or null where the browser doesn't expose it. */
  heapMB: number | null;
}

export function DeviceSimulator({ device }: { device: DeviceProfile }) {
  const [usage, setUsage] = useState<Usage | null>(null);

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
    let spinMs = 0;   // time the simulator itself spent holding the thread
    let cpuSmooth = 0;

    const tick = () => {
      const spinStart = performance.now();
      const target = last + budget;
      // Busy-wait: simulate a CPU that needs the whole frame budget.
      while (performance.now() < target) { /* spin */ }
      last = performance.now();
      spinMs += last - spinStart;
      frames++;
      const windowMs = last - windowStart;
      if (windowMs >= 1000) {
        // The spin fills every frame up to its budget, so the main thread never
        // idles: the time between spins is the page's own work (React, events,
        // style, layout, paint). On the device that work takes cpuSlowdown×
        // longer, so scale it to the device's CPU.
        const workMs = Math.max(0, windowMs - spinMs);
        const cpu = Math.min(100, ((workMs * device.cpuSlowdown) / windowMs) * 100);
        // Raw numbers for debugging in the console: window.__simStats
        (window as unknown as { __simStats: object }).__simStats = { windowMs, spinMs, workMs, frames, cpu };
        cpuSmooth = cpuSmooth ? cpuSmooth * 0.5 + cpu * 0.5 : cpu;
        const mem = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
        setUsage({
          fps: Math.round((frames * 1000) / windowMs),
          cpu: Math.round(cpuSmooth),
          heapMB: mem ? mem.usedJSHeapSize / 1048576 : null,
        });
        frames = 0;
        spinMs = 0;
        windowStart = last;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove(...classes);
      root.style.removeProperty('--sim-steps');
      setUsage(null);
    };
  }, [device]);

  return (
    <div className="sim-hud" role="status" aria-live="off">
      <strong>Simulating {device.name} – {device.year}</strong>
      <span>{device.cpu} · {device.gpu} · {device.ramGB ? `${device.ramGB} GB` : 'RAM unknown'} · {device.os}</span>
      <CompatLine chromium={device.chromium} />
      <span>
        Target {device.uiFps} fps · measured {usage?.fps ?? '…'} fps · +{device.inputLatencyMs} ms input
        {device.dropKeys ? ' · drops presses while busy' : ''} · GPU {device.gpuTier}
      </span>
      <UsageBars device={device} usage={usage} />
    </div>
  );
}

function UsageBars({ device, usage }: { device: DeviceProfile; usage: Usage | null }) {
  const ramGB = device.ramGB ?? FALLBACK_RAM_GB;
  const budgetMB = ramGB * 1024 * APP_MEMORY_SHARE;
  const heap = usage?.heapMB ?? null;
  const memPct = heap == null ? null : Math.min(100, (heap / budgetMB) * 100);
  return (
    <div className="sim-bars">
      <Bar
        label="CPU"
        pct={usage ? usage.cpu : null}
        value={usage ? `${usage.cpu}%` : '…'}
        title={`Main-thread work in the last second × ${device.cpuSlowdown} (device CPU slowdown), excluding the simulator's own throttling`}
      />
      <Bar
        label="Memory"
        pct={memPct}
        value={heap == null ? 'n/a in this browser' : `${Math.round(heap)} / ${Math.round(budgetMB)} MB est. app budget${device.ramGB ? '' : ' (RAM unpublished, 1 GB assumed)'}`}
        title={`JS heap vs an estimated app budget of ${Math.round(APP_MEMORY_SHARE * 100)}% of ${ramGB} GB device RAM${device.ramGB ? '' : ' (RAM unpublished — 1 GB assumed)'}`}
      />
    </div>
  );
}

function Bar({ label, pct, value, title }: { label: string; pct: number | null; value: string; title: string }) {
  const level = pct == null ? '' : pct >= 85 ? ' high' : pct >= 60 ? ' mid' : '';
  return (
    <div className="sim-bar" title={title}>
      <span className="sim-bar-label">{label}</span>
      <span className="sim-bar-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct ?? undefined}>
        <i className={'sim-bar-fill' + level} style={{ width: `${pct ?? 0}%` }} />
      </span>
      <span className="sim-bar-value">{value}</span>
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
