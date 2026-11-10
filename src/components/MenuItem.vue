<script setup lang="ts">
// A plain action row. `select` fires on click or Enter/Space, then the menu closes.
import type { HTMLAttributes } from 'vue'
import { DropdownMenuItem } from 'reka-ui'
import { cn } from '../lib/cn'
import { menuItemClass } from '../lib/menu'

const props = defineProps<{
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

defineEmits<{ select: [event: Event] }>()
</script>

<template>
  <DropdownMenuItem
    :disabled="disabled"
    :class="cn(menuItemClass, props.class)"
    @select="$emit('select', $event)"
  >
    <slot />
  </DropdownMenuItem>
</template>
