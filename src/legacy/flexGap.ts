/**
 * Flexbox `gap` needs Chromium 84 (2020–2021 Samsung/LG TVs ship 68–79).
 * It can't be detected with @supports (grid gap makes `@supports (gap: 0)`
 * true), so measure it once and add `no-flex-gap` to <html>. The margins in
 * styles/flex-gap-fallback.css then take over. Runs on import, before the
 * first render.
 */
export function supportsFlexGap(): boolean {
  if (typeof document === 'undefined') return true;
  const flex = document.createElement('div');
  flex.style.display = 'flex';
  flex.style.flexDirection = 'column';
  flex.style.rowGap = '1px';
  flex.style.position = 'absolute';
  flex.style.visibility = 'hidden';
  flex.appendChild(document.createElement('div'));
  flex.appendChild(document.createElement('div'));
  document.documentElement.appendChild(flex);
  const supported = flex.scrollHeight === 1;
  document.documentElement.removeChild(flex);
  return supported;
}

export function applyFlexGapFallback(): void {
  if (typeof document === 'undefined') return;
  if (!supportsFlexGap()) document.documentElement.classList.add('no-flex-gap');
}

applyFlexGapFallback();
