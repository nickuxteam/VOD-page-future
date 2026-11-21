#!/usr/bin/env node
/**
 * DEV TOOL — not part of the handover.
 *
 * Runs every user journey (spec §8) on the React build and every hero
 * scenario (spec §7.1) on the original prototype, once per simulated device.
 *
 * Per device:
 *  - in-app simulator active (frame-rate cap, remote lag, dropped presses, GPU tier)
 *  - Chrome CPU throttled by the device's cpuSlowdown
 *  - engines older than Chromium 84 get native flex `gap` disabled, so the
 *    fallback layout is what's tested
 *
 * After every step: the expected state must be reached (timed = response
 * time), then invariants are checked — exactly one focused element, on
 * screen, not covered, not faded out — and console errors are collected.
 *
 * Usage:
 *   VITE_DEVTOOLS=true npx vite build --outDir dist-devtools
 *   npx vite preview --outDir dist-devtools --port 4174 &
 *   node --experimental-strip-types src/devtools/scripts/test-journeys.mjs \
 *     --react http://localhost:4174/ [--prototype /path/to/index.html] [--out results.json] [--family "LG TV"]
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { DEVICES } from '../simulation/devices.ts';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const families = args.family ? args.family.split(',').map((f) => f.trim()) : null;
const BASELINE = { id: 'none', name: 'No simulation', family: '—', cpuSlowdown: 1, inputLatencyMs: 0, dropKeys: false };
const TARGETS = [BASELINE, ...DEVICES.filter((d) => !families || families.includes(d.family))];
const STEP_TIMEOUT = 15_000;
const SLOW_STEP_MS = 1000;

/* ------------------------------------------------------------ helpers */
const HELPERS = () => {
  const q = (s) => document.querySelector(s);
  const txt = (s) => q(s)?.textContent?.trim() ?? null;
  window.T = {
    q,
    has: (cls) => !!q('.app')?.classList.contains(cls),
    focusedCta: () => q('.vod-cta.focused')?.dataset.cta ?? null,
    ctaText: (i) => document.querySelector(`.vod-cta[data-cta="${i}"] span`)?.textContent?.trim() ?? null,
    ctaLabel: () => txt('#ctaPlayLabel'),
    focusedTab: () => txt('.series-tab.focused .series-tab-label'),
    tabs: () => [...document.querySelectorAll('.series-tab .series-tab-label')].map((e) => e.textContent.trim()),
    focusedChip: () => txt('.series-dd-item.focused'),
    activeChip: () => txt('.series-dd-item.active'),
    subNavOpen: () => !!q('.series-dd-menu.open'),
    focusedEp: () => txt('.episode-tile.focused .ep-tag'),
    epTags: () => [...document.querySelectorAll('.episode-tile .ep-tag')].map((e) => e.textContent.trim()),
    focusedTile: () => q('.grid-tile.focused')?.getAttribute('aria-label') ?? null,
    focusedTrailer: () => q('.trailer-tile.focused')?.parentElement?.querySelector('.trailer-tile-label')?.textContent ?? null,
    opacity: (s) => (q(s) ? parseFloat(getComputedStyle(q(s)).opacity) : null),
    shown: (s) => { const el = q(s); if (!el) return false; const r = el.getBoundingClientRect(); return getComputedStyle(el).display !== 'none' && r.height > 0; },
    invariants: () => {
      const errs = [];
      const focused = [...document.querySelectorAll('.app .focused')];
      if (focused.length !== 1) errs.push(`expected 1 focused element, found ${focused.length}`);
      for (const el of focused) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const name = el.className.toString().split(' ').slice(0, 2).join('.');
        if (r.width === 0 || r.height === 0) { errs.push(`focused ${name} has no size`); continue; }
        if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) { errs.push(`focused ${name} is off-screen`); continue; }
        const hit = document.elementFromPoint(cx, cy);
        if (!(hit && (hit === el || el.contains(hit) || hit.contains(el)))) {
          errs.push(`focused ${name} is covered by ${hit ? hit.className || hit.tagName : 'nothing'}`);
        }
        let o = 1;
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
        if (o < 0.5) errs.push(`focused ${name} is faded (opacity ${o.toFixed(2)})`);
      }
      return errs;
    },
  };
};

/** Mimic an engine without flex gap (Chromium < 84): the app must detect it and use its fallback. */
const NO_FLEX_GAP = () => {
  const css = '*:not(.ab-grid):not(.vod-hero):not(.vod-cta-row){gap:0!important;row-gap:0!important;column-gap:0!important}';
  const mo = new MutationObserver(() => {
    if (document.head && !document.getElementById('nogap')) {
      const st = document.createElement('style'); st.id = 'nogap'; st.textContent = css;
      document.head.appendChild(st); mo.disconnect();
    }
  });
  mo.observe(document, { childList: true, subtree: true });
};

/* ----------------------------------------------------------- journeys */
/** soft: record a failure but carry on with the journey. */
const S = (key, expect, label, soft = false) => ({ key, expect, label, soft });
const TO_TABS = [S('ArrowDown', "T.focusedCta()==='1'", 'hero: to secondary CTA'), S('ArrowDown', "T.has('series-focus') && T.focusedTab()==='Episodes'", 'to tab row: EPISODES focused, hero collapsed')];
const TO_CHIPS = [...TO_TABS, S('ArrowDown', "T.focusedChip()==='Series 1' && T.activeChip()==='Series 1'", 'sub nav opens on SERIES 1')];
const TO_EPS = [...TO_CHIPS, S('ArrowDown', "T.focusedEp()==='S1:E1'", 'episode rail: S1:E1 focused')];

const JOURNEYS = [
  { id: 'J1', name: 'Play the suggested episode', steps: [S('Enter', 'true', 'OK on primary CTA')], log: 'cta play' },
  { id: 'J2', name: 'Browse series 1 and start episode 3', steps: [
    ...TO_EPS,
    S('ArrowRight', "T.focusedEp()==='S1:E2'", '→ S1:E2'),
    S('ArrowRight', "T.focusedEp()==='S1:E3' && T.ctaLabel()==='Start watching - S1:E3'", '→ S1:E3, hero label synced'),
    S('Enter', 'true', 'OK plays episode'),
  ], log: 'play S1:E3' },
  { id: 'J3', name: 'Switch to series 3', steps: [
    ...TO_CHIPS,
    S('ArrowLeft', "T.focusedChip()==='Series 2'", '← chip Series 2'),
    S('ArrowLeft', "T.focusedChip()==='Series 3'", '← chip Series 3'),
    S('Enter', "T.activeChip()==='Series 3' && T.epTags()[0]==='S3:E1' && T.epTags().includes('New episode')", 'OK selects series 3; E8 tagged New episode'),
    S('ArrowUp', "T.focusedTab()==='Episodes' && !T.focusedChip()", '↑ to EPISODES trigger'),
    S('ArrowUp', "T.has('hero-focused')", '↑ closes sub nav, back to hero'),
  ] },
  { id: 'J4', name: 'Read About', steps: [
    ...TO_TABS,
    S('ArrowRight', "T.focusedTab()==='About' && !T.subNavOpen()", '→ ABOUT, sub nav hidden'),
    S('ArrowDown', "!!T.q('.about-panel.focused') && T.shown('.about-shell.show') && !T.q('.episode-rail-shell')", '↓ About card focused, episodes hidden'),
    S('ArrowDown', "T.has('discover-focus') && T.focusedTile()==='Bancroft'", '↓ related rail (discover)'),
    S('ArrowUp', "!!T.q('.about-panel.focused')", '↑ back to About'),
    S('ArrowUp', "T.focusedTab()==='About'", '↑ back to ABOUT tab'),
  ] },
  { id: 'J5', name: 'Watch a trailer', steps: [
    ...TO_TABS,
    S('ArrowRight', "T.focusedTab()==='About'", '→ ABOUT'),
    S('ArrowRight', "T.focusedTab()==='Trailers'", '→ TRAILERS'),
    S('ArrowDown', "T.focusedTrailer()==='Series 3 trailer'", '↓ Series 3 trailer'),
    S('ArrowRight', "T.focusedTrailer()==='Series 2 trailer'", '→ Series 2 trailer'),
    S('Enter', "!!T.q('.trailer-tile.focused.playing')", 'OK plays inline'),
    S('Enter', "!T.q('.trailer-tile.playing')", 'OK stops'),
    S('Enter', "!!T.q('.trailer-tile.playing')", 'OK plays again'),
    S('ArrowUp', "T.focusedTab()==='Trailers' && !T.q('.trailer-tile.playing')", '↑ stops playback, back to TRAILERS tab'),
  ] },
  { id: 'J6', name: 'Find something similar (OK on Related)', steps: [
    ...TO_TABS,
    S('ArrowRight', "T.focusedTab()==='About'", '→'), S('ArrowRight', "T.focusedTab()==='Trailers'", '→'),
    S('ArrowRight', "T.focusedTab()==='Related'", '→ RELATED'),
    S('Enter', "T.has('discover-focus') && T.focusedTile()==='Bancroft' && T.opacity('.prompt-header-title')>0.95 && T.opacity('.rail-meta')>0.95", 'OK: discover mode, heading 100%, meta shown'),
    S('ArrowRight', "T.focusedTile()==='DI Ray'", '→'), S('ArrowRight', "T.focusedTile()==='Frauds'", '→'),
    S('ArrowRight', "T.focusedTile()==='Gone'", '→'),
    S('ArrowRight', "T.focusedTile()==='Inspector Morse' && T.q('.rail-meta-item').textContent==='Drama'", '→ Inspector Morse, meta updated'),
    S('Enter', 'true', 'OK opens programme'),
  ], log: 'open Inspector Morse' },
  { id: 'J6b', name: 'Related via ↓ (related view)', steps: [
    ...TO_TABS,
    S('ArrowRight', "T.focusedTab()==='About'", '→'), S('ArrowRight', "T.focusedTab()==='Trailers'", '→'),
    S('ArrowRight', "T.focusedTab()==='Related'", '→ RELATED'),
    S('ArrowDown', "T.has('series-focus') && !T.has('discover-focus') && T.focusedTile()==='Bancroft'", '↓ related rail, hero stays collapsed'),
    S('Backspace', "T.focusedEp()==='S1:E1'", 'Back → episodes'),
  ] },
  { id: 'J7', name: 'Add to My List', steps: [
    S('ArrowDown', "T.focusedCta()==='1'", '↓'),
    S('ArrowRight', "T.focusedCta()==='2' && T.ctaText(2)==='Add to list'", '→ Add to list'),
    S('Enter', "T.ctaText(2)==='Added to list'", 'OK → Added to list'),
    S('Enter', "T.ctaText(2)==='Add to list'", 'OK → Add to list'),
  ] },
  { id: 'J8', name: 'Back out from deep in the page', steps: [
    ...TO_EPS,
    S('ArrowDown', "T.focusedTile()==='Bancroft'", '↓ related rail'),
    S('Backspace', "T.focusedEp()==='S1:E1'", 'Back → episodes'),
    S('Backspace', "T.focusedChip()==='Series 1'", 'Back → sub nav chips'),
    S('Backspace', "T.focusedTab()==='Episodes' && T.subNavOpen()", 'Back → EPISODES trigger'),
    S('Backspace', "T.focusedTab()==='Episodes' && !T.q('.dropdown-trigger.open')", 'Back → sub nav closes'),
    S('Backspace', "T.has('hero-focused')", 'Back → hero'),
  ] },
  { id: 'J9', name: 'Film', query: '?fixture=film', steps: [
    S(null, "T.ctaLabel()==='Watch film'", 'primary CTA reads "Watch film" (spec §7.1)', true),
    S('ArrowDown', "T.focusedCta()==='1'", '↓'),
    S('ArrowDown', "T.focusedTab()==='About' && T.tabs().join(',')==='About,Related' && !T.q('.episode-rail-shell')", '↓ tabs: About, Related only; no episode rail'),
    S('ArrowDown', "!!T.q('.about-panel.focused')", '↓ About'),
    S('ArrowDown', "T.focusedTile()==='Bancroft'", '↓ related rail'),
    S('Backspace', "!!T.q('.about-panel.focused')", 'Back → About'),
  ] },
  { id: 'J11', name: 'TV remote Back keys (LG 461 / Samsung 10009 / Android 4)', steps: [
    ...TO_TABS, S({ keyCode: 461 }, "T.has('hero-focused')", 'LG Back (461) → hero'),
    S('ArrowDown', "T.has('series-focus')", '↓ tabs'), S({ keyCode: 10009 }, "T.has('hero-focused')", 'Samsung Return (10009) → hero'),
    S('ArrowDown', "T.has('series-focus')", '↓ tabs'), S({ keyCode: 4 }, "T.has('hero-focused')", 'Android Back (4) → hero'),
  ] },
];

/* --------------------------------------------- prototype hero scenarios */
const SCENARIOS = [
  // Start / Latest series / Latest episode default to the 3-button tower (no Trailer) — prototype BTN_GROUP 'notrailer'.
  { id: 'start', label: 'Start watching - S1:E1', ep: 'S1:E1', secondaries: ['Watch ad free', 'Add to list'], tag: null, progress: false },
  { id: 'latestseries', label: 'Start watching - S3:E1', ep: 'S3:E1', secondaries: ['Watch ad free', 'Add to list'], tag: 'LATEST SERIES', progress: false },
  { id: 'latest', label: 'Latest episode - S3:E8', ep: 'S3:E8', secondaries: ['Watch ad free', 'Add to list'], tag: 'NEW EPISODE', progress: false },
  { id: 'continue', label: 'Continue watching - S1:E7', ep: 'S1:E7', secondaries: ['Restart', 'Go Ad Free', 'Add to list'], tag: null, progress: true },
  { id: 'live', label: 'Live - S3:E8', ep: 'S3:E8', secondaries: ['Start again', 'Add to list', 'Go Ad Free'], tag: 'LIVE', progress: true },
  { id: 'comingsoon', label: 'Watch trailer', ep: 'S3:E8', secondaries: ['Remind me'], tag: null, progress: false },
];

const PROTO_STATE = () => {
  const vis = (el) => !!el && getComputedStyle(el).display !== 'none';
  const secondaries = [1, 2, 3].map((i) => document.querySelector(`.vod-cta[data-cta="${i}"]`))
    .filter(vis).map((b) => b.querySelector('span')?.textContent.trim());
  const tags = ['heroLatestPill', 'heroLivePill', 'heroExclusivePill'].map((id) => document.getElementById(id))
    .filter(vis).map((e) => e.textContent.trim());
  return {
    label: document.getElementById('ctaPlayLabel')?.textContent.trim(),
    secondaries, tags,
    progress: vis(document.getElementById('ctaTowerProgress')),
    timeLeft: vis(document.getElementById('heroTimeRemaining')),
    focusedEp: document.querySelector('.episode-tile.focused .ep-tag')?.textContent.trim() ?? null,
  };
};

/* ------------------------------------------------------------ runner */
async function openPage(browser, url, device, { simulate, seed }) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const logs = [];
  page.on('pageerror', (e) => consoleErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|net::ERR|themoviedb|youtube/i.test(m.text())) consoleErrors.push(m.text());
    if (m.type() === 'info') logs.push(m.text());
  });
  await page.addInitScript((id) => { try { localStorage.setItem('vod.simulation.device', id); } catch { /* file:// */ } }, simulate ? device.id : 'none');
  if (seed) await page.addInitScript(seed.fn, seed.arg);
  await page.addInitScript(HELPERS);
  if (device.chromium && device.chromium < 84) await page.addInitScript(NO_FLEX_GAP);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: device.cpuSlowdown });
  await page.goto(url);
  return { context, page, consoleErrors, logs };
}

async function press(page, key) {
  if (typeof key === 'string') return page.keyboard.press(key);
  await page.evaluate((kc) => {
    const e = new KeyboardEvent('keydown', { key: 'Unidentified', bubbles: true, cancelable: true });
    Object.defineProperty(e, 'keyCode', { get: () => kc });
    window.dispatchEvent(e);
  }, key.keyCode);
}

async function runJourney(browser, device, j) {
  const { context, page, consoleErrors, logs } = await openPage(browser, args.react + (j.query ?? ''), device, { simulate: device.id !== 'none' });
  const result = { journey: j.id, name: j.name, passed: true, failures: [], steps: [] };
  try {
    await page.waitForFunction(() => window.T && document.getElementById('ctaPlayLabel'), null, { timeout: 60_000 });
    if (device.id !== 'none') await page.waitForSelector('.sim-hud', { timeout: 60_000 });
    for (const step of j.steps) {
      const t0 = Date.now();
      if (step.key) await press(page, step.key);
      try {
        await page.waitForFunction(step.expect, null, { timeout: STEP_TIMEOUT, polling: 16 });
      } catch {
        const snap = await page.evaluate(() => ({ cta: T.focusedCta(), tab: T.focusedTab(), chip: T.focusedChip(), ep: T.focusedEp(), tile: T.focusedTile(), label: T.ctaLabel(), cls: document.querySelector('.app')?.className })).catch(() => ({}));
        result.passed = false;
        result.failures.push({ step: step.label, kind: 'expectation', detail: `not reached in ${STEP_TIMEOUT / 1000}s`, state: snap });
        result.steps.push({ step: step.label, ms: null });
        if (step.soft) continue;
        break;
      }
      const ms = Date.now() - t0;
      result.steps.push({ step: step.label, ms });
      await page.waitForTimeout(400); // let the 250ms motion token settle before checking invariants
      const inv = await page.evaluate(() => T.invariants());
      if (inv.length) { result.passed = false; result.failures.push({ step: step.label, kind: 'invariant', detail: inv.join('; ') }); }
    }
    if (j.log && result.passed) {
      const t0 = Date.now();
      while (!logs.some((l) => l.includes(j.log)) && Date.now() - t0 < STEP_TIMEOUT) await page.waitForTimeout(50);
      if (!logs.some((l) => l.includes(j.log))) { result.passed = false; result.failures.push({ step: 'effect', kind: 'effect', detail: `expected "${j.log}", got ${JSON.stringify(logs)}` }); }
    }
  } catch (e) {
    result.passed = false; result.failures.push({ step: 'harness', kind: 'error', detail: String(e).slice(0, 200) });
  }
  if (consoleErrors.length) { result.passed = false; result.failures.push({ step: 'console', kind: 'console', detail: consoleErrors.slice(0, 3).join(' | ') }); }
  await context.close();
  return result;
}

/** Rapid input: 5 × → 40ms apart in the episode rail. Reports how many presses land (dropKeys devices lose some). */
async function runRapidInput(browser, device) {
  const { context, page } = await openPage(browser, args.react, device, { simulate: device.id !== 'none' });
  try {
    await page.waitForFunction(() => window.T && document.getElementById('ctaPlayLabel'), null, { timeout: 60_000 });
    if (device.id !== 'none') await page.waitForSelector('.sim-hud', { timeout: 60_000 });
    for (const s of TO_EPS) { await press(page, s.key); await page.waitForFunction(s.expect, null, { timeout: STEP_TIMEOUT, polling: 16 }); }
    for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(40); }
    await page.waitForTimeout(1500 + (device.inputLatencyMs ?? 0) * 6);
    const ep = await page.evaluate(() => T.focusedEp());
    return { landed: Number((ep || 'S1:E1').split(':E')[1]) - 1, of: 5 };
  } catch (e) {
    return { error: String(e).slice(0, 120) };
  } finally { await context.close(); }
}

async function runScenario(browser, device, sc) {
  // Seed the scenario before the first load. (Clearing localStorage then reloading raced:
  // Chromium sometimes served the reload from the pre-write storage, so the scenario was lost.)
  const seed = { arg: sc.id, fn: (id) => {
    if (sessionStorage.getItem('__seeded')) return;
    localStorage.clear(); localStorage.setItem('itvx.pageLogic.scenario', id); sessionStorage.setItem('__seeded', '1');
  } };
  const { context, page, consoleErrors } = await openPage(browser, 'file://' + args.prototype, device, { simulate: false, seed });
  const failures = [];
  try {
    await page.waitForFunction((l) => document.getElementById('ctaPlayLabel')?.textContent.trim() === l, sc.label, { timeout: 60_000, polling: 50 })
      .catch(() => failures.push(`primary CTA never read "${sc.label}"`));
    await page.waitForTimeout(500);
    const st = await page.evaluate(PROTO_STATE);
    if (st.label !== sc.label) failures.push(`label "${st.label}" ≠ "${sc.label}"`);
    if (st.secondaries.join(' | ') !== sc.secondaries.join(' | ')) failures.push(`secondaries [${st.secondaries.join(', ')}] ≠ [${sc.secondaries.join(', ')}]`);
    const wantTags = sc.tag ? [sc.tag] : [];
    if (st.tags.join(',') !== wantTags.join(',')) failures.push(`hero tags [${st.tags.join(', ')}] ≠ [${wantTags.join(', ')}]`);
    if (st.progress !== sc.progress) failures.push(`progress bar ${st.progress ? 'shown' : 'hidden'}, expected ${sc.progress ? 'shown' : 'hidden'}`);
    if (sc.id === 'live' && !st.timeLeft) failures.push('"mins left" missing on live');
    // Journey into the episode rail: focus must land on the scenario's episode.
    for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown']) { await page.keyboard.press(k); await page.waitForTimeout(250 + device.cpuSlowdown * 40); }
    await page.waitForFunction(() => !!document.querySelector('.episode-tile.focused'), null, { timeout: STEP_TIMEOUT }).catch(() => {});
    const ep = await page.evaluate(() => document.querySelector('.episode-tile.focused .ep-tag')?.textContent.trim() ?? null);
    if (ep !== sc.ep) failures.push(`episode focus after ↓↓↓↓ is ${ep}, expected ${sc.ep}`);
  } catch (e) { failures.push('harness: ' + String(e).slice(0, 120)); }
  if (consoleErrors.length) failures.push('console: ' + consoleErrors.slice(0, 2).join(' | '));
  await context.close();
  return { scenario: sc.id, passed: !failures.length, failures };
}

const browser = await chromium.launch();
const out = { date: new Date().toISOString(), devices: [] };
for (const d of TARGETS) {
  const row = { id: d.id, name: d.name, family: d.family, year: d.year, chromium: d.chromium ?? null, journeys: [], rapid: null, scenarios: [] };
  if (args.react) {
    for (const j of JOURNEYS) row.journeys.push(await runJourney(browser, d, j));
    row.rapid = await runRapidInput(browser, d);
  }
  if (args.prototype) for (const sc of SCENARIOS) row.scenarios.push(await runScenario(browser, d, sc));
  const jf = row.journeys.filter((r) => !r.passed).map((r) => r.journey);
  const sf = row.scenarios.filter((r) => !r.passed).map((r) => r.scenario);
  const slow = row.journeys.flatMap((r) => r.steps).filter((s) => s.ms > SLOW_STEP_MS).length;
  console.log(`${d.name} ${d.year ?? ''}: journeys fail [${jf}] scenarios fail [${sf}] slow steps ${slow} rapid ${JSON.stringify(row.rapid)}`);
  out.devices.push(row);
  if (args.out) writeFileSync(args.out, JSON.stringify(out, null, 2));
}
await browser.close();
