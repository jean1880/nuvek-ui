<script setup lang="ts">
// One choice inside a MenuRadioGroup. Exposes role=menuitemradio and aria-checked.
import type { HTMLAttributes } from 'vue'
import { DropdownMenuItemIndicator, DropdownMenuRadioItem } from 'reka-ui'
import { cn } from '../lib/cn'
import { menuCheckableClass, menuItemClass } from '../lib/menu'

const props = defineProps<{
  value: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

defineEmits<{ select: [event: Event] }>()
</script>

<template>
  <DropdownMenuRadioItem
    :value="value"
    :disabled="disabled"
    :class="cn(menuItemClass, menuCheckableClass, props.class)"
    @select="$emit('select', $event)"
  >
    <DropdownMenuItemIndicator class="absolute start-2 inline-flex items-center" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5" /></svg>
    </DropdownMenuItemIndicator>
    <slot />
  </DropdownMenuRadioItem>
</template>
