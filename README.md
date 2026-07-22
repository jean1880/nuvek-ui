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
| Components | `import { … } from '@nuvek/ui'` | Vue 3 SFCs — Panel, Button, Badge, Toast, Card, Modal (+ `useTheme`). *In progress.* |

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
