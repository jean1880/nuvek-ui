// Shared look of every selectable menu row. The keyboard/pointer highlight is a tinted fill
// PLUS an inset ring, so it stays visible against the menu surface (a fill alone is not).
export const menuItemClass =
  'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-3 py-2 text-sm text-fg outline-none transition-colors data-[highlighted]:bg-primary/15 data-[highlighted]:ring-1 data-[highlighted]:ring-inset data-[highlighted]:ring-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40'

// Rows that carry a check indicator reserve room for it at the start.
export const menuCheckableClass = 'ps-8'
