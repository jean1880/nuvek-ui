# Changelog

## 1.3.0

Additive release.

### Added
- `Select`: themed single-choice select on Reka Select. `options` (`{ value, label, disabled?, group? }`,
  grouped with labelled sections), `placeholder`, `label`, `help`, `error` (sets `aria-invalid` and
  `aria-describedby`), `required`, `disabled`, `size` (`sm` / `md` / `lg`), `name`, `v-model`. The
  popup is portalled above modals and drawers, matches the trigger width and scrolls past a maximum
  height.
- `Combobox`: filterable select on Reka Combobox with the same field props. Single or `multiple`
  (removable chips in the field, named `Remove {label}`; Backspace on an empty input removes the
  last), type-to-filter, `allowCreate` (an `Add "text"` row that emits `create`), `loading` and
  `search` for async options, `toggleLabel` for the chevron button's name, `filter` to leave filtering to the caller, and an `empty` slot.
- `SelectOption` and `FieldSize` types.

## 1.2.0

Accessibility release. Additive except for the visual token changes below.

### Added
- `DropdownMenu`, `MenuItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuCheckboxItem`,
  `MenuSeparator` and `MenuLabel`: styled Reka dropdown menu with a visible highlight (tinted fill
  plus inset ring) and exposed checked state.
- `Card` `interactive`: draws the focus ring on the card when a child has keyboard focus.
- `Chip` `interactive`: at least 24 px tall.
- `Avatar` `decorative`: hides the avatar from assistive technology.
- `Modal` and `Drawer` `closable` and `closeLabel`: an optional visible close button.
- `useToasts` accepts a per-type duration map; `defaultToastDurations` is exported.

### Changed
- Tokens: `fg-dim` `#64748b` to `#909eb3`, `border-strong` `#334155` to `#728198`, `fg-muted`
  `#94a3b8` to `#b6c2d3` and `surface-active` `#334155` to `#283549`. Dim text is at least 4.5:1
  and strong borders at least 3:1 on `bg`, `bg-alt`, `bg-modal`, `surface`, `surface-hover` and
  `surface-active`; dim, muted and fg stay at least 1.2:1 apart. A test reads the tokens from
  `theme.css` and enforces this.
- `:root { color-scheme: dark }`: native controls render dark.
- The base `:focus-visible` rule keeps a transparent outline beside its ring so the ring shows in
  forced-colours modes.
- `Modal` and `Drawer`: the `title` prop renders as an `h2` that labels the dialog. A `header`
  slot renders exactly as before (the slot is the title element), so existing slot users are
  unaffected.
- `ProgressBar` names itself from `label` (default `Progress`) and exposes the percentage as its
  value text; the track has an outline.
- `Button` danger hover text is the dark background colour.
- `useToasts` defaults: errors stay until dismissed, other types last 8 s (was 4 s). A toast that
  never times out always shows its dismiss button. Persistent toasts use `Infinity`, which does
  not survive JSON serialisation (it becomes `null`); do not round-trip the toast list through
  JSON.

### Fixed
- `TextField` and `SearchField` keep a caller-supplied `aria-label` instead of replacing it with
  the placeholder.

### Visual changes for consumers
- Lighter dim text: `fg-dim` `#64748b` to `#909eb3`, for 4.5:1 on every surface.
- Lighter muted text: `fg-muted` `#94a3b8` to `#b6c2d3`, so the dim, muted and fg steps stay
  distinct after `fg-dim` moved up.
- Heavier strong borders: `border-strong` `#334155` to `#728198`, for 3:1 on every surface.
- Darker active surface: `surface-active` `#334155` to `#283549`. The old value could not hold
  4.5:1 for dim text or 3:1 for strong borders without making dim text lighter than muted text.
  Selected rows and pressed states are a little closer to `surface-hover`.
- Dark native controls via `color-scheme`.
- Longer-lived toasts and a thin outline on progress tracks.

## 1.1.0
Tabs, Tooltip, Drawer, TextField, SearchField, Skeleton, Avatar and ProgressBar.

## 1.0.0
Headless Reka UI and Tailwind v4 rebuild.
