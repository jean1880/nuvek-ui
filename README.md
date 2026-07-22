# @nuvek/ui

Shared design system for nuvek homelab services — CSS custom-property **tokens**, element-level
**base** styles, and Vue 3 **components**. The single source of visual truth so every service
(`debian-maintainer`, `neo4j-graph-viz`, and future tools) looks and behaves like one product.

Homelab-internal — not published to a public npm registry. Consumed via a `file:`/git-tag
dependency.

## What's in it

| Layer | File / export | Contents |
|-------|---------------|----------|
| Tokens | `@nuvek/ui/tokens.css` | The `:root` custom properties — colour scales, semantic colours, radius/space/shadow/transition scales, layout + component tokens, typography. Palette: slate-950/900 base + sky `--primary` (#38bdf8). |
| Base | `@nuvek/ui/base.css` | `body`, `.sr-only`, `:focus-visible`, reduced-motion, shared `@keyframes` (fadeIn/slideUp/pulse/shimmer), `.clickable`. |
| Aggregate | `@nuvek/ui/style.css` | `tokens.css` + `base.css` in one import (CSS-only consumers). |
| Components | `import { … } from '@nuvek/ui'` | Vue 3 SFCs — Button, Badge, Card, Panel, Modal, ToastStack (+ composables). See **Component API**. |

## Usage

CSS-only (tokens + base):

```css
@import '@nuvek/ui/style.css';
```

Components (pulls its own styles):

```ts
import '@nuvek/ui/style.css'
import { Button } from '@nuvek/ui'
```

## Component API

All components use scoped, `nv-`-prefixed styles and read from the design tokens, so they
reskin automatically when tokens change.

| Component | Props | Slots | Events |
|-----------|-------|-------|--------|
| `Button` | `variant?: 'primary' \| 'ghost' \| 'danger'` (default `primary`) · `type?: 'button' \| 'submit' \| 'reset'` (default `button`) · `disabled?: boolean` | default (label) | native (e.g. `@click`) fall through |
| `Badge` | `variant?: 'success' \| 'error' \| 'running' \| 'idle' \| 'warning' \| 'neutral'` (default `neutral`) | default | — |
| `Card` | `hoverable?: boolean` (default `false`) | default | — |
| `Panel` | `title?: string` | default · `header` | — |
| `Modal` | `open?: boolean` (default `false`) · `title?: string` · `ariaLabel?: string` (accessible name when no title/header) · `closeOnBackdrop?: boolean` (default `true`) · `closeOnEsc?: boolean` (default `true`) | default (body) · `header` · `footer` | `close` |
| `ToastStack` | `toasts: Toast[]` (pair with `useToasts`) | — | — |

`Modal` is accessible: `Teleport`ed to `<body>`, `role="dialog"` + `aria-modal`, `aria-labelledby`
wired to the header, **focus-trapped** (focus moves in on open, cycles on Tab, restores on close),
Esc-to-close, and body-scroll lock.

### Composables

- `useToasts(timeoutMs = 4000)` → `{ toasts, showToast(msg, type?), dismiss(id) }`.
  `ToastType = 'success' | 'error' | 'warning' | 'info'`.
- `useTheme()` → `{ theme, setTheme(t), toggleTheme(), initTheme() }`. `Theme = 'dark' | 'light'`.
  **Note:** the token set is dark-first; `light` stamps `data-theme="light"` but a light palette
  is not yet shipped, so switching is a no-op until the light tokens land (tracked for v0.2.0).
- `useFocusTrap()` → `{ activate(el), deactivate() }`. Standalone focus trap for custom overlays.

### Design tokens

Every themeable value is a CSS custom property in `tokens.css` — colour scales
(`--bg/--surface/--text/--border`), semantics (`--primary/--success/--error/--warning/--idle`
with `-rgb/-border/-soft` variants), scales (`--radius-*`, `--space-*`, `--shadow-*`, `--text-*`),
a z-index scale (`--z-dropdown … --z-toast`), and component tokens (`--btn-radius`, `--card-radius`,
`--card-shadow`). Override any of them in your app's `:root` to reskin.

## Develop

```bash
npm install
npm run build        # emits dist/ (ESM + UMD + nuvek-ui.css + types)
npm run typecheck
```

## Provenance

Tokens and base styles were extracted verbatim from `debian-maintainer`'s
`frontend/src/style.css` (the reference implementation). App-specific component classes
(`.app-shell`, `.dropdown-*`, `.task-card`, …) intentionally stay in their app; only genuinely
reusable layers live here. See `~/scripts/plans/ACTIVE_2026-07-16_shared-ui-rust-standardization.md`.
