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
| `simulation/compat.ts` | Web-platform features the page needs vs each device's Chromium version |
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

## TVs: best-selling Samsung, LG and Sony series by model year

**What "best-selling" means here.** None of the brands publishes unit sales per model, so each year's pick is the
entry-level, high-volume series. Each pick is backed by retail signals: Amazon Best Seller badges, "bought in past month"
counts, retailer wording, review volume, and Which?/Expert Reviews picks. The evidence strength (`moderate`, `weak` or
`inferred`) is shown in the Q panel. Treat these picks as representative of the volume market, not as audited
bestsellers.

**Web engine matters more than speed on TVs.** Samsung (Tizen) and LG (webOS) ship a fixed Chromium version per model
year, and older ones lack features this page uses (`compat.ts`). Sony uses the Android System WebView, which updates
separately, so no fixed engine is assumed.

| Year | Samsung (Tizen · Chromium) | LG (webOS · Chromium) | Sony (Google/Android TV) |
| --- | --- | --- | --- |
| 2020 | TU7100 / TU7000 · Tizen 5.5 · **69** | UN73 / UN7300 · webOS 5.0 · **68** | XH80 / X800H · MT5893, 4× A73 1.5 GHz, 2 GB |
| 2021 | AU7100 / AU8000 · Tizen 6.0 · **76** | UP75 / UP7000 · webOS 6.0 · **79** | X80J · MT5895, 4× A73 1.8 GHz, 3–4 GB |
| 2022 | BU8000 · Tizen 6.5 · **85** | UQ75 · webOS 22 · **87** | X80K · MT5895, Mali-G52, 3–4 GB |
| 2023 | CU7100 / CU7000 · Tizen 7.0 · **94** | UR78 · webOS 23 · **94** | X75WL · SoC unknown |
| 2024 | DU7100 / DU7200 · Tizen 8.0 · **108** | UT80 · webOS 24 · **108** | Bravia 3 · SoC unknown |
| 2025 | U8000F · Tizen 9.0 · **120** | UA75 / UA73 · webOS 25 · **120** | Bravia 2 II · SoC unknown, 2 GB |
| 2026 | U8000H · Tizen 10.0 · **130** (unconfirmed on device) | NANO NU80 · webOS 26 · **132** | Bravia 3 II · Pentonic 800 (single source) |

**Upgrades:** Samsung 2023+ sets and LG 2022+ sets can be upgraded to a newer OS, so the engine shown is the minimum.

**CPU/GPU/RAM:** Samsung and LG don't publish core counts, clocks, GPU or RAM for these chips. The simulation values for
TVs are therefore rougher estimates than the Fire TV ones. They're based on the platform family (e.g. Samsung's
Kant-SU2e runs from 2021 to 2023) and public user reports.

**Sources:**

- Samsung
  - [Tizen/Chromium mapping (tizen-sim)](https://github.com/lucaskfp/tizen-sim)
  - [Samsung TV extension release history](https://developer.samsung.com/smarttv/develop/tools/tv-extension/release-history.html)
  - [Kant-SU2 support page](https://www.samsung.com/latin_en/support/tv-audio-video/troubleshoot-usb-error-messages-when-updating-kant-su2-and-kant-s2-tv-models/)
  - [TechRadar on the DU7200](https://www.techradar.com/televisions/samsungs-best-selling-4k-crystal-tv-drops-to-an-unbelievably-cheap-price-at-walmart)
  - [Expert Reviews: best Samsung TV](https://www.expertreviews.co.uk/tvs/1416414/best-samsung-tv)
  - [RTINGS U8000F review](https://www.rtings.com/tv/reviews/samsung/u8000f)
  - [AVForums: Samsung 2026 UK line-up](https://www.avforums.com/news/samsung-confirms-its-2026-uk-tv-line-up-and-pricing.23563/)
- LG
  - [LG web engine table](https://webostv.developer.lge.com/develop/specifications/web-api-and-web-engine) (and a [copy on GitHub](https://github.com/gprot42/webos-terminal))
  - [LG UK UT80](https://www.lg.com/uk/tvs-soundbars/4k-uhd-tvs/43ut80006la/)
  - [LG UK UR78](https://www.lg.com/uk/tvs-soundbars/smart-tvs/43ur78006lk/)
  - [LG UK NU80](https://www.lg.com/uk/tvs-soundbars/nano-4k-uhd/43nu800b6lc/)
  - [Amazon UK UA75](https://www.amazon.co.uk/lg-uhd-ua75/s?k=lg+uhd+ua75)
  - [Best Buy UQ75 reviews](https://www.bestbuy.com/site/reviews/lg-65-class-uq75-series-led-4k-uhd-smart-webos-tv-2022/6501938)
- Sony
  - [X80J specs](https://www.displayspecifications.com/en/model/2df92496)
  - [X80K specs](https://www.displayspecifications.com/en/model/19f32a3b)
  - [Which? KD-55X75WL review](https://www.which.co.uk/reviews/televisions/sony-kd55x75wl)
  - [Android Police on the Android TV 14 update](https://www.androidpolice.com/android-tv-14-sony-bravia-realtek/)
  - [What Hi-Fi: Sony 2026 line-up](https://www.whathifi.com/tv-home-cinema/televisions/sony-2026-tv-lineup-everything-you-need-to-know-about-the-new-bravia-tvs)


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
