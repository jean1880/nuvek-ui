<script setup lang="ts">
// TextField with a leading search icon and a clear button shown while non-empty.
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

const emit = defineEmits<{ 'update:modelValue': [value: string]; clear: [] }>()

const autoId = useId()

function clear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div :class="cn('flex flex-col gap-1', props.class)">
    <label v-if="label" :for="id ?? autoId" class="text-sm font-semibold text-fg-muted">{{ label }}</label>
    <div class="relative flex items-center">
      <svg
        class="pointer-events-none absolute start-3 size-4 text-fg-dim"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        v-bind="$attrs"
        :id="id ?? autoId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="label ?? placeholder"
        class="w-full rounded-md border border-border-strong bg-bg-alt py-2 ps-9 pe-9 text-sm text-fg transition placeholder:text-fg-dim disabled:cursor-not-allowed disabled:opacity-50"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="modelValue"
        type="button"
        :disabled="disabled"
        aria-label="Clear"
        class="absolute end-2 inline-flex size-6 items-center justify-center rounded-sm text-fg-dim transition hover:text-fg disabled:opacity-50"
        @click="clear"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  </div>
</template>
