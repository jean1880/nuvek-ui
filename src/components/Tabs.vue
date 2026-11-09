<script setup lang="ts">
// Controlled tab set (v-model). Reka UI owns roving focus, arrow-key navigation and ARIA.
import type { HTMLAttributes } from 'vue'
import { TabsRoot } from 'reka-ui'
import { cn } from '../lib/cn'

const props = defineProps<{
  modelValue: string
  class?: HTMLAttributes['class']
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    :class="cn('flex flex-col gap-4', props.class)"
    @update:model-value="$emit('update:modelValue', String($event))"
  >
    <slot />
  </TabsRoot>
</template>
