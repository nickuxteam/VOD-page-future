# Dev tools — NOT part of the handover

Everything in `src/devtools/` is internal tooling for testing the prototype. It is **not** exported from `src/index.ts`,
**not** in the production build, and **not** covered by `docs/VOD-TABS-SPEC.md`. Don't include it in handovers.

- Loads automatically in `npm run dev`. To include it in a build (e.g. a test deploy):
  `VITE_DEVTOOLS=true npm run build`. A normal `npm run build` tree-shakes it out.
- Press **Q** for the config panel. **Device simulation** defaults to *No simulation*; the choice is saved in
  `localStorage` (`vod.simulation.device`).

| File | What it does |
| --- | --- |
| `DevToolsShell.tsx` | Wraps the demo page: Q panel, simulator, and simulated remote lag (intercepts key presses before the page sees them) |
| `config/ConfigPanel.tsx` | The Q panel and its device dropdown (grouped Fire TV Stick / PlayStation) |
| `simulation/devices.ts` | Device profiles (hardware + estimated simulation values) |
| `simulation/DeviceSimulator.tsx` | Frame-rate cap, GPU-effect reduction, HUD |
| `scripts/measure-load.mjs` | Page-load timing for every device (see below) |

## What is simulated
A desktop browser can't run at a Fire TV's speed, so each limit is reproduced separately:

| Device limit | How it's simulated |
| --- | --- |
| **CPU speed** | A `requestAnimationFrame` loop holds the main thread until each frame has lasted `1000 / uiFps` ms. React renders, layout and key handling all queue behind it, as on a slow stick. The HUD shows the measured fps. |
| **Remote lag** | Every press is handled `inputLatencyMs` later. Presses queue and resolve against the latest state. |
| **Dropped presses** (oldest sticks) | Presses arriving while one is still pending are discarded. |
| **GPU** | CSS transitions and animations become `steps()` at the device frame rate, because a desktop GPU would otherwise keep them smooth. `mid` GPUs lose blur filters and text glows. `low` GPUs also lose all shadows and the loading shimmer, while focus strokes are kept. |
| **Not simulated** | RAM limits / memory pressure, video decode (4K/HDR/AV1), network speed, and WebView engine differences. Test these on hardware. |

## Profiles
Hardware comes from Amazon developer specs, launch coverage and Sony's published specs. The **simulated values are estimates** derived from
that hardware. They are tuned so devices rank correctly against each other, so calibrate them on real devices.

| Device | Year | SoC | CPU | GPU | RAM | OS | Sim fps | Sim lag | Drops | GPU tier | CPU slowdown |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fire TV Stick (1st Gen) | 2014 | Broadcom BCM28155 | 2× A9 1.0 GHz | VideoCore IV | 1 GB | Fire OS 3→5 | 15 | 220 ms | ✓ | low | 18× |
| Fire TV Stick (2nd Gen) | 2016 | MediaTek MT8127D | 4× A7 1.3 GHz | Mali-450 MP4 | 1 GB | Fire OS 5 | 20 | 160 ms | ✓ | low | 14× |
| Fire TV Stick Basic Edition | 2017 | MediaTek MT8127D | 4× A7 1.3 GHz | Mali-450 MP4 | 1 GB | Fire OS 5 | 20 | 160 ms | ✓ | low | 14× |
| Fire TV Stick 4K | 2018 | MediaTek MT8695 | 4× A53 1.7 GHz | IMG GE8300 | 1.5 GB | Fire OS 6 | 30 | 90 ms | | mid | 10× |
| Fire TV Stick Lite | 2020 | MediaTek MT8695D | 4× A53 1.7 GHz | IMG GE8300 | 1 GB | Fire OS 7 | 30 | 100 ms | | mid | 10× |
| Fire TV Stick (3rd Gen) | 2020 | MediaTek MT8695D | 4× A53 1.7 GHz | IMG GE8300 | 1 GB | Fire OS 7 | 30 | 100 ms | | mid | 10× |
| Fire TV Stick 4K Max | 2021 | MediaTek MT8696 | 4× A55 1.8 GHz | IMG GE9215 750 MHz | 2 GB | Fire OS 7 | 45 | 60 ms | | high | 8× |
| Fire TV Stick 4K (2nd Gen) | 2023 | MediaTek MT8696D | 4× A55 1.7 GHz | IMG GE9215 650 MHz | 2 GB | Fire OS 8 | 45 | 60 ms | | high | 8.5× |
| Fire TV Stick 4K Max (2nd Gen) | 2023 | MediaTek MT8696T | 4× A55 2.0 GHz | IMG GE9215 850 MHz | 2 GB | Fire OS 8 | 55 | 45 ms | | high | 7× |
| Fire TV Stick HD | 2024 | MediaTek MT8695D | 4× A53 1.7 GHz | IMG GE8300 | 1 GB | Fire OS 7 | 30 | 100 ms | | mid | 10× |
| Fire TV Stick 4K Select | 2025 | MediaTek MT8698 | 4× A55 1.7 GHz | — | 1 GB | Vega OS | 30 | 110 ms | | mid | 9× |
| Fire TV Stick HD | 2026 | MediaTek MT8698D | 4× A55 1.7 GHz | Mali-G310 V2 500 MHz | 1 GB | Vega OS | 30 | 110 ms | | mid | 9× |
| PlayStation 4 (incl. Slim) | 2013 | AMD custom APU | 8× Jaguar 1.6 GHz | GCN 18 CUs 800 MHz (1.84 TFLOPS) | 8 GB* | PS4 system software (WebMAF) | 30 | 80 ms | | high | 7× |
| PlayStation 4 Pro | 2016 | AMD custom APU | 8× Jaguar 2.13 GHz | GCN 36 CUs 911 MHz (4.2 TFLOPS) | 8 GB* + 1 GB | PS4 system software (WebMAF) | 40 | 65 ms | | high | 5.5× |

\* Most of the PS4's memory is reserved for the system and games; TV apps get a fraction. The PS4's strong GPU makes
rendering cheap, but its slow Jaguar CPU cores make JavaScript-heavy work the bottleneck.

**Sources:** (PlayStation specs are Sony's published figures)
- [Amazon: Fire TV streaming media player specs](https://developer.amazon.com/docs/device-specs/device-specifications-fire-tv-streaming-media-player.html)
- [Amazon: Fire TV comparison table](https://developer.amazon.com/docs/device-specs/device-specifications-comparison-table.html)
- [CNX Software: 4K Max (2021)](https://www.cnx-software.com/2021/10/12/55-amazon-fire-tv-stick-4k-max-supports-4k-av1-videos-wi-fi-6/)
- [CNX Software: 4K Max (2023)](https://www.cnx-software.com/2023/09/22/amazon-fire-tv-stick-4k-max-2023-features-a-2-ghz-mediatek-mt8696t-cpu-support-wifi-6e/)
- [CNX Software: 4K Select / Vega OS](https://www.cnx-software.com/2025/10/03/linux-based-vega-os-replaces-android-based-fire-os-in-amazon-fire-tv-stick-4k-select/)
- [CNX Software: 1st Gen (2014)](https://www.cnx-software.com/2014/10/28/amazon-introduces-39-fire-tv-stick-to-compete-with-chromecast-roku-streaming-stick/)
- [AFTVnews: Lite / 3rd Gen / 4K differences](https://www.aftvnews.com/all-the-differences-between-the-fire-tv-stick-lite-fire-tv-stick-3-and-fire-tv-stick-4k/)
- [AFTVnews: 4K Select](https://www.aftvnews.com/amazon-announces-fire-tv-stick-4k-select-the-first-non-android-based-fire-tv-running-vega-os/)

**Conflicting reports:**
- **1st Gen CPU clock:** 1.0 GHz in most sources, though AFTVnews suspected 1.2 GHz.
- **4K Max (2021) CPU cores:** reported as both A53 and A55.
- **4K (2nd Gen) GPU clock:** Amazon's English and Japanese pages may differ.

## Load-time measurement

`scripts/measure-load.mjs` loads the page once per device with Chrome's CPU throttling set to the device's
**CPU slowdown** (JavaScript parse/compile/execute and layout all slow down, which the in-app simulator can't do), and
reports first contentful paint and *ready* (first frame painted after the hero CTA and episode rail are in place). It
runs the React build and, optionally, the original prototype in each of its six hero scenarios.

```bash
npm run build
npx vite preview --port 4173 &
node --experimental-strip-types src/devtools/scripts/measure-load.mjs --react http://localhost:4173/ \
  --prototype /path/to/prototype/index.html --runs 3 --out load-results.json
```

CPU slowdown factors are relative to a current desktop/laptop core, so results scale with the machine running the
script. Network isn't simulated: on a device, add download time and the prototype's TMDB artwork requests.
