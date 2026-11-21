import { describe, expect, it } from 'vitest';
import { checkCompat } from './compat';

describe('checkCompat', () => {
  it('skips devices with an unknown engine', () => {
    expect(checkCompat(undefined)).toEqual({ checked: false, missing: [] });
  });
  it('flags breaking features on a 2020 Tizen (Chromium 69)', () => {
    const ids = checkCompat(69).missing.map((f) => f.id);
    expect(ids).toEqual(expect.arrayContaining(['es2020', 'flex-gap', 'inset', 'has']));
  });
  it('passes a 2025 engine (Chromium 120)', () => {
    expect(checkCompat(120).missing).toEqual([]);
  });
});
