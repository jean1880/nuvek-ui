<script setup lang="ts">
// TextField with a leading search icon and a clear button shown while non-empty.
import type { HTMLAttributes } from 'vue'
import TextField from './TextField.vue'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    type?: string
    label?: string
    disabled?: boolean
    id?: string
    /** Accessible name of the clear button. */
    clearLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  { type: 'text', clearLabel: 'Clear' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string]; clear: [] }>()

function clear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <TextField
    v-bind="$attrs"
    :model-value="modelValue"
    :placeholder="placeholder"
    :type="type"
    :label="label"
    :disabled="disabled"
    :id="id"
    :class="$props.class"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #leading>
      <svg
        class="pointer-events-none size-4"
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
    </template>
    <template v-if="modelValue" #trailing>
      <button
        type="button"
        :disabled="disabled"
        :aria-label="clearLabel"
        class="inline-flex size-6 items-center justify-center rounded-sm text-fg-dim transition hover:text-fg disabled:opacity-50"
        @click="clear"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </template>
  </TextField>
</template>
