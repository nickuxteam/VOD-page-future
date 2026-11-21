/**
 * DEV TOOL — not part of the handover. Device profiles for the simulation
 * mode: every Amazon Fire TV Stick, plus PlayStation 4 / PS4 Pro.
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

export type DeviceFamily = 'Amazon Fire TV Stick' | 'Sony PlayStation';

export interface DeviceProfile {
  id: string;
  family: DeviceFamily;
  name: string;
  year: number;
  model?: string;
  soc: string;
  cpu: string;
  gpu: string;
  ramGB: number;
  video: string;
  os: string;
  /* simulation (estimates) */
  uiFps: number;
  inputLatencyMs: number;
  cpuSlowdown: number;
  dropKeys: boolean;
  gpuTier: GpuTier;
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
];

export function findDevice(id: string | null | undefined): DeviceProfile | undefined {
  return DEVICES.find((d) => d.id === id);
}

export const DEVICE_FAMILIES: DeviceFamily[] = ['Amazon Fire TV Stick', 'Sony PlayStation'];

/** Dropdown label, e.g. "Fire TV Stick 4K – 2018". */
export const deviceLabel = (d: DeviceProfile) => `${d.name} – ${d.year}`;
