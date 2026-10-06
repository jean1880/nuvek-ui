# @nuvek/ui

[![CI](https://github.com/jean1880/nuvek-ui/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/jean1880/nuvek-ui/actions/workflows/ci.yml)

Shared design system for nuvek homelab services: a **Tailwind v4 theme** (the design tokens) and
**headless Vue 3 components** built on [Reka UI](https://reka-ui.com) primitives and styled with
Tailwind utilities. One source of visual truth so every service (`debian-maintainer`,
`neo4j-graph-viz`, `warden-dashboard`, …) looks and behaves like one product.

Homelab-internal — not published to npm. Consumed as a git-tag dependency:

```json
"@nuvek/ui": "github:jean1880/nuvek-ui#v1.0.0"
```

## How it fits together

| Layer | Owner | What it does |
|-------|-------|--------------|
| Behaviour | Reka UI (peer dependency) | Focus trapping, portals, scroll lock, dismissal, ARIA, live regions, keyboard handling |
| Tokens | `@nuvek/ui/theme.css` | Tailwind `@theme` — colours, radius, shadows, type, motion — plus a small base layer |
| Styling | Your app's Tailwind build | Generates the utilities the components use; the package ships **no compiled CSS** |
| Variants | `class-variance-authority` + `cn()` | Typed variant props; a consumer's `class` always wins |

## Wiring a consumer

```bash
npm install tailwindcss @tailwindcss/vite reka-ui "@nuvek/ui@github:jean1880/nuvek-ui#v1.0.0"
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [vue(), tailwindcss()] })
```

```css
/* src/style.css */
@import "tailwindcss";
@import "@nuvek/ui/theme.css";
```

`theme.css` carries `@source "./"`, so your Tailwind build scans the package's own bundle and
generates every class its components use — no per-app `@source` for the library.

## Tokens → utilities

Tailwind's default colour palette is **reset**: only the names below exist, so `bg-sky-400`
generates nothing. Tints come from opacity modifiers, not separate tokens.

| Token family | Utilities | Examples |
|--------------|-----------|----------|
| Backgrounds | `bg`, `bg-alt`, `bg-modal`, `bg-code`, `overlay`, `glass` | `bg-bg-alt`, `bg-overlay` |
| Surfaces | `surface`, `surface-hover`, `surface-active` | `bg-surface hover:bg-surface-hover` |
| Foreground | `fg`, `fg-muted`, `fg-dim`, `on-primary` | `text-fg-muted` |
| Borders | `border`, `border-strong` | `border border-border` |
| Intent | `primary` (+`-hover`, `-alt`), `success`, `error`, `warning`, `idle` | `bg-primary/10 text-primary` |
| CI status | `status-success`, `status-error`, `status-warning` (more saturated than intent) | `bg-status-error/15` |
| Radius | `sm` .375 · `md` .5 · `lg` .75 · `xl` 1rem (one step rounder than Tailwind) | `rounded-lg` |
| Shadow | `sm`…`xl`, `card` (rim light), `glow` (tint with a shadow colour) | `shadow-glow shadow-primary/10` |
| Type | Tailwind's size scale + `text-2xs` (.6875rem) + fluid `text-fluid-{base,lg,xl,2xl}` | `text-2xs` |
| Motion | `transition` = 200 ms ease; `animate-fade-in`, `-slide-up`, `-pulse`, `-shimmer` | `animate-fade-in` |
| Stacking | `--z-dropdown` · `sticky` · `overlay` · `modal` · `popover` · `toast` | `z-(--z-modal)` |

Spacing is Tailwind's default 0.25 rem scale (`p-4` = 1 rem).

The base layer sets `body` colours/font, a primary `:focus-visible` ring, and a
`prefers-reduced-motion` override.

### Theming

Every token is a CSS custom property. A theme is a block of overrides — no component changes:

```css
:root[data-theme="light"] { --color-bg: #ffffff; --color-fg: #0f172a; /* … */ }
```

`useTheme().setTheme('light')` stamps `data-theme` on `<html>` and persists it. **Only `dark`
ships** (the system is dark-only by design).

## Components

Every component accepts `class`, merged **last** through `cn()` — `<Button class="px-8">`
replaces the button's `px-4` rather than fighting it.

| Component | Props | Slots | Events |
|-----------|-------|-------|--------|
| `Button` | `variant?: 'primary' \| 'ghost' \| 'danger'` · `type?` (default `button`) · `disabled?` · `as?` (default `button`) · `asChild?` | default | native (`@click`) fall through |
| `Chip` | `color?: 'success' \| 'error' \| 'warning' \| 'running' \| 'idle' \| 'neutral'` · `variant?: 'soft' \| 'filled' \| 'outlined'` · `size?: 'sm' \| 'md'` | default | — |
| `Card` | `variant?: 'elevated' \| 'outlined'` · `hoverable?` — surface only, no padding | default | — |
| `CardHeader` / `CardBody` / `CardFooter` | — (padded regions with dividers) | default · `actions` (header) | — |
| `Panel` | `title?` | default · `header` | — |
| `Modal` | `open?` · `title?` · `ariaLabel?` (name when there is no title) · `closeOnBackdrop?` · `closeOnEsc?` | default · `header` · `footer` | `close` |
| `ToastStack` | `toasts: Toast[]` · `dismissible?` (close button) | — | `dismiss` (id) |

- `Button` with `as="a"` (or `asChild` around a `RouterLink`) drops `type`/`disabled` and uses
  `aria-disabled` instead.
- `Modal` is a Reka `Dialog`: portalled, focus-trapped with restore, scroll-locked, labelled by
  its title. The component is controlled — flip `open` in response to `close`.
- `ToastStack` is a Reka `Toast` region: errors announce assertively, others politely; the
  timer pauses on hover/focus; swipe right to dismiss; F8 focuses the stack.

### Composables and utilities

- `useToasts(durationMs = 4000)` → `{ toasts, showToast(msg, type?), dismiss(id) }`, with
  `ToastType = 'success' (default) | 'error' | 'warning' | 'info'` — e.g.
  `showToast('Build failed', 'error')`. The stack
  owns each toast's lifetime, so **wire both directions**:
  `<ToastStack :toasts="toasts" @dismiss="dismiss" />`.
- `useTheme()` → `{ theme, setTheme(name), initTheme() }`.
- `cn(...classes)` — clsx + tailwind-merge, configured for this theme's custom keys. Use it in
  your own components to get the same override behaviour.

## Develop

```bash
npm install
npm run build        # dist/: ESM bundle + .d.ts + theme.css
npm run typecheck
npm run test         # needs a build first (compiles a consumer stylesheet against dist/)
npm run playground   # every component × variant, for visual review
```

Or all of it at once: `/home/jdesroches/scripts/ui-gate.sh ~/git/nuvek-ui`.
