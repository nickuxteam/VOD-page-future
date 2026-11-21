import { describe, expect, it } from 'vitest';
import { FIRE_TV_STICKS, NO_SIMULATION, findDevice } from './devices';

describe('Fire TV Stick profiles', () => {
  it('has unique ids and none collides with "No simulation"', () => {
    const ids = FIRE_TV_STICKS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findDevice(NO_SIMULATION)).toBeUndefined();
  });

  it('keeps simulation values in a sane range', () => {
    for (const d of FIRE_TV_STICKS) {
      expect(d.uiFps).toBeGreaterThanOrEqual(10);
      expect(d.uiFps).toBeLessThanOrEqual(60);
      expect(d.inputLatencyMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('ranks the oldest stick slowest and the 4K Max (2nd Gen) fastest', () => {
    const byFps = [...FIRE_TV_STICKS].sort((a, b) => a.uiFps - b.uiFps);
    expect(byFps[0].id).toBe('ftv-stick-1');
    expect(byFps[byFps.length - 1].id).toBe('ftv-stick-4k-max-2023');
  });
});
