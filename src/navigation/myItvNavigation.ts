/**
 * My ITVX page — pure D-pad focus model, framework-free like vodNavigation.
 *
 * Focus rows, top to bottom:
 *   tabs → top (Continue watching | My list, switched by the tabs) → week → recommended → leaving → soon
 *
 * ←/→ on the tab row switches the rail beneath straight away (no OK needed).
 * ↑/↓ moves between rows; each rail remembers its own position.
 * Back returns to the tab row.
 */
import type { NavKey } from './vodNavigation';

export const MYITV_ROWS = ['tabs', 'top', 'week', 'recommended', 'leaving', 'soon'] as const;
export type MyItvRow = (typeof MYITV_ROWS)[number];
export type MyItvTab = 'continue' | 'mylist';
export const MYITV_TABS: MyItvTab[] = ['continue', 'mylist'];

/** Tile counts per rail. */
export interface MyItvConfig {
  continue: number;
  mylist: number;
  week: number;
  recommended: number;
  leaving: number;
  soon: number;
}

export type RailId = Exclude<MyItvRow, 'tabs' | 'top'> | MyItvTab;

export interface MyItvState {
  row: number;
  tab: number;
  /** Focused tile per rail; kept when focus leaves so a rail resumes where it was. */
  index: Record<RailId, number>;
}

export type MyItvEffect = { type: 'open'; rail: RailId; index: number };

export function initialMyItvState(): MyItvState {
  return { row: 0, tab: 0, index: { continue: 0, mylist: 0, week: 0, recommended: 0, leaving: 0, soon: 0 } };
}

/** The rail a row shows (the top row follows the active tab). */
export function railForRow(state: MyItvState, row = state.row): RailId | null {
  const id = MYITV_ROWS[row];
  if (id === 'tabs') return null;
  if (id === 'top') return MYITV_TABS[state.tab];
  return id;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function navigateMyItv(
  state: MyItvState,
  key: NavKey,
  config: MyItvConfig,
): { state: MyItvState; effect?: MyItvEffect } {
  const rail = railForRow(state);
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowRight': {
      const d = key === 'ArrowRight' ? 1 : -1;
      if (!rail) return { state: { ...state, tab: clamp(state.tab + d, 0, MYITV_TABS.length - 1) } };
      const max = Math.max(0, config[rail] - 1);
      return { state: { ...state, index: { ...state.index, [rail]: clamp(state.index[rail] + d, 0, max) } } };
    }
    case 'ArrowDown':
      return { state: { ...state, row: clamp(state.row + 1, 0, MYITV_ROWS.length - 1) } };
    case 'ArrowUp':
      return { state: { ...state, row: clamp(state.row - 1, 0, MYITV_ROWS.length - 1) } };
    case 'Enter':
      if (!rail) return { state: { ...state, row: 1 } }; // OK on a tab drops into its rail
      return { state, effect: { type: 'open', rail, index: state.index[rail] } };
    case 'Back':
      return { state: { ...state, row: 0 } };
    default:
      return { state };
  }
}
