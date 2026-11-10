# Changelog

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
- `fg-dim` is lighter (`#909eb3`), `border-strong` is lighter (`#728198`) and `surface-active` is
  slightly darker (`#283549`), so dim text is at least 4.5:1 and strong borders at least 3:1 on
  every surface. A test reads the tokens from `theme.css` and enforces this.
- `:root { color-scheme: dark }`: native controls render dark.
- The base `:focus-visible` rule keeps a transparent outline beside its ring so the ring shows in
  forced-colours modes.
- `Modal` and `Drawer` titles render as an `h2` inside the header.
- `ProgressBar` names itself from `label` (default `Progress`) and exposes the percentage as its
  value text; the track has an outline.
- `Button` danger hover text is the dark background colour.
- `useToasts` defaults: errors stay until dismissed, other types last 8 s (was 4 s). A toast that
  never times out always shows its dismiss button.

### Fixed
- `TextField` and `SearchField` keep a caller-supplied `aria-label` instead of replacing it with
  the placeholder.

### Visual changes for consumers
- Lighter dim text.
- Heavier strong borders.
- Dark native controls via `color-scheme`.
- Longer-lived toasts and a thin outline on progress tracks.

## 1.1.0
Tabs, Tooltip, Drawer, TextField, SearchField, Skeleton, Avatar and ProgressBar.

## 1.0.0
Headless Reka UI and Tailwind v4 rebuild.
