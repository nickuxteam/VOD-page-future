import { describe, expect, it } from 'vitest';
import { initialMyItvState, navigateMyItv, railForRow, type MyItvConfig, type MyItvState } from './myItvNavigation';
import type { NavKey } from './vodNavigation';

const config: MyItvConfig = { continue: 7, mylist: 8, week: 8, recommended: 8, leaving: 7, soon: 7 };

function press(keys: NavKey[], from: MyItvState = initialMyItvState()) {
  let s = from;
  const effects = [];
  for (const k of keys) {
    const r = navigateMyItv(s, k, config);
    s = r.state;
    if (r.effect) effects.push(r.effect);
  }
  return { s, effects };
}

describe('My ITVX tabs', () => {
  it('starts on the tab row with Continue watching showing', () => {
    const s = initialMyItvState();
    expect(s).toMatchObject({ row: 0, tab: 0 });
    expect(railForRow(s, 1)).toBe('continue');
  });

  it('→ switches the rail beneath to My list without OK, and clamps at the last tab', () => {
    const { s } = press(['ArrowRight', 'ArrowRight']);
    expect(s.tab).toBe(1);
    expect(railForRow(s, 1)).toBe('mylist');
  });

  it('OK on a tab drops into its rail', () => {
    expect(press(['ArrowRight', 'Enter']).s).toMatchObject({ row: 1, tab: 1 });
  });
});

describe('My ITVX rails', () => {
  it('walks the rows top to bottom and clamps at Coming soon', () => {
    const rails = [1, 2, 3, 4, 5, 6].map((n) => railForRow(press(Array(n).fill('ArrowDown')).s));
    expect(rails).toEqual(['continue', 'week', 'recommended', 'leaving', 'soon', 'soon']);
  });

  it('each rail keeps its own position, and the two top rails are independent', () => {
    const { s } = press(['ArrowDown', 'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowRight', 'ArrowUp']);
    expect(s.index).toMatchObject({ continue: 2, week: 1, mylist: 0 });
    expect(railForRow(s)).toBe('continue');
    const list = press(['ArrowUp', 'ArrowRight', 'ArrowDown'], s).s;
    expect(railForRow(list)).toBe('mylist');
    expect(list.index.mylist).toBe(0);
  });

  it('clamps to the rail length', () => {
    expect(press(['ArrowDown', ...Array(20).fill('ArrowRight')]).s.index.continue).toBe(6);
  });

  it('OK opens the focused tile; Back returns to the tab row', () => {
    const { s, effects } = press(['ArrowDown', 'ArrowDown', 'ArrowRight', 'Enter', 'Back']);
    expect(effects).toEqual([{ type: 'open', rail: 'week', index: 1 }]);
    expect(s.row).toBe(0);
  });
});
