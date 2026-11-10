# @nuvek/ui

[![CI](https://github.com/jean1880/nuvek-ui/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/jean1880/nuvek-ui/actions/workflows/ci.yml)

Shared design system for nuvek services: a **Tailwind v4 theme** (the design tokens) and
**headless Vue 3 components** built on [Reka UI](https://reka-ui.com) primitives and styled with
Tailwind utilities. One source of visual truth so every service
looks and behaves like one product.

Not published to npm. Consumed as a git-tag dependency:

```json
"@nuvek/ui": "github:jean1880/nuvek-ui#v1.2.0"
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
npm install tailwindcss @tailwindcss/vite reka-ui "@nuvek/ui@github:jean1880/nuvek-ui#v1.2.0"
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

The base layer sets `body` colours/font, `color-scheme: dark` (native checkboxes, selects and
spinners draw dark), a primary `:focus-visible` ring (with a transparent outline so it survives
forced-colours modes), and a `prefers-reduced-motion` override.

Contrast is enforced by a test that reads the tokens from `theme.css`: `fg-dim` is at least 4.5:1
and `border-strong` at least 3:1 on `bg`, `bg-alt`, `bg-modal`, `surface`, `surface-hover` and `surface-active`; dim, muted and fg
stay at least 1.2:1 apart.
Use `border-strong` for the edge of a control (input, select, toggle) and `border` for decorative
dividers only.

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
| `Chip` | `color?: 'success' \| 'error' \| 'warning' \| 'running' \| 'idle' \| 'neutral'` · `variant?: 'soft' \| 'filled' \| 'outlined'` · `size?: 'sm' \| 'md'` · `interactive?` (click/toggle target, at least 24 px tall) | default | — |
| `Card` | `variant?: 'elevated' \| 'outlined'` · `hoverable?` · `interactive?` (rings the card when a child has keyboard focus) — surface only, no padding | default | — |
| `CardHeader` / `CardBody` / `CardFooter` | — (padded regions with dividers) | default · `actions` (header) | — |
| `Panel` | `title?` | default · `header` | — |
| `Modal` | `open?` · `title?` · `ariaLabel?` (name when there is no title) · `closeOnBackdrop?` · `closeOnEsc?` · `closable?` (visible close button) · `closeLabel?` (default `Close`) | default · `header` · `footer` | `close` |
| `ToastStack` | `toasts: Toast[]` · `dismissible?` (close button) | — | `dismiss` (id) |
| `Tabs` | `v-model: string` (active tab value) | default (`TabsList` + `TabsContent`) | `update:modelValue` |
| `TabsList` | — | default (`TabsTrigger`s) | — |
| `TabsTrigger` | `value: string` · `disabled?` | default | — |
| `TabsContent` | `value: string` | default | — |
| `Tooltip` | `content: string` · `side?: 'top' \| 'right' \| 'bottom' \| 'left'` (default `top`) · `delay?: number` (ms) | default (the trigger element) | — |
| `TooltipProvider` | Reka's provider, re-exported (`delayDuration?`, `skipDelayDuration?`) | default | — |
| `Drawer` | `open: boolean` · `side?: 'right' \| 'left'` (default `right`) · `title?` · `ariaLabel?` (name when there is no title) · `closable?` · `closeLabel?` | default · `header` · `footer` | `close` |
| `DropdownMenu` | `open?` · `side?` · `align?` · `class?` (popup surface) | `trigger` (the opening element) · default (menu rows) | `update:open` |
| `MenuItem` | `disabled?` | default | `select` |
| `MenuRadioGroup` / `MenuRadioItem` | group `v-model: string`; item `value: string` · `disabled?` | default | `update:modelValue` · `select` |
| `MenuCheckboxItem` | `v-model: boolean` · `disabled?` | default | `update:modelValue` · `select` |
| `MenuSeparator` / `MenuLabel` | — | default (label) | — |
| `TextField` | `v-model: string` · `placeholder?` · `type?` (default `text`) · `label?` · `disabled?` · `id?` | `leading` · `trailing` (overlaid inside the input; padding added when filled) | `update:modelValue`; other attrs fall through to the `<input>` |
| `SearchField` | same as `TextField` plus `clearLabel?` (default `Clear`, the clear button's accessible name) | — | `update:modelValue` · `clear` |
| `Select` | `v-model: string \| number` · `options: { value, label, disabled?, group? }[]` · `placeholder?` · `label?` · `help?` · `error?` · `required?` · `disabled?` · `size?: 'sm' \| 'md' \| 'lg'` (default `md`, TextField's size) · `name?` · `id?` | — | `update:modelValue`; other attrs (e.g. `aria-label`) fall through to the trigger |
| `Combobox` | `Select`'s props plus `multiple?` (`v-model` is then an array) · `allowCreate?` · `loading?` · `filter?` (default `true`; local filtering by label) · `emptyText?` · `loadingText?` · `removeLabel?` (default `Remove`) · `createLabel?` (default `Add "{value}"`) | `empty` (no matches) | `update:modelValue` · `search` (typed text) · `create` (text) |
| `Skeleton` | — (size it with `class`) | — | — |
| `Avatar` | `name: string` · `src?` · `size?: 'sm' \| 'md' \| 'lg'` (default `md`) · `decorative?` (hide it when the name is shown beside it) | — | — |
| `ProgressBar` | `value: number` · `max: number` · `intent?: 'primary' \| 'success' \| 'warning' \| 'error'` (default `primary`) · `label?` (accessible name, default `Progress`; pass what is measured) | — | — |

- `Button` with `as="a"` (or `asChild` around a `RouterLink`) drops `type`/`disabled` and uses
  `aria-disabled` instead.
- `Modal` is a Reka `Dialog`: portalled, focus-trapped with restore, scroll-locked, labelled by
  its title. The component is controlled — flip `open` in response to `close`.
- `ToastStack` is a Reka `Toast` region: errors announce assertively, others politely; the
  timer pauses on hover/focus; swipe right to dismiss; F8 focuses the stack.

- `Tooltip` needs a `TooltipProvider` ancestor: **wrap your app root in one once**
  (`<TooltipProvider><App /></TooltipProvider>`); it shares open delays between tooltips.
  Tooltips open on hover and keyboard focus and close on Esc.
- `Drawer` is a Reka `Dialog` styled as a side sheet, controlled like `Modal`: portalled,
  focus-trapped, scroll-locked; Esc and overlay click emit `close`.
- `TextField` / `SearchField` label the input with `label`, or with `placeholder` as `aria-label`
  when there is none; an `aria-label` you pass wins over both. `SearchField` shows a clear button while non-empty: it sets the value to `''`
  and emits `clear`.
- `DropdownMenu` is a Reka dropdown menu (roving focus, typeahead, Esc, focus return). The
  `trigger` slot is the element that opens it. The highlighted row is a tinted fill plus an inset
  ring. Radio and checkbox rows expose `aria-checked`:

  ```vue
  <DropdownMenu>
    <template #trigger><button type="button">Options</button></template>
    <MenuRadioGroup v-model="sort">
      <MenuRadioItem value="name">Name</MenuRadioItem>
      <MenuRadioItem value="date">Date</MenuRadioItem>
    </MenuRadioGroup>
    <MenuSeparator />
    <MenuCheckboxItem v-model="showHidden">Show hidden</MenuCheckboxItem>
    <MenuItem @select="rename">Rename</MenuItem>
  </DropdownMenu>
  ```
- `Select` and `Combobox` label the control with `label`, or with `placeholder` as `aria-label`
  when there is none; a caller `aria-label` wins. `error` replaces `help` and is what
  `aria-describedby` points at. Grouped options (`group`) render under labelled headings, ungrouped
  ones first. The popup uses the menu surface, is portalled at `--z-popover` so it opens inside
  `Modal` and `Drawer`, and is as wide as the control.
- `Combobox` filters locally on the label. For async results, handle `search`, set `loading`, swap
  `options` and pass `:filter="false"`. `allowCreate` shows `Add "text"` for text that matches no
  option: choosing it emits `create` and leaves the value alone, so add the option and select it:

  ```vue
  <Combobox v-model="tags" multiple allow-create :options="tagOptions" label="Tags" @create="addTag" />
  ```
- A `Card` clips its children, so a full-bleed button inside it loses its focus ring. Set
  `interactive` on such a card and the ring is drawn on the card itself.
- `Skeleton` is `aria-hidden` and uses `animate-shimmer` (motion-safe only).
- `Avatar` shows the image (`alt` = `name`), or the initials of the first two words of `name`
  when `src` is missing or fails to load.
- `ProgressBar` clamps `value` to `0..max` and is announced as a `progressbar`
  (`aria-valuenow` / `aria-valuemax`); `label` becomes its accessible name.

### Composables and utilities

- `useToasts(durations?)` → `{ toasts, showToast(msg, type?), dismiss(id) }`, with
  `ToastType = 'success' (default) | 'error' | 'warning' | 'info'` — e.g.
  `showToast('Build failed', 'error')`. `durations` is one number for every type, or a per-type
  map such as `{ error: 20000 }`. By default errors stay until dismissed (`Infinity`) and every
  other type lasts 8 s (`Infinity` does not survive JSON serialisation, so do not round-trip toasts
  through JSON); a toast that never times out always shows its dismiss button. The stack
  owns each toast's lifetime, so **wire both directions**:
  `<ToastStack :toasts="toasts" @dismiss="dismiss" />`.
- `useTheme()` → `{ theme, setTheme(name), initTheme() }`.
- `cn(...classes)` — clsx + tailwind-merge, configured for this theme's custom keys. Use it in
  your own components to get the same override behaviour.

## Visual changes for consumers

Bumping to v1.2.0 changes how existing UI looks, with no code change on your side:

- **Lighter dim text.** `fg-dim` `#64748b` to `#909eb3`, so captions and placeholders read at
  4.5:1 or better. `fg-muted` `#94a3b8` to `#b6c2d3` keeps dim, muted and fg distinct.
- **Heavier strong borders.** `border-strong` `#334155` to `#728198`, so input and control edges
  are visible (3:1 or better).
- **Darker active surface.** `surface-active` `#334155` to `#283549`, so dim text and strong
  borders still pass on it.
- **Dark native controls.** `color-scheme: dark` makes checkboxes, selects, number spinners and
  scrollbars draw dark instead of light.
- **Dialog titles.** A `Modal` or `Drawer` `title` prop renders as an `h2`. A `header` slot
  renders as before.
- **Progress track.** `ProgressBar` has a thin outline, and its default name is `Progress`.
- **Toasts last longer.** Errors persist until dismissed; other toasts last 8 s (was 4 s).
- **Danger button hover.** Text is dark on the filled hover state.

Pass `label` to every `ProgressBar` so it has a meaningful name. New opt-ins: `Card interactive`,
`Chip interactive`, `Avatar decorative`, `Modal`/`Drawer` `closable`.

## Develop

```bash
npm install
npm run build        # dist/: ESM bundle + .d.ts + theme.css
npm run typecheck
npm run test         # needs a build first (compiles a consumer stylesheet against dist/)
npm run playground   # every component × variant, for visual review
```

Or all of it at once: `npm run build && npm run typecheck && npm test`.
