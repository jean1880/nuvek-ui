<script setup lang="ts">
// An on/off row; v-model is the checked state. Exposes role=menuitemcheckbox and aria-checked.
import type { HTMLAttributes } from 'vue'
import { DropdownMenuCheckboxItem, DropdownMenuItemIndicator } from 'reka-ui'
import { cn } from '../lib/cn'
import { menuCheckableClass, menuItemClass } from '../lib/menu'

const props = defineProps<{
  modelValue?: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

defineEmits<{ 'update:modelValue': [value: boolean]; select: [event: Event] }>()
</script>

<template>
  <DropdownMenuCheckboxItem
    :model-value="modelValue"
    :disabled="disabled"
    :class="cn(menuItemClass, menuCheckableClass, props.class)"
    @update:model-value="$emit('update:modelValue', $event === true)"
    @select="$emit('select', $event)"
  >
    <DropdownMenuItemIndicator class="absolute start-2 inline-flex items-center" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    </DropdownMenuItemIndicator>
    <slot />
  </DropdownMenuCheckboxItem>
</template>
