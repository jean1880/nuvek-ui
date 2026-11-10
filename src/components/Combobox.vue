<script setup lang="ts">
// Themed combobox: a text field that filters a listbox. Reka UI owns the behaviour (combobox and
// listbox roles, arrow keys, Enter, Esc, focus handling, portal and collision handling); this maps
// props onto it and styles it like TextField.
//   - single: the field shows the chosen label; `multiple` shows removable chips in the field
//     and Backspace on an empty input removes the last one.
//   - filtering is local and case-insensitive on the label. For server-side results listen to
//     `search`, swap `options`, set `loading`, and pass `:filter="false"`.
//   - `allowCreate` adds an `Add "text"` row for text that matches no option; choosing it emits
//     `create` with the text and leaves the value alone (the caller adds the option and selects it).
import { computed, ref, toRef, watch, type HTMLAttributes } from 'vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'
import { cn } from '../lib/cn'
import { menuItemClass } from '../lib/menu'
import {
  fieldBorderClass,
  fieldControlClass,
  fieldInvalidBorderClass,
  fieldSizeClass,
  groupOptions,
  listboxContentClass,
  listboxLabelClass,
  useFieldWiring,
  type FieldSize,
  type SelectOption,
} from '../lib/field'

defineOptions({ inheritAttrs: false })

type Value = string | number

const props = withDefaults(
  defineProps<{
    modelValue?: Value | Value[]
    options: SelectOption[]
    multiple?: boolean
    placeholder?: string
    label?: string
    help?: string
    error?: string
    required?: boolean
    disabled?: boolean
    size?: FieldSize
    name?: string
    id?: string
    allowCreate?: boolean
    /** Shows a loading row and sets `aria-busy`; pair with `search` for async options. */
    loading?: boolean
    /** Filter `options` locally by label. Turn off when the options already are the results. */
    filter?: boolean
    emptyText?: string
    loadingText?: string
    /** Prefix of each chip remove button's name: `{removeLabel} {chip label}`. */
    removeLabel?: string
    /** Accessible name of the chevron button that toggles the list. */
    toggleLabel?: string
    /** Format of the create row: `{value}` is replaced with the typed text. */
    createLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    modelValue: undefined,
    size: 'md',
    filter: true,
    emptyText: 'No results',
    loadingText: 'Loading…',
    removeLabel: 'Remove',
    toggleLabel: 'Show options',
    createLabel: 'Add "{value}"',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Value | Value[]]
  search: [query: string]
  create: [value: string]
}>()

defineSlots<{ empty?: (props: { query: string }) => unknown }>()

// Value of the create row: one module-level object, so it cannot equal any option value (those
// are strings or numbers). The row's @select is prevented, so it never reaches the model.
const CREATE = Object.freeze({ create: true })

const { controlId, helpId, errorId, describedBy } = useFieldWiring({
  id: toRef(props, 'id'),
  help: toRef(props, 'help'),
  error: toRef(props, 'error'),
})

const open = ref(false)
const query = ref('') // what the user typed (not the label echoed into the field)
const inputText = ref('')

const selected = computed<Value[]>(() => {
  const v = props.modelValue
  if (v === undefined || v === '') return []
  return Array.isArray(v) ? v : [v]
})

// Labels of the current options and of the selected values, so a chip (or the field text) keeps
// its label after async options replace the list. Anything else is dropped.
let seen = new Map<Value, string>()
watch(
  [() => props.options, selected],
  ([options, chosen]) => {
    const next = new Map<Value, string>()
    for (const value of chosen) {
      const label = seen.get(value)
      if (label !== undefined) next.set(value, label)
    }
    for (const o of options) next.set(o.value, o.label)
    seen = next
  },
  { immediate: true, deep: true },
)
const labelOf = (value: Value) => seen.get(value) ?? String(value)

const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!props.filter || !q) return props.options
  return props.options.filter((o) => o.label.toLowerCase().includes(q))
})
const groups = computed(() => groupOptions(visible.value))

const createText = computed(() => {
  const text = query.value.trim()
  if (!props.allowCreate || !text) return ''
  const exists = props.options.some((o) => o.label.toLowerCase() === text.toLowerCase())
  return exists ? '' : text
})

const showEmpty = computed(() => !props.loading && visible.value.length === 0 && !createText.value)

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  emit('search', query.value)
}

function onOpen(value: boolean) {
  open.value = value
  if (!value) query.value = ''
}

function onUpdate(value: unknown) {
  emit('update:modelValue', value as Value | Value[])
  if (props.multiple) {
    inputText.value = ''
    query.value = ''
  }
}

function remove(value: Value) {
  if (props.disabled) return
  emit('update:modelValue', selected.value.filter((v) => v !== value))
}

function onBackspace(event: KeyboardEvent) {
  if (!props.multiple || props.disabled) return
  if ((event.target as HTMLInputElement).value !== '' || selected.value.length === 0) return
  remove(selected.value[selected.value.length - 1])
}

function create() {
  const text = createText.value
  if (!text) return
  emit('create', text)
  inputText.value = ''
  query.value = ''
  if (!props.multiple) open.value = false
}

function focusInput(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button')) return
  document.getElementById(controlId.value)?.focus()
}

const displayValue = (value: unknown) =>
  value === undefined || value === null || Array.isArray(value) ? '' : labelOf(value as Value)
</script>

<template>
  <div :class="cn('flex flex-col gap-1', props.class)">
    <label v-if="label" :for="controlId" class="text-sm font-semibold text-fg-muted">
      {{ label }}<span v-if="required" aria-hidden="true" class="ms-0.5 text-error">*</span>
    </label>
    <ComboboxRoot
      :model-value="modelValue ?? (multiple ? [] : undefined)"
      :multiple="multiple"
      :open="open"
      :name="name"
      :required="required"
      :disabled="disabled"
      ignore-filter
      open-on-click
      @update:model-value="onUpdate"
      @update:open="onOpen"
    >
      <ComboboxAnchor
        :class="
          cn(
            fieldControlClass,
            'flex-wrap cursor-text has-[input:focus-visible]:shadow-[0_0_0_2px_var(--color-bg),0_0_0_4px_var(--color-primary)]',
            fieldSizeClass[size],
            error ? fieldInvalidBorderClass : fieldBorderClass,
            disabled && 'cursor-not-allowed opacity-50',
          )
        "
        @click="focusInput"
      >
        <template v-if="multiple">
          <span
            v-for="value in selected"
            :key="value"
            class="inline-flex max-w-full items-center gap-1 rounded-md border border-primary/40 bg-primary/15 ps-2 text-sm text-fg"
          >
            <span class="truncate">{{ labelOf(value) }}</span>
            <button
              v-if="!disabled"
              type="button"
              :aria-label="`${removeLabel} ${labelOf(value)}`"
              class="inline-flex size-6 items-center justify-center rounded-md text-fg-muted transition hover:text-fg"
              @click.stop="remove(value)"
            >
              <svg viewBox="0 0 20 20" class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="m5 5 10 10M15 5 5 15" stroke-linecap="round" />
              </svg>
            </button>
          </span>
        </template>
        <ComboboxInput
          v-bind="$attrs"
          :id="controlId"
          v-model="inputText"
          :display-value="displayValue"
          :placeholder="multiple && selected.length ? undefined : placeholder"
          :disabled="disabled"
          :aria-label="($attrs['aria-label'] as string | undefined) ?? (label ? undefined : placeholder)"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="describedBy"
          :aria-required="required ? 'true' : undefined"
          :aria-busy="loading ? 'true' : undefined"
          class="min-w-24 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-dim focus-visible:shadow-none disabled:cursor-not-allowed"
          @input="onInput"
          @keydown.backspace="onBackspace"
        />
        <!-- Pointer affordance only: keyboard users open the list from the input (arrows). -->
        <ComboboxTrigger tabindex="-1" :aria-label="toggleLabel" :disabled="disabled" class="shrink-0 text-fg-dim">
          <svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="m5 8 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxPortal>
        <ComboboxContent position="popper" :side-offset="6" :class="listboxContentClass">
          <ComboboxViewport class="max-h-[inherit] overflow-y-auto">
            <!-- Ungrouped options sit in a plain wrapper: an unlabelled group would be announced as one. -->
            <component :is="group.label ? ComboboxGroup : 'div'" v-for="(group, gi) in groups" :key="group.label ?? `__ungrouped-${gi}`">
              <ComboboxLabel v-if="group.label" :class="listboxLabelClass">{{ group.label }}</ComboboxLabel>
              <ComboboxItem
                v-for="option in group.items"
                :key="option.value"
                :value="option.value"
                :text-value="option.label"
                :disabled="option.disabled"
                :class="cn(menuItemClass, 'justify-between')"
              >
                <span>{{ option.label }}</span>
                <ComboboxItemIndicator aria-hidden="true" class="text-primary">
                  <svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="m4 10 4 4 8-8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </ComboboxItemIndicator>
              </ComboboxItem>
            </component>
            <ComboboxItem v-if="createText" :value="CREATE" :text-value="createText" :class="menuItemClass" @select.prevent="create">
              {{ createLabel.replace('{value}', createText) }}
            </ComboboxItem>
            <div v-if="loading" role="status" class="px-3 py-2 text-sm text-fg-dim">{{ loadingText }}</div>
            <div v-else-if="showEmpty" class="px-3 py-2 text-sm text-fg-dim">
              <slot name="empty" :query="query">{{ emptyText }}</slot>
            </div>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
    <p v-if="error" :id="errorId" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="help" :id="helpId" class="text-sm text-fg-dim">{{ help }}</p>
  </div>
</template>
