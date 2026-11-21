# VOD Tabs (CTV): Build Specification

This document describes the ITVX **VOD Tabs** connected-TV programme page in enough detail to rebuild it from scratch,
by hand or with any LLM coding tool. It covers layout, focus logic, animation, accessibility, page-logic scenarios and
user journeys.

- **Source of truth:** the `VOD Tabs – CTV` prototype (`index.html`). This repo's React + TypeScript port (`src/`) implements
  the core of it.
- **Status markers:** ✅ = implemented in this repo, ◻ = prototype only (not ported yet), ★ = recommended addition (in
  neither).
- **Units:** all sizes are CSS px on a fixed **1920 × 1080** canvas, scaled to fit the screen.

---

## 1. Platform assumptions

| Item | Value |
| --- | --- |
| Device | Connected TV / set-top box, viewed from ~3 m ("10-foot UI") |
| Canvas | Fixed 1920 × 1080 `.app`, scaled proportionally to fit, letterboxed if larger ✅ |
| Input | 5-way remote: ←, →, ↑, ↓, OK, plus Back. On desktop: arrow keys, Enter/Space = OK, Backspace/Escape = Back ✅ |
| Pointer | Optional. Clicking a tile, tab or CTA moves focus to it ✅ |
| Font | F37 Zagma (licensed, variable 100–900), falling back to the system sans ✅ |
| Focus model | **Virtual focus.** One state object decides which element looks focused (via a `.focused` class). The browser's DOM focus is not used ✅ |

---

## 2. Design tokens

Define these as CSS custom properties on `:root`. They were extracted from the ITVX Figma file ✅ (`src/styles/tokens.css`).

### Colour
| Token | Hex | Use |
| --- | --- | --- |
| `--bg-secondary` | `#102533` | Page + hero background |
| `--bg-primary` | `#102C3D` | Timestamp tags |
| `--bg-tertiary` | `#004159` | — |
| `--bg-inverse` | `#FFFFFF` | Focused CTA / tab fill |
| `--tile-default` | `#1b587f` | Tile placeholder |
| `--tile-focused` | `#1e6998` | Focused tile placeholder |
| `--accent-primary` | `#33DDDF` | Standard tag fill |
| `--accent-secondary` | `#8080FF` | Active filter pill |
| `--accent-tertiary` | `#80FFB5` | Live tag, live progress |
| `--brand-primary` | `#DEEB52` | Active-tab underline, "New episode" tag |
| `--text-primary` | `#FFFFFF` | Body text |
| `--text-secondary` | `#DFE1E3` | Meta lines, descriptions |
| `--text-inverse` | `#102C3D` | Text on light fills |
| `--text-interactive` | `#E8F753` | Progress fill |
| `--neutral-300` | `#AAC0C8` | Rail meta row |
| `--functional-warning` | `#F09345` | Age-rating outline |

### Spacing, radius, type
- **Spacing:** `01` 2 · `02` 4 · `03` 8 · `04` 12 · `05` 16 · `05-5` 20 · `06` 24 · `07` 32 · `08` 40 · `09` 56 · `10` 72 · `11` 104.
- **Radius:** `02` 4px (tags, tabs), `03` 8px (tiles, cards). Pills use 36px; filter pills use 999px.
- **Type (F37 Zagma):**

  | Style | Spec |
  | --- | --- |
  | Body | 400 24/1.3 |
  | Body Bold | 700 24/1.3 |
  | Small Body | 500 20/1.3 |
  | Tag | 500 20/1.4, uppercase |
  | CTA | 700 24/1.3, +0.06em tracking, uppercase |
  | Subtitle 2 | 700 28/1.3 |

  There is no text smaller than 20px apart from the access-tag glyphs and the dev hint bar.
- **Text drop shadow:** `1px 4px 4px rgba(0,0,0,.5)` on text over imagery.

---

## 3. Page anatomy and geometry

The page is one 1920 × 1080 `.app` element. Sections stack top to bottom. The content inset is **112px** left
(`--rail-focus-x`), and every rail's slot 0 starts there.

```
┌──────────────────────────────────────────────── 1920 ─┐
│ HeroBackdrop (absolute, full-bleed 1920×1080, z0)      │
│                                                        │
│ ┌ EpisodeHero (.vod-hero, h840, content bottom-aligned)┐
│ │ Title logo 550×200                                   │
│ │ [AD][S] EXCLUSIVE • 3 Series • 45 mins │ Straplines   │
│ │ ┌ START WATCHING - S1:E1 (610×64) ┐   │ Description  │
│ │ └ WATCH AD FREE │ ADD TO LIST     ┘   │ Keywords     │
│ └──────────────────────────────────────────────────────┘
│ SeriesNav: [EPISODES ▾] ABOUT TRAILERS RELATED (h80)   │
│            [3] [2] [SERIES 1] (sub nav chips, h60)     │
│ EpisodeRail | AboutPanel | TrailerRail (one visible)   │
│ RelatedRail "Find something similar to “X”"           │
└────────────────────────────────────────────────────────┘
```

| Component | Key geometry |
| --- | --- |
| **HeroBackdrop** | 1920×1080, `background-size: cover`, top-aligned, opacity .9. Gradient overlay: transparent until y=458, 70% at 40% of the remaining band, solid `#102C3D` at the bottom. |
| **EpisodeHero** | Grid `max-content 990px`, column-gap 56, row-gap 20, padding `0 150 0 112`, height 840, `align-content: end`, 40px below. Row 1 title (550×200, bottom-aligned). Row 2 left: meta line (610×34, gap 12). Rows 2–3 right: desc block (990 wide, gap 20). Row 3 left: CTA tower. |
| **Tag** | h28, radius 4, padding 0 4, Tag style, `--accent-primary` fill, `--text-inverse` text. |
| **AccessibilityTags** | h28 chips, gap 4, 1px inset white outline, 50% `#102533` fill, 14.9px/700 caps. The age rating uses the warning outline. |
| **MetaLine** | 20/500 `--text-secondary`, "•" separators with 8px either side, text shadow. |
| **Strapline** | h34 chip, radius 8, padding 0 12, gap 10, 20/700 white, 20% `#102533` fill. Variant 1: yellow glow `0 0 20px rgba(222,235,82,.3)`, no stroke, flame icon. Variant 2: 1px stroke, mint glow, padding 4 12. |
| **Description** | 24/400, 990 wide, clamped to 4 lines. Keywords below: 20/500, one line, "•" separators, title case. |
| **CtaTower** | 610 wide. Primary 610×64, radius 36, 31px play icon. Secondaries split the row (13px column gap, 16px row gap), h64, 20px/700. |
| **SeriesNav** | Shell h100. Track at left 112, top 16, gap 12. Tabs h80, radius 4, padding 0 24, CTA type. Trigger: chevron to the right of the label, 5% white fill when unfocused. Sub nav chips at top 116: 60×60, gap 8, 20px/700, 5% fill. They expand to "SERIES N" with padding 0 24 when focused or active. Active = 4px `--brand-primary` bottom bar. |
| **EpisodeRail** | Tile 486×274, gap 18 (pitch 504), radius 8. Bottom half-gradient overlay. Tags 12px inset bottom-left. Below the tile: title 24/700 (mt20, one line), description 24/400 (mt8, 3 lines, h93), meta (mt20, h28): access tags + length + "•" + date. |
| **RelatedRail** | Area padding-top 56. Heading 28/700, 24px above the tiles. Tiles 234×350, gap 18 (pitch 252). Rail meta 16px below the tiles: a 20/500 caps `--neutral-300` row (genre, sub-genre, count, small outline tags) and a 2-line 24/400 description, 1095 wide. |
| **AboutPanel** | Card 1696 wide, `#102533`, radius 8, padding 56, gap 56. Poster 234×350. Column: description 28/400 (4 lines), then a 3-column facts grid (gap 24/48): Genre, Length, Cast, Year, Rating, Director (label 20/700, value 20/500, ellipsis). |
| **TrailerRail** | Padding `16 112 24`. Tiles 486×274, gap 16, 3px transparent border, play badge 56px. Label 20/700, 12px below. |

---

## 4. Focus logic

### 4.1 Model
Implement focus as a **pure state machine**: `navigate(state, key, config) → { state, effect }`. Render everything from
`state`, and never read focus from the DOM. ✅ (`src/navigation/vodNavigation.ts`, unit-tested in
`vodNavigation.test.ts`)

```ts
type Section = 'hero' | 'series' | 'episodes' | 'about' | 'trailer' | 'rail';
interface NavState {
  section: Section;           // which row owns focus
  ctaIndex: number;           // 0 = primary, 1..3 = secondaries
  tabIndex: number;           // focused tab in [episodes, about, trailers, related]
  activeSeries: number|null;  // selected series (drives the episode rail); null for films
  ddOpen: boolean;            // series sub nav open
  ddFocus: 'trigger'|'chips'; // where focus sits inside the open sub nav
  ddSeries: number;           // focused chip
  episodeIndex: number; trailerIndex: number; tileIndex: number;
  util: null|'about'|'trailer'|'rail'; // content view chosen from the tab row (null = episodes)
  relatedView: boolean;       // reached the related rail via the Related tab's ↓
}
```

**Effects** are returned, never performed by the reducer: `cta(index)`, `playEpisode(series, index)`,
`openProgramme(index)`, `toggleTrailer(index)`.

**Config** is derived from the data: tabs in order (EPISODES only when there are series; TRAILERS only if trailers
exist; RELATED only if related items exist), the series numbers, episode counts, CTA count, trailer count and related
count.

### 4.2 Transition table

| From | Key | Result |
| --- | --- | --- |
| **hero**, primary (0) | ↓ | Secondary 1 (or the tab row if there are no secondaries) |
| hero, secondary | ← / → | Move between secondaries 1…n. ← never jumps up to the primary |
| hero, secondary | ↑ | Primary |
| hero, secondary | ↓ | Tab row, on the tab matching `util` (About / Trailers / Related), otherwise EPISODES |
| hero | OK | `cta(index)` effect (My List toggles its label + icon) |
| **series**, EPISODES trigger | ↓ or OK | Open the sub nav with focus on the **active** series chip. With a single series: ↓ goes straight to the episodes and OK just selects the Episodes view |
| series, any tab | ← / → | Previous / next tab |
| series, any tab | ↑ / Back | hero |
| series, ABOUT | ↓ | about (`util='about'`) · OK sets `util='about'` without moving focus |
| series, TRAILERS | ↓ | trailer (`util='trailer'`) · OK sets `util='trailer'` |
| series, RELATED | ↓ | rail with `relatedView=true` (hero stays collapsed) · OK goes to rail in **discover** mode |
| **sub nav**, chips | ← / → | Move along the chips (newest series first) |
| sub nav, chips | OK | Select the series: `activeSeries = chip`, episode index 0, `util = null` |
| sub nav, chips | ↓ | episodes (index kept, clamped to the count) |
| sub nav, chips | ↑ / Back | Focus returns to the trigger (sub nav stays open) |
| sub nav, trigger | ↓ | Back to the chips |
| sub nav, trigger | ↑ | Close the sub nav, go to hero |
| sub nav, trigger | ← / → | Close the sub nav, then move tabs |
| sub nav, trigger | OK / Back | Close the sub nav |
| **episodes** | ← / → | Move, clamped to 0…count-1 |
| episodes | ↑ / Back | Tab row (on the chips if the sub nav is open) |
| episodes | ↓ | rail, tile 0 |
| episodes | OK | `playEpisode` effect |
| **about** | ↑ / Back | Tab row on ABOUT |
| about | ↓ | rail (About stays the content view) |
| **trailer** | ← / → | Move between trailer tiles |
| trailer | ↑ / Back | Tab row on TRAILERS (playback stops) |
| trailer | ↓ | rail |
| trailer | OK | `toggleTrailer` (inline iframe plays or stops) |
| **rail** | ← / → | Move, clamped |
| rail | ↑ / Back | Return to where you came from: trailer → about → episodes → tab row (first that applies) |
| rail | OK | `openProgramme` (navigates to that title's page) |

### 4.3 Derived view: one class list drives every layout mode

`deriveView(state)` returns the classes for `.app`. The CSS keys **all** layout changes off these, so no component
needs layout props. ✅

| Class | When | Visual effect |
| --- | --- | --- |
| `hero-focused` | section = hero | Full hero |
| `tabs-active` | section = series | Tabs may expand |
| `series-focus` | Any section except hero, and not discover | Hero collapses to 48px (title, meta and CTAs hidden), backdrop dims to 20%, tabs move to the top |
| `discover-focus` | section = rail **and not** `relatedView` | Hero and tab row collapse to 0. The episode rail slides up by half its height and shows as a peek. About/Trailers shells pull up the same way |
| `tower-2` / `tower-3` | 2 or 3 CTAs | Tower variant (default 4 = primary + 3) |
| `alt-hero` | Always | Two-column hero (the base layout) |
| `guidance-<mode>` | Guidance on | Shows the matching guidance element (§6) |

Visibility rules:
- **About** is visible when section = about or `util='about'`.
- **Trailers** is visible when section = trailer or `util='trailer'`.
- **The episode rail** is visible when there is an active series and neither of the above is visible.
- **The sub nav chips** are visible when there are 2+ series, no util view, focus is not on the hero, and either the sub
  nav is open or focus isn't on a non-Episodes tab.
- **Dimming:** the episode rail dims to 80% unless it has focus. The related area dims to 80% unless it is in discover
  or related view.

### 4.4 Rail focus behaviour ("slot-0 lock")
Every horizontal rail keeps the focused item at the 112px inset and slides the track under a **fixed** focus ring. ✅

```
pitch     = tileWidth + gap                    // 504 episodes, 252 related
maxOffset = mode==='fixed' ? ∞ : max(0, count - (mode==='breakaway-1' ? 2 : 3)) * pitch
offset    = min(index * pitch, maxOffset)      // track translateX(-offset)
ringShift = index * pitch - offset             // focus ring translateX(ringShift)
```

- **End modes:** `breakaway-1` (default: the track stops one tile early and focus walks onto the last tile),
  `breakaway-2`, `fixed`.
- **Tiles left of the focus slot** (`i*pitch < offset`) fade to 33% opacity. While a rail has focus, its other tiles sit
  at 80%.
- **Related rail:** uses `fixed` mode with no breakaway. Its heading sits at 50% opacity until the rail has focus, and
  the rail meta area is only visible while the rail has focus.
- **Tab track and sub nav chips:** these don't move until focus passes the 4th item. After that they shift left by the
  widths of the items that have scrolled off, plus the gaps. This needs measured DOM widths, because labels vary.

### 4.5 Hero ↔ episode sync
The primary CTA label always shows the focused/active episode: `"<verb> - S{series}:E{episode}"`. Update it when
focus moves in the episode rail or a series is selected, even after focus leaves the rail. ✅ (the verb is fixed to
"Start watching" in the port; per-scenario verbs are ◻, see §7)

### 4.6 Initial focus
The page opens on the hero primary CTA, with the series and episode set by the scenario (§7). The prototype restores the
last nav state from `localStorage` after a reload ◻.

---

## 5. Animation

All values are copied from the prototype's CSS. FE reference names are in brackets. ✅ unless marked ◻.

| Element | Property | Duration | Easing |
| --- | --- | --- | --- |
| Tab track slide | transform | 250ms | `cubic-bezier(.8,0,0,1)` [cp_tab-group__list] |
| Tab focus fill / text | background, color | 600ms | `cubic-bezier(.33,0,.2,1)` |
| Active-tab underline | `transform: scaleX(0→1)`, origin centre | 600ms | `cubic-bezier(.33,0,.2,1)` |
| Numeric chip expand ("2" → "SERIES 2") | width, min-width, padding, bg, color | 250ms | `cubic-bezier(.4,0,.2,1)` (motion token 1) |
| Sub nav chevron | `rotate(0→180deg)` when open | 300ms | `cubic-bezier(.4,0,.2,1)` |
| Sub nav chip track | transform | 300ms | `cubic-bezier(.33,0,.2,1)` |
| Episode rail track | transform | 500ms | `cubic-bezier(.6,0,0,1)` [cp_tile-slider-ctv--standard] |
| Related rail track | transform | 330ms | `cubic-bezier(.6,0,0,1)` [cp_tile-slider-ctv--metadata-area] |
| Tile fade (left of view / sibling dim) | opacity | 330ms | `cubic-bezier(.6,0,0,1)` |
| Rail heading 50% → 100% | opacity | 330ms | `cubic-bezier(.6,0,0,1)` |
| Focus ring show/hide | opacity | 160ms | ease |
| Tile focus | box-shadow / background-color | 180 / 220ms | ease |
| CTA focus | background, color, box-shadow, transform | 180ms | ease |
| CTA press (OK) | `scale(.96)` then back | 120–140ms | ease ◻ |
| Episode tile press (OK) | `scale(1.04)` then back | 120ms | ease ◻ |
| Hero collapse / expand | height, padding, opacity | 320ms | `cubic-bezier(.2,.8,.2,1)` |
| Backdrop dim (90% → 20%) | opacity, background-image | 600ms | ease |
| Tab row collapse (discover) | height, padding | 320ms | `cubic-bezier(.2,.8,.2,1)` |
| Episode rail peek | margin-top | 320ms | `cubic-bezier(.2,.8,.2,1)` |
| Section dim (100% ↔ 80%) | opacity | 220ms | ease |
| About / Trailers pull-up | margin | 320ms | `cubic-bezier(.2,.8,.2,1)` |
| Rail meta area | opacity, then visibility | 250ms | `cubic-bezier(.4,0,.2,1)` |
| Loading shimmer | `translateX(-100% → 100%)` gradient | 1.6s loop | linear |
| Hero trailer autoplay | Fades in after **5s** dwell on the hero CTAs | 1200ms | ease ◻ |
| "Added to your list" toast | Slides in top-right, auto-hides after **3s** | — | ◻ |
| Reminder tooltip | Gentle bob; fades after 15s or on focus to tabs | 650ms fade | ◻ |

Rules:
- Animate only `transform` and `opacity` on rails (they are GPU-friendly on low-power TV chipsets). Width animation is
  limited to the small tab chips.
- ★ Respect `prefers-reduced-motion: reduce`: set transition durations to 0 and stop the shimmer and trailer autoplay.

---

## 6. Accessibility

### 6.1 Built in ✅
- **Remote-only operability:** every action is reachable with ←, →, ↑, ↓, OK and Back. There are no focus traps, and
  Back always moves one level up (§4.2).
- **Focus visibility:**
  - Tiles get a 3px solid white ring with 3px offset, a radius of tile + 3, and a shadow.
  - Pills and tabs invert to a white fill with `#102533` text.
  - The About card gets a 2px inset white stroke plus a glow.
  - Focus never relies on colour alone: fill, ring, size or position always change too.
- **Selected vs focused are different states:** the active series shows a 4px yellow underline, and focus shows a
  white fill. Both can be visible at once.
- **10-foot legibility:** minimum 20px text, a 24px body, and text shadow over imagery.
- **Colour contrast (WCAG 2.1, measured):**

  | Pair | Ratio |
  | --- | --- |
  | White on `#102533` | 15.7:1 |
  | `#DFE1E3` on page | 12.0:1 |
  | `#AAC0C8` rail meta | 8.3:1 |
  | Focused pill (`#102533` on white) | 15.7:1 |
  | Tag (`#102C3D` on `#33DDDF`) | 8.7:1 |
  | "New episode" tag | 11.1:1 |
  | Live tag | 11.7:1 |
  | White on tile placeholder | 7.6:1 |
  | Active filter pill `#8080FF` on page | **4.8:1** (passes AA but is the weakest pair; don't use it below 20px) |

- **Access-service tags:** AD (audio description), S (subtitles) and BSL appear in the hero, on every episode tile and in
  the rail meta. The hero chips carry an `aria-label` ("Audio described", "Subtitles", "British Sign Language").
  ★ Add the same labels to the episode and rail-meta chips.
- **Semantics:**
  - The programme title is an `h1` with `aria-label` set to the title, so it's still read when it's shown as a logo
    image.
  - Tabs and chips use `role="tab"` with `aria-selected`.
  - CTAs use `role="button"`.
  - The rail meta area is `aria-live="polite"`, so the focused title's details are announced.
  - Decorative SVGs are `aria-hidden`.
- **Content guidance:** five placement options (see §7.4). When guidance is on, the About panel always repeats the full
  warning.
- **Truncation is safe:** clamped text (hero 4 lines, episode 3, rail meta 2, About 4) ends with an ellipsis, and the
  full copy is available in About.

### 6.2 Prototype only ◻
- On first load, a help modal (`role="dialog"`, `aria-modal`) maps keyboard keys to the remote (D-pad, OK, Back). Any
  key dismisses it.
- The "Added to your list" toast confirms the My List action, both visually and through its live text.

### 6.3 Recommended before production ★
1. **Screen readers / TV voice guidance** (e.g. Samsung Voice Guide, LG Audio Guidance, Fire TV VoiceView). Virtual
   focus isn't announced by default. Either move real DOM focus to the element marked `.focused`
   (`tabIndex={-1}` + `.focus()` on change), or keep `aria-activedescendant` on a container. Announce section changes
   ("Episodes, Series 2, Episode 3 of 8").
2. Give tiles an accessible name: `"<title>, S1:E3, 45 minutes, audio described, subtitles"`.
3. Mark the series chips row as a `tablist` and the tab row as `tablist` + `tabpanel` regions.
4. Add `prefers-reduced-motion` handling (§5).
5. Pause the hero trailer autoplay whenever voice guidance is on. Keep it muted by default and give it a visible stop
   control.
6. Never put meaning in the active-pill colour `#8080FF` alone.

---

## 7. Scenarios ("page logic")

The prototype switches these at runtime from a dev modal (press **Q**) ◻. Treat them as data-driven states of the same
components. In this repo they map to props: `Programme.tags/strapline/strapline2`, the CTA list, and `Episode.tag/progress/live`.

### 7.1 Hero scenarios

| Scenario | Default for | Primary CTA | Secondaries (in order) | Starting series / episode | Hero tags | Progress |
| --- | --- | --- | --- | --- | --- | --- |
| `start` | Default | **Start watching - S1:E1** | Watch ad free · Trailer · Add to list | S1 E1 | — | — |
| `latestseries` | — | Start watching - S{max}:E1 | Watch ad free · Trailer · Add to list | Newest series, E1 | **LATEST SERIES** | — |
| `latest` | Reality (e.g. Love Island) | **Latest episode - S{max}:E{last}** | Watch ad free · Trailer · Add to list | Newest series, last episode | **NEW EPISODE** | — |
| `continue` | `continueWatching` titles | **Continue watching - S{s}:E{e}** | Restart · Watch ad free · Add to list | Resume point (prototype: S1 E7, 75%) | — | Bar under primary at the resume % (`--text-interactive`) |
| `live` | Live titles | **Live - S{max}:E{last}** | Start again · Add to list · Watch ad free | Newest, last | **LIVE** (mint) + "29 mins left" in mint | Mint bar under primary (62%) |
| `comingsoon` | Pre-TX | **Watch trailer** | Remind me (bell) | Newest series | — | — |

CTA rules:
- **Tower size:**
  - Default is primary + up to **3** secondaries (films: 2).
  - A 3-secondary tower relabels "Watch ad free" to **"Go Ad Free"**.
  - With a single secondary, the tower becomes the 2-button variant: the secondary is full width, 610×64.
- **Films:** there's no S:E suffix. The primary reads "Watch film" or "Continue watching". When the tower is trimmed,
  Trailer drops first so the list button survives.
- **Sport:** the S:E suffix is dropped. Live and Latest show the fixture name ("Live - England v Germany", trimmed to 18
  characters).
- **Verb sync:** as focus moves through episodes, the verb is kept and S:E is updated (§4.5). `comingsoon` never changes
  its label.
- **Add to list:** toggles to "Added to list" (tick icon) and shows the toast ◻.

### 7.2 Episode tile states

| State | Rule | Tile dressing |
| --- | --- | --- |
| Default | — | Short tag "S{s}:E{e}" (`#102C3D`) |
| Latest | Highest series and last episode | + **"New episode"** tag (`--brand-primary`) |
| Live | Latest, in the `live` scenario | **"Live"** tag (mint), mint progress bar, tags raised 18px above the bar |
| Continue point | The CW episode | **"Continue watching"** tag + white bar at the resume % |
| Watched | Any episode before the CW point (earlier series, or same series and earlier episode) | Full white bar (100%) |
| Show-dates mode ◻ | Latest series only | Tag reads "Today 8pm" / "Yesterday 8pm" / "Tue 18th 8pm" counting back from the last episode |
| Loading | No still yet | Placeholder colour + shimmer. Falls back to the hero backdrop |

Episode order is oldest first, **except** reality, sport and live titles, which run newest first ◻.

### 7.3 Editorial straplines
- **Strapline 1** (yellow glow, flame icon). Options:
  - "Top 5, trending in {genre}!" (default)
  - "Most popular in {genre}"
  - "New series starts May 9th set a reminder now"
  - "Bafta award winner"
  - hidden
- **Strapline 2** (mint glow) **only shows date-related messages**: months, ordinals, years, "coming soon",
  "weeknight", "tonight", "9pm", "available now", "leaving in". Any other source strapline is suppressed. Its icon is
  chosen from the text:

  | Text contains | Icon | Glow / text |
  | --- | --- | --- |
  | award / bafta / oscar | Trophy | Pink glow `rgba(255,87,132,.3)` |
  | "match" | Heart | Pink glow |
  | "every episode" / "available now" | Box | Pink glow |
  | A date | Calendar | Mint glow; text uses the brand gradient (`#33DDDF → #80FFB5 → #F4FCA5`) |
  | Anything else | "•" separator | — |

- The `comingsoon` scenario pins strapline 2 to "New series coming soon" with the calendar icon. Films hide strapline 2
  unless one is chosen explicitly.

### 7.4 Other switches

| Switch | Options |
| --- | --- |
| Tags pill | none (default) · EXCLUSIVE · LEAVING SOON · auto. Hidden whenever a status tag (LIVE / NEW EPISODE / LATEST SERIES) shows, and hidden on films |
| Guidance | `off` · `strap3` (3rd strapline chip, "G" badge, "Contains upsetting scenes" or "Check About for Guidance") · `topright` (full warning, top right) · `abovedesc` (full warning above the description) · `belowlogo` (full warning in its own row under the title). Full copy: *"Strong language, Domestic abuse, Sexual scenes, Nudity, Scenes of suicide from the start."* |
| Logos ◻ | itvX logo top-left (112, 56), hero focus only · partner logo top-right |
| Info tags | AD · S · BSL · age rating (films, warning outline) |
| Hero video ◻ | Trailer autoplay after a 5s dwell on the hero (muted, fade 1.2s). Stops when the hero collapses |
| Series tab loading ◻ | `select` (default: OK on a chip loads the episodes) · `focus` (moving across chips loads them immediately) |
| Episode slider end | breakaway-2 · breakaway-1 (default) · fixed |
| Upcoming tab ◻ | Adds a "Coming soon" tab with a gradient calendar icon and the next series number. Shows the Coming soon hero (countdown / daily / coming soon banner variants), a "Meet the cast" rail (234×350) and a "Coming soon on ITVX" rail (486×274) |
| Programme type | drama (default) · film (no series tabs, ↓ from tabs goes straight to the rail) · sport (fixture labels) |

---

## 8. User journeys

Key sequences start from page load (focus on the primary CTA) using the demo data: Broadchurch, 3 series × 8 episodes,
12 related titles. Each journey is a good candidate for an end-to-end test.

**J1. Play the suggested episode**
`OK` → `cta(0)` → play S1:E1.

**J2. Browse series 1 and start episode 3**
1. `↓ ↓` → tab row, EPISODES focused. The hero collapses and the backdrop dims to 20%.
2. `↓` → the sub nav opens with focus on the **SERIES 1** chip (expanded, yellow underline).
3. `↓` → the episode rail has focus on E1 (white ring, siblings at 80%).
4. `→ →` → focus on E3. The track slides 1008px, E1–E2 fade to 33%, and the hero label updates to "Start watching - S1:E3".
5. `OK` → `playEpisode(1, 2)`.

**J3. Switch to series 3**
1. From J2 step 2, `← ←` → chip focus moves "2" → "3" (each chip expands to "SERIES N" as it takes focus).
2. `OK` → series 3 is active. The episode rail reloads at E1, and E8 shows the "New episode" tag.
3. `↑` → focus returns to the EPISODES trigger. `↑` again closes the sub nav and returns to the hero.

**J4. Read About**
1. `↓ ↓ →` → ABOUT focused. The sub nav hides.
2. `↓` → the About card has focus (white stroke + glow) and the episode rail is hidden.
3. `↓` → related rail, discover mode: the hero and tabs collapse and the About card pulls up into the peek.
4. `↑` → About. `↑` → the tab row on ABOUT.

**J5. Watch a trailer**
1. `↓ ↓ → →` → TRAILERS.
2. `↓` → the trailer rail ("Series 3 trailer", "Series 2 trailer", "Series 1 trailer").
3. `→` → Series 2 trailer. `OK` → plays inline. `OK` again stops it. `↑` stops it and returns to the TRAILERS tab.

**J6. Find something similar**
1. `↓ ↓ → → →` → RELATED. `OK` → discover mode: the hero and tab row collapse to 0, and the episode rail shows as a
   half-height peek.
2. The heading goes to 100% and the rail meta appears under the tiles (genre, sub-genre, AD/BSL/S, 2-line description).
3. `→ ×4` → the track slides and the meta area updates (and is announced) for each title.
4. `OK` → `openProgramme` → that title's VOD page.
5. Alternative: `↓` (instead of `OK`) on RELATED reaches the same rail but keeps the collapsed-hero "related view".

**J7. Add to My List**
`↓ →` → focus on "Add to list". `OK` → the label changes to "Added to list" with a tick, and the toast "Programme has
been added to your list" shows for 3s ◻. `OK` again removes it.

**J8. Back out from deep in the page**
From the related rail: `Back` → episodes → `Back` → sub nav chips (or the EPISODES tab if the sub nav is closed) →
`Back` → EPISODES trigger → `Back` → the sub nav closes → `Back` → hero. Every Back moves exactly one level, and the page
never exits unexpectedly.

**J9. Film**
Programme type film: there's no EPISODES tab, and the tabs are ABOUT · TRAILERS (when trailers are supplied) · RELATED. From the tab row, `↓` on
ABOUT goes to About, and the related rail follows directly. The primary CTA reads "Watch film".

**J10. Live**
Scenario `live`:
- **Hero:** shows "LIVE" (mint), "29 mins left" in mint, and a mint progress bar under "Live - S3:E8".
- **Rail:** the episode rail opens on S3, and E8 shows "Live" with a mint bar.
- **CTAs:** the secondaries are Start again · Add to list · Watch ad free.

---

## 9. Data contract

Wire these shapes to the content API. ✅ (`src/types.ts`)

```ts
Programme { title; logo?; backdrop?; poster?; description; genre; subgenres[]; moods[]; cast[]; director?;
            year?; rating?; lengthMinutes; seriesCount; access?: ('AD'|'S'|'BSL')[]; tags?[]; strapline?; strapline2? }
Episode   { series; episode; title; description?; length?; airDate?; image?; progress?; tag?; live?; access? }
RelatedProgramme { id; title; genre; subgenre?; count?; description?; image?; badge? }
```

**Derived copy:**
- **Hero keywords:** `[TitleCase(genre), subgenres[0], moods[0], cast[0]]`, with empty entries dropped.
- **Meta line:** `"{seriesCount} Series • {lengthMinutes} mins"` (films: `"{h}h {m}m • {year}"`).
- **Related items:** same genre, sub-genre matches first, then the rest of the genre. Exclude the current title. Cap at
  24.
- **Descriptions are clamped:**

  | Field | Limit |
  | --- | --- |
  | Episode description | 130 characters |
  | Related description | 180 characters (cut on a word boundary + "…") |
  | Hero description | 4 lines (CSS) |

---

## 10. Recreating this with an LLM tool

Paste this document, then use a prompt like the one below. Build in the order shown and verify each step before moving
on.

> Build a 1920×1080 connected-TV programme page in React + TypeScript (Vite), following the attached spec exactly.
> 1. Create `tokens.css` from §2 and a `Stage` that scales the 1920×1080 `.app` to fit the window.
> 2. Implement `navigate(state, key, config)` and `deriveView(state, config)` from §4 as pure functions, with unit
>    tests for every row of the §4.2 table and the §8 journeys.
> 3. Build the presentational components in §3 with exact geometry. They take data + `focused`/`hasFocus` props and
>    hold no focus state of their own.
> 4. Put the `.app` classes from §4.3 on the root, and write the layout modes (`series-focus`, `discover-focus`) in CSS
>    only.
> 5. Add the transitions from §5, with the exact durations and easings.
> 6. Compose the page: a window `keydown` listener maps keys to `navigate()` and performs the returned effects.
> 7. Add the §7 scenarios as props/data, then the §6 accessibility items, including the ★ recommendations.
> Verify by screenshotting each journey in §8 at 1920×1080.

**Acceptance checklist:**
- [ ] Focused rail items always sit at x = 112, apart from the breakaway at the rail end.
- [ ] Back goes up exactly one level at every point (J8).
- [ ] The hero CTA label tracks the focused episode.
- [ ] Only one of Episodes / About / Trailers is visible at a time.
- [ ] Contrast pairs match §6.1, and no text is under 20px.
- [ ] All motion uses the §5 timings and is disabled under `prefers-reduced-motion`.

---

## 11. Device simulation (Amazon Fire TV Stick)

Press **Q** to open the config panel. Under **Device simulation**, pick a Fire TV Stick. The default is **No simulation**,
and the choice is saved in `localStorage` (`vod.simulation.device`). ✅ (`src/simulation/`, `src/config/ConfigPanel.tsx`)

### 11.1 What is simulated
A desktop browser can't run at a Fire TV's speed, so each limit is reproduced separately:

| Device limit | How it's simulated |
| --- | --- |
| **CPU speed** | A `requestAnimationFrame` loop holds the main thread until each frame has lasted `1000 / uiFps` ms. React renders, layout and key handling all queue behind it, as on a slow stick. The HUD shows the measured fps. |
| **Remote lag** | Every press is handled `inputLatencyMs` later. Presses queue and resolve against the latest state. |
| **Dropped presses** (oldest sticks) | Presses arriving while one is still pending are discarded. |
| **GPU** | CSS transitions and animations become `steps()` at the device frame rate, because a desktop GPU would otherwise keep them smooth. `mid` GPUs lose blur filters and text glows. `low` GPUs also lose all shadows and the loading shimmer, while focus strokes are kept. |
| **Not simulated** | RAM limits / memory pressure, video decode (4K/HDR/AV1), network speed, and WebView engine differences. Test these on hardware. |

### 11.2 Profiles
Hardware comes from Amazon developer specs and launch coverage. The **simulated values are estimates** derived from
that hardware. They are tuned so devices rank correctly against each other, so calibrate them on real devices.

| Device | Year | SoC | CPU | GPU | RAM | OS | Sim fps | Sim lag | Drops | GPU tier |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fire TV Stick (1st Gen) | 2014 | Broadcom BCM28155 | 2× A9 1.0 GHz | VideoCore IV | 1 GB | Fire OS 3→5 | 15 | 220 ms | ✓ | low |
| Fire TV Stick (2nd Gen) | 2016 | MediaTek MT8127D | 4× A7 1.3 GHz | Mali-450 MP4 | 1 GB | Fire OS 5 | 20 | 160 ms | ✓ | low |
| Fire TV Stick Basic Edition | 2017 | MediaTek MT8127D | 4× A7 1.3 GHz | Mali-450 MP4 | 1 GB | Fire OS 5 | 20 | 160 ms | ✓ | low |
| Fire TV Stick 4K | 2018 | MediaTek MT8695 | 4× A53 1.7 GHz | IMG GE8300 | 1.5 GB | Fire OS 6 | 30 | 90 ms | | mid |
| Fire TV Stick Lite | 2020 | MediaTek MT8695D | 4× A53 1.7 GHz | IMG GE8300 | 1 GB | Fire OS 7 | 30 | 100 ms | | mid |
| Fire TV Stick (3rd Gen) | 2020 | MediaTek MT8695D | 4× A53 1.7 GHz | IMG GE8300 | 1 GB | Fire OS 7 | 30 | 100 ms | | mid |
| Fire TV Stick 4K Max | 2021 | MediaTek MT8696 | 4× A55 1.8 GHz | IMG GE9215 750 MHz | 2 GB | Fire OS 7 | 45 | 60 ms | | high |
| Fire TV Stick 4K (2nd Gen) | 2023 | MediaTek MT8696D | 4× A55 1.7 GHz | IMG GE9215 650 MHz | 2 GB | Fire OS 8 | 45 | 60 ms | | high |
| Fire TV Stick 4K Max (2nd Gen) | 2023 | MediaTek MT8696T | 4× A55 2.0 GHz | IMG GE9215 850 MHz | 2 GB | Fire OS 8 | 55 | 45 ms | | high |
| Fire TV Stick HD | 2024 | MediaTek MT8695D | 4× A53 1.7 GHz | IMG GE8300 | 1 GB | Fire OS 7 | 30 | 100 ms | | mid |
| Fire TV Stick 4K Select | 2025 | MediaTek MT8698 | 4× A55 1.7 GHz | — | 1 GB | Vega OS | 30 | 110 ms | | mid |
| Fire TV Stick HD | 2026 | MediaTek MT8698D | 4× A55 1.7 GHz | Mali-G310 V2 500 MHz | 1 GB | Vega OS | 30 | 110 ms | | mid |

**Sources:**
- [Amazon: Fire TV streaming media player specs](https://developer.amazon.com/docs/device-specs/device-specifications-fire-tv-streaming-media-player.html)
- [Amazon: Fire TV comparison table](https://developer.amazon.com/docs/device-specs/device-specifications-comparison-table.html)
- [CNX Software: 4K Max (2021)](https://www.cnx-software.com/2021/10/12/55-amazon-fire-tv-stick-4k-max-supports-4k-av1-videos-wi-fi-6/)
- [CNX Software: 4K Max (2023)](https://www.cnx-software.com/2023/09/22/amazon-fire-tv-stick-4k-max-2023-features-a-2-ghz-mediatek-mt8696t-cpu-support-wifi-6e/)
- [CNX Software: 4K Select / Vega OS](https://www.cnx-software.com/2025/10/03/linux-based-vega-os-replaces-android-based-fire-os-in-amazon-fire-tv-stick-4k-select/)
- [CNX Software: 1st Gen (2014)](https://www.cnx-software.com/2014/10/28/amazon-introduces-39-fire-tv-stick-to-compete-with-chromecast-roku-streaming-stick/)
- [AFTVnews: Lite / 3rd Gen / 4K differences](https://www.aftvnews.com/all-the-differences-between-the-fire-tv-stick-lite-fire-tv-stick-3-and-fire-tv-stick-4k/)
- [AFTVnews: 4K Select](https://www.aftvnews.com/amazon-announces-fire-tv-stick-4k-select-the-first-non-android-based-fire-tv-running-vega-os/)

**Conflicting reports:**
- **1st Gen CPU clock:** 1.0 GHz in most sources, though AFTVnews suspected 1.2 GHz.
- **4K Max (2021) CPU cores:** reported as both A53 and A55.
- **4K (2nd Gen) GPU clock:** Amazon's English and Japanese pages may differ.
