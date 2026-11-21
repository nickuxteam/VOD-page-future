/**
 * Amazon Fire TV Stick device profiles for the simulation mode.
 *
 * Hardware columns (SoC / CPU / GPU / RAM / video / OS) come from Amazon's
 * developer device specs and launch coverage (see docs/VOD-TABS-SPEC.md §11).
 *
 * The *simulation* columns are ESTIMATES derived from that hardware, not
 * measurements: a desktop browser cannot become a Fire TV. They are tuned so
 * devices rank correctly against each other — calibrate them against real
 * hardware (e.g. Fire TV developer tools' FPS overlay) when you have it.
 *
 *   uiFps          frame rate the main thread is capped to (UI work + rail animation smoothness)
 *   inputLatencyMs delay between a remote press and the app handling it
 *   dropKeys       presses arriving while a previous one is still pending are discarded
 *   gpu            'low'  → no shadows / blur / filters (fill-rate limited GPUs)
 *                  'mid'  → shadows kept, blur filters removed
 *                  'high' → full effects
 */

export type GpuTier = 'low' | 'mid' | 'high';

export interface DeviceProfile {
  id: string;
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
  dropKeys: boolean;
  gpuTier: GpuTier;
  notes?: string;
}

export const NO_SIMULATION = 'none';

export const FIRE_TV_STICKS: DeviceProfile[] = [
  {
    id: 'ftv-stick-1', name: 'Fire TV Stick (1st Gen)', year: 2014,
    soc: 'Broadcom BCM28155 (Capri)', cpu: '2× Cortex-A9 @ 1.0 GHz', gpu: 'VideoCore IV',
    ramGB: 1, video: '1080p', os: 'Fire OS 3 → 5 (Android 4.2 → 5.1)',
    uiFps: 15, inputLatencyMs: 220, dropKeys: true, gpuTier: 'low',
    notes: 'Dual-core, oldest WebView. Expect visible stutter on every rail move.',
  },
  {
    id: 'ftv-stick-2', name: 'Fire TV Stick (2nd Gen)', year: 2016,
    soc: 'MediaTek MT8127D', cpu: '4× Cortex-A7 @ 1.3 GHz', gpu: 'Mali-450 MP4',
    ramGB: 1, video: '1080p', os: 'Fire OS 5 (Android 5.1)',
    uiFps: 20, inputLatencyMs: 160, dropKeys: true, gpuTier: 'low',
  },
  {
    id: 'ftv-stick-basic', name: 'Fire TV Stick Basic Edition', year: 2017,
    soc: 'MediaTek MT8127D', cpu: '4× Cortex-A7 @ 1.3 GHz', gpu: 'Mali-450 MP4',
    ramGB: 1, video: '1080p', os: 'Fire OS 5 (Android 5.1)',
    uiFps: 20, inputLatencyMs: 160, dropKeys: true, gpuTier: 'low',
    notes: 'Same hardware as the 2nd Gen stick.',
  },
  {
    id: 'ftv-stick-4k-2018', name: 'Fire TV Stick 4K', year: 2018,
    soc: 'MediaTek MT8695', cpu: '4× Cortex-A53 @ 1.7 GHz', gpu: 'IMG GE8300',
    ramGB: 1.5, video: '4K HDR', os: 'Fire OS 6 (Android 7.1)',
    uiFps: 30, inputLatencyMs: 90, dropKeys: false, gpuTier: 'mid',
  },
  {
    id: 'ftv-stick-lite', name: 'Fire TV Stick Lite', year: 2020,
    soc: 'MediaTek MT8695D', cpu: '4× Cortex-A53 @ 1.7 GHz', gpu: 'IMG GE8300',
    ramGB: 1, video: '1080p HDR', os: 'Fire OS 7 (Android 9)',
    uiFps: 30, inputLatencyMs: 100, dropKeys: false, gpuTier: 'mid',
  },
  {
    id: 'ftv-stick-3', name: 'Fire TV Stick (3rd Gen)', year: 2020,
    soc: 'MediaTek MT8695D', cpu: '4× Cortex-A53 @ 1.7 GHz', gpu: 'IMG GE8300',
    ramGB: 1, video: '1080p HDR', os: 'Fire OS 7 (Android 9)',
    uiFps: 30, inputLatencyMs: 100, dropKeys: false, gpuTier: 'mid',
  },
  {
    id: 'ftv-stick-4k-max-2021', name: 'Fire TV Stick 4K Max', year: 2021,
    soc: 'MediaTek MT8696', cpu: '4× Cortex-A55 @ 1.8 GHz', gpu: 'IMG GE9215 @ 750 MHz',
    ramGB: 2, video: '4K HDR', os: 'Fire OS 7 (Android 9)',
    uiFps: 45, inputLatencyMs: 60, dropKeys: false, gpuTier: 'high',
  },
  {
    id: 'ftv-stick-4k-2023', name: 'Fire TV Stick 4K (2nd Gen)', year: 2023,
    soc: 'MediaTek MT8696D', cpu: '4× Cortex-A55 @ 1.7 GHz', gpu: 'IMG GE9215 @ 650 MHz',
    ramGB: 2, video: '4K HDR', os: 'Fire OS 8 (Android 11)',
    uiFps: 45, inputLatencyMs: 60, dropKeys: false, gpuTier: 'high',
  },
  {
    id: 'ftv-stick-4k-max-2023', name: 'Fire TV Stick 4K Max (2nd Gen)', year: 2023,
    soc: 'MediaTek MT8696T', cpu: '4× Cortex-A55 @ 2.0 GHz', gpu: 'IMG GE9215 @ 850 MHz',
    ramGB: 2, video: '4K HDR', os: 'Fire OS 8 (Android 11)',
    uiFps: 55, inputLatencyMs: 45, dropKeys: false, gpuTier: 'high',
    notes: 'Fastest stick — the closest to the unsimulated desktop experience.',
  },
  {
    id: 'ftv-stick-hd-2024', name: 'Fire TV Stick HD', year: 2024,
    soc: 'MediaTek MT8695D', cpu: '4× Cortex-A53 @ 1.7 GHz', gpu: 'IMG GE8300',
    ramGB: 1, video: '1080p HDR', os: 'Fire OS 7 (Android 9)',
    uiFps: 30, inputLatencyMs: 100, dropKeys: false, gpuTier: 'mid',
  },
  {
    id: 'ftv-stick-4k-select', name: 'Fire TV Stick 4K Select', year: 2025,
    soc: 'MediaTek MT8698', cpu: '4× Cortex-A55 @ 1.7 GHz', gpu: '—',
    ramGB: 1, video: '4K HDR', os: 'Vega OS (Linux)',
    uiFps: 30, inputLatencyMs: 110, dropKeys: false, gpuTier: 'mid',
    notes: 'Vega OS, 1 GB RAM. Reviews report slower scrolling than the 2023 4K stick.',
  },
  {
    id: 'ftv-stick-hd-2026', name: 'Fire TV Stick HD', year: 2026,
    soc: 'MediaTek MT8698D', cpu: '4× Cortex-A55 @ 1.7 GHz', gpu: 'Mali-G310 V2 @ 500 MHz',
    ramGB: 1, video: '1080p HDR', os: 'Vega OS (Linux)',
    uiFps: 30, inputLatencyMs: 110, dropKeys: false, gpuTier: 'mid',
  },
];

export function findDevice(id: string | null | undefined): DeviceProfile | undefined {
  return FIRE_TV_STICKS.find((d) => d.id === id);
}

/** Dropdown label, e.g. "Fire TV Stick 4K – 2018". */
export const deviceLabel = (d: DeviceProfile) => `${d.name} – ${d.year}`;
