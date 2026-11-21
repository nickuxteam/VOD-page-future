#!/usr/bin/env node
/**
 * DEV TOOL — not part of the handover.
 *
 * Measures page-load time for every simulated device by throttling the whole
 * browser CPU (Chrome DevTools Protocol `Emulation.setCPUThrottlingRate`)
 * by each device's `cpuSlowdown`, so JavaScript parse/compile/execute and
 * layout are slowed — the part of a TV page load the in-app simulator can't
 * reach.
 *
 * Usage:
 *   npm run build && npx vite preview --port 4173 &
 *   node --experimental-strip-types src/devtools/scripts/measure-load.mjs \
 *        --react http://localhost:4173/ [--prototype /path/to/index.html] [--runs 3] [--out results.json]
 *
 * Each measurement is preceded by one discarded warm-up load (cold caches).
 * Metrics (median of N runs, ms from navigation start):
 *   fcp    first contentful paint
 *   ready  first frame painted after the page's real content is in place:
 *          prototype → scenario applied to the hero CTA + episode rail rendered
 *          React     → hero CTA + episode rail rendered
 * Network is NOT simulated (pages load from local files / localhost).
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { DEVICES } from '../simulation/devices.ts';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const RUNS = Number(args.runs ?? 3);

/** Prototype hero scenarios and the primary-CTA text that proves each one has been applied. */
const SCENARIOS = [
  { id: 'start', label: 'Start watching', ready: 'Start watching - S1:E1' },
  { id: 'latestseries', label: 'Latest series', ready: 'Start watching - S3:E1' },
  { id: 'latest', label: 'Latest episode', ready: 'Latest episode - S' },
  { id: 'continue', label: 'Continue watching', ready: 'Continue watching - S' },
  { id: 'live', label: 'Live', ready: 'Live - S' },
  { id: 'comingsoon', label: 'Coming soon', ready: 'Watch trailer' },
];

const TARGETS = [{ id: 'baseline', name: 'No simulation (this machine)', cpuSlowdown: 1 }, ...DEVICES];

/** Injected before any page script: records FCP and the "ready" frame. */
const probe = (readyText) => {
  window.__probe = { fcp: null, ready: null };
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) if (e.name === 'first-contentful-paint') window.__probe.fcp = e.startTime;
  }).observe({ type: 'paint', buffered: true });
  const isReady = () => {
    const cta = document.querySelector('#ctaPlayLabel');
    const eps = document.querySelectorAll('.episode-tile-wrap').length;
    return !!cta && (readyText ? cta.textContent.includes(readyText) : true) && eps > 0;
  };
  const check = () => {
    if (window.__probe.ready !== null || !isReady()) return;
    window.__probe.ready = -1;
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__probe.ready = performance.now(); }));
  };
  new MutationObserver(check).observe(document, { subtree: true, childList: true, characterData: true });
};

async function measure(browser, url, rate, { scenario, readyText }) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.addInitScript(({ scenario }) => {
    try {
      localStorage.clear();
      if (scenario) localStorage.setItem('itvx.pageLogic.scenario', scenario);
    } catch { /* file:// may block storage */ }
  }, { scenario });
  await page.addInitScript(probe, readyText ?? null);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  await page.goto(url, { waitUntil: 'commit' });
  await page.waitForFunction(() => window.__probe && window.__probe.ready > 0 && window.__probe.fcp !== null,
    null, { timeout: 120_000, polling: 100 });
  const r = await page.evaluate(() => window.__probe);
  await context.close();
  return r;
}

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

const browser = await chromium.launch();
const results = { runs: RUNS, react: [], prototype: [] };

for (const t of TARGETS) {
  if (args.react) {
    const rs = [];
    await measure(browser, args.react, t.cpuSlowdown, {}); // warm-up (discarded)
    for (let i = 0; i < RUNS; i++) rs.push(await measure(browser, args.react, t.cpuSlowdown, {}));
    const row = { device: t.id, name: t.name, cpuSlowdown: t.cpuSlowdown, fcp: median(rs.map((r) => r.fcp)), ready: median(rs.map((r) => r.ready)) };
    results.react.push(row);
    console.log('react', row.name, Math.round(row.fcp), Math.round(row.ready));
  }
  if (args.prototype) {
    for (const sc of SCENARIOS) {
      const rs = [];
      await measure(browser, 'file://' + args.prototype, t.cpuSlowdown, { scenario: sc.id, readyText: sc.ready }); // warm-up
      for (let i = 0; i < RUNS; i++) {
        rs.push(await measure(browser, 'file://' + args.prototype, t.cpuSlowdown, { scenario: sc.id, readyText: sc.ready }));
      }
      const row = { device: t.id, name: t.name, cpuSlowdown: t.cpuSlowdown, scenario: sc.id, fcp: median(rs.map((r) => r.fcp)), ready: median(rs.map((r) => r.ready)) };
      results.prototype.push(row);
      console.log('prototype', row.name, sc.id, Math.round(row.fcp), Math.round(row.ready));
    }
  }
}

await browser.close();
if (args.out) writeFileSync(args.out, JSON.stringify(results, null, 2));
