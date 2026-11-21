# Load-time report — 21 Nov 2026 (dev tools, not part of the handover)

**What was measured:** time until the page is visibly loaded. That's the later of first contentful paint and the first
frame after the hero CTA and episode rail are drawn.

**Pages:**
- the React handover build (`npm run build`)
- the original prototype, in each of its six hero scenarios

**Method:**
- Each figure is the median of 3 loads, after one discarded warm-up load.
- Each device's CPU was simulated by throttling Chrome's CPU by the device's slowdown factor
  (`src/devtools/scripts/measure-load.mjs`).

**Read these as relative, not absolute:**
- **Hardware:** the runs were on a 4-core cloud container, and the slowdown factors are estimates.
- **Not included:** network time and the prototype's TMDB artwork. The prototype's spinner waits for that artwork, up
  to 6 seconds.
- **Noise:** run-to-run variation is roughly ±20%.
- **Overlap:** a short manual test overlapped the PS4 Pro and TV-baseline runs.

| Device | Year | CPU slowdown | React build | Prototype (avg of 6 scenarios) | Prototype range | Real-device engine |
| --- | --- | --- | --- | --- | --- | --- |
| No simulation (this machine) | — | 1× | 0.12 s | 0.14 s | 0.14–0.15 s | — |
| Fire TV Stick (1st Gen) | 2014 | 18× | 1.44 s | 2.83 s | 2.54–3.12 s | not checked |
| Fire TV Stick (2nd Gen) | 2016 | 14× | 1.34 s | 1.97 s | 1.86–2.16 s | not checked |
| Fire TV Stick Basic Edition | 2017 | 14× | 1.18 s | 2.06 s | 1.94–2.22 s | not checked |
| Fire TV Stick 4K | 2018 | 10× | 0.76 s | 1.34 s | 1.22–1.50 s | not checked |
| Fire TV Stick Lite | 2020 | 10× | 0.84 s | 1.29 s | 1.10–1.40 s | not checked |
| Fire TV Stick (3rd Gen) | 2020 | 10× | 0.75 s | 1.40 s | 1.20–1.68 s | not checked |
| Fire TV Stick 4K Max | 2021 | 8× | 0.82 s | 1.06 s | 0.98–1.12 s | not checked |
| Fire TV Stick 4K (2nd Gen) | 2023 | 8.5× | 0.64 s | 1.19 s | 1.13–1.31 s | not checked |
| Fire TV Stick 4K Max (2nd Gen) | 2023 | 7× | 0.52 s | 0.92 s | 0.85–1.03 s | not checked |
| Fire TV Stick HD | 2024 | 10× | 0.84 s | 1.34 s | 1.29–1.45 s | not checked |
| Fire TV Stick 4K Select | 2025 | 9× | 0.74 s | 1.17 s | 1.02–1.38 s | not checked |
| Fire TV Stick HD | 2026 | 9× | 0.64 s | 1.20 s | 1.12–1.29 s | not checked |
| PlayStation 4 | 2013 | 7× | 0.60 s | 0.87 s | 0.79–0.96 s | not checked |
| PlayStation 4 Pro | 2016 | 5.5× | 0.46 s | 0.71 s | 0.58–0.78 s | not checked |
| Samsung TU7100 / TU7000 | 2020 | 12× | 0.93 s | 1.66 s | 1.53–1.77 s | **won’t start** (Chromium 69) |
| Samsung AU7100 / AU8000 | 2021 | 11× | 0.83 s | 1.47 s | 1.30–1.69 s | **won’t start** (Chromium 76) |
| Samsung BU8000 | 2022 | 11× | 0.70 s | 1.48 s | 1.34–1.69 s | **layout breaks** (Chromium 85) |
| Samsung CU7100 / CU7000 | 2023 | 11× | 0.86 s | 1.41 s | 1.17–1.52 s | minor focus styling missing (Chromium 94) |
| Samsung DU7100 / DU7200 | 2024 | 10× | 0.68 s | 1.34 s | 1.18–1.56 s | OK (Chromium 108) |
| Samsung U8000F | 2025 | 9× | 0.61 s | 1.31 s | 1.20–1.47 s | OK (Chromium 120) |
| Samsung U8000H | 2026 | 9× | 0.72 s | 1.49 s | 1.40–1.64 s | OK (Chromium 130) |
| LG UN73 / UN7300 | 2020 | 12× | 1.15 s | 1.73 s | 1.57–1.86 s | **won’t start** (Chromium 68) |
| LG UP75 / UP7000 | 2021 | 11× | 0.82 s | 1.42 s | 1.31–1.54 s | **won’t start** (Chromium 79) |
| LG UQ75 | 2022 | 10× | 0.80 s | 1.39 s | 1.23–1.47 s | **layout breaks** (Chromium 87) |
| LG UR78 | 2023 | 10× | 0.96 s | 1.45 s | 1.32–1.53 s | minor focus styling missing (Chromium 94) |
| LG UT80 | 2024 | 9.5× | 0.80 s | 1.32 s | 1.23–1.44 s | OK (Chromium 108) |
| LG UA75 / UA73 | 2025 | 8.5× | 0.96 s | 1.19 s | 1.08–1.28 s | OK (Chromium 120) |
| LG NANO NU80 | 2026 | 8× | 0.62 s | 1.09 s | 0.98–1.23 s | OK (Chromium 132) |
| Sony XH80 / X800H | 2020 | 8× | 0.54 s | 1.14 s | 1.03–1.31 s | not checked |
| Sony X80J | 2021 | 7× | 0.58 s | 1.08 s | 0.92–1.25 s | not checked |
| Sony X80K | 2022 | 7× | 0.72 s | 0.99 s | 0.92–1.09 s | not checked |
| Sony X75WL | 2023 | 9× | 0.74 s | 1.27 s | 1.10–1.52 s | not checked |
| Sony Bravia 3 | 2024 | 9× | 0.85 s | 1.27 s | 1.12–1.48 s | not checked |
| Sony Bravia 2 II | 2025 | 10× | 0.81 s | 1.39 s | 1.27–1.54 s | not checked |
| Sony Bravia 3 II | 2026 | 7× | 0.63 s | 0.85 s | 0.80–0.89 s | not checked |

| Scenario | Avg across all 35 devices | Fastest device | Slowest device |
| --- | --- | --- | --- |
| Start watching | 1.35 s | 0.76 s (PlayStation 4 Pro) | 2.98 s (Fire TV Stick (1st Gen)) |
| Latest series | 1.33 s | 0.65 s (PlayStation 4 Pro) | 3.12 s (Fire TV Stick (1st Gen)) |
| Latest episode | 1.38 s | 0.58 s (PlayStation 4 Pro) | 2.75 s (Fire TV Stick (1st Gen)) |
| Continue watching | 1.33 s | 0.72 s (PlayStation 4 Pro) | 2.54 s (Fire TV Stick (1st Gen)) |
| Live | 1.36 s | 0.78 s (PlayStation 4 Pro) | 2.80 s (Fire TV Stick (1st Gen)) |
| Coming soon | 1.32 s | 0.77 s (PlayStation 4 Pro) | 2.77 s (Fire TV Stick (1st Gen)) |

**Real-device engine:**
- **Won't start:** the engine can't parse the JS bundle (ES2020 syntax). This applies to both the React build and the
  prototype, which also uses `??`.
- **Layout breaks:** the engine has no flex `gap` and/or `inset`.
- **Not checked:** the engine isn't fixed per model year (Fire OS / Android WebView), or isn't Chromium (PS4 WebMAF), so
  it needs device testing.

**Update (same day): older-device fix applied.** The "won't start" and "layout breaks" verdicts above describe the
build at the time of measurement. Since then:
- The build targets Chromium 68.
- Flex `gap` has a detected fallback.
- `inset` is lowered at build time.
- `:has()` and `Object.fromEntries` have been removed.

So 2020–2022 Samsung and LG TVs are now expected to load and lay out correctly (handover spec §11). Load times are
unaffected: the bundle size barely changed (171 kB, 54 kB gzipped).
