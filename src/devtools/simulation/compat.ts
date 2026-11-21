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

export const FEATURES: Feature[] = [
  {
    id: 'es2020',
    name: 'ES2020 syntax in the JS bundle (?. ?? — Vite default target)',
    minChromium: 80,
    severity: 'breaks',
    impact: 'Bundle fails to parse — blank page. Fix: set build.target or add @vitejs/plugin-legacy.',
    usedIn: 'All components (optional chaining / nullish coalescing)',
  },
  {
    id: 'flex-gap',
    name: 'Flexbox gap',
    minChromium: 84,
    severity: 'breaks',
    impact: 'Tabs, chips, rails and hero rows lose their spacing; rail focus maths (pitch) no longer matches the layout.',
    usedIn: '38 `gap:` rules across all components',
  },
  {
    id: 'inset',
    name: 'CSS inset shorthand',
    minChromium: 87,
    severity: 'breaks',
    impact: 'Rail clip areas, tile overlays and the hero gradient collapse or mis-position.',
    usedIn: 'EpisodeRail, RelatedRail, TrailerRail, HeroBackdrop, CtaTower',
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
    id: 'has',
    name: ':has() selector',
    minChromium: 105,
    severity: 'degrades',
    impact: 'Focused episode no longer stands out from dimmed siblings; related-rail heading stays at 50%.',
    usedIn: 'EpisodeRail, RelatedRail',
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
