import { describe, expect, it } from 'vitest';
import { checkCompat } from './compat';

describe('checkCompat', () => {
  it('skips devices with an unknown engine', () => {
    expect(checkCompat(undefined)).toEqual({ checked: false, missing: [] });
  });
  it('2020 LG webOS 5 (Chromium 68) has nothing that breaks the page', () => {
    const r = checkCompat(68);
    expect(r.missing.filter((f) => f.severity === 'breaks')).toEqual([]);
    expect(r.missing.map((f) => f.id)).toContain('flex-gap-fallback');
  });
  it('flags engines below the build target', () => {
    expect(checkCompat(64).missing.map((f) => f.id)).toContain('build-target');
  });
  it('2025 engine (Chromium 120) needs no fallbacks', () => {
    expect(checkCompat(120).missing).toEqual([]);
  });
});
