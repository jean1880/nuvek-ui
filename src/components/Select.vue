<script setup lang="ts">
// Themed single-choice select. Reka UI owns the behaviour (listbox roles, arrow/Home/End/typeahead
// keys, Esc, focus return, portal and collision handling); this maps props onto it and styles the
// trigger like TextField. `options` may carry a `group` to render labelled sections.
// The trigger takes the caller's attrs (e.g. `aria-label`); the popup is portalled above modals.
import { computed, toRef, type HTMLAttributes } from 'vue'
import {
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
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

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    options: SelectOption[]
    placeholder?: string
    label?: string
    help?: string
    error?: string
    required?: boolean
    disabled?: boolean
    size?: FieldSize
    name?: string
    id?: string
    class?: HTMLAttributes['class']
  }>(),
  { modelValue: undefined, size: 'md' },
)

defineEmits<{ 'update:modelValue': [value: string | number] }>()

const { controlId, helpId, errorId, describedBy } = useFieldWiring({
  id: toRef(props, 'id'),
  help: toRef(props, 'help'),
  error: toRef(props, 'error'),
})
const groups = computed(() => groupOptions(props.options))
// Reka treats '' as "no selection" and shows the placeholder.
const current = computed(() => props.modelValue ?? '')
</script>

<template>
  <div :class="cn('flex flex-col gap-1', props.class)">
    <label v-if="label" :for="controlId" class="text-sm font-semibold text-fg-muted">
      {{ label }}<span v-if="required" aria-hidden="true" class="ms-0.5 text-error">*</span>
    </label>
    <SelectRoot
      :model-value="current"
      :name="name"
      :required="required"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event as string | number)"
    >
      <SelectTrigger
        v-bind="$attrs"
        :id="controlId"
        :aria-label="($attrs['aria-label'] as string | undefined) ?? (label ? undefined : placeholder)"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :class="
          cn(
            fieldControlClass,
            'cursor-pointer justify-between text-start data-[placeholder]:text-fg-dim',
            fieldSizeClass[size],
            error ? fieldInvalidBorderClass : fieldBorderClass,
          )
        "
      >
        <SelectValue :placeholder="placeholder" class="min-w-0 truncate" />
        <SelectIcon aria-hidden="true" class="shrink-0 text-fg-dim">
          <svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="m5 8 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </SelectIcon>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent position="popper" :side-offset="6" :class="listboxContentClass">
          <SelectViewport class="max-h-[inherit] overflow-y-auto">
            <!-- Ungrouped options sit in a plain wrapper: an unlabelled group would be announced as one. -->
            <component :is="group.label ? SelectGroup : 'div'" v-for="(group, gi) in groups" :key="group.label ?? `__ungrouped-${gi}`">
              <SelectLabel v-if="group.label" :class="listboxLabelClass">{{ group.label }}</SelectLabel>
              <SelectItem
                v-for="option in group.items"
                :key="option.value"
                :value="option.value"
                :disabled="option.disabled"
                :class="cn(menuItemClass, 'justify-between')"
              >
                <SelectItemText>{{ option.label }}</SelectItemText>
                <SelectItemIndicator aria-hidden="true" class="text-primary">
                  <svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="m4 10 4 4 8-8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </SelectItemIndicator>
              </SelectItem>
            </component>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
    <p v-if="error" :id="errorId" class="text-sm text-error">{{ error }}</p>
    <p v-else-if="help" :id="helpId" class="text-sm text-fg-dim">{{ help }}</p>
  </div>
</template>
