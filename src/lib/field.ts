import { computed, useId, type Ref } from 'vue'

export type FieldSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  /** Options sharing a group label render under one labelled heading. */
  group?: string
}

// `md` matches TextField's box (px-3 py-2 text-sm); `sm` and `lg` scale around it.
export const fieldSizeClass: Record<FieldSize, string> = {
  sm: 'min-h-8 px-2.5 py-1 text-sm',
  md: 'min-h-10 px-3 py-2 text-sm',
  lg: 'min-h-12 px-4 py-3 text-base',
}

// Surface of a field-like control (select trigger, combobox field): TextField's border, fill and
// disabled treatment. The invalid state recolours the border.
export const fieldControlClass =
  'flex w-full items-center gap-2 rounded-md border bg-bg-alt text-fg transition disabled:cursor-not-allowed disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
export const fieldBorderClass = 'border-border-strong'
export const fieldInvalidBorderClass = 'border-error'

// Popover surface shared with the menu family: modal fill, strong border, capped height.
// `--reka-popper-anchor-width` is the trigger/field width, so the list matches it.
export const listboxContentClass =
  'z-(--z-popover) max-h-72 w-(--reka-popper-anchor-width) min-w-32 overflow-hidden rounded-md border border-border-strong bg-bg-modal p-1 text-fg shadow-xl'

export const listboxLabelClass = 'px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-fg-dim'

export interface OptionGroup {
  label?: string
  items: SelectOption[]
}

// Ungrouped options keep their place first; groups follow in order of first appearance.
export function groupOptions(options: readonly SelectOption[]): OptionGroup[] {
  const loose: SelectOption[] = []
  const groups = new Map<string, SelectOption[]>()
  for (const option of options) {
    if (option.group === undefined || option.group === '') {
      loose.push(option)
      continue
    }
    const bucket = groups.get(option.group)
    if (bucket) bucket.push(option)
    else groups.set(option.group, [option])
  }
  const result: OptionGroup[] = []
  if (loose.length) result.push({ items: loose })
  for (const [label, items] of groups) result.push({ label, items })
  return result
}

// Ids and aria wiring shared by every labelled field: the control is labelled by `label`,
// flagged `aria-invalid` on error, and described by the error (or else the help) text.
export function useFieldWiring(source: {
  id: Ref<string | undefined>
  help: Ref<string | undefined>
  error: Ref<string | undefined>
}) {
  const autoId = useId()
  const controlId = computed(() => source.id.value ?? autoId)
  const helpId = computed(() => `${controlId.value}-help`)
  const errorId = computed(() => `${controlId.value}-error`)
  const describedBy = computed(() =>
    source.error.value ? errorId.value : source.help.value ? helpId.value : undefined,
  )
  return { controlId, helpId, errorId, describedBy }
}
