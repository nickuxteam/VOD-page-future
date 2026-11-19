# VOD-page-future
What the VOD page could look like in a few years.

This repo holds the **VOD Tabs (CTV)** front-end components: a React + TypeScript port of the
`VOD Tabs – CTV` prototype (`index.html`). The class names, CSS and ITVX design tokens are carried
over 1:1 from the prototype, so the design and the code describe the same thing.

```bash
npm install
npm run dev     # demo page at http://localhost:5173 (arrow keys / Enter / Backspace = D-pad)
npm test        # navigation model unit tests
npm run build   # typecheck + production build
```

## Structure

```
src/
  styles/tokens.css          ITVX tokens (colour, spacing, radius, type), F37 Zagma @font-face, 1920×1080 .app
  types.ts                   Programme / Episode / RelatedProgramme / Cta data shapes
  navigation/vodNavigation.ts  Pure D-pad focus model: navigate(state, key, config) → { state, effect }
  components/
    Stage/                   1920×1080 canvas, scaled to fit the window
    HeroBackdrop/            full-screen hero art (dims to 20% in tab view)
    HeroMeta/                EpisodeHero, Tag, AccessibilityTags, MetaLine, Strapline
    CtaTower/                primary + secondary pills (2 / 3 / 4-button variants)
    SeriesNav/               EPISODES ▾ / About / Trailers / Related tabs + series sub nav chips
    EpisodeRail/             EpisodeTile + landscape slider (slot-0 focus, breakaway modes)
    RelatedRail/             PortraitTile + "More like this" rail + RailMeta
    AboutPanel/              About section card
    TrailerRail/             Trailers tab content
    KeyHint/                 keyboard → remote hint bar
  pages/VodTabsPage.tsx      the full page composed from the above
  data/broadchurch.ts        demo content (the prototype's default programme)
```

Everything is exported from `src/index.ts`. Import `src/styles/tokens.css` once at the app root.

## Prototype → component map

| Prototype (index.html)                    | Component                     |
| ----------------------------------------- | ----------------------------- |
| `.hero`                                   | `HeroBackdrop`                |
| `.vod-hero` (title, pills, desc block)    | `EpisodeHero`                 |
| `.pill-exclusive`                         | `Tag`                         |
| `.pill-access-group`                      | `AccessibilityTags`           |
| `.pill-meta` / `.pill-bullet`             | `MetaLine`                    |
| `.strap-chip`                             | `Strapline`                   |
| `.vod-cta-row`                            | `CtaTower`                    |
| `.series-tabs-shell`, `.series-dd-menu`   | `SeriesNav`                   |
| `.episode-rail-shell`, `.episode-tile`    | `EpisodeRail`, `EpisodeTile`  |
| `.prompt-area`, `.grid-tile`, `.rail-meta`| `RelatedRail`, `PortraitTile`, `RailMeta` |
| `.about-shell`                            | `AboutPanel`                  |
| `.trailer-shell`                          | `TrailerRail`                 |
| `.hint`                                   | `KeyHint`                     |
| `STATE` + `handle*Key()`                  | `navigation/vodNavigation.ts` |
| `.app.series-focus` / `.discover-focus` … | `deriveView()` → `.app` classes |

## Navigation model

Focus rows: `hero` → `series` (tabs / sub nav chips) → `episodes` | `about` | `trailer` → `rail`.
`navigate()` is framework-free and returns side effects (`cta`, `playEpisode`, `openProgramme`,
`toggleTrailer`) for the page to handle. `deriveView()` returns the `.app` classes
(`hero-focused`, `tabs-active`, `series-focus`, `discover-focus`, `tower-N`) that drive every
layout mode in the CSS, exactly as in the prototype.

## Not yet ported

The prototype's dev tooling and data plumbing stay in the prototype for now: the `Q` customise
modal, scenario presets (`W`), TMDB lookups, hero trailer autoplay, My List persistence, the
Upcoming / Coming soon hero, Meet the cast rail and the prompt pills. Wire artwork and copy from
your content API through the `Programme` / `Episode` / `RelatedProgramme` props.

## Fonts

The F37 Zagma brand font is licensed and not committed. Drop the `.ttf` files listed in
`src/styles/tokens.css` into `public/fonts/`; until then the components fall back to the system sans.
