import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Browser support: Chromium 68+ (2020 Samsung Tizen 5.5 = 69, 2020 LG webOS 5 = 68).
 * esbuild lowers newer JS syntax (?. ?? etc.) and CSS (inset → top/right/bottom/left)
 * to this target. Runtime APIs are not polyfilled — avoid ES2019+ built-ins such as
 * Object.fromEntries, Array.prototype.flat, String.prototype.replaceAll, .at().
 * See docs/VOD-TABS-SPEC.md §11.
 */
export const BROWSER_TARGET = 'chrome68';

export default defineConfig({
  plugins: [react()],
  build: {
    target: BROWSER_TARGET,
    cssTarget: BROWSER_TARGET,
  },
});
