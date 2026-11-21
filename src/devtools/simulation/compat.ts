/**
 * DEV TOOL — not part of the handover.
 *
 * Browser-engine compatibility check. Speed throttling can't reproduce an
 * older engine, so this lists the web-platform features the handover code
 * relies on with the first Chromium version that supports them, and reports
 * which ones a device's engine lacks.
 *
 * Keep FEATURES in step with the code: search src/ (excluding devtools) for
 * the pattern in `usedIn` when adding CSS or JS.
 */

export interface Feature {
  id: string;
  name: string;
  /** First Chromium major version with support. */
  minChromium: number;
  severity: 'breaks' | 'degrades' | 'cosmetic';
  impact: string;
  usedIn: string;
}

/**
 * Since the older-device fix (build target chrome68, flex-gap fallback,
 * :has() and Object.fromEntries removed, inset lowered at build time) the
 * only hard requirement left is the build target itself.
 */
export const FEATURES: Feature[] = [
  {
    id: 'build-target',
    name: 'JS bundle built for Chromium 68 (vite.config.ts BROWSER_TARGET)',
    minChromium: 68,
    severity: 'breaks',
    impact: 'Below Chromium 68 the bundle may not parse. Lower BROWSER_TARGET (and re-test) to go older.',
    usedIn: 'vite.config.ts',
  },
  {
    id: 'flex-gap-fallback',
    name: 'Flexbox gap (fallback active)',
    minChromium: 84,
    severity: 'cosmetic',
    impact: 'Native gap missing; styles/flex-gap-fallback.css applies matching margins. Verified pixel-identical in modern Chrome with gap disabled.',
    usedIn: 'legacy/flexGap.ts + styles/flex-gap-fallback.css',
  },
  {
    id: 'aspect-ratio',
    name: 'aspect-ratio',
    minChromium: 88,
    severity: 'cosmetic',
    impact: 'None on the page (trailer tiles set an explicit height).',
    usedIn: 'TrailerRail',
  },
  {
    id: 'text-wrap-pretty',
    name: 'text-wrap: pretty',
    minChromium: 117,
    severity: 'cosmetic',
    impact: 'About description wraps without orphan control.',
    usedIn: 'AboutPanel',
  },
];

export interface CompatResult {
  /** null when the device's engine version is unknown / not Chromium. */
  checked: boolean;
  missing: Feature[];
}

export function checkCompat(chromium: number | undefined): CompatResult {
  if (!chromium) return { checked: false, missing: [] };
  return { checked: true, missing: FEATURES.filter((f) => chromium < f.minChromium) };
}
