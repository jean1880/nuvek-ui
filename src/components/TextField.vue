<script setup lang="ts">
// Labelled single-line input with v-model. Native <input> keeps every attribute
// (name, autocomplete, required, ...) falling through to the control. The `leading` and
// `trailing` slots overlay decoration (icon, action) inside the input's edges.
// Focus ring comes from the theme's base-layer :focus-visible rule; nothing here suppresses it.
import { useId, type HTMLAttributes } from 'vue'
import { cn } from '../lib/cn'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    type?: string
    label?: string
    disabled?: boolean
    id?: string
    class?: HTMLAttributes['class']
  }>(),
  { type: 'text' },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const autoId = useId()
</script>

<template>
  <div :class="cn('flex flex-col gap-1', props.class)">
    <label v-if="label" :for="id ?? autoId" class="text-sm font-semibold text-fg-muted">{{ label }}</label>
    <div class="relative flex items-center">
      <span v-if="$slots.leading" class="absolute start-3 flex items-center text-fg-dim">
        <slot name="leading" />
      </span>
      <input
        v-bind="$attrs"
        :id="id ?? autoId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="(($attrs['aria-label'] as string | undefined) ?? (label ? undefined : placeholder))"
        :class="
          cn(
            'w-full rounded-md border border-border-strong bg-bg-alt px-3 py-2 text-sm text-fg transition placeholder:text-fg-dim disabled:cursor-not-allowed disabled:opacity-50',
            $slots.leading && 'ps-9',
            $slots.trailing && 'pe-9',
          )
        "
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span v-if="$slots.trailing" class="absolute end-2 flex items-center">
        <slot name="trailing" />
      </span>
    </div>
  </div>
</template>
