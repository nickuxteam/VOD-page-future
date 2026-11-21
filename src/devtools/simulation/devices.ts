/**
 * DEV TOOL — not part of the handover. Device profiles for the simulation
 * mode: every Amazon Fire TV Stick, PlayStation 4 / PS4 Pro, and the best-selling
 * Samsung, LG and Sony TV series for each model year from 2020 (see src/devtools/README.md).
 *
 * Hardware columns (SoC / CPU / GPU / RAM / video / OS) come from Amazon's
 * developer device specs and launch coverage (see src/devtools/README.md).
 *
 * The *simulation* columns are ESTIMATES derived from that hardware, not
 * measurements: a desktop browser cannot become a Fire TV. They are tuned so
 * devices rank correctly against each other — calibrate them against real
 * hardware (e.g. Fire TV developer tools' FPS overlay) when you have it.
 *
 *   uiFps          frame rate the main thread is capped to (UI work + rail animation smoothness)
 *   inputLatencyMs delay between a remote press and the app handling it
 *   dropKeys       presses arriving while a previous one is still pending are discarded
 *   cpuSlowdown    how many times slower than a current desktop/laptop CPU core the device runs
 *                  JavaScript; used as the Chrome DevTools CPU throttling rate for load-time runs
 *   gpu            'low'  → no shadows / blur / filters (fill-rate limited GPUs)
 *                  'mid'  → shadows kept, blur filters removed
 *                  'high' → full effects
 */

export type GpuTier = 'low' | 'mid' | 'high';

export type DeviceFamily = 'Amazon Fire TV Stick' | 'Sony PlayStation' | 'Samsung TV' | 'LG TV' | 'Sony Bravia TV';

export interface DeviceProfile {
  id: string;
  family: DeviceFamily;
  name: string;
  year: number;
  model?: string;
  soc: string;
  cpu: string;
  gpu: string;
  /** Omitted when unpublished / unverified. */
  ramGB?: number;
  video: string;
  os: string;
  /* simulation (estimates) */
  uiFps: number;
  inputLatencyMs: number;
  cpuSlowdown: number;
  dropKeys: boolean;
  gpuTier: GpuTier;
  /** Chromium major version of the built-in web engine, when it is fixed per model year. */
  chromium?: number;
  /** How the web engine is determined (or why it is unknown). */
  engineNote?: string;
  /** TVs: why this series is listed as the year’s best seller, and how strong that evidence is. */
  bestSeller?: { evidence: string; confidence: 'inferred' | 'weak' | 'moderate' };
  notes?: string;
}

export const NO_SIMULATION = 'none';

export const DEVICES: DeviceProfile[] = [
  {
    id: 'ftv-stick-1', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick (1st Gen)', year: 2014,
    soc: 'Broadcom BCM28155 (Capri)', cpu: '2× Cortex-A9 @ 1.0 GHz', gpu: 'VideoCore IV',
    ramGB: 1, video: '1080p', os: 'Fire OS 3 → 5 (Android 4.2 → 5.1)',
    uiFps: 15, inputLatencyMs: 220, cpuSlowdown: 18, dropKeys: true, gpuTier: 'low',
    notes: 'Dual-core, oldest WebView. Expect visible stutter on every rail move.',
  },
  {
    id: 'ftv-stick-2', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick (2nd Gen)', year: 2016,
    soc: 'MediaTek MT8127D', cpu: '4× Cortex-A7 @ 1.3 GHz', gpu: 'Mali-450 MP4',
    ramGB: 1, video: '1080p', os: 'Fire OS 5 (Android 5.1)',
    uiFps: 20, inputLatencyMs: 160, cpuSlowdown: 14, dropKeys: true, gpuTier: 'low',
  },
  {
    id: 'ftv-stick-basic', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick Basic Edition', year: 2017,
    soc: 'MediaTek MT8127D', cpu: '4× Cortex-A7 @ 1.3 GHz', gpu: 'Mali-450 MP4',
    ramGB: 1, video: '1080p', os: 'Fire OS 5 (Android 5.1)',
    uiFps: 20, inputLatencyMs: 160, cpuSlowdown: 14, dropKeys: true, gpuTier: 'low',
    notes: 'Same hardware as the 2nd Gen stick.',
  },
  {
    id: 'ftv-stick-4k-2018', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick 4K', year: 2018,
    soc: 'MediaTek MT8695', cpu: '4× Cortex-A53 @ 1.7 GHz', gpu: 'IMG GE8300',
    ramGB: 1.5, video: '4K HDR', os: 'Fire OS 6 (Android 7.1)',
    uiFps: 30, inputLatencyMs: 90, cpuSlowdown: 10, dropKeys: false, gpuTier: 'mid',
  },
  {
    id: 'ftv-stick-lite', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick Lite', year: 2020,
    soc: 'MediaTek MT8695D', cpu: '4× Cortex-A53 @ 1.7 GHz', gpu: 'IMG GE8300',
    ramGB: 1, video: '1080p HDR', os: 'Fire OS 7 (Android 9)',
    uiFps: 30, inputLatencyMs: 100, cpuSlowdown: 10, dropKeys: false, gpuTier: 'mid',
  },
  {
    id: 'ftv-stick-3', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick (3rd Gen)', year: 2020,
    soc: 'MediaTek MT8695D', cpu: '4× Cortex-A53 @ 1.7 GHz', gpu: 'IMG GE8300',
    ramGB: 1, video: '1080p HDR', os: 'Fire OS 7 (Android 9)',
    uiFps: 30, inputLatencyMs: 100, cpuSlowdown: 10, dropKeys: false, gpuTier: 'mid',
  },
  {
    id: 'ftv-stick-4k-max-2021', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick 4K Max', year: 2021,
    soc: 'MediaTek MT8696', cpu: '4× Cortex-A55 @ 1.8 GHz', gpu: 'IMG GE9215 @ 750 MHz',
    ramGB: 2, video: '4K HDR', os: 'Fire OS 7 (Android 9)',
    uiFps: 45, inputLatencyMs: 60, cpuSlowdown: 8, dropKeys: false, gpuTier: 'high',
  },
  {
    id: 'ftv-stick-4k-2023', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick 4K (2nd Gen)', year: 2023,
    soc: 'MediaTek MT8696D', cpu: '4× Cortex-A55 @ 1.7 GHz', gpu: 'IMG GE9215 @ 650 MHz',
    ramGB: 2, video: '4K HDR', os: 'Fire OS 8 (Android 11)',
    uiFps: 45, inputLatencyMs: 60, cpuSlowdown: 8.5, dropKeys: false, gpuTier: 'high',
  },
  {
    id: 'ftv-stick-4k-max-2023', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick 4K Max (2nd Gen)', year: 2023,
    soc: 'MediaTek MT8696T', cpu: '4× Cortex-A55 @ 2.0 GHz', gpu: 'IMG GE9215 @ 850 MHz',
    ramGB: 2, video: '4K HDR', os: 'Fire OS 8 (Android 11)',
    uiFps: 55, inputLatencyMs: 45, cpuSlowdown: 7, dropKeys: false, gpuTier: 'high',
    notes: 'Fastest stick — the closest to the unsimulated desktop experience.',
  },
  {
    id: 'ftv-stick-hd-2024', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick HD', year: 2024,
    soc: 'MediaTek MT8695D', cpu: '4× Cortex-A53 @ 1.7 GHz', gpu: 'IMG GE8300',
    ramGB: 1, video: '1080p HDR', os: 'Fire OS 7 (Android 9)',
    uiFps: 30, inputLatencyMs: 100, cpuSlowdown: 10, dropKeys: false, gpuTier: 'mid',
  },
  {
    id: 'ftv-stick-4k-select', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick 4K Select', year: 2025,
    soc: 'MediaTek MT8698', cpu: '4× Cortex-A55 @ 1.7 GHz', gpu: '—',
    ramGB: 1, video: '4K HDR', os: 'Vega OS (Linux)',
    uiFps: 30, inputLatencyMs: 110, cpuSlowdown: 9, dropKeys: false, gpuTier: 'mid',
    notes: 'Vega OS, 1 GB RAM. Reviews report slower scrolling than the 2023 4K stick.',
  },
  {
    id: 'ftv-stick-hd-2026', family: 'Amazon Fire TV Stick', name: 'Fire TV Stick HD', year: 2026,
    soc: 'MediaTek MT8698D', cpu: '4× Cortex-A55 @ 1.7 GHz', gpu: 'Mali-G310 V2 @ 500 MHz',
    ramGB: 1, video: '1080p HDR', os: 'Vega OS (Linux)',
    uiFps: 30, inputLatencyMs: 110, cpuSlowdown: 9, dropKeys: false, gpuTier: 'mid',
  },
  {
    id: 'ps4', family: 'Sony PlayStation', name: 'PlayStation 4', year: 2013,
    soc: 'AMD custom APU', cpu: '8× AMD Jaguar (x86-64) @ 1.6 GHz', gpu: 'AMD GCN, 18 CUs @ 800 MHz (1.84 TFLOPS)',
    ramGB: 8, video: '1080p (HDR from 2016 firmware)', os: 'PS4 system software (Orbis OS) — TV apps via WebMAF',
    uiFps: 30, inputLatencyMs: 80, cpuSlowdown: 7, dropKeys: false, gpuTier: 'high',
    notes: 'Strong GPU but slow Jaguar cores: JavaScript-heavy work is the bottleneck. Includes PS4 Slim (same performance). Most of the 8 GB is reserved for the system.',
  },
  {
    id: 'ps4-pro', family: 'Sony PlayStation', name: 'PlayStation 4 Pro', year: 2016,
    soc: 'AMD custom APU', cpu: '8× AMD Jaguar (x86-64) @ 2.13 GHz', gpu: 'AMD GCN, 36 CUs @ 911 MHz (4.2 TFLOPS)',
    ramGB: 8, video: '4K HDR', os: 'PS4 system software (Orbis OS) — TV apps via WebMAF',
    uiFps: 40, inputLatencyMs: 65, cpuSlowdown: 5.5, dropKeys: false, gpuTier: 'high',
    notes: '8 GB GDDR5 + 1 GB DDR3; most memory is reserved for the system.',
  },
  {
    id: "samsung-2020", family: "Samsung TV", name: "Samsung TU7100 / TU7000", year: 2020, model: "UE43TU7100",
    soc: "Kant-SU2 (\u201cCrystal Processor 4K\u201d)", cpu: "4 cores (ARM)", gpu: "unknown",
    video: "4K HDR10+", os: "Tizen 5.5",
    uiFps: 25, inputLatencyMs: 120, cpuSlowdown: 12, dropKeys: false, gpuTier: "low",
    chromium: 69,
    engineNote: "Tizen ships a fixed Chromium per model year; 2020\u20132022 sets stay on their launch Tizen.",
    bestSeller: { evidence: "Cheapest 2020 Samsung series, widely discounted at Currys; no sales ranking published", confidence: "inferred" },
  },
  {
    id: "samsung-2021", family: "Samsung TV", name: "Samsung AU7100 / AU8000", year: 2021, model: "UE50AU7100",
    soc: "Kant-SU2e", cpu: "ARMv7 (cores unknown)", gpu: "unknown",
    video: "4K HDR10+", os: "Tizen 6.0",
    uiFps: 25, inputLatencyMs: 110, cpuSlowdown: 11, dropKeys: false, gpuTier: "low",
    chromium: 76,
    engineNote: "Tizen ships a fixed Chromium per model year; 2020\u20132022 sets stay on their launch Tizen.",
    bestSeller: { evidence: "Laptops Direct calls the AU7100 range best-selling; Amazon UK Best Seller badge (85\")", confidence: "weak" },
  },
  {
    id: "samsung-2022", family: "Samsung TV", name: "Samsung BU8000", year: 2022, model: "UE50BU8000",
    soc: "Kant-SU2e (likely)", cpu: "ARMv7 (cores unknown)", gpu: "unknown",
    video: "4K HDR10+", os: "Tizen 6.5",
    uiFps: 25, inputLatencyMs: 110, cpuSlowdown: 11, dropKeys: false, gpuTier: "low",
    chromium: 85,
    engineNote: "Tizen ships a fixed Chromium per model year; 2020\u20132022 sets stay on their launch Tizen.",
    bestSeller: { evidence: "Entry Crystal UHD series for 2022 \u2014 picked by analogy, no sales evidence found", confidence: "inferred" },
  },
  {
    id: "samsung-2023", family: "Samsung TV", name: "Samsung CU7100 / CU7000", year: 2023, model: "UE43CU7100",
    soc: "Kant-SU2e", cpu: "unknown", gpu: "unknown",
    video: "4K HDR10+", os: "Tizen 7.0 (upgradable)",
    uiFps: 25, inputLatencyMs: 110, cpuSlowdown: 11, dropKeys: false, gpuTier: "low",
    chromium: 94,
    engineNote: "Tizen ships a fixed Chromium per model year (2023+ sets can be upgraded to newer Tizen, so this is the worst case).",
    bestSeller: { evidence: "Expert Reviews \u201cbest entry-level Samsung\u201d; Amazon UK 100+ bought/month", confidence: "weak" },
  },
  {
    id: "samsung-2024", family: "Samsung TV", name: "Samsung DU7100 / DU7200", year: 2024, model: "UE43DU7100",
    soc: "unknown (Kant-SU2e or X22U)", cpu: "unknown", gpu: "unknown",
    video: "4K HDR10+", os: "Tizen 8.0 (upgradable)",
    uiFps: 30, inputLatencyMs: 100, cpuSlowdown: 10, dropKeys: false, gpuTier: "mid",
    chromium: 108,
    engineNote: "Tizen ships a fixed Chromium per model year (2023+ sets can be upgraded to newer Tizen, so this is the worst case).",
    bestSeller: { evidence: "TechRadar: \u201cSamsung\u2019s best-selling 4K Crystal TV\u201d (DU7200); Amazon UK 500+ bought/month", confidence: "moderate" },
  },
  {
    id: "samsung-2025", family: "Samsung TV", name: "Samsung U8000F", year: 2025, model: "UE50U8000F",
    soc: "X22U", cpu: "ARMv7 32-bit userspace (cores unknown)", gpu: "unknown",
    video: "4K HDR10+", os: "Tizen 9.0",
    uiFps: 30, inputLatencyMs: 90, cpuSlowdown: 9, dropKeys: false, gpuTier: "mid",
    chromium: 120,
    engineNote: "Tizen ships a fixed Chromium per model year (2023+ sets can be upgraded to newer Tizen, so this is the worst case).",
    bestSeller: { evidence: "Amazon US Best Seller badge on 50/65/70\" (US only)", confidence: "moderate" },
  },
  {
    id: "samsung-2026", family: "Samsung TV", name: "Samsung U8000H", year: 2026, model: "UE55U8000H",
    soc: "unknown (\u201cCrystal Processor 4K\u201d)", cpu: "unknown", gpu: "unknown",
    video: "4K HDR10+", os: "Tizen 10.0",
    uiFps: 30, inputLatencyMs: 90, cpuSlowdown: 9, dropKeys: false, gpuTier: "mid",
    chromium: 130,
    engineNote: "Tizen ships a fixed Chromium per model year (2023+ sets can be upgraded to newer Tizen, so this is the worst case). 2026 version from emulator data \u2014 unconfirmed on device.",
    bestSeller: { evidence: "Entry 2026 series from \u00a3319 (43\"); leads Amazon bought-in-past-month counts; no ranking", confidence: "weak" },
  },
  {
    id: "lg-2020", family: "LG TV", name: "LG UN73 / UN7300", year: 2020, model: "43UN73006LC",
    soc: "LG \u201cQuad Core Processor 4K\u201d", cpu: "4 cores", gpu: "unknown",
    video: "4K HDR10/HLG", os: "webOS 5.0",
    uiFps: 25, inputLatencyMs: 120, cpuSlowdown: 12, dropKeys: false, gpuTier: "low",
    chromium: 68,
    engineNote: "webOS maps a fixed Chromium to each webOS version (2022+ sets can get newer webOS via Re:New, so this is the minimum).",
    bestSeller: { evidence: "Entry 2020 LED series, widely stocked; no ranking found", confidence: "inferred" },
  },
  {
    id: "lg-2021", family: "LG TV", name: "LG UP75 / UP7000", year: 2021, model: "50UP75006LF",
    soc: "LG \u201cQuad Core Processor 4K\u201d", cpu: "4 cores", gpu: "unknown",
    video: "4K HDR10/HLG", os: "webOS 6.0",
    uiFps: 25, inputLatencyMs: 110, cpuSlowdown: 11, dropKeys: false, gpuTier: "low",
    chromium: 79,
    engineNote: "webOS maps a fixed Chromium to each webOS version (2022+ sets can get newer webOS via Re:New, so this is the minimum).",
    bestSeller: { evidence: "Entry 2021 LED series, widely stocked; no ranking found", confidence: "inferred" },
  },
  {
    id: "lg-2022", family: "LG TV", name: "LG UQ75", year: 2022, model: "43UQ75006LF",
    soc: "\u03b15 Gen5 AI 4K", cpu: "unknown", gpu: "unknown",
    video: "4K HDR10 Pro/HLG", os: "webOS 22",
    uiFps: 30, inputLatencyMs: 100, cpuSlowdown: 10, dropKeys: false, gpuTier: "mid",
    chromium: 87,
    engineNote: "webOS maps a fixed Chromium to each webOS version (2022+ sets can get newer webOS via Re:New, so this is the minimum).",
    bestSeller: { evidence: "Best Buy UQ75 65\" has a very high review count (proxy only)", confidence: "weak" },
  },
  {
    id: "lg-2023", family: "LG TV", name: "LG UR78", year: 2023, model: "43UR78006LK",
    soc: "\u03b15 Gen6 AI 4K", cpu: "unknown", gpu: "unknown",
    ramGB: 1.5, video: "4K HDR10/HLG", os: "webOS 23",
    uiFps: 30, inputLatencyMs: 100, cpuSlowdown: 10, dropKeys: false, gpuTier: "mid",
    chromium: 94,
    engineNote: "webOS maps a fixed Chromium to each webOS version (2022+ sets can get newer webOS via Re:New, so this is the minimum).",
    bestSeller: { evidence: "Mass-market UK model at Currys and Argos; no ranking found", confidence: "inferred" },
    notes: "RAM from a sister-model listing (unverified).",
  },
  {
    id: "lg-2024", family: "LG TV", name: "LG UT80", year: 2024, model: "43UT80006LA",
    soc: "\u03b15 Gen7 AI 4K (one LG region says \u03b17 Gen5)", cpu: "unknown", gpu: "unknown",
    video: "4K HDR10/HLG", os: "webOS 24",
    uiFps: 30, inputLatencyMs: 95, cpuSlowdown: 9.5, dropKeys: false, gpuTier: "mid",
    chromium: 108,
    engineNote: "webOS maps a fixed Chromium to each webOS version (2022+ sets can get newer webOS via Re:New, so this is the minimum).",
    bestSeller: { evidence: "Widely stocked in the UK; no ranking found", confidence: "inferred" },
  },
  {
    id: "lg-2025", family: "LG TV", name: "LG UA75 / UA73", year: 2025, model: "43UA75006LA",
    soc: "\u03b17 AI 4K Gen8", cpu: "unknown", gpu: "unknown",
    video: "4K HDR10/HLG", os: "webOS 25",
    uiFps: 35, inputLatencyMs: 85, cpuSlowdown: 8.5, dropKeys: false, gpuTier: "mid",
    chromium: 120,
    engineNote: "webOS maps a fixed Chromium to each webOS version (2022+ sets can get newer webOS via Re:New, so this is the minimum).",
    bestSeller: { evidence: "Amazon UK \u201c400+ bought in past month\u201d (43UA75); high review counts at Very/Littlewoods", confidence: "moderate" },
  },
  {
    id: "lg-2026", family: "LG TV", name: "LG NANO NU80", year: 2026, model: "43NU800B6LC",
    soc: "\u03b17 AI 4K Gen9", cpu: "unknown", gpu: "unknown",
    video: "4K HDR10/HLG", os: "webOS 26",
    uiFps: 35, inputLatencyMs: 80, cpuSlowdown: 8, dropKeys: false, gpuTier: "mid",
    chromium: 132,
    engineNote: "webOS maps a fixed Chromium to each webOS version (2022+ sets can get newer webOS via Re:New, so this is the minimum).",
    bestSeller: { evidence: "LG\u2019s 2026 entry LED range (renamed NANO); cheapest UK model; no ranking", confidence: "inferred" },
  },
  {
    id: "sony-2020", family: "Sony Bravia TV", name: "Sony XH80 / X800H", year: 2020, model: "KD-49XH8096",
    soc: "MediaTek MT5893", cpu: "4\u00d7 Cortex-A73 @ 1.5 GHz", gpu: "unknown",
    ramGB: 2, video: "4K HDR10/HLG/Dolby Vision", os: "Android TV 9",
    uiFps: 35, inputLatencyMs: 90, cpuSlowdown: 8, dropKeys: false, gpuTier: "mid",
    engineNote: "Android System WebView, updated via the Play Store \u2014 version varies per set (Settings \u203a Apps \u203a Android System WebView).",
    bestSeller: { evidence: "Entry 4K LED tier for 2020; no sales chart found", confidence: "inferred" },
    notes: "App SoC from a single third-party spec database. The X1 picture processor does not run apps.",
  },
  {
    id: "sony-2021", family: "Sony Bravia TV", name: "Sony X80J", year: 2021, model: "KD-55X80J",
    soc: "MediaTek MT5895", cpu: "4\u00d7 Cortex-A73 @ 1.8 GHz", gpu: "unknown",
    ramGB: 3, video: "4K HDR10/HLG/Dolby Vision", os: "Google TV (Android TV 10)",
    uiFps: 40, inputLatencyMs: 80, cpuSlowdown: 7, dropKeys: false, gpuTier: "mid",
    engineNote: "Android System WebView, updated via the Play Store \u2014 version varies per set (Settings \u203a Apps \u203a Android System WebView).",
    bestSeller: { evidence: "Widely listed on Amazon US; no ranking found", confidence: "weak" },
    notes: "RAM reported as 3 or 4 GB (sources conflict).",
  },
  {
    id: "sony-2022", family: "Sony Bravia TV", name: "Sony X80K", year: 2022, model: "KD-55X80K",
    soc: "MediaTek MT5895", cpu: "4\u00d7 Cortex-A73 @ 1.8 GHz", gpu: "Mali-G52",
    ramGB: 3, video: "4K HDR10/HLG/Dolby Vision", os: "Google TV (Android TV 10)",
    uiFps: 40, inputLatencyMs: 80, cpuSlowdown: 7, dropKeys: false, gpuTier: "mid",
    engineNote: "Android System WebView, updated via the Play Store \u2014 version varies per set (Settings \u203a Apps \u203a Android System WebView).",
    bestSeller: { evidence: "Amazon US \u201cBest Seller\u201d badge on the 55\" (snapshot)", confidence: "weak" },
    notes: "RAM reported as 3 or 4 GB (sources conflict).",
  },
  {
    id: "sony-2023", family: "Sony Bravia TV", name: "Sony X75WL", year: 2023, model: "KD-55X75WL",
    soc: "unknown (possibly Realtek, as X75L)", cpu: "unknown", gpu: "unknown",
    video: "4K HDR10/HLG/Dolby Vision", os: "Google TV (Android TV 10)",
    uiFps: 30, inputLatencyMs: 100, cpuSlowdown: 9, dropKeys: false, gpuTier: "mid",
    engineNote: "Android System WebView, updated via the Play Store \u2014 version varies per set (Settings \u203a Apps \u203a Android System WebView).",
    bestSeller: { evidence: "Which? Best Buy; widely stocked in the UK; no ranking", confidence: "weak" },
  },
  {
    id: "sony-2024", family: "Sony Bravia TV", name: "Sony Bravia 3", year: 2024, model: "K-55S30",
    soc: "unknown", cpu: "4 cores", gpu: "unknown",
    video: "4K HDR10/HLG/Dolby Vision", os: "Google TV",
    uiFps: 30, inputLatencyMs: 100, cpuSlowdown: 9, dropKeys: false, gpuTier: "mid",
    engineNote: "Android System WebView, updated via the Play Store \u2014 version varies per set (Settings \u203a Apps \u203a Android System WebView).",
    bestSeller: { evidence: "Replaced X75WL as the UK entry set; ~650\u2013890 Currys reviews per size", confidence: "weak" },
  },
  {
    id: "sony-2025", family: "Sony Bravia TV", name: "Sony Bravia 2 II", year: 2025, model: "K-55S25M2",
    soc: "unknown (possibly Realtek)", cpu: "unknown", gpu: "unknown",
    ramGB: 2, video: "4K HDR10/HLG", os: "Google TV",
    uiFps: 30, inputLatencyMs: 110, cpuSlowdown: 10, dropKeys: false, gpuTier: "mid",
    engineNote: "Android System WebView, updated via the Play Store \u2014 version varies per set (Settings \u203a Apps \u203a Android System WebView).",
    bestSeller: { evidence: "Entry 2025 set at Best Buy (US); UK carried Bravia 3 over", confidence: "weak" },
    notes: "RAM from a single retail listing.",
  },
  {
    id: "sony-2026", family: "Sony Bravia TV", name: "Sony Bravia 3 II", year: 2026, model: "K-55S35",
    soc: "MediaTek Pentonic 800 (single source)", cpu: "unknown", gpu: "unknown",
    video: "4K 120 Hz HDR", os: "Google TV (with Gemini)",
    uiFps: 40, inputLatencyMs: 80, cpuSlowdown: 7, dropKeys: false, gpuTier: "high",
    engineNote: "Android System WebView, updated via the Play Store \u2014 version varies per set (Settings \u203a Apps \u203a Android System WebView).",
    bestSeller: { evidence: "New 2026 mid LED; sources disagree on which Sony is the entry/volume set", confidence: "inferred" },
    notes: "SoC from one review only \u2014 unverified.",
  },
];

export function findDevice(id: string | null | undefined): DeviceProfile | undefined {
  return DEVICES.find((d) => d.id === id);
}

export const DEVICE_FAMILIES: DeviceFamily[] = ['Amazon Fire TV Stick', 'Sony PlayStation', 'Samsung TV', 'LG TV', 'Sony Bravia TV'];

/** Dropdown label, e.g. "Fire TV Stick 4K – 2018". */
export const deviceLabel = (d: DeviceProfile) => `${d.name} – ${d.year}`;
