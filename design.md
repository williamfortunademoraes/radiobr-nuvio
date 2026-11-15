# RADIO BR — Style Reference
> Nocturnal radio command center

**Theme:** dark

This document defines the visual language for RADIO BR: a dense, dark radio-discovery interface inspired by modern music command centers. It is a product-specific style reference, not a copy of any third-party brand or interface.

RADIO BR should feel like a late-night broadcast room: near-black surfaces, bright station artwork, compact information hierarchy, one clear active accent, and a persistent player dock that is always ready to take over the listening session. Artwork and station identity do the expressive work; chrome stays quiet and functional.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Radio Green | `#1ed760` | `--color-radio-green` | Play actions, active station state, live indicator, selected controls |
| Signal Red | `#b85850` | `--color-signal-red` | Low-frequency warning or unavailable-stream accent; never the default error color |
| Void Black | `#000000` | `--color-void-black` | Page canvas, top navigation, deepest surface |
| Carbon | `#121212` | `--color-carbon` | Sidebar, content wrapper, player dock surface |
| Graphite | `#1f1f1f` | `--color-graphite` | Station cards, inputs, expanded genre/region cards |
| Smoke | `#292929` | `--color-smoke` | Hover state, selected navigation item, active card wash |
| Iron | `#333333` | `--color-iron` | Quiet dividers, input borders, card outlines when needed |
| Steel | `#535353` | `--color-steel` | Secondary borders, inactive controls |
| Fog | `#73777c` | `--color-fog` | Muted icons, inactive navigation, disabled controls |
| Mist | `#b3b3b3` | `--color-mist` | Metadata, city/state labels, timestamps, secondary text |
| Bone | `#c5c5c5` | `--color-bone` | Placeholder text, captions, low-emphasis labels |
| Pure White | `#ffffff` | `--color-pure-white` | Primary text, high-emphasis controls, accessible contrast |
| Broadcast Gradient | `linear-gradient(90deg, #1ed760, #75f0a0)` | `--gradient-broadcast` | Optional live/featured banner accent; use sparingly |

### Color rules

- Use `#000000` for the canvas and `#121212` for the main shell.
- Use `#1ed760` for playback, active states and live status; do not scatter accent colors across unrelated UI.
- Use station artwork for personality, not decorative gradients.
- Never use a light page background or white content panels.
- Red indicates a stream problem only when the interface needs to explain a failure.

## Tokens — Typography

### Radio UI — Body, navigation, buttons, metadata, player controls

- **Substitute:** Inter, system-ui, -apple-system, sans-serif
- **Weights:** 400, 600, 700
- **Sizes:** 11, 12, 13, 14, 16px
- **Line height:** 1.2, 1.33, 1.5
- **Role:** compact, information-dense copy that lets station artwork dominate
- **Token:** `--font-radio-ui`

### Radio UI Title — Section headings and station names

- **Substitute:** Inter weight 700, system-ui bold
- **Weights:** 700
- **Sizes:** 20, 24px
- **Line height:** 1.2
- **Role:** assertive headings that stay compact above card rails
- **Token:** `--font-radio-title`

### Type Scale

| Role | Weight | Size | Line Height | Token |
|------|--------|------|-------------|-------|
| caption | 400–600 | 11px | 1.2 | `--text-caption` |
| metadata | 400 | 12px | 1.33 | `--text-metadata` |
| body | 400 | 14px | 1.5 | `--text-body` |
| link/button | 600–700 | 14px | 1.2 | `--text-control` |
| station title | 600 | 16px | 1.2 | `--text-station` |
| section heading | 700 | 24px | 1.2 | `--text-heading` |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** compact

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |

### Border Radius

| Element | Value |
|---------|-------|
| station cards | 6px |
| small controls | 2px |
| station artwork | 6px |
| search/filter inputs | 500px |
| live indicators | 500px |
| primary buttons | 9999px |
| player dock | 0px when docked to viewport edges |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| dock | `rgba(0, 0, 0, 0.5) 0px -8px 24px 0px` | `--shadow-dock` |
| subtle | `rgba(0, 0, 0, 0.35) 0px 4px 18px 0px` | `--shadow-subtle` |

Elevation should come primarily from surface color changes. Use shadows only for the fixed player dock and transient overlays.

## Components

### Play Button

**Role:** primary action on a station card.

Filled `#1ed760` pill with black text, 9999px radius, 8px vertical / 12px horizontal padding, 14px bold text. The label should be explicit: `Ouvir` or `Continuar ouvindo`.

Hover darkens the green slightly; focus uses a 2px white outline with 2px offset. Disabled state uses `#535353` with `#b3b3b3` text.

### Ghost Control

**Role:** secondary navigation and low-emphasis actions such as `Personalizar`, `Sobre` and `Fechar`.

No background and no border in the resting state. Use `#b3b3b3` text, 14px weight 600. Hover shifts text to white and adds a `#292929` surface only when the control has a clear hit area.

### Station Card

**Role:** the primary tile in featured, genre, region and search results.

Use a `#121212` or `#1f1f1f` surface, 6px radius and 12px padding. Station artwork is square, 1:1, 6px radius and `object-fit: cover`. Below or beside the artwork:

1. station name in white, 14–16px, weight 600;
2. city/state in `#b3b3b3`, 12px;
3. codec/bitrate or `Rádio ao vivo` in `#73777c`, 11px;
4. play button and favorite control.

Hover changes the surface to `#292929`; it does not add a heavy border or lift animation.

### Station Artwork Fallback

When a station has no logo, show a minimal radio glyph or the RADIO BR mark on a `#1f1f1f` square. Never collapse the artwork area or shift card geometry.

### Genre / Region Card

**Role:** compact discovery group that opens its related stations.

Use a 6px-radius `#1f1f1f` card with a title, station count and a circular `+` affordance. The card remains compact while collapsed. On click, it expands in place and reveals a dense station grid; `aria-expanded` and `aria-controls` are required.

Do not render every station rail open by default. The page should begin with a scannable catalog, not a wall of repeated cards.

### Search and Filter Bar

**Role:** top-level station discovery.

The search field is a 36–40px pill with `#1f1f1f` fill, no heavy border and `#b3b3b3` placeholder text. Genre and region filters use the same dark surface with compact labels. The green play/search action is the only filled control in the bar.

On mobile, stack the search field first, then filters, then the action button. Keep the entire control group within the viewport without horizontal scrolling.

### Sidebar / Library Panel

**Role:** persistent navigation when the desktop layout has enough width.

Use a fixed or sticky left column around 280–320px, `#121212` background and compact vertical navigation. Suggested groups:

- `Início`
- `Mais ouvidas`
- `Gêneros`
- `Regiões`
- `Favoritas`
- `Personalizar addon`

On smaller viewports, collapse the sidebar into the existing top navigation; do not force a desktop rail onto mobile.

### Top Navigation Bar

**Role:** global navigation, identity and quick actions.

Full-width `#000000` or `rgba(0,0,0,.92)` surface, 64–78px height, compact vertical padding. Left: RADIO BR mark. Center/left: search or navigation. Right: `Início`, `Personalizar`, `Sobre` and a primary pill action.

The top bar may remain sticky, but anchored sections must use `scroll-padding-top` so headings never disappear beneath it.

### Section Header

**Role:** title row above featured rails and discovery groups.

Use a 24px bold heading in white on the left and an optional `Ver tudo` / helper label in `#b3b3b3` on the right. Keep 20–24px between the header and its content.

### Fixed Player Dock

**Role:** persistent playback control.

The player is a full-width dock fixed to the viewport floor:

- `left: 0; right: 0; bottom: 0;`
- no rounded outer corners;
- `#121212` or near-black surface;
- subtle top divider or shadow;
- artwork, station identity, native controls, volume/mute, favorite and close actions;
- one and only one `HTMLAudioElement` on the portal page.

Selecting a station must pause and clear the previous source before assigning the new stream. Volume is controlled through the same audio element and persisted locally. The page content must reserve enough bottom space so the dock never hides the last cards.

### Live Indicator

Use a small green dot and uppercase `AO VIVO` label. The indicator is a playback status, not a decorative badge. When the stream fails, replace it with a concise error message and leave the player usable for another station.

## Do's and Don'ts

### Do

- Use `#000000` for the canvas and `#121212` for core surfaces.
- Use `#1ed760` only for play, active and live states.
- Use 6px radius for content cards and artwork.
- Use pill shapes for buttons, filters and status controls.
- Keep station cards compact and image-led.
- Keep genre and region groups collapsed until the user asks to see their radios.
- Keep the player dock full-width and attached to the viewport bottom.
- Pause the old stream before starting a new stream.
- Use accessible labels, keyboard focus and `aria-expanded` for expandable groups.

### Don't

- Do not use a floating player with large margins when the player is the primary listening surface.
- Do not allow multiple audio elements or overlapping playback sessions.
- Do not open every genre and region rail by default.
- Do not use heavy gradients, glass effects or decorative glows on every card.
- Do not mix many accent colors; station artwork supplies variety.
- Do not hide controls under the sticky header or player dock.
- Do not use light backgrounds inside the core portal.
- Do not rely on color alone to communicate live, favorite or error states.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Canvas | `#000000` | Page background and top navigation |
| 2 | Shell | `#121212` | Sidebar, player dock and major content wrappers |
| 3 | Card | `#1f1f1f` | Station cards, search inputs, genre/region cards |
| 4 | Card Hover | `#292929` | Hovered and selected content |
| 5 | Divider | `#333333` | Quiet separation between surfaces |

## Elevation

- **Player dock:** `rgba(0, 0, 0, 0.5) 0px -8px 24px 0px`
- **Transient menu:** `rgba(0, 0, 0, 0.5) 0px 8px 24px 0px`
- **Cards:** surface shift only; avoid shadows in the default state

## Imagery

Station logos are the primary visual content. Prefer tight square crops with consistent geometry. Do not invent lifestyle photography for the core portal. A station without artwork gets the same reserved square area with a neutral RADIO BR fallback.

The portal hero may use a restrained broadcast texture or gradient, but the catalog itself should remain an image-first grid of station identities. Artwork errors must not break layout or playback.

## Layout

Desktop uses a compact two-part shell when a sidebar is present: a 280–320px library/navigation column and a fluid main feed. The main feed uses dense grids and compact horizontal rails:

- featured stations: 4–6 columns depending on viewport;
- genre and region cards: 3–4 compact columns, expanding to a full-width station grid;
- station artwork: square 1:1;
- section gap: 32–48px;
- player dock: full-width, fixed at the viewport floor;
- bottom content padding: at least the dock height plus 24px.

On mobile, remove the sidebar, stack filters, use one-column station cards and keep the dock controls readable without horizontal scrolling.

## Geometry Rhythm

RADIO BR uses a deliberate alternation of shapes:

1. square station artwork for featured and search results;
2. compact rectangular genre/region cards for discovery;
3. expanded square station grids for the selected group;
4. a full-width horizontal player dock for playback.

This rhythm keeps long pages scannable and distinguishes “choose a category” from “choose a station” without extra explanation.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-radio-green: #1ed760;
  --color-signal-red: #b85850;
  --color-void-black: #000000;
  --color-carbon: #121212;
  --color-graphite: #1f1f1f;
  --color-smoke: #292929;
  --color-iron: #333333;
  --color-steel: #535353;
  --color-fog: #73777c;
  --color-mist: #b3b3b3;
  --color-bone: #c5c5c5;
  --color-pure-white: #ffffff;

  /* Typography */
  --font-radio-ui: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-radio-title: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  --text-caption: 11px;
  --text-metadata: 12px;
  --text-body: 14px;
  --text-control: 14px;
  --text-station: 16px;
  --text-heading: 24px;

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-48: 48px;

  /* Radius */
  --radius-card: 6px;
  --radius-small: 2px;
  --radius-input: 500px;
  --radius-pill: 9999px;

  /* Surfaces */
  --surface-canvas: #000000;
  --surface-shell: #121212;
  --surface-card: #1f1f1f;
  --surface-card-hover: #292929;

  /* Shadows */
  --shadow-dock: rgba(0, 0, 0, 0.5) 0px -8px 24px 0px;
}
```

### Full-width Player Dock

```css
.radio-player-dock {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) minmax(240px, 420px) auto;
  gap: 12px;
  align-items: center;
  min-height: 78px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-iron);
  background: var(--surface-shell);
  box-shadow: var(--shadow-dock);
}
```

## Product Voice

Copy should be short, direct and Brazilian Portuguese. Prefer:

- `Ouvir`
- `AO VIVO`
- `Rádios mais ouvidas`
- `Rádios por gênero`
- `Rádios por região`
- `Escolha uma rádio para começar`
- `Esta rádio não respondeu. Escolha outra estação.`

Avoid marketing-heavy language inside the player. The interface should sound like a confident broadcast console: clear, immediate and calm.

## Quality Checklist

- [ ] Canvas is near-black and cards use restrained surface shifts.
- [ ] Play/active/live states use one green accent.
- [ ] Station artwork remains square and stable when missing.
- [ ] Genre and region groups start compact and expand on demand.
- [ ] Only one audio element exists on the portal page.
- [ ] Switching stations pauses and clears the previous source.
- [ ] Volume and mute control the same audio element.
- [ ] Player dock touches the viewport bottom and spans its width.
- [ ] Bottom content is not hidden behind the dock.
- [ ] Mobile layout has no horizontal overflow.
- [ ] Keyboard focus and accessible labels are visible and meaningful.
