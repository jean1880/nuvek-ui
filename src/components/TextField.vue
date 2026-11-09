<script setup lang="ts">
// Labelled single-line input with v-model. Native <input> keeps every attribute
// (name, autocomplete, required, ...) falling through to the control.
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
    <input
      v-bind="$attrs"
      :id="id ?? autoId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="label ? undefined : placeholder"
      class="w-full rounded-md border border-border-strong bg-bg-alt px-3 py-2 text-sm text-fg transition placeholder:text-fg-dim disabled:cursor-not-allowed disabled:opacity-50"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
