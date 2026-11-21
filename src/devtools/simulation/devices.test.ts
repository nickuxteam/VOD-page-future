import { describe, expect, it } from 'vitest';
import { DEVICES, NO_SIMULATION, findDevice } from './devices';

describe('device profiles', () => {
  it('has unique ids and none collides with "No simulation"', () => {
    const ids = DEVICES.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findDevice(NO_SIMULATION)).toBeUndefined();
  });

  it('keeps simulation values in a sane range', () => {
    for (const d of DEVICES) {
      expect(d.uiFps).toBeGreaterThanOrEqual(10);
      expect(d.uiFps).toBeLessThanOrEqual(60);
      expect(d.inputLatencyMs).toBeGreaterThanOrEqual(0);
      expect(d.cpuSlowdown).toBeGreaterThanOrEqual(1);
    }
  });

  it('includes PS4 and PS4 Pro, with the Pro faster', () => {
    const ps4 = findDevice('ps4')!;
    const pro = findDevice('ps4-pro')!;
    expect(ps4.family).toBe('Sony PlayStation');
    expect(pro.cpuSlowdown).toBeLessThan(ps4.cpuSlowdown);
    expect(pro.uiFps).toBeGreaterThan(ps4.uiFps);
  });

  it('ranks the oldest stick slowest and the 4K Max (2nd Gen) fastest', () => {
    const byFps = [...DEVICES].sort((a, b) => a.uiFps - b.uiFps);
    expect(byFps[0].id).toBe('ftv-stick-1');
    expect(byFps[byFps.length - 1].id).toBe('ftv-stick-4k-max-2023');
  });
});
