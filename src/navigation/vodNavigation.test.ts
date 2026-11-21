import { describe, expect, it } from 'vitest';
import { deriveView, initialNavState, navKeyFromEvent, navigate, type NavConfig, type NavKey, type NavState } from './vodNavigation';
import { railOffsets } from '../components/EpisodeRail/EpisodeRail';

const config: NavConfig = {
  tabs: ['episodes', 'about', 'trailers', 'related'],
  seriesNumbers: [1, 2, 3],
  episodeCounts: { 1: 8, 2: 8, 3: 8 },
  ctaCount: 3,
  trailerCount: 3,
  relatedCount: 12,
};

function press(keys: NavKey[], from: NavState = initialNavState(config), c = config) {
  let s = from;
  const effects = [];
  for (const k of keys) {
    const r = navigate(s, k, c);
    s = r.state;
    if (r.effect) effects.push(r.effect);
  }
  return { s, effects };
}

describe('hero CTA tower', () => {
  it('drops from the primary to the secondaries, then into the tab row', () => {
    expect(press(['ArrowDown']).s).toMatchObject({ section: 'hero', ctaIndex: 1 });
    expect(press(['ArrowDown', 'ArrowDown']).s).toMatchObject({ section: 'series', tabIndex: 0 });
  });

  it('moves across secondaries only and Up returns to the primary', () => {
    const { s } = press(['ArrowDown', 'ArrowRight', 'ArrowRight']);
    expect(s.ctaIndex).toBe(2);
    expect(press(['ArrowUp'], s).s.ctaIndex).toBe(0);
    expect(press(['ArrowRight']).s.ctaIndex).toBe(0);
  });

  it('emits a cta effect on Enter', () => {
    expect(press(['Enter']).effects).toEqual([{ type: 'cta', index: 0 }]);
  });
});

describe('tab row + series sub nav', () => {
  const onTabs = press(['ArrowDown', 'ArrowDown']).s;

  it('opens the sub nav on the active series chip with Down', () => {
    const { s } = press(['ArrowDown'], onTabs);
    expect(s).toMatchObject({ section: 'series', ddOpen: true, ddFocus: 'chips', ddSeries: 1 });
  });

  it('walks chips newest-first and Enter selects a series', () => {
    const open = press(['ArrowDown'], onTabs).s; // on chip 1 (last in 3,2,1)
    const { s } = press(['ArrowLeft', 'Enter'], open);
    expect(s).toMatchObject({ ddSeries: 2, activeSeries: 2, episodeIndex: 0 });
  });

  it('Down from the chips lands on the episode rail; Up returns to the chips', () => {
    const open = press(['ArrowDown'], onTabs).s;
    const eps = press(['ArrowDown'], open).s;
    expect(eps.section).toBe('episodes');
    expect(press(['ArrowUp'], eps).s).toMatchObject({ section: 'series', ddOpen: true, ddFocus: 'chips' });
  });

  it('Enter on About shows the About panel and hides the episode rail', () => {
    const { s } = press(['ArrowRight', 'Enter'], onTabs);
    expect(s.util).toBe('about');
    const v = deriveView(s, config);
    expect(v.aboutVisible).toBe(true);
    expect(v.episodesVisible).toBe(false);
  });

  it('Enter on Related jumps into the related rail in discover mode', () => {
    const { s } = press(['ArrowRight', 'ArrowRight', 'ArrowRight', 'Enter'], onTabs);
    expect(s).toMatchObject({ section: 'rail', tileIndex: 0 });
    expect(deriveView(s, config).appClasses).toContain('discover-focus');
  });

  it('a single-series show goes straight from the tab to the episodes', () => {
    const one = { ...config, seriesNumbers: [1], episodeCounts: { 1: 6 } };
    const s0 = press(['ArrowDown', 'ArrowDown'], initialNavState(one), one).s;
    expect(press(['ArrowDown'], s0, one).s.section).toBe('episodes');
  });
});

describe('rails', () => {
  const eps = press(['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown']).s;

  it('clamps episode focus to the series length', () => {
    const { s } = press(Array(20).fill('ArrowRight'), eps);
    expect(s.episodeIndex).toBe(7);
  });

  it('episodes → related → back to episodes', () => {
    const rail = press(['ArrowDown'], eps).s;
    expect(rail.section).toBe('rail');
    expect(press(['ArrowUp'], rail).s.section).toBe('episodes');
  });

  it('Enter on an episode / related tile emits the matching effect', () => {
    expect(press(['ArrowRight', 'Enter'], eps).effects).toEqual([{ type: 'playEpisode', series: 1, index: 1 }]);
    expect(press(['ArrowDown', 'ArrowRight', 'Enter'], eps).effects).toEqual([{ type: 'openProgramme', index: 1 }]);
  });
});

describe('derived app classes', () => {
  it('hero focus vs collapsed series focus', () => {
    expect(deriveView(initialNavState(config), config).appClasses).toContain('hero-focused');
    const eps = press(['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown']).s;
    const cls = deriveView(eps, config).appClasses;
    expect(cls).toContain('series-focus');
    expect(cls).not.toContain('hero-focused');
  });

  it('picks the tower variant from the CTA count', () => {
    expect(deriveView(initialNavState(config), config).appClasses).toContain('tower-3');
  });
});

describe('railOffsets', () => {
  it('locks focus to slot 0 until the breakaway point', () => {
    expect(railOffsets(3, 8, 504, 'breakaway-1')).toEqual({ offset: 1512, ringShift: 0 });
    expect(railOffsets(7, 8, 504, 'breakaway-1')).toEqual({ offset: 3024, ringShift: 504 });
    expect(railOffsets(7, 8, 504, 'fixed').ringShift).toBe(0);
  });
});

describe('TV remote keys', () => {
  it('maps platform Back keys (LG 461, Samsung 10009, Android 4) to Back', () => {
    for (const keyCode of [461, 10009, 4]) expect(navKeyFromEvent({ key: 'Unidentified', keyCode })).toBe('Back');
    expect(navKeyFromEvent({ key: 'GoBack', keyCode: 0 })).toBe('Back');
    expect(navKeyFromEvent({ key: 'XF86Back', keyCode: 0 })).toBe('Back');
  });
  it('maps legacy arrow names and keyCodes', () => {
    expect(navKeyFromEvent({ key: 'Left', keyCode: 0 })).toBe('ArrowLeft');
    expect(navKeyFromEvent({ key: 'Unidentified', keyCode: 40 })).toBe('ArrowDown');
    expect(navKeyFromEvent({ key: 'Unidentified', keyCode: 13 })).toBe('Enter');
  });
  it('ignores unrelated keys', () => {
    expect(navKeyFromEvent({ key: 'a', keyCode: 65 })).toBeNull();
  });
});
